// routes/questions.js
import express from 'express';

export default function (prisma) {
    const router = express.Router();

    router.get('/', async (req, res) => {
        const { level, userId } = req.query;

        if (!level) {
            return res.status(400).json({ error: 'กรุณาระบุระดับความยาก (level)' });
        }

        try {
            // ✅ Check Ban Status if userId is provided
            // ✅ Ban Check Removed (System Disabled)
            /*
            if (userId) {
                const user = await prisma.user.findUnique({ where: { uid: parseInt(userId) } });
                if (user && user.is_banned) { ... }
            }
            */

            // 1. ดึงคำถามทั้งหมดใน Level นั้น (พร้อม Choices)
            // เช็คชื่อ Model: ใน Schema เป็น "Questions" (มี s) -> prisma.questions
            const allQuestions = await prisma.questions.findMany({
                where: { level: level },
                include: { choices: true }
            });

            if (allQuestions.length === 0) {
                return res.json({ success: true, questions: [] });
            }

            // 2. สุ่มลำดับ (Shuffle)
            const shuffled = allQuestions.sort(() => 0.5 - Math.random());

            // 3. ตัดมาแค่ 10 ข้อ
            const selectedQuestions = shuffled.slice(0, 10);

            res.json({ success: true, questions: selectedQuestions });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}