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

export default function AdminDashboard() {
  const router = useRouter();
  
  // State
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'quiz' | 'virus'>('quiz');

  // Pagination & Data
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

  // 2. Fetch Overview
  useEffect(() => {
    if (!isAuthorized) return;
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:4000/admin/stats');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthorized]);

  // 3. Fetch Questions (Hard Only, Limit 16)
  useEffect(() => {
    if (!isAuthorized || activeTab !== 'quiz') return;

    const fetchQuestions = async () => {
        setIsLoadingQuestions(true);
        try {
            // ✅ เปลี่ยน limit เป็น 16 ข้อ
            const res = await fetch(`http://localhost:4000/admin/questions?page=${currentPage}&limit=16&sort=${sortOrder}`);
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
  }, [isAuthorized, activeTab, currentPage, sortOrder]);

  // Actions
  const handleQuestionClick = async (question: QuestionStats) => {
      setSelectedQuestion(question);
      setIsLoadingDetail(true);
      setQuestionDetails([]);
      try {
          const res = await fetch(`http://localhost:4000/admin/question-detail/${question.qid}`);
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

  // Helper: Render Table
  const renderTable = (dataSubset: QuestionStats[], startIndex: number) => (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-3 flex flex-col h-full shadow-sm">
          <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs whitespace-nowrap md:whitespace-normal">
                  <thead className="bg-gray-700/50 text-gray-300">
                      <tr>
                          <th className="p-2 rounded-tl-lg w-[10%] text-center">#</th>
                          <th className="p-2 w-[70%]">คำถาม</th>
                          <th className="p-2 rounded-tr-lg w-[20%] text-right">ความถูกต้อง</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                      {dataSubset.map((q, idx) => (
                          <tr 
                              key={q.qid} 
                              onClick={() => handleQuestionClick(q)}
                              className="hover:bg-indigo-900/30 transition cursor-pointer group"
                          >
                              <td className="p-2 text-center text-gray-500 text-[10px]">
                                  {startIndex + idx + 1}
                              </td>
                              <td className="p-2">
                                  <div className="font-medium text-gray-200 group-hover:text-indigo-300 transition-colors truncate max-w-[150px] md:max-w-none md:whitespace-normal" title={q.question}>
                                      {q.question}
                                  </div>
                                  <div className="text-[9px] text-gray-500 mt-0.5">ตอบแล้ว {q.totalAttempts} ครั้ง</div>
                              </td>
                              <td className="p-2 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                      <div className="w-10 h-1 bg-gray-600 rounded-full overflow-hidden hidden sm:block">
                                          <div className={`h-full ${q.correctRate < 30 ? 'bg-red-500' : q.correctRate < 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${q.correctRate}%` }}></div>
                                      </div>
                                      <span className={`text-[10px] font-bold ${q.correctRate < 30 ? 'text-red-400' : 'text-gray-300'}`}>{q.correctRate.toFixed(0)}%</span>
                                  </div>
                              </td>
                          </tr>
                      ))}
                      {dataSubset.length === 0 && (
                          <tr><td colSpan={3} className="p-4 text-center text-gray-500">ว่าง</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
  );

  if (!isAuthorized) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-sm">กำลังตรวจสอบสิทธิ์...</div>;
  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-sm">กำลังโหลดข้อมูล...</div>;
  if (!data) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-500 text-sm">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>;

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-100 p-3 md:p-6 font-sans">
      
      {/* Container (Compact) */}
      <div className="max-w-5xl mx-auto">
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 shadow-sm flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-lg">👥</div>
                <div><h3 className="text-gray-400 text-[10px] uppercase tracking-wider">ผู้เล่น</h3><p className="text-xl font-bold text-white">{data.overview?.totalUsers || 0}</p></div>
            </div>
            <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 shadow-sm flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-lg">📝</div>
                <div><h3 className="text-gray-400 text-[10px] uppercase tracking-wider">เล่น Quiz</h3><p className="text-xl font-bold text-indigo-400">{data.overview?.totalGames || 0}</p></div>
            </div>
            <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 shadow-sm flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-lg">🦠</div>
                <div><h3 className="text-gray-400 text-[10px] uppercase tracking-wider">เล่น Virus</h3><p className="text-xl font-bold text-red-400">{data.overview?.totalVirusGames || 0}</p></div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
            <button onClick={() => setActiveTab('quiz')} className={`flex-1 py-2 rounded-lg font-bold text-xs md:text-sm transition-all duration-300 border ${activeTab === 'quiz' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}>📝 Quiz (Hard)</button>
            <button onClick={() => setActiveTab('virus')} className={`flex-1 py-2 rounded-lg font-bold text-xs md:text-sm transition-all duration-300 border ${activeTab === 'virus' ? 'bg-red-600 border-red-500 text-white shadow-md' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}>🦠 Virus</button>
        </div>

        {/* Content */}
        {activeTab === 'quiz' && (
            <div className="animate-fade-in w-full">
                
                {/* Header Control */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-3 gap-3 bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                    <h2 className="text-sm md:text-base font-bold text-yellow-400 flex items-center gap-2">
                        {/* ✅ คำนวณช่วงข้อสำหรับ 16 ข้อต่อหน้า */}
                        ⚠️ สถิติรายข้อ (Hard) - หน้า {currentPage} <span className="text-gray-500 text-xs font-normal">({questions.length > 0 ? (currentPage - 1) * 16 + 1 : 0}-{Math.min(currentPage * 16, (currentPage - 1) * 16 + questions.length)})</span>
                    </h2>
                    
                    <div className="flex gap-2 items-center">
                        <button onClick={toggleSort} className="text-[10px] px-2 py-1 rounded border border-gray-600 bg-gray-800 hover:bg-gray-700 transition flex items-center gap-1">
                            เรียงตาม: <span className={sortOrder === 'asc' ? 'text-red-400' : 'text-green-400'}>{sortOrder === 'asc' ? 'ตอบผิดเยอะสุด 🔻' : 'ตอบถูกเยอะสุด 🔼'}</span>
                        </button>
                        
                        <div className="flex gap-1">
                            <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 transition">⬅️</button>
                            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 transition">➡️</button>
                        </div>
                    </div>
                </div>

                {isLoadingQuestions ? (
                    <div className="p-8 text-center text-xs text-gray-500 animate-pulse bg-gray-800 rounded-xl border border-gray-700">กำลังโหลดข้อมูล...</div>
                ) : questions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-500 bg-gray-800 rounded-xl border border-gray-700">ไม่พบข้อมูล</div>
                ) : (
                    // ✅ GRID LAYOUT: แบ่ง 2 คอลัมน์ (ซ้าย 8 ข้อ / ขวา 8 ข้อ)
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {renderTable(questions.slice(0, 8), (currentPage - 1) * 16)}
                        {renderTable(questions.slice(8, 16), (currentPage - 1) * 16 + 8)}
                    </div>
                )}
            </div>
        )}

        {/* Virus Tab */}
        {activeTab === 'virus' && (
            <div className="animate-fade-in flex flex-col items-center justify-center py-8 bg-gray-800 rounded-xl border border-gray-700 w-full shadow-sm">
                <div className="text-4xl mb-3 animate-bounce">🦠</div>
                <h2 className="text-lg font-bold text-red-400 mb-1">ข้อมูลเกม Virus Hunter</h2>
                <div className="bg-gray-900 p-6 rounded-xl border border-red-500/20 text-center mt-4 shadow-inner">
                    <h3 className="text-gray-500 uppercase text-[10px] tracking-widest mb-1">ยอดการเล่นทั้งหมด</h3>
                    <p className="text-4xl font-black text-white">{data.overview?.totalVirusGames || 0}</p>
                </div>
            </div>
        )}
      </div>

      {/* Modal Popup */}
      {selectedQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={closeModal}>
              <div className="bg-gray-800 border border-gray-600 w-full max-w-md rounded-xl shadow-2xl p-5 relative transform transition-all animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                  <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-white transition">✕</button>
                  <h3 className="text-sm font-bold text-indigo-300 mb-2 pr-8">รายละเอียดการตอบ</h3>
                  <p className="text-white font-medium text-base mb-4 leading-snug border-l-2 border-indigo-500 pl-3 bg-indigo-900/10 py-1 rounded-r">
                      {selectedQuestion.question}
                  </p>
                  {isLoadingDetail ? (
                      <div className="text-center py-6 text-xs text-gray-400 animate-pulse">กำลังดึงข้อมูล...</div>
                  ) : (
                      <div className="space-y-3">
                          {questionDetails.map((detail, index) => (
                              <div key={index} className="relative">
                                  <div className="flex justify-between items-center mb-1 text-xs">
                                      <span className={`font-bold truncate max-w-[70%] ${detail.is_correct ? 'text-green-400' : 'text-gray-300'}`}>{detail.is_correct && '✅ '} {detail.choice_text}</span>
                                      <span className="text-gray-400 shrink-0">{detail.count} คน ({detail.percent}%)</span>
                                  </div>
                                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                      <div className={`h-full transition-all duration-500 ${detail.is_correct ? 'bg-green-500' : 'bg-red-500 opacity-70'}`} style={{ width: `${detail.percent}%` }}></div>
                                  </div>
                              </div>
                          ))}
                          <div className="mt-4 pt-3 border-t border-gray-700 text-center text-[10px] text-gray-500">
                              มีคนตอบข้อนี้ไปแล้วทั้งหมด {selectedQuestion.totalAttempts} ครั้ง
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

    </div>
  );
}