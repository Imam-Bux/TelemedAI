"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { FaFilePdf } from 'react-icons/fa';

interface Report {
    _id: string;
    fileName: string;
    patientId?: string;
    aiSummary: {
        summary: string;
        keyFindings: string;
        concerns: string;
    };
    createdAt: string;
}

export default function ReportsView() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAllReports = useCallback(async (silent = false) => {
        if (!silent) {
            setLoading(true);
        }
        setError('');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patient/admin/reports`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok || data.error) {
                setError(data.message || 'Failed to fetch reports');
            } else if (Array.isArray(data)) {
                setReports(data);
            } else {
                setReports([]);
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
        fetchAllReports();
        const intervalId = window.setInterval(() => {
            fetchAllReports(true);
        }, 10000);
        return () => window.clearInterval(intervalId);
    }, [fetchAllReports]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Reports Generated</h3>
                    <p className="text-slate-500 text-sm">View all saved medical reports and AI summaries across patients.</p>
                </div>
                <div className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600">
                    Total: {reports.length}
                </div>
            </div>

            {loading && (
                <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
                    Loading reports...
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
                    {error}
                </div>
            )}

            {!loading && !error && reports.length === 0 && (
                <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
                    No reports found.
                </div>
            )}

            {!loading && !error && reports.length > 0 && (
                <div className="space-y-6">
                    {reports.map((report) => (
                        <div key={report._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                        <FaFilePdf className="text-2xl" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{report.fileName}</h4>
                                        <span className="text-xs text-slate-400">
                                            Saved on {new Date(report.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-xs px-3 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium">
                                    ID: {report._id.slice(-6)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">General Summary</span>
                                    <p className="text-sm text-slate-700">{report.aiSummary?.summary || 'N/A'}</p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Key Findings</span>
                                    <p className="text-sm text-slate-700">{report.aiSummary?.keyFindings || 'N/A'}</p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Possible Concerns</span>
                                    <p className="text-sm text-slate-700">{report.aiSummary?.concerns || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}