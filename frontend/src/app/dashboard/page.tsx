"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaHome, FaFileMedical, FaCalendarPlus, FaComments, FaUserAlt, FaSignOutAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function PatientDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [profileStatus, setProfileStatus] = useState('Loading...');

    useEffect(() => {
        const fetchProfileStatus = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patient/profile`, {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await response.json();
                if (response.ok && !data.error) {
                    setProfileStatus('Completed');
                } else {
                    setProfileStatus('Incomplete');
                }
            } catch (err) {
                setProfileStatus('Incomplete');
            }
        };

        fetchProfileStatus();
    }, []);

    const handleLogout = async () => {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex text-secondary">
            <aside className="w-64 bg-white border-r border-primary/20 flex flex-col justify-between p-6">
                <div>
                    <div className="flex items-center gap-3 px-2 mb-10">
                        <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                            <FaFileMedical className="text-xl" />
                        </div>
                        <span className="font-bold text-lg text-secondary">TeleMed AI</span>
                    </div>

                    <nav className="space-y-2">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold bg-primary text-secondary shadow-md"
                        >
                            <FaHome /> Overview
                        </Link>
                        <Link
                            href="/reports"
                            className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-secondary transition-colors"
                        >
                            <FaFileMedical /> My Reports
                        </Link>
                        <Link
                            href="/patient/appointments"
                            className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-secondary transition-colors"
                        >
                            <FaCalendarPlus /> Book Appointment
                        </Link>
                        <Link
                            href="/patient/consultation"
                            className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-secondary transition-colors"
                        >
                            <FaComments /> Consultations
                        </Link>
                        <Link
                            href="/profile"
                            className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-secondary transition-colors"
                        >
                            <FaUserAlt /> Profile
                        </Link>
                    </nav>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors w-full"
                >
                    <FaSignOutAlt /> Sign Out
                </button>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl border border-primary/20 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Patient Dashboard</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage your health records and virtual consultations</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl border border-primary/20 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase">Active Appointments</h3>
                        <p className="text-3xl font-bold text-secondary mt-2">0</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-primary/20 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase">Uploaded Reports</h3>
                        <p className="text-3xl font-bold text-secondary mt-2">0</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-primary/20 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase">Profile Status</h3>
                        <p className="text-xl font-bold text-primary mt-2">{profileStatus}</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-primary/20 p-8 shadow-sm">
                    <h2 className="text-lg font-bold text-secondary mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-4">
                        <Link
                            href="/reports"
                            className="px-5 py-3 bg-primary text-secondary font-bold text-sm rounded-xl shadow-md hover:bg-primary/90 transition-colors"
                        >
                            Upload Medical Report
                        </Link>
                        <Link
                            href="/appointments"
                            className="px-5 py-3 bg-slate-100 text-secondary font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            Book Consultation
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}