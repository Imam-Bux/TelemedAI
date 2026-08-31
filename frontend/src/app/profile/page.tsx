"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

type PatientProfile = {
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

export default function PatientProfilePage() {
    const [profile, setProfile] = useState<PatientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patient/profile`, {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await response.json();
                if (!response.ok || data.error) {
                    setError(data.message || 'Failed to fetch profile data');
                } else {
                    setProfile(data);
                }
            } catch (err) {
                setError('Server connection failed');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-secondary">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-primary/20 p-8">
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/dashboard"
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-secondary transition-colors inline-flex items-center gap-2 text-sm font-semibold"
                    >
                        <FaArrowLeft /> Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-secondary">Patient Profile</h1>
                </div>

                {loading && (
                    <div className="text-center py-12 text-slate-500">Loading profile...</div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                {!loading && !error && profile && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Full Name</span>
                                <span className="text-sm font-medium text-secondary">{profile.fullName}</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Age</span>
                                <span className="text-sm font-medium text-secondary">{profile.age}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Gender</span>
                                <span className="text-sm font-medium text-secondary">{profile.gender}</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Weight</span>
                                <span className="text-sm font-medium text-secondary">{profile.weight} kg</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Height</span>
                                <span className="text-sm font-medium text-secondary">{profile.height} cm</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Allergies</span>
                                <span className="text-sm font-medium text-secondary">{profile.allergies}</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Current Medications</span>
                                <span className="text-sm font-medium text-secondary">{profile.currentMedications}</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Pre-existing Conditions</span>
                            <span className="text-sm font-medium text-secondary">{profile.preExistingConditions}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Emergency Contact</span>
                                <span className="text-sm font-medium text-secondary">{profile.emergencyContact}</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Blood Group</span>
                                <span className="text-sm font-medium text-secondary">{profile.bloodGroup || 'Not specified'}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Past Surgeries</span>
                                <span className="text-sm font-medium text-secondary">{profile.pastSurgeries || 'None'}</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Smoking Status</span>
                                <span className="text-sm font-medium text-secondary">{profile.smokingStatus || 'Non-Smoker'}</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Notes</span>
                            <span className="text-sm font-medium text-secondary">{profile.notes || 'None'}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}