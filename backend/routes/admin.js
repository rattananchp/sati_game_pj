import express from 'express';
const router = express.Router();

export default function (prisma) {

    // 1. API: ดึงภาพรวม (Overview)
    router.get('/stats', async (req, res) => {
        try {
            const totalUsers = await prisma.user.count({ where: { role: 'user' } });
            const totalGames = await prisma.gameScore.count({ where: { game_type: 'quiz' } });
            const totalVirusGames = await prisma.gameScore.count({ where: { game_type: 'virus' } });

            res.json({
                overview: {
                    totalUsers,
                    totalGames,
                    totalVirusGames
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Stats error" });
        }
    });

    // 2. API: ดึงรายการข้อสอบ (ตารางหลัก)
    router.get('/questions', async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 16;
            const sortOrder = req.query.sort || 'asc'; 

            const allQuestions = await prisma.questions.findMany({
                where: { level: 'hard' }, 
                include: {
                    answerLogs: {
                        select: { is_correct: true }
                    }
                }
            });

            const calculatedQuestions = allQuestions.map(q => {
                const totalAttempts = q.answerLogs.length;
                const correctCount = q.answerLogs.filter(log => log.is_correct).length;
                const correctRate = totalAttempts === 0 ? 0 : (correctCount / totalAttempts) * 100;

                return {
                    qid: q.qid,
                    question: q.question,
                    level: q.level,
                    correctRate: parseFloat(correctRate.toFixed(1)),
                    totalAttempts: totalAttempts
                };
            });

            calculatedQuestions.sort((a, b) => {
                if (sortOrder === 'asc') return a.correctRate - b.correctRate;
                return b.correctRate - a.correctRate;
            });

            const startIndex = (page - 1) * limit;
            const paginatedQuestions = calculatedQuestions.slice(startIndex, startIndex + limit);

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

    // 3. API: เจาะลึกรายละเอียดรายข้อ (อันนี้แหละที่ 404 อยู่!)
    router.get('/question-detail/:id', async (req, res) => {
        try {
            const qid = parseInt(req.params.id);

            // 1. ดึงคำถาม + ช้อยส์
            const question = await prisma.questions.findUnique({
                where: { qid: qid },
                include: { choices: true }
            });

            if (!question) return res.status(404).json({ error: "Not found" });

            // 2. นับคนตอบทั้งหมดของข้อนี้
            const totalAttempts = await prisma.answerLogs.count({
                where: { qid: qid }
            });

            // 3. วนลูปนับแต่ละช้อยส์
            const breakdown = await Promise.all(question.choices.map(async (choice) => {
                const count = await prisma.answerLogs.count({
                    where: { cid: choice.cid }
                });

                const percent = totalAttempts === 0 ? 0 : (count / totalAttempts) * 100;

                return {
                    choice_text: choice.choice_text,
                    is_correct: choice.is_correct,
                    count: count,
                    percent: parseFloat(percent.toFixed(1))
                };
            }));

            res.json({
                question: question.question,
                totalAttempts,
                breakdown: breakdown
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Fetch detail failed" });
        }
    });

    return router;
}