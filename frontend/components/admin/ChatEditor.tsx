'use client';
import { useState } from 'react';
// ✅ 1. Import Choice เข้ามาด้วย
import { ChatScenario, Choice } from './types';

interface Props {
    initialData: ChatScenario | null;
    API_URL: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ChatEditor({ initialData, API_URL, onClose, onSuccess }: Props) {
    
    // กำหนดค่าเริ่มต้น
    const [formData, setFormData] = useState(() => {
        if (initialData) {
            return {
                id: initialData.id,
                category: initialData.category,
                categoryTitle: initialData.categoryTitle,
                level: initialData.level,
                name: initialData.name,
                avatar: initialData.avatar,
                lossType: initialData.lossType || 'money'
            };
        }
        return {
            id: '',
            category: 'callcenter',
            categoryTitle: '📞 แก๊งคอลเซ็นเตอร์ & แอบอ้าง',
            level: 1,
            name: '',
            avatar: '',
            lossType: 'money'
        };
    });

    // กำหนด JSON เริ่มต้น
    const [jsonContent, setJsonContent] = useState(() => {
        if (initialData) {
            return JSON.stringify({
                msgs: initialData.msgs,
                choices: initialData.choices
            }, null, 2);
        }
        return JSON.stringify({
            msgs: ["ข้อความที่ 1", "ข้อความที่ 2"],
            choices: [
                { 
                    text: "ตัวเลือก A", 
                    isCorrect: false, 
                    reaction: "ตอบผิดครับ", 
                    memeTitle: "Fail", memeDesc: "คำอธิบาย", memeIcon: "💀" 
                },
                { 
                    text: "ตัวเลือก B", 
                    isCorrect: true, 
                    reaction: "ถูกต้องครับ", 
                    memeTitle: "Win", memeDesc: "คำอธิบาย", memeIcon: "🏆" 
                }
            ]
        }, null, 2);
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // ✅ 2. แก้ตรงนี้: เปลี่ยน any[] เป็น Choice[]
            const parsedContent = JSON.parse(jsonContent) as { msgs: string[], choices: Choice[] };
            
            const payload = {
                ...formData,
                ...parsedContent,
                lossType: formData.lossType as 'money' | 'data'
            };

            const url = initialData 
                ? `${API_URL}/admin/chat-scenarios/${initialData.id}` 
                : `${API_URL}/admin/chat-scenarios`;
            
            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("✅ บันทึกข้อมูลสำเร็จ");
                onSuccess();
            } else {
                alert("❌ บันทึกไม่สำเร็จ");
            }
        } catch (error) {
            alert("⚠️ รูปแบบ JSON ไม่ถูกต้อง กรุณาตรวจสอบวงเล็บปีกกาหรือลูกน้ำ");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                
                <div className="p-5 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">
                        {initialData ? '✏️ แก้ไขด่าน' : '✨ เพิ่มด่านใหม่'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* ส่วน Grid Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Scenario ID (ห้ามซ้ำ)</label>
                            <input 
                                type="text" 
                                value={formData.id}
                                onChange={e => setFormData({...formData, id: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="เช่น callcenter-1"
                                disabled={!!initialData}
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-400 mb-1">หมวดหมู่ (Category)</label>
                                <select 
                                    value={formData.category}
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none"
                                >
                                    <option value="callcenter">Call Center</option>
                                    <option value="scam">Scam</option>
                                    <option value="phishing">Phishing</option>
                                </select>
                            </div>
                            <div className="w-24">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Level</label>
                                <input 
                                    type="number" 
                                    value={formData.level}
                                    onChange={e => setFormData({...formData, level: Number(e.target.value)})}
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">ชื่อตัวละคร (Name)</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="w-24">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Emoji</label>
                                <input 
                                    type="text" 
                                    value={formData.avatar}
                                    onChange={e => setFormData({...formData, avatar: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-center text-2xl outline-none"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-400 mb-1">ประเภทความเสียหาย</label>
                                <select 
                                    value={formData.lossType}
                                    onChange={e => setFormData({...formData, lossType: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white outline-none"
                                >
                                    <option value="money">เสียเงิน (Money)</option>
                                    <option value="data">เสียข้อมูล (Data)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-700 my-4"></div>

                    {/* ส่วน JSON Editor */}
                    <div className="flex flex-col h-[400px]">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-bold text-blue-400">
                                📝 บทสนทนาและตัวเลือก (JSON Format)
                            </label>
                            {/* ✅ 3. แก้ตรงนี้: ใช้ &quot; แทน " */}
                            <span className="text-xs text-gray-500">
                                *แก้ไขข้อความในรูปแบบ JSON ระวังเครื่องหมาย , และ &quot;&quot;
                            </span>
                        </div>
                        <textarea
                            value={jsonContent}
                            onChange={e => setJsonContent(e.target.value)}
                            className="flex-1 w-full bg-[#0d1117] text-green-400 font-mono text-sm p-4 rounded-xl border border-slate-700 focus:border-blue-500 outline-none resize-none leading-relaxed"
                            spellCheck={false}
                        />
                    </div>

                </form>

                <div className="p-5 border-t border-slate-700 bg-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-gray-300 hover:bg-slate-700 transition-colors font-medium">ยกเลิก</button>
                    <button onClick={handleSubmit} className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all font-bold flex items-center gap-2">💾 บันทึกข้อมูล</button>
                </div>
            </div>
        </div>
    );
}