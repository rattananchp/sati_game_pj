'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { playSound } from '@/app/lib/sound';
import { chatData, ChatScenario, Choice } from '../data';

type Message = {
    type: 'scam' | 'user' | 'system' | 'slip' | 'data';
    text?: string;
    icon?: string;
};

export default function ChatRoomPage() {
    const router = useRouter();
    const params = useParams(); 
    const chatId = params.id as string;

    const [isLoadingBan, setIsLoadingBan] = useState(true);
    const [currentScenario, setCurrentScenario] = useState<ChatScenario | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showChoices, setShowChoices] = useState(false);
    const [currentChoices, setCurrentChoices] = useState<[Choice, Choice] | null>(null);
    const [feedback, setFeedback] = useState<{ show: boolean; isCorrect: boolean; title: string; desc: string; icon: string; } | null>(null);
    const [isGameFinished, setIsGameFinished] = useState(false);
    const [gameResult, setGameResult] = useState<{ isWin: boolean } | null>(null);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const chatBoxRef = useRef<HTMLDivElement>(null);
    const runIdRef = useRef(0);
    const hasLoaded = useRef(false);

    useEffect(() => {
        const checkBan = async () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) { router.push('/login'); return; }
            setIsLoadingBan(false); 
        };
        checkBan();
    }, [router]);

    useEffect(() => {
        if (hasLoaded.current) return;
        hasLoaded.current = true;

        const scenario = chatData.find(c => c.id === chatId);
        if (!scenario) {
            alert('ไม่พบข้อมูลแชทนี้');
            router.push('/game/chat');
            return;
        }

        loadScenario(scenario);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatId]);

    const scrollToBottom = () => {
        if (chatBoxRef.current) {
            setTimeout(() => {
                chatBoxRef.current!.scrollTop = chatBoxRef.current!.scrollHeight;
            }, 50);
        }
    };

    const saveScore = async () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        if (!user.uid && !user.id) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const token = localStorage.getItem('token');
            await fetch(`${apiUrl}/submit-score`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ score: 100, gameType: 'chat' })
            });
        } catch (e) {
            console.error("Save Score Error:", e);
        }
    };

    const runChatSequence = async (msgs: string[]) => {
        const currentRunId = ++runIdRef.current;
        setShowChoices(false);

        for (const msg of msgs) {
            await new Promise(r => setTimeout(r, 600));
            if (runIdRef.current !== currentRunId) return;

            setIsTyping(true);
            scrollToBottom();

            await new Promise(r => setTimeout(r, 1200));
            if (runIdRef.current !== currentRunId) return;

            setIsTyping(false);
            setMessages(prev => [...prev, { type: 'scam', text: msg }]);
            playSound('click');
            scrollToBottom();
        }

        setTimeout(() => {
            if (runIdRef.current !== currentRunId) return;
            setShowChoices(true);
            scrollToBottom();
        }, 500);
    };

    const loadScenario = (scenario: ChatScenario) => {
        setCurrentScenario(scenario);
        setMessages([]);
        setShowChoices(false);
        setCurrentChoices(scenario.choices);
        setGameResult(null);
        setIsGameFinished(false);
        runChatSequence(scenario.msgs);
    };

    const handleGameEnd = useCallback((isWin: boolean) => {
        setIsGameFinished(true);
        setGameResult({ isWin });

        if (isWin && currentScenario) {
            saveScore();
            const savedProgress = JSON.parse(localStorage.getItem('sati_chat_progress') || '{}');
            const currentCatLevel = savedProgress[currentScenario.category] || 1;
            
            if (currentScenario.level >= currentCatLevel) {
                savedProgress[currentScenario.category] = currentScenario.level + 1;
                localStorage.setItem('sati_chat_progress', JSON.stringify(savedProgress));
            }

            const stats = JSON.parse(localStorage.getItem('cyberStakes_played') || '{}');
            localStorage.setItem('cyberStakes_played', JSON.stringify({ ...stats, chat: (stats.chat || 0) + 1 }));
        }
    }, [currentScenario]);

    const showFeedback = (choice: Choice, isWin: boolean) => {
        setFeedback({
            show: true,
            isCorrect: isWin,
            title: choice.memeTitle || (isWin ? "NICE!" : "OH NO!"),
            desc: choice.memeDesc || "",
            icon: choice.memeIcon || (isWin ? "😎" : "💀")
        });
        if (isWin) playSound('correct'); else playSound('wrong');
        
        setTimeout(() => { 
            setFeedback(null); 
            handleGameEnd(isWin); 
        }, 4500);
    };

    const handleWin = (choice: Choice) => {
        setMessages(prev => [...prev, { type: 'scam', text: choice.reaction }]);
        playSound('correct');
        scrollToBottom();
        setTimeout(() => showFeedback(choice, true), 1500);
    };

    const handleLoss = (choice: Choice) => {
        const lossType = choice.lossType || currentScenario?.lossType || 'money';
        const currentRunId = runIdRef.current;

        setTimeout(() => {
            if (runIdRef.current !== currentRunId) return;
            setMessages(prev => [...prev, {
                type: lossType === 'money' ? 'slip' : 'data',
                text: lossType === 'money' ? 'โอนเงินสำเร็จ' : 'ส่งข้อมูลสำเร็จ',
                icon: lossType === 'money' ? '💸' : '📁'
            }]);
            playSound('wrong');
            scrollToBottom();
            setTimeout(() => {
                if (runIdRef.current !== currentRunId) return;
                setMessages(prev => [...prev, { type: 'scam', text: choice.reaction }]);
                setTimeout(() => {
                    if (runIdRef.current !== currentRunId) return;
                    setMessages(prev => [...prev, { type: 'system', text: "🚫 ผู้ใช้นี้ไม่สามารถติดต่อได้" }]);
                    playSound('wrong');
                    scrollToBottom();
                    setTimeout(() => showFeedback(choice, false), 2000);
                }, 1500);
            }, 1500);
        }, 500);
    };

    const handleChoice = (choice: Choice) => {
        setShowChoices(false);
        setMessages(prev => [...prev, { type: 'user', text: choice.text }]);
        playSound('click');
        scrollToBottom();

        setTimeout(() => {
            if (choice.isCorrect === false) handleLoss(choice);
            else if (choice.next) {
                if (choice.reaction) {
                    setMessages(prev => [...prev, { type: 'scam', text: choice.reaction }]);
                    scrollToBottom();
                }
                setTimeout(() => {
                    setCurrentChoices(choice.next!.choices);
                    runChatSequence(choice.next!.msgs);
                }, 1000);
            }
            else if (choice.isCorrect === true) handleWin(choice);
        }, 800);
    };

    const handleRestartLevel = () => {
        playSound('click');
        if (currentScenario) {
            loadScenario(currentScenario);
        }
    };

    const ChoiceButtons = () => (
        <div className="flex flex-col gap-3 w-full">
            {currentChoices?.map((choice, i) => (
                <button
                    key={i}
                    onClick={() => handleChoice(choice)}
                    className="group relative w-full p-4 rounded-2xl border border-slate-700 bg-slate-800/90 hover:bg-slate-700 hover:border-blue-500 transition-all duration-200 shadow-lg active:scale-[0.98] text-left flex items-center justify-between"
                >
                    <div className="flex-1 pr-4">
                        <p className="text-gray-100 text-[15px] font-medium leading-relaxed group-hover:text-white">
                            {choice.text.replace(/^[A-B]:\s*/, '')}
                        </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-inner">
                        ➤
                    </div>
                </button>
            ))}
        </div>
    );

    // ==========================================
    // ส่วนพื้นหลัง (ใช้ร่วมกันทั้งหน้าเล่นและหน้าจบเกม)
    // ==========================================
    const AnimatedBackground = () => (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* รูปภาพเลื่อน */}
            <div className="absolute inset-0 z-0 w-[200%] h-full animate-scroll-bg opacity-30">
                <div className="w-1/2 h-full bg-cover bg-center grayscale-[70%] opacity-60 bg-[url('/images/bg1.png')]"></div>
                <div className="w-1/2 h-full bg-cover bg-center grayscale-[70%] opacity-60 bg-[url('/images/bg1.png')]"></div>
            </div>
            {/* Overlay สีดำไล่ระดับ */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/95 z-10"></div>
            {/* Effect แสงไฟวงกลม */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse-slow mix-blend-screen z-20"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse-slow delay-1000 mix-blend-screen z-20"></div>
        </div>
    );

    // ==========================================
    // หน้าจบเกม
    // ==========================================
    if (isGameFinished) {
        const nextScenario = chatData.find(c => c.category === currentScenario?.category && c.level === currentScenario!.level + 1);

        return (
            <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-950 p-4 relative font-sans overflow-hidden">
                <AnimatedBackground />

                {/* แสงสีตอนจบเกม ชนะ/แพ้ */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-[150px] opacity-20 pointer-events-none transition-colors duration-1000 z-10 ${gameResult?.isWin ? 'bg-green-500' : 'bg-red-600'}`}></div>

                <div className={`relative z-20 bg-slate-900/80 backdrop-blur-2xl border p-8 rounded-[2.5rem] text-center max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.3)] animate-fade-in-up overflow-hidden ${gameResult?.isWin ? 'border-green-500/30' : 'border-red-500/30'}`}>
                    <div className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b opacity-10 pointer-events-none ${gameResult?.isWin ? 'from-green-400 to-transparent' : 'from-red-400 to-transparent'}`}></div>

                    <div className="relative z-10">
                        <div className={`text-[100px] mb-4 drop-shadow-2xl ${gameResult?.isWin ? 'animate-bounce' : 'animate-pulse grayscale-[30%]'}`}>
                            {gameResult?.isWin ? '🏆' : '💀'}
                        </div>
                        
                        <h1 className={`text-3xl font-black mb-3 tracking-wide bg-clip-text text-transparent ${gameResult?.isWin ? 'bg-gradient-to-r from-green-300 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-600'}`}>
                            {gameResult?.isWin ? 'ยอดเยี่ยม! รอดพ้นภัย' : 'เกมโอเวอร์...'}
                        </h1>
                        
                        <p className="text-gray-300 mb-8 text-[14px] px-2 leading-relaxed">
                            {gameResult?.isWin 
                                ? 'คุณมีสติและรับมือได้ดีมาก! มิจฉาชีพทำอะไรคุณไม่ได้ พร้อมลุยด่านต่อไปหรือยัง?' 
                                : 'ไม่เป็นไรนะ ถือเป็นบทเรียน มิจฉาชีพมักจะใช้ความกลัวหรือความโลภมาหลอกเรา ลองตั้งสติแล้วเอาใหม่!'}
                        </p>

                        <div className="flex flex-col gap-3">
                            {gameResult?.isWin && nextScenario && (
                                <button onClick={() => { playSound('click'); router.push(`/game/chat/${nextScenario.id}`); }} className="group w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                                    ลุยด่านต่อไป <span className="group-hover:translate-x-1 transition-transform">➔</span>
                                </button>
                            )}
                            
                            <button onClick={handleRestartLevel} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-400 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md">
                                🔄 {gameResult?.isWin ? 'เล่นด่านนี้ซ้ำ' : 'ตั้งสติแล้วลองใหม่'}
                            </button>

                            <button onClick={() => { playSound('click'); router.push('/game/chat'); }} className="w-full mt-2 text-gray-500 hover:text-gray-300 font-bold py-3 text-sm transition-colors rounded-xl hover:bg-white/5">
                                กลับไปหน้าเมนูแชท
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // หน้าเล่นเกม
    // ==========================================
    return (
        <div className="relative h-screen w-screen flex justify-center items-center bg-slate-950 overflow-x-hidden font-sans">
            
            {/* ✨ เรียกใช้พื้นหลังแบบรูปภาพเลื่อนตรงนี้ ✨ */}
            <AnimatedBackground />

            <div className="relative z-20 flex flex-row items-center justify-center gap-6 lg:gap-10 w-full px-4 max-w-[900px]">

                <div className="relative w-[320px] h-[600px] md:w-[380px] md:h-[700px] border-[6px] md:border-[8px] border-gray-800 rounded-[40px] bg-[#0F172A] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] z-20 shrink-0">
                    
                    <header className="bg-slate-900/90 backdrop-blur-xl p-4 border-b border-slate-800 flex items-center gap-4 z-20 shrink-0 shadow-sm">
                        <button onClick={() => { playSound('click'); setShowExitConfirm(true); }} className="text-2xl text-blue-500 hover:text-blue-400 transition-colors pl-1 cursor-pointer p-2">
                            ‹
                        </button>
                        <div className="relative">
                            <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                                {currentScenario?.avatar || "?"}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-[15px] truncate">{currentScenario?.name || "Loading..."}</h3>
                            <p className="text-[11px] text-gray-400 font-medium mt-0.5">กำลังใช้งาน</p>
                        </div>
                    </header>

                    <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scroll-smooth pb-32 lg:pb-6 [&::-webkit-scrollbar]:hidden bg-[#0B1120]/80">
                        {messages.map((msg, i) => {
                            if (msg.type === 'scam') {
                                return (
                                    <div key={i} className="self-start max-w-[80%] animate-fade-in-up flex gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-auto mb-1 text-sm">
                                            {currentScenario?.avatar}
                                        </div>
                                        <div className="bg-slate-800 text-gray-100 p-3.5 rounded-2xl rounded-bl-sm text-[14px] leading-relaxed shadow-md border border-slate-700/50">
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            } else if (msg.type === 'user') {
                                return (
                                    <div key={i} className="self-end max-w-[80%] animate-fade-in-up">
                                        <div className="bg-blue-600 text-white p-3.5 rounded-2xl rounded-br-sm text-[14px] leading-relaxed shadow-md">
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            } else if (msg.type === 'system') {
                                return (
                                    <div key={i} className="self-center bg-red-950/40 text-red-400 border border-red-900/50 text-[11px] font-bold px-4 py-2 rounded-full my-2 flex items-center gap-2 shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                        {msg.text}
                                    </div>
                                );
                            } else if (msg.type === 'slip' || msg.type === 'data') {
                                return (
                                    <div key={i} className={`self-end w-40 p-3 rounded-2xl text-center border animate-pop-in shadow-lg ${msg.type === 'slip' ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-800 text-blue-400 border-blue-500/30'}`}>
                                        <div className="text-4xl mb-2">{msg.icon}</div>
                                        <div className="font-bold text-[11px]">{msg.text}</div>
                                    </div>
                                );
                            }
                        })}

                        {isTyping && (
                            <div className="self-start flex gap-2 animate-fade-in">
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-auto mb-1 text-sm opacity-50">
                                    {currentScenario?.avatar}
                                </div>
                                <div className="p-3.5 bg-slate-800 rounded-2xl rounded-bl-sm flex gap-1.5 w-fit shadow-md border border-slate-700/50 items-center h-[42px]">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`lg:hidden absolute bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 p-5 pb-8 transition-transform duration-500 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-3xl ${showChoices ? 'translate-y-0' : 'translate-y-full'}`}>
                        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-5"></div>
                        <h2 className="text-[12px] font-bold text-gray-400 mb-4 uppercase tracking-wider flex items-center justify-center gap-2">
                            เลือกข้อความเพื่อตอบกลับ
                        </h2>
                        <ChoiceButtons />
                    </div>

                    {feedback && (
                        <div className="absolute inset-0 z-50 flex flex-col justify-center items-center text-center p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in">
                            <div className={`relative overflow-hidden p-8 rounded-[2rem] border max-w-[300px] w-full shadow-[0_0_50px_rgba(0,0,0,0.4)] transform transition-all scale-100 ${
                                feedback.isCorrect 
                                ? 'bg-gradient-to-b from-green-950/90 to-slate-900/95 border-green-500/50' 
                                : 'bg-gradient-to-b from-red-950/90 to-slate-900/95 border-red-500/50'
                            }`}>
                                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 blur-[60px] rounded-full pointer-events-none ${
                                    feedback.isCorrect ? 'bg-green-500/30' : 'bg-red-500/30'
                                }`}></div>
                                <div className="relative z-10">
                                    <div className={`text-7xl mb-5 drop-shadow-2xl ${feedback.isCorrect ? 'animate-bounce' : 'animate-pulse'}`}>
                                        {feedback.icon}
                                    </div>
                                    <h2 className={`text-2xl font-black mb-3 uppercase tracking-widest bg-clip-text text-transparent ${
                                        feedback.isCorrect ? 'bg-gradient-to-r from-green-300 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'
                                    }`}>
                                        {feedback.title}
                                    </h2>
                                    <p className="text-gray-200 text-[14px] font-medium leading-relaxed">
                                        {feedback.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`hidden lg:flex flex-col w-[320px] xl:w-[380px] absolute left-[calc(50%+200px)] xl:left-[calc(50%+230px)] top-1/2 -translate-y-1/2 z-20 transition-all duration-700 ease-out ${showChoices ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-700/50 pb-5">
                            <span className="relative flex h-3.5 w-3.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500"></span>
                            </span>
                            <h2 className="text-[16px] font-bold text-blue-400 uppercase tracking-widest">
                                คุณจะตอบกลับว่าอย่างไร?
                            </h2>
                        </div>
                        <ChoiceButtons />
                    </div>
                </div>

            </div>

            {showExitConfirm && (
                <div className="fixed inset-0 z-[100] flex flex-col justify-center items-center text-center p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
                    <div className="relative overflow-hidden p-8 rounded-[2.5rem] border border-slate-700 bg-slate-900 max-w-[320px] w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all scale-100">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 blur-[60px] rounded-full pointer-events-none bg-red-600/20"></div>
                        
                        <div className="relative z-10">
                            <div className="text-6xl mb-4 drop-shadow-xl">🚪</div>
                            <h2 className="text-2xl font-black mb-3 text-white">ต้องการออกหรือไม่?</h2>
                            <p className="text-gray-400 text-[14px] font-medium leading-relaxed mb-6">
                                หากคุณออกตอนนี้ ความคืบหน้าของด่านนี้จะไม่ถูกบันทึกนะ!
                            </p>
                            
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => { playSound('click'); setShowExitConfirm(false); }}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-gray-300 bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all active:scale-95"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={() => { playSound('click'); router.push('/game/chat'); }}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all active:scale-95"
                                >
                                    ยืนยันออก
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}