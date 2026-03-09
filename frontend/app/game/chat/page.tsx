'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { chatData } from './data';
import { playSound } from '@/app/lib/sound';

// ข้อมูลสำหรับตกแต่งหน้าปกหมวดหมู่ให้สวยงาม
const categoryMeta = [
    { 
        id: 'callcenter', 
        title: 'แก๊งคอลเซ็นเตอร์', 
        desc: 'แอบอ้างหน่วยงาน ขู่ให้กลัว หลอกให้โอน', 
        icon: '📞', 
        bgGradient: 'from-orange-500 to-red-600',
        border: 'border-orange-500/50'
    },
    { 
        id: 'scam', 
        title: 'หลอกลงทุน & สแกมเมอร์', 
        desc: 'งานออนไลน์ปลอม หลอกให้รักแล้วเชือด', 
        icon: '💸', 
        bgGradient: 'from-pink-500 to-purple-600',
        border: 'border-pink-500/50'
    },
    { 
        id: 'phishing', 
        title: 'ฟิชชิ่ง & แอปดูดเงิน', 
        desc: 'ลิงก์อันตราย ไวรัส มัลแวร์แฝงตัว', 
        icon: '🔗', 
        bgGradient: 'from-blue-500 to-cyan-600',
        border: 'border-blue-500/50'
    }
];

// พื้นหลังภาพเลื่อน
const AnimatedBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-950">
        <div className="absolute inset-0 z-0 w-[200%] h-full animate-scroll-bg opacity-30">
            <div className="w-1/2 h-full bg-cover bg-center grayscale-[70%] opacity-60 bg-[url('/images/bg1.png')]"></div>
            <div className="w-1/2 h-full bg-cover bg-center grayscale-[70%] opacity-60 bg-[url('/images/bg1.png')]"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/95 z-10"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse-slow mix-blend-screen z-20"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse-slow delay-1000 mix-blend-screen z-20"></div>
    </div>
);

