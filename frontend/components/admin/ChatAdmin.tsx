'use client';
import { useState, useEffect } from 'react';
import { ChatScenario } from './types';
import ChatEditor from './ChatEditor';

export default function ChatAdmin({ API_URL }: { API_URL: string }) {
    const [scenarios, setScenarios] = useState<ChatScenario[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<ChatScenario | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    
    // ✅ เพิ่ม State สำหรับตัวกรองหมวดหมู่
    const [filterCategory, setFilterCategory] = useState<string>('all');

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/chat-scenarios`);
            if (res.ok) {
                const data: ChatScenario[] = await res.json();
                
                // เรียงลำดับข้อมูล หมวดหมู่ -> Level ก่อนนำไปเก็บ
                const sortedData = data.sort((a, b) => {
                    if (a.category !== b.category) {
                        return a.category.localeCompare(b.category);
                    }
                    return a.level - b.level;
                });
                
                setScenarios(sortedData);
            } else {
                console.error("Failed to fetch scenarios");
                setScenarios([]);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm(`⚠️ แน่ใจนะว่าจะลบด่านรหัส ${id} ?`)) return;
        try {
            const res = await fetch(`${API_URL}/admin/chat-scenarios/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData(); 
            } else {
                alert("ลบไม่สำเร็จ กรุณาลองใหม่");
            }
        } catch (e) {
            alert("Error connecting to server");
        }
    };

    // ✅ กรองข้อมูลก่อนนำไปแสดงผล
    const filteredScenarios = scenarios.filter(item => {
        if (filterCategory === 'all') return true;
        return item.category === filterCategory;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* ส่วน Header และปุ่มต่างๆ */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-wide">
                        💬 จัดการเกมแชท
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">ทั้งหมด {scenarios.length} ด่าน</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    {/* ✅ Dropdown ตัวกรองหมวดหมู่ */}
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full sm:w-auto bg-slate-800 border border-slate-600 text-white px-4 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer appearance-none font-medium"
                    >
                        <option value="all">📁 ทุกหมวดหมู่</option>
                        <option value="callcenter">📞 แก๊งคอลเซ็นเตอร์</option>
                        <option value="scam">💸 หลอกลงทุน & ความรัก</option>
                        <option value="phishing">🔗 ฟิชชิ่ง & แอปดูดเงิน</option>
                    </select>

                    <button 
                        onClick={() => setIsCreating(true)}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 font-bold whitespace-nowrap"
                    >
                        + เพิ่มด่านใหม่
                    </button>
                </div>
            </div>

            {/* ตารางแสดงรายการ */}
            <div className="bg-slate-900/80 rounded-xl overflow-hidden border border-slate-700/50 shadow-xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-slate-950/50 text-slate-400 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="p-4 border-b border-slate-700/50 w-24">ID</th>
                                <th className="p-4 border-b border-slate-700/50 w-40">หมวดหมู่</th>
                                <th className="p-4 border-b border-slate-700/50 text-center w-20">Level</th>
                                <th className="p-4 border-b border-slate-700/50">ชื่อตัวละคร</th>
                                <th className="p-4 border-b border-slate-700/50 text-right w-40">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading ? (
                                <tr><td colSpan={5} className="p-10 text-center text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</td></tr>
                            ) : filteredScenarios.length === 0 ? (
                                <tr><td colSpan={5} className="p-10 text-center text-gray-500">ไม่พบข้อมูลด่านในหมวดหมู่นี้</td></tr>
                            ) : filteredScenarios.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-4 font-mono text-xs text-yellow-400/80">{item.id}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border whitespace-nowrap ${
                                            item.category === 'callcenter' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                            item.category === 'scam' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' :
                                            'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                        }`}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-white font-bold text-center">{item.level}</td>
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                                            {item.avatar}
                                        </div>
                                        <span className="text-gray-200 font-medium line-clamp-1">{item.name}</span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button 
                                            onClick={() => setEditingItem(item)}
                                            className="text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-all text-sm font-medium"
                                        >
                                            แก้ไข
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-all text-sm font-medium"
                                        >
                                            ลบ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal แก้ไข/เพิ่ม (ChatEditor) */}
            {(editingItem || isCreating) && (
                <ChatEditor 
                    key={editingItem ? editingItem.id : 'new-item'} 
                    initialData={editingItem} 
                    API_URL={API_URL}
                    onClose={() => { setEditingItem(null); setIsCreating(false); }}
                    onSuccess={() => { setEditingItem(null); setIsCreating(false); fetchData(); }}
                />
            )}
        </div>
    );
}