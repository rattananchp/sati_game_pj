// backend/routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';

export default function (prisma) {
    const router = express.Router();
    console.log("🔥 Auth Route Loaded! (Ready)");

    // 1. Register (สมัครสมาชิก)
    router.post('/register', async (req, res) => {
        const { username, password, email, phone, birthdate, address } = req.body;

        try {
            // เช็คข้อมูลซ้ำ
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { username: username },
                        { email: email },
                        { phone: phone }
                    ]
                }
            });

            if (existingUser) {
                if (existingUser.username === username) return res.status(400).json({ error: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว!" });
                if (existingUser.email === email) return res.status(400).json({ error: "อีเมลนี้ถูกใช้งานแล้ว!" });
                if (existingUser.phone === phone) return res.status(400).json({ error: "เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว!" });
            }

            // เข้ารหัสรหัสผ่าน
            const hashedPassword = await bcrypt.hash(password, 10);

            // บันทึกข้อมูล
            const newUser = await prisma.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    email,
                    phone,
                    birthdate: new Date(birthdate),
                    address
                }
            });

            // ✅ ถูกต้อง: ส่ง uid กลับไป
            res.json({
                message: "สมัครสมาชิกเรียบร้อย!",
                user: {
                    uid: newUser.uid,
                    username: newUser.username,
                    role: newUser.role
                }
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "สมัครสมาชิกไม่สำเร็จ" });
        }
    });

    // 2. Login (เข้าสู่ระบบ)
    router.post('/login', async (req, res) => {
        const { username, password } = req.body;

        try {
            const user = await prisma.user.findUnique({
                where: { username: username }
            });


            if (!user) {
                return res.status(401).json({ error: "ไม่พบชื่อผู้ใช้นี้" });
            }

            const match = await bcrypt.compare(password, user.password);
            if (match) {
                // ✅ ถูกต้อง: ส่ง uid กลับไปให้ Frontend เก็บ

                res.json({
                    success: true,
                    user: {
                        uid: user.uid, // 👈 จุดสำคัญคือตรงนี้ (ต้องเป็น uid)
                        username: user.username,
                        email: user.email,
                        phone: user.phone,
                        role: user.role

                    }
                });
            } else {
                res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });
            }

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
        }
    });

    // 3. Reset Password (เปลี่ยนรหัสผ่าน)
    router.post('/reset-password', async (req, res) => {
        const { username, phone, newPassword } = req.body;

        try {
            const user = await prisma.user.findFirst({
                where: {
                    username: username,
                    phone: phone
                }
            });

            if (!user) {
                return res.status(404).json({ error: "ไม่พบข้อมูล หรือเบอร์โทรศัพท์ไม่ถูกต้อง" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { uid: user.uid }, // ✅ ถูกต้อง: ใช้ uid ในการอ้างอิง
                data: { password: hashedPassword }
            });

            res.json({ success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ!" });

        } catch (err) {
            console.error("Reset Password Error:", err);
            res.status(500).json({ error: "เปลี่ยนรหัสผ่านไม่สำเร็จ" });
        }
    });

    return router;
};