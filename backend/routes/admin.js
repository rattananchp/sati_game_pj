import express from 'express';
const router = express.Router();

export default function (prisma) {

    // 0. API: ดึงหมวดหมู่ทั้งหมด
    router.get('/categories', async (req, res) => {
        try {
            const categories = await prisma.category.findMany();
            res.json({ categories });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Fetch categories failed" });
        }
    });

    // 1. API: ดึงภาพรวม (Overview)
    router.get('/stats', async (req, res) => {
        try {
            const totalUsers = await prisma.user.count({ where: { role: 'user' } });
            const totalGames = await prisma.game.count(); // ✅ นับจากตารางประวัติการเล่น (Game) แทน Leaderboard

            // ✅ แก้ไข: นับยอดรวมการเล่น Virus จาก play_count ของทุกคนรวมกัน
            const virusAgg = await prisma.gameScore.aggregate({
                _sum: { play_count: true },
                where: { game_type: 'virus' }
            });
            const totalVirusGames = virusAgg._sum.play_count || 0;

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
    // 2. API: ดึงรายการข้อสอบ (ปรับปรุง: รองรับ Filter Level)
    router.get('/questions', async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 16;
            const sortOrder = req.query.sort || 'asc';
            const levelFilter = req.query.level || 'all'; // รับค่า level จากหน้าเว็บ
            const categoryFilter = req.query.category || 'all'; // รับค่า category จากหน้าเว็บ

            // สร้างเงื่อนไข Where
            let whereCondition = {};
            if (levelFilter !== 'all') {
                whereCondition.level = levelFilter; // ถ้าไม่ใช่ all ให้กรองตาม level
            }
            if (categoryFilter !== 'all') {
                whereCondition.cg_id = parseInt(categoryFilter); // ถ้าไม่ใช่ all ให้กรองตาม cg_id
            }

            const allQuestions = await prisma.questions.findMany({
                where: whereCondition, // ✅ ใช้เงื่อนไขที่สร้างขึ้น
                include: {
                    category: { select: { mode_cg: true } },
                    answerLogs: {
                        select: { is_correct: true }
                    }
                }
            });

            // ... (Logic คำนวณ % เหมือนเดิม) ...
            const calculatedQuestions = allQuestions.map(q => {
                const totalAttempts = q.answerLogs.length;
                const correctCount = q.answerLogs.filter(log => log.is_correct).length;
                const correctRate = totalAttempts === 0 ? 0 : (correctCount / totalAttempts) * 100;

                return {
                    qid: q.qid,
                    question: q.question,
                    level: q.level,
                    category: q.category ? q.category.mode_cg : '-',
                    correctRate: parseFloat(correctRate.toFixed(1)),
                    totalAttempts: totalAttempts
                };
            });

            // Sorting
            calculatedQuestions.sort((a, b) => {
                if (sortOrder === 'asc') return a.correctRate - b.correctRate;
                return b.correctRate - a.correctRate;
            });

            // Pagination
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
                level: question.level,
                cg_id: question.cg_id,
                explanation: question.explanation,
                totalAttempts,
                breakdown: breakdown
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Fetch detail failed" });
        }
    });

    // ... (ต่อจาก code เดิม)

    // 4. API: เพิ่มโจทย์ใหม่ (Add Question)
    router.post('/question/add', async (req, res) => {
        try {
            const { question, choices, correctIndex, level, explanation, cg_id } = req.body;

            if (!question || !choices || choices.length < 2 || correctIndex === undefined) {
                return res.status(400).json({ error: "ข้อมูลไม่ครบถ้วน" });
            }

            // ✅ เช็คก่อนว่ามีคำถามนี้ในระบบหรือยัง?
            const existingQuestion = await prisma.questions.findFirst({
                where: { question: question } // ค้นหาจากชื่อคำถาม
            });

            if (existingQuestion) {
                return res.status(400).json({ error: "คำถามนี้มีอยู่ในระบบแล้ว! กรุณาเปลี่ยนคำถาม" });
            }

            // ถ้าไม่ซ้ำ ก็บันทึกตามปกติ
            const newQuestion = await prisma.questions.create({
                data: {
                    question: question,
                    level: level || 'hard',
                    explanation: explanation || '',
                    cg_id: cg_id ? parseInt(cg_id) : null,
                    choices: {
                        create: choices.map((text, index) => ({
                            choice_text: text,
                            is_correct: index === parseInt(correctIndex)
                        }))
                    }
                }
            });

            console.log(`✅ Added Question ID: ${newQuestion.qid}`);
            res.json({ success: true, question: newQuestion });

        } catch (err) {
            console.error("Add Question Error:", err);
            res.status(500).json({ error: "เพิ่มข้อมูลล้มเหลว", details: err.message });
        }
    });
    // 5. API: ลบโจทย์ (Delete)
    router.delete('/question/delete/:id', async (req, res) => {
        try {
            const qid = parseInt(req.params.id);

            // ลบคำถาม (Prisma จะ Cascade ลบ Choices และ AnswerLogs ให้เองถ้าตั้งไว้)
            // แต่เพื่อความชัวร์ เราลบตามลำดับก็ได้ หรือสั่งลบแม่ตัวเดียว
            await prisma.questions.delete({
                where: { qid: qid }
            });

            console.log(`🗑️ Deleted Question ID: ${qid}`);
            res.json({ success: true });
        } catch (err) {
            console.error("Delete Error:", err);
            res.status(500).json({ error: "ลบข้อมูลไม่สำเร็จ" });
        }
    });

    // 6. API: แก้ไขโจทย์ (Update)
    router.put('/question/update/:id', async (req, res) => {
        try {
            const qid = parseInt(req.params.id);
            const { question, choices, correctIndex, level, explanation, cg_id } = req.body;

            // 1. อัปเดตตัวคำถามหลัก
            await prisma.questions.update({
                where: { qid: qid },
                data: {
                    question: question,
                    level: level,
                    explanation: explanation,
                    cg_id: cg_id ? parseInt(cg_id) : null
                }
            });

            // 2. อัปเดตช้อยส์ (ต้องดึงของเก่ามาเทียบ ID เพื่อ Update ทับ)
            // ดึงช้อยส์เก่าเรียงตาม ID (เพื่อให้ลำดับตรงกับ Array ที่ส่งมา)
            const oldChoices = await prisma.choices.findMany({
                where: { qid: qid },
                orderBy: { cid: 'asc' }
            });

            // วนลูปอัปเดตทีละข้อ (Update Existing Choices)
            // เราสมมติว่ามี 4 ข้อเท่าเดิมเสมอ
            for (let i = 0; i < oldChoices.length; i++) {
                if (choices[i]) {
                    await prisma.choices.update({
                        where: { cid: oldChoices[i].cid },
                        data: {
                            choice_text: choices[i],
                            is_correct: i === parseInt(correctIndex)
                        }
                    });
                }
            }

            console.log(`✏️ Updated Question ID: ${qid}`);
            res.json({ success: true });

        } catch (err) {
            console.error("Update Error:", err);
            res.status(500).json({ error: "แก้ไขข้อมูลไม่สำเร็จ" });
        }
    });

    // ✅ 7. API: ดึงข้อมูล Virus Leaderboard (Logic ใหม่: Fetch All -> Filter Unique -> Slice)
    // แก้ปัญหา PostgreSQL Error: SELECT DISTINCT ON expressions must match initial ORDER BY expressions
    router.get('/virus/leaderboard', async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            // 1. ดึงข้อมูลทั้งหมดของโหมด Virus (เรียงคะแนนมากสุด)
            const allScores = await prisma.gameScore.findMany({
                where: { game_type: 'virus' },
                include: {
                    user: {
                        select: { username: true, email: true }
                    }
                },
                orderBy: [
                    { score: 'desc' },
                    { played_at: 'desc' }
                ]
            });

            // 2. Filter เอาเฉพาะคะแนนที่ดีที่สุดของแต่ละคน (Unique UID)
            const uniqueMap = new Map();
            const uniqueScores = [];

            for (const item of allScores) {
                if (!uniqueMap.has(item.uid)) {
                    uniqueMap.set(item.uid, true);
                    uniqueScores.push(item);
                }
            }

            // 3. Pagination
            const total = uniqueScores.length;
            const totalPages = Math.ceil(total / limit);
            const startIndex = (page - 1) * limit;
            const paginatedScores = uniqueScores.slice(startIndex, startIndex + limit);

            res.json({
                scores: paginatedScores,
                total,
                totalPages: totalPages || 1,
                currentPage: page
            });

        } catch (err) {
            console.error("Fetch Virus Leaderboard Error:", err);
            res.status(500).json({ error: "ดึงข้อมูลไม่สำเร็จ" });
        }
    });

    // ✅ 8. API: ดึงรายชื่อผู้ใช้งานทั้งหมด (User Management)
    router.get('/users', async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';

            const whereClause = search ? {
                OR: [
                    { username: { contains: search } },
                    { email: { contains: search } }
                ]
            } : {};



            const users = await prisma.user.findMany({
                where: whereClause,
                select: {
                    uid: true,
                    username: true,
                    email: true,
                    role: true,
                    phone: true,
                    scores: true // ✅ ดึงข้อมูล score ทั้งหมดมานับจำนวนแทน (เพราะไม่ได้ update db field play_count)
                },
                orderBy: { uid: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            });

            // ✅ คำนวณจำนวนเกมทั้งหมดที่เล่น (ตัดออกตาม request)
            const usersWithStats = users.map(u => ({
                ...u,
                // total_games: u.scores ? u.scores.length : 0, 
                scores: undefined // ลบ scores ออกจาก response เพื่อไม่ให้รก
            }));

            const total = await prisma.user.count({ where: whereClause });

            res.json({
                users: usersWithStats,
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page
            });
        } catch (err) {
            console.error("Fetch Users Error:", err);
            res.status(500).json({ error: "ดึงข้อมูลผู้ใช้งานไม่สำเร็จ" });
        }
    });

    // ✅ 9. API: ลบผู้ใช้งาน (User Management)
    router.delete('/user/:id', async (req, res) => {
        try {
            const uid = parseInt(req.params.id);

            // ป้องกันการลบตัวเองหรือ Admin (ถ้ามี Logic auth request user)
            // แต่ในที่นี้ Admin เป็นคนยิง API

            await prisma.user.delete({
                where: { uid: uid }
            });

            console.log(`🗑️ Deleted User ID: ${uid}`);
            res.json({ success: true, message: "ลบผู้ใช้งานสำเร็จ" });
        } catch (err) {
            console.error("Delete User Error:", err);
            res.status(500).json({ error: "ลบผู้ใช้งานไม่สำเร็จ" });
        }
    });

    return router;
};
