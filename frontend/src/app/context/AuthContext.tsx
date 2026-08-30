"use client"
import React, { createContext, useContext, useState } from 'react';

type AuthMode = 'login' | 'signup';

interface AuthContextType {
    isOpen: boolean;
    mode: AuthMode;
    openAuth: (mode?: AuthMode) => void;
    closeAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<AuthMode>('login');

    const openAuth = (selectedMode: AuthMode = 'login') => {
        setMode(selectedMode);
        setIsOpen(true);
    };

    const closeAuth = () => {
        setIsOpen(false);
    };

    return (
        <AuthContext.Provider value={{ isOpen, mode, openAuth, closeAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}