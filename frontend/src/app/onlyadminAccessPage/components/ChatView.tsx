"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { FaArrowLeft, FaComments, FaUserMd, FaUser } from 'react-icons/fa';
import { useSocketEvent } from '@/app/lib/useSocketEvent';

interface ChatRoom {
    id: string;
    appointmentId: string;
    patient?: { id: string; fullName?: string; email?: string };
    doctor?: { id: string; fullName?: string; email?: string };
    messageCount: number;
    lastMessage?: string;
    lastMessageAt?: string;
    createdAt?: string;
    status: string;
}

interface ChatMessage {
    id?: string;
    senderId?: string;
    senderRole?: string;
    senderName?: string;
    message: string;
    createdAt?: string;
}

interface RoomDetail {
    id: string;
    appointment?: { date?: string; time?: string; status?: string };
    patient?: { fullName?: string };
    doctor?: { fullName?: string };
}

export default function ChatView() {
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [roomDetail, setRoomDetail] = useState<RoomDetail | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);

    const loadRooms = useCallback(async (silent = false) => {
        if (!silent) {
            setLoading(true);
        }
        setError('');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/admin/rooms`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok || data?.error) {
                setError(data.message || 'Failed to load chat rooms');
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

    const openRoom = useCallback(async (roomId: string) => {
        setSelectedId(roomId);
        setDetailLoading(true);
        setRoomDetail(null);
        setMessages([]);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/admin/room/${roomId}`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok || data?.error) {
                setError(data.message || 'Failed to load chat room');
                return;
            }
            setRoomDetail(data.room || null);
            setMessages(data.messages || []);
        } catch (err) {
            setError('Server connection failed');
        } finally {
            setDetailLoading(false);
        }
    }, []);

    useSocketEvent('chat:message', (payload) => {
        const data = payload as { roomId?: string };
        loadRooms(true);
        if (selectedId && data?.roomId === selectedId) {
            openRoom(selectedId).catch(() => {});
        }
    });

    useSocketEvent('appointment:booked', () => {
        loadRooms(true);
    });

    useSocketEvent('chat:room-created', () => {
        loadRooms(true);
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800">All Chat Rooms</h3>
                    <div className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600">
                        Total: {rooms.length}
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="text-slate-500 text-sm py-8 text-center">Loading chat rooms...</p>
                ) : rooms.length === 0 ? (
                    <p className="text-slate-500 text-sm py-8 text-center">No chat rooms yet.</p>
                ) : (
                    <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                        {rooms.map((room) => (
                            <button
                                key={room.id}
                                onClick={() => openRoom(room.id)}
                                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                                    selectedId === room.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-slate-200 bg-slate-50 hover:border-primary/50'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                        <FaComments className="text-primary" />
                                        {room.doctor?.fullName || 'Doctor'} & {room.patient?.fullName || 'Patient'}
                                    </p>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(room.lastMessageAt || room.createdAt || '').toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                    {room.patient?.email} <span className="text-slate-300">/</span> {room.doctor?.email}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 truncate">
                                    {room.lastMessage ? `Last: ${room.lastMessage}` : 'No messages yet.'}
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                {!selectedId ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-slate-400 text-sm">Select a chat room to view the conversation.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <FaUserMd />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-800">
                                        {roomDetail?.doctor?.fullName || 'Doctor'}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        with {roomDetail?.patient?.fullName || 'Patient'}
                                        {roomDetail?.appointment?.date
                                            ? ` | ${roomDetail.appointment.date} ${roomDetail.appointment.time || ''}`
                                            : ''}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setSelectedId(''); setRoomDetail(null); setMessages([]); }}
                                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                            >
                                <FaArrowLeft /> Close
                            </button>
                        </div>

                        {detailLoading ? (
                            <div className="h-[440px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-slate-500 text-sm">Loading messages...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="h-[440px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-slate-400 text-xs">No messages in this chat.</p>
                            </div>
                        ) : (
                            <div className="h-[440px] grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col border border-emerald-200 bg-emerald-50/40 rounded-xl overflow-hidden">
                                    <div className="px-4 py-2 bg-emerald-100 flex items-center gap-2">
                                        <FaUserMd className="text-emerald-700 text-sm" />
                                        <p className="text-xs font-bold text-emerald-800">Doctor</p>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-3 p-3">
                                        {messages.filter((msg) => msg.senderRole === 'doctor').map((msg, idx) => (
                                            <div key={idx} className="flex flex-col">
                                                <div className="max-w-[85%] px-4 py-2 rounded-xl text-sm bg-white border border-emerald-200 text-slate-800 rounded-tl-sm shadow-sm">
                                                    {msg.message}
                                                </div>
                                                <span className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                                                    <FaUserMd className="text-[9px]" />
                                                    {msg.senderName || roomDetail?.doctor?.fullName || 'Doctor'} ·{' '}
                                                    {new Date(msg.createdAt || '').toLocaleDateString()} ·{' '}
                                                    {new Date(msg.createdAt || '').toLocaleTimeString()}
                                                </span>
                                            </div>
                                        ))}
                                        {messages.filter((m) => m.senderRole === 'doctor').length === 0 && (
                                            <p className="text-slate-400 text-xs text-center py-6">No doctor messages.</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col border border-blue-200 bg-blue-50/40 rounded-xl overflow-hidden">
                                    <div className="px-4 py-2 bg-blue-100 flex items-center gap-2">
                                        <FaUser className="text-blue-700 text-sm" />
                                        <p className="text-xs font-bold text-blue-800">Patient</p>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-3 p-3">
                                        {messages.filter((msg) => msg.senderRole === 'patient').map((msg, idx) => (
                                            <div key={idx} className="flex flex-col">
                                                <div className="max-w-[85%] px-4 py-2 rounded-xl text-sm bg-white border border-blue-200 text-slate-800 rounded-tl-sm shadow-sm">
                                                    {msg.message}
                                                </div>
                                                <span className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                                                    <FaUser className="text-[9px]" />
                                                    {msg.senderName || roomDetail?.patient?.fullName || 'Patient'} ·{' '}
                                                    {new Date(msg.createdAt || '').toLocaleDateString()} ·{' '}
                                                    {new Date(msg.createdAt || '').toLocaleTimeString()}
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
                    </>
                )}
            </div>
        </div>
    );
}
