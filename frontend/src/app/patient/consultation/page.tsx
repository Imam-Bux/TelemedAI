"use client"
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaComments, FaUserMd } from 'react-icons/fa';
import { useSocketEvent } from '@/app/lib/useSocketEvent';

interface ChatRoom {
    id: string;
    appointmentId: string;
    appointment?: { date?: string; time?: string; status?: string };
    doctor?: { id: string; fullName?: string; email?: string };
    messageCount: number;
    lastMessage?: string;
    lastMessageAt?: string;
    status: string;
}

export default function PatientConsultationsPage() {
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadRooms = useCallback(async (silent = false) => {
        if (!silent) {
            setLoading(true);
        }
        setError('');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/my`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok || data?.error) {
                setError(data.message || 'Failed to load your consultations');
                setRooms([]);
            } else {
                setRooms(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            setError('Server connection failed');
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        loadRooms();
    }, [loadRooms]);

    useSocketEvent('chat:message', () => {
        loadRooms(true);
    });

    useSocketEvent('chat:room-created', () => {
        loadRooms(true);
    });

    useSocketEvent('appointment:booked', () => {
        loadRooms(true);
    });

    useSocketEvent('appointment:updated', () => {
        loadRooms(true);
    });

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-secondary">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="p-2.5 bg-white hover:bg-slate-100 rounded-xl text-secondary transition-colors inline-flex items-center gap-2 text-sm font-semibold border border-slate-200"
                    >
                        <FaArrowLeft /> Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-secondary">My Consultations</h1>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-primary/20 p-8">
                    <h2 className="text-xl font-bold text-secondary mb-6">Your Chat Rooms</h2>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <p className="text-sm text-slate-500 py-8 text-center">Loading your consultations...</p>
                    ) : rooms.length === 0 ? (
                        <div className="text-center py-10">
                            <FaComments className="mx-auto text-slate-300 text-4xl mb-4" />
                            <p className="text-sm text-slate-500">You have no consultations yet.</p>
                            <p className="text-xs text-slate-400 mt-1">
                                Book an appointment with a doctor to start a consultation.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {rooms.map((room) => (
                                <Link
                                    key={room.id}
                                    href={`/patient/consultation/${room.appointmentId}`}
                                    className="block p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <FaUserMd />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-secondary">
                                                    Dr. {room.doctor?.fullName || 'Doctor'}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {room.appointment?.date || ''}
                                                    {room.appointment?.date && room.appointment?.time ? ' at ' : ''}
                                                    {room.appointment?.time || ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xs font-semibold uppercase px-3 py-1 bg-primary/10 text-secondary rounded-lg">
                                                {room.appointment?.status || 'Pending'}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {room.messageCount} message{room.messageCount === 1 ? '' : 's'}
                                            </span>
                                        </div>
                                    </div>
                                    {room.lastMessage && (
                                        <p className="text-xs text-slate-500 truncate pl-13">
                                            Last: {room.lastMessage}
                                        </p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
