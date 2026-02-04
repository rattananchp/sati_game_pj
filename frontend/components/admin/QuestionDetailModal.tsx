import { QuestionStats, QuestionDetail } from './types';

interface QuestionDetailModalProps {
    question: QuestionStats;
    onClose: () => void;
    API_URL: string;
    details: QuestionDetail[];
    isLoading: boolean;
}

export default function QuestionDetailModal({ question, onClose, details, isLoading }: QuestionDetailModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative transform transition-all animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-lg bg-white/5 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10">✕</button>
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">รายละเอียดข้อสอบ ID: {question.qid}</h3>
                <p className="text-white font-medium text-lg mb-6 leading-relaxed bg-white/5 p-4 rounded-xl border-l-4 border-indigo-500 shadow-inner">{question.question}</p>

                {isLoading ? (
                    <div className="text-center py-8 text-sm text-gray-400 animate-pulse bg-white/5 rounded-xl">กำลังดึงข้อมูลสถิติ...</div>
                ) : (
                    <div className="space-y-4">
                        {details.map((detail, index) => (
                            <div key={index} className="relative group">
                                <div className="flex justify-between items-center mb-1 text-sm z-10 relative">
                                    <span className={`font-bold truncate max-w-[70%] flex items-center gap-2 ${detail.is_correct ? 'text-green-400' : 'text-gray-400'}`}>
                                        {detail.is_correct ? '✅' : '⚪'} {detail.choice_text}
                                    </span>
                                    <span className="text-gray-300 font-mono text-xs">{detail.percent}%</span>
                                </div>
                                <div className="w-full h-8 bg-black/40 rounded-lg overflow-hidden relative border border-white/5">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 ${detail.is_correct ? 'bg-gradient-to-r from-green-900/50 to-green-600/50 border-r-2 border-green-500' : 'bg-gray-700/30'}`}
                                        style={{ width: `${Math.max(detail.percent, 0)}%` }}
                                    >
                                    </div>
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">{detail.count} คน</span>
                                </div>
                            </div>
                        ))}
                        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-gray-500 flex justify-between px-4">
                            <span>ตอบทั้งหมด: <strong className="text-white">{question.totalAttempts}</strong> ครั้ง</span>
                            <span>ความยาก: <strong className={`text-white uppercase px-2 py-0.5 rounded ${question.level === 'hard' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>{question.level}</strong></span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
