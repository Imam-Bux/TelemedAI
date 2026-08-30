"use client"
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { FaTimes, FaUser, FaEnvelope, FaLock, FaStethoscope } from 'react-icons/fa';

type AuthUser = {
    role?: string;
    mustChangePassword?: boolean;
    completedOnboarding?: boolean;
};

type AuthResponse = {
    user?: AuthUser;
    mustChangePassword?: boolean;
    completedOnboarding?: boolean;
};

export default function AuthModal() {
    const { isOpen, mode, closeAuth } = useAuth();
    const router = useRouter();
    const [isSignup, setIsSignup] = useState(mode === 'signup');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const redirectAfterAuth = (data: AuthResponse) => {
        const user = data.user || {};
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
        }
        const mustChangePassword = data.mustChangePassword || user.mustChangePassword;
        const completedOnboarding = data.completedOnboarding ?? user.completedOnboarding;

        if (user.role === 'admin') {
            router.push('/onlyadminAccessPage');
        } else if (user.role === 'doctor') {
            router.push(mustChangePassword ? '/doctor/change-password' : '/doctor/dashboard');
        } else if (completedOnboarding) {
            router.push('/dashboard');
        } else {
            router.push('/onboarding');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = isSignup
            ? 'http://localhost:5000/auth/signUp'
            : 'http://localhost:5000/auth/login';

        const payload = isSignup
            ? { fullName: name, email, password }
            : { email, password };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                setError(data.message || 'Something went wrong');
                setLoading(false);
                return;
            }

            setLoading(false);
            closeAuth();
            redirectAfterAuth(data);
        } catch (err: unknown) {
            setError('Failed to connect to server');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/40 backdrop-blur-sm p-4">
            <div className="bg-white border border-primary/20 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl text-secondary relative">
                <button
                    onClick={closeAuth}
                    className="absolute top-5 right-5 text-slate-400 hover:text-secondary transition-colors"
                >
                    <FaTimes className="text-xl" />
                </button>

                <div className="text-center mb-6">
                    <div className="inline-flex p-3 bg-primary/10 rounded-2xl text-primary mb-2">
                        <FaStethoscope className="text-2xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-secondary">
                        {isSignup ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {isSignup ? 'Sign up to access Telemed AI services' : 'Login to manage your consultations'}
                    </p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200">
                    <button
                        type="button"
                        onClick={() => { setIsSignup(false); setError(''); }}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isSignup ? 'bg-primary text-secondary shadow-md' : 'text-slate-600 hover:text-secondary'}`}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsSignup(true); setError(''); }}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isSignup ? 'bg-primary text-secondary shadow-md' : 'text-slate-600 hover:text-secondary'}`}
                    >
                        Sign Up
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignup && (
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5">Full Name</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                    <FaUser />
                                </span>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-secondary placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5">Email Address</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                <FaEnvelope />
                            </span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-secondary placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5">Password</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                                <FaLock />
                            </span>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-secondary placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 bg-primary hover:bg-primary/90 text-secondary font-bold py-3.5 rounded-xl shadow-lg transition-colors duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
                    </button>
                </form>
            </div>
        </div>
    );
}