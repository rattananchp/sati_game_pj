import express from 'express';
import { requireAuth } from '../middleware/auth.js';
const router = express.Router();

export default function (prisma) {

    // POST: /submit-score (since mounted on /submit-score in server.js, the path is '/')
    router.post('/', requireAuth, async (req, res) => {
        // Use authenticated uid safely
        const uid = req.user.uid;
        const role = req.user.role;
        const { score, gameType, difficulty, logs, timeTaken } = req.body;

        if (role === 'admin' || role === 'editor') {
            console.log(`🛡️ ${role} ${uid} is playing. Scores/Logs are NOT counted.`);
            return res.json({ success: true, message: `${role.charAt(0).toUpperCase() + role.slice(1)} score/play ignored` });
        }

        const finalScore = parseInt(score);
        const duration = parseInt(timeTaken) || 0; // ✅ รับค่าเวลาที่เล่นมา

        // แปลง Difficulty เป็นตัวพิมพ์เล็กเสมอ
        const diffValue = difficulty ? difficulty.toLowerCase() : null;

        console.log(`📥 Receiving: User ${uid} | ${gameType} | ${finalScore} pts | ${duration}s`);

        // 🛡️ Anti-Cheat: ป้องกันการกดจบเกมไวเกินไป (Auto-Clicker)
        // ถ้าเล่นจบเร็วกว่า 5 วินาที -> ไม่บันทึกคะแนน แต่ยังนับรอบ
        if (duration < 5) {
            console.warn(`⚠️ [Anti-Cheat] Suspicious activity detected! User ${uid} finished in ${duration}s. Score ignored but play counted.`);

            // ✅ ยังคงนับรอบการเล่น แม้คะแนนจะไม่ถูกบันทึก
            try {
                const existing = await prisma.gameScore.findFirst({
                    where: { uid, game_type: gameType, difficulty: diffValue }
                });
                if (existing) {
                    await prisma.gameScore.update({
                        where: { gs_id: existing.gs_id },
                        data: { play_count: { increment: 1 }, played_at: new Date() }
                    });
                } else {
                    await prisma.gameScore.create({
                        data: { uid, score: 0, game_type: gameType, difficulty: diffValue, play_count: 1 }
                    });
                }
            } catch (countErr) {
                console.error(`❌ [Anti-Cheat] Failed to count play:`, countErr);
            }

            return res.json({ success: true, message: "Play counted but score ignored." });
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
                    // Virus: เก็บ High Score (และเวลาของรอบนั้น) + นับรอบ
                    if (finalScore > existingScore.score) {
                        await prisma.gameScore.update({
                            where: { gs_id: existingScore.gs_id },
                            data: {
                                score: finalScore,
                                time_taken: duration, // ✅ อัปเดตเวลาด้วย
                                played_at: new Date(),
                                play_count: { increment: 1 } // ✅ บวกรอบ
                            }
                        });
                        console.log(`🏆 New Highscore: ${finalScore} (Time: ${duration}s)`);
                    } else if (finalScore === existingScore.score) {
                        // ถ้าคะแนนเท่ากัน แต่ทำเวลาได้ดีกว่า (น้อยกว่า) ให้เอาอันใหม่
                        await prisma.gameScore.update({
                            where: { gs_id: existingScore.gs_id },
                            data: {
                                time_taken: (duration < existingScore.time_taken) ? duration : existingScore.time_taken,
                                played_at: new Date(),
                                play_count: { increment: 1 } // ✅ บวกรอบ
                            }
                        });
                        console.log(`⚡ Score tied. Updated play stats.`);
                    } else {
                        // คะแนนน้อยกว่าเดิม -> แค่อัปเดตว่าเล่นแล้ว + บวกรอบ
                        await prisma.gameScore.update({
                            where: { gs_id: existingScore.gs_id },
                            data: {
                                played_at: new Date(),
                                play_count: { increment: 1 } // ✅ บวกรอบ
                            }
                        });
                        console.log(`ℹ️ Score not higher. Updated play count.`);
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
                        difficulty: diffValue,
                        play_count: 1 // ✅ เริ่มต้นที่ 1
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