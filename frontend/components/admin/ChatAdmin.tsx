'use client';
import { useState, useEffect } from 'react';
import { ChatScenario } from './types';
import ChatEditor from './ChatEditor';

export default function ChatAdmin({ API_URL }: { API_URL: string }) {
    const [scenarios, setScenarios] = useState<ChatScenario[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<ChatScenario | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    
    // State สำหรับตัวกรองหมวดหมู่และแบ่งหน้า
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [page, setPage] = useState(1);
    const limit = 10; // แสดงหน้าละ 10 รายการ

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/chat-scenarios`);
            if (res.ok) {
                const data: ChatScenario[] = await res.json();
                
                // ✅ เรียงลำดับข้อมูล หมวดหมู่ -> Level 
                // เพื่อให้เวลาดู "ทุกหมวดหมู่" มันจะแสดงของหมวดหมู่นั้นๆ 1-10 ให้จบก่อน ค่อยขึ้นหมวดถัดไป
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
        if (!confirm(`⚠️ แน่ใจนะว่าจะลบด่านนี้ ?`)) return;
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

    // กรองข้อมูลตามหมวดหมู่
    const filteredScenarios = scenarios.filter(item => {
        if (filterCategory === 'all') return true;
        return item.category === filterCategory;
    });

    // ✅ คำนวณการแบ่งหน้า (Pagination)
    const totalPages = Math.ceil(filteredScenarios.length / limit) || 1;
    const paginatedScenarios = filteredScenarios.slice((page - 1) * limit, page * limit);

    // เปลี่ยนหมวดหมู่ให้กลับไปหน้า 1 เสมอ
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterCategory(e.target.value);
        setPage(1);
    };

    const handleNextPage = () => setPage(p => Math.min(totalPages, p + 1));
    const handlePrevPage = () => setPage(p => Math.max(1, p - 1));

    return (
        // ✅ ล็อกความสูงหน้าจอ เพื่อไม่ให้ตัวเว็บหลักเลื่อนได้
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col relative overflow-hidden h-[calc(100vh-120px)] w-full">
            
            {/* ส่วน Header และปุ่มต่างๆ (shrink-0 กันโดนบีบ) */}
            <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-wide">
                        💬 จัดการเกมแชท
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">ทั้งหมด {filteredScenarios.length} ด่าน</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <select
                        value={filterCategory}
                        onChange={handleCategoryChange}
                        className="w-full sm:w-auto bg-slate-800 border border-slate-600 text-white px-4 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer appearance-none font-bold text-sm"
                    >
                        <option value="all">📁 ทุกหมวดหมู่</option>
                        <option value="callcenter">📞 แก๊งคอลเซ็นเตอร์</option>
                        <option value="scam">💸 หลอกลงทุน & ความรัก</option>
                        <option value="phishing">🔗 ฟิชชิ่ง & แอปดูดเงิน</option>
                    </select>

                    {/* ✅ ปุ่มเลื่อนหน้าขนาดเล็กด้านบน */}
                    <div className="flex bg-slate-800 rounded-xl border border-slate-700 overflow-hidden w-full sm:w-auto shrink-0">
                        <button onClick={handlePrevPage} disabled={page === 1} className="px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition flex justify-center">⬅️</button>
                        <span className="px-4 py-2.5 text-sm font-bold flex items-center justify-center border-l border-r border-slate-700 text-gray-300 min-w-[50px]">{page}/{totalPages}</span>
                        <button onClick={handleNextPage} disabled={page === totalPages} className="px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition flex justify-center">➡️</button>
                    </div>

                    <button 
                        onClick={() => setIsCreating(true)}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 font-bold text-sm whitespace-nowrap"
                    >
                        + เพิ่มด่านใหม่
                    </button>
                </div>
            </div>

            {/* ตารางแสดงรายการ (flex-1 min-h-0 ทำให้เลื่อนได้แค่ในตาราง) */}
            <div className="flex-1 min-h-0 bg-slate-900/80 rounded-2xl overflow-hidden border border-slate-700/50 shadow-xl backdrop-blur-sm flex flex-col mb-2">
                <div className="overflow-auto flex-1 custom-scrollbar relative">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead className="bg-slate-950/90 text-slate-400 uppercase text-sm font-bold tracking-wider sticky top-0 z-10 backdrop-blur-xl border-b border-slate-800">
                            <tr>
                                <th className="p-5 border-b border-slate-700/50 w-48">หมวดหมู่</th>
                                <th className="p-5 border-b border-slate-700/50 text-center w-24">Level</th>
                                <th className="p-5 border-b border-slate-700/50">ชื่อตัวละคร</th>
                                <th className="p-5 border-b border-slate-700/50 text-center w-40">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading ? (
                                <tr><td colSpan={4} className="p-10 text-center text-gray-500 text-lg animate-pulse">กำลังโหลดข้อมูล...</td></tr>
                            ) : paginatedScenarios.length === 0 ? (
                                <tr><td colSpan={4} className="p-10 text-center text-gray-500 text-lg">ไม่พบข้อมูลด่านในหมวดหมู่นี้</td></tr>
                            ) : paginatedScenarios.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                                    
                                    {/* หมวดหมู่ */}
                                    <td className="p-5">
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase border whitespace-nowrap ${
                                            item.category === 'callcenter' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                            item.category === 'scam' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' :
                                            'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                        }`}>
                                            {item.category}
                                        </span>
                                    </td>

                                    {/* Level */}
                                    <td className="p-5 text-white font-black text-xl text-center">{item.level}</td>
                                    
                                    {/* ชื่อตัวละคร */}
                                    <td className="p-5 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                            {item.avatar}
                                        </div>
                                        <span className="text-gray-100 font-bold text-base line-clamp-1">{item.name}</span>
                                    </td>
                                    
                                    {/* จัดการ */}
                                    <td className="p-5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* ปุ่มแก้ไข */}
                                            <button 
                                                onClick={() => setEditingItem(item)}
                                                className="w-10 h-10 flex items-center justify-center bg-slate-800 border border-slate-700 text-slate-300 rounded-[14px] hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-sm group/btn"
                                                title="แก้ไขด่าน"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover/btn:scale-110 transition-transform">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                </svg>
                                            </button>

                                            {/* ปุ่มลบ */}
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="w-10 h-10 flex items-center justify-center bg-slate-800 border border-slate-700 text-slate-300 rounded-[14px] hover:bg-red-600 hover:text-white hover:border-red-500 transition-all shadow-sm group/btn"
                                                title="ลบด่าน"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover/btn:scale-110 transition-transform">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
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