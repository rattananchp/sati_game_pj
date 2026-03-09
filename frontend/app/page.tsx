'use client';
/// <reference path="../src/global.d.ts" />

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSound } from '@/context/SoundContext';
import Image from 'next/image';

// 1. Interface
interface UserData {
  username: string;
  emoji?: string;
  role?: string;
}

interface GameStats {
  normal: number;
  virus: number;
  chat: number;
}

// 2. Icons
// ✅ เพิ่มไอคอน BackArrow ลงในนี้
const Icons = {
  BackArrow: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
};

export default function HomePage() {
  const router = useRouter();
  const { isMuted, toggleMute, playSound } = useSound();
  const [view, setView] = useState<'home' | 'bet'>('home');

  const menuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<GameStats>({ normal: 0, virus: 0, chat: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuExpanded, setIsMobileMenuExpanded] = useState(false);

  // Logic Click Outside สำหรับ Profile Menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuExpanded && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuExpanded]);

  // โหลดข้อมูล User 
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const savedStatsStr = localStorage.getItem('cyberStakes_played');
        const storedUserStr = localStorage.getItem('user');
        const savedStats = savedStatsStr ? JSON.parse(savedStatsStr) : {};
        const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;

        setStats({
          normal: savedStats.normal || 0,
          virus: savedStats.virus || 0,
          chat: savedStats.chat || 0
        });

        if (storedUser) {
          setUser(storedUser);
        }

        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading localStorage:", error);
        setIsLoaded(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    playSound('click');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const handleLogoutConfirm = () => {
    if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      handleLogout();
    }
  }

  const handleStart = (mode: string) => {
    playSound('click');
    if (!user) {
      router.push('/login');
      return;
    }
    if (mode === 'normal') setView('bet');
    else if (mode === 'virus') router.push('/game/virus');
    else if (mode === 'chat') router.push('/game/chat');
  };

  const selectDifficulty = (diff: string) => {
    playSound('click');
    window.location.href = `/game/quiz?diff=${diff}`;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuExpanded(!isMobileMenuExpanded);
    playSound('click');
  };

  return (
    <main className="relative w-screen min-h-screen flex flex-col items-center justify-start md:justify-center p-4 pt-20 pb-24 overflow-x-hidden overflow-y-auto bg-slate-900 font-sans">

      {/* ==================== ✨ พื้นหลัง ✨ ==================== */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0 w-[200%] h-full animate-scroll-bg opacity-40">
          <div className="w-1/2 h-full bg-cover bg-center grayscale-[50%] bg-[url('/images/bg1.png')]"></div>
          <div className="w-1/2 h-full bg-cover bg-center grayscale-[50%] bg-[url('/images/bg1.png')]"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/90 z-10"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse-slow mix-blend-screen z-20"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse-slow delay-1000 mix-blend-screen z-20"></div>
      </div>

      {/* ==================== 🔊 Mute Button (Top Left) ==================== */}
      <button
        onClick={toggleMute}
        className="fixed top-6 left-6 z-50 p-3 md:p-4 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl hover:scale-110 hover:bg-white/20 transition-all duration-300 active:scale-95 group"
        title={isMuted ? "เปิดเสียง" : "ปิดเสียง"}
      >
        <span className="text-xl md:text-2xl group-hover:rotate-12 transition-transform block">{isMuted ? '🔇' : '🔊'}</span>
      </button>

      {/* ==================== 👤 User Menu Bar (Top Right) ==================== */}
      {isLoaded && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in flex flex-col items-end gap-2">

          {/* --- Profile Capsule (Expandable) --- */}
          {user ? (
            <div
              ref={menuRef}
              className={`
                        flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-1.5 shadow-2xl 
                        transition-all duration-300 ease-out overflow-hidden cursor-pointer
                        ${isMobileMenuExpanded ? 'max-w-[300px]' : 'max-w-[54px]'} md:max-w-[400px]
                        ${isMobileMenuExpanded ? 'w-auto' : 'w-[54px]'} md:w-auto
                    `}
            >
              {/* Avatar (Click to toggle) */}
              <button
                onClick={toggleMobileMenu}
                className="relative flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xl shadow-inner group hover:scale-105 transition-transform"
              >
                {user.emoji ? user.emoji : (user.username ? user.username.charAt(0).toUpperCase() : 'U')}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
              </button>

              {/* Expanded Details */}
              <div className={`
                      flex items-center overflow-hidden transition-all duration-300 whitespace-nowrap
                      ${isMobileMenuExpanded ? 'opacity-100 ml-3' : 'opacity-0 ml-0 w-0'} 
                      md:opacity-100 md:ml-3 md:w-auto
                  `}>
                <button
                  onClick={() => { playSound('click'); router.push('/profile'); }}
                  className="flex flex-col text-left mr-3 hover:opacity-80 transition-opacity min-w-[80px]"
                >
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">โปรไฟล์</span>
                  <span className="text-sm font-black text-white leading-none truncate max-w-[150px] md:max-w-[200px]">{user.username}</span>
                </button>

                <div className="w-px h-8 bg-white/20 mx-1 flex-shrink-0"></div>

                <button
                  onClick={handleLogout}
                  className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full text-red-400 hover:text-white hover:bg-red-500/80 transition-all duration-300"
                  title="ออกจากระบบ"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] transition-all transform hover:-translate-y-0.5"
            >
              <span>เข้าสู่ระบบเพื่อเล่น</span>
            </button>
          )}

        </div>
      )}

      {/* ==================== 🏆 Leaderboard Floating Button (Bottom Right) ==================== */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-spring ${user ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <button
          onClick={() => {
            playSound('click');
            router.push('/game/leaderboard');
          }}
          className="group relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl shadow-[0_8px_30px_rgba(234,179,8,0.4)] border-2 border-yellow-200/50 hover:scale-110 hover:-rotate-3 hover:shadow-[0_20px_40px_rgba(234,179,8,0.6)] transition-all duration-300 active:scale-95"
        >
          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-3xl md:text-4xl drop-shadow-md group-hover:animate-bounce">🏆</span>

          {/* Tooltip Label */}
          <div className="absolute bottom-full right-0 mb-3 px-3 py-1 bg-black/80 backdrop-blur text-yellow-400 text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none border border-yellow-500/30">
            อันดับยอดฝีมือ
          </div>
        </button>
      </div>

      {/* ==================== 🛠️ Admin Dashboard Button (Bottom Left) ==================== */}
      {user?.role === 'admin' && (
        <div className="fixed bottom-6 left-6 z-50 animate-fade-in">
          <button
            onClick={() => {
              playSound('click');
              router.push('/admin');
            }}
            className="group relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl shadow-xl border border-white/20 hover:scale-110 hover:border-purple-500/50 transition-all duration-300 active:scale-95"
            title="จัดการระบบ (Admin)"
          >
            <span className="text-2xl md:text-3xl grayscale group-hover:grayscale-0 transition-all">⚙️</span>

            {/* Badge */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </button>
        </div>
      )}


      {/* --- VIEW 1: HOME MENU --- */}
      {view === 'home' && (
        <div className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-4 sm:p-6 pb-6 sm:pb-8 animate-fade-in z-10 shadow-[0_0_80px_rgba(0,0,0,0.5)] group/card my-auto">

          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent opacity-70"></div>

          {/* ส่วน Mascot/Logo */}
          <div className="flex flex-col items-center relative z-54 mb-2">
            <div className="relative w-full h-[150px] sm:h-[200px] md:h-[270px] scale-105 sm:scale-110 md:scale-125 drop-shadow-[0_0_40px_rgba(167,139,250,0.5)] transition-transform duration-700 hover:scale-[1.35] pointer-events-none">
              <Image
                src="/images/Model02.gif"
                alt="SATI Digital Mascot"
                fill
                className="object-contain object-center"
                priority
                unoptimized
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:gap-3 relative z-30">

            {/* ปุ่ม 1: ตอบคำถาม */}
            <button onClick={() => handleStart('normal')} className={`relative group w-full p-3 rounded-xl border transition-all duration-300 overflow-hidden ${!user ? 'bg-white/5 border-white/5 opacity-70 hover:opacity-100 hover:border-white/20' : 'bg-white/5 border-white/10 hover:border-green-400/50 hover:shadow-[0_0_20px_rgba(74,222,128,0.2)]'}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-transform duration-300 ${!user ? 'bg-gray-700 text-gray-400 grayscale' : 'bg-green-500/20 border border-green-500/30 text-green-300 group-hover:scale-110'}`}>
                  {!user ? '🔒' : '🧠'}
                </div>
                <div className="text-left flex-1">
                  <div className={`font-bold text-lg transition-colors ${!user ? 'text-gray-400' : 'text-white group-hover:text-green-300'}`}>
                    ตอบคำถามวัดกึ๋น
                  </div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1 group-hover:text-gray-200">
                    {!user ? <span className="text-amber-400 font-bold">ต้องเข้าสู่ระบบก่อน</span> : <span>คำถาม 4 ตัวเลือก</span>}
                  </div>
                </div>
                <div className="text-green-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 font-bold text-xl">→</div>
              </div>
            </button>

            {/* ปุ่ม 2: ทุบไวรัส */}
            <button onClick={() => handleStart('virus')} className={`relative group w-full p-3 rounded-xl border transition-all duration-300 overflow-hidden ${!user ? 'bg-white/5 border-white/5 opacity-70 hover:opacity-100 hover:border-white/20' : 'bg-white/5 border-white/10 hover:border-red-400/50 hover:shadow-[0_0_20px_rgba(248,113,113,0.2)]'}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-transform duration-300 ${!user ? 'bg-gray-700 text-gray-400 grayscale' : 'bg-red-500/20 border border-red-500/30 text-red-300 group-hover:scale-110'}`}>
                  {!user ? '🔒' : '🔨'}
                </div>
                <div className="text-left flex-1">
                  <div className={`font-bold text-lg transition-colors ${!user ? 'text-gray-400' : 'text-white group-hover:text-red-300'}`}>
                    ทุบไวรัสวัดนิ้ว
                  </div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1 group-hover:text-gray-200">
                    {!user ? <span className="text-amber-400 font-bold">ต้องเข้าสู่ระบบก่อน</span> : <span>โหมดแอคชั่น: <span className="text-red-400 font-bold">มันส์มาก!</span></span>}
                  </div>
                </div>
                <div className="text-red-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 font-bold text-xl">→</div>
              </div>
            </button>

            {/* ปุ่ม 3: แชท */}
            <button onClick={() => handleStart('chat')} className={`relative group w-full p-3 rounded-xl border transition-all duration-300 overflow-hidden ${!user ? 'bg-white/5 border-white/5 opacity-70 hover:opacity-100 hover:border-white/20' : 'bg-white/5 border-white/10 hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(96,165,250,0.2)]'}`}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-transform duration-300 ${!user ? 'bg-gray-700 text-gray-400 grayscale' : 'bg-blue-500/20 border border-blue-500/30 text-blue-300 group-hover:scale-110'}`}>
                  {!user ? '🔒' : '💬'}
                </div>
                <div className="text-left flex-1">
                  <div className={`font-bold text-lg transition-colors ${!user ? 'text-gray-400' : 'text-white group-hover:text-blue-300'}`}>
                    แชทปั่นแก๊งคอล
                  </div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1 group-hover:text-gray-200">
                    {!user ? <span className="text-amber-400 font-bold">ต้องเข้าสู่ระบบก่อน</span> : <span>สถานะการหลอกลวง</span>}
                  </div>
                </div>
                <div className="text-blue-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 font-bold text-xl">→</div>
              </div>
            </button>

          </div>
        </div>
      )}

      {/* --- VIEW 2: DIFFICULTY SELECTOR --- */}
      {view === 'bet' && (
        <div className="relative w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/15 rounded-[2rem] p-8 animate-fade-in z-10 shadow-[0_0_60px_rgba(0,0,0,0.4)]">

          {/* ✨ เปลี่ยนเป็นปุ่มลูกศรวงกลม ✨ */}
          <button
            onClick={() => { playSound('click'); setView('home'); }}
            className="absolute top-6 left-6 p-2 rounded-full bg-transparent hover:bg-white/10 text-gray-400 hover:text-white transition-all active:scale-95 z-20"
            title="กลับหน้าหลัก"
          >
            <Icons.BackArrow />
          </button>

          <div className="text-center mb-8 mt-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-1">เลือกความตึง</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto rounded-full"></div>
          </div>

          <div className="flex flex-col gap-4">
            <button onClick={() => selectDifficulty('easy')} className="relative group w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-green-900/20 hover:border-green-400/30 transition-all duration-300 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-4">
                <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all duration-300 scale-90 group-hover:scale-110">👶</span>
                <div className="text-left">
                  <div className="font-bold text-white text-lg group-hover:text-green-300 transition-colors">อนุบาลหัดเดิน</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide group-hover:text-gray-200">เวลา 20 วิ • ชิลๆ เหมือนเดินห้าง</div>
                </div>
              </div>
            </button>
            <button onClick={() => selectDifficulty('medium')} className="relative group w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-yellow-900/20 hover:border-yellow-400/30 transition-all duration-300 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-4">
                <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all duration-300 scale-90 group-hover:scale-110">🧑‍🦱</span>
                <div className="text-left">
                  <div className="font-bold text-white text-lg group-hover:text-yellow-300 transition-colors">มนุษย์เดินดิน</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide group-hover:text-gray-200">เวลา 15 วิ • เริ่มตึงนิดๆ</div>
                </div>
              </div>
            </button>
            <button onClick={() => selectDifficulty('hard')} className="relative group w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-red-900/20 hover:border-red-400/30 transition-all duration-300 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-4">
                <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all duration-300 scale-90 group-hover:scale-110 animate-pulse">⚡</span>
                <div className="text-left">
                  <div className="font-bold text-white text-lg group-hover:text-red-300 transition-colors">เทพเจ้าสายฟ้า</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide group-hover:text-gray-200">เวลา 10 วิ • กระพริบตาคือตุย</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}