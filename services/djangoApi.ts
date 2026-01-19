
import { AnalysisResult, SavedAnalysis } from '../types';

const API_URL = 'http://localhost:8000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Token ${token}` } : {})
    };
};

export const api = {
    async register(name: string, email: string, pass: string) {
        const res = await fetch(`${API_URL}/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: email,
                email,
                password: pass,
                first_name: name
            }),
        });
        if (!res.ok) throw new Error('Registration failed');
        const data = await res.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    },

    async login(email: string, pass: string) {
        const res = await fetch(`${API_URL}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass }),
        });
        if (!res.ok) throw new Error('Login failed');
        const data = await res.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Optional: call backend logout to invalidate token if configured
    },

    async analyzeStartup(summary: string): Promise<AnalysisResult> {
        const res = await fetch(`${API_URL}/analyze/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ summary }),
        });
        if (!res.ok) throw new Error('Analysis failed');
        return res.json();
    },

    async getAnalyses(): Promise<SavedAnalysis[]> {
        const res = await fetch(`${API_URL}/analyses/`, {
            headers: getHeaders(),
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.map((item: any) => ({
            id: item.id,
            timestamp: new Date(item.created_at).getTime(),
            title: item.title,
            summary: item.summary,
            result: item.result
        }));
    },

    async saveAnalysis(title: string, summary: string, result: AnalysisResult) {
        const res = await fetch(`${API_URL}/analyses/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ title, summary, result }),
        });
        if (!res.ok) throw new Error('Failed to save');
        const data = await res.json();
        return data.id;
    },

    async getMarketIntelligence() {
        const res = await fetch(`${API_URL}/market-intel/`, {
            headers: getHeaders(),
        });
        if (!res.ok) throw new Error('Failed to fetch market intel');
        return res.json();
    }
};
