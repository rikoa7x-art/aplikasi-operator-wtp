import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from './types';
import { getSession, login as storageLogin, clearSession } from './storage';

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getSession().then(session => {
            if (session) setUser(session);
        }).catch(err => {
            console.error("Failed to restore session", err);
        }).finally(() => {
            setIsLoading(false);
        });
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const u = await storageLogin(username, password);
            if (u) { 
                setUser(u); 
                return true; 
            }
            return false;
        } catch (err) {
            console.error("Login Error", err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        clearSession();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
