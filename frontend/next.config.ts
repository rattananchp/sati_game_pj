import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false, // 🛑 Disable X-Powered-By: Next.js (Fixes "Modern Web Application" & "Information Disclosure" alerts)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ""}`,
              "img-src 'self' data: https://res.cloudinary.com https://avatars.githubusercontent.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "connect-src 'self' http://localhost:4000 ws://localhost:4000 http://127.0.0.1:4000 ws://127.0.0.1:4000 https://sati-game-pj-backend.vercel.app",
              "frame-ancestors 'self'",
            ].join('; ') + ';',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // 🔒 HSTS: บังคับ HTTPS (Fixes Systemic Strict-Transport-Security Header Not Set)
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            // 🔒 Cache-Control: ป้องกัน cache ข้อมูล sensitive แบบครบถ้วน (Fixes Retrieved from Cache)
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};



export default nextConfig;

