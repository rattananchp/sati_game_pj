'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { playSound } from '@/app/lib/sound';

type CellState = 'empty' | 'virus' | 'bomb' | 'file' | 'exploding' | 'boss';
type GameState = 'tutorial' | 'playing' | 'gameover';

const GRID_SIZE = 16;
const GRID_COLS = 'grid-cols-4';

export default function VirusPage() {
    const router = useRouter();
    const [isLoadingBan, setIsLoadingBan] = useState(true); // ✅ New Blocking State

    // ✅ Check Ban Status on Mount
    useEffect(() => {
        const checkBan = async () => {
            const userStr = localStorage.getItem('user');
            if (!userStr) { router.push('/login'); return; }

            const user = JSON.parse(userStr);
            const userId = user.uid || user.id;

            if (!userId) {
                console.error("No User ID found");
                router.push('/login');
                return;
            }

            // Safety Timeout
            const timeoutId = setTimeout(() => {
                setIsLoadingBan(false);
            }, 5000);

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                const res = await fetch(`${apiUrl}/user/status/${userId}`);

                // ✅ Safe JSON Parsing
                if (!res.ok) {
                    console.error("Ban check failed:", res.status);
                    setIsLoadingBan(false); // Fail-open
                    clearTimeout(timeoutId);
                    return;
                }

                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    if (data.is_banned) {
                        alert(`บัญชีของคุณถูกระงับการใช้งาน\nเหตุผล: ${data.ban_reason}`);
                        router.push('/login');
                    } else {
                        setIsLoadingBan(false);
                    }
                } else {
                    console.warn("Ban check returned non-JSON.");
                    setIsLoadingBan(false); // Fallback
                }
                clearTimeout(timeoutId);
            } catch (e) {
                console.error("Check ban error:", e);
                setIsLoadingBan(false); // Fallback
                clearTimeout(timeoutId);
            }
        };
        checkBan();
    }, [router]);

    // --- State ---
    const [view, setView] = useState<GameState>('tutorial');
    const [grid, setGrid] = useState<CellState[]>(Array(GRID_SIZE).fill('empty'));
    const [hp, setHp] = useState(200);
    const [score, setScore] = useState(0);
    const [survivalTime, setSurvivalTime] = useState(0);
    const [showStats, setShowStats] = useState(false);

    // Effect States
    const [isShaking, setIsShaking] = useState(false);
    const [bossHp, setBossHp] = useState(0);

    // Phase 3 Warning States
    const [isPhase3Warning, setIsPhase3Warning] = useState(false);
    const [phase3Countdown, setPhase3Countdown] = useState(3);
    const [hasEnteredPhase3, setHasEnteredPhase3] = useState(false);

    // Phase Logic
    let phase = 1;
    if (survivalTime >= 35) phase = 3;
    else if (survivalTime >= 15) phase = 2;

    // Refs
    const loopRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const bossTimerRef = useRef<number>(0);

    // Helper: Format Time
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // ✅ SAVE SCORE
    const saveScore = async (finalScore: number) => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const userIdToSend = user.uid || user.id;

        if (!userIdToSend) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

            await fetch(`${apiUrl}/submit-score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userIdToSend,
                    score: finalScore,
                    gameType: 'virus',
                    timeTaken: survivalTime,
                    logs: []
                })
            });
            console.log("✅ Virus Score Saved!");
        } catch (e) {
            console.error(e);
        }
    };

    // --- GAME OVER CHECK ---
    useEffect(() => {
        if (hp <= 0 && view === 'playing') {
            saveScore(score);
            const timeoutId = setTimeout(() => {
                setView('gameover');
            }, 0);
            return () => clearTimeout(timeoutId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hp, view, score]);

    // --- PHASE 3 WARNING LOGIC ---
    useEffect(() => {
        if (view === 'playing' && survivalTime === 35 && !hasEnteredPhase3) {
            setHasEnteredPhase3(true);
            setIsPhase3Warning(true);
            setPhase3Countdown(3);
            setGrid(Array(GRID_SIZE).fill('empty')); // ล้างกระดาน
            playSound('wrong');
        }
    }, [survivalTime, hasEnteredPhase3, view]);

    // Countdown Logic
    useEffect(() => {
        if (isPhase3Warning && phase3Countdown > 0) {
            const timer = setTimeout(() => {
                playSound('click');
                setPhase3Countdown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (isPhase3Warning && phase3Countdown === 0) {
            setIsPhase3Warning(false);
        }
    }, [isPhase3Warning, phase3Countdown]);


    // CSS Animation
    const styles = `
    @keyframes shake {
        0% { transform: translate(1px, 1px) rotate(0deg); }
        10% { transform: translate(-1px, -2px) rotate(-1deg); }
        20% { transform: translate(-3px, 0px) rotate(1deg); }
        30% { transform: translate(3px, 2px) rotate(0deg); }
        40% { transform: translate(1px, -1px) rotate(1deg); }
        50% { transform: translate(-1px, 2px) rotate(-1deg); }
        60% { transform: translate(-3px, 1px) rotate(0deg); }
        70% { transform: translate(3px, 1px) rotate(-1deg); }
        80% { transform: translate(-1px, -1px) rotate(1deg); }
        90% { transform: translate(1px, 2px) rotate(0deg); }
        100% { transform: translate(1px, -2px) rotate(-1deg); }
    }
    .animate-shake { animation: shake 0.5s; }
    
    .scanline-effect {
        position: absolute; inset: 0; pointer-events: none;
        background: linear-gradient(to bottom, transparent, rgba(255, 0, 0, 0.1), transparent);
        height: 10px; width: 100%;
        animation: scanline 2s linear infinite;
    }
    @keyframes scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
    }

    @keyframes popIn {
        0% { transform: scale(0.5); opacity: 0; }
        50% { transform: scale(1.2); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
    }
    .animate-pop-in { animation: popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite; }
  `;

    const triggerShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    };

    // Timer
    useEffect(() => {
        if (view !== 'playing' || isPhase3Warning) return;

        timerRef.current = setInterval(() => setSurvivalTime(t => t + 1), 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [view, isPhase3Warning]);

    // Show Stats Delay
    useEffect(() => {
        if (view !== 'gameover') {
            setShowStats(false);
            return;
        }
        const timer = setTimeout(() => {
            setShowStats(true);
        }, 2500);
        return () => clearTimeout(timer);
    }, [view]);

    // SPAWN LOGIC
    useEffect(() => {
        if (view !== 'playing' || isPhase3Warning) {
            if (loopRef.current) clearTimeout(loopRef.current);
            return;
        }

        let spawnRate = 1000;
        let disappearRate = 2500;

        if (phase === 2) {
            spawnRate = 750;
            disappearRate = 2000;
        }
        else if (phase === 3) {
            spawnRate = 500;
            disappearRate = 1500;
        }

        const spawn = () => {
            setGrid(prevGrid => {
                if (isPhase3Warning) return prevGrid;

                const isBossActive = prevGrid.includes('boss');
                bossTimerRef.current += spawnRate;

                const emptyIndices = prevGrid.map((c, i) => c === 'empty' ? i : -1).filter(i => i !== -1);
                if (emptyIndices.length === 0) return prevGrid;

                const randIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                const newGrid = [...prevGrid];

                const r = Math.random();
                let type: CellState = 'virus';
                let currentDisappearRate = disappearRate;

                if (!isBossActive && bossTimerRef.current > 20000 && r > 0.7) {
                    type = 'boss';
                    setBossHp(5);
                    bossTimerRef.current = 0;
                    currentDisappearRate = 5000;
                }
                else {
                    if (phase === 3) {
                        if (r > 0.95) type = 'bomb';
                        else if (r < 0.25) type = 'file';
                    } else {
                        if (r > 0.97) type = 'bomb';
                        else if (r < 0.2) type = 'file';
                    }
                }

                newGrid[randIdx] = type;

                setTimeout(() => {
                    setGrid(currentGrid => {
                        if (isPhase3Warning) return currentGrid;

                        if (currentGrid[randIdx] === type) {
                            const nextGrid = [...currentGrid];
                            nextGrid[randIdx] = 'empty';

                            if (type === 'virus') {
                                setHp(h => Math.max(0, h - 10));
                            } else if (type === 'boss') {
                                triggerShake();
                                playSound('wrong');
                                setHp(h => Math.max(0, h - 100));
                            }
                            return nextGrid;
                        }
                        return currentGrid;
                    });
                }, currentDisappearRate);

                return newGrid;
            });

            loopRef.current = setTimeout(spawn, spawnRate);
        };

        const initialSpawn = setTimeout(spawn, 0);
        return () => {
            clearTimeout(initialSpawn);
            if (loopRef.current) clearTimeout(loopRef.current);
        };
    }, [view, phase, isPhase3Warning]);

    // Click Handler
    const handleHit = (index: number) => {
        if (view !== 'playing' || isPhase3Warning) return;
        const type = grid[index];
        if (type === 'empty' || type === 'exploding') return;

        const newGrid = [...grid];

        if (type === 'boss') {
            if (bossHp > 1) {
                playSound('click');
                setBossHp(prev => prev - 1);
                setScore(s => s + 20);
            } else {
                playSound('smash');
                newGrid[index] = 'empty';
                setScore(s => s + 200);

                // ❌ เอาโค้ดเพิ่มเลือดออกแล้ว (setHp) ❌
                // setHp(h => Math.min(200, h + 30)); 

                setBossHp(0);
            }
        } else if (type === 'virus') {
            playSound('smash');
            newGrid[index] = 'empty';
            setScore(s => s + 10);
        } else if (type === 'bomb') {
            triggerShake();
            playSound('wrong');
            newGrid[index] = 'exploding';
            setHp(0);
        } else if (type === 'file') {
            triggerShake();
            playSound('wrong');
            newGrid[index] = 'exploding';
            setHp(h => Math.max(0, h - 30));
            setScore(s => Math.max(0, s - 50));
            setTimeout(() => {
                setGrid(g => { const n = [...g]; n[index] = 'empty'; return n; });
            }, 300);
        }

        setGrid(newGrid);
    };

    const startGame = () => {
        playSound('click');
        setHp(200);
        setScore(0);
        setSurvivalTime(0);
        setBossHp(0);
        bossTimerRef.current = 0;
        setGrid(Array(GRID_SIZE).fill('empty'));
        setShowStats(false);
        setIsPhase3Warning(false);
        setHasEnteredPhase3(false);
        setPhase3Countdown(3);
        setView('playing');
    };



    return (
        <div className={`relative h-screen w-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-slate-900 font-sans transition-all ${isShaking ? 'animate-shake' : ''}`}>
            <style>{styles}</style>

            {/* Background */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950 pointer-events-none">
                <div className="absolute inset-0 z-0 w-[200%] h-full animate-scroll-bg opacity-40">
                    <div className="w-1/2 h-full bg-cover bg-center grayscale-[50%]" style={{ backgroundImage: "url('/images/bg1.png')" }}></div>
                    <div className="w-1/2 h-full bg-cover bg-center grayscale-[50%]" style={{ backgroundImage: "url('/images/bg1.png')" }}></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/90 z-10"></div>
            </div>

            <button
                onClick={() => {
                    playSound('click');
                    if (view === 'playing') {
                        if (confirm('จบเกมเลยไหม?')) router.push('/');
                    } else {
                        router.push('/');
                    }
                }}
                className="absolute top-4 left-4 z-50 w-10 h-10 md:w-14 md:h-14 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white text-xl hover:bg-red-500/20 hover:border-red-500 transition-all hover:scale-110 cursor-pointer shadow-lg"
            >
                ✕
            </button>

            {/* --- 1. TUTORIAL SCREEN --- */}
            {view === 'tutorial' && (
                <div className="relative z-10 w-full max-w-sm bg-black/60 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl text-center animate-fade-in">
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6 uppercase tracking-wider">
                        คู่มือปราบไวรัส
                    </h1>

                    <div className="flex flex-col gap-3 mb-6">
                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(239,68,68,0.3)]">🦠</div>
                            <div className="text-left"><div className="text-white font-bold">ไวรัส</div><div className="text-gray-400 text-[10px]">ต้องรีบกด! +10 คะแนน</div></div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-2xl animate-pulse">💣</div>
                            <div className="text-left"><div className="text-white font-bold">ระเบิด</div><div className="text-red-400 text-[10px] font-bold">ห้ามกดเด็ดขาด! GAME OVER</div></div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-2xl">📁</div>
                            <div className="text-left"><div className="text-white font-bold">ไฟล์งาน</div><div className="text-gray-400 text-[10px]">ห้ามกด! -30 เลือด / -50 คะแนน</div></div>
                        </div>
                        <div className="flex items-center gap-3 bg-purple-500/20 p-2 rounded-xl border border-purple-500/50 animate-pulse">
                            <div className="w-10 h-10 rounded-lg bg-purple-900/50 border border-purple-500 flex items-center justify-center text-3xl drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">👾</div>
                            <div className="text-left"><div className="text-purple-300 font-bold">บอสไวรัส!</div><div className="text-purple-200 text-[10px]">กด 5 ที! ฆ่าได้ +200 คะแนน</div></div>
                        </div>
                    </div>

                    <button
                        onClick={startGame}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-4 rounded-xl text-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                        พร้อมแล้ว ลุย!
                    </button>
                </div>
            )}

            {/* --- 2. GAMEPLAY SCREEN (THAI UI) --- */}
            {view === 'playing' && (
                <div className="relative z-10 w-full max-w-[420px] flex flex-col gap-6 animate-fade-in">

                    {/* Header Score Bar */}
                    <div className="flex justify-between items-center bg-black/40 p-4 rounded-3xl border border-white/10 backdrop-blur-xl shadow-lg">
                        <div className="text-center min-w-[70px]">
                            <div className="text-[10px] md:text-xs text-gray-400 tracking-widest font-bold">เวลา</div>
                            <div className="text-2xl md:text-3xl font-mono text-white leading-none">{survivalTime}s</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-[10px] md:text-xs text-purple-400 tracking-widest font-bold mb-2">ระดับภัยคุกคาม</div>
                            <div className="flex gap-2">
                                <div className={`w-8 h-2 md:w-10 md:h-3 rounded-full transition-colors ${phase >= 1 ? 'bg-green-500 shadow-[0_0_10px_lime]' : 'bg-gray-700'}`}></div>
                                <div className={`w-8 h-2 md:w-10 md:h-3 rounded-full transition-colors ${phase >= 2 ? 'bg-yellow-500 shadow-[0_0_10px_orange]' : 'bg-gray-700'}`}></div>
                                <div className={`w-8 h-2 md:w-10 md:h-3 rounded-full transition-colors ${phase >= 3 ? 'bg-red-500 shadow-[0_0_10px_red] animate-pulse' : 'bg-gray-700'}`}></div>
                            </div>
                        </div>
                        <div className="text-center min-w-[70px]">
                            <div className="text-[10px] md:text-xs text-blue-400 tracking-widest font-bold">คะแนน</div>
                            <div className="text-2xl md:text-3xl font-black text-blue-300 leading-none">{score}</div>
                        </div>
                    </div>

                    {/* Health Bar */}
                    <div className="relative w-full">
                        <div className="flex justify-between text-xs md:text-sm text-gray-400 mb-2 px-2 font-bold uppercase tracking-wider">
                            <span>สถานะระบบ</span>
                            <span>{hp}/200</span>
                        </div>
                        <div className="w-full bg-black/30 h-3 md:h-4 rounded-full overflow-hidden border border-white/10 shadow-inner relative">
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.2)_1px,transparent_1px)] bg-[size:10%_100%] z-10 pointer-events-none"></div>
                            <div
                                className={`h-full transition-all duration-300 ${hp < 50 ? 'bg-red-500 shadow-[0_0_20px_red] animate-pulse' : 'bg-gradient-to-r from-green-500 to-emerald-400'}`}
                                style={{ width: `${(hp / 200) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* GRID */}
                    <div className={`p-4 bg-black/60 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-2xl transition-all duration-500 ${phase === 3 ? 'border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.2)]' : ''}`}>
                        <div className={`grid ${GRID_COLS} gap-3`}>
                            {grid.map((cell, i) => (
                                <div
                                    key={i}
                                    className={`
                                aspect-square rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-100 select-none border relative overflow-hidden
                                text-4xl md:text-6xl
                                ${cell === 'empty' ? 'bg-white/5 border-white/5 hover:bg-white/10' : ''}
                                ${cell === 'virus' ? 'bg-red-500/20 border-red-500/50 hover:scale-100 active:scale-90 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : ''}
                                ${cell === 'bomb' ? 'bg-orange-500/20 border-orange-500/50 animate-pulse' : ''}
                                ${cell === 'file' ? 'bg-blue-500/20 border-blue-500/50' : ''}
                                ${cell === 'exploding' ? 'bg-red-600 border-red-600 animate-ping' : ''}
                                ${cell === 'boss' ? 'bg-purple-900/80 border-purple-500 animate-pulse drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]' : ''}
                            `}
                                    onMouseDown={() => handleHit(i)}
                                    onTouchStart={(e) => { e.preventDefault(); handleHit(i); }}
                                >
                                    {cell === 'virus' ? '🦠' : cell === 'bomb' ? '💣' : cell === 'file' ? '📁' : cell === 'exploding' ? '💥' : ''}
                                    {cell === 'boss' && (
                                        <>
                                            <span className="text-5xl md:text-7xl">👾</span>
                                            <div className="absolute bottom-2 left-2 right-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-400 transition-all" style={{ width: `${(bossHp / 5) * 100}%` }}></div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Phase 3 Warning */}
                    {isPhase3Warning && (
                        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-xl animate-fade-in">

                            <div className="relative mb-8">
                                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-[6px] border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                    <div className="w-full h-full rounded-full border-t-[6px] border-white animate-spin absolute top-0 left-0"></div>
                                </div>
                                {/* 3 2 1 Countdown */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-7xl md:text-9xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-pop-in">
                                        {phase3Countdown}
                                    </span>
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <h2 className="text-3xl md:text-5xl font-black text-white tracking-widest uppercase italic drop-shadow-md">
                                    ระยะวิกฤต
                                </h2>
                                <p className="text-gray-400 font-mono tracking-[0.2em] text-sm md:text-lg animate-pulse">
                                    เตรียมรับมือการโจมตี!
                                </p>
                            </div>
                        </div>
                    )}

                    {phase === 3 && (
                        <div className="text-center animate-pulse text-red-500 font-bold tracking-widest text-sm md:text-base bg-black/20 p-2 rounded-lg">
                            ⚠️ อันตรายสูงสุด! เร่งความเร็วเต็มพิกัด! ⚠️
                        </div>
                    )}
                </div>
            )}

            {/* --- 3. GAMEOVER SCREEN --- */}
            {view === 'gameover' && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden">

                    {/* ✨ พื้นหลัง */}
                    <div className={`absolute inset-0 bg-slate-950/80 backdrop-blur-lg transition-opacity duration-1000 ${showStats ? 'opacity-100' : 'opacity-0'}`}></div>

                    {/* 🖼️ GIF */}
                    <div className={`absolute inset-0 z-10 flex items-center justify-center transition-all duration-1000 ease-in-out ${showStats ? 'opacity-10 scale-100' : 'opacity-80 scale-110'}`}>
                        <img src="/images/Game_over.gif" alt="GameOver" className="w-full h-auto max-w-none opacity-50 mix-blend-screen" />
                    </div>

                    {/* 📊 กล่องคะแนนสวยๆ */}
                    <div className={`relative z-30 w-full max-w-[380px] p-4 transition-all duration-700 transform ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>

                        <div className="bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(239,68,68,0.2)] p-6 text-center border-t-white/20 overflow-hidden relative">

                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-70"></div>

                            <div className="flex justify-center mb-2">
                                <div className="text-6xl animate-bounce drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">💥</div>
                            </div>

                            <h2 className="text-red-500 font-black text-3xl tracking-wide uppercase drop-shadow-md mb-1">
                                ภารกิจล้มเหลว!
                            </h2>
                            <p className="text-gray-400 text-xs font-medium mb-6">
                                ระบบเสียหายหนักจากการโจมตี
                            </p>

                            {/* ✅ แยก Time & Score */}
                            <div className="flex flex-col gap-3 mb-6">

                                {/* Time Card */}
                                <div className="bg-black/30 border border-cyan-500/20 rounded-xl p-3 flex items-center justify-between shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">⏱️</span>
                                        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">เวลาที่รอด</span>
                                    </div>
                                    <div className="text-3xl font-mono font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                                        {formatTime(survivalTime)}
                                    </div>
                                </div>

                                {/* Score Card */}
                                <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-orange-500/20 rounded-xl p-4 flex flex-col items-center justify-center shadow-lg">
                                    <span className="text-[10px] text-orange-400 font-bold uppercase tracking-[0.2em] mb-1">คะแนนรวมสูงสุด</span>
                                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-orange-300 drop-shadow-[0_2px_10px_rgba(249,115,22,0.4)]">
                                        {score.toLocaleString()}
                                    </div>
                                </div>

                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { playSound('click'); router.push('/'); }}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 rounded-xl border border-white/10 transition-all active:scale-95 text-xs uppercase"
                                >
                                    กลับหน้าหลัก
                                </button>
                                <button
                                    onClick={startGame}
                                    className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-900/20 transition-all active:scale-95 text-xs uppercase flex items-center justify-center gap-2"
                                >
                                    <span>🔄</span> เล่นอีกครั้ง
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`scanline-effect z-20 transition-opacity duration-1000 ${showStats ? 'opacity-20' : 'opacity-0'}`}></div>
        </div>
    );
}