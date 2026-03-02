import { ViewState } from './types';
import { useRouter } from 'next/navigation';

interface SidebarProps {
    currentView: ViewState;
    setCurrentView: (view: ViewState) => void;
}

export default function Sidebar({ currentView, setCurrentView }: SidebarProps) {
    const router = useRouter();

    return (
        <div className="w-20 md:w-64 bg-slate-900 border-r border-white/10 flex flex-col justify-between shrink-0 h-screen fixed md:relative z-20 transition-all duration-300">
            <div>
                <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-white/10 bg-black/20">
                    <span className="text-3xl filter drop-shadow no-select">🛡️</span>
                    <span className="hidden md:block ml-3 font-bold text-white tracking-widest text-lg">ADMIN</span>
                </div>
                <nav className="p-4 space-y-3">
                    <MenuButton id="dashboard" icon="📊" label="สถิติภาพรวม" currentView={currentView} setCurrentView={setCurrentView} />
                    <MenuButton id="quiz_manage" icon="📝" label="จัดการข้อสอบ" currentView={currentView} setCurrentView={setCurrentView} />
                    <MenuButton id="virus_manage" icon="🦠" label="จัดการไวรัส" currentView={currentView} setCurrentView={setCurrentView} />
                    <MenuButton id="users" icon="👥" label="จัดการผู้เล่น" currentView={currentView} setCurrentView={setCurrentView} />
                    <div className="pt-4 pb-2">
                        <div className="h-px bg-white/10 mx-2"></div>
                    </div>
                    <MenuButton id="add_question" icon="➕" label="สร้างโจทย์ใหม่" currentView={currentView} setCurrentView={setCurrentView} />
                </nav>
            </div>
            <div className="p-4 border-t border-white/10 bg-black/20">
                <button onClick={() => router.push('/')} className="w-full flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all group">
                    <span className="group-hover:scale-110 transition-transform">🚪</span>
                    <span className="hidden md:block font-bold">ออกจากระบบ</span>
                </button>
            </div>
        </div>
    );
}

const MenuButton = ({ id, icon, label, currentView, setCurrentView }: { id: ViewState, icon: string, label: string, currentView: ViewState, setCurrentView: (v: ViewState) => void }) => (
    <button
        onClick={() => setCurrentView(id)}
        className={`w-full flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl transition-all duration-200 outline-none
        ${currentView === id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 translate-x-1'
                : 'text-gray-300 hover:bg-white/10 hover:text-white hover:translate-x-1'}`}
    >
        <span className="text-2xl filter drop-shadow-sm">{icon}</span>
        <span className="hidden md:block font-bold text-base tracking-wide">{label}</span>
    </button>
);
