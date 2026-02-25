import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",             // Next.js ต้องใช้ unsafe-inline สำหรับ SSR
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "object-src 'none'",                              // ✅ เพิ่ม (แก้ No Fallback)
              "base-uri 'self'",                                // ✅ เพิ่ม (แก้ No Fallback)
              "form-action 'self'",                             // ✅ เพิ่ม (แก้ No Fallback)
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
            // 🔒 HSTS: บังคับ HTTPS (แก้ ZAP: Strict-Transport-Security Not Set)
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            // 🔒 Cache-Control: ป้องกัน cache ข้อมูล sensitive
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, private',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
        ],
      },
    ];
  },
};



export default nextConfig;

