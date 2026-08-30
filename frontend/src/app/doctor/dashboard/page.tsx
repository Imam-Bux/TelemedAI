'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import tokenService from '@/app/lib/tokenService';
import ProfileComponent from './components/profile';
import AppointmentsComponent from './components/appointments';
import ConsultationComponent from './components/consultation';

interface Appointment {
    id: string | number;
    patient_id: string | number;
    patient_name?: string;
    scheduled_time?: string;
    created_at?: string;
    status: string;
}

const TAB_STORAGE = 'doctor-active-tab';

export default function DoctorDashboard() {
    const [activeTab, setActiveTab] = useState('appointments');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const setTab = (tab: string) => {
        setActiveTab(tab);
        if (typeof window !== 'undefined') {
            localStorage.setItem(TAB_STORAGE, tab);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('http://localhost:5000/auth/profile', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!res.ok) {
                    router.push('/');
                    return;
                }

                const user = await res.json();

                if (user.role !== 'doctor') {
                    router.push('/');
                    return;
                }

                if (user.mustChangePassword) {
                    router.push('/doctor/change-password');
                    return;
                }

                setIsAuthorized(true);
                const savedTab = typeof window !== 'undefined' ? localStorage.getItem(TAB_STORAGE) : null;
                if (savedTab && savedTab !== 'consultation') {
                    setActiveTab(savedTab);
                }
            } catch (err) {
                console.error('Auth check error:', err);
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        await tokenService.logout();
        router.push('/');
    };

    const handleSelectAppointment = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setTab('consultation');
    };

    const handleBackToAppointments = () => {
        setSelectedAppointment(null);
        setTab('appointments');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-600">Loading...</p>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-slate-800">Doctor Portal</h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { setTab('appointments'); setSelectedAppointment(null); }}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm ${activeTab === 'appointments' && !selectedAppointment ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                        Appointments
                    </button>
                    <button
                        onClick={() => { setTab('profile'); setSelectedAppointment(null); }}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                        Profile & Settings
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold text-sm hover:bg-red-100"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                {activeTab === 'profile' && <ProfileComponent />}

                {activeTab === 'appointments' && !selectedAppointment && (
                    <AppointmentsComponent onSelectAppointment={handleSelectAppointment} />
                )}

                {activeTab === 'consultation' && selectedAppointment && (
                    <ConsultationComponent appointment={selectedAppointment} onBack={handleBackToAppointments} />
                )}
            </main>
        </div>
    );
}