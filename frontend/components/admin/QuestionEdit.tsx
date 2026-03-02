import { useEffect, useState } from 'react';
import { QuestionFormData, QuestionDetail } from './types';

interface QuestionEditProps {
    questionId: number;
    API_URL: string;
    onClose: () => void;
    onRefresh: () => void;
}

export default function QuestionEdit({ questionId, API_URL, onClose, onRefresh }: QuestionEditProps) {
    const [formData, setFormData] = useState<QuestionFormData>({
        question: '', choice1: '', choice2: '', choice3: '', choice4: '',
        correctIndex: 0, level: 'hard', explanation: ''
    });
    const [loadingEdit, setLoadingEdit] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_URL}/admin/question-detail/${questionId}`);
                const json = await res.json();
                if (res.ok) {
                    setFormData({
                        question: json.question,
                        choice1: json.breakdown[0]?.choice_text || '',
                        choice2: json.breakdown[1]?.choice_text || '',
                        choice3: json.breakdown[2]?.choice_text || '',
                        choice4: json.breakdown[3]?.choice_text || '',
                        correctIndex: json.breakdown.findIndex((c: QuestionDetail) => c.is_correct),
                        level: 'hard', // API Might need update to return level
                        explanation: ''
                    });
                }
            } catch (e) { console.error(e); } finally { setLoadingEdit(false); }
        };
        fetchData();
    }, [API_URL, questionId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            const res = await fetch(`${API_URL}/admin/question/update/${questionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert("✅ แก้ไขข้อมูลสำเร็จ");
                onClose();
                onRefresh();
            } else {
                alert("❌ แก้ไขไม่สำเร็จ");
            }
        } catch (e) { console.error(e); alert("Server Error"); }
    };

    if (loadingEdit) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 relative z-10 shadow-lg"></div>
                </div>
                <p className="text-indigo-300 font-mono tracking-widest text-sm animate-pulse">กำลังโหลดข้อมูล...</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300" onClick={onClose}>
            <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                {/* Decorative header bg */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>

                {/* Header */}
                <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center relative z-10 bg-slate-900/50 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xl border border-indigo-500/30 shadow-inner">✏️</span>
                        <div>
                            แก้ไขโจทย์ <span className="text-indigo-400">#{questionId}</span>
                        </div>
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-10 h-10 rounded-xl flex items-center justify-center transition-colors border border-white/5 active:scale-95">✕</button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative z-10 space-y-6">
                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase mb-2 block tracking-wider">คำถาม</label>
                        <input type="text" name="question" value={formData.question} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none text-lg transition-colors focus:bg-black/60 shadow-inner" placeholder="พิมพ์คำถามที่นี่..." />
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase mb-3 block tracking-wider flex items-center justify-between">
                            <span>ตัวเลือกคำตอบ</span>
                            <span className="text-gray-500 text-[10px] normal-case font-normal">(เลือกคำตอบที่ถูกต้อง 1 ข้อ)</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i, index) => (
                                <div key={i} className={`relative p-3 rounded-xl border transition-all duration-300 ${formData.correctIndex === index ? 'bg-green-500/10 border-green-500 shadow-md shadow-green-900/10' : 'bg-transparent border-white/5 hover:border-white/10'}`}>
                                    <div className="flex justify-between items-center mb-2 ml-1">
                                        <label className="text-xs text-gray-400 uppercase font-bold">ตัวเลือกที่ {i}</label>
                                        <div
                                            onClick={() => setFormData(prev => ({ ...prev, correctIndex: index }))}
                                            className={`cursor-pointer text-xs px-2 py-0.5 rounded-full border transition-all ${formData.correctIndex === index ? 'bg-green-500 text-black border-green-500 font-bold' : 'border-gray-600 text-gray-500 hover:border-gray-400'}`}
                                        >
                                            {formData.correctIndex === index ? 'คำตอบที่ถูก ✅' : 'ตั้งเป็นคำตอบ'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            name={`choice${i}`}
                                            value={formData[`choice${i}` as keyof QuestionFormData] as string}
                                            onChange={(e) => { e.stopPropagation(); handleChange(e); }}
                                            className={`w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none transition-colors ${formData.correctIndex === index ? 'text-green-300' : ''}`}
                                            placeholder={`คำตอบ ${i}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase mb-2 block tracking-wider">คำอธิบายเพิ่มเติม (Optional)</label>
                        <textarea name="explanation" value={formData.explanation} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white h-28 outline-none focus:border-indigo-500 transition-colors focus:bg-black/60 shadow-inner resize-none" placeholder="อธิบายเบื้องหลังคำตอบเพื่อเป็นความรู้เพิ่มเติม..." />
                    </div>
                </div>

                {/* Footer Section */}
                <div className="p-6 border-t border-white/5 bg-slate-900/80 backdrop-blur-md relative z-10">
                    <button onClick={handleUpdate} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/30 active:scale-[0.98] group relative overflow-hidden flex items-center justify-center gap-2 text-lg">
                        <span className="relative z-10">💾 บันทึกการแก้ไข</span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-4">การแก้ไขจะมีผลทันทีกับผู้เล่นทุกคน</p>
                </div>
            </div>
        </div>
    );
}
