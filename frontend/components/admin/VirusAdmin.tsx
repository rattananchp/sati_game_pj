'use client';
import { useEffect, useState, useCallback } from 'react';
import { VirusScoreEntry } from './types';

interface VirusAdminProps {
    API_URL: string;
}

export default function VirusAdmin({ API_URL }: VirusAdminProps) {
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

    // ✅ แยกฟังก์ชันดึงข้อมูลออกมาเพื่อให้เรียกใช้ซ้ำได้ตอนกดลบ
    const fetchVirusScores = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/admin/virus/leaderboard?page=${page}&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Fetch failed");
            const json = await res.json();
            setScores(json.scores || []); 
            setTotalPage(json.totalPages || 1);
        } catch (err) {
            console.error(err);
            setScores([]);
        } finally {
            setIsLoading(false);
        }
    }, [API_URL, page]);

    useEffect(() => {
        fetchVirusScores();
    }, [fetchVirusScores]);

    // ✅ ฟังก์ชันสำหรับลบข้อมูล
    const handleDelete = async (id: number) => {
        if (!confirm("⚠️ แน่ใจนะว่าจะลบประวัติการเล่นนี้ ? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/admin/virus/score/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                fetchVirusScores(); // รีโหลดข้อมูลใหม่หลังลบเสร็จ
            } else {
                alert("ลบไม่สำเร็จ กรุณาลองใหม่");
            }
        } catch (e) {
            console.error("Delete error:", e);
            alert("Error connecting to server");
        }
    };

    // ฟังก์ชันเลื่อนหน้า
    const handleNextPage = () => setPage(p => Math.min(totalPage, p + 1));
    const handlePrevPage = () => setPage(p => Math.max(1, p - 1));

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col relative mt-10">
            {/* Header และ Pagination ด้านบน */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 bg-slate-900/50 p-4 xl:p-2 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4 xl:pl-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-2xl border border-red-500/30 shadow-inner">
                        🦠
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-wide">Virus Hunter Leaderboard</h2>
                        <p className="text-gray-400 text-sm">จัดอันดับผู้เล่นคะแนนสูงสุด (เรียงตามคะแนน และเวลา)</p>
                    </div>
                </div>

                <div className="flex bg-slate-800 rounded-xl border border-white/10 overflow-hidden shadow-inner mt-2 xl:mt-0 xl:mr-2 w-full xl:w-auto">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition">⬅️</button>
                    <span className="px-4 py-2.5 text-sm font-bold flex items-center border-l border-r border-white/10 text-gray-300 bg-slate-900/80 min-w-[60px] justify-center">หน้าที่ {page} / {totalPage}</span>
                    <button onClick={() => setPage(p => Math.min(totalPage, p + 1))} disabled={page === totalPage} className="px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition">➡️</button>
                </div>
            </div>

            {/* ตารางแสดงข้อมูล */}
            <div className="flex-1 bg-slate-900/80 rounded-2xl border border-slate-700 overflow-hidden shadow-xl flex flex-col backdrop-blur-md mb-4">
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-sm min-w-[850px]">
                        <thead className="bg-slate-950/80 text-gray-400 uppercase text-xs sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-4 w-[10%] text-center border-b border-slate-800">อันดับ</th>
                                <th className="p-4 w-[30%] border-b border-slate-800">ผู้เล่น</th>
                                <th className="p-4 w-[15%] text-right border-b border-slate-800">เวลาที่ใช้</th>
                                <th className="p-4 w-[15%] text-right border-b border-slate-800">คะแนนสูงสุด</th>
                                <th className="p-4 w-[15%] text-right border-b border-slate-800">วันที่เล่นล่าสุด</th>
                                <th className="p-4 w-[15%] text-center border-b border-slate-800">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                <tr><td colSpan={6} className="p-20 text-center text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</td></tr>
                            ) : scores.length === 0 ? (
                                <tr><td colSpan={6} className="p-20 text-center text-gray-500">ยังไม่มีประวัติการเล่น</td></tr>
                            ) : scores.map((item, idx) => {
                                const rank = (page - 1) * 10 + idx + 1;
                                return (
                                    <tr key={idx} className="hover:bg-slate-800/40 cursor-pointer transition-all group">
                                        <td className="p-5 text-center">
                                            {rank === 1 ? <span className="text-2xl drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">🥇</span> :
                                                rank === 2 ? <span className="text-2xl drop-shadow-[0_0_10px_rgba(156,163,175,0.5)]">🥈</span> :
                                                    rank === 3 ? <span className="text-2xl drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">🥉</span> :
                                                        <span className="font-mono text-gray-500 text-lg group-hover:text-white transition-colors">#{rank}</span>}
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner border border-white/10 ${rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-black border-yellow-500/50 shadow-[0_0_15px_rgba(250,204,21,0.2)]' :
                                                    rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black border-gray-400/50' :
                                                        rank === 3 ? 'bg-gradient-to-br from-orange-400 to-red-600 text-white border-orange-500/50' :
                                                            'bg-slate-800 text-gray-300'
                                                    }`}>
                                                    {item.user?.username?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div className={`font-bold transition-colors text-base ${rank <= 3 ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{item.user?.username || 'Unknown'}</div>
                                                    <div className="text-xs text-gray-500 group-hover:text-gray-400 mt-0.5">{item.user?.email || '-'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className={`font-mono text-sm inline-block px-3 py-1 rounded-lg border ${rank <= 3 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 'text-gray-400 bg-white/5 border-white/10'}`}>
                                                <span className="opacity-70 mr-1">⏱️</span>{formatTime(item.time_taken)}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className="font-black text-2xl text-red-500 font-mono tracking-wider group-hover:text-red-400 transition-colors drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]">{item.score.toLocaleString()}</span>
                                        </td>
                                        <td className="p-5 text-right text-xs text-gray-500 font-mono group-hover:text-gray-400">
                                            <div className="bg-slate-950/50 px-3 py-1.5 rounded-lg inline-block border border-white/5">
                                                {new Date(item.played_at).toLocaleDateString('th-TH', {
                                                    day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
    {/* ✅ ปุ่มลบ (ถังขยะ) */}
    <button
        onClick={(e) => { 
            e.stopPropagation(); 
            
            // ✅ ใช้ Intersection Type แทน any เพื่อแก้ปัญหา ESLint
            type ExtendedScore = VirusScoreEntry & { id?: number; score_id?: number; vs_id?: number; uid?: number };
            const targetItem = item as ExtendedScore;
            
            const targetId = targetItem.id || targetItem.score_id || targetItem.vs_id || targetItem.uid;
            
            if (targetId) {
                handleDelete(targetId); 
            } else {
                alert("ไม่พบ ID ของข้อมูลนี้ จึงไม่สามารถลบได้");
            }
        }}
        className="w-10 h-10 mx-auto flex items-center justify-center bg-slate-800 border border-slate-700 text-slate-300 rounded-[14px] hover:bg-red-600 hover:text-white hover:border-red-500 transition-all shadow-sm group/btn"
        title="ลบประวัติ"
    >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover/btn:scale-110 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
    </button>
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