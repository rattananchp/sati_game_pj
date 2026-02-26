'use client';
/// <reference path="../../src/global.d.ts" />

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { playSound } from '@/app/lib/sound';

// 1. Interfaces
interface UserData {
    uid?: number;
    id?: number;
    username: string;
    // emoji?: string; // ❌ ลบออก
    password?: string;
}

interface GameStats {
    normal: number;
    virus: number;
    chat: number;
}

// 2. Icons
const Icons = {
    User: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    UserBig: () => <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    Lock: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    LogOut: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>,
    Home: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    Trophy: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>,
    Zap: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    Message: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>,
    Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
};

export default function ProfilePage() {
    const router = useRouter();

    const [user, setUser] = useState<UserData | null>(null);
    const [stats, setStats] = useState<GameStats>({ normal: 0, virus: 0, chat: 0 });
    const [isLoaded, setIsLoaded] = useState(false);
    const [editMode, setEditMode] = useState<'none' | 'info' | 'password'>('none');
    const [isLoading, setIsLoading] = useState(false);

    const [tempUsername, setTempUsername] = useState('');

    // Password States
    const [currentPasswordInput, setCurrentPasswordInput] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Inline Message State
    const [message, setMessageState] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

    const setMessage = (text: string, type: 'error' | 'success' = 'error') => {
        setMessageState({ text, type });
        setTimeout(() => setMessageState(null), 4000);
    };

    // Fetch Stats
    const fetchGameStats = async (userId: number) => {
        try {
            // ✅ Auto-detect Environment
            let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
                apiUrl = 'http://localhost:4000';
            }

            // apiUrl = 'http://localhost:4000';
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/scores/stats?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setStats({
                    normal: data.quiz || 0,
                    virus: data.virus || 0,
                    chat: data.chat || 0
                });
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            const storedUserStr = localStorage.getItem('user');

            if (storedUserStr) {
                const userData = JSON.parse(storedUserStr);
                setUser(userData);
                setTempUsername(userData.username);

                const uid = userData.uid || userData.id;
                if (uid) fetchGameStats(uid);
            } else {
                router.push('/login');
            }

            setIsLoaded(true);
        }, 0);
        return () => clearTimeout(timer);
    }, [router]);

    // 🔥🔥🔥 แก้ไข: บันทึกชื่อลง Database 🔥🔥🔥
    const handleSaveInfo = async () => {
        playSound('click');
        if (!user) return;
        if (!tempUsername.trim()) {
            setMessage('กรุณาระบุชื่อผู้ใช้งาน');
            return;
        }

        setIsLoading(true);
        try {
            // ✅ Auto-detect Environment
            let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
                apiUrl = 'http://localhost:4000';
            }

            const token = localStorage.getItem('token');
            // 1. ส่งข้อมูลไปอัปเดตที่ Backend
            const res = await fetch(`${apiUrl}/user/update-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.uid || user.id,
                    username: tempUsername
                })
            });

            if (res.ok) {
                // 2. ถ้าสำเร็จ อัปเดต LocalStorage และ State
                const updatedUser = { ...user, username: tempUsername };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setMessage('บันทึกข้อมูลเรียบร้อย ✅', 'success');
                setTimeout(() => setEditMode('none'), 1500);
            } else {
                setMessage('ไม่สามารถอัปเดตข้อมูลได้');
            }
        } catch (error) {
            console.error(error);
            setMessage('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        } finally {
            setIsLoading(false);
        }
    };

    // 🔥🔥🔥 บันทึกรหัสผ่านลง Database 🔥🔥🔥
    const handleSavePassword = async () => {
        playSound('click');
        if (!user) return;

        if (!currentPasswordInput) {
            setMessage('กรุณากรอกรหัสผ่านปัจจุบัน');
            return;
        }
        if (!newPassword || !confirmPassword) {
            setMessage('กรุณากรอกรหัสผ่านใหม่และยืนยันรหัสผ่านใหม่');
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage('รหัสผ่านใหม่ไม่ตรงกัน!');
            return;
        }
        if (newPassword.length < 4) {
            setMessage('รหัสผ่านใหม่สั้นเกินไป (ต้อง 4 ตัวขึ้นไป)!');
            return;
        }
        if (currentPasswordInput === newPassword) {
            setMessage('รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม!');
            return;
        }
        // เช็คค่า
        const payload = {
            userId: user.uid || user.id,
            currentPassword: currentPasswordInput,
            newPassword: newPassword
        };
        console.log("ข้อมูลที่จะส่งไป Backend:", payload);

        // ถ้า userId เป็น undefined ให้แจ้งเตือน
        if (!payload.userId) {
            setMessage('ไม่พบ User ID กรุณาล็อกอินใหม่');
            return;
        }

        setIsLoading(true);

        try {
            // ✅ Auto-detect Environment
            let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
                apiUrl = 'http://localhost:4000';
            }
            //const apiUrl = 'http://localhost:4000';
            const token = localStorage.getItem('token');

            const res = await fetch(`${apiUrl}/user/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // body: JSON.stringify({
                //     userId: user.uid || user.id,
                //     currentPassword: currentPasswordInput,
                //     newPassword: newPassword
                // })
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                const updatedUser = { ...user, password: newPassword };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                setCurrentPasswordInput('');
                setNewPassword('');
                setConfirmPassword('');
                setMessage('เปลี่ยนรหัสผ่านสำเร็จ! ✅', 'success');
                setTimeout(() => setEditMode('none'), 1500);
            } else {
                setMessage(data.error || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
            }

        } catch (error) {
            console.error("Change password error:", error);
            setMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        playSound('click');
        if (confirm('ยืนยันการออกจากระบบ?')) {
            localStorage.removeItem('user');
            router.push('/login');
        }
    };

    if (!isLoaded) return <div className="min-h-screen bg-slate-950" />;

    return (
        <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 font-sans text-slate-200 overflow-hidden">

            {/* Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-slate-950"></div>
                <div className="absolute inset-0 z-0 w-[200%] h-full animate-scroll-bg opacity-40">
                    <div className="w-1/2 h-full bg-cover bg-center grayscale-[50%] bg-[url('/images/bg1.png')]"></div>
                    <div className="w-1/2 h-full bg-cover bg-center grayscale-[50%] bg-[url('/images/bg1.png')]"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/90 z-10"></div>
            </div>

            <div className="relative z-30 w-full max-w-md animate-fade-in-up">
                <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80"></div>

                    <div className="p-6 md:p-8 flex flex-col items-center gap-6 relative z-10">

                        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 uppercase tracking-widest drop-shadow-sm">
                            โปรไฟล์
                        </h1>

                        {/* --- 1. Avatar Section (Updated to match Home Page Button) --- */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition duration-500 animate-pulse-slow"></div>

                            {/* Circle Container */}
                            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 shadow-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">

                                {/* Initials Text */}
                                <span className="text-5xl md:text-6xl font-black text-white select-none drop-shadow-md">
                                    {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
                                </span>

                                {/* Inner Shine */}
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-full pointer-events-none"></div>

                                {/* Status Dot */}
                                <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-slate-900 rounded-full shadow-lg"></div>
                            </div>
                        </div>

                        {/* --- 2. Stats & Name View --- */}
                        {editMode === 'none' && user && (
                            <div className="w-full text-center animate-fade-in space-y-6">
                                <div className="space-y-1">
                                    <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight drop-shadow-sm truncate px-4">
                                        {user.username}
                                    </h2>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-3 w-full">
                                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-green-500/10 to-transparent border border-green-500/20 relative group hover:bg-green-500/5 transition-all">
                                        <div className="text-green-400 mb-1 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">
                                            <Icons.Trophy />
                                        </div>
                                        <div className="text-[10px] text-green-200/80 font-bold tracking-wider">ตอบคำถาม</div>
                                        <div className="text-xl font-black text-white">{stats.normal} <span className="text-[9px] font-normal text-gray-400">ครั้ง</span></div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-red-500/10 to-transparent border border-red-500/20 relative group hover:bg-red-500/5 transition-all">
                                        <div className="text-red-400 mb-1 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]">
                                            <Icons.Zap />
                                        </div>
                                        <div className="text-[10px] text-red-200/80 font-bold tracking-wider">ทุบไวรัส</div>
                                        <div className="text-xl font-black text-white">{stats.virus} <span className="text-[9px] font-normal text-gray-400">ครั้ง</span></div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20 relative group hover:bg-blue-500/5 transition-all">
                                        <div className="text-blue-400 mb-1 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">
                                            <Icons.Message />
                                        </div>
                                        <div className="text-[10px] text-blue-200/80 font-bold tracking-wider">แชทปั่น</div>
                                        <div className="text-xl font-black text-white">{stats.chat} <span className="text-[9px] font-normal text-gray-400">ครั้ง</span></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- 3. Edit Name Form (เอา Emoji ออก) --- */}
                        {editMode === 'info' && (
                            <div className="w-full space-y-5 animate-slide-up text-left bg-white/5 p-4 rounded-2xl border border-white/5">
                                {message && (
                                    <div className={`p-3 rounded-xl text-sm font-bold text-center animate-fade-in ${message.type === 'error'
                                        ? 'bg-red-500/15 border border-red-500/30 text-red-300'
                                        : 'bg-green-500/15 border border-green-500/30 text-green-300'
                                        }`}>
                                        {message.type === 'error' ? '⚠️' : '✅'} {message.text}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-300 ml-1">เปลี่ยนชื่อที่ใช้แสดง</label>
                                    <input
                                        type="text"
                                        value={tempUsername}
                                        onChange={(e) => setTempUsername(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 text-white p-3 rounded-xl outline-none focus:ring-2 ring-purple-500/20 transition-all placeholder:text-gray-600"
                                    />
                                </div>
                                <button
                                    onClick={handleSaveInfo}
                                    disabled={isLoading}
                                    className={`w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? 'กำลังบันทึก...' : <><Icons.Check /> บันทึกการเปลี่ยนแปลง</>}
                                </button>
                            </div>
                        )}

                        {/* --- 4. Edit Password Form --- */}
                        {editMode === 'password' && (
                            <div className="w-full space-y-4 animate-slide-up text-left bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs text-center flex items-center justify-center gap-2">
                                    <Icons.Lock /> ยืนยันรหัสเดิมก่อนตั้งใหม่
                                </div>
                                {message && (
                                    <div className={`p-3 rounded-xl text-sm font-bold text-center animate-fade-in ${message.type === 'error'
                                        ? 'bg-red-500/15 border border-red-500/30 text-red-300'
                                        : 'bg-green-500/15 border border-green-500/30 text-green-300'
                                        }`}>
                                        {message.type === 'error' ? '⚠️' : '✅'} {message.text}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div>
                                        <input
                                            type="password"
                                            placeholder="รหัสผ่านปัจจุบัน"
                                            value={currentPasswordInput}
                                            onChange={(e) => setCurrentPasswordInput(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 focus:border-amber-500/50 text-white p-3 rounded-xl outline-none focus:ring-2 ring-amber-500/20 transition-all placeholder:text-gray-500 text-sm"
                                        />
                                    </div>
                                    <div className="h-px bg-white/10 mx-2"></div>
                                    <div className="space-y-2">
                                        <input
                                            type="password"
                                            placeholder="รหัสผ่านใหม่"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 focus:border-red-500/50 text-white p-3 rounded-xl outline-none focus:ring-2 ring-red-500/20 transition-all placeholder:text-gray-500 text-sm"
                                        />
                                        <input
                                            type="password"
                                            placeholder="ยืนยันรหัสผ่านใหม่"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 focus:border-red-500/50 text-white p-3 rounded-xl outline-none focus:ring-2 ring-red-500/20 transition-all placeholder:text-gray-500 text-sm"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleSavePassword}
                                    disabled={isLoading}
                                    className={`w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? 'กำลังบันทึก...' : <><Icons.Check /> อัปเดตรหัสผ่าน</>}
                                </button>
                            </div>
                        )}

                        {/* --- 5. Menu List Buttons --- */}
                        <div className="w-full flex flex-col gap-2 pt-2">
                            {editMode === 'none' ? (
                                <>
                                    <button onClick={() => { setEditMode('info'); setMessageState(null); }} className="group w-full p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all flex items-center justify-between active:scale-[0.98]">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                                                <Icons.User />
                                            </div>
                                            <span className="font-bold text-sm text-gray-200 group-hover:text-white">เปลี่ยนชื่อ</span>
                                        </div>
                                        <div className="text-gray-500 group-hover:text-white transition-colors"><Icons.ChevronRight /></div>
                                    </button>

                                    <button onClick={() => { setEditMode('password'); setMessageState(null); }} className="group w-full p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all flex items-center justify-between active:scale-[0.98]">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-300">
                                                <Icons.Lock />
                                            </div>
                                            <span className="font-bold text-sm text-gray-200 group-hover:text-white">เปลี่ยนรหัสผ่าน</span>
                                        </div>
                                        <div className="text-gray-500 group-hover:text-white transition-colors"><Icons.ChevronRight /></div>
                                    </button>

                                    <button onClick={() => router.push('/')} className="group w-full p-3.5 mt-2 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg">
                                        <span className="text-gray-300 group-hover:text-white font-bold text-sm"><Icons.Home /></span>
                                        <span className="font-bold text-sm text-gray-300 group-hover:text-white">กลับสู่เมนูหลัก</span>
                                    </button>

                                    <button onClick={handleLogout} className="w-full py-2 mt-2 text-xs text-red-400/70 hover:text-red-400 font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                        <Icons.LogOut /> ออกจากระบบ
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => { setEditMode('none'); setMessageState(null); }}
                                    className="w-full py-3 text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-white flex justify-center items-center gap-2 transition-all bg-white/5 rounded-xl hover:bg-white/10"
                                >
                                    <span>✕</span> ยกเลิกการแก้ไข
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}