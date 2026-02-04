import { ChangeEvent, useState } from 'react';
import { QuestionFormData } from './types';

interface AddQuestionProps {
    API_URL: string;
}

export default function AddQuestion({ API_URL }: AddQuestionProps) {
    const [formData, setFormData] = useState<QuestionFormData>({
        question: '', choice1: '', choice2: '', choice3: '', choice4: '',
        correctIndex: 0, level: 'hard', explanation: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.question || !formData.choice1 || !formData.choice2) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                question: formData.question,
                choices: [formData.choice1, formData.choice2, formData.choice3, formData.choice4].filter(c => c !== ''),
                correctIndex: formData.correctIndex,
                level: formData.level,
                explanation: formData.explanation
            };
            const res = await fetch(`${API_URL}/admin/question/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (res.ok) {
                alert(`✅ เพิ่มโจทย์สำเร็จ!`);
                setFormData({ question: '', choice1: '', choice2: '', choice3: '', choice4: '', correctIndex: 0, level: 'hard', explanation: '' });
            } else {
                alert(`❌ Error: ${json.error}`);
            }
        } catch (error) {
            console.error(error);
            alert("❌ เชื่อมต่อ Server ไม่ได้");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto pb-10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="bg-green-500/20 p-2 rounded-lg text-green-400">➕</span> เพิ่มโจทย์ใหม่
            </h2>
            <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 shadow-xl relative overflow-hidden">
                {/* Decorative bg */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                <div className="space-y-6 relative z-10">
                    {/* Level Selector */}
                    <div>
                        <label className="block text-xs text-gray-400 uppercase font-bold mb-3 tracking-wider">ระดับความยาก</label>
                        <div className="flex gap-4">
                            {['easy', 'medium', 'hard'].map((lvl) => (
                                <label key={lvl} className={`flex-1 cursor-pointer border rounded-xl p-3 text-center uppercase text-sm font-bold transition-all transform hover:scale-[1.02] active:scale-95 ${formData.level === lvl ? (lvl === 'hard' ? 'bg-red-500/20 border-red-500 text-red-400 shadow-lg shadow-red-900/20' : lvl === 'medium' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-lg shadow-yellow-900/20' : 'bg-green-500/20 border-green-500 text-green-400 shadow-lg shadow-green-900/20') : 'bg-black/20 border-white/10 text-gray-500 hover:bg-white/5'}`}>
                                    <input type="radio" name="level" value={lvl} checked={formData.level === lvl} onChange={handleChange} className="hidden" />
                                    <span className="text-xl block mb-1">{lvl === 'hard' ? '🔥' : lvl === 'medium' ? '⚡' : '🌱'}</span>
                                    {lvl}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Question Input */}
                    <div>
                        <label className="block text-xs text-gray-400 uppercase font-bold mb-2 tracking-wider">คำถาม</label>
                        <input
                            type="text"
                            name="question"
                            value={formData.question}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none text-lg placeholder-gray-600 transition-colors focus:bg-black/60 shadow-inner"
                            placeholder="พิมพ์คำถามที่นี่..."
                        />
                    </div>

                    {/* Choices */}
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
                                        type="radio"
                                        name="correctIndex"
                                        value={index}
                                        checked={formData.correctIndex === index}
                                        onChange={() => setFormData(prev => ({ ...prev, correctIndex: index }))}
                                        className="hidden"
                                    />
                                    <input
                                        type="text"
                                        name={`choice${i}`}
                                        value={formData[`choice${i}`] as string}
                                        onChange={handleChange}
                                        className={`w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none transition-colors ${formData.correctIndex === index ? 'text-green-300' : ''}`}
                                        placeholder={`คำตอบ ${i}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Explanation */}
                    <div>
                        <label className="block text-xs text-gray-400 uppercase font-bold mb-2 tracking-wider">คำอธิบายเฉลย (Optional)</label>
                        <textarea
                            name="explanation"
                            value={formData.explanation}
                            onChange={handleChange}
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none h-24 placeholder-gray-600 transition-colors focus:bg-black/50"
                            placeholder="อธิบายเบื้องหลังคำตอบเพื่อเป็นความรู้เพิ่มเติม..."
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-900/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                กำลังบันทึก...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2 relative z-10 text-lg">
                                <span>💾</span> บันทึกโจทย์ใหม่
                            </span>
                        )}
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
                    </button>
                </div>
            </div>
        </div>
    );
}
