import { useEffect, useState } from 'react';
import { QuestionFormData, QuestionDetail } from './types';

interface EditModalProps {
    questionId: number;
    API_URL: string;
    onClose: () => void;
    onRefresh: () => void;
}

export default function EditModal({ questionId, API_URL, onClose, onRefresh }: EditModalProps) {
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

    if (loadingEdit) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div></div>;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in" onClick={onClose}>
            <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 w-8 h-8 rounded-full flex items-center justify-center transition">✕</button>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">✏️ แก้ไขโจทย์ <span className="text-gray-500 text-sm font-normal bg-black/30 px-2 py-0.5 rounded">ID: {questionId}</span></h3>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">คำถาม</label>
                        <input type="text" name="question" value={formData.question} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">ตัวเลือกคำตอบ</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map((i, index) => (
                                <div key={i} className={`p-2 border rounded-lg transition-colors ${formData.correctIndex === index ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
                                    <div className="flex gap-2 items-center">
                                        <input type="radio" name="correctIndex" value={index} checked={formData.correctIndex === index} onChange={() => setFormData(prev => ({ ...prev, correctIndex: index }))} className="accent-green-500 w-4 h-4 cursor-pointer" />
                                        <input type="text" name={`choice${i}`} value={formData[`choice${i}`] as string} onChange={handleChange} className="w-full bg-transparent outline-none text-white text-sm" placeholder={`ตัวเลือกที่ ${i}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">คำอธิบาย</label>
                        <textarea name="explanation" value={formData.explanation} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white h-20 outline-none focus:border-indigo-500" placeholder="คำอธิบายเพิ่มเติม (ถ้ามี)" />
                    </div>
                    <button onClick={handleUpdate} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95">บันทึกการแก้ไข</button>
                </div>
            </div>
        </div>
    );
}
