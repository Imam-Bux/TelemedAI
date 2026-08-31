"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { useSocketEvent } from '@/app/lib/useSocketEvent';

type PatientProfile = {
    _id: string;
    fullName: string;
    age: number | string;
    gender: string;
    weight: number | string;
    height: number | string;
    allergies: string;
    currentMedications: string;
    preExistingConditions: string;
    emergencyContact: string;
    bloodGroup?: string;
    pastSurgeries?: string;
    smokingStatus?: string;
    notes?: string;
};

export default function PatientsView() {
    const [profiles, setProfiles] = useState<PatientProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAllProfiles = useCallback(async (silent = false) => {
        if (!silent) {
            setLoading(true);
        }
        setError('');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patient/admin/profiles`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok || data.error) {
                setError(data.message || 'Failed to fetch patient profiles');
            } else if (Array.isArray(data)) {
                setProfiles(data);
            } else {
                setProfiles([]);
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
        fetchAllProfiles();
    }, [fetchAllProfiles]);

    useSocketEvent('patient:profile-updated', () => {
        fetchAllProfiles(true);
    });

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Patients & User Profiles</h3>
                    <p className="text-slate-500 text-sm">Review complete onboarding details submitted by registered patients.</p>
                </div>
                <div className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600">
                    Total: {profiles.length}
                </div>
            </div>

            {loading && (
                <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
                    Loading patient profiles...
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
                    {error}
                </div>
            )}

            {!loading && !error && profiles.length === 0 && (
                <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
                    No patient profiles found.
                </div>
            )}

            {!loading && !error && profiles.length > 0 && (
                <div className="grid grid-cols-1 gap-6">
                    {profiles.map((profile) => (
                        <div key={profile._id || profile.fullName} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-2">
                                <div>
                                    <h4 className="text-xl font-bold text-slate-800">{profile.fullName}</h4>
                                    <span className="text-xs text-slate-400">ID: {profile._id}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                                        {profile.gender}
                                    </span>
                                    <span className="px-3 py-1 bg-primary/10 text-secondary text-xs font-semibold rounded-lg">
                                        Blood: {profile.bloodGroup || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Age</span>
                                    <span className="text-sm font-medium text-slate-800">{profile.age} yrs</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Weight</span>
                                    <span className="text-sm font-medium text-slate-800">{profile.weight} kg</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Height</span>
                                    <span className="text-sm font-medium text-slate-800">{profile.height} cm</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Smoking</span>
                                    <span className="text-sm font-medium text-slate-800">{profile.smokingStatus || 'Non-Smoker'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Allergies</span>
                                    <p className="text-sm text-slate-700">{profile.allergies || 'None'}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Current Medications</span>
                                    <p className="text-sm text-slate-700">{profile.currentMedications || 'None'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Pre-existing Conditions</span>
                                    <p className="text-sm text-slate-700">{profile.preExistingConditions || 'None'}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Past Surgeries</span>
                                    <p className="text-sm text-slate-700">{profile.pastSurgeries || 'None'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Emergency Contact</span>
                                    <p className="text-sm text-slate-700">{profile.emergencyContact || 'N/A'}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Additional Notes</span>
                                    <p className="text-sm text-slate-700">{profile.notes || 'None'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}