import express from 'express';
const router = express.Router();

export default function (prisma) {

    // ==========================================
    // 1. Submit Score (บันทึกผล + Logs ละเอียด)
    // ✅ แก้จาก /save เป็น /submit-score และเพิ่ม Logic เก็บ Logs
    // ==========================================
    // POST: /submit-score
    router.post('/submit-score', async (req, res) => {
        const { userId, score, gameType, difficulty, logs, timeTaken } = req.body;

        if (!userId || isNaN(parseInt(userId))) {
            return res.status(400).json({ error: "Invalid User ID" });
        }

        const uid = parseInt(userId);
        const newScore = parseInt(score);

        console.log(`📥 Processing Score: User ${uid} | ${gameType} | +${newScore}`);

        try {
            // ✅ Ban Check Removed (System Disabled)
            // const user = await prisma.user.findUnique({ where: { uid: uid } });
            // if (user && user.is_banned) ...

            // ==================================================
            // 1. เก็บประวัติการเล่น (History) - เก็บทุกรอบที่เล่น เพื่อดู Graph ใน Admin
            // ==================================================
            if (gameType === 'quiz') {
                const answerLogs = (logs || []).filter(l => l.cid !== -1);

                await prisma.game.create({
                    data: {
                        uid: uid,
                        total_score: newScore,
                        time_taken: timeTaken || 0,
                        finished_at: new Date(),
                        answerLogs: {
                            create: answerLogs.map(log => ({
                                uid: uid,
                                qid: log.qid,
                                cid: log.cid,
                                is_correct: log.is_correct
                            }))
                        }
                    }
                });
            }

            // ==================================================
            // 2. อัปเดตคะแนนรวม (Leaderboard) - ส่วนนี้แหละที่ต้องแก้!
            // ==================================================

            // 2.1 หาคะแนนเก่าของ User นี้ ในโหมดนี้ และระดับความยากนี้
            const existingScore = await prisma.gameScore.findFirst({
                where: {
                    uid: uid,
                    game_type: gameType,
                    difficulty: difficulty || null
                }
            });

            if (existingScore) {
                // ✅ กรณีมีคะแนนเก่าอยู่แล้ว
                if (gameType === 'quiz') {
                    // 👉 ถ้าเป็น Quiz ให้ "บวกทบ" (Accumulate)
                    await prisma.gameScore.update({
                        where: { gs_id: existingScore.gs_id },
                        data: {
                            score: existingScore.score + newScore, // คะแนนเก่า + คะแนนใหม่
                            played_at: new Date(), // อัปเดตเวลาล่าสุด
                        }
                    });
                    console.log(`✅ [Quiz] Score Updated: ${existingScore.score} + ${newScore} = ${existingScore.score + newScore} | Play Count: ${existingScore.play_count + 1}`);
                } else {
                    // 👉 ถ้าเป็น Virus/อื่นๆ ให้ "เช็ค High Score" (เอาค่ามากสุด)
                    if (newScore > existingScore.score) {
                        await prisma.gameScore.update({
                            where: { gs_id: existingScore.gs_id },
                            data: {
                                score: newScore,
                                played_at: new Date(),
                                play_count: { increment: 1 } // ✅ บวกจำนวนรอบ
                            }
                        });
                        console.log(`✅ [Virus] New High Score: ${newScore} | Play Count: ${existingScore.play_count + 1}`);
                    } else {
                        // 👉 คะแนนไม่ถึง High Score แต่อัปเดตจำนวนรอบ และเวลาเล่นล่าสุด
                        await prisma.gameScore.update({
                            where: { gs_id: existingScore.gs_id },
                            data: {
                                played_at: new Date(),
                                play_count: { increment: 1 } // ✅ อัปเดต play_count แม้คะแนนจะไม่เพิ่ม
                            }
                        });
                        console.log(`ℹ️ [Virus] Score ${newScore} is not higher than ${existingScore.score}. Updated Play Count: ${existingScore.play_count + 1}`);
                    }
                }
            } else {
                // ✅ กรณีเล่นครั้งแรก (ยังไม่มีคะแนน) -> สร้างใหม่เลย
                await prisma.gameScore.create({
                    data: {
                        uid: uid,
                        score: newScore,
                        game_type: gameType,
                        difficulty: difficulty || null
                    }
                });
                console.log(`✅ [New Entry] Created new score record.`);
            }

            res.json({ success: true });

        } catch (err) {
            console.error("❌ Submit Error:", err);
            res.status(500).json({ error: "Failed to process score", details: err.message });
        }
    });

    // ==========================================
    // 2. Leaderboard (เหมือนเดิม)
    // ==========================================
    router.get('/leaderboard', async (req, res) => {
        const { type } = req.query; // 'quiz_hard' หรือ 'virus'

        try {
            let whereCondition = {};

            if (type === 'quiz_hard') {
                whereCondition = { game_type: 'quiz', difficulty: 'hard' };
            } else if (type === 'virus') {
                whereCondition = { game_type: 'virus' };
            } else {
                return res.json([]);
            }

            // ดึงข้อมูลดิบมาคำนวณ
            const allScores = await prisma.gameScore.findMany({
                where: whereCondition,
                include: { user: true },
            });

            // คำนวณจัดอันดับ
            const leaderboardMap = new Map();

            for (const record of allScores) {
                const uid = record.uid;
                const currentScore = record.score;

                if (!leaderboardMap.has(uid)) {
                    leaderboardMap.set(uid, {
                        username: record.user.username,
                        score: 0,
                        avatar: '😎'
                    });
                }

                const entry = leaderboardMap.get(uid);

                if (type === 'quiz_hard') {
                    entry.score += currentScore; // Quiz Hard = คะแนนสะสม
                } else {
                    if (currentScore > entry.score) entry.score = currentScore; // Virus = High Score
                }
            }

            // เรียงจากมากไปน้อย -> ตัดมา 20 คนแรก
            const result = Array.from(leaderboardMap.values())
                .sort((a, b) => b.score - a.score)
                .slice(0, 20);

            res.json(result);

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "โหลด Leaderboard ไม่สำเร็จ" });
        }
    });

    // ==========================================
    // 3. User Stats (เหมือนเดิม)
    // ==========================================
    // ==========================================
    // 3. User Stats
    // ==========================================
    router.get('/stats', async (req, res) => {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "User ID Required" });
        }

        try {
            const uid = parseInt(userId);

            // 1. Quiz Count (✅ นับจากประวัติการเล่นจริง Game)
            const quizCount = await prisma.game.count({
                where: { uid: uid }
            });

            // 2. Virus Count (✅ นับจาก play_count ใน GameScore)
            const virusRecord = await prisma.gameScore.findFirst({
                where: { uid: uid, game_type: 'virus' }
            });
            const virusCount = virusRecord ? virusRecord.play_count : 0; // ✅ ใช้ค่าจริงจาก DB

            // 3. Chat Count (ถ้ามี)
            const chatRecord = await prisma.gameScore.findFirst({
                where: { uid: uid, game_type: 'chat' }
            });
            const chatCount = chatRecord ? 1 : 0;

            res.json({
                quiz: quizCount,
                virus: virusCount,
                chat: chatCount
            });

        } catch (err) {
            console.error("Stats Error:", err);
            res.status(500).json({ error: "Fetch stats failed" });
        }
    });

    return router;
}