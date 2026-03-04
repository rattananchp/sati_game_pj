'use client';
import { useState, useEffect } from 'react';
import { ChatScenario } from './types';
import ChatEditor from './ChatEditor'; // Import ตัวแก้ไขเข้ามาใช้

export default function ChatAdmin({ API_URL }: { API_URL: string }) {
    const [scenarios, setScenarios] = useState<ChatScenario[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<ChatScenario | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/chat-scenarios`);
            if (res.ok) {
                const data = await res.json();
                setScenarios(data);
            } else {
                console.error("Failed to fetch scenarios");
                // ถ้ายังไม่มี API อาจจะ set เป็นว่างไปก่อน
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
        if (!confirm("⚠️ แน่ใจนะว่าจะลบด่านนี้?")) return;
        try {
            const res = await fetch(`${API_URL}/admin/chat-scenarios/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert("ลบสำเร็จ");
                fetchData();
            } else {
                alert("ลบไม่สำเร็จ");
            }
        } catch (e) {
            alert("Error connecting to server");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">🎮 จัดการเกมแชท (Chat Scenarios)</h2>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition-all"
                >
                    + เพิ่มด่านใหม่
                </button>
            </div>

            {/* ตารางแสดงรายการ */}
            <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700 shadow-lg">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/50 text-slate-300 uppercase text-sm font-bold">
                        <tr>
                            <th className="p-4 border-b border-slate-700">ID</th>
                            <th className="p-4 border-b border-slate-700">หมวดหมู่</th>
                            <th className="p-4 border-b border-slate-700 text-center">Level</th>
                            <th className="p-4 border-b border-slate-700">ชื่อตัวละคร</th>
                            <th className="p-4 border-b border-slate-700 text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading...</td></tr>
                        ) : scenarios.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">ไม่พบข้อมูล</td></tr>
                        ) : scenarios.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                                <td className="p-4 font-mono text-xs text-yellow-400">{item.id}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        item.category === 'callcenter' ? 'bg-orange-900/50 text-orange-300' :
                                        item.category === 'scam' ? 'bg-pink-900/50 text-pink-300' :
                                        'bg-blue-900/50 text-blue-300'
                                    }`}>
                                        {item.category}
                                    </span>
                                </td>
                                <td className="p-4 text-white font-bold text-center">{item.level}</td>
                                <td className="p-4 flex items-center gap-3">
                                    <span className="text-2xl">{item.avatar}</span>
                                    <span className="text-gray-200">{item.name}</span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button 
                                        onClick={() => setEditingItem(item)}
                                        className="text-blue-400 hover:text-blue-300 bg-blue-900/20 hover:bg-blue-900/40 px-3 py-1 rounded transition-colors"
                                    >
                                        แก้ไข
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 px-3 py-1 rounded transition-colors"
                                    >
                                        ลบ
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal แก้ไข (เรียกใช้ ChatEditor ที่นี่) */}
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