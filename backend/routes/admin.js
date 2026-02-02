import express from 'express';
const router = express.Router();

export default function (prisma) {

    // 1. GET: /stats (แก้ให้ดึงเฉพาะ Hard สำหรับตาราง Hardest Questions)
    router.get('/stats', async (req, res) => {
        try {
            // --- A. Overview (เหมือนเดิม) ---
            const totalUsers = await prisma.user.count({ where: { role: 'user' } });
            const totalGames = await prisma.gameScore.count({ where: { game_type: 'quiz' } }); // นับรวมทุกระดับ
            const totalVirusGames = await prisma.gameScore.count({ where: { game_type: 'virus' } });

            // --- B. Hardest Questions (✅ แก้: กรองเฉพาะ Level Hard) ---
            const hardQuestions = await prisma.questions.findMany({
                where: { level: 'hard' }, // ⭐ กรองเฉพาะ Hard
                include: {
                    answerLogs: true // ดึงประวัติการตอบมาด้วย
                }
            });

            // คำนวณความยาก
            const questionStats = hardQuestions.map(q => {
                const total = q.answerLogs.length;
                const correct = q.answerLogs.filter(log => log.is_correct).length;
                const rate = total === 0 ? 0 : (correct / total) * 100;
                
                return {
                    qid: q.qid,
                    question: q.question,
                    level: q.level,
                    correctRate: rate,
                    totalAttempts: total
                };
            })
            // เรียงจาก "ตอบถูกน้อยสุด" (ยากสุด) ไปมาก
            .sort((a, b) => a.correctRate - b.correctRate)
            .slice(0, 10); // เอาแค่ 10 อันดับแรก

            // --- C. Recent Logs (เหมือนเดิม) ---
            const recentLogs = await prisma.answerLogs.findMany({
                take: 20,
                orderBy: { answered_at: 'desc' },
                include: { user: true, question: true, choice: true }
            });

            res.json({
                overview: { totalUsers, totalGames, totalVirusGames },
                hardestQuestions: questionStats,
                recentLogs
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Server Error" });
        }
    });

    // ✅ 2. เพิ่ม API ใหม่: ดึงรายละเอียดเจาะลึกรายข้อ (/question-detail/:qid)
    router.get('/question-detail/:qid', async (req, res) => {
        const { qid } = req.params;
        try {
            const questionId = parseInt(qid);

            // 1. ดึงช้อยส์ทั้งหมดของข้อนี้
            const choices = await prisma.choices.findMany({
                where: { qid: questionId }
            });

            // 2. ดึงประวัติการตอบทั้งหมดของข้อนี้
            const logs = await prisma.answerLogs.findMany({
                where: { qid: questionId }
            });

            // 3. คำนวณว่าแต่ละช้อยส์มีคนเลือกกี่คน
            const totalAnswers = logs.length;
            
            const breakdown = choices.map(choice => {
                const count = logs.filter(log => log.cid === choice.cid).length;
                const percent = totalAnswers === 0 ? 0 : (count / totalAnswers) * 100;
                
                return {
                    choice_text: choice.choice_text,
                    is_correct: choice.is_correct,
                    count: count,
                    percent: parseFloat(percent.toFixed(1))
                };
            });

            res.json({
                questionId,
                totalAnswers,
                breakdown // ส่งข้อมูลแจกแจงกลับไป
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Detail Error" });
        }
    });

    return router;
}