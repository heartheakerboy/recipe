'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  ArrowLeft,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { exportDataRoomCsvAction } from '@/lib/actions/business-intelligence-actions';

export function DataRoomView() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (type: 'financials' | 'traffic' | 'integrations') => {
    setDownloading(type);
    try {
      const res = await exportDataRoomCsvAction(type);
      if (res.success && res.csvContent) {
        const blob = new Blob([res.csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', res.filename || `flavornest-${type}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/flip"
            className="p-2 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <Lock className="w-4 h-4" />
              <span>Internal Due Diligence Data Room</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              Due Diligence Export Suite
            </h1>
          </div>
        </div>

        <Link
          href="/admin/flip"
          className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors"
        >
          Back to Checklist
        </Link>
      </div>

      {/* Security Assurance Banner */}
      <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
        <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Credential & Privacy Protection Guarantee</span>
        </div>
        <p className="leading-relaxed text-emerald-800">
          All CSV exports generated here are fully sanitized. Personal subscriber emails, API keys, OAuth tokens, and database credentials are automatically stripped and excluded.
        </p>
      </div>

      {/* Export Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module 1: Financials */}
        <div className="bg-white rounded-3xl border border-editorial-border p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-editorial-text">
              Monthly P&L Ledger
            </h3>
            <p className="text-xs text-editorial-muted leading-relaxed">
              Historical monthly gross ad revenue, verified serverless compute costs, and net contribution margins.
            </p>
          </div>

          <button
            type="button"
            disabled={downloading === 'financials'}
            onClick={() => handleDownload('financials')}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading === 'financials' ? 'Generating...' : 'Export Financials CSV'}</span>
          </button>
        </div>

        {/* Module 2: Traffic */}
        <div className="bg-white rounded-3xl border border-editorial-border p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-editorial-text">
              Traffic & Channel Sources
            </h3>
            <p className="text-xs text-editorial-muted leading-relaxed">
              Monthly session volume, audience share %, attributed revenue, and page RPM by acquisition channel.
            </p>
          </div>

          <button
            type="button"
            disabled={downloading === 'traffic'}
            onClick={() => handleDownload('traffic')}
            className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading === 'traffic' ? 'Generating...' : 'Export Traffic CSV'}</span>
          </button>
        </div>

        {/* Module 3: Integrations */}
        <div className="bg-white rounded-3xl border border-editorial-border p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-editorial-text">
              Third-Party Services Registry
            </h3>
            <p className="text-xs text-editorial-muted leading-relaxed">
              Complete inventory of connected platforms, purpose, connection status, and transfer procedures.
            </p>
          </div>

          <button
            type="button"
            disabled={downloading === 'integrations'}
            onClick={() => handleDownload('integrations')}
            className="w-full py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-editorial-muted" />
            <span>{downloading === 'integrations' ? 'Generating...' : 'Export Registry CSV'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
