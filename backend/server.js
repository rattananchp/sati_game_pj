import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

// CORS Config (🔒 ระบุ domain ชัดเจน ไม่ใช้ wildcard regex)
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://sati-game-pj-frontend.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Security Headers via Helmet
app.use(helmet({
  // 🔒 CSP: กำหนด directive ให้ครบทุกตัว (แก้ ZAP: No Fallback, Wildcard)
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],                      // ✅ ลบ unsafe-inline/unsafe-eval (Backend เป็น API ไม่จำเป็น)
      styleSrc: ["'self'"],                        // ✅ ลบ unsafe-inline
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'"],                         // ✅ เพิ่ม (แก้ No Fallback)
      objectSrc: ["'none'"],                       // ✅ เพิ่ม (ป้องกัน Flash/Plugin)
      baseUri: ["'self'"],                         // ✅ เพิ่ม (ป้องกัน base tag injection)
      formAction: ["'self'"],                      // ✅ เพิ่ม (ป้องกัน form redirect)
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:4000"],
      frameAncestors: ["'self'"],
    },
  },
  // 🔒 HSTS: บังคับ HTTPS (แก้ ZAP: Strict-Transport-Security Not Set)
  strictTransportSecurity: {
    maxAge: 31536000,       // 1 ปี
    includeSubDomains: true,
  },
}));

app.use(express.json());

// 🔒 Cache-Control: ป้องกัน browser cache ข้อมูล sensitive (แก้ ZAP: Cache-control)
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  next();
});

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