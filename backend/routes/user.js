import express from 'express';
import bcrypt from 'bcrypt';

const router = express.Router();

export default function (prisma) {

    router.post('/update-profile', async (req, res) => {
        const { userId, username } = req.body;

        if (!userId || !username) {
            return res.status(400).json({ error: "ข้อมูลไม่ครบถ้วน" });
        }

        try {
            await prisma.user.update({
                where: { uid: parseInt(userId) },
                data: { username: username }
            });

            res.json({ success: true, message: "อัปเดตข้อมูลสำเร็จ" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "อัปเดตข้อมูลไม่สำเร็จ" });
        }
    });

    router.post('/change-password', async (req, res) => {
        const { userId, currentPassword, newPassword } = req.body;

        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        }

        try {
            const user = await prisma.user.findUnique({
                where: { uid: parseInt(userId) }
            });

            if (!user) {
                return res.status(404).json({ error: "ไม่พบผู้ใช้งาน" });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);

            if (!isMatch) {
                return res.status(401).json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            await prisma.user.update({
                where: { uid: parseInt(userId) },
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