"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/doctor/change-password`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newPassword })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Failed to change password');
                return;
            }
            router.push('/doctor/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md w-full">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Change Password Required</h2>
                <p className="text-slate-500 text-sm mb-6">Since this is your first time logging in with an admin-generated temporary password, you must change your password to continue.</p>
                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                    >
                        Update Password & Continue
                    </button>
                </form>
            </div>
        </div>
    );
}