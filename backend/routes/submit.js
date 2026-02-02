import express from 'express';
const router = express.Router();

export default function (prisma) {
    
    // POST: /submit-score
    router.post('/', async (req, res) => {
        const { userId, score, gameType, difficulty, logs, timeTaken } = req.body;

        // 1. Validation เบื้องต้น
        if (!userId || isNaN(parseInt(userId))) {
            return res.status(400).json({ error: "Invalid User ID" });
        }

        const uid = parseInt(userId);
        const finalScore = parseInt(score);

        // แปลง Difficulty เป็นตัวพิมพ์เล็กเสมอ เพื่อกันพลาด
        const diffValue = difficulty ? difficulty.toLowerCase() : null;

        console.log(`📥 Receiving Score: User ${uid} | ${gameType} (${diffValue}) | +${finalScore} pts`);

        try {
            // ==================================================
            // A. บันทึกประวัติการเล่นละเอียด (History) - เก็บทุกรอบไว้ดู Graph Admin
            // ==================================================
            if (gameType === 'quiz' && logs && logs.length > 0) {
                 const newGame = await prisma.game.create({
                    data: {
                        uid: uid,
                        total_score: finalScore,
                        time_taken: timeTaken || 0,
                        finished_at: new Date(),
                        answerLogs: {
                            create: logs
                                .filter(l => l.cid !== -1) // กรองข้อหมดเวลา
                                .map(log => ({
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
            // B. บันทึกคะแนนลง Leaderboard (GameScore) - ⚠️ แก้ไขตรงนี้!
            // ==================================================
            
            // 1. ค้นหาคะแนนเก่าก่อน
            const existingScore = await prisma.gameScore.findFirst({
                where: {
                    uid: uid,
                    game_type: gameType,
                    difficulty: diffValue // แยกคะแนนตามความยาก (easy, medium, hard)
                }
            });

            if (existingScore) {
                // ✅ กรณีมีของเดิมอยู่แล้ว -> ทำการอัปเดต (Update)
                
                if (gameType === 'quiz') {
                    // 🟢 Quiz: บวกคะแนนเพิ่ม (Accumulate) -> 2000 + 150 = 2150
                    const newTotal = existingScore.score + finalScore;
                    
                    await prisma.gameScore.update({
                        where: { gs_id: existingScore.gs_id },
                        data: {
                            score: newTotal, 
                            played_at: new Date()
                        }
                    });
                    console.log(`🔄 [Quiz] Updated Score: ${existingScore.score} + ${finalScore} = ${newTotal}`);
                } 
                else {
                    // 🔴 Virus / อื่นๆ: (ถ้าอยากเก็บ High Score ใช้ Logic นี้)
                    // ถ้าคะแนนใหม่ มากกว่า ของเดิม ค่อยอัปเดต
                    if (finalScore > existingScore.score) {
                        await prisma.gameScore.update({
                            where: { gs_id: existingScore.gs_id },
                            data: {
                                score: finalScore,
                                played_at: new Date()
                            }
                        });
                        console.log(`🏆 [Virus] New High Score: ${finalScore}`);
                    } else {
                        console.log(`zzz [Virus] Score not higher. Kept old: ${existingScore.score}`);
                    }
                }

            } else {
                // ✅ กรณีเล่นครั้งแรก -> สร้างใหม่ (Create)
                await prisma.gameScore.create({
                    data: {
                        uid: uid,
                        score: finalScore,
                        game_type: gameType,
                        difficulty: diffValue
                    }
                });
                console.log(`✨ [New Record] Created first score: ${finalScore}`);
            }

            res.json({ success: true, message: "บันทึกผลสำเร็จ" });

        } catch (err) {
            console.error("❌ Submit Score Error:", err);
            res.status(500).json({ error: "บันทึกข้อมูลล้มเหลว", details: err.message });
        }
    });

    return router;
}