import { QuestionStats } from './types';
import type { QuestionDetail as IQuestionDetail } from './types';

interface QuestionDetailProps {
    question: QuestionStats;
    onClose: () => void;
    API_URL: string;
    details: IQuestionDetail[];
    isLoading: boolean;
}

export default function QuestionDetail({ question, onClose, details, isLoading }: QuestionDetailProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300" onClick={onClose}>
            <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                {/* Decorative header bg */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>

                {/* Header */}
                <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center relative z-10 bg-slate-900/50 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xl border border-indigo-500/30 shadow-inner">📊</span>
                        <div>
                            สถิติข้อสอบ <span className="text-indigo-400">#{question.qid}</span>
                        </div>
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-10 h-10 rounded-xl flex items-center justify-center transition-colors border border-white/5 active:scale-95">✕</button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative z-10 space-y-6 bg-[#0E1117]">

                    {/* Question Box */}
                    <div className="w-full bg-[#1C2130] rounded-r-xl p-5 text-white text-lg font-medium shadow-lg border-l-4 border-indigo-400 relative flex items-center min-h-[80px]">
                        {question.question}
                    </div>

                    {isLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 relative z-10"></div>
                            </div>
                            <span className="text-indigo-300 font-mono text-sm tracking-widest animate-pulse">กำลังดึงข้อมูลสถิติ...</span>
                        </div>
                    ) : (
                        <div className="space-y-6 pt-2">
                            {/* Loop Options */}
                            <div className="space-y-6">
                                {[...details].sort((a, b) => b.percent - a.percent).map((detail, index) => (
                                    <div key={index} className="flex flex-col gap-2">

                                        {/* Top Row: Icon, Text, Percentage */}
                                        <div className="flex justify-between items-center w-full px-1">
                                            <div className="flex items-center gap-3">
                                                {/* Status Icon */}
                                                {detail.is_correct ? (
                                                    <div className="w-5 h-5 bg-[#00E676] rounded flex items-center justify-center flex-shrink-0 text-[#0E1117] text-sm font-bold">
                                                        ✓
                                                    </div>
                                                ) : (
                                                    <div className="w-5 h-5 bg-[#E2E8F0] shadow-[inset_0_0_10px_rgba(0,0,0,0.2)] rounded-full flex-shrink-0"></div>
                                                )}

                                                {/* Option Text */}
                                                <span className={`font-bold text-[15px] ${detail.is_correct ? 'text-[#00E676]' : 'text-[#94A3B8]'}`}>
                                                    {detail.choice_text}
                                                </span>
                                            </div>

                                            {/* Percentage */}
                                            <span className="font-bold text-[13px] text-white">
                                                {Number.isInteger(detail.percent) ? detail.percent : detail.percent.toFixed(1)}%
                                            </span>
                                        </div>

                                        {/* Bottom Row: Progress Bar & Count */}
                                        <div className="w-full h-9 bg-[#121620] rounded-md overflow-hidden relative flex items-center">
                                            {/* Filled Bar */}
                                            <div
                                                className={`h-full absolute left-0 top-0 transition-all duration-1000 ease-out border-r-2 ${detail.is_correct ? 'bg-[#0B4627] border-[#00E676]' : 'bg-[#5B1019] border-[#FF3B30]'}`}
                                                style={{ width: `${Math.max(detail.percent, 0)}%` }}
                                            ></div>

                                            {/* Respondent Count Label (Overlaid on the right side) */}
                                            <div className="absolute right-3 text-[11px] text-[#64748B] font-bold z-10">
                                                {detail.count} คน
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isLoading && (
                    <div className="px-6 py-4 bg-slate-900/80 border-t border-white/5 backdrop-blur-md flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">ตอบทั้งหมด:</span>
                            <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">{question.totalAttempts} ครั้ง</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">ความยาก:</span>
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border ${question.level === 'hard' ? 'bg-red-500/10 text-red-400 border-red-500/30' : question.level === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
                                {question.level}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
