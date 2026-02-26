import express from 'express';
import bcrypt from 'bcrypt';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

export default function (prisma) {

    router.post('/update-profile', requireAuth, async (req, res) => {
        const userId = req.user.uid;
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ error: "ข้อมูลไม่ครบถ้วน" });
        }

        try {
            const existingUser = await prisma.user.findFirst({
                where: {
                    username: username,
                    uid: { not: userId }
                }
            });

            if (existingUser) {
                return res.status(400).json({ error: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" });
            }

            await prisma.user.update({
                where: { uid: userId },
                data: { username: username }
            });

            res.json({ success: true, message: "อัปเดตข้อมูลสำเร็จ" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "อัปเดตข้อมูลไม่สำเร็จ" });
        }
    });

    router.post('/change-password', requireAuth, async (req, res) => {
        const userId = req.user.uid;
        const { currentPassword, newPassword } = req.body;

        console.log("📩 change-password request:", { userId, hasCurrentPw: !!currentPassword, hasNewPw: !!newPassword });

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "กรุณากรอกรหัสผ่านให้ครบถ้วน" });
        }
        if (newPassword.length < 4) {
            return res.status(400).json({ error: "รหัสผ่านใหม่สั้นเกินไป (ต้อง 4 ตัวขึ้นไป)" });
        }

        try {
            const user = await prisma.user.findUnique({
                where: { uid: userId }
            });

            if (!user) {
                return res.status(404).json({ error: "ไม่พบผู้ใช้งาน" });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);

            if (!isMatch) {
                return res.status(401).json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
            }

            const isSameAsOld = await bcrypt.compare(newPassword, user.password);
            if (isSameAsOld) {
                return res.status(400).json({ error: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม" });
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            await prisma.user.update({
                where: { uid: userId },
                data: { password: hashedPassword }
            });

            res.json({ success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ" });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "เปลี่ยนรหัสผ่านไม่สำเร็จ" });
        }
    });

    router.get('/status/:id', async (req, res) => {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                return res.status(400).json({ error: "Invalid User ID" });
            }

            const user = await prisma.user.findUnique({
                where: { uid: userId },
                select: {
                    uid: true,
                    username: true,
                    role: true
                }
            });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            user.is_banned = false;
            user.ban_reason = null;
            user.ban_expires_at = null;

            res.json(user);

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    return router;
}