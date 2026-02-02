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

    // ✅ แก้ไข API นี้: กรองเฉพาะ Hard + แบ่งหน้า + เรียงลำดับ
    router.get('/questions', async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sortOrder = req.query.sort || 'asc'; 

            // 1. ดึงเฉพาะข้อสอบระดับ Hard
            const allQuestions = await prisma.questions.findMany({
                where: { level: 'hard' }, // ⭐ เพิ่มบรรทัดนี้ครับ
                include: {
                    answerLogs: true
                }
            });

            // 2. คำนวณ % (เหมือนเดิม)
            const calculatedQuestions = allQuestions.map(q => {
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
            });

            // 3. เรียงลำดับ (เหมือนเดิม)
            calculatedQuestions.sort((a, b) => {
                if (sortOrder === 'asc') {
                    return a.correctRate - b.correctRate;
                } else {
                    return b.correctRate - a.correctRate;
                }
            });

            // 4. ตัดแบ่งหน้า (เหมือนเดิม)
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const paginatedQuestions = calculatedQuestions.slice(startIndex, endIndex);

            res.json({
                questions: paginatedQuestions,
                currentPage: page,
                totalPages: Math.ceil(calculatedQuestions.length / limit),
                totalQuestions: calculatedQuestions.length
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Fetch questions failed" });
        }
    });

    return router;
}