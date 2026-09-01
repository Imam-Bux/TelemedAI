"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import tokenService from './tokenService';

export type AuthStatus = 'loading' | 'authorized' | 'unauthorized';

/**
 * Client-side route guard.
 *
 * Calls `/auth/profile` on mount and only redirects to the login/landing page
 * when the session is *definitely* invalid (401/403). Transient backend errors
 * (5xx, network hiccups, cold starts) are retried a few times instead of
 * bouncing the user back to the home page on a simple refresh.
 *
 * @param role expected role(s) for this page ('patient' | 'doctor' | 'admin')
 */
export function useRequireRole(role: string | string[]) {
    const router = useRouter();
    const [status, setStatus] = useState<AuthStatus>('loading');
    const roleKey = Array.isArray(role) ? role.join(',') : role;

    useEffect(() => {
        let cancelled = false;
        let attempt = 0;

        const check = async () => {
            attempt += 1;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (res.status === 401 || res.status === 403) {
                    // Genuinely logged out / bad session.
                    tokenService.removeUser();
                    if (attempt < 3) {
                        window.setTimeout(check, 500 * attempt);
                        return;
                    }
                    if (!cancelled) setStatus('unauthorized');
                    router.push('/');
                    return;
                }

                if (!res.ok) {
                    // Transient 5xx / backend hiccup — retry before giving up.
                    if (attempt < 3) {
                        window.setTimeout(check, 700 * attempt);
                        return;
                    }
                    tokenService.removeUser();
                    if (!cancelled) setStatus('unauthorized');
                    router.push('/');
                    return;
                }

                const user = await res.json();
                if (cancelled) return;

                if (user.role === 'doctor' && user.mustChangePassword) {
                    if (!cancelled) setStatus('unauthorized');
                    router.push('/doctor/change-password');
                    return;
                }

                const roles = roleKey.split(',');
                if (!roles.includes(user.role)) {
                    tokenService.removeUser();
                    if (!cancelled) setStatus('unauthorized');
                    router.push('/');
                    return;
                }

                if (!cancelled) setStatus('authorized');
            } catch {
                // Network error — don't bounce on a flaky connection.
                if (attempt < 3) {
                    window.setTimeout(check, 700 * attempt);
                    return;
                }
                tokenService.removeUser();
                if (!cancelled) setStatus('unauthorized');
                router.push('/');
            }
        };

        check();

        return () => {
            cancelled = true;
        };
    }, [router, roleKey]);

    return status;
}