export default function ChatMenuPage() {
    const router = useRouter();
    const [progress, setProgress] = useState<Record<string, number>>({});
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    
    // ✅ เพิ่ม State สำหรับควบคุม Popup ด่านล็อค
    const [showLockedPopup, setShowLockedPopup] = useState(false);

    useEffect(() => {
        const savedProgress = JSON.parse(localStorage.getItem('sati_chat_progress') || '{}');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProgress(savedProgress);
    }, []);

    const getProgressStats = (categoryId: string) => {
        const total = chatData.filter(c => c.category === categoryId).length;
        const currentLevel = progress[categoryId] || 1;
        const completed = Math.min(currentLevel - 1, total); 
        return { completed, total };
    };

    const handleSelectChat = (id: string, isLocked: boolean) => {
        if (isLocked) {
            playSound('wrong');
            // ✅ เปลี่ยนจากการใช้ alert() เป็นการเปิด Popup แทน
            setShowLockedPopup(true);
            return;
        }
        playSound('click');
        router.push(`/game/chat/${id}`);
    };

    const handleBack = () => {
        playSound('click');
        if (selectedCategory) {
            setSelectedCategory(null);
        } else {
            router.push('/');
        }
    };

    const currentCategoryChats = chatData.filter(c => c.category === selectedCategory).sort((a, b) => a.level - b.level);
    const activeCategoryMeta = categoryMeta.find(c => c.id === selectedCategory);

    return (
        <div className="relative min-h-screen w-full flex justify-center items-center bg-slate-950 overflow-hidden font-sans">
            
            <AnimatedBackground />

            {/* 📱 Phone Frame */}
            <div className="relative z-20 w-[320px] h-[600px] md:w-[380px] md:h-[700px] border-[6px] md:border-[8px] border-gray-800 rounded-[40px] bg-[#0F172A] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] shrink-0">
                
                {/* Header */}
                <header className="bg-slate-900/90 backdrop-blur-xl p-4 md:p-5 border-b border-slate-800 flex items-center justify-between z-20 shrink-0 shadow-sm transition-all">
                    <button onClick={handleBack} className="text-2xl text-blue-500 hover:text-blue-400 transition-colors pl-1 cursor-pointer">
                        ‹
                    </button>
                    <h1 className="text-white font-black text-[16px] tracking-wider truncate px-2">
                        {selectedCategory ? activeCategoryMeta?.title : "กล่องข้อความ"}
                    </h1>
                    <div className="w-6"></div>
                </header>

                {/* พื้นที่แสดงผล */}
                <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden bg-[#0B1120]/90 pb-10 relative">
                    
                    {!selectedCategory && (
                        <div className="space-y-4 animate-fade-in">
                            <p className="text-gray-400 text-xs mb-2 pl-1 font-medium">เลือกรูปแบบภัยไซเบอร์เพื่อฝึกรับมือ</p>
                            
                            {categoryMeta.map((cat) => {
                                const stats = getProgressStats(cat.id);
                                const isAllCleared = stats.completed === stats.total;

                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => { playSound('click'); setSelectedCategory(cat.id); }}
                                        className={`w-full group text-left relative overflow-hidden rounded-[1.5rem] border bg-slate-800/80 hover:bg-slate-800 transition-all duration-300 shadow-md ${cat.border} hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] active:scale-[0.98] p-4 flex items-center gap-4`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.bgGradient} flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:scale-110 transition-transform`}>
                                            {cat.icon}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-white font-bold text-[15px] mb-1 truncate">{cat.title}</h2>
                                            <p className="text-gray-400 text-[11px] truncate">{cat.desc}</p>
                                            
                                            <div className="mt-3 flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-500 ${isAllCleared ? 'bg-green-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-[10px] font-bold ${isAllCleared ? 'text-green-400' : 'text-blue-400'}`}>
                                                    {stats.completed}/{stats.total}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {selectedCategory && (
                        <div className="space-y-2 animate-fade-in-up">
                            {currentCategoryChats.map((chat) => {
                                const currentLevelAllowed = progress[selectedCategory] || 1;
                                const isLocked = chat.level > currentLevelAllowed;
                                const isCompleted = chat.level < currentLevelAllowed;

                                return (
                                    <button
                                        key={chat.id}
                                        onClick={() => handleSelectChat(chat.id, isLocked)}
                                        className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left group relative border ${
                                            isLocked 
                                            ? 'opacity-50 grayscale cursor-not-allowed bg-slate-900/50 border-slate-800' 
                                            : 'hover:bg-slate-800 bg-slate-800/80 border-slate-700/50 hover:border-blue-500/50 shadow-md'
                                        }`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl md:text-3xl shadow-inner group-hover:scale-105 transition-transform">
                                                {isLocked ? "🔒" : chat.avatar}
                                            </div>
                                            {!isLocked && !isCompleted && (
                                                <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-slate-900 rounded-full animate-pulse"></div>
                                            )}
                                            {isCompleted && (
                                                <div className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-green-500 border-2 border-slate-900 rounded-full flex items-center justify-center text-[9px] text-white font-bold">✓</div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 pr-1">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <h3 className={`font-bold text-[14px] md:text-[15px] truncate pr-2 ${isLocked ? 'text-gray-500' : 'text-gray-100 group-hover:text-white'}`}>
                                                    {isLocked ? `ด่านที่ ${chat.level} (ล็อก)` : chat.name}
                                                </h3>
                                            </div>
                                            <p className={`text-[12px] md:text-[13px] truncate font-medium ${isLocked ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                                {isLocked ? "ผ่านด่านก่อนหน้าเพื่อปลดล็อก" : chat.msgs[0]}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ✨ POPUP แจ้งเตือนด่านยังไม่ปลดล็อค ✨ */}
            {showLockedPopup && (
                <div className="fixed inset-0 z-[100] flex flex-col justify-center items-center text-center p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
                    <div className="relative overflow-hidden p-8 rounded-[2.5rem] border border-slate-700 bg-slate-900 max-w-[320px] w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all scale-100">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 blur-[60px] rounded-full pointer-events-none bg-orange-600/20"></div>
                        
                        <div className="relative z-10">
                            <div className="text-6xl mb-4 drop-shadow-xl animate-bounce">🔒</div>
                            <h2 className="text-2xl font-black mb-3 text-white">ด่านนี้ยังถูกล็อค!</h2>
                            <p className="text-gray-400 text-[14px] font-medium leading-relaxed mb-6">
                                คุณต้องผ่านด่านก่อนหน้าในหมวดหมู่นี้<br/>ให้สำเร็จเสียก่อน ถึงจะเข้าเล่นได้
                            </p>
                            
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => { playSound('click'); setShowLockedPopup(false); }}
                                    className="w-full py-3.5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.4)] transition-all active:scale-95"
                                >
                                    ตกลง เข้าใจแล้ว
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
}