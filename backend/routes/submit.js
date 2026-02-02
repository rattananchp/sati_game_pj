import express from 'express';
const router = express.Router();

export default function (prisma) {
    
    // POST: /submit-score
    router.post('/', async (req, res) => {
        const { userId, score, gameType, difficulty, logs, timeTaken } = req.body;
        // logs = [{qid: 1, cid: 2, is_correct: true}, ...]

        // 1. Validation เบื้องต้น
        if (!userId || isNaN(parseInt(userId))) {
            return res.status(400).json({ error: "Invalid User ID" });
        }

        const uid = parseInt(userId);
        const finalScore = parseInt(score);

        console.log(`📥 Receiving Score: User ${uid} | ${gameType} | ${finalScore} pts`);

        try {
            // ==================================================
            // A. บันทึกประวัติการเล่นละเอียด (ลงตาราง Game & AnswerLogs)
            // ==================================================
            // (ทำเฉพาะ Quiz ที่มี Logs ส่งมา / Virus อาจจะไม่ต้องบันทึกละเอียดขนาดนี้)
            if (gameType === 'quiz' && logs && logs.length > 0) {
                 const newGame = await prisma.game.create({
                    data: {
                        uid: uid,
                        total_score: finalScore,
                        time_taken: timeTaken || 0, // เวลาที่ใช้ (วินาที)
                        finished_at: new Date(),
                        // ใส่ Logs ทีเดียว (Prisma จะจัดการ loop insert ให้เอง)
                        answerLogs: {
                            create: logs.map(log => ({
                                uid: uid,
                                qid: log.qid,
                                cid: log.cid,
                                is_correct: log.is_correct
                            }))
                        }
                    }
                });
                console.log(`✅ [History] Game ID ${newGame.gid} saved.`);
            }

            // ==================================================
            // B. บันทึกคะแนนลง Leaderboard (ลงตาราง GameScore)
            // ==================================================
            await prisma.gameScore.create({
                data: {
                    uid: uid,
                    score: finalScore,
                    game_type: gameType,       // 'quiz' หรือ 'virus'
                    difficulty: difficulty || null // 'hard' (ถ้ามี)
                }
            });
            console.log(`✅ [Leaderboard] Score recorded.`);

            res.json({ success: true, message: "บันทึกผลสำเร็จทั้งระบบ" });

        } catch (err) {
            console.error("❌ Submit Score Error:", err);
            res.status(500).json({ error: "บันทึกข้อมูลล้มเหลว" });
        }
    });

    return router;
}