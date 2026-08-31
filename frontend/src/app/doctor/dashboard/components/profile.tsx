'use client';
import React, { useState, useEffect } from 'react';

interface DoctorProfile {
    specialty?: string;
    bio?: string;
    consultationFee?: number;
    availableTimings?: string;
}

interface ProfileProps {
    onTabChange?: (tab: string) => void;
}

export default function ProfileComponent({ onTabChange }: ProfileProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [specialty, setSpecialty] = useState('');
    const [bio, setBio] = useState('');
    const [consultationFee, setConsultationFee] = useState('');
    const [availableTimings, setAvailableTimings] = useState('');

    useEffect(() => {
        let isActive = true;

        const loadProfile = async () => {
            setIsLoading(true);
            setError('');

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/doctor/my-profile`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Failed to load profile');
                }

                const data = await res.json();
                const profile = data.profile || {};

                if (!isActive) return;

                setSpecialty(profile.specialty || '');
                setBio(profile.bio || '');
                setConsultationFee(profile.consultationFee || '');
                setAvailableTimings(profile.availableTimings || '');
            } catch (err) {
                if (!isActive) return;
                setError(err instanceof Error ? err.message : 'Failed to load profile');
                console.error(err);
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            isActive = false;
        };
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            const profileData = {
                specialty,
                bio,
                consultationFee: Number(consultationFee),
                availableTimings
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/doctor/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(profileData)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            setMessage('Profile updated successfully');
            setIsEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Profile & Settings</h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700"
                    >
                        Edit
                    </button>
                )}
            </div>

            {isLoading && <div className="mb-4 p-3 bg-blue-50 text-blue-600 rounded-xl text-sm">Loading...</div>}
            {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm">{message}</div>}
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

            {!isEditing ? (
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Specialty</p>
                        <p className="text-sm text-slate-800">{specialty || 'Not set'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Bio</p>
                        <p className="text-sm text-slate-800">{bio || 'Not set'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Consultation Fee</p>
                        <p className="text-sm text-slate-800">PKR {consultationFee || '0'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Available Timings</p>
                        <p className="text-sm text-slate-800">{availableTimings || 'Not set'}</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Specialty</label>
                        <input
                            type="text"
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Consultation Fee</label>
                        <input
                            type="number"
                            value={consultationFee}
                            onChange={(e) => setConsultationFee(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
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
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                        />
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold text-sm transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}