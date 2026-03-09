import { useEffect, useState } from 'react';
import { User } from './types';

interface UsersProps {
    API_URL: string;
}

export default function Users({ API_URL }: UsersProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/users?page=${page}&limit=10&search=${search}`);
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
    }, [page, search, API_URL]);


    const handleDelete = async (uid: number) => {
        if (!confirm("คุณต้องการลบผู้ใช้งานคนนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;

        try {
            const res = await fetch(`${API_URL}/admin/user/${uid}`, {
                method: 'DELETE',
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

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col relative">

            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4 bg-slate-900/50 p-4 xl:p-2 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4 xl:pl-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl border border-emerald-500/30 shadow-inner">
                        👥
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-wide">รายชื่อผู้เล่นทั้งหมด</h2>
                        <p className="text-gray-400 text-sm">จำนวนผู้ใช้งานในระบบ: <span className="text-emerald-400 font-bold">{totalUsers}</span> คน</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto mt-2 xl:mt-0 xl:pr-2">
                    <div className="relative group w-full sm:w-64 xl:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-400 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อหรืออีเมล..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-gray-500 focus:bg-slate-900 shadow-inner"
                        />
                    </div>

                    <div className="flex bg-slate-800 rounded-xl border border-white/10 overflow-hidden shadow-inner w-full sm:w-auto mt-3 sm:mt-0">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex-1 sm:flex-none px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition flex justify-center">⬅️</button>
                        <span className="px-4 py-2.5 text-sm font-bold flex items-center justify-center border-l border-r border-white/10 text-gray-300 bg-slate-900/80 min-w-[60px]">{page} / {totalPage}</span>
                        <button onClick={() => setPage(p => Math.min(totalPage, p + 1))} disabled={page === totalPage} className="flex-1 sm:flex-none px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition flex justify-center">➡️</button>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-xl flex flex-col">
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950/80 text-gray-400 uppercase text-xs sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-4 w-[5%] text-center">ID</th>
                                <th className="p-4 w-[25%]">ผู้ใช้งาน</th>
                                <th className="p-4 w-[30%]">ข้อมูลติดต่อ</th>
                                <th className="p-4 w-[15%] text-center">สถานะ</th>
                                <th className="p-4 w-[15%] text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan={6} className="p-20 text-center text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={6} className="p-20 text-center text-gray-500">ไม่พบรายชื่อผู้เล่น</td></tr>
                            ) : users.map((u) => (
                                <tr key={u.uid} className={`hover:bg-white-[0.02] cursor-pointer transition-all group border-b border-white/5 last:border-0 relative`}>
                                    <td className="p-5 text-center text-gray-500 font-mono text-xs">#{u.uid}</td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border shadow-inner ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-800 text-gray-400 border-white/10'}`}>
                                                {u.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className={`font-bold transition-colors text-base flex items-center gap-2 ${u.role === 'admin' ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'text-gray-300 group-hover:text-white'}`}>
                                                    {u.username}
                                                    {u.role === 'admin' && <span className="text-[10px] bg-indigo-600/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/40 tracking-widest font-black uppercase">ADMIN</span>}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="bg-slate-800 text-gray-400 text-[10px] px-2 py-0.5 rounded border border-white/5 font-mono">{u.role}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-gray-400 text-sm space-y-1.5">
                                            <div className="flex items-center gap-2 group-hover:text-gray-300 transition-colors"><span className="opacity-60 text-xs">📧</span> {u.email}</div>
                                            <div className="flex items-center gap-2 group-hover:text-gray-300 transition-colors"><span className="opacity-60 text-xs">📱</span> {u.phone || <span className="text-gray-600 italic">ไม่มีข้อมูล</span>}</div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase border ${u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                            }`}>
                                            {u.role === 'admin' ? 'Admin' : 'Player'}
                                        </span>
                                    </td>
                                    <td className="p-5 text-center">
                                        <div className="flex items-center justify-center gap-2 transition-opacity">
                                            {u.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleDelete(u.uid)}
                                                    className="p-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    title="ลบผู้ใช้งาน"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div >
        </div >
    );
}
