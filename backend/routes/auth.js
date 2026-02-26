import express from 'express';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import { generateToken, requireAuth } from '../middleware/auth.js';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
    message: { error: "เข้าสู่ระบบหรือสมัครสมาชิกบ่อยเกินไป กรุณารอสักครู่" },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export default function (prisma) {
    const router = express.Router();

    router.post('/register', authLimiter, async (req, res) => {
        const { username, password, email, phone, birthdate, address } = req.body;

        try {
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

            const hashedPassword = await bcrypt.hash(password, 10);

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

            const token = generateToken(newUser);

            res.json({
                message: "สมัครสมาชิกเรียบร้อย!",
                token: token,
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

    router.post('/login', authLimiter, async (req, res) => {
        const { username, password } = req.body;

        try {
            const user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { username: username },
                        { email: username },
                        { phone: username }
                    ]
                }
            });

            if (!user) {
                return res.status(401).json({ error: "ไม่พบชื่อผู้ใช้นี้" });
            }

            const match = await bcrypt.compare(password, user.password);
            if (match) {
                const token = generateToken(user);

                res.json({
                    success: true,
                    token: token,
                    user: {
                        uid: user.uid,
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

    // Option: Protect reset-password so it requires auth, OR leave it public if used for forgot pass flow (assuming it relies on OTP or knowledge of phone+username)
    // Here we add rate limiter to it since it's a critical endpoint
    router.post('/reset-password', authLimiter, async (req, res) => {
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
                where: { uid: user.uid },
                data: { password: hashedPassword }
            });

            res.json({ success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ!" });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "เปลี่ยนรหัสผ่านไม่สำเร็จ" });
        }
    });

    return router;
};