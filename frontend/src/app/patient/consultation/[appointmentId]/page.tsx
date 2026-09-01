"use client"
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaArrowLeft, FaUserMd, FaUser } from 'react-icons/fa';

interface Message {
    id?: string;
    senderId?: string;
    senderRole?: string;
    senderName?: string;
    message: string;
    createdAt?: string;
}

interface RoomInfo {
    id?: string;
    doctor?: { fullName?: string };
    patient?: { fullName?: string };
}

export default function PatientConsultationPage() {
    const params = useParams<{ appointmentId: string }>();
    const appointmentId = params?.appointmentId as string;

    const [roomId, setRoomId] = useState('');
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const loadRoom = useCallback(async () => {
        if (!appointmentId) return;
        setError('');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/room/${appointmentId}`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok || data?.error) {
                setError(data.message || 'Unable to load chat room');
                return;
            }
            setRoomId(data.room?.id || '');
            setRoomInfo(data.room || null);
            setMessages(data.messages || []);
        } catch (err) {
            setError('Server connection failed');
        }
    }, [appointmentId]);

    useEffect(() => {
        setLoading(true);
        loadRoom().finally(() => setLoading(false));
        const intervalId = window.setInterval(() => {
            loadRoom();
        }, 10000);
        return () => window.clearInterval(intervalId);
    }, [loadRoom]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = newMessage.trim();
        if (!text || !roomId || sending) return;

        setSending(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/${roomId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();
            if (res.ok && data?.message) {
                setMessages((prev) => [...prev, data.message]);
                setNewMessage('');
            } else {
                setError(data.message || 'Failed to send message');
            }
        } catch (err) {
            setError('Server connection failed');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 text-secondary">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/patient/appointments"
                        className="p-2.5 bg-white hover:bg-slate-100 rounded-xl text-secondary transition-colors inline-flex items-center gap-2 text-sm font-semibold border border-slate-200"
                    >
                        <FaArrowLeft /> Back to Appointments
                    </Link>
                    <h1 className="text-2xl font-bold text-secondary">Consultation</h1>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-3xl shadow-xl border border-primary/20 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-primary/5 flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                            <FaUserMd />
                        </div>
                        <div>
                            <p className="font-bold text-secondary">
                                Dr. {roomInfo?.doctor?.fullName || 'Doctor'}
                            </p>
                            <p className="text-xs text-slate-500">Consultation ID: {appointmentId}</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="h-[420px] flex items-center justify-center bg-slate-50">
                            <p className="text-slate-500 text-sm">Loading chat...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-[420px] flex items-center justify-center bg-slate-50">
                            <p className="text-slate-400 text-xs">
                                No messages yet. Start the conversation with your doctor.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-slate-50 h-[420px]">
                            <div className="flex flex-col border border-emerald-200 bg-emerald-50/40 rounded-2xl overflow-hidden">
                                <div className="px-4 py-2 bg-emerald-100 flex items-center gap-2">
                                    <FaUserMd className="text-emerald-700 text-sm" />
                                    <p className="text-xs font-bold text-emerald-800">Doctor</p>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3 p-3">
                                    {messages
                                        .filter((msg) => msg.senderRole === 'doctor')
                                        .map((msg, idx) => (
                                            <div key={idx} className="flex flex-col">
                                                <div className="px-3 py-2 rounded-xl text-sm leading-relaxed bg-white border border-emerald-200 text-slate-800 rounded-tl-sm shadow-sm">
                                                    {msg.message}
                                                </div>
                                                <span className="text-[10px] text-slate-500 mt-1">
                                                    {msg.senderName || 'Doctor'} ·{' '}
                                                    {new Date(msg.createdAt || Date.now()).toLocaleDateString()} ·{' '}
                                                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        ))}
                                    {messages.filter((m) => m.senderRole === 'doctor').length === 0 && (
                                        <p className="text-slate-400 text-xs text-center py-6">No doctor messages.</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col border border-primary/30 bg-primary/5 rounded-2xl overflow-hidden">
                                <div className="px-4 py-2 bg-primary/10 flex items-center gap-2">
                                    <FaUser className="text-primary text-sm" />
                                    <p className="text-xs font-bold text-secondary">Patient</p>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3 p-3">
                                    {messages
                                        .filter((msg) => msg.senderRole === 'patient')
                                        .map((msg, idx) => (
                                            <div key={idx} className="flex flex-col">
                                                <div className="px-3 py-2 rounded-xl text-sm leading-relaxed bg-primary text-secondary rounded-tr-sm shadow-sm">
                                                    {msg.message}
                                                </div>
                                                <span className="text-[10px] text-slate-500 mt-1">
                                                    {msg.senderName || 'Patient'} ·{' '}
                                                    {new Date(msg.createdAt || Date.now()).toLocaleDateString()} ·{' '}
                                                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        ))}
                                    {messages.filter((m) => m.senderRole === 'patient').length === 0 && (
                                        <p className="text-slate-400 text-xs text-center py-6">No patient messages.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSend} className="flex gap-2 p-4 bg-white border-t border-slate-100">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
                        />
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim() || !roomId}
                            className="px-6 py-2 bg-primary text-secondary font-bold text-sm rounded-xl hover:bg-primary/90 disabled:opacity-50"
                        >
                            {sending ? 'Sending...' : 'Send'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
