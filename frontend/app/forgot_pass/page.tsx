'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', phone: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingFields = [];
    if (!formData.username.trim()) missingFields.push('ชื่อผู้ใช้');
    if (!formData.phone.trim()) missingFields.push('เบอร์โทรศัพท์');
    if (!formData.newPassword.trim()) missingFields.push('รหัสผ่านใหม่');

    if (missingFields.length > 0) {
      if (missingFields.length > 1) {
        setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      } else {
        setError(`กรุณากรอก${missingFields[0]}`);
      }
      return;
    }

    // Additional validations
    if (formData.phone.length < 10) {
      setError('เบอร์โทรศัพท์ต้องมี 10 หลัก');
      return;
    }

    if (formData.newPassword.length < 4) {
      setError('รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    // ✅ เช็ค URL ให้ชัวร์ (ถ้า Backend มี /api ต้องใส่ด้วย)
    // ✅ Auto-detect Environment
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      apiUrl = 'http://localhost:4000';
    }

    //const apiUrl = 'http://localhost:4000';
    try {
      const res = await fetch(`${apiUrl}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // ✅ อ่านเป็น Text ก่อน เพื่อกัน Error JSON
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Server Response (Non-JSON):", text);
        throw new Error(`Server Error (${res.status}): API ไม่ถูกต้อง หรือ URL ผิด`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
      }

      setSuccess('เปลี่ยนรหัสผ่านเรียบร้อย! กำลังไปหน้า Login...');

      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: unknown) {
      console.error("Reset Password Error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('เชื่อมต่อ Server ไม่ได้');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative w-screen h-screen flex items-center justify-center p-4 bg-slate-900 font-sans overflow-hidden">

      {/* Background Theme */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900 via-slate-900 to-black"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-orange-600/20 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">🔑</div>
          <h1 className="text-3xl font-black text-white uppercase tracking-widest">ลืมรหัสผ่าน?</h1>
          <p className="text-red-300 text-sm mt-2">กรอกข้อมูลเพื่อตั้งรหัสผ่านใหม่</p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username"
              className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all placeholder:text-gray-500"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div>
            <input
              type="tel"
              maxLength={10}
              placeholder="Phone Number (เบอร์โทรศัพท์)"
              className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all placeholder:text-gray-500"
              value={formData.phone}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) {
                  setFormData({ ...formData, phone: val });
                }
              }}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all placeholder:text-gray-500"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center font-bold animate-pulse whitespace-pre-wrap leading-relaxed">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm text-center font-bold animate-pulse whitespace-pre-wrap leading-relaxed">
              ✅ {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-lg uppercase tracking-widest hover:shadow-[0_0_20px_rgba(234,88,12,0.5)] transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'กำลังตรวจสอบ...' : 'ตั้งรหัสผ่านใหม่'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            กลับไปที่หน้า{' '}
            <Link
              href="/login"
              className="text-red-400 font-bold hover:text-red-300 hover:underline transition-all"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}