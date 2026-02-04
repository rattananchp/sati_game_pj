import { useEffect, useState } from 'react';
import { VirusScoreEntry } from './types';

interface VirusManagerProps {
    API_URL: string;
}

export default function VirusManager({ API_URL }: VirusManagerProps) {
    const [scores, setScores] = useState<VirusScoreEntry[]>([]);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Helper แปลงวินาทีเป็น นาที:วินาที
    const formatTime = (seconds: number) => {
        if (!seconds) return "-";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const fetchVirusScores = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API_URL}/admin/virus/leaderboard?page=${page}&limit=10`);
                if (!res.ok) throw new Error("Fetch failed");
                const json = await res.json();
                setScores(json.scores || []); // ✅ Safeguard
                setTotalPage(json.totalPages || 1);
            } catch (err) {
                console.error(err);
                setScores([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVirusScores();
    }, [page, API_URL]);



    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-4xl animate-bounce filter drop-shadow hover:scale-110 transition cursor-default">🦠</span>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Virus Hunter Leaderboard</h2>
                        <p className="text-xs text-gray-400 mt-1">จัดอันดับผู้เล่นคะแนนสูงสุด (เรียงตามคะแนน และเวลา)</p>
                    </div>
                </div>

                <div className="flex bg-slate-800 rounded-xl border border-white/10 overflow-hidden">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition">⬅️</button>
                    <span className="px-4 py-2 text-xs flex items-center border-l border-r border-white/10 text-gray-400 font-mono bg-slate-900/50">Page {page}/{totalPage}</span>
                    <button onClick={() => setPage(p => Math.min(totalPage, p + 1))} disabled={page === totalPage} className="px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition">➡️</button>
                </div>
            </div>

            <div className="flex-1 bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-xl flex flex-col">
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950/80 text-gray-400 uppercase text-xs sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-4 w-[10%] text-center">อันดับ</th>
                                <th className="p-4 w-[30%]">ผู้เล่น</th>
                                <th className="p-4 w-[15%] text-right">เวลาที่ใช้</th>
                                <th className="p-4 w-[20%] text-right">คะแนนสูงสุด</th>
                                <th className="p-4 w-[15%] text-right">วันที่เล่นล่าสุด</th>

                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan={6} className="p-20 text-center text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</td></tr>
                            ) : scores.length === 0 ? (
                                <tr><td colSpan={6} className="p-20 text-center text-gray-500">ยังไม่มีประวัติการเล่น</td></tr>
                            ) : scores.map((item, idx) => {
                                const rank = (page - 1) * 10 + idx + 1;
                                return (
                                    <tr key={idx} className="hover:bg-red-900/10 transition-colors group">
                                        <td className="p-4 text-center">
                                            {rank === 1 ? <span className="text-2xl drop-shadow-md">🥇</span> :
                                                rank === 2 ? <span className="text-2xl drop-shadow-md">🥈</span> :
                                                    rank === 3 ? <span className="text-2xl drop-shadow-md">🥉</span> :
                                                        <span className="font-mono text-gray-500 text-lg group-hover:text-gray-300">#{rank}</span>}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-inner ${rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-black' :
                                                    rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                                                        rank === 3 ? 'bg-gradient-to-br from-orange-400 to-red-600 text-white' :
                                                            'bg-slate-700 text-gray-300'
                                                    }`}>
                                                    {item.user?.username?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div className={`font-bold transition-colors ${rank <= 3 ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{item.user?.username || 'Unknown'}</div>
                                                    <div className="text-[10px] text-gray-600 group-hover:text-gray-500">{item.user?.email || '-'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`font-mono text-sm ${rank <= 3 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                                ⏱️ {formatTime(item.time_taken)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="font-black text-xl text-red-400 font-mono tracking-wider group-hover:text-red-300 transition-colors shadow-red-500/20 drop-shadow-sm">{item.score.toLocaleString()}</span>
                                        </td>
                                        <td className="p-4 text-right text-xs text-gray-500 font-mono group-hover:text-gray-400">
                                            {new Date(item.played_at).toLocaleDateString('th-TH', {
                                                day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
