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

interface Log {
  al_id: number;
  is_correct: boolean;
  answered_at: string;
  user: { username: string };
  question: { question: string };
  choice: { choice_text: string };
}

interface DashboardData {
  overview: Overview;
  hardestQuestions: QuestionStats[];
  recentLogs: Log[];
}

// ✅ Type สำหรับ Modal รายละเอียด
interface QuestionDetail {
    choice_text: string;
    is_correct: boolean;
    count: number;
    percent: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  
  // Main State
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'quiz' | 'virus'>('quiz');

  // ✅ Modal State
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionStats | null>(null); // ข้อที่ถูกคลิก
  const [questionDetails, setQuestionDetails] = useState<QuestionDetail[]>([]); // ข้อมูลกราฟ
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

  // 2. Fetch Main Data
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

  // ✅ 3. ฟังก์ชันกดดูรายละเอียด (Drill-down)
  const handleQuestionClick = async (question: QuestionStats) => {
      setSelectedQuestion(question);
      setIsLoadingDetail(true);
      setQuestionDetails([]); // ล้างข้อมูลเก่าก่อน

      try {
          // ยิง API ตัวใหม่ที่เราเพิ่งทำ
          const res = await fetch(`http://localhost:4000/admin/question-detail/${question.qid}`);
          const json = await res.json();
          if (json.breakdown) {
              setQuestionDetails(json.breakdown);
          }
      } catch (err) {
          console.error("Fetch detail failed", err);
      } finally {
          setIsLoadingDetail(false);
      }
  };

  // ✅ 4. ฟังก์ชันปิด Modal
  const closeModal = () => {
      setSelectedQuestion(null);
  };

  if (!isAuthorized) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">กำลังตรวจสอบสิทธิ์...</div>;
  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">กำลังโหลดข้อมูล...</div>;
  if (!data) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 border-b border-gray-700 pb-4">
          🛡️ Admin Dashboard
        </h1>

