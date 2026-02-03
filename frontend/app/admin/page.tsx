'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

// เมนูใน Sidebar
type ViewState = 'dashboard' | 'quiz_manage' | 'virus_manage' | 'users' | 'add_question';

export default function AdminDashboard() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Modal
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionStats | null>(null);
  const [questionDetails, setQuestionDetails] = useState<QuestionDetail[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

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

  // 3. Fetch Questions (Only when in Quiz View)
  useEffect(() => {
    if (!isAuthorized || currentView !== 'quiz_manage') return;

    const fetchQuestions = async () => {
        setIsLoadingQuestions(true);
        try {
            const res = await fetch(`${API_URL}/admin/questions?page=${currentPage}&limit=16&sort=${sortOrder}`);
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
  }, [isAuthorized, currentView, currentPage, sortOrder, API_URL]);

  // --- Actions ---
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

  const closeModal = () => setSelectedQuestion(null);
  const handleNextPage = () => { if(currentPage < totalPages) setCurrentPage(p => p + 1); };
  const handlePrevPage = () => { if(currentPage > 1) setCurrentPage(p => p - 1); };
  const toggleSort = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

  if (!isAuthorized || loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;

  // --- Sub-Components (เพื่อความสะอาดของโค้ด) ---

  // 1. Sidebar Component
  const Sidebar = () => (
    <div className="w-20 md:w-64 bg-slate-900 border-r border-white/10 flex flex-col justify-between shrink-0 h-screen fixed md:relative z-20">
        <div>
            <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-white/10">
                <span className="text-2xl">🛡️</span>
                <span className="hidden md:block ml-3 font-bold text-white tracking-widest">ADMIN PANEL</span>
            </div>
            <nav className="p-4 space-y-2">
                <MenuButton id="dashboard" icon="📊" label="ภาพรวมระบบ" />
                <MenuButton id="quiz_manage" icon="📝" label="จัดการ Quiz" />
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

  // 2. Dashboard Home View
  const DashboardHome = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-3xl font-black text-white mb-6">ยินดีต้อนรับ, Admin 👋</h2>
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-9xl opacity-10">👥</div>
                <h3 className="text-blue-100 font-bold text-sm uppercase tracking-wider">ผู้เล่นทั้งหมด</h3>
                <p className="text-5xl font-black text-white mt-2">{data?.overview.totalUsers.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-9xl opacity-10">📝</div>
                <h3 className="text-indigo-100 font-bold text-sm uppercase tracking-wider">รอบการเล่น Quiz</h3>
                <p className="text-5xl font-black text-white mt-2">{data?.overview.totalGames.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-red-600 to-orange-700 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-9xl opacity-10">🦠</div>
                <h3 className="text-red-100 font-bold text-sm uppercase tracking-wider">รอบการเล่น Virus</h3>
                <p className="text-5xl font-black text-white mt-2">{data?.overview.totalVirusGames.toLocaleString()}</p>
            </div>
        </div>

        {/* Mockup Recent Activity */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">กิจกรรมล่าสุด</h3>
            <div className="space-y-3">
                {[1,2,3].map((_,i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                            <div>
                                <div className="text-sm text-white font-bold">User #{100+i} เข้าใช้งานระบบ</div>
                                <div className="text-xs text-gray-500">เมื่อ 5 นาทีที่แล้ว</div>
                            </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">Online</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  // 3. Quiz Table View
  const QuizManager = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">จัดการข้อมูล Quiz (Hard Mode)</h2>
            <div className="flex gap-2">
                <button onClick={toggleSort} className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-xs text-gray-300 hover:text-white transition">
                    เรียงตาม: {sortOrder === 'asc' ? 'ผิดเยอะสุด 🔻' : 'ถูกเยอะสุด 🔼'}
                </button>
                <div className="flex bg-slate-800 rounded-lg border border-white/10">
                    <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-50">⬅️</button>
                    <span className="px-3 py-2 text-xs flex items-center border-l border-r border-white/10 text-gray-500">{currentPage}/{totalPages}</span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-50">➡️</button>
                </div>
            </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-xl flex flex-col">
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="p-4 w-[10%] text-center">#</th>
                            <th className="p-4 w-[60%]">คำถาม</th>
                            <th className="p-4 w-[15%] text-center">ระดับ</th>
                            <th className="p-4 w-[15%] text-right">ความถูกต้อง</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoadingQuestions ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">กำลังโหลด...</td></tr>
                        ) : questions.map((q, idx) => (
                            <tr key={q.qid} onClick={() => handleQuestionClick(q)} className="hover:bg-indigo-900/20 cursor-pointer transition-colors group">
                                <td className="p-4 text-center text-gray-500">{(currentPage - 1) * 16 + idx + 1}</td>
                                <td className="p-4">
                                    <div className="text-gray-200 font-medium group-hover:text-indigo-300 transition-colors truncate max-w-md">{q.question}</div>
                                    <div className="text-xs text-gray-600 mt-1">ตอบแล้ว {q.totalAttempts} ครั้ง</div>
                                </td>
                                <td className="p-4 text-center"><span className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] rounded-full uppercase border border-red-500/30">{q.level}</span></td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div className={`h-full ${q.correctRate < 30 ? 'bg-red-500' : q.correctRate < 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${q.correctRate}%` }}></div>
                                        </div>
                                        <span className={`font-mono font-bold ${q.correctRate < 30 ? 'text-red-400' : 'text-gray-300'}`}>{q.correctRate.toFixed(0)}%</span>
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

  // 4. Virus Manager (Placeholder for now)
  const VirusManager = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center h-full">
        <div className="text-6xl mb-4 animate-bounce">🦠</div>
        <h2 className="text-2xl font-bold text-red-400 mb-2">ข้อมูลเกม Virus Hunter</h2>
        <div className="bg-slate-900 p-8 rounded-2xl border border-red-500/30 text-center mt-6 shadow-2xl shadow-red-900/20">
            <h3 className="text-gray-500 uppercase text-xs tracking-widest mb-2">ยอดการเล่นทั้งหมด</h3>
            <p className="text-6xl font-black text-white">{data?.overview.totalVirusGames.toLocaleString()}</p>
        </div>
        <p className="mt-8 text-gray-500 text-sm">กราฟและสถิติเชิงลึกกำลังพัฒนา...</p>
    </div>
  );

  // 5. Users Manager (Mockup)
  const UserManager = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-bold text-white mb-6">รายชื่อผู้เล่นทั้งหมด ({data?.overview.totalUsers})</h2>
        <div className="bg-slate-900 rounded-2xl border border-white/10 p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🚧</div>
            <p>หน้าจัดการผู้เล่น (User Management) อยู่ระหว่างการพัฒนา</p>
            <p className="text-xs mt-2">คุณสามารถเพิ่มตารางแสดง User, แบนผู้เล่น, หรือดูประวัติรายบุคคลได้ที่นี่</p>
        </div>
    </div>
  );

  // 6. Add Question (Mockup Form)
  const AddQuestion = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">เพิ่มโจทย์ใหม่</h2>
        <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 shadow-xl">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs text-gray-400 uppercase font-bold mb-2">คำถาม</label>
                    <input type="text" className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" placeholder="ใส่คำถามที่นี่..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {[1,2,3,4].map(i => (
                        <div key={i}>
                            <label className="block text-xs text-gray-400 uppercase font-bold mb-2">ตัวเลือกที่ {i}</label>
                            <input type="text" className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" placeholder={`ตัวเลือก ${i}`} />
                        </div>
                    ))}
                </div>
                <div>
                    <label className="block text-xs text-gray-400 uppercase font-bold mb-2">คำอธิบายเฉลย</label>
                    <textarea className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none h-24" placeholder="อธิบายเพิ่มเติม..."></textarea>
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-900/20">
                    บันทึกข้อมูล
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-slate-950 text-gray-100 font-sans overflow-hidden">
        
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-96 bg-indigo-900/10 blur-[100px] pointer-events-none"></div>

            {currentView === 'dashboard' && <DashboardHome />}
            {currentView === 'quiz_manage' && <QuizManager />}
            {currentView === 'virus_manage' && <VirusManager />}
            {currentView === 'users' && <UserManager />}
            {currentView === 'add_question' && <AddQuestion />}
        </main>

        {/* Modal Popup (ใช้ได้กับหน้า Quiz) */}
        {selectedQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal}>
              <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative transform transition-all animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                  <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-lg bg-white/5 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
                  
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">รายละเอียดข้อสอบ ID: {selectedQuestion.qid}</h3>
                  <p className="text-white font-medium text-lg mb-6 leading-relaxed bg-white/5 p-4 rounded-xl border-l-4 border-indigo-500">
                      {selectedQuestion.question}
                  </p>

                  {isLoadingDetail ? (
                      <div className="text-center py-8 text-sm text-gray-400 animate-pulse">กำลังดึงข้อมูล...</div>
                  ) : (
                      <div className="space-y-4">
                          {questionDetails.map((detail, index) => (
                              <div key={index} className="relative group">
                                  <div className="flex justify-between items-center mb-1 text-sm z-10 relative">
                                      <span className={`font-bold truncate max-w-[70%] ${detail.is_correct ? 'text-green-400' : 'text-gray-400'}`}>
                                          {detail.is_correct && '✅ '} {detail.choice_text}
                                      </span>
                                      <span className="text-gray-300 font-mono">{detail.percent}%</span>
                                  </div>
                                  <div className="w-full h-8 bg-black/40 rounded-lg overflow-hidden relative">
                                      <div 
                                        className={`h-full transition-all duration-700 ${detail.is_correct ? 'bg-green-500/20 border-r-2 border-green-500' : 'bg-gray-700/30'}`} 
                                        style={{ width: `${detail.percent}%` }}
                                      ></div>
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

    </div>
  );
}