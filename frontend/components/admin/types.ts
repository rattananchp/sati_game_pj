export type ViewState = 'dashboard' | 'quiz_manage' | 'virus_manage' | 'users' | 'add_question' | 'chat_manage';
export interface Overview {
    totalUsers: number;
    totalGames: number;
    totalVirusGames: number;

}
// 1. สร้าง Type สำหรับตัวเลือก (Choice) ก่อน
export interface Choice {
    text: string;
    isCorrect?: boolean;
    reaction: string;
    next?: ChatScenario; // ✅ เรียกใช้ ChatScenario แบบ Recursive ได้เลยใน Interface
    memeTitle?: string;
    memeDesc?: string;
    memeIcon?: string;
    lossType?: 'money' | 'data';
}
export interface ChatScenario {
    _id?: string; // เผื่อไว้สำหรับ MongoDB ID
    id: string;
    category: string;
    categoryTitle: string;
    level: number;
    name: string;
    avatar: string;
    lossType?: 'money' | 'data';
    msgs: string[];
    choices: Choice[];
}
export interface QuestionStats {
    qid: number;
    question: string;
    level: string;
    category?: string;
    correctRate: number;
    totalAttempts: number;
}

export interface QuestionDetail {
    choice_text: string;
    is_correct: boolean;
    count: number;
    percent: number;
}

export interface DashboardData {
    overview: {
        totalUsers: number;
        totalGames: number;       // สมมติว่าเป็น Quiz
        totalVirusGames: number;
        totalChatGames: number;   // ✅ เพิ่มอันนี้
    };
    // ✅ เพิ่มข้อมูลสำหรับทำกราฟ
    monthlyStats?: {
        month: string;
        quiz: number;
        virus: number;
        chat: number;
    }[];
}

export interface Category {
    cg_id: number;
    mode_cg: string;
}

export interface QuestionFormData {
    question: string;
    choice1: string;
    choice2: string;
    choice3: string;
    choice4: string;
    correctIndex: number;
    level: string;
    explanation: string;
    cg_id: number | '';
    [key: string]: string | number;
}

export interface VirusScoreEntry {
    uid: number; // Added UID for delete functionality
    score: number;
    time_taken: number;
    played_at: string;
    user: {
        username: string;
        email: string;
    };
}

export interface User {
    uid: number;
    username: string;
    email: string;
    role: string;
    phone: string;
    is_banned?: boolean;
    ban_reason?: string;
    ban_expires_at?: string;
    total_games?: number; // ✅ เพิ่ม: จำนวนเกมที่เล่น
}

