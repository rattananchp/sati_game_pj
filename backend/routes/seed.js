import express from 'express';

export default function seedRoute(prisma) {
    const router = express.Router();

    // เส้นทาง API: POST /seed/chat-scenarios
    router.post('/chat-scenarios', async (req, res) => {
        try {
            const data = req.body; 

            // 1. ลบข้อมูลเก่าทิ้งทั้งหมดก่อน (กันข้อมูลซ้ำ)
            await prisma.chatScenario.deleteMany();

            // 2. เพิ่มข้อมูลชุดใหม่เข้าไป
            const result = await prisma.chatScenario.createMany({
                data: data
            });

            res.json({ 
                success: true, 
                count: result.count, 
                message: "นำเข้าข้อมูล Chat เกมสำเร็จ!" 
            });
        } catch (error) {
            console.error("Seed Error:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
}