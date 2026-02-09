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

            // 👇👇👇 เริ่มส่วน DEBUG (ดูค่าจริงใน Terminal) 👇👇👇
            console.log("---------------- DEBUG CHANGE PASSWORD ----------------");
            console.log("User ID:", userId);
            console.log("User Name:", user.username);
            console.log("Input Password (ที่คุณกรอก):", `"${currentPassword}"`);
            console.log("DB Password (ในฐานข้อมูล):", `"${user.password}"`);

            // เช็คว่ารหัสใน DB เป็น Hash หรือไม่ (ถ้าสั้นๆ แปลว่าเป็น text ธรรมดา)
            const isHash = user.password.startsWith('$2b$') || user.password.length > 50;
            console.log("Is DB Password Hashed?:", isHash);

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            console.log("Result (isMatch):", isMatch);
            console.log("-------------------------------------------------------");
            // 👆👆👆 จบส่วน DEBUG 👆👆👆

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

    return router;
}