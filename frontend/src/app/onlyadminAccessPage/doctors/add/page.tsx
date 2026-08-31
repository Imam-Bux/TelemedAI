"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TempPasswordResponse {
    tempPassword: string;
    message?: string;
}

export default function AddDoctorPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [bio, setBio] = useState('');
    const [consultationFee, setConsultationFee] = useState('');
    const [availableTimings, setAvailableTimings] = useState('');
    const [tempPasswordResult, setTempPasswordResult] = useState<TempPasswordResponse | null>(null);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleAddDoctor = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/doctor/create`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    specialty,
                    bio,
                    consultationFee: Number(consultationFee),
                    availableTimings
                })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Failed to create doctor');
                return;
            }
            setTempPasswordResult(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Add New Doctor</h2>
                    <button
                        onClick={() => router.push('/onlyadminAccessPage')}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold text-sm"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

                {tempPasswordResult ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
                            <p className="font-bold">Doctor created successfully!</p>
                            <p className="mt-2">Temporary Password: <span className="font-mono bg-white px-2 py-1 border rounded">{tempPasswordResult.tempPassword}</span></p>
                            <p className="text-xs mt-1">Provide this password to the doctor. They will be forced to change it upon first login.</p>
                        </div>
                        <button
                            onClick={() => router.push('/onlyadminAccessPage')}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleAddDoctor} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Specialty</label>
                            <input
                                type="text"
                                value={specialty}
                                onChange={(e) => setSpecialty(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Consultation Fee</label>
                            <input
                                type="number"
                                value={consultationFee}
                                onChange={(e) => setConsultationFee(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Available Timings</label>
                            <input
                                type="text"
                                value={availableTimings}
                                onChange={(e) => setAvailableTimings(e.target.value)}
                                placeholder="Mon-Fri 9AM - 5PM"
                                required
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                        >
                            Save Doctor
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}