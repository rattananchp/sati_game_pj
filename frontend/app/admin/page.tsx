'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Components
import Sidebar from '@/components/admin/Sidebar';
import Dashboard from '@/components/admin/Dashboard';
import QuizAdmin from '@/components/admin/QuizAdmin';
import VirusAdmin from '@/components/admin/VirusAdmin';
import Users from '@/components/admin/Users';
import QuestionAdd from '@/components/admin/QuestionAdd';
import QuestionDetail from '@/components/admin/QuestionDetail';
import QuestionEdit from '@/components/admin/QuestionEdit';
import ChatAdmin from '@/components/admin/ChatAdmin';
// Types
import { ViewState, DashboardData, QuestionStats } from '@/components/admin/types';
import type { QuestionDetail as QuestionDetailType } from '@/components/admin/types';

export default function AdminDashboard() {
    const router = useRouter();
    // ✅ Auto-detect Environment
    let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        API_URL = 'http://localhost:4000';
    }

    // --- State ---
    const [currentView, setCurrentView] = useState<ViewState>('dashboard');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true); // Loading for Auth & Init Data
    const [userRole, setUserRole] = useState<string>('');

    // Shared State for Modals & Actions
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionStats | null>(null);
    const [questionDetails, setQuestionDetails] = useState<QuestionDetailType[]>([]);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

    // 1. Check Auth & Fetch Overview
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) { router.push('/login'); return; }
        try {
            const user = JSON.parse(userStr);
            if (user.role !== 'admin' && user.role !== 'editor') {
                alert("⛔️ คุณไม่มีสิทธิ์เข้าถึงหน้านี้!");
                router.push('/');
            } else {
                setUserRole(user.role);
                setIsAuthorized(true);
                // Fetch Initial Data
                fetch(`${API_URL}/admin/stats`)
                    .then(res => res.json())
                    .then(json => setData(json))
                    .catch(err => console.error(err))
                    .finally(() => setLoading(false));
            }
        } catch (e) {
            router.push('/login');
        }
    }, [router, API_URL]);

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

    const handleDelete = async (qid: number) => {
        if (!confirm("⚠️ คุณแน่ใจหรือไม่ว่าจะลบโจทย์ข้อนี้? \n(ประวัติการตอบของผู้เล่นในข้อนี้จะหายไปด้วย)")) return;

        try {
            const res = await fetch(`${API_URL}/admin/question/delete/${qid}`, { method: 'DELETE' });
            if (res.ok) {
                alert("✅ ลบข้อมูลสำเร็จ");
                handleRefresh();
            } else {
                alert("❌ ลบข้อมูลไม่สำเร็จ");
            }
        } catch (error) {
            console.error(error);
            alert("❌ เชื่อมต่อ Server ไม่ได้");
        }
    };

    if (!isAuthorized || loading) return (
        <div className="min-h-screen bg-transparent flex flex-col items-center justify-center text-white gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <div className="text-gray-400 text-sm animate-pulse">กำลังตรวจสอบสิทธิ์...</div>
        </div>
    );

    return (
        <div className="flex h-screen w-full text-gray-100 font-sans overflow-hidden relative">

            {/* Animated Background Layer */}
            <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
                <div
                    className="absolute inset-0 w-full h-full animate-pan-bg"
                    style={{
                        backgroundImage: "url('/images/bg1.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
            </div>

            {/* Background Overlay for better readability (Removed backdrop-blur for performance) */}
            <div className="absolute inset-0 bg-slate-950/80 pointer-events-none z-0"></div>

            <div className="relative z-10 flex h-full w-full">
                <Sidebar currentView={currentView} setCurrentView={setCurrentView} userRole={userRole} />

                <main className="flex-1 overflow-y-auto p-6 md:p-10 relative custom-scrollbar">
                    {/* Background Ambience (Replaced expensive blur with radial gradient) */}
                    <div className="absolute top-0 left-0 w-full h-96 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>

                    {currentView === 'dashboard' && <Dashboard data={data} />}

                    {currentView === 'quiz_manage' && (
                        <QuizAdmin
                            API_URL={API_URL}
                            onQuestionClick={handleQuestionClick}
                            onEdit={setEditingQuestionId}
                            onDelete={handleDelete}
                            refreshTrigger={refreshTrigger}
                            setCurrentView={setCurrentView}
                        />
                    )}

                    {currentView === 'virus_manage' && <VirusAdmin API_URL={API_URL} />}

                    {currentView === 'users' && userRole === 'admin' && <Users API_URL={API_URL} />}

                    {currentView === 'add_question' && <QuestionAdd API_URL={API_URL} />}

                    {currentView === 'chat_manage' && <ChatAdmin API_URL={API_URL} />}
                </main>

                {/* Modals */}
                {selectedQuestion && (
                    <QuestionDetail
                        question={selectedQuestion}
                        details={questionDetails}
                        isLoading={isLoadingDetail}
                        API_URL={API_URL}
                        onClose={() => setSelectedQuestion(null)}
                    />
                )}

                {editingQuestionId && (
                    <QuestionEdit
                        questionId={editingQuestionId}
                        API_URL={API_URL}
                        onClose={() => setEditingQuestionId(null)}
                        onRefresh={handleRefresh}
                    />
                )}
            </div>
        </div>
    );
}
