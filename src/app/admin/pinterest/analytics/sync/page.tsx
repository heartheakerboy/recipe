import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { pinterestAnalyticsSyncService } from '@/lib/pinterest/pinterest-analytics-sync.service';
import { RefreshCw, CheckCircle2, AlertTriangle, ArrowLeft, Clock } from 'lucide-react';

export const metadata = {
  title: 'Pinterest Analytics Sync Status | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function PinterestSyncStatusPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const syncLog = await pinterestAnalyticsSyncService.getSyncStatus();

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-28 font-sans">
      <div className="flex items-center gap-3 border-b border-editorial-border pb-6">
        <Link
          href="/admin/pinterest/analytics"
          className="p-2 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
            Background Data Ingestion
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
            Pinterest Analytics Sync Status
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-editorial-border pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-editorial-muted" />
            <h3 className="font-serif text-base font-bold text-editorial-text">
              Daily API Sync Coordinator
            </h3>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
              syncLog.status === 'success'
                ? 'bg-emerald-100 text-emerald-800'
                : syncLog.status === 'syncing'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {syncLog.status === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            <span className="capitalize">{syncLog.status}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-editorial-surface border border-editorial-border space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
              Last Successful Sync
            </span>
            <div className="font-mono text-xs font-bold text-editorial-text">
              {new Date(syncLog.lastSyncedAt).toLocaleString()}
            </div>
            <div className="text-[10px] text-editorial-lightMuted">
              {syncLog.recordsUpdated} pin metrics ingested
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-editorial-surface border border-editorial-border space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
              Next Scheduled Sync
            </span>
            <div className="font-mono text-xs font-bold text-editorial-text">
              {new Date(syncLog.nextSyncAt).toLocaleString()}
            </div>
            <div className="text-[10px] text-editorial-lightMuted">
              Automatic daily ingestion
            </div>
          </div>
        </div>

        {syncLog.errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium">
            Error: {syncLog.errorMessage}
          </div>
        )}

        <div className="pt-2 text-xs text-editorial-muted leading-relaxed">
          Analytics are synchronized daily in the background to prevent rate limits and ensure admin dashboard pages load instantly without blocking on external API calls.
        </div>
      </div>
    </div>
  );
}
