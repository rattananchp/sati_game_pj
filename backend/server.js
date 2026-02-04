import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client'; // ใช้แบบนี้ได้เลยถ้า Node เวอร์ชั่นใหม่

// นำเข้า Routes
import authRoute from './routes/auth.js';
import questionRoute from './routes/questions.js';
import scoreRoute from './routes/score.js';
import userRoute from './routes/user.js'; // ✅ 1. แก้ชื่อตรงนี้เป็น userRoute (อย่าใช้ scoreRoute ซ้ำ)
import adminRoute from './routes/admin.js';
import submitRoute from './routes/submit.js';
const app = express();
const prisma = new PrismaClient();
const port = 4000;

// CORS Config
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

console.log('✅ Server is ready with Prisma...');
console.log('🔄 Restarting to apply Prisma updates...');

// ใช้งาน Routes
app.use('/', authRoute(prisma));
app.use('/questions', questionRoute(prisma));
app.use('/scores', scoreRoute(prisma));
app.use('/user', userRoute(prisma)); // ✅ 2. ตรงนี้ต้องเรียก userRoute (ตามที่ import มา)
app.use('/admin', adminRoute(prisma));
app.use('/submit-score', submitRoute(prisma));
// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

export default app;