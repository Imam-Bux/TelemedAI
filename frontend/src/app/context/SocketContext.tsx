"use client"
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
    userId: string | null;
    role: string | null;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    connected: false,
    userId: null,
    role: null
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        let active = true;

        const connect = async () => {
            let profile = null;
            try {
                const res = await fetch('http://localhost:5000/auth/profile', {
                    credentials: 'include'
                });
                if (res.ok) {
                    profile = await res.json();
                }
            } catch {
                profile = null;
            }

            if (!active) return;

            const uid = profile?.id ? String(profile.id) : null;
            const r = profile?.role || null;
            setUserId(uid);
            setRole(r);

            const client = io('http://localhost:5000', {
                auth: { userId: uid, role: r },
                transports: ['websocket', 'polling']
            });

            socketRef.current = client;
            if (active) setSocket(client);

            client.on('connect', () => {
                if (active) setConnected(true);
            });
            client.on('disconnect', () => {
                if (active) setConnected(false);
            });
        };

        connect();

        return () => {
            active = false;
            const s = socketRef.current;
            if (s) {
                s.removeAllListeners();
                s.disconnect();
                socketRef.current = null;
            }
            setSocket(null);
            setConnected(false);
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, connected, userId, role }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
