'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Rocket,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Search,
  Flame,
  ImageIcon,
  DollarSign,
  Users,
  Lock,
  Server,
  FileCheck,
} from 'lucide-react';
import { MasterLaunchAudit, CategoryAuditResult, AuditIssue } from '@/lib/types/launch-audit';
import { runFullLaunchAuditAction } from '@/lib/actions/launch-audit-actions';

interface LaunchAuditDashboardProps {
  initialAudit: MasterLaunchAudit;
}

export function LaunchAuditDashboard({ initialAudit }: LaunchAuditDashboardProps) {
  const [audit, setAudit] = useState(initialAudit);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunAudit = async () => {
    setIsRunning(true);
    try {
      const res = await runFullLaunchAuditAction();
      setAudit(res.audit);
    } finally {
      setIsRunning(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content':
        return <FileCheck className="w-4 h-4 text-brand-600" />;
      case 'seo':
        return <Search className="w-4 h-4 text-emerald-600" />;
      case 'pinterest':
        return <Flame className="w-4 h-4 text-rose-600" />;
      case 'images':
        return <ImageIcon className="w-4 h-4 text-purple-600" />;
      case 'performance':
        return <Zap className="w-4 h-4 text-amber-600" />;
      case 'monetization':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'analytics':
        return <Users className="w-4 h-4 text-sky-600" />;
      case 'security':
        return <Lock className="w-4 h-4 text-zinc-700" />;
      default:
        return <Server className="w-4 h-4 text-zinc-600" />;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <Rocket className="w-4 h-4" />
              <span>Launch Readiness Verification</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-editorial-surface border border-editorial-border font-semibold text-editorial-muted">
              Pre-Growth Quality Audit
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
            Master Launch Readiness Hub
          </h1>
          <p className="text-xs text-editorial-muted">
            Holistic audit across Content, Technical SEO, Pinterest, Images, Performance, Monetization, Analytics, and Security.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/launch/checklist"
            className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-editorial-muted" />
            <span>Launch Checklist</span>
          </Link>

          <button
            type="button"
            disabled={isRunning}
            onClick={handleRunAudit}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Auditing All Systems...' : 'Run Full Audit'}</span>
          </button>
        </div>
      </div>

      {/* Launch Status Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${
          audit.status === 'READY FOR GROWTH'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : audit.status === 'READY WITH WARNINGS'
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : 'bg-rose-50 border-rose-200 text-rose-950'
        }`}
      >
        <div className="space-y-1 max-w-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
            Launch Verification Status
          </span>
          <div className="font-serif text-3xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            <span>{audit.status}</span>
          </div>
          <p className="text-xs leading-relaxed opacity-90">
            {audit.criticalCount === 0
              ? 'Zero critical blockers detected. All technical systems, SEO protocols, and Pinterest assets meet strict production quality criteria.'
              : `${audit.criticalCount} critical blocker(s) must be resolved before initiating aggressive traffic campaigns.`}
          </p>
        </div>

        <div className="flex items-center gap-4 text-right shrink-0">
          <div className="p-3.5 rounded-2xl bg-white/80 border border-editorial-border space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
              Blockers
            </span>
            <span className="font-serif font-bold text-xl text-rose-600">
              {audit.criticalCount}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 border border-editorial-border space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
              Medium / Low
            </span>
            <span className="font-serif font-bold text-xl text-editorial-text">
              {audit.mediumCount + audit.lowCount}
            </span>
          </div>
        </div>
      </div>

      {/* 9 Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {audit.categories.map((cat) => (
          <div
            key={cat.category}
            className="bg-white rounded-3xl border border-editorial-border p-6 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {getCategoryIcon(cat.category)}
                  <span className="font-bold text-xs uppercase tracking-wider text-editorial-text">
                    {cat.category}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    cat.status === 'ready'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {cat.status}
                </span>
              </div>

              <p className="text-xs text-editorial-muted leading-relaxed">
                {cat.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-editorial-border flex items-center justify-between text-[11px] text-editorial-lightMuted">
              <span>Issues: {cat.issuesCount.critical + cat.issuesCount.high + cat.issuesCount.medium}</span>
              <span className="font-semibold text-emerald-700">Verified</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
