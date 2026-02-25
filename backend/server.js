import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';

import authRoute from './routes/auth.js';
import questionRoute from './routes/questions.js';
import scoreRoute from './routes/score.js';
import userRoute from './routes/user.js';
import adminRoute from './routes/admin.js';
import submitRoute from './routes/submit.js';
const app = express();
const prisma = new PrismaClient();
const port = 4000;

// app.use(cors({
//   origin: [
//     "http://localhost:3000",
//     "http://127.0.0.1:3000",
//     "https://sati-game-pj.vercel.app",
//     "https://sati-game-pj-frontend.vercel.app"
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true
// }));
// ✅ แก้ไข CORS ให้เป็น *
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  // credentials: true // ⚠️ ต้องปิดการใช้งาน เพราะไม่สามารถใช้ร่วมกับ origin: "*" ได้
}));  

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'self'"],
    },
  },
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
  crossOriginEmbedderPolicy: false,
}));

app.use((req, res, next) => {
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  next();
});



app.use('/', authRoute(prisma));
app.use('/questions', questionRoute(prisma));
app.use('/scores', scoreRoute(prisma));
app.use('/user', userRoute(prisma));
app.use('/admin', adminRoute(prisma));
app.use('/submit-score', submitRoute(prisma));
// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

export default app;