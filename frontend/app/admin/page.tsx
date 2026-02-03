'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChangeEvent } from 'react'
// --- Types ---
interface Overview {
  totalUsers: number;
  totalGames: number;
  totalVirusGames: number;
}

interface QuestionStats {
  qid: number;
  question: string;
  level: string;
  correctRate: number;
  totalAttempts: number;
}

interface QuestionDetail {
    choice_text: string;
    is_correct: boolean;
    count: number;
    percent: number;
}

interface DashboardData {
  overview: Overview;
}

interface QuestionFormData {
    question: string;
    choice1: string;
    choice2: string;
    choice3: string;
    choice4: string;
    correctIndex: number;
    level: string;
    explanation: string;
    [key: string]: string | number;
}
interface VirusScoreEntry {
  score: number;
  time_taken: number; // เวลาที่ใช้
  played_at: string;
  user: {
    username: string;
    email: string;
  };
}
type ViewState = 'dashboard' | 'quiz_manage' | 'virus_manage' | 'users' | 'add_question';

export default function AdminDashboard() {
  const router = useRouter();
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_URL = 'http://localhost:4000';

  // --- State ---
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Pagination & Data (Quiz)
  const [questions, setQuestions] = useState<QuestionStats[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterLevel, setFilterLevel] = useState<string>('all'); 
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // ตัวช่วยรีเฟรชตาราง

  // Modal View Detail
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionStats | null>(null);
  const [questionDetails, setQuestionDetails] = useState<QuestionDetail[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Modal Edit
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

  // 1. Check Auth
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { router.push('/login'); return; }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        alert("⛔️ คุณไม่มีสิทธิ์เข้าถึงหน้านี้!");
        router.push('/'); 
      } else {
        setIsAuthorized(true);
      }
    } catch (e) {
      router.push('/login');
    }
  }, [router]);

  // 2. Fetch Overview Data
  useEffect(() => {
    if (!isAuthorized) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/stats`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthorized, API_URL]);

  // 3. Fetch Questions (Triggered by refreshTrigger)
  useEffect(() => {
    if (!isAuthorized || currentView !== 'quiz_manage') return;

    const fetchQuestions = async () => {
        setIsLoadingQuestions(true);
        try {
            const res = await fetch(`${API_URL}/admin/questions?page=${currentPage}&limit=16&sort=${sortOrder}&level=${filterLevel}`);
            const json = await res.json();
            setQuestions(json.questions);
            setTotalPages(json.totalPages);
        } catch (err) {
            console.error("Fetch questions failed", err);
        } finally {
            setIsLoadingQuestions(false);
        }
    };

    fetchQuestions();
  }, [isAuthorized, currentView, currentPage, sortOrder, filterLevel, refreshTrigger, API_URL]);

  // --- Actions ---
  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

  const handleQuestionClick = async (question: QuestionStats) => {
      setSelectedQuestion(question);
      setIsLoadingDetail(true);
      setQuestionDetails([]);
      try {
          const res = await fetch(`${API_URL}/admin/question-detail/${question.qid}`);
          const json = await res.json();
          if (json.breakdown) setQuestionDetails(json.breakdown);
      } catch (err) {
          console.error(err);
      } finally {
          setIsLoadingDetail(false);
      }
  };

  const handleDelete = async (qid: number, e: React.MouseEvent) => {
      e.stopPropagation(); // กันไม่ให้ไปกดโดนแถว
      if (!confirm("⚠️ คุณแน่ใจหรือไม่ว่าจะลบโจทย์ข้อนี้? \n(ประวัติการตอบของผู้เล่นในข้อนี้จะหายไปด้วย)")) return;

      try {
          const res = await fetch(`${API_URL}/admin/question/delete/${qid}`, { method: 'DELETE' });
          if (res.ok) {
              alert("✅ ลบข้อมูลสำเร็จ");
              handleRefresh(); // รีโหลดตาราง
          } else {
              alert("❌ ลบข้อมูลไม่สำเร็จ");
          }
      } catch (error) {
          console.error(error);
          alert("❌ เชื่อมต่อ Server ไม่ได้");
      }
  };

  const handleEdit = (qid: number, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingQuestionId(qid);
  };

  const closeModal = () => setSelectedQuestion(null);
  const handleNextPage = () => { if(currentPage < totalPages) setCurrentPage(p => p + 1); };
  const handlePrevPage = () => { if(currentPage > 1) setCurrentPage(p => p - 1); };
  const toggleSort = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

  if (!isAuthorized || loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;

  // --- Sub-Components ---

  const Sidebar = () => (
    <div className="w-20 md:w-64 bg-slate-900 border-r border-white/10 flex flex-col justify-between shrink-0 h-screen fixed md:relative z-20">
        <div>
            <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-white/10">
                <span className="text-2xl">🛡️</span>
                <span className="hidden md:block ml-3 font-bold text-white tracking-widest">ADMIN PANEL</span>
            </div>
            <nav className="p-4 space-y-2">
                <MenuButton id="dashboard" icon="📊" label="ภาพรวมระบบ" />
                <MenuButton id="quiz_manage" icon="📝" label="คลังข้อสอบ" />
                <MenuButton id="virus_manage" icon="🦠" label="ข้อมูล Virus" />
                <MenuButton id="users" icon="👥" label="รายชื่อผู้เล่น" />
                <MenuButton id="add_question" icon="➕" label="เพิ่มโจทย์ใหม่" />
            </nav>
        </div>
        <div className="p-4 border-t border-white/10">
            <button onClick={() => router.push('/')} className="w-full flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all">
                <span>🚪</span> <span className="hidden md:block font-bold">ออกจากระบบ</span>
            </button>
        </div>
    </div>
  );

  const MenuButton = ({ id, icon, label }: { id: ViewState, icon: string, label: string }) => (
    <button 
        onClick={() => setCurrentView(id)}
        className={`w-full flex items-center justify-center md:justify-start gap-4 p-3 rounded-xl transition-all duration-200 ${currentView === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
    >
        <span className="text-xl">{icon}</span>
        <span className="hidden md:block font-medium text-sm">{label}</span>
    </button>
  );

  const DashboardHome = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-3xl font-black text-white mb-6">ยินดีต้อนรับ, Admin 👋</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-9xl opacity-10">👥</div>
                <h3 className="text-blue-100 font-bold text-sm uppercase tracking-wider">ผู้เล่นทั้งหมด</h3>
                <p className="text-5xl font-black text-white mt-2">
                    {data?.overview?.totalUsers?.toLocaleString() || '0'}
                </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-9xl opacity-10">📝</div>
                <h3 className="text-indigo-100 font-bold text-sm uppercase tracking-wider">รอบการเล่น Quiz</h3>
                <p className="text-5xl font-black text-white mt-2">
                    {data?.overview?.totalGames?.toLocaleString() || '0'}
                </p>
            </div>
            <div className="bg-gradient-to-br from-red-600 to-orange-700 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-9xl opacity-10">🦠</div>
                <h3 className="text-red-100 font-bold text-sm uppercase tracking-wider">รอบการเล่น Virus</h3>
                <p className="text-5xl font-black text-white mt-2">
                    {data?.overview?.totalVirusGames?.toLocaleString() || '0'}
                </p>
            </div>
        </div>
    </div>
  );

  const QuizManager = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-white">จัดการข้อมูล Quiz</h2>
            <div className="flex flex-wrap gap-3 items-center">
                <select 
                    value={filterLevel}
                    onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                    <option value="all">🌐 แสดงทั้งหมด</option>
                    <option value="easy">🟢 Easy</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="hard">🔴 Hard</option>
                </select>
                <button onClick={toggleSort} className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-xs text-gray-300 hover:text-white transition whitespace-nowrap">
                    เรียง: {sortOrder === 'asc' ? 'ผิดเยอะสุด 🔻' : 'ถูกเยอะสุด 🔼'}
                </button>
                <div className="flex bg-slate-800 rounded-lg border border-white/10">
                    <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-50">⬅️</button>
                    <span className="px-3 py-2 text-xs flex items-center border-l border-r border-white/10 text-gray-500">{currentPage}/{totalPages}</span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-50">➡️</button>
                </div>
            </div>
        </div>

        <div className="flex-1 bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-xl flex flex-col">
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="p-4 w-[5%] text-center">#</th>
                            <th className="p-4 w-[50%]">คำถาม</th>
                            <th className="p-4 w-[10%] text-center">ระดับ</th>
                            <th className="p-4 w-[15%] text-right">ความถูกต้อง</th>
                            <th className="p-4 w-[20%] text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoadingQuestions ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">กำลังโหลด...</td></tr>
                        ) : questions.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">ไม่พบข้อมูล</td></tr>
                        ) : questions.map((q, idx) => (
                            <tr key={q.qid} onClick={() => handleQuestionClick(q)} className="hover:bg-indigo-900/20 cursor-pointer transition-colors group">
                                <td className="p-4 text-center text-gray-500">{(currentPage - 1) * 16 + idx + 1}</td>
                                <td className="p-4">
                                    <div className="text-gray-200 font-medium group-hover:text-indigo-300 transition-colors truncate max-w-md">{q.question}</div>
                                    <div className="text-xs text-gray-600 mt-1">ตอบแล้ว {q.totalAttempts} ครั้ง</div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 text-[10px] rounded-full uppercase border ${
                                        q.level === 'hard' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                        q.level === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                        'bg-green-500/20 text-green-400 border-green-500/30'
                                    }`}>
                                        {q.level}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden hidden md:block">
                                            <div className={`h-full ${q.correctRate < 30 ? 'bg-red-500' : q.correctRate < 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${q.correctRate}%` }}></div>
                                        </div>
                                        <span className={`font-mono font-bold ${q.correctRate < 30 ? 'text-red-400' : 'text-gray-300'}`}>{q.correctRate.toFixed(0)}%</span>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={(e) => handleEdit(q.qid, e)}
                                            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition" 
                                            title="แก้ไข"
                                        >
                                            ✏️
                                        </button>
                                        <button 
                                            onClick={(e) => handleDelete(q.qid, e)}
                                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition" 
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

  // ✅ 4. Virus Manager (ตารางจัดอันดับ)
  const VirusManager = () => {
    // ... (ส่วน useState และ useEffect เหมือนเดิม)
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
                // เรียก API ตัวเดิม (มันจะส่ง time_taken มาด้วยถ้า Backend บันทึกแล้ว)
                const res = await fetch(`${API_URL}/admin/virus/leaderboard?page=${page}&limit=10`);
                const json = await res.json();
                setScores(json.scores);
                setTotalPage(json.totalPages);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVirusScores();
    }, [page]); // อย่าลืมใส่ API_URL ใน dependency array ถ้า ESLint เตือน

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-4xl animate-bounce">🦠</span>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Virus Hunter Leaderboard</h2>
                        <p className="text-xs text-gray-400">จัดอันดับผู้เล่นคะแนนสูงสุด (เรียงตามคะแนน และเวลา)</p>
                    </div>
                </div>
                
                <div className="flex bg-slate-800 rounded-lg border border-white/10">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-50">⬅️</button>
                    <span className="px-4 py-2 text-xs flex items-center border-l border-r border-white/10 text-gray-500 font-mono">Page {page}/{totalPage}</span>
                    <button onClick={() => setPage(p => Math.min(totalPage, p + 1))} disabled={page === totalPage} className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-50">➡️</button>
                </div>
            </div>

            <div className="flex-1 bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-xl flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950 text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="p-4 w-[10%] text-center">อันดับ</th>
                                <th className="p-4 w-[35%]">ผู้เล่น</th>
                                <th className="p-4 w-[15%] text-right">เวลาที่ใช้</th> {/* ✅ เพิ่มคอลัมน์นี้ */}
                                <th className="p-4 w-[20%] text-right">คะแนนสูงสุด</th>
                                <th className="p-4 w-[20%] text-right">วันที่เล่นล่าสุด</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-10 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                            ) : scores.length === 0 ? (
                                <tr><td colSpan={5} className="p-10 text-center text-gray-500">ยังไม่มีประวัติการเล่น</td></tr>
                            ) : scores.map((item, idx) => {
                                const rank = (page - 1) * 10 + idx + 1;
                                return (
                                    <tr key={idx} className="hover:bg-red-900/10 transition-colors">
                                        <td className="p-4 text-center">
                                            {rank === 1 ? <span className="text-2xl">🥇</span> :
                                             rank === 2 ? <span className="text-2xl">🥈</span> :
                                             rank === 3 ? <span className="text-2xl">🥉</span> :
                                             <span className="font-mono text-gray-500 text-lg">#{rank}</span>}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                                    rank === 1 ? 'bg-yellow-500 text-black' :
                                                    rank === 2 ? 'bg-gray-400 text-black' :
                                                    rank === 3 ? 'bg-orange-600 text-white' :
                                                    'bg-slate-700 text-gray-300'
                                                }`}>
                                                    {item.user?.username?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div className={`font-bold ${rank <= 3 ? 'text-white' : 'text-gray-300'}`}>{item.user?.username || 'Unknown'}</div>
                                                    <div className="text-[10px] text-gray-600">{item.user?.email || '-'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {/* ✅ แสดงเวลา */}
                                        <td className="p-4 text-right">
                                            <span className={`font-mono ${rank <= 3 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                                ⏱️ {formatTime(item.time_taken)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="font-black text-xl text-red-400 font-mono tracking-wider">{item.score.toLocaleString()}</span>
                                        </td>
                                        <td className="p-4 text-right text-xs text-gray-500 font-mono">
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
  };

  const UserManager = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-bold text-white mb-6">รายชื่อผู้เล่นทั้งหมด ({data?.overview.totalUsers})</h2>
        <div className="bg-slate-900 rounded-2xl border border-white/10 p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🚧</div>
            <p>หน้าจัดการผู้เล่น (User Management) อยู่ระหว่างการพัฒนา</p>
        </div>
    </div>
  );

  const AddQuestion = () => {
    const [formData, setFormData] = useState<QuestionFormData>({
        question: '', choice1: '', choice2: '', choice3: '', choice4: '',
        correctIndex: 0, level: 'hard', explanation: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
};

    const handleSubmit = async () => {
        if(!formData.question || !formData.choice1 || !formData.choice2) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                question: formData.question,
                choices: [formData.choice1, formData.choice2, formData.choice3, formData.choice4].filter(c => c !== ''),
                correctIndex: formData.correctIndex,
                level: formData.level,
                explanation: formData.explanation
            };
            const res = await fetch(`${API_URL}/admin/question/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (res.ok) {
                alert(`✅ เพิ่มโจทย์สำเร็จ!`);
                setFormData({ question: '', choice1: '', choice2: '', choice3: '', choice4: '', correctIndex: 0, level: 'hard', explanation: '' });
            } else {
                alert(`❌ Error: ${json.error}`);
            }
        } catch (error) {
            console.error(error);
            alert("❌ เชื่อมต่อ Server ไม่ได้");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto pb-10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><span>➕</span> เพิ่มโจทย์ใหม่</h2>
            <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 shadow-xl">
                <div className="space-y-6">
                    {/* Level */}
                    <div>
                        <label className="block text-xs text-gray-400 uppercase font-bold mb-2">ระดับความยาก</label>
                        <div className="flex gap-4">
                            {['easy', 'medium', 'hard'].map((lvl) => (
                                <label key={lvl} className={`flex-1 cursor-pointer border rounded-lg p-3 text-center uppercase text-sm font-bold transition-all ${formData.level === lvl ? (lvl==='hard'?'bg-red-500/20 border-red-500 text-red-400': lvl==='medium'?'bg-yellow-500/20 border-yellow-500 text-yellow-400':'bg-green-500/20 border-green-500 text-green-400') : 'bg-black/20 border-white/10 text-gray-500 hover:bg-white/5'}`}>
                                    <input type="radio" name="level" value={lvl} checked={formData.level === lvl} onChange={handleChange} className="hidden" />
                                    {lvl}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div><label className="block text-xs text-gray-400 uppercase font-bold mb-2">คำถาม</label><input type="text" name="question" value={formData.question} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none text-lg" placeholder="พิมพ์คำถามที่นี่..." /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i, index) => (
                            <div key={i} className={`relative p-1 rounded-xl border transition-all ${formData.correctIndex === index ? 'bg-green-500/10 border-green-500' : 'bg-transparent border-transparent'}`}>
                                <label className="block text-xs text-gray-400 uppercase font-bold mb-1 ml-1">ตัวเลือกที่ {i} {formData.correctIndex === index && <span className="text-green-400">(ถูกต้อง ✅)</span>}</label>
                                <div className="flex items-center gap-2">
                                    <input type="radio" name="correctIndex" value={index} checked={formData.correctIndex === index} onChange={() => setFormData(prev => ({ ...prev, correctIndex: index }))} className="w-5 h-5 accent-green-500 cursor-pointer" />
                                    <input type="text" name={`choice${i}`} value={formData[`choice${i}`] as string} onChange={handleChange} className="flex-1 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" placeholder={`คำตอบ ${i}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div><label className="block text-xs text-gray-400 uppercase font-bold mb-2">คำอธิบายเฉลย</label><textarea name="explanation" value={formData.explanation} onChange={handleChange} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none h-24" placeholder="อธิบายเพิ่มเติม..."></textarea></div>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-95 disabled:opacity-50">{isSubmitting ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูล'}</button>
                </div>
            </div>
        </div>
    );
  };

  // ✅ EDIT MODAL COMPONENT (หน้าต่างแก้ไข)
  const EditModal = () => {
      const [formData, setFormData] = useState<QuestionFormData>({
          question: '', choice1: '', choice2: '', choice3: '', choice4: '',
          correctIndex: 0, level: 'hard', explanation: ''
      });
      const [loadingEdit, setLoadingEdit] = useState(true);

      // Fetch Data when Modal Opens
      useEffect(() => {
          const fetchData = async () => {
              try {
                  const res = await fetch(`${API_URL}/admin/question-detail/${editingQuestionId}`);
                  const json = await res.json();
                  if(res.ok) {
                      // ดึงข้อมูลมาใส่ Form
                      setFormData({
                          question: json.question,
                          // แปลง Choices Array กลับมาใส่ Field
                          choice1: json.breakdown[0]?.choice_text || '',
                          choice2: json.breakdown[1]?.choice_text || '',
                          choice3: json.breakdown[2]?.choice_text || '',
                          choice4: json.breakdown[3]?.choice_text || '',
                         correctIndex: json.breakdown.findIndex((c: QuestionDetail) => c.is_correct),
                          level: 'hard', // Default หรือดึงจาก DB ถ้า API ส่งมา
                          explanation: '' // ต้องเพิ่ม field นี้ใน API Detail ถ้าอยากให้ดึงมาโชว์ด้วย
                      });
                  }
              } catch (e) { console.error(e); } finally { setLoadingEdit(false); }
          };
          fetchData();
      }, []);

      const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

      const handleUpdate = async () => {
          try {
              const payload = {
                  question: formData.question,
                  choices: [formData.choice1, formData.choice2, formData.choice3, formData.choice4],
                  correctIndex: formData.correctIndex,
                  level: formData.level,
                  explanation: formData.explanation
              };
              const res = await fetch(`${API_URL}/admin/question/update/${editingQuestionId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
              });
              if (res.ok) {
                  alert("✅ แก้ไขข้อมูลสำเร็จ");
                  setEditingQuestionId(null);
                  handleRefresh();
              } else {
                  alert("❌ แก้ไขไม่สำเร็จ");
              }
          } catch(e) { console.error(e); alert("Server Error"); }
      };

      if (loadingEdit) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div></div>;

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setEditingQuestionId(null)}>
              <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setEditingQuestionId(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
                  <h3 className="text-xl font-bold text-white mb-6">✏️ แก้ไขโจทย์ ID: {editingQuestionId}</h3>
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                      {/* Form Fields (Reuse Logic) */}
                      <div><label className="text-xs text-gray-400">คำถาม</label><input type="text" name="question" value={formData.question} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white" /></div>
                      <div className="grid grid-cols-2 gap-4">
                          {[1,2,3,4].map((i, index) => (
                              <div key={i} className={`p-2 border rounded-lg ${formData.correctIndex === index ? 'border-green-500 bg-green-500/10' : 'border-white/10'}`}>
                                  <div className="flex gap-2 items-center">
                                      <input type="radio" name="correctIndex" value={index} checked={formData.correctIndex === index} onChange={() => setFormData(prev => ({...prev, correctIndex: index}))} className="accent-green-500" />
                                      <input type="text" name={`choice${i}`} value={formData[`choice${i}`] as string} onChange={handleChange} className="w-full bg-transparent outline-none text-white text-sm" />
                                  </div>
                              </div>
                          ))}
                      </div>
                      <div><label className="text-xs text-gray-400">คำอธิบาย</label><textarea name="explanation" value={formData.explanation} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white h-20" /></div>
                      <button onClick={handleUpdate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl">บันทึกการแก้ไข</button>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-gray-100 font-sans overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
            <div className="absolute top-0 left-0 w-full h-96 bg-indigo-900/10 blur-[100px] pointer-events-none"></div>
            {currentView === 'dashboard' && <DashboardHome />}
            {currentView === 'quiz_manage' && <QuizManager />}
            {currentView === 'virus_manage' && <VirusManager />}
            {currentView === 'users' && <UserManager />}
            {currentView === 'add_question' && <AddQuestion />}
        </main>

        {/* Modal View Detail */}
        {selectedQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal}>
              <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative transform transition-all animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                  <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-lg bg-white/5 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">รายละเอียดข้อสอบ ID: {selectedQuestion.qid}</h3>
                  <p className="text-white font-medium text-lg mb-6 leading-relaxed bg-white/5 p-4 rounded-xl border-l-4 border-indigo-500">{selectedQuestion.question}</p>
                  {isLoadingDetail ? (
                      <div className="text-center py-8 text-sm text-gray-400 animate-pulse">กำลังดึงข้อมูล...</div>
                  ) : (
                      <div className="space-y-4">
                          {questionDetails.map((detail, index) => (
                              <div key={index} className="relative group">
                                  <div className="flex justify-between items-center mb-1 text-sm z-10 relative">
                                      <span className={`font-bold truncate max-w-[70%] ${detail.is_correct ? 'text-green-400' : 'text-gray-400'}`}>{detail.is_correct && '✅ '} {detail.choice_text}</span>
                                      <span className="text-gray-300 font-mono">{detail.percent}%</span>
                                  </div>
                                  <div className="w-full h-8 bg-black/40 rounded-lg overflow-hidden relative">
                                      <div className={`h-full transition-all duration-700 ${detail.is_correct ? 'bg-green-500/20 border-r-2 border-green-500' : 'bg-gray-700/30'}`} style={{ width: `${detail.percent}%` }}></div>
                                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">{detail.count} คน</span>
                                  </div>
                              </div>
                          ))}
                          <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-gray-500 flex justify-between px-4">
                              <span>ตอบทั้งหมด: <strong className="text-white">{selectedQuestion.totalAttempts}</strong> ครั้ง</span>
                              <span>ความยาก: <strong className="text-white uppercase">{selectedQuestion.level}</strong></span>
                          </div>
                      </div>
                  )}
              </div>
          </div>
        )}

        {/* Modal Edit */}
        {editingQuestionId && <EditModal />}
    </div>
  );
}