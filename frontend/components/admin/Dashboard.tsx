'use client';
import { DashboardData } from './types';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface ChartPayload {
    name: string;
    value: number;
    color: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: ChartPayload[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 p-4 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] min-w-[180px] animate-fade-in">
                <p className="text-white font-black mb-3 border-b border-slate-700 pb-2 text-lg">{label}</p>
                {payload.map((entry: ChartPayload, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-6 mb-2 last:mb-0">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-3 h-3 rounded-full shadow-lg" 
                                style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}` }}
                            ></div>
                            <span className="text-gray-300 text-sm font-medium">{entry.name}</span>
                        </div>
                        <span className="text-white font-black text-base">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function Dashboard({ data }: { data: DashboardData | null }) {
    
    const emptyMonthlyData = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'].map(month => ({ month, quiz: 0, virus: 0, chat: 0 }));
    const chartData = data?.monthlyStats || emptyMonthlyData;

    return (
        // ✅ 1. เพิ่ม mt-10 (Margin Top) ตรงนี้ เพื่อดันเนื้อหาทั้งหมดในหน้านี้ให้ขยับลงมา
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-10">
            <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                {/* <div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-1">
                        ยินดีต้อนรับ, Admin 👋
                    </h2>
                    <p className="text-slate-400 font-medium">ภาพรวมของระบบและสถิติการเล่นล่าสุด</p>
                </div>
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></span> */}
                    <span className="text-green-400 text-xs font-bold uppercase tracking-wider">
                        {data ? "Database Connected" : "Connecting..."}
                    </span>
                {/* </div> */}
            </header>

            {/* --- 🌟 แถบสถิติขนาดเล็ก --- */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
                <MiniStat 
                    title="ผู้เล่นทั้งหมด" 
                    value={data?.overview?.totalUsers} 
                    icon="👥" 
                    themeClass="border-blue-500/30 text-blue-400 bg-blue-950/20" 
                />
                <MiniStat 
                    title="รวมรอบเล่น Quiz" 
                    value={data?.overview?.totalGames} 
                    icon="📝" 
                    themeClass="border-indigo-500/30 text-indigo-400 bg-indigo-950/20" 
                />
                <MiniStat 
                    title="รวมรอบเล่น Virus" 
                    value={data?.overview?.totalVirusGames} 
                    icon="🦠" 
                    themeClass="border-red-500/30 text-red-400 bg-red-950/20" 
                />
                <MiniStat 
                    title="รวมรอบเล่น Chat" 
                    value={data?.overview?.totalChatGames} 
                    icon="💬" 
                    themeClass="border-pink-500/30 text-pink-400 bg-pink-950/20" 
                />
            </div>

            {/* --- Chart Section --- */}
            {/* ✅ 2. เปลี่ยน bg-slate-900/60 เป็น bg-slate-900/20 เพื่อให้พื้นหลังจางลง และเพิ่มความเบลอกระจก (backdrop-blur-2xl) */}
            <div className="p-6 md:p-8 bg-slate-900/20 border border-slate-700/40 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.2)] backdrop-blur-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="flex justify-between items-center mb-8 relative z-10">
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                        <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">📊</span> 
                        สถิติการเข้าเล่นรายเดือน (ปี {new Date().getFullYear() + 543})
                    </h3>
                </div>
                
                <div className="h-[400px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                            barGap={2}
                        >
                            <defs>
                                <linearGradient id="colorQuiz" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={1}/>
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.8}/>
                                </linearGradient>
                                <linearGradient id="colorVirus" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f87171" stopOpacity={1}/>
                                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0.8}/>
                                </linearGradient>
                                <linearGradient id="colorChat" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f472b6" stopOpacity={1}/>
                                    <stop offset="95%" stopColor="#be185d" stopOpacity={0.8}/>
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                            
                            <XAxis 
                                dataKey="month" 
                                stroke="#94a3b8" 
                                tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }} 
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            
                            <YAxis 
                                stroke="#94a3b8" 
                                tick={{ fill: '#94a3b8', fontSize: 13 }}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                                allowDecimals={false}
                            />
                            
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.3 }} />
                            
                            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                            
                            <Bar dataKey="quiz" name="ตอบคำถาม (Quiz)" fill="url(#colorQuiz)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="virus" name="ทุบไวรัส (Virus)" fill="url(#colorVirus)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="chat" name="แชทปั่น (Chat)" fill="url(#colorChat)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

const MiniStat = ({ title, value, icon, themeClass }: { title: string, value?: number, icon: string, themeClass: string }) => (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border backdrop-blur-xl shadow-sm flex-1 min-w-[160px] max-w-[240px] hover:bg-slate-800/80 transition-colors ${themeClass}`}>
        <span className="text-2xl filter drop-shadow-md">{icon}</span>
        <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold opacity-80 tracking-wider mb-0.5">{title}</span>
            <span className="text-xl font-black text-white leading-none">
                {value !== undefined ? value.toLocaleString() : '0'}
            </span>
        </div>
    </div>
);