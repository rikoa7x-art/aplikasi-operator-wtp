import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from './types';
import { getSession, login as storageLogin, clearSession } from './storage';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const session = getSession();
        if (session) setUser(session);
    }, []);

    const login = (username: string, password: string): boolean => {
        const u = storageLogin(username, password);
        if (u) { setUser(u); return true; }
        return false;
    };

    const logout = () => {
        clearSession();
        setUser(null);
    };

    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
