import { ChangeEvent, useState, useEffect } from 'react';
import { QuestionFormData, Category } from './types';

interface QuestionAddProps {
    API_URL: string;
}

export default function QuestionAdd({ API_URL }: QuestionAddProps) {
    const initialQuestion: QuestionFormData = {
        question: '', choice1: '', choice2: '', choice3: '', choice4: '',
        correctIndex: 0, level: 'hard', explanation: '', cg_id: ''
    };
    const [questions, setQuestions] = useState<QuestionFormData[]>([initialQuestion]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${API_URL}/admin/categories`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data.categories || []);
                }
            } catch (err) { console.error("Failed to load categories", err); }
        };
        fetchCategories();
    }, [API_URL]);

    // Update specific question field
    const handleQuestionChange = (index: number, field: string, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    // Add new question block
    const addQuestion = () => {
        if (questions.length < 5) {
            setQuestions([...questions, initialQuestion]);
        }
    };

    // Remove question block
    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            const newQuestions = questions.filter((_, i) => i !== index);
            setQuestions(newQuestions);
        }
    };

    const handleSubmit = async () => {
        // Validate all questions
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question || !q.choice1 || !q.choice2) {
                alert(`กรุณากรอกข้อมูลให้ครบถ้วนในข้อที่ ${i + 1}`);
                return;
            }
        }

        setIsSubmitting(true);
        let successCount = 0;
        let failCount = 0;

        try {
            for (const q of questions) {
                const payload = {
                    question: q.question,
                    choices: [q.choice1, q.choice2, q.choice3, q.choice4].filter(c => c !== ''),
                    correctIndex: q.correctIndex,
                    level: q.level,
                    explanation: q.explanation,
                    cg_id: q.cg_id === '' ? null : Number(q.cg_id)
                };

                const res = await fetch(`${API_URL}/admin/question/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    successCount++;
                } else {
                    failCount++;
                }
            }

            if (successCount > 0) {
                alert(`✅ เพิ่มโจทย์สำเร็จ ${successCount} ข้อ${failCount > 0 ? ` (ล้มเหลว ${failCount} ข้อ)` : ''}`);
                // Reset form to 1 empty question
                setQuestions([initialQuestion]);
            } else {
                alert("❌ ไม่สามารถเพิ่มโจทย์ได้เลย");
            }

        } catch (error) {
            console.error(error);
            alert("❌ เชื่อมต่อ Server ไม่ได้");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2">
                    <span className="bg-green-500/20 p-2 rounded-lg text-green-400">➕</span> เพิ่มโจทย์ใหม่
                </span>
                <span className="text-sm font-normal text-gray-400 bg-slate-800 px-3 py-1 rounded-full border border-white/10">
                    {questions.length}/5 ข้อ
                </span>
            </h2>

            <div className="space-y-8">
                {questions.map((formData, index) => (
                    <div key={index} className="bg-slate-900 rounded-2xl border border-white/10 p-6 shadow-xl relative overflow-hidden group">
                        {/* Decorative bg */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                        {/* Question Header */}
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5 relative z-10">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="bg-indigo-500 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg shadow-indigo-500/30">{index + 1}</span>
                                โจทย์ข้อที่ {index + 1}
                            </h3>
                            {questions.length > 1 && (
                                <button
                                    onClick={() => removeQuestion(index)}
                                    className="text-gray-500 hover:text-red-400 text-sm flex items-center gap-1 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all"
                                >
                                    🗑️ ลบข้อนี้
                                </button>
                            )}
                        </div>

                        <div className="space-y-6 relative z-10">
                            {/* Level and Category Selectors Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Level Selector */}
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase font-bold mb-3 tracking-wider flex items-center gap-2">
                                        <span>⚡</span> ระดับความยาก
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.level}
                                            onChange={(e) => handleQuestionChange(index, 'level', e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 max-h-48 outline-none text-lg transition-all focus:bg-black/60 shadow-inner appearance-none pr-10 hover:border-white/20 cursor-pointer"
                                        >
                                            <option value="easy" className="bg-slate-900 text-green-400">🌱 Easy</option>
                                            <option value="medium" className="bg-slate-900 text-yellow-400">⚡ Medium</option>
                                            <option value="hard" className="bg-slate-900 text-red-500">🔥 Hard</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Category Selector */}
                                <div>
                                    <label className="block text-xs text-gray-400 uppercase font-bold mb-3 tracking-wider flex items-center gap-2">
                                        <span>📁</span> หมวดหมู่คำถาม
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.cg_id}
                                            onChange={(e) => handleQuestionChange(index, 'cg_id', e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 max-h-48 outline-none text-lg transition-all focus:bg-black/60 shadow-inner appearance-none pr-10 hover:border-white/20 cursor-pointer"
                                        >
                                            <option value="" className="bg-slate-900 text-gray-300">-- ไม่ระบุหมวดหมู่ --</option>
                                            {categories.map((cat) => {
                                                let icon = '📌';
                                                if (cat.mode_cg.includes('ทั่วไป')) icon = '🌍';
                                                else if (cat.mode_cg.includes('สแกม')) icon = '🕵️‍♂️';
                                                else if (cat.mode_cg.includes('ไอที')) icon = '💻';
                                                else if (cat.mode_cg.includes('กฎหมาย') || cat.mode_cg.includes('ไซเบอร์')) icon = '⚖️';

                                                return (
                                                    <option key={cat.cg_id} value={cat.cg_id} className="bg-slate-900 text-gray-200 py-2">
                                                        {icon} {cat.mode_cg}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Question Input */}
                            <div>
                                <label className="block text-xs text-gray-400 uppercase font-bold mb-2 tracking-wider">คำถาม</label>
                                <input
                                    type="text"
                                    value={formData.question}
                                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none text-lg placeholder-gray-600 transition-colors focus:bg-black/60 shadow-inner"
                                    placeholder="พิมพ์คำถามที่นี่..."
                                />
                            </div>

                            {/* Choices */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i, choiceIndex) => (
                                    <div key={i} className={`relative p-3 rounded-xl border transition-all duration-300 ${formData.correctIndex === choiceIndex ? 'bg-green-500/10 border-green-500 shadow-md shadow-green-900/10' : 'bg-transparent border-white/5 hover:border-white/10'}`}>
                                        <div className="flex justify-between items-center mb-2 ml-1">
                                            <label className="text-xs text-gray-400 uppercase font-bold">ตัวเลือกที่ {i}</label>
                                            <div
                                                onClick={() => handleQuestionChange(index, 'correctIndex', choiceIndex)}
                                                className={`cursor-pointer text-xs px-2 py-0.5 rounded-full border transition-all ${formData.correctIndex === choiceIndex ? 'bg-green-500 text-black border-green-500 font-bold' : 'border-gray-600 text-gray-500 hover:border-gray-400'}`}
                                            >
                                                {formData.correctIndex === choiceIndex ? 'คำตอบที่ถูก ✅' : 'ตั้งเป็นคำตอบ'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={(formData as any)[`choice${i}`]}
                                                onChange={(e) => handleQuestionChange(index, `choice${i}`, e.target.value)}
                                                className={`w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none transition-colors ${formData.correctIndex === choiceIndex ? 'text-green-300' : ''}`}
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
                                    value={formData.explanation}
                                    onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none h-24 placeholder-gray-600 transition-colors focus:bg-black/50"
                                    placeholder="อธิบายเบื้องหลังคำตอบเพื่อเป็นความรู้เพิ่มเติม..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        onClick={addQuestion}
                        disabled={questions.length >= 5}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white font-bold py-4 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>➕</span> เพิ่มข้อคำถาม
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-[2] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-900/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                กำลังบันทึก...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2 relative z-10 text-lg">
                                <span>💾</span> บันทึกทั้งหมด ({questions.length} ข้อ)
                            </span>
                        )}
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
                    </button>
                </div>
            </div>
        </div>
    );
}
