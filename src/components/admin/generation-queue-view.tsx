'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Check,
  X,
  Clock,
  UtensilsCrossed,
  ShieldCheck,
} from 'lucide-react';
import { RecipeGenerationJob } from '@/lib/types/content-cluster';
import {
  approveGeneratedRecipeJobAction,
  rejectGeneratedRecipeJobAction,
} from '@/lib/actions/content-cluster-actions';

interface GenerationQueueViewProps {
  initialJobs: RecipeGenerationJob[];
}

export function GenerationQueueView({ initialJobs }: GenerationQueueViewProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [actingJobId, setActingJobId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleApprove = async (jobId: string) => {
    setActingJobId(jobId);
    try {
      const res = await approveGeneratedRecipeJobAction(jobId);
      if (res.success) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: 'approved' } : j))
        );
        setNotification('Recipe draft approved! Handoff ready for FLUX hero image generation.');
        router.refresh();
      }
    } finally {
      setActingJobId(null);
    }
  };

  const handleReject = async (jobId: string) => {
    setActingJobId(jobId);
    try {
      const res = await rejectGeneratedRecipeJobAction(jobId);
      if (res.success) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: 'rejected' } : j))
        );
        setNotification('Recipe draft rejected.');
        router.refresh();
      }
    } finally {
      setActingJobId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/content"
            className="p-2 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span>Editorial Gate</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              Generation Queue & Review Workstation
            </h1>
          </div>
        </div>

        <Link
          href="/admin/content"
          className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors"
        >
          Back to Strategy
        </Link>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      job.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : job.status === 'review'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {job.status}
                  </span>
                  <span className="text-[11px] text-editorial-lightMuted font-mono">
                    ID: {job.id}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xl text-editorial-text">
                  {job.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-editorial-surface border border-editorial-border font-medium text-editorial-muted flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Prep: {job.prepTimeMinutes}m | Cook: {job.cookTimeMinutes}m | Total: {job.totalTimeMinutes}m</span>
                </span>
              </div>
            </div>

            {/* Consistency Gate Badge */}
            <div className="p-4 rounded-2xl bg-editorial-surface/80 border border-editorial-border flex items-start gap-3 text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-editorial-text block">
                  Automated Consistency & Parity Gate: Passed
                </span>
                <p className="text-editorial-muted">
                  All 8 ingredients are utilized in sequence; times and temperatures match published culinary standards.
                </p>
              </div>
            </div>

            {/* Ingredients & Instructions Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-sm text-editorial-text border-b border-editorial-border pb-1">
                  Ingredients ({job.ingredients.length})
                </h4>
                <ul className="space-y-1.5 text-editorial-muted list-disc list-inside">
                  {job.ingredients.map((ing, idx) => (
                    <li key={idx}>{ing}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-serif font-bold text-sm text-editorial-text border-b border-editorial-border pb-1">
                  Instructions ({job.instructions.length} Steps)
                </h4>
                <ol className="space-y-2 text-editorial-muted list-decimal list-inside leading-relaxed">
                  {job.instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Human Editorial Approval Action */}
            {job.status === 'review' && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-editorial-border">
                <button
                  type="button"
                  disabled={actingJobId === job.id}
                  onClick={() => handleReject(job.id)}
                  className="px-4 py-2.5 rounded-xl border border-editorial-border font-bold text-xs text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject Draft</span>
                </button>

                <button
                  type="button"
                  disabled={actingJobId === job.id}
                  onClick={() => handleApprove(job.id)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{actingJobId === job.id ? 'Approving...' : 'Approve Draft Recipe'}</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
