'use client';
import React, { useState, useEffect } from 'react';

interface Appointment {
    id: string | number;
    patient_id: string | number;
}

interface PatientContext {
    full_name?: string;
    name?: string;
    age?: number | string;
    gender?: string;
    weight?: number | string;
    height?: number | string;
    allergies?: string;
    current_medications?: string;
    pre_existing_conditions?: string;
}

interface Report {
    id: string | number;
    file_name: string;
    ai_summary: string;
}

interface Message {
    id?: string | number;
    sender_id: string;
    message: string;
    created_at: string;
}

interface ConsultationProps {
    appointment: Appointment | null;
    onBack: () => void;
}

export default function ConsultationComponent({ appointment, onBack }: ConsultationProps) {
    const [patientContext, setPatientContext] = useState<PatientContext | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const loadConsultationData = async () => {
        if (!appointment) return;

        setIsLoading(true);

        try {
            // Auth is carried by the httpOnly cookie via credentials: 'include' —
            // there is no client-readable token to attach here.
            const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/doctor/patient-profile/${appointment.patient_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setPatientContext(profileData);
            }

            const reportsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/doctor/patient-reports/${appointment.patient_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (reportsRes.ok) {
                const reportsData = await reportsRes.json();
                setReports(reportsData.reports || reportsData || []);
            }

            const chatRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/${appointment.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (chatRes.ok) {
                const chatData = await chatRes.json();
                setMessages(chatData.messages || chatData || []);
            }
        } catch (err) {
            console.error('Error loading consultation data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!appointment) return;

        const timeoutId = window.setTimeout(() => {
            void loadConsultationData();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [appointment]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !appointment) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    appointment_id: appointment.id,
                    message: newMessage
                })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages([...messages, data.message || {
                    message: newMessage,
                    sender_id: 'doctor',
                    created_at: new Date().toISOString()
                }]);
                setNewMessage('');
            }
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const handleMarkComplete = async () => {
        if (!appointment) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/doctor/appointments/${appointment.id}/complete`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (res.ok) {
                onBack();
            }
        } catch (err) {
            console.error('Error marking complete:', err);
        }
    };

    if (!appointment) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Patient Context</h2>
                    <button
                        onClick={onBack}
                        className="text-xs text-blue-600 font-semibold hover:underline"
                    >
                        Back to Appointments
                    </button>
                </div>

                {isLoading ? (
                    <p className="text-slate-500 text-sm">Loading...</p>
                ) : patientContext ? (
                    <div className="space-y-4 text-sm text-slate-700">
                        <div className="p-3 bg-slate-50 rounded-xl">
                            <p><span className="font-semibold">Full Name:</span> {patientContext.full_name || patientContext.name}</p>
                            <p><span className="font-semibold">Age:</span> {patientContext.age}</p>
                            <p><span className="font-semibold">Gender:</span> {patientContext.gender}</p>
                            <p><span className="font-semibold">Weight:</span> {patientContext.weight} kg</p>
                            <p><span className="font-semibold">Height:</span> {patientContext.height} cm</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                            <p><span className="font-semibold">Allergies:</span> {patientContext.allergies || 'None'}</p>
                            <p><span className="font-semibold">Medications:</span> {patientContext.current_medications || 'None'}</p>
                            <p><span className="font-semibold">Pre-existing Conditions:</span> {patientContext.pre_existing_conditions || 'None'}</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-2">Uploaded Reports</h4>
                            {reports.length === 0 ? (
                                <p className="text-xs text-slate-500">No reports uploaded.</p>
                            ) : (
                                <div className="space-y-2">
                                    {reports.map((rep) => (
                                        <div key={rep.id} className="p-3 border border-slate-200 rounded-xl text-xs space-y-1">
                                            <p className="font-bold text-slate-800">{rep.file_name}</p>
                                            <p className="text-slate-600"><span className="font-semibold">Summary:</span> {rep.ai_summary}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="pt-4">
                            <button
                                onClick={handleMarkComplete}
                                className="w-full py-2 bg-green-600 text-white font-semibold rounded-xl text-sm hover:bg-green-700"
                            >
                                Mark Consultation Complete
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm">Loading patient context...</p>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Live Chat</h2>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 min-h-0">
                    <div className="flex flex-col border border-emerald-200 bg-emerald-50/40 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-emerald-100">
                            <p className="text-xs font-bold text-emerald-800">Doctor</p>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 p-3">
                            {messages.filter((msg) => msg.sender_id === 'doctor').map((msg, idx) => (
                                <div key={idx} className="flex flex-col items-end">
                                    <div className="max-w-[85%] px-3 py-2 rounded-xl text-sm text-white bg-emerald-600 rounded-tr-sm shadow-sm">
                                        {msg.message}
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-1">
                                        Doctor · {new Date(msg.created_at).toLocaleDateString()} · {new Date(msg.created_at).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                            {messages.filter((m) => m.sender_id === 'doctor').length === 0 && (
                                <p className="text-slate-400 text-xs text-center py-6">No doctor messages.</p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col border border-blue-200 bg-blue-50/40 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-blue-100">
                            <p className="text-xs font-bold text-blue-800">Patient</p>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 p-3">
                            {messages.filter((msg) => msg.sender_id !== 'doctor').map((msg, idx) => (
                                <div key={idx} className="flex flex-col items-start">
                                    <div className="max-w-[85%] px-3 py-2 rounded-xl text-sm bg-white border border-blue-200 text-slate-800 rounded-tl-sm shadow-sm">
                                        {msg.message}
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-1">
                                        Patient · {new Date(msg.created_at).toLocaleDateString()} · {new Date(msg.created_at).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                            {messages.filter((m) => m.sender_id !== 'doctor').length === 0 && (
                                <p className="text-slate-400 text-xs text-center py-6">No patient messages.</p>
                            )}
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}