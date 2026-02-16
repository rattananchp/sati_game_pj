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

// CORS Config
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://sati-game-pj-frontend.vercel.app", // 🌍 Example Vercel Frontend
    /\.vercel\.app$/ // 🔓 Allow all Vercel Subdomains (Preview Deployments)
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true // Allow cookies if needed
}));

// Security Headers (CSP) via Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for development
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:4000"], // Allow frontend & backend
      frameAncestors: ["'self'"], // 🔒 Prevent ClickJacking
    },
  },
}));

app.use(express.json());

// ✅ Debug Middleware: Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
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