        {/* Global Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">👥</div>
                <div><h3 className="text-gray-400 text-xs uppercase tracking-wider">ผู้เล่นทั้งหมด</h3><p className="text-3xl font-black text-white">{data.overview?.totalUsers || 0} คน</p></div>
            </div>
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-2xl">📝</div>
                <div><h3 className="text-gray-400 text-xs uppercase tracking-wider">เล่น Quiz (รวม)</h3><p className="text-3xl font-black text-indigo-400">{data.overview?.totalGames || 0} ครั้ง</p></div>
            </div>
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-2xl">🦠</div>
                <div><h3 className="text-gray-400 text-xs uppercase tracking-wider">เล่น Virus</h3><p className="text-3xl font-black text-red-400">{data.overview?.totalVirusGames || 0} ครั้ง</p></div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
            <button onClick={() => setActiveTab('quiz')} className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 border ${activeTab === 'quiz' ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}>📝 ข้อมูลเกมตอบคำถาม (Hard Mode Only)</button>
            <button onClick={() => setActiveTab('virus')} className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 border ${activeTab === 'virus' ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}`}>🦠 ข้อมูลเกมไวรัส (Virus)</button>
        </div>

        {/* Content */}
        {activeTab === 'quiz' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                
                {/* ตารางข้อสอบยาก */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                    <h2 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">⚠️ 10 ข้อที่คนตอบผิดเยอะที่สุด (Hard)</h2>
                    <p className="text-gray-400 text-xs mb-6">*คลิกที่ข้อเพื่อดูรายละเอียดการตอบ</p>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-700/50 text-gray-300">
                                <tr>
                                    <th className="p-3 rounded-tl-lg">คำถาม</th>
                                    <th className="p-3 rounded-tr-lg">ความถูกต้อง</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {data.hardestQuestions?.length === 0 && (
                                    <tr><td colSpan={2} className="p-4 text-center text-gray-500">ยังไม่มีข้อมูลการตอบผิด</td></tr>
                                )}
                                {data.hardestQuestions?.map((q) => (
                                    <tr 
                                        key={q.qid} 
                                        onClick={() => handleQuestionClick(q)} // ✅ กดเพื่อเปิด Modal
                                        className="hover:bg-indigo-900/30 transition cursor-pointer group"
                                    >
                                        <td className="p-3 max-w-[200px]">
                                            <div className="truncate font-medium text-gray-200 group-hover:text-indigo-300 transition-colors" title={q.question}>
                                                {q.question}
                                            </div>
                                            <div className="text-[10px] text-gray-500 mt-0.5">ตอบแล้ว {q.totalAttempts} ครั้ง</div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                                                    <div className={`h-full ${q.correctRate < 30 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${q.correctRate}%` }}></div>
                                                </div>
                                                <span className={`text-xs font-bold ${q.correctRate < 30 ? 'text-red-400' : 'text-green-400'}`}>{q.correctRate.toFixed(0)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Real-time Logs */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                    <h2 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2">📝 ประวัติการตอบล่าสุด</h2>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {data.recentLogs?.map((log) => (
                            <div key={log.al_id} className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 text-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-white flex items-center gap-2">👤 {log.user?.username}</span>
                                    <span className="text-[10px] text-gray-500">{new Date(log.answered_at).toLocaleString('th-TH')}</span>
                                </div>
                                <p className="text-gray-400 mb-2 truncate">Q: {log.question?.question}</p>
                                <div className="flex items-center justify-between">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${log.is_correct ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-red-900/30 text-red-400 border border-red-500/30'}`}>
                                        ตอบ: {log.choice?.choice_text}
                                    </span>
                                    {log.is_correct ? '✅' : '❌'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- Virus Tab (เหมือนเดิม) --- */}
        {activeTab === 'virus' && (
            <div className="animate-fade-in flex flex-col items-center justify-center py-10 bg-gray-800 rounded-2xl border border-gray-700">
                <div className="text-6xl mb-4 animate-bounce">🦠</div>
                <h2 className="text-2xl font-bold text-red-400 mb-2">ข้อมูลเกม Virus Hunter</h2>
                <div className="bg-gray-900 p-8 rounded-2xl border border-red-500/20 text-center mt-6">
                    <h3 className="text-gray-500 uppercase text-sm tracking-widest mb-2">ยอดการเล่นทั้งหมด</h3>
                    <p className="text-5xl font-black text-white">{data.overview?.totalVirusGames || 0}</p>
                </div>
            </div>
        )}
      </div>

      {/* ✅ MODAL POPUP (แสดงรายละเอียดเมื่อกดที่ข้อสอบ) */}
      {selectedQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={closeModal}>
              <div 
                  className="bg-gray-800 border border-gray-600 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative transform transition-all animate-in zoom-in-95" 
                  onClick={(e) => e.stopPropagation()} // กดในกล่องไม่ปิด
              >
                  <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">✕</button>
                  
                  <h3 className="text-lg font-bold text-indigo-300 mb-2 pr-8">รายละเอียดการตอบ</h3>
                  <p className="text-white font-medium text-xl mb-6 leading-relaxed">{selectedQuestion.question}</p>

                  {isLoadingDetail ? (
                      <div className="text-center py-8 text-gray-400 animate-pulse">กำลังดึงข้อมูล...</div>
                  ) : (
                      <div className="space-y-4">
                          {questionDetails.map((detail, index) => (
                              <div key={index} className="relative">
                                  {/* Header: Choice Text & Percent */}
                                  <div className="flex justify-between items-center mb-1 text-sm">
                                      <span className={`font-bold ${detail.is_correct ? 'text-green-400' : 'text-gray-300'}`}>
                                          {detail.is_correct && '✅ '} {detail.choice_text}
                                      </span>
                                      <span className="text-gray-400">{detail.count} คน ({detail.percent}%)</span>
                                  </div>
                                  
                                  {/* Progress Bar */}
                                  <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                                      <div 
                                          className={`h-full transition-all duration-500 ${detail.is_correct ? 'bg-green-500' : 'bg-red-500 opacity-70'}`} 
                                          style={{ width: `${detail.percent}%` }}
                                      ></div>
                                  </div>
                              </div>
                          ))}
                          <div className="mt-6 pt-4 border-t border-gray-700 text-center text-xs text-gray-500">
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