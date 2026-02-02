import express from 'express';
const router = express.Router();

export default function (prisma) {

    // ==========================================
    // 1. Save Score (บันทึกทุกรอบลง DB)
    // ==========================================
    router.post('/save', async (req, res) => {
        const { userId, score, gameType, difficulty } = req.body;

        if (!userId || isNaN(parseInt(userId))) {
            return res.status(400).json({ error: "Invalid User ID" });
        }

        try {
            await prisma.gameScore.create({
                data: {
                    uid: parseInt(userId),
                    score: parseInt(score),
                    game_type: gameType,
                    difficulty: difficulty || null
                }
            });
            console.log(`✅ Saved: User ${userId} | Score ${score} | Mode ${gameType}`);
            res.json({ success: true });
        } catch (err) {
            console.error("Database Error:", err);
            res.status(500).json({ error: "Save failed" });
        }
    });

    // ==========================================
    // 2. Leaderboard
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
    // 3. User Stats (แก้ไข: รองรับชื่อ game_type หลากหลาย + Debug Log)
    // ==========================================
    router.get('/stats', async (req, res) => {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "User ID Required" });
        }

        try {
            const uid = parseInt(userId);

            // ดึงข้อมูลมานับจำนวน (ใช้ groupBy)
            const statsGroup = await prisma.gameScore.groupBy({
                by: ['game_type'],
                where: { uid: uid },
                _count: { game_type: true }
            });

            // ค่าเริ่มต้น
            const result = { quiz: 0, virus: 0, chat: 0 };

            // วนลูปใส่ค่า
            statsGroup.forEach(item => {
                const type = item.game_type;
                const count = item._count.game_type;

                // รวม normal/hard เป็น quiz
                if (type === 'quiz' || type === 'normal' || type === 'hard') {
                    result.quiz += count;
                } else if (type === 'virus') {
                    result.virus += count;
                } else if (type === 'chat') {
                    result.chat += count;
                }
            });

            res.json(result);

        } catch (err) {
            console.error("Stats Error:", err);
            res.status(500).json({ error: "Fetch stats failed" });
        }
    });

    return router;
}