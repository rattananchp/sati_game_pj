import express from 'express';
import bcrypt from 'bcrypt'; // ✅ 1. อย่าลืม import bcrypt

const router = express.Router();

export default function (prisma) {

    // ==========================================
    // 1. เปลี่ยนชื่อผู้ใช้ (Update Profile)
    // ==========================================
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
            console.error("Update Profile Error:", err);
            res.status(500).json({ error: "อัปเดตข้อมูลไม่สำเร็จ" });
        }
    });

    // ==========================================
    // 2. เปลี่ยนรหัสผ่าน (Change Password)
    // ==========================================
    router.post('/change-password', async (req, res) => {
        const { userId, currentPassword, newPassword } = req.body;

        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
        }

        try {
            // 1. หา User
            const user = await prisma.user.findUnique({
                where: { uid: parseInt(userId) }
            });

            if (!user) {
                console.log("❌ User not found ID:", userId);
                return res.status(404).json({ error: "ไม่พบผู้ใช้งาน" });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);

            // 2. เช็ครหัสเดิม
            if (!isMatch) {
                return res.status(401).json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
            }

            // 3. เข้ารหัสรหัสผ่านใหม่ก่อนบันทึก (Hash New Password)
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // 4. อัปเดตลงฐานข้อมูล
            await prisma.user.update({
                where: { uid: parseInt(userId) },
                data: { password: hashedPassword } // บันทึกแบบ Hash
            });

            res.json({ success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ" });

        } catch (err) {
            console.error("Change Password Error:", err);
            res.status(500).json({ error: "เปลี่ยนรหัสผ่านไม่สำเร็จ" });
        }
    });

    // ==========================================
    // 3. Check Ban Status (Real DB Check)
    // ==========================================
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

            // 🔥 SYSTEM FORCE: Remove Ban System
            user.is_banned = false;
            user.ban_reason = null;
            user.ban_expires_at = null;

            res.json(user);

        } catch (err) {
            console.error("Fetch User Status Error:", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    return router;
}