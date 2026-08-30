'use client';
import React, { useState, useEffect } from 'react';

interface Appointment {
    id: string | number;
    patient_id: string | number;
    patient_name?: string;
    date: string;
    time: string;
    status: string;
}

interface AppointmentsProps {
    onSelectAppointment: (appointment: Appointment) => void;
}

export default function AppointmentsComponent({ onSelectAppointment }: AppointmentsProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAppointments = async () => {
            setIsLoading(true);
            setError('');

            try {
                const res = await fetch('http://localhost:5000/doctor/appointments', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Failed to fetch appointments');
                }

                const data = await res.json();
                setAppointments(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error loading appointments');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Assigned Appointments</h2>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

            {isLoading ? (
                <p className="text-slate-500 text-sm">Loading appointments...</p>
            ) : appointments.length === 0 ? (
                <p className="text-slate-500 text-sm">No appointments found.</p>
            ) : (
                <div className="space-y-4">
                    {appointments.map((appt) => (
                        <div key={appt.id} className="p-4 border border-slate-200 rounded-xl flex justify-between items-center">
                            <div>
                                <p className="font-bold text-slate-800">Patient: {appt.patient_name || appt.patient_id}</p>
                                <p className="text-xs text-slate-500">
                                    {appt.date} at {appt.time}
                                </p>
                                <p className="text-xs font-semibold mt-1 uppercase text-blue-600">Status: {appt.status}</p>
                            </div>
                            <button
                                onClick={() => onSelectAppointment(appt)}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
                            >
                                Open Consultation Room
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}