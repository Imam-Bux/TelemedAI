'use client';
import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

interface DoctorProfile {
    specialty?: string;
    bio?: string;
    consultationFee?: number;
    availableTimings?: string;
    availableSlots?: string[];
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
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [newSlot, setNewSlot] = useState('');

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
                const profile: DoctorProfile = data.profile || {};

                if (!isActive) return;

                setSpecialty(profile.specialty || '');
                setBio(profile.bio || '');
                setConsultationFee(profile.consultationFee ? String(profile.consultationFee) : '');
                setAvailableTimings(profile.availableTimings || '');
                setAvailableSlots(profile.availableSlots || []);
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

    const handleAddSlot = () => {
        const trimmed = newSlot.trim();
        if (!trimmed) return;
        if (availableSlots.includes(trimmed)) {
            setNewSlot('');
            return;
        }
        setAvailableSlots([...availableSlots, trimmed]);
        setNewSlot('');
    };

    const handleRemoveSlot = (slot: string) => {
        setAvailableSlots(availableSlots.filter((s) => s !== slot));
    };

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
                availableTimings,
                availableSlots
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
                        <p className="text-xs font-semibold text-slate-500 mb-1">Available Timings (display text)</p>
                        <p className="text-sm text-slate-800">{availableTimings || 'Not set'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs font-semibold text-slate-500 mb-2">Bookable Time Slots</p>
                        {availableSlots.length === 0 ? (
                            <p className="text-sm text-slate-500">No slots added yet — patients can&apos;t book you until you add some.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {availableSlots.map((slot) => (
                                    <span key={slot} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">
                                        {slot}
                                    </span>
                                ))}
                            </div>
                        )}
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
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Available Timings (display text)</label>
                        <input
                            type="text"
                            value={availableTimings}
                            onChange={(e) => setAvailableTimings(e.target.value)}
                            placeholder="Mon-Fri 9AM - 5PM"
                            required
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Bookable Time Slots</label>
                        <p className="text-xs text-slate-400 mb-2">These are the exact slots patients can pick when booking an appointment with you.</p>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={newSlot}
                                onChange={(e) => setNewSlot(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddSlot();
                                    }
                                }}
                                placeholder="e.g. 09:00 AM"
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                            />
                            <button
                                type="button"
                                onClick={handleAddSlot}
                                className="px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-900"
                            >
                                Add
                            </button>
                        </div>
                        {availableSlots.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {availableSlots.map((slot) => (
                                    <span
                                        key={slot}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100"
                                    >
                                        {slot}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSlot(slot)}
                                            className="text-blue-400 hover:text-blue-700"
                                        >
                                            <FaTimes />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
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