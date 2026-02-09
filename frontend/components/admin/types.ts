export interface Overview {
    totalUsers: number;
    totalGames: number;
    totalVirusGames: number;
}

export interface QuestionStats {
    qid: number;
    question: string;
    level: string;
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
    overview: Overview;
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
}

export type ViewState = 'dashboard' | 'quiz_manage' | 'virus_manage' | 'users' | 'add_question';
