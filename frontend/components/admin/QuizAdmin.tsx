import { useEffect, useState } from 'react';
import { QuestionStats, ViewState, Category } from './types';

interface QuizAdminProps {
    API_URL: string;
    onQuestionClick: (q: QuestionStats) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    refreshTrigger: number;
    setCurrentView?: (view: ViewState) => void; // Optional shortcut to 'add_question'
}

export default function QuizAdmin({ API_URL, onQuestionClick, onEdit, onDelete, refreshTrigger, setCurrentView }: QuizAdminProps) {
    const [questions, setQuestions] = useState<QuestionStats[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterLevel, setFilterLevel] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/admin/categories`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data.categories || []);
                }
            } catch (err) { console.error("Fetch categories failed", err); }
        };
        fetchCategories();
    }, [API_URL]);

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API_URL}/admin/questions?page=${currentPage}&limit=16&sort=${sortOrder}&level=${filterLevel}&category=${filterCategory}`);
                const json = await res.json();

                let sortedQuestions = json.questions || [];
                if (sortOrder === 'desc') {
                    // Sort highest correctRate first
                    sortedQuestions = sortedQuestions.sort((a: QuestionStats, b: QuestionStats) => b.correctRate - a.correctRate);
                } else {
                    // Sort lowest correctRate first
                    sortedQuestions = sortedQuestions.sort((a: QuestionStats, b: QuestionStats) => a.correctRate - b.correctRate);
                }

                setQuestions(sortedQuestions);
                setTotalPages(json.totalPages);
            } catch (err) {
                console.error("Fetch questions failed", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, [API_URL, currentPage, sortOrder, filterLevel, filterCategory, refreshTrigger]);

    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1); };
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(p => p - 1); };
    const toggleSort = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 bg-slate-900/50 p-4 xl:p-2 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4 xl:pl-4">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-2xl border border-indigo-500/30 shadow-inner">
                        📝
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-wide">จัดการคลังข้อสอบ</h2>
                        <p className="text-gray-400 text-sm">ข้อมูลโจทย์ทั้งหมดและสถิติการตอบของผู้เล่น</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto mt-2 xl:mt-0 xl:pr-2">
                    {setCurrentView && (
                        <button
                            onClick={() => setCurrentView('add_question')}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg hover:-translate-y-0.5 whitespace-nowrap flex items-center gap-2 border border-indigo-500/50"
                        >
                            <span>➕</span> เพิ่มโจทย์ใหม่
                        </button>
                    )}
                    <select
                        value={filterCategory}
                        onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                        className="px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-colors shadow-inner"
                    >
                        <option value="all">📁 ทุกหมวดหมู่</option>
                        {categories.map((cat) => (
                            <option key={cat.cg_id} value={cat.cg_id}>{cat.mode_cg}</option>
                        ))}
                    </select>
                    <select
                        value={filterLevel}
                        onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1); }}
                        className="px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-colors shadow-inner"
                    >
                        <option value="all">🌐 ทุกระดับ</option>
                        <option value="easy">🟢 Easy</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="hard">🔴 Hard</option>
                    </select>
                    <button onClick={toggleSort} className="px-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-slate-700 transition whitespace-nowrap active:scale-95 shadow-inner">
                        เรียง: {sortOrder === 'desc' ? 'ถูกเยอะสุด 🔼' : 'ผิดเยอะสุด 🔻'}
                    </button>
                    <div className="flex bg-slate-800 rounded-xl border border-white/10 overflow-hidden shadow-inner ml-auto xl:ml-0">
                        <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition">⬅️</button>
                        <span className="px-4 py-2.5 text-sm font-bold flex items-center border-l border-r border-white/10 text-gray-300 bg-slate-900/80 min-w-[60px] justify-center">{currentPage} / {totalPages}</span>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition">➡️</button>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-xl flex flex-col">
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950/80 text-gray-400 uppercase text-xs sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-4 w-[5%] text-center">#</th>
                                <th className="p-4 w-[35%]">คำถาม</th>
                                <th className="p-4 w-[15%] text-left">หมวดหมู่</th>
                                <th className="p-4 w-[10%] text-center">ระดับ</th>
                                <th className="p-4 w-[15%] text-right">ความถูกต้อง</th>
                                <th className="p-4 w-[20%] text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan={6} className="p-20 text-center text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</td></tr>
                            ) : questions.length === 0 ? (
                                <tr><td colSpan={6} className="p-20 text-center text-gray-500">ไม่พบข้อมูลคำถาม</td></tr>
                            ) : questions.map((q, idx) => (
                                <tr key={q.qid} onClick={() => onQuestionClick(q)} className="hover:bg-white-[0.02] cursor-pointer transition-all group border-b border-white/5 last:border-0 relative">
                                    <td className="p-5 text-center text-gray-500 font-mono text-xs">{q.qid}</td>
                                    <td className="p-5">
                                        <div className="text-gray-200 font-medium group-hover:text-white transition-colors text-base line-clamp-2 leading-relaxed">{q.question}</div>
                                        <div className="text-[11px] text-gray-400 mt-2 flex items-center gap-2 font-mono flex-wrap">
                                            <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-300 font-semibold px-2.5 py-0.5 rounded border border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.15)] group-hover:bg-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                                                <span className="text-[11px] opacity-90 drop-shadow-sm">👁️</span> {q.totalAttempts} ครั้ง
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-left text-gray-400 text-sm">
                                        {q.category || '-'}
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={`px-4 py-1.5 text-[10px] rounded-lg uppercase font-black tracking-widest border ${q.level === 'hard' ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]' :
                                            q.level === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                                                'bg-green-500/10 text-green-400 border-green-500/30'
                                            }`}>
                                            {q.level}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex items-center justify-end gap-3 group/progress">
                                            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden hidden md:block border border-white/5">
                                                <div className={`h-full rounded-full transition-all duration-1000 ${q.correctRate < 30 ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : q.correctRate < 70 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`} style={{ width: `${q.correctRate}%` }}></div>
                                            </div>
                                            <span className={`font-mono font-bold text-sm min-w-[3rem] ${q.correctRate < 30 ? 'text-red-400' : q.correctRate < 70 ? 'text-yellow-400' : 'text-green-400'}`}>{q.correctRate.toFixed(0)}%</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <div className="flex items-center justify-center gap-2 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEdit(q.qid); }}
                                                className="p-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title="แก้ไข"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onDelete(q.qid); }}
                                                className="p-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                title="ลบ"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
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
