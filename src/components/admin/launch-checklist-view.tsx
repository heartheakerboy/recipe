'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Rocket,
  Check,
  Sparkles,
} from 'lucide-react';
import { LaunchChecklistItem } from '@/lib/types/launch-audit';
import { toggleLaunchChecklistItemAction } from '@/lib/actions/launch-audit-actions';

interface LaunchChecklistViewProps {
  initialChecklist: LaunchChecklistItem[];
}

export function LaunchChecklistView({ initialChecklist }: LaunchChecklistViewProps) {
  const router = useRouter();
  const [checklist, setChecklist] = useState(initialChecklist);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (item: LaunchChecklistItem) => {
    if (item.isAutomated) return;

    const newStatus = !item.isVerified;
    setTogglingId(item.id);

    try {
      const res = await toggleLaunchChecklistItemAction(item.id, newStatus);
      if (res.success) {
        setChecklist((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isVerified: newStatus } : i))
        );
        router.refresh();
      }
    } finally {
      setTogglingId(null);
    }
  };

  const verifiedCount = checklist.filter((i) => i.isVerified).length;
  const totalCount = checklist.length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/launch"
            className="p-2 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Pre-Launch Verification</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              Final Launch Checklist
            </h1>
          </div>
        </div>

        <Link
          href="/admin/launch"
          className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors"
        >
          Back to Launch Hub
        </Link>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-white rounded-3xl border border-editorial-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
            Verification Progress
          </span>
          <div className="font-serif font-bold text-2xl text-emerald-700">
            {verifiedCount} of {totalCount} Items Verified ({Math.round((verifiedCount / totalCount) * 100)}%)
          </div>
        </div>

        <div className="w-full sm:w-48 bg-editorial-surface rounded-full h-3 overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all"
            style={{ width: `${(verifiedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Checklist Table */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border">
          <h3 className="font-serif text-base font-bold text-editorial-text">
            Mandatory Production Gate Items
          </h3>
          <p className="text-xs text-editorial-muted">
            All automated systems and operational verifications required prior to scaling audience acquisition.
          </p>
        </div>

        <div className="divide-y divide-editorial-border">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="p-5 flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    item.isVerified
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-editorial-surface text-editorial-muted border border-editorial-border'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-medium text-editorial-text block">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-editorial-lightMuted uppercase">
                    Category: {item.category} • {item.isAutomated ? 'Automated Check' : 'Manual Signoff'}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                {item.isAutomated ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase">
                    Passed
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={togglingId === item.id}
                    onClick={() => handleToggle(item)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      item.isVerified
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-editorial-surface hover:bg-editorial-surfaceAlt text-editorial-muted border border-editorial-border'
                    }`}
                  >
                    {item.isVerified ? 'Verified' : 'Mark Verified'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
