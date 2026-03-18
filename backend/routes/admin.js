import express from 'express';
import { requireAuth } from '../middleware/auth.js';

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

    // 📁 routes/admin.js (หรือไฟล์ที่เกี่ยวกับสถิติ)
    router.get('/stats', async (req, res) => {
        try {
            // 1. ดึงภาพรวมตัวเลขทั้งหมด (เอาไว้โชว์บนการ์ด 4 ใบด้านบน)
            const totalUsers = await prisma.user.count({ where: { role: { not: 'admin' } } }); 
            
            // นับจากตาราง GameScore
            const totalQuiz = await prisma.gameScore.count({ where: { game_type: 'quiz' } });
            const totalVirus = await prisma.gameScore.count({ where: { game_type: 'virus' } });
            const totalChat = await prisma.gameScore.count({ where: { game_type: 'chat' } });

            // (ถ้าโหมดควิซเก่าคุณเก็บในตาราง Game ให้นำมารวมด้วยแบบนี้)
            const legacyQuiz = await prisma.game.count(); 
            const allQuizGames = totalQuiz + legacyQuiz;

            // 2. คำนวณข้อมูลรายเดือน (สำหรับทำกราฟ)
            const currentYear = new Date().getFullYear();
            // เริ่มนับตั้งแต่วันที่ 1 มกราคม ของปีปัจจุบัน
            const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);

            // ดึงประวัติการเล่นทั้งหมดของปีนี้
            const scoresThisYear = await prisma.gameScore.findMany({
                where: { played_at: { gte: startOfYear } },
                select: { game_type: true, played_at: true }
            });

            // ดึงประวัติ Quiz แบบเก่า (ถ้ามี)
            const legacyGamesThisYear = await prisma.game.findMany({
                where: { started_at: { gte: startOfYear } },
                select: { started_at: true }
            });

            // สร้างโครงร่างตาราง 12 เดือน รอใส่ข้อมูล
            const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
            const monthlyStats = thaiMonths.map(month => ({ month, quiz: 0, virus: 0, chat: 0 }));

            // นำข้อมูล GameScore มาบวกเข้าในแต่ละเดือน
            scoresThisYear.forEach(score => {
                const monthIndex = score.played_at.getMonth(); // ได้ค่า 0 (ม.ค.) ถึง 11 (ธ.ค.)
                const type = score.game_type.toLowerCase();
                
                if (type === 'quiz' || type === 'normal') monthlyStats[monthIndex].quiz += 1;
                else if (type === 'virus') monthlyStats[monthIndex].virus += 1;
                else if (type === 'chat') monthlyStats[monthIndex].chat += 1;
            });

            // นำข้อมูลตาราง Game รุ่นเก่ามารวมในเดือนนั้นๆ (ถ้ามี)
            legacyGamesThisYear.forEach(game => {
                const monthIndex = game.started_at.getMonth();
                monthlyStats[monthIndex].quiz += 1;
            });

            // 3. ส่งข้อมูลที่คำนวณเสร็จแล้วกลับไปให้เว็บ
            res.json({
                overview: {
                    totalUsers: totalUsers,
                    totalGames: allQuizGames,
                    totalVirusGames: totalVirus,
                    totalChatGames: totalChat
                },
                monthlyStats: monthlyStats
            });

        } catch (error) {
            console.error("Stats Error:", error);
            res.status(500).json({ error: "Failed to fetch stats" });
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
                        where: {
                            user: { role: { notIn: ['admin', 'editor'] } }
                        },
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
                where: {
                    qid: qid,
                    user: { role: { notIn: ['admin', 'editor'] } }
                }
            });

            // 3. วนลูปนับแต่ละช้อยส์
            const breakdown = await Promise.all(question.choices.map(async (choice) => {
                const count = await prisma.answerLogs.count({
                    where: {
                        cid: choice.cid,
                        user: { role: { notIn: ['admin', 'editor'] } }
                    }
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
                where: {
                    game_type: 'virus',
                    user: {
                        role: { notIn: ['admin', 'editor'] } // 🛡️ ไม่เอาคะแนนของ Admin และ Editor ขึ้น Leaderboard
                    }
                },
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
    // 📁 routes/admin.js (ฝั่ง Backend)

    router.get('/users', async (req, res) => {
        try {
            // 1. รับพารามิเตอร์ที่หน้าเว็บส่งมา (ถ้าไม่ส่งมา ให้ใช้ค่าเริ่มต้น)
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 8; // ✅ รับค่า limit = 8
            const search = req.query.search || '';
            const tab = req.query.tab || 'player'; // ✅ รับค่า tab (player หรือ staff)

            const skip = (page - 1) * limit;

            // 2. สร้างเงื่อนไขการค้นหา (Search)
            let whereCondition = {};
            
            if (search) {
                whereCondition.OR = [
                    { username: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ];
            }

            // 3. สร้างเงื่อนไขการกรองตาม Tab (แยก Player กับ Staff)
            if (tab === 'player') {
                whereCondition.role = 'user'; // ดึงเฉพาะ user
            } else if (tab === 'staff') {
                whereCondition.role = { in: ['admin', 'editor'] }; // ดึงเฉพาะ admin กับ editor
            }

            // 4. ดึงข้อมูลจาก Database
            const users = await prisma.user.findMany({
                where: whereCondition,
                skip: skip,
                take: limit, // ✅ ให้ Database ตัดมาแค่ 8 คนเป๊ะๆ
                orderBy: { uid: 'desc' } // เรียงคนสมัครใหม่ไว้บนสุด
            });

            // 5. นับจำนวนคนทั้งหมดตามเงื่อนไข เพื่อเอาไปทำปุ่มแบ่งหน้า (Pagination)
            const total = await prisma.user.count({ where: whereCondition });

            res.json({
                users: users,
                total: total,
                totalPages: Math.ceil(total / limit)
            });

        } catch (error) {
            console.error("Fetch Users Error:", error);
            res.status(500).json({ error: "Failed to fetch users" });
        }
    });

    // ✅ 9. API: ลบผู้ใช้งาน (User Management)
    router.delete('/user/:id', requireAuth, async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: "ไม่มีสิทธิ์ในการลบผู้ใช้งาน" });
            }

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

    // ✅ 10. API: เปลี่ยน Role ของผู้ใช้งาน
    router.put('/user/:id/role', requireAuth, async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: "ไม่มีสิทธิ์ในการเปลี่ยน Role" });
            }

            const uid = parseInt(req.params.id);
            const { role } = req.body;

            if (!['admin', 'editor', 'user'].includes(role)) {
                return res.status(400).json({ error: "Role ไม่ถูกต้อง" });
            }

            const updatedUser = await prisma.user.update({
                where: { uid: uid },
                data: { role: role },
                select: { uid: true, username: true, role: true }
            });

            console.log(`✏️ Updated User ID: ${uid} to role: ${role}`);
            res.json({ success: true, message: "เปลี่ยน Role สำเร็จ", user: updatedUser });
        } catch (err) {
            console.error("Update Role Error:", err);
            res.status(500).json({ error: "เปลี่ยน Role ไม่สำเร็จ" });
        }
    });

    // 1. ดึงข้อมูลทั้งหมด (GET)
    router.get('/chat-scenarios', async (req, res) => {
        try {
            const scenarios = await prisma.chatScenario.findMany({
                orderBy: [
                    { category: 'asc' }, // เรียงตามหมวดหมู่
                    { level: 'asc' }     // เรียงตามเลเวล
                ]
            });

            // จัด Format ข้อมูลให้ตรงกับที่ Frontend (ChatAdmin) ต้องการ
            const formattedData = scenarios.map(item => ({
                _id: item.cs_id.toString(), // ID ของ Database
                id: item.scenario_id,       // ID ของเกม (เช่น callcenter-1)
                category: item.category,
                categoryTitle: item.categoryTitle,
                level: item.level,
                name: item.name,
                avatar: item.avatar,
                lossType: item.lossType,
                msgs: item.content.msgs,       // แกะข้อความออกจาก JSON
                choices: item.content.choices  // แกะตัวเลือกออกจาก JSON
            }));

            res.json(formattedData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to fetch scenarios" });
        }
    });

    // 2. สร้างด่านใหม่ (POST)
    router.post('/chat-scenarios', async (req, res) => {
        try {
            const data = req.body;
            const newScenario = await prisma.chatScenario.create({
                data: {
                    scenario_id: data.id,
                    category: data.category,
                    categoryTitle: data.categoryTitle,
                    level: data.level,
                    name: data.name,
                    avatar: data.avatar,
                    lossType: data.lossType,
                    // แพ็ค msgs และ choices กลับเป็น JSON
                    content: {
                        msgs: data.msgs,
                        choices: data.choices
                    }
                }
            });
            res.json({ success: true, newScenario });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to create scenario" });
        }
    });

    // 3. อัปเดตด่านเดิม (PUT)
    router.put('/chat-scenarios/:id', async (req, res) => {
        try {
            const { id } = req.params; // id คือ scenario_id (เช่น callcenter-1)
            const data = req.body;

            const updatedScenario = await prisma.chatScenario.update({
                where: { scenario_id: id },
                data: {
                    category: data.category,
                    categoryTitle: data.categoryTitle,
                    level: data.level,
                    name: data.name,
                    avatar: data.avatar,
                    lossType: data.lossType,
                    content: {
                        msgs: data.msgs,
                        choices: data.choices
                    }
                }
            });
            res.json({ success: true, updatedScenario });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to update scenario" });
        }
    });

    // 4. ลบด่าน (DELETE)
    router.delete('/chat-scenarios/:id', async (req, res) => {
        try {
            const { id } = req.params;
            await prisma.chatScenario.delete({
                where: { scenario_id: id }
            });
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to delete scenario" });
        }
    });

    //  ✅ API สำหรับอัปเดตข้อมูลติดต่อ (Username, Email, Phone)
    router.put('/user/:id', async (req, res) => {
        try {
            const uid = parseInt(req.params.id);
            const { username, email, phone } = req.body;

            // เช็คว่ามีข้อมูลส่งมาครบไหม
            if (!username || !email) {
                return res.status(400).json({ error: "กรุณากรอก Username และ Email ให้ครบ" });
            }

            // ทำการอัปเดตข้อมูลใน Database (ใช้ Prisma)
            const updatedUser = await prisma.user.update({
                where: { uid: uid },
                data: {
                    username: username,
                    email: email,
                    phone: phone || null // ถ้าไม่ได้ส่งเบอร์มาให้เป็น null
                }
            });

            res.json({ success: true, message: "อัปเดตข้อมูลสำเร็จ", user: updatedUser });

        } catch (error) {
            console.error("Update user info error:", error);
            
            // ถ้าเกิด Error เพราะ Username หรือ Email ซ้ำกับคนอื่นในระบบ
            if (error.code === 'P2002') {
                return res.status(400).json({ error: "อีเมล หรือ ชื่อผู้ใช้งานนี้มีคนใช้แล้ว" });
            }
            
            res.status(500).json({ error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" });
        }
    });

    return router;
};