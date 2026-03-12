'use client';
import { useState } from 'react';
// ⚠️ อย่าลืมเช็ค path ตรงนี้ให้ชี้ไปที่ไฟล์ data.ts ของคุณให้ถูกต้องนะครับ
import { chatData } from '@/app/game/chat/data'; 

export default function SeedChatPage() {
    const [status, setStatus] = useState('');

    const handleSeed = async () => {
        if (!confirm("ต้องการนำเข้าข้อมูล Chat ลง Database ใช่หรือไม่? \n(ข้อมูลเก่าใน DB จะถูกลบทับทั้งหมด)")) return;
        
        setStatus('กำลังนำเข้าข้อมูล... ⏳');

        try {
            const payload = chatData.map(chat => ({
                scenario_id: chat.id,
                category: chat.category,
                categoryTitle: chat.categoryTitle,
                level: chat.level,
                name: chat.name,
                avatar: chat.avatar,
                lossType: chat.lossType || 'money',
                content: {
                    msgs: chat.msgs,
                    choices: chat.choices
                }
            }));

            // ✅ 1. เพิ่มโค้ดเช็ค URL อัตโนมัติ ตรงนี้ครับ
            let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
                apiUrl = 'http://localhost:4000';
            }

            // ✅ 2. เปลี่ยน URL ใน fetch ให้ใช้ตัวแปร apiUrl
            const res = await fetch(`${apiUrl}/seed/chat-scenarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setStatus(`✅ นำเข้าข้อมูลสำเร็จ! จำนวน ${chatData.length} ด่าน ตอนนี้ข้อมูลอยู่ใน Database แล้ว 🎉`);
            } else {
                const errorData = await res.json();
                setStatus(`❌ เกิดข้อผิดพลาด: ${errorData.error}`);
            }
        } catch (error) {
            console.error(error);
            setStatus('❌ เชื่อมต่อ Server ไม่ได้ กรุณาตรวจสอบว่า Backend ทำงานอยู่');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-6 p-4 text-center">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl max-w-lg w-full">
                <div className="text-6xl mb-4">🚀</div>
                <h1 className="text-2xl font-bold mb-2">ย้ายข้อมูล Chat เข้า Database</h1>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    หน้านี้ใช้สำหรับดึงข้อมูลจากไฟล์ <code className="bg-slate-800 text-pink-400 px-1 rounded">data.ts</code> <br/>
                    ส่งไปบันทึกลงใน Database (PostgreSQL) ผ่าน API <br/>
                    พบข้อมูลเตรียมนำเข้าทั้งหมด: <strong className="text-white text-lg">{chatData.length}</strong> ด่าน
                </p>
                
                <button 
                    onClick={handleSeed}
                    className="w-full bg-blue-600 px-6 py-4 rounded-xl font-bold hover:bg-blue-500 transition-all active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                >
                    คลิกเพื่อนำเข้าข้อมูลสู่ Database
                </button>

                {status && (
                    <div className="mt-6 p-4 rounded-lg bg-slate-800 border border-slate-700 text-sm font-medium">
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}