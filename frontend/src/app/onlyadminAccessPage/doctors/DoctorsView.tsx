"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSocketEvent } from '@/app/lib/useSocketEvent';

interface DoctorUser {
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
    bio?: string;
}

export default function DoctorsView() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const router = useRouter();

    const fetchDoctors = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:5000/doctor/all', {
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                const filteredDoctors = data.filter((doc: Doctor) => doc.userId?.role !== 'admin');
                setDoctors(filteredDoctors);
            }
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    useSocketEvent('doctor:created', () => {
        fetchDoctors();
    });

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-800">Registered Doctors</h3>
                <button
                    onClick={() => router.push('/onlyadminAccessPage/doctors/add')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
                >
                    Add Doctor
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {doctors.map((doc: Doctor) => (
                    <div key={doc._id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col bg-white">
                        <div className="flex justify-between items-start mb-5 border-b border-slate-100 pb-5">
                            <div>
                                <h4 className="text-lg font-bold text-slate-800">{doc.userId?.fullName || 'Unknown Name'}</h4>
                                <p className="text-sm text-slate-500 mt-1">{doc.userId?.email || 'No Email Provided'}</p>
                            </div>
                            <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold uppercase tracking-wider border border-green-200">
                                Active
                            </span>
                        </div>

                        <div className="space-y-5 flex-1">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Specialty</p>
                                <p className="text-sm font-semibold text-blue-700 bg-blue-50 inline-block px-3 py-1.5 rounded-lg border border-blue-100">
                                    {doc.specialty || 'Not Assigned'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fee</p>
                                    <p className="text-sm font-bold text-slate-800">Rs. {doc.consultationFee || '0'}</p>
                                </div>
                                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Timings</p>
                                    <p className="text-sm font-bold text-slate-800">{doc.availableTimings || 'Not Set'}</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Biography</p>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 h-24 overflow-y-auto">
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {doc.bio || 'No biography details have been provided for this doctor yet.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {doctors.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-slate-500 font-medium">No doctors found in the system.</p>
                    </div>
                )}
            </div>
        </div>
    );
}