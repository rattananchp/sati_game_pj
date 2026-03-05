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
            <div className="bg-slate-900/95 border border-white/10 w-full max-w-2xl rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-white/5" onClick={(e) => e.stopPropagation()}>
                {/* Decorative header bg */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/20 via-indigo-500/5 to-transparent pointer-events-none blur-xl"></div>

                {/* Header */}
                <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center relative z-10 bg-slate-900/50 backdrop-blur-xl">
                    <h3 className="text-xl font-bold text-white flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg border border-white/10">
                                📊
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="tracking-wide text-lg">สถิติข้อสอบ <span className="text-indigo-400 font-mono">#{question.qid}</span></span>
                            {question.category && (
                                <span className="text-xs text-gray-400 font-normal flex items-center gap-1.5 mt-0.5"><span className="text-[10px]">📁</span> หมวดหมู่: <span className="text-gray-300">{question.category}</span></span>
                            )}
                        </div>
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-transparent hover:border-white/10 active:scale-95 shadow-sm">✕</button>
                </div>

                {/* Body Content */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 relative z-10 space-y-8 bg-[#0E1117]/80">

                    {/* Question Box */}
                    <div className="relative overflow-hidden rounded-2xl p-6 border border-white/5 shadow-2xl group bg-[#151924]">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-400 to-purple-500 shadow-[0_0_15px_rgba(129,140,248,0.6)] z-20"></div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-1000 z-0"></div>
                        <div className="relative z-10 text-white text-lg font-medium leading-relaxed">
                            {question.question}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-5">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-l-2 border-indigo-500 relative z-10"></div>
                            </div>
                            <span className="text-indigo-300 font-mono text-xs tracking-widest animate-pulse uppercase">Loading Statistics...</span>
                        </div>
                    ) : (
                        <div className="space-y-6 pt-2">
                            {/* Loop Options */}
                            <div className="space-y-5">
                                {[...details].sort((a, b) => b.percent - a.percent).map((detail, index) => (
                                    <div key={index}
                                        className="flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-4 group/item"
                                        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                                    >
                                        {/* Top Row: Icon, Text, Percentage */}
                                        <div className="flex justify-between items-center w-full px-2">
                                            <div className="flex items-center gap-3.5 max-w-[80%]">
                                                {/* Status Icon */}
                                                {detail.is_correct ? (
                                                    <div className="w-5 h-5 bg-gradient-to-br from-[#00E676] to-[#00A354] rounded-full flex items-center justify-center flex-shrink-0 text-[#0E1117] text-xs font-bold shadow-[0_0_12px_rgba(0,230,118,0.5)] border border-[#00E676]">
                                                        ✓
                                                    </div>
                                                ) : (
                                                    <div className="w-5 h-5 bg-slate-800 border-[1.5px] border-slate-600 shadow-inner rounded-full flex-shrink-0 opacity-70"></div>
                                                )}

                                                {/* Option Text */}
                                                <span className={`font-semibold text-[15.5px] truncate transition-colors ${detail.is_correct ? 'text-[#00E676]' : 'text-gray-300 group-hover/item:text-gray-200'}`}>
                                                    {detail.choice_text}
                                                </span>
                                            </div>

                                            {/* Percentage */}
                                            <span className={`font-black tracking-wider text-sm ${detail.is_correct ? 'text-[#00E676]' : 'text-white'}`}>
                                                {Number.isInteger(detail.percent) ? detail.percent : detail.percent.toFixed(1)}%
                                            </span>
                                        </div>

                                        {/* Bottom Row: Progress Bar & Count */}
                                        <div className="w-full h-[42px] bg-black/40 border border-white/5 rounded-xl overflow-hidden relative flex items-center shadow-inner group-hover/item:border-white/10 transition-colors">
                                            {/* Filled Bar */}
                                            <div
                                                className={`h-full absolute left-0 top-0 transition-all duration-[1500ms] ease-out flex items-center justify-end ${detail.is_correct
                                                        ? 'bg-gradient-to-r from-[rgba(0,230,118,0.1)] to-[rgba(0,230,118,0.25)] border-r-[3px] border-[#00E676] shadow-[inset_0_0_20px_rgba(0,230,118,0.15)]'
                                                        : 'bg-gradient-to-r from-[rgba(255,59,48,0.05)] to-[rgba(255,59,48,0.15)] border-r-[2px] border-[#FF3B30] opacity-80'
                                                    }`}
                                                style={{ width: `${Math.max(detail.percent, 0)}%` }}
                                            >
                                                {/* Sparkle effect on correct bar */}
                                                {detail.is_correct && detail.percent > 0 && (
                                                    <div className="w-[3px] h-full bg-white/60 blur-[2px] absolute right-0"></div>
                                                )}
                                            </div>

                                            {/* Highlight effect over the entire bar wrapper depending on correct/incorrect */}
                                            {detail.is_correct && <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#00E676]/5 pointer-events-none"></div>}

                                            {/* Respondent Count Label (Overlaid on the right side) */}
                                            <div className="absolute right-3 text-[12px] text-gray-300 font-bold z-10 bg-black/50 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/5 shadow-sm">
                                                {detail.count} <span className="text-[10px] font-normal text-gray-500 ml-0.5">คนตอบ</span>
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
                    <div className="px-6 py-5 bg-slate-900 border-t border-white/5 flex justify-between items-center relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] rounded-b-3xl">
                        <div className="flex items-center gap-2.5">
                            <span className="text-gray-400 text-sm">จำนวนคนตอบทั้งหมด:</span>
                            <span className="font-bold text-white bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-lg text-sm shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                                {question.totalAttempts} ครั้ง
                            </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="text-gray-400 text-sm">เลเวล:</span>
                            <span className={`px-3 py-1.5 rounded-lg text-[11px] font-black tracking-widest uppercase border ${question.level === 'hard'
                                    ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                                    : question.level === 'medium'
                                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                                        : 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                                }`}>
                                {question.level}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
