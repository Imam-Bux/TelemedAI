"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaUserMd, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useSocketEvent } from '@/app/lib/useSocketEvent';

interface DoctorUser {
    _id: string;
    fullName?: string;
    email?: string;
    role?: string;
}

interface Doctor {
    _id: string;
    userId?: DoctorUser;
    specialty?: string;
    consultationFee?: number | string;
    availableTimings?: string;
    availableSlots?: string[];
    bio?: string;
}

interface MyAppointment {
    _id: string;
    doctorId?: { _id: string; fullName?: string; email?: string };
    date: string;
    time: string;
    status: string;
}

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_LABELS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const toISODate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const startOfDay = (d: Date) => {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy;
};

interface CalendarProps {
    value: string; // 'YYYY-MM-DD'
    onChange: (isoDate: string) => void;
    minDate?: Date;
    enabledDays?: number[];
}

function Calendar({ value, onChange, minDate, enabledDays }: CalendarProps) {
    const today = startOfDay(new Date());
    const effectiveMin = minDate ? startOfDay(minDate) : today;

    const initialMonth = value ? new Date(value + 'T00:00:00') : today;
    const [viewYear, setViewYear] = useState(initialMonth.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialMonth.getMonth());

    const weeks = useMemo(() => {
        const firstOfMonth = new Date(viewYear, viewMonth, 1);
        const startWeekday = firstOfMonth.getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

        const cells: (Date | null)[] = [];
        for (let i = 0; i < startWeekday; i++) cells.push(null);
        for (let day = 1; day <= daysInMonth; day++) {
            cells.push(new Date(viewYear, viewMonth, day));
        }
        while (cells.length % 7 !== 0) cells.push(null);

        const rows: (Date | null)[][] = [];
        for (let i = 0; i < cells.length; i += 7) {
            rows.push(cells.slice(i, i + 7));
        }
        return rows;
    }, [viewYear, viewMonth]);

    const goPrevMonth = () => {
        const prev = new Date(viewYear, viewMonth - 1, 1);
        setViewYear(prev.getFullYear());
        setViewMonth(prev.getMonth());
    };

    const goNextMonth = () => {
        const next = new Date(viewYear, viewMonth + 1, 1);
        setViewYear(next.getFullYear());
        setViewMonth(next.getMonth());
    };

    const isPast = (d: Date) => startOfDay(d) < effectiveMin;
    const isOutsideAvailability = (d: Date) =>
        Array.isArray(enabledDays) && enabledDays.length > 0 && !enabledDays.includes(d.getDay());
    const isSelected = (d: Date) => value === toISODate(d);
    const isToday = (d: Date) => toISODate(d) === toISODate(today);

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 select-none">
            <div className="flex items-center justify-between mb-4">
                <button
                    type="button"
                    onClick={goPrevMonth}
                    className="p-2 rounded-lg hover:bg-slate-200 text-secondary transition-colors"
                    aria-label="Previous month"
                >
                    <FaChevronLeft className="text-xs" />
                </button>
                <span className="text-sm font-bold text-secondary">
                    {MONTH_LABELS[viewMonth]} {viewYear}
                </span>
                <button
                    type="button"
                    onClick={goNextMonth}
                    className="p-2 rounded-lg hover:bg-slate-200 text-secondary transition-colors"
                    aria-label="Next month"
                >
                    <FaChevronRight className="text-xs" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAY_LABELS.map((w) => (
                    <div key={w} className="text-center text-[11px] font-semibold text-slate-400 py-1">
                        {w}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {weeks.map((row, ri) =>
                    row.map((d, ci) => {
                        if (!d) return <div key={`${ri}-${ci}`} />;
                        const disabled = isPast(d) || isOutsideAvailability(d);
                        const selected = isSelected(d);
                        return (
                            <button
                                key={`${ri}-${ci}`}
                                type="button"
                                disabled={disabled}
                                onClick={() => onChange(toISODate(d))}
                                className={`aspect-square rounded-lg text-xs font-semibold transition-colors
                                    ${disabled ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-primary/20 cursor-pointer'}
                                    ${selected ? 'bg-primary text-secondary hover:bg-primary' : ''}
                                    ${isToday(d) && !selected ? 'ring-1 ring-primary/60' : ''}
                                `}
                            >
                                {d.getDate()}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default function PatientAppointmentsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [doctorSchedule, setDoctorSchedule] = useState<{ days: number[]; slots: string[] }>({ days: [], slots: [] });
    const [date, setDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [myAppointments, setMyAppointments] = useState<MyAppointment[]>([]);

    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Used for on-demand refreshes (e.g. right after booking succeeds).
    // Safe to call from event handlers - only the mount effect below avoids
    // calling this directly, to satisfy react-hooks/set-state-in-effect.
    const fetchMyAppointments = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointment/my`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setMyAppointments(data);
            }
        } catch (err) {
            console.error('Failed to load your appointments', err);
        }
    }, []);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/doctor/all`, {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await res.json();
                if (res.ok && Array.isArray(data)) {
                    setDoctors(data.filter((doc: Doctor) => doc.userId?.role !== 'admin'));
                }
            } catch (err) {
                console.error('Failed to load doctors', err);
            } finally {
                setLoadingDoctors(false);
            }
        };

        fetchDoctors();
    }, []);

    useEffect(() => {
        // Local self-contained fetch on mount - avoids calling the shared
        // useCallback fetcher directly from the effect body.
        const loadMyAppointments = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointment/my`, {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await res.json();
                if (res.ok && Array.isArray(data)) {
                    setMyAppointments(data);
                }
            } catch (err) {
                console.error('Failed to load your appointments', err);
            }
        };

        loadMyAppointments();
    }, []);

    useSocketEvent('appointment:booked', () => {
        fetchMyAppointments();
    });

    useSocketEvent('appointment:updated', () => {
        fetchMyAppointments();
    });

    useEffect(() => {
        let cancelled = false;

        const fetchSchedule = async () => {
            if (!selectedDoctorId) {
                setDoctorSchedule({ days: [], slots: [] });
                return;
            }
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/appointment/schedule/${selectedDoctorId}`,
                    { method: 'GET', credentials: 'include' }
                );
                const data = await res.json();
                if (cancelled) return;
                if (res.ok && !data?.error) {
                    setDoctorSchedule({
                        days: Array.isArray(data.days) ? data.days : [],
                        slots: Array.isArray(data.slots) ? data.slots : []
                    });
                } else {
                    setDoctorSchedule({ days: [], slots: [] });
                }
            } catch (err) {
                if (!cancelled) setDoctorSchedule({ days: [], slots: [] });
            }
        };

        fetchSchedule();

        return () => {
            cancelled = true;
        };
    }, [selectedDoctorId]);

    useEffect(() => {
        let cancelled = false;

        const syncSlots = async () => {
            // Reset selection state for the new doctor/date pair. Nesting
            // this inside the async function (instead of as bare top-level
            // effect statements) keeps it out of the synchronous effect body.
            setSelectedSlot('');
            setAvailableSlots([]);

            if (!selectedDoctorId || !date) return;
            if (!doctorSchedule.days.includes(new Date(date + 'T00:00:00').getDay())) {
                setError('');
                setAvailableSlots([]);
                return;
            }

            setLoadingSlots(true);
            setError('');

            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/appointment/available-slots/${selectedDoctorId}?date=${date}`,
                    { method: 'GET', credentials: 'include' }
                );
                const data = await res.json();
                if (cancelled) return;

                if (!res.ok || data?.error) {
                    setError(data.message || 'Failed to load available slots');
                    setAvailableSlots([]);
                } else {
                    setAvailableSlots(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                if (!cancelled) setError('Server connection failed');
            } finally {
                if (!cancelled) setLoadingSlots(false);
            }
        };

        syncSlots();

        return () => {
            cancelled = true;
        };
    }, [selectedDoctorId, date, doctorSchedule.days]);

    const handleBook = async () => {
        if (!selectedDoctorId || !date || !selectedSlot) return;

        setBooking(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointment/book`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    doctorId: selectedDoctorId,
                    date,
                    time: selectedSlot
                })
            });

            const data = await res.json();

            if (!res.ok || data?.error) {
                setError(data.message || 'Failed to book appointment');
                return;
            }

            setSuccess('Appointment booked successfully!');
            setSelectedSlot('');
            setAvailableSlots((prev) => prev.filter((slot) => slot !== selectedSlot));
            fetchMyAppointments();
        } catch (err) {
            setError('Server connection failed');
        } finally {
            setBooking(false);
        }
    };

    const selectedDoctor = doctors.find((d) => d.userId?._id === selectedDoctorId);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-secondary">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="bg-white rounded-3xl shadow-xl border border-primary/20 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <Link
                            href="/dashboard"
                            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-secondary transition-colors inline-flex items-center gap-2 text-sm font-semibold"
                        >
                            <FaArrowLeft /> Back to Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-secondary">Book an Appointment</h1>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm text-center">
                            {success}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
                                Choose a Doctor
                            </label>
                            {loadingDoctors ? (
                                <p className="text-sm text-slate-500">Loading doctors...</p>
                            ) : doctors.length === 0 ? (
                                <p className="text-sm text-slate-500">No doctors available right now.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {doctors.map((doc) => {
                                        const userId = doc.userId?._id;
                                        return (
                                            <button
                                                key={doc._id}
                                                type="button"
                                                disabled={!userId}
                                                onClick={() => {
                                                    if (!userId) return;
                                                    setSelectedDoctorId(userId);
                                                    setDate('');
                                                    setSelectedSlot('');
                                                    setAvailableSlots([]);
                                                }}
                                                className={`text-left p-4 rounded-xl border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    selectedDoctorId === userId
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-slate-200 bg-slate-50 hover:border-primary/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <FaUserMd className="text-primary" />
                                                    <span className="font-bold text-sm text-secondary">
                                                        {doc.userId?.fullName || 'Doctor'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500">{doc.specialty || 'General'}</p>
                                                {doc.userId?.email && (
                                                    <p className="text-xs text-slate-400 mt-1">Email: {doc.userId.email}</p>
                                                )}
                                                <p className="text-xs text-slate-400 mt-1">Fee: PKR {doc.consultationFee || 0}</p>
                                                {doc.availableTimings && (
                                                    <p className="text-xs text-slate-400 mt-1">Timings: {doc.availableTimings}</p>
                                                )}
                                                {Array.isArray(doc.availableSlots) && doc.availableSlots.length > 0 && (
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Slots: {doc.availableSlots.join(', ')}
                                                    </p>
                                                )}
                                                {doc.bio && (
                                                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{doc.bio}</p>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {selectedDoctorId && (
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
                                    Choose a Date
                                </label>
                                <Calendar value={date} onChange={setDate} enabledDays={doctorSchedule.days} />
                                {date && (
                                    <p className="text-xs text-slate-400 mt-2">
                                        Selected: {new Date(date + 'T00:00:00').toDateString()}
                                    </p>
                                )}
                            </div>
                        )}

                        {selectedDoctorId && date && (
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
                                    Available Slots
                                </label>
                                {loadingSlots ? (
                                    <p className="text-sm text-slate-500">Checking availability...</p>
                                ) : availableSlots.length === 0 ? (
                                    <p className="text-sm text-slate-500">
                                        No open slots for {selectedDoctor?.userId?.fullName || 'this doctor'} on this date.
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {availableSlots.map((slot) => (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => setSelectedSlot(slot)}
                                                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                                                    selectedSlot === slot
                                                        ? 'bg-primary border-primary text-secondary'
                                                        : 'bg-white border-slate-200 text-slate-700 hover:border-primary'
                                                }`}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedSlot && (
                            <button
                                onClick={handleBook}
                                disabled={booking}
                                className="w-full bg-primary hover:bg-primary/90 text-secondary font-bold py-4 rounded-xl shadow-lg transition-colors duration-200 disabled:opacity-50"
                            >
                                {booking ? 'Booking...' : `Confirm Appointment - ${date} at ${selectedSlot}`}
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-primary/20 p-8">
                    <h2 className="text-xl font-bold text-secondary mb-6">My Appointments</h2>
                    {myAppointments.length === 0 ? (
                        <p className="text-sm text-slate-500">You have no appointments yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {myAppointments.map((appt) => (
                                <div
                                    key={appt._id}
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                                >
                                    <div>
                                        <p className="font-bold text-sm text-secondary">
                                            Dr. {appt.doctorId?.fullName || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-slate-500">{appt.date} at {appt.time}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold uppercase px-3 py-1 bg-primary/10 text-secondary rounded-lg">
                                            {appt.status}
                                        </span>
                                        <Link
                                            href={`/patient/consultation/${appt._id}`}
                                            className="text-xs font-semibold px-3 py-1 bg-secondary text-white rounded-lg hover:opacity-90"
                                        >
                                            Consultation
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}