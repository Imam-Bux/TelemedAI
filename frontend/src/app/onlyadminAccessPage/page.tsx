"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaUsers,
    FaUserMd,
    FaFileMedicalAlt,
    FaCalendarCheck,
    FaSignOutAlt,
    FaStethoscope,
    FaComments
} from 'react-icons/fa';
import { useRequireRole } from '@/app/lib/requireAuth';
import PatientsView from './PatientsView';
import ReportsView from './ReportsView';
import DoctorsView from './doctors/DoctorsView';
import AppointmentsView from './components/AppointmentsView';
import ChatView from './components/ChatView';

const STORAGE_KEY = 'admin-active-tab';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('patients');
    const router = useRouter();
    const authStatus = useRequireRole('admin');
    const isAuthorized = authStatus === 'authorized';

    const setTab = (tab: string) => {
        setActiveTab(tab);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, tab);
        }
    };

    useEffect(() => {
        if (!isAuthorized) return;
        const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (saved) {
            setActiveTab(saved);
        }
    }, [isAuthorized]);

    const handleLogout = async () => {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        router.push('/');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'patients': return <PatientsView />;
            case 'doctors': return <DoctorsView />;
            case 'reports': return <ReportsView />;
            case 'appointments': return <AppointmentsView />;
            case 'chats': return <ChatView />;
            default: return <PatientsView />;
        }
    };

    const navItems = [
        { id: 'patients', label: 'Patients & Profiles', icon: FaUsers },
        { id: 'doctors', label: 'Doctors Management', icon: FaUserMd },
        { id: 'reports', label: 'Reports Generated', icon: FaFileMedicalAlt },
        { id: 'appointments', label: 'Appointments & Chats', icon: FaCalendarCheck },
        { id: 'chats', label: 'Chat Rooms', icon: FaComments },
    ];

    if (!isAuthorized) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6 flex items-center gap-3 border-b border-slate-100">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <FaStethoscope className="text-xl" />
                    </div>
                    <span className="text-xl font-bold text-slate-800">TeleMed AI</span>
                </div>

                <div className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Admin Panel
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                    isActive
                                        ? 'bg-primary text-white shadow-md'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                }`}
                            >
                                <Icon className={isActive ? 'text-white' : 'text-slate-400'} />
                                <span className="font-semibold text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <FaSignOutAlt />
                        <span className="font-semibold text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-800 capitalize">
                        {navItems.find(item => item.id === activeTab)?.label}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                            AD
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8 bg-slate-50">
                    <div className="max-w-6xl mx-auto">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
}