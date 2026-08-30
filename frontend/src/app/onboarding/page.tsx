"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        gender: 'Male',
        weight: '',
        height: '',
        allergies: '',
        currentMedications: '',
        preExistingConditions: '',
        emergencyContact: '',
        bloodGroup: '',
        notes: '',
        pastSurgeries: '',
        smokingStatus: 'Non-Smoker'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/patient/onboarding', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                setError(data.message || 'Failed to save onboarding data');
                setLoading(false);
                return;
            }

            setLoading(false);
            router.push('/dashboard');
        } catch (err) {
            setError('Server connection failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-secondary">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-primary/20 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-secondary">Patient Medical Onboarding</h1>
                    <p className="text-sm text-slate-500 mt-2">Please complete your profile information before accessing your dashboard.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-secondary focus:outline-none focus:border-primary"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">Age</label>
                            <input
                                type="number"
                                name="age"
                                required
                                value={formData.age}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-secondary focus:outline-none focus:border-primary"
                                placeholder="25"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-secondary focus:outline-none focus:border-primary"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">Weight (kg)</label>
                            <input
                                type="text"
                                name="weight"
                                required
                                value={formData.weight}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-secondary focus:outline-none focus:border-primary"
                                placeholder="70"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">Height (cm)</label>
                            <input
                                type="text"
                                name="height"
                                required
                                value={formData.height}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-secondary focus:outline-none focus:border-primary"
                                placeholder="175"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">Allergies</label>
                            <input
                                type="text"
                                name="allergies"
                                required
                                value={formData.allergies}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-secondary focus:outline-none focus:border-primary"
                                placeholder="Penicillin, Dust, None"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">Current Medications</label>
                            <input
                                type="text"
                                name="currentMedications"
                                required
                                value={formData.currentMedications}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-secondary focus:outline-none focus:border-primary"
                                placeholder="None"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">Pre-existing Conditions</label>
                        <input
                            type="text"
                            name="preExistingConditions"
                            required
                            value={formData.preExistingConditions}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-secondary focus:outline-none focus:border-primary"
                            placeholder="Diabetes, Hypertension, None"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">Past Surgeries</label>
                            <input
                                type="text"
                                name="pastSurgeries"
                                value={formData.pastSurgeries}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-secondary focus:outline-none focus:border-primary"
                                placeholder="Appendectomy, None"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">Smoking Status</label>
                            <select
                                name="smokingStatus"
                                value={formData.smokingStatus}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-secondary focus:outline-none focus:border-primary"
                            >
                                <option value="Non-Smoker">Non-Smoker</option>
                                <option value="Smoker">Smoker</option>
                                <option value="Former Smoker">Former Smoker</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">Emergency Contact Number</label>
                            <input
                                type="text"
                                name="emergencyContact"
                                required
                                value={formData.emergencyContact}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-secondary focus:outline-none focus:border-primary"
                                placeholder="+1234567890"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">Blood Group</label>
                            <input
                                type="text"
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-secondary focus:outline-none focus:border-primary"
                                placeholder="O+"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-secondary mb-2">Additional Notes</label>
                        <textarea
                            name="notes"
                            rows={3}
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-secondary focus:outline-none focus:border-primary"
                            placeholder="Any other important medical details..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-secondary font-bold py-4 rounded-xl shadow-lg transition-colors duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Saving Profile...' : 'Save & Continue to Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
}