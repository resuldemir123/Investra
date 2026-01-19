
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/djangoApi';

interface User {
    username: string;
    email: string;
    id?: number;
    first_name?: string;
    // backend user model fields
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (name: string, email: string, pass: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, pass: string) => {
        const data = await api.login(email, pass);
        setUser(data.user);
    };

    const register = async (name: string, email: string, pass: string) => {
        // We treat 'name' as username for simplicity or modify backend to accept name. 
        // Backend expects 'username', 'email', 'password'.
        const data = await api.register(name, email, pass);
        setUser(data.user);
    };

    const logout = () => {
        api.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
