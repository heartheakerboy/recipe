'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Server,
  Layers,
  Lock,
} from 'lucide-react';
import {
  FlipReadinessItem,
  ThirdPartyIntegration,
} from '@/lib/types/business-intelligence';
import { toggleChecklistItemAction } from '@/lib/actions/business-intelligence-actions';

interface FlipReadinessViewProps {
  initialData: {
    checklist: FlipReadinessItem[];
    integrations: ThirdPartyIntegration[];
    score: { total: number; verified: number; percentage: number };
  };
}

export function FlipReadinessView({ initialData }: FlipReadinessViewProps) {
  const router = useRouter();
  const [checklist, setChecklist] = useState(initialData.checklist);
  const [integrations] = useState(initialData.integrations);
  const [score, setScore] = useState(initialData.score);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (item: FlipReadinessItem) => {
    if (item.isAutomated) return; // Automated items cannot be arbitrarily toggled

    const newStatus = item.status === 'verified' ? false : true;
    setTogglingId(item.id);

    try {
      const res = await toggleChecklistItemAction(item.id, newStatus);
      if (res.success) {
        setChecklist((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: newStatus ? 'verified' : 'pending' } : i
          )
        );
        setScore((s) => {
          const verified = newStatus ? s.verified + 1 : s.verified - 1;
          return {
            ...s,
            verified,
            percentage: Math.round((verified / s.total) * 100),
          };
        });
        router.refresh();
      }
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/business"
            className="p-2 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Due Diligence Readiness</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              Flip Readiness & Transferability Hub
            </h1>
          </div>
        </div>

        <Link
          href="/admin/flip/data-room"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Due Diligence Data Room</span>
        </Link>
      </div>

      {/* Readiness Completion Score Card */}
      <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
            Operational Verification Score
          </span>
          <div className="font-serif text-3xl font-bold text-emerald-700">
            {score.percentage}% Operational Readiness
          </div>
          <p className="text-xs text-editorial-muted leading-relaxed">
            {score.verified} of {score.total} due-diligence criteria are formally verified. This reflects operational transferability, not a speculative valuation.
          </p>
        </div>

        <div className="w-full sm:w-48 space-y-2 text-right">
          <div className="w-full bg-editorial-surface rounded-full h-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${score.percentage}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-editorial-lightMuted block">
            {score.verified} / {score.total} items verified
          </span>
        </div>
      </div>

      {/* Due Diligence Checklist */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-editorial-text">
              Operational Due Diligence Checklist
            </h3>
            <p className="text-xs text-editorial-muted">
              Technical, financial, and operational items required for seamless ownership transfer.
            </p>
          </div>
        </div>

        <div className="divide-y divide-editorial-border">
          {checklist.map((item) => {
            const isVerified = item.status === 'verified';
            return (
              <div
                key={item.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-editorial-surface border border-editorial-border text-[10px] font-bold uppercase text-editorial-muted">
                      {item.category}
                    </span>
                    <span className="font-serif font-bold text-sm text-editorial-text">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-editorial-muted leading-relaxed">
                    {item.description}
                  </p>
                  <span className="text-[10px] text-editorial-lightMuted block">
                    Source: {item.verificationSource}
                  </span>
                </div>

                <div className="shrink-0">
                  {item.isAutomated ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Auto Verified</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={togglingId === item.id}
                      onClick={() => handleToggle(item)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                        isVerified
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-editorial-surface hover:bg-editorial-surfaceAlt text-editorial-muted border border-editorial-border'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isVerified ? 'Verified' : 'Mark Verified'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Third-Party Service Registry & Transferability */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border">
          <h3 className="font-serif text-base font-bold text-editorial-text">
            Third-Party Service Registry & Transferability
          </h3>
          <p className="text-xs text-editorial-muted">
            All external service dependencies and how they transfer to an incoming owner.
          </p>
        </div>

        <div className="divide-y divide-editorial-border">
          {integrations.map((svc) => (
            <div key={svc.service} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-serif font-bold text-sm text-editorial-text block">
                  {svc.service}
                </span>
                <span className="text-xs text-editorial-muted">{svc.purpose}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                  {svc.status}
                </span>

                <span className="px-2.5 py-1 rounded-full bg-editorial-surface border border-editorial-border text-[10px] font-semibold text-editorial-muted capitalize">
                  {svc.transferability.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
