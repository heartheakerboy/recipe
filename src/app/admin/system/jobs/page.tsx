import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getBackgroundJobsAction } from '@/lib/actions/system-health-actions';
import { ArrowLeft, Layers, CheckCircle2, RotateCcw, Clock } from 'lucide-react';

export const metadata = {
  title: 'Background Jobs & Queues | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function BackgroundJobsPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const { jobs } = await getBackgroundJobsAction();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/system/health"
            className="p-2 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <Layers className="w-4 h-4" />
              <span>Idempotent Task Queue</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              Background Jobs & Reliability
            </h1>
          </div>
        </div>

        <Link
          href="/admin/system/health"
          className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors"
        >
          Back to System Health
        </Link>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-editorial-text">
              Scheduled & Async Background Jobs
            </h3>
            <p className="text-xs text-editorial-muted">
              All tasks execute with strict idempotency keys to prevent duplicate Pins, emails, or analytics records.
            </p>
          </div>
          <span className="text-xs text-editorial-muted font-medium">
            {jobs.length} jobs registered
          </span>
        </div>

        <div className="divide-y divide-editorial-border">
          {jobs.map((job) => (
            <div key={job.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      job.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : job.status === 'running'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    {job.status}
                  </span>
                  <span className="font-serif font-bold text-sm text-editorial-text">
                    {job.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-editorial-lightMuted font-mono">
                  <span>Key: {job.idempotencyKey}</span>
                  <span>•</span>
                  <span>Attempts: {job.attempts} / {job.maxAttempts}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-editorial-muted flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updated: {new Date(job.updatedAt).toLocaleTimeString()}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
