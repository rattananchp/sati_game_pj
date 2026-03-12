'use client';
import { useEffect, useState } from 'react';
import { User } from './types';

interface UsersProps {
    API_URL: string;
    currentUserRole: string; // admin หรือ editor
}

export default function Users({ API_URL, currentUserRole }: UsersProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    
    const [activeTab, setActiveTab] = useState<'player' | 'staff'>('player');

    // ✅ State สำหรับจัดการหน้าต่างแก้ไขข้อมูล
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editFormData, setEditFormData] = useState({ username: '', email: '', phone: '' });

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/admin/users?page=${page}&limit=8&search=${search}&tab=${activeTab}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await res.json();
            if (json.users) {
                setUsers(json.users);
                setTotalPage(json.totalPages || 1);
                setTotalUsers(json.total || 0);
            } else {
                setUsers([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [page, search, activeTab, API_URL]);

    const handleDelete = async (uid: number) => {
        if (!confirm("คุณต้องการลบผู้ใช้งานคนนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/admin/user/${uid}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                alert("ลบผู้ใช้งานเรียบร้อยแล้ว");
                fetchUsers();
            } else {
                alert(data.error || "ลบผู้ใช้งานไม่สำเร็จ");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("เชื่อมต่อ Server ไม่ได้");
        }
    };

    const handleRoleChange = async (uid: number, newRole: string) => {
        if (!confirm(`คุณต้องการเปลี่ยนสิทธิ์ผู้ใช้นี้เป็น ${newRole} ใช่หรือไม่?`)) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/admin/user/${uid}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });
            const data = await res.json();

            if (res.ok) {
                fetchUsers();
            } else {
                alert(data.error || "เปลี่ยนสิทธิ์ไม่สำเร็จ");
            }
        } catch (err) {
            console.error("Update role error:", err);
            alert("เชื่อมต่อ Server ไม่ได้");
        }
    };

    // ✅ ฟังก์ชันเปิดหน้าต่างแก้ไข
    const openEditModal = (user: User) => {
        setEditingUser(user);
        setEditFormData({
            username: user.username,
            email: user.email,
            phone: user.phone || ''
        });
    };

    // ✅ ฟังก์ชันบันทึกข้อมูลที่แก้ไข
    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/admin/user/${editingUser.uid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editFormData)
            });
            const data = await res.json();

            if (res.ok) {
                alert("อัปเดตข้อมูลสำเร็จ");
                setEditingUser(null); // ปิด Modal
                fetchUsers(); // รีโหลดข้อมูลใหม่
            } else {
                alert(data.error || "อัปเดตข้อมูลไม่สำเร็จ");
            }
        } catch (err) {
            console.error("Update user error:", err);
            alert("เชื่อมต่อ Server ไม่ได้");
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col relative">

            {/* --- Header & Controls --- */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl border border-emerald-500/30 shadow-inner">👥</div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-wide">จัดการผู้ใช้งาน</h2>
                        <p className="text-gray-400 text-sm">จำนวนทั้งหมด: <span className="text-emerald-400 font-bold">{totalUsers}</span> คน</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 w-full sm:w-auto shrink-0">
                        <button
                            onClick={() => { setActiveTab('player'); setPage(1); }}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'player' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            🎮 ผู้เล่นทั่วไป
                        </button>
                        <button
                            onClick={() => { setActiveTab('staff'); setPage(1); }}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'staff' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            🛡️ ทีมงาน
                        </button>
                    </div>

                    <div className="relative group w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-400 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อหรืออีเมล..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-1 transition-all placeholder:text-gray-500"
                        />
                    </div>

                    <div className="flex bg-slate-800 rounded-xl border border-slate-700 overflow-hidden w-full sm:w-auto shrink-0">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex-1 sm:flex-none px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition flex justify-center">⬅️</button>
                        <span className="px-4 py-2.5 text-sm font-bold flex items-center justify-center border-l border-r border-slate-700 text-gray-300 min-w-[60px]">{page} / {totalPage}</span>
                        <button onClick={() => setPage(p => Math.min(totalPage, p + 1))} disabled={page === totalPage} className="flex-1 sm:flex-none px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition flex justify-center">➡️</button>
                    </div>
                </div>
            </div>

            {/* --- Table --- */}
            <div className="flex-1 bg-slate-900/80 rounded-2xl border border-slate-700 overflow-hidden shadow-xl flex flex-col backdrop-blur-md">
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-sm min-w-[850px]">
                        <thead className="bg-slate-950/80 text-gray-400 uppercase text-xs sticky top-0 z-10">
                            <tr>
                                <th className="p-4 w-[8%] text-center border-b border-slate-800">ID</th>
                                <th className="p-4 w-[32%] pl-8 border-b border-slate-800">ผู้ใช้งาน</th> 
                                <th className="p-4 w-[25%] border-b border-slate-800">ข้อมูลติดต่อ</th>
                                <th className="p-4 w-[20%] text-center border-b border-slate-800">สถานะ (Role)</th>
                                <th className="p-4 w-[15%] text-center border-b border-slate-800">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-20 text-center text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="p-20 text-center text-gray-500">ไม่พบรายชื่อในหมวดหมู่นี้</td></tr>
                            ) : users.map((u) => {

                                const isTargetAdmin = u.role === 'admin';
                                const isTargetUser = u.role === 'user';

                                let canManage = false; // ตัวแปรเดียวคุมทั้ง ลบ และ แก้ไขข้อมูล
                                
                                if (currentUserRole === 'admin') {
                                    canManage = !isTargetAdmin; // Admin จัดการได้ทุกคน ยกเว้น Admin
                                } else if (currentUserRole === 'editor') {
                                    canManage = isTargetUser;   // Editor จัดการได้เฉพาะ User
                                }

                                return (
                                    <tr key={u.uid} className="hover:bg-slate-800/40 transition-all group">
                                        <td className="p-4 text-center text-gray-500 font-mono text-xs">#{u.uid}</td>
                                        
                                        <td className="p-4 pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border shadow-inner shrink-0 
                                                    ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 
                                                      u.role === 'editor' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 
                                                      'bg-slate-800 text-gray-400 border-slate-600'}`}>
                                                    {u.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className={`font-bold text-base flex items-center gap-2 truncate
                                                        ${u.role === 'admin' ? 'text-indigo-400' : u.role === 'editor' ? 'text-emerald-400' : 'text-gray-300'}`}>
                                                        <span className="truncate max-w-[200px] xl:max-w-[300px]">{u.username}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="text-gray-400 text-sm space-y-1">
                                                <div className="flex items-center gap-2 truncate"><span className="opacity-60">📧</span> <span className="truncate">{u.email}</span></div>
                                                <div className="flex items-center gap-2"><span className="opacity-60">📱</span> {u.phone || <span className="text-gray-600 italic">ไม่มีข้อมูล</span>}</div>
                                            </div>
                                        </td>
                                        
                                        <td className="p-4 text-center">
                                            {canManage ? (
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                                                    className="px-3 py-2 rounded-lg text-xs font-bold border border-slate-600 bg-slate-800 text-white cursor-pointer focus:outline-none focus:border-indigo-500 transition-colors w-full max-w-[120px] mx-auto"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="editor">Editor</option>
                                                    {currentUserRole === 'admin' && <option value="admin">Admin</option>}
                                                </select>
                                            ) : (
                                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border inline-block min-w-[80px]
                                                    ${u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 
                                                      u.role === 'editor' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                                                      'bg-slate-800 text-gray-400 border-slate-700'}`}>
                                                    {u.role}
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4 text-center">
                                            {canManage ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* ✅ ปุ่มแก้ไขข้อมูล (ดินสอ) */}
                                                    <button
                                                        onClick={() => openEditModal(u)}
                                                        className="p-2 bg-slate-800 border border-slate-700 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-sm"
                                                        title="แก้ไขข้อมูลติดต่อ"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                                                    </button>
                                                    
                                                    {/* ปุ่มลบ */}
                                                    <button
                                                        onClick={() => handleDelete(u.uid)}
                                                        className="p-2 bg-slate-800 border border-slate-700 text-red-400 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-500 transition-all shadow-sm"
                                                        title="ลบผู้ใช้งาน"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-500 font-medium">ไม่สามารถจัดการได้</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ✅ Modal แก้ไขข้อมูลผู้ใช้ */}
            {editingUser && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
                        
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="text-blue-400">✏️</span> แก้ไขข้อมูลติดต่อ
                        </h3>

                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">ชื่อผู้ใช้งาน (Username)</label>
                                <input 
                                    type="text" required
                                    value={editFormData.username}
                                    onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">อีเมล (Email)</label>
                                <input 
                                    type="email" required
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">เบอร์โทรศัพท์ (Phone)</label>
                                <input 
                                    type="text" 
                                    value={editFormData.phone}
                                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-800 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setEditingUser(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-600 text-gray-300 hover:bg-slate-800 transition-colors font-medium"
                                >
                                    ยกเลิก
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                >
                                    บันทึกการแก้ไข
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}