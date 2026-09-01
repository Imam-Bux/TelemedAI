'use client';
import React, { useState, useEffect, useCallback } from 'react';

interface Appointment {
    id: string | number;
    patient_id: string | number;
}

interface PatientContext {
    full_name?: string;
    name?: string;
    fullName?: string;
    age?: number | string;
    gender?: string;
    weight?: number | string;
    height?: number | string;
    allergies?: string;
    current_medications?: string;
    currentMedications?: string;
    pre_existing_conditions?: string;
    preExistingConditions?: string;
    bloodGroup?: string;
    emergencyContact?: string;
}

interface Report {
    id?: string | number;
    fileName?: string;
    file_name?: string;
    aiSummary?: {
        summary?: string;
        keyFindings?: string | string[];
        concerns?: string | string[];
    };
    ai_summary?: string;
    createdAt?: string;
}

interface Message {
    id?: string | number;
    sender_id?: string;
    senderId?: string;
    sender_role?: string;
    senderRole?: string;
    senderName?: string;
    message: string;
    created_at?: string;
    createdAt?: string;
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
    const [roomId, setRoomId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const loadReports = useCallback(async () => {
        if (!appointment) return;
        try {
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
        } catch (err) {
            console.error('Error loading reports:', err);
        }
    }, [appointment]);

    const loadConsultationData = async () => {
        if (!appointment) return;

        setIsLoading(true);

        try {
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

            await loadReports();

            const chatRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/room/${appointment.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (chatRes.ok) {
                const chatData = await chatRes.json();
                if (chatData.room?.id) {
                    setRoomId(chatData.room.id);
                }
                setMessages(chatData.messages || []);
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

    const loadChat = useCallback(async () => {
        if (!appointment) return;
        try {
            const chatRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/room/${appointment.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            if (chatRes.ok) {
                const chatData = await chatRes.json();
                if (chatData.room?.id) {
                    setRoomId(chatData.room.id);
                }
                setMessages(chatData.messages || []);
            }
        } catch (err) {
            console.error('Error loading chat:', err);
        }
    }, [appointment]);

    useEffect(() => {
        if (!appointment) return;

        const intervalId = window.setInterval(() => {
            loadChat();
            loadReports();
        }, 10000);

        return () => window.clearInterval(intervalId);
    }, [appointment, loadChat, loadReports]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !appointment || !roomId) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/${roomId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    message: newMessage
                })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages([...messages, data.message || {
                    message: newMessage,
                    senderRole: 'doctor',
                    createdAt: new Date().toISOString()
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
                            <p><span className="font-semibold">Full Name:</span> {patientContext.full_name || patientContext.name || patientContext.fullName}</p>
                            <p><span className="font-semibold">Age:</span> {patientContext.age}</p>
                            <p><span className="font-semibold">Gender:</span> {patientContext.gender}</p>
                            <p><span className="font-semibold">Weight:</span> {patientContext.weight} kg</p>
                            <p><span className="font-semibold">Height:</span> {patientContext.height} cm</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                            <p><span className="font-semibold">Allergies:</span> {patientContext.allergies || 'None'}</p>
                            <p><span className="font-semibold">Medications:</span> {patientContext.current_medications || patientContext.currentMedications || 'None'}</p>
                            <p><span className="font-semibold">Pre-existing Conditions:</span> {patientContext.pre_existing_conditions || patientContext.preExistingConditions || 'None'}</p>
                            {patientContext.bloodGroup && <p><span className="font-semibold">Blood Group:</span> {patientContext.bloodGroup}</p>}
                            {patientContext.emergencyContact && <p><span className="font-semibold">Emergency Contact:</span> {patientContext.emergencyContact}</p>}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-2">AI Generated Reports</h4>
                            {reports.length === 0 ? (
                                <p className="text-xs text-slate-500">No reports uploaded.</p>
                            ) : (
                                <div className="space-y-3">
                                    {reports.map((rep) => {
                                        const summary =
                                            typeof rep.aiSummary === 'string'
                                                ? rep.aiSummary
                                                : rep.aiSummary?.summary || '';
                                        const findings = rep.aiSummary?.keyFindings;
                                        const concerns = rep.aiSummary?.concerns;
                                        return (
                                            <div key={String(rep.id ?? rep.fileName)} className="p-3 border border-slate-200 rounded-xl text-xs space-y-2">
                                                <p className="font-bold text-slate-800">
                                                    {rep.fileName || rep.file_name || 'Medical Report'}
                                                </p>
                                                {summary ? (
                                                    <p className="text-slate-600">
                                                        <span className="font-semibold text-slate-800">Summary:</span> {summary}
                                                    </p>
                                                ) : rep.ai_summary ? (
                                                    <p className="text-slate-600">
                                                        <span className="font-semibold text-slate-800">Summary:</span> {rep.ai_summary}
                                                    </p>
                                                ) : null}
                                                {Array.isArray(findings) && findings.length > 0 ? (
                                                    <div>
                                                        <p className="font-semibold text-slate-800">Key Findings:</p>
                                                        <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                                                            {findings.map((f, i) => (
                                                                <li key={i} className="text-slate-600">{f}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    typeof findings === 'string' && findings ? (
                                                        <p className="text-slate-600">
                                                            <span className="font-semibold text-slate-800">Key Findings:</span> {findings}
                                                        </p>
                                                    ) : null
                                                )}
                                                {Array.isArray(concerns) && concerns.length > 0 ? (
                                                    <div>
                                                        <p className="font-semibold text-slate-800">Concerns:</p>
                                                        <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                                                            {concerns.map((c, i) => (
                                                                <li key={i} className="text-red-600">{c}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    typeof concerns === 'string' && concerns ? (
                                                        <p className="text-red-600">
                                                            <span className="font-semibold">Concern:</span> {concerns}
                                                        </p>
                                                    ) : null
                                                )}
                                            </div>
                                        );
                                    })}
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
                        <div className="px-4 py-2 bg-emerald-100 flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-emerald-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 1 0 6 0 3 3 0 0 0-6 0Zm8 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6 2c-1.9 0-3 .8-4.3 1.9C9.3 14 9.9 16 7.5 16H4a1 1 0 0 1-1-1v-1c0-1.5 1.5-3 4-3 .8 0 1.5.1 2 .3M4.8 11c.8-.4 1.8-.7 2.9-.7.5 0 1 .1 1.5.2A6.6 6.6 0 0 1 7 9a3 3 0 0 0-2.2 2Zm12.2-1c-1.9 0-3 .8-4.3 1.9-.6.5-1.2 1-1.7 1.6.5.5.9 1.2 1.4 1.7.7.5 1.4.8 2.3.8H19a1 1 0 0 0 1-1v-1c0-1.5-1.5-3-3-3ZM10 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" clipRule="evenodd"/></svg>
                            <p className="text-xs font-bold text-emerald-800">Doctor Messages</p>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 p-3 ml-auto w-full">
                            {messages.filter((msg) => (msg.senderRole || msg.sender_role) === 'doctor').map((msg, idx) => (
                                <div key={idx} className="flex flex-col items-end">
                                    <div className="max-w-[85%] px-3 py-2 rounded-xl text-sm text-white bg-emerald-600 rounded-tr-sm shadow-sm">
                                        {msg.message}
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-1">
                                        {msg.senderName || 'Doctor'} ·{' '}
                                        {new Date(msg.createdAt || msg.created_at || Date.now()).toLocaleDateString()} ·{' '}
                                        {new Date(msg.createdAt || msg.created_at || Date.now()).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                            {messages.filter((m) => (m.senderRole || m.sender_role) === 'doctor').length === 0 && (
                                <p className="text-slate-400 text-xs text-center py-6">No doctor messages.</p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col border border-blue-200 bg-blue-50/40 rounded-xl overflow-hidden">
                        <div className="px-4 py-2 bg-blue-100 flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-blue-700" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a4 4 0 0 0-4 4v1H5v9h10V7h-1V6a4 4 0 0 0-4-4Zm-2 5V6a2 2 0 1 1 4 0v1H8Z"/></svg>
                            <p className="text-xs font-bold text-blue-800">Patient Messages</p>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 p-3">
                            {messages.filter((msg) => (msg.senderRole || msg.sender_role) === 'patient').map((msg, idx) => (
                                <div key={idx} className="flex flex-col items-start">
                                    <div className="max-w-[85%] px-3 py-2 rounded-xl text-sm bg-white border border-blue-200 text-slate-800 rounded-tl-sm shadow-sm">
                                        {msg.message}
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-1">
                                        {msg.senderName || patientContext?.full_name || patientContext?.name || 'Patient'} ·{' '}
                                        {new Date(msg.createdAt || msg.created_at || Date.now()).toLocaleDateString()} ·{' '}
                                        {new Date(msg.createdAt || msg.created_at || Date.now()).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                            {messages.filter((m) => (m.senderRole || m.sender_role) === 'patient').length === 0 && (
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