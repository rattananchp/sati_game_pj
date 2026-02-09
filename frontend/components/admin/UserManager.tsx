import { useEffect, useState } from 'react';
import { User } from './types';

interface UserManagerProps {
    API_URL: string;
}

export default function UserManager({ API_URL }: UserManagerProps) {
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
            setUsers(json.users);
            setTotalPage(json.totalPages);
            setTotalUsers(json.total);
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

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-4xl animate-bounce filter drop-shadow hover:scale-110 transition cursor-default">👥</span>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">รายชื่อผู้เล่นทั้งหมด</h2>
                        <p className="text-xs text-gray-400 mt-1">จำนวนผู้ใช้งานในระบบ: <span className="text-indigo-400 font-bold">{totalUsers}</span> คน</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative group w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-400 transition-colors">🔍</div>
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อหรืออีเมล..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600 focus:bg-slate-900"
                        />
                    </div>

                    <div className="flex bg-slate-800 rounded-xl border border-white/10 overflow-hidden shrink-0">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition">⬅️</button>
                        <span className="px-3 py-2 text-xs flex items-center border-l border-r border-white/10 text-gray-400 font-mono bg-slate-900/50">{page}/{totalPage}</span>
                        <button onClick={() => setPage(p => Math.min(totalPage, p + 1))} disabled={page === totalPage} className="px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition">➡️</button>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-xl flex flex-col">
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-950/80 text-gray-400 uppercase text-xs sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-4 w-[5%] text-center">ID</th>
                                <th className="p-4 w-[30%]">ผู้ใช้งาน</th>
                                <th className="p-4 w-[35%]">ข้อมูลติดต่อ</th>
                                <th className="p-4 w-[15%] text-center">สถานะ</th>
                                <th className="p-4 w-[15%] text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-20 text-center text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="p-20 text-center text-gray-500">ไม่พบรายชื่อผู้เล่น</td></tr>
                            ) : users.map((u) => (
                                <tr key={u.uid} className={`hover:bg-indigo-900/10 transition-colors group`}>
                                    <td className="p-4 text-center text-gray-600 font-mono">#{u.uid}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${u.role === 'admin' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-700 text-gray-300'}`}>
                                                {u.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className={`font-bold transition-colors ${u.role === 'admin' ? 'text-indigo-400' : 'text-gray-300 group-hover:text-white'}`}>
                                                {u.username}
                                                {u.role === 'admin' && <span className="ml-2 text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">ADMIN</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-gray-400 text-xs space-y-1">
                                            <div className="flex items-center gap-1">📧 {u.email}</div>
                                            <div className="flex items-center gap-1">📱 {u.phone || '-'}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]' :
                                            'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(74,222,128,0.1)]'
                                            }`}>
                                            {u.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้เล่นทั่วไป'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {u.role !== 'admin' && (
                                            <button
                                                onClick={() => handleDelete(u.uid)}
                                                className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition active:scale-95 border border-red-500/20"
                                                title="ลบผู้ใช้งาน"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
