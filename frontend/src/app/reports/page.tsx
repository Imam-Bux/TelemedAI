"use client"
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaFilePdf } from 'react-icons/fa';

interface Report {
    _id: string;
    fileName: string;
    aiSummary: {
        summary: string;
        keyFindings: string;
        concerns: string;
    };
    createdAt: string;
}

export default function PatientReportsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState<Report[]>([]);
    const [summaryResult, setSummaryResult] = useState<{ summary: string; keyFindings: string; concerns: string } | null>(null);
    const [error, setError] = useState('');

    const fetchSavedReports = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patient/reports`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok && Array.isArray(data)) {
                setReports(data);
            }
        } catch (err: unknown) {
            console.error('Failed to load saved reports', err);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadReports = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patient/reports`, {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await response.json();
                if (isMounted && response.ok && Array.isArray(data)) {
                    setReports(data);
                }
            } catch (err: unknown) {
                console.error('Failed to load saved reports', err);
            }
        };

        loadReports();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
                setError('');
            } else {
                setFile(null);
                setError('Please select a valid PDF file');
            }
        }
    };

    const handleUploadAndSummarize = async () => {
        if (!file) {
            setError('Please select a PDF file first');
            return;
        }

        setLoading(true);
        setError('');
        setSummaryResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patient/reports`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to generate summary');
            }

            setSummaryResult(data.aiSummary);
            fetchSavedReports();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to generate summary';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

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
                        <h1 className="text-2xl font-bold text-secondary">My Medical Reports</h1>
                    </div>

                    <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <label className="block text-sm font-semibold text-secondary mb-3">Upload Medical PDF Report</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-secondary hover:file:bg-primary/90 cursor-pointer"
                            />
                            <button
                                onClick={handleUploadAndSummarize}
                                disabled={loading || !file}
                                className="px-6 py-3 bg-primary text-secondary font-bold text-sm rounded-xl shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                {loading ? 'Processing...' : 'Summarize'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
                            {error}
                        </div>
                    )}

                    {summaryResult && (
                        <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                                <FaFilePdf className="text-primary text-2xl" />
                                <div>
                                    <h3 className="font-bold text-secondary">{file?.name}</h3>
                                    <span className="text-xs text-slate-500">AI Summary Generated Successfully</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">General Summary</h4>
                                <p className="text-sm text-secondary bg-white p-4 rounded-xl border border-slate-200">{summaryResult.summary}</p>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Key Findings</h4>
                                <p className="text-sm text-secondary bg-white p-4 rounded-xl border border-slate-200">{summaryResult.keyFindings}</p>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Possible Concerns</h4>
                                <p className="text-sm text-secondary bg-white p-4 rounded-xl border border-slate-200">{summaryResult.concerns}</p>
                            </div>

                            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
                                Disclaimer: This AI summary is informational only and does not replace a doctor opinion.
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-primary/20 p-8">
                    <h2 className="text-xl font-bold text-secondary mb-6">Saved Reports History</h2>
                    {reports.length === 0 ? (
                        <p className="text-sm text-slate-500">No saved reports found.</p>
                    ) : (
                        <div className="space-y-6">
                            {reports.map((report) => (
                                <div key={report._id} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                        <div className="flex items-center gap-3">
                                            <FaFilePdf className="text-primary text-2xl" />
                                            <div>
                                                <h3 className="font-bold text-secondary">{report.fileName}</h3>
                                                <span className="text-xs text-slate-500">Saved on {new Date(report.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">General Summary</h4>
                                        <p className="text-sm text-secondary bg-white p-4 rounded-xl border border-slate-200">{report.aiSummary.summary}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Key Findings</h4>
                                        <p className="text-sm text-secondary bg-white p-4 rounded-xl border border-slate-200">{report.aiSummary.keyFindings}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Possible Concerns</h4>
                                        <p className="text-sm text-secondary bg-white p-4 rounded-xl border border-slate-200">{report.aiSummary.concerns}</p>
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