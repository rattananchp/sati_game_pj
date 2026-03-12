'use client';
import { ViewState } from './types';
import { useRouter } from 'next/navigation';

interface SidebarProps {
    currentView: ViewState;
    setCurrentView: (view: ViewState) => void;
    userRole?: string;
}

export default function Sidebar({ currentView, setCurrentView, userRole = 'admin' }: SidebarProps) {
    const router = useRouter();
    const isEditor = userRole === 'editor';

    return (
        // ✅ 1. ใช้ h-screen (เต็มจอ 100vh), sticky top-0 (ล็อกติดขอบบน) และ bg-slate-950 (พื้นหลังสีทึบสนิท)
        <div className="w-20 md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 left-0 z-50 shadow-2xl">
            
            {/* --- ส่วนหัว (Profile) --- */}
            <div>
                <div className="h-28 md:h-32 flex flex-col items-center justify-center border-b border-slate-800 bg-slate-900/50 pt-4">
                    <div className="relative">
                        <span className="text-3xl md:text-4xl filter drop-shadow-lg no-select">
                            {isEditor ? '📝' : '🛡️'}
                        </span>
                        <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-slate-950 rounded-full ${isEditor ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                    </div>
                    <div className="hidden md:flex flex-col items-center mt-2">
                        <span className={`font-black tracking-widest text-lg leading-none ${isEditor ? 'text-blue-400' : 'text-green-400'}`}>
                            {isEditor ? 'EDITOR' : 'ADMIN'}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                            {isEditor ? 'ผู้ช่วยจัดการข้อมูล' : 'ผู้ดูแลระบบสูงสุด'}
                        </span>
                    </div>
                </div>

                {/* --- ส่วนเมนู (Navigation) --- */}
                {/* ✅ 2. คำนวณความสูงที่เหลือของจอเพื่อไม่ให้เมนูล้นทะลุปุ่มออกจากระบบ */}
                <nav className="p-4 space-y-2 mt-2 overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
                    <MenuButton id="dashboard" icon="📊" label="สถิติภาพรวม" currentView={currentView} setCurrentView={setCurrentView} />
                    <MenuButton id="quiz_manage" icon="📝" label="จัดการข้อสอบ" currentView={currentView} setCurrentView={setCurrentView} />
                    <MenuButton id="chat_manage" icon="💬" label="จัดการเกมแชท" currentView={currentView} setCurrentView={setCurrentView} />
                    <MenuButton id="virus_manage" icon="🦠" label="จัดการไวรัส" currentView={currentView} setCurrentView={setCurrentView} />
                    <MenuButton id="users" icon="👥" label="จัดการผู้เล่น" currentView={currentView} setCurrentView={setCurrentView} />
                    <div className="pt-4 pb-2">
                        <div className="h-px bg-slate-800 mx-2"></div>
                    </div>
                    
                    {/* <MenuButton id="add_question" icon="➕" label="สร้างโจทย์ใหม่" currentView={currentView} setCurrentView={setCurrentView} /> */}
                </nav>
            </div>

            {/* --- ส่วนปุ่มออกจากระบบ (ด้านล่างสุด) --- */}
            {/* ✅ 3. ส่วนนี้จะถูกดันลงมาล่างสุดเสมอเพราะเราใช้ flex-col และ justify-between ที่ตัวคลุมด้านบน */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/30">
                <button 
                    onClick={() => router.push('/')} 
                    className="w-full flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/30 text-red-400 hover:text-red-300 transition-all group"
                >
                    <span className="group-hover:scale-110 transition-transform">🚪</span>
                    <span className="hidden md:block font-bold text-sm">ออกจากระบบ</span>
                </button>
            </div>
            
        </div>
    );
}

// Component สำหรับปุ่มเมนู
const MenuButton = ({ id, icon, label, currentView, setCurrentView }: { id: ViewState, icon: string, label: string, currentView: ViewState, setCurrentView: (v: ViewState) => void }) => (
    <button
        onClick={() => setCurrentView(id)}
        className={`w-full flex items-center justify-center md:justify-start gap-4 p-3.5 rounded-xl transition-all duration-300 outline-none font-medium text-sm
        ${currentView === id
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] translate-x-1 border border-indigo-500/50'
                : 'text-gray-400 hover:bg-slate-800 hover:text-white hover:translate-x-1 border border-transparent'}`}
    >
        <span className="text-xl filter drop-shadow-sm">{icon}</span>
        <span className="hidden md:block tracking-wide">{label}</span>
    </button>
);