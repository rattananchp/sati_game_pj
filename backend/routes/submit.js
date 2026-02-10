import express from 'express';
const router = express.Router();

export default function (prisma) {

    // POST: /submit-score
    router.post('/', async (req, res) => {
        const { userId, score, gameType, difficulty, logs, timeTaken } = req.body;

        if (!userId || isNaN(parseInt(userId))) {
            return res.status(400).json({ error: "Invalid User ID" });
        }

        const uid = parseInt(userId);
        const finalScore = parseInt(score);
        const duration = parseInt(timeTaken) || 0; // ✅ รับค่าเวลาที่เล่นมา

        // แปลง Difficulty เป็นตัวพิมพ์เล็กเสมอ
        const diffValue = difficulty ? difficulty.toLowerCase() : null;

        console.log(`📥 Receiving: User ${uid} | ${gameType} | ${finalScore} pts | ${duration}s`);

        // 🛡️ Anti-Cheat: ป้องกันการกดจบเกมไวเกินไป (Auto-Clicker)
        // ถ้าเล่นจบเร็วกว่า 5 วินาที -> ไม่บันทึก
        if (duration < 5) {
            console.warn(`⚠️ [Anti-Cheat] Suspicious activity detected! User ${uid} finished in ${duration}s. Score ignored.`);
            return res.json({ success: true, message: "Score ignored due to suspicious activity." });
        }

        try {
            // A. บันทึก History (เหมือนเดิม)
            console.log(`🔍 Checking Game Type: ${gameType}`);
            if (gameType === 'quiz') {
                const answerLogs = (logs || []).filter(l => l.cid !== -1);
                console.log(`📝 Prepared Answer Logs: ${answerLogs.length} items`);

                try {
                    await prisma.game.create({
                        data: {
                            uid: uid,
                            total_score: finalScore,
                            time_taken: duration,
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
                    console.log(`✅ [History] Game record created successfully for User ${uid}`);
                } catch (historyErr) {
                    console.error(`❌ [History] Failed to create game record:`, historyErr);
                }
            }

            // B. บันทึก Leaderboard (แก้ไขใหม่ให้เก็บเวลาด้วย)
            const existingScore = await prisma.gameScore.findFirst({
                where: {
                    uid: uid,
                    game_type: gameType,
                    difficulty: diffValue
                }
            });

            if (existingScore) {
                if (gameType === 'quiz') {
                    // Quiz บวกทบ
                    await prisma.gameScore.update({
                        where: { gs_id: existingScore.gs_id },
                        data: {
                            score: existingScore.score + finalScore,
                            played_at: new Date()
                        }
                    });
                }
                else {
                    // Virus: เก็บ High Score (และเวลาของรอบนั้น)
                    if (finalScore > existingScore.score) {
                        await prisma.gameScore.update({
                            where: { gs_id: existingScore.gs_id },
                            data: {
                                score: finalScore,
                                time_taken: duration, // ✅ อัปเดตเวลาด้วย
                                played_at: new Date()
                            }
                        });
                        console.log(`🏆 New Highscore: ${finalScore} (Time: ${duration}s)`);
                    } else if (finalScore === existingScore.score) {
                        // ถ้าคะแนนเท่ากัน แต่ทำเวลาได้ดีกว่า (น้อยกว่า) ให้เอาอันใหม่
                        if (duration < existingScore.time_taken) {
                            await prisma.gameScore.update({
                                where: { gs_id: existingScore.gs_id },
                                data: {
                                    time_taken: duration, // ✅ อัปเดตเวลาที่ดีกว่า
                                    played_at: new Date()
                                }
                            });
                            console.log(`⚡ Faster Time: ${duration}s (Score tied)`);
                        }
                    }
                }

            } else {
                // สร้างใหม่
                await prisma.gameScore.create({
                    data: {
                        uid: uid,
                        score: finalScore,
                        time_taken: duration, // ✅ บันทึกเวลาเริ่มต้น
                        game_type: gameType,
                        difficulty: diffValue
                    }
                });
            }

            res.json({ success: true });

        } catch (err) {
            console.error("❌ Submit Error:", err);
            res.status(500).json({ error: "Failed", details: err.message });
        }
    });

    return router;
}