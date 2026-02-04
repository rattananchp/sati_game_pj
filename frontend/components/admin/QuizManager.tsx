import { useEffect, useState } from 'react';
import { QuestionStats } from './types';

interface QuizManagerProps {
    API_URL: string;
    onQuestionClick: (q: QuestionStats) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    refreshTrigger: number;
}

export default function QuizManager({ API_URL, onQuestionClick, onEdit, onDelete, refreshTrigger }: QuizManagerProps) {
    const [questions, setQuestions] = useState<QuestionStats[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [filterLevel, setFilterLevel] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API_URL}/admin/questions?page=${currentPage}&limit=16&sort=${sortOrder}&level=${filterLevel}`);
                const json = await res.json();
                setQuestions(json.questions);
                setTotalPages(json.totalPages);
            } catch (err) {
                console.error("Fetch questions failed", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, [API_URL, currentPage, sortOrder, filterLevel, refreshTrigger]);

    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1); };
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(p => p - 1); };
    const toggleSort = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400">📝</span> จัดการข้อมูล Quiz
                </h2>
                <div className="flex flex-wrap gap-3 items-center">
                    <select
                        value={filterLevel}
                        onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1); }}
                        className="px-4 py-2 bg-slate-800 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-colors"
                    >
                        <option value="all">🌐 แสดงทั้งหมด</option>
                        <option value="easy">🟢 Easy</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="hard">🔴 Hard</option>
                    </select>
                    <button onClick={toggleSort} className="px-4 py-2 bg-slate-800 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-slate-700 transition whitespace-nowrap active:scale-95">
                        เรียง: {sortOrder === 'asc' ? 'ผิดเยอะสุด 🔻' : 'ถูกเยอะสุด 🔼'}
                    </button>
                    <div className="flex bg-slate-800 rounded-xl border border-white/10 overflow-hidden">
                        <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition">⬅️</button>
                        <span className="px-3 py-2 text-sm flex items-center border-l border-r border-white/10 text-gray-500 bg-slate-900/50">{currentPage}/{totalPages}</span>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition">➡️</button>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-xl flex flex-col">
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950/80 text-gray-400 uppercase text-xs sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-4 w-[5%] text-center">#</th>
                                <th className="p-4 w-[50%]">คำถาม</th>
                                <th className="p-4 w-[10%] text-center">ระดับ</th>
                                <th className="p-4 w-[15%] text-right">ความถูกต้อง</th>
                                <th className="p-4 w-[20%] text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-20 text-center text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</td></tr>
                            ) : questions.length === 0 ? (
                                <tr><td colSpan={5} className="p-20 text-center text-gray-500">ไม่พบข้อมูลคำถาม</td></tr>
                            ) : questions.map((q, idx) => (
                                <tr key={q.qid} onClick={() => onQuestionClick(q)} className="hover:bg-indigo-900/10 cursor-pointer transition-colors group border-l-2 border-transparent hover:border-indigo-500">
                                    <td className="p-4 text-center text-gray-600 font-mono">{(currentPage - 1) * 16 + idx + 1}</td>
                                    <td className="p-4">
                                        <div className="text-gray-200 font-medium group-hover:text-indigo-300 transition-colors truncate max-w-md text-base">{q.question}</div>
                                        <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                            <span>👁️</span> ตอบแล้ว {q.totalAttempts} ครั้ง
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 text-[10px] rounded-full uppercase font-bold tracking-wider border ${q.level === 'hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                q.level === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                    'bg-green-500/10 text-green-400 border-green-500/20'
                                            }`}>
                                            {q.level}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <div className="w-16 h-1.5 bg-gray-700/50 rounded-full overflow-hidden hidden md:block">
                                                <div className={`h-full rounded-full ${q.correctRate < 30 ? 'bg-red-500' : q.correctRate < 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${q.correctRate}%` }}></div>
                                            </div>
                                            <span className={`font-mono font-bold text-sm ${q.correctRate < 30 ? 'text-red-400' : 'text-gray-300'}`}>{q.correctRate.toFixed(0)}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEdit(q.qid); }}
                                                className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition active:scale-95 border border-blue-500/20"
                                                title="แก้ไข"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(q.qid); }}
                                                className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition active:scale-95 border border-red-500/20"
                                                title="ลบ"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
