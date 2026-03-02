import { DashboardData } from './types';

export default function Dashboard({ data }: { data: DashboardData | null }) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8">
                <h2 className="text-3xl font-black text-white mb-2">ยินดีต้อนรับ, Admin 👋</h2>
                <p className="text-gray-400">ภาพรวมของระบบและสถิติล่าสุด</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="ผู้เล่นทั้งหมด"
                    value={data?.overview?.totalUsers}
                    icon="👥"
                    gradient="from-blue-600 to-blue-800"
                    delay={0}
                />
                <StatCard
                    title="รอบการเล่น Quiz"
                    value={data?.overview?.totalGames}
                    icon="📝"
                    gradient="from-indigo-600 to-purple-800"
                    delay={100}
                />
                <StatCard
                    title="รอบการเล่น Virus"
                    value={data?.overview?.totalVirusGames}
                    icon="🦠"
                    gradient="from-red-600 to-orange-700"
                    delay={200}
                />
            </div>

            {/* Placeholder for charts or more info */}
            <div className="p-8 bg-slate-900/50 border border-white/5 rounded-2xl text-center text-gray-500">
                <p>กราฟสถิติเพิ่มเติมจะแสดงที่นี่ในอนาคต...</p>
            </div>
        </div>
    );
}

const StatCard = ({ title, value, icon, gradient, delay }: { title: string, value?: number, icon: string, gradient: string, delay: number }) => (
    <div
        className={`bg-gradient-to-br ${gradient} p-6 rounded-2xl shadow-lg relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300 card-shine`}
        style={{ animationFillMode: 'both', animationDelay: `${delay}ms` }}
    >
        <div className="absolute -right-4 -top-4 text-9xl opacity-10 rotate-12">{icon}</div>
        <div className="relative z-10">
            <h3 className="text-white/80 font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="bg-white/20 p-1 rounded-md text-xs">{icon}</span> {title}
            </h3>
            <p className="text-5xl font-black text-white tracking-tight">
                {value?.toLocaleString() || '0'}
            </p>
        </div>
    </div>
);
