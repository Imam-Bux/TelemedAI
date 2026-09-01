"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { FaCalendarCheck } from 'react-icons/fa';

interface AppointmentAdminView {
    _id: string;
    appointmentId?: string;
    patientId?: { fullName?: string; email?: string };
    doctorId?: { fullName?: string; email?: string };
    date: string;
    time: string;
    status: string;
    consultationFee?: number;
    createdAt: string;
}

export default function AppointmentsView() {
    const [appointments, setAppointments] = useState<AppointmentAdminView[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAllAppointments = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointment/admin/all`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok || data.error) {
                setError(data.message || 'Failed to fetch appointments');
            } else if (Array.isArray(data)) {
                setAppointments(data);
            } else {
                setAppointments([]);
            }
        } catch (err) {
            setError('Server connection failed');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllAppointments();
        const intervalId = window.setInterval(() => {
            fetchAllAppointments();
        }, 10000);
        return () => window.clearInterval(intervalId);
    }, [fetchAllAppointments]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">All Appointments</h3>
                    <p className="text-slate-500 text-sm">Every appointment booked across the platform, with appointment ID, patient, doctor, date, time and fee.</p>
                </div>
                <div className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600">
                    Total: {appointments.length}
                </div>
            </div>

            {loading && (
                <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
                    Loading appointments...
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
                    {error}
                </div>
            )}

            {!loading && !error && appointments.length === 0 && (
                <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
                    No appointments found.
                </div>
            )}

            {!loading && !error && appointments.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-400">
                                <th className="p-4">Appointment ID</th>
                                <th className="p-4">Patient</th>
                                <th className="p-4">Doctor</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Time</th>
                                <th className="p-4">Fee</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((appt) => (
                                <tr key={appt._id} className="border-b border-slate-50 last:border-0">
                                    <td className="p-4 font-mono text-xs text-slate-500">
                                        {(appt.appointmentId || appt._id)?.slice(-8)}
                                    </td>
                                    <td className="p-4">
                                        <p className="font-semibold text-slate-800">{appt.patientId?.fullName || 'Unknown'}</p>
                                        <p className="text-xs text-slate-400">{appt.patientId?.email}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-semibold text-slate-800">{appt.doctorId?.fullName || 'Unknown'}</p>
                                        <p className="text-xs text-slate-400">{appt.doctorId?.email}</p>
                                    </td>
                                    <td className="p-4 text-slate-700">{appt.date}</td>
                                    <td className="p-4 text-slate-700">{appt.time}</td>
                                    <td className="p-4 text-slate-700 font-semibold">PKR {appt.consultationFee || 0}</td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-secondary text-xs font-bold rounded-lg">
                                            <FaCalendarCheck className="text-primary" />
                                            {appt.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}