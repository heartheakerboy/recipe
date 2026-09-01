'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  RefreshCw,
  Search,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SystemComponentHealth } from '@/lib/types/system-health';
import { getSystemHealthAction } from '@/lib/actions/system-health-actions';

interface SystemHealthDashboardProps {
  initialComponents: SystemComponentHealth[];
}

export function SystemHealthDashboard({ initialComponents }: SystemHealthDashboardProps) {
  const [components, setComponents] = useState(initialComponents);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await getSystemHealthAction();
      setComponents(res.components);
    } finally {
      setIsRefreshing(false);
    }
  };

  const allHealthy = components.every((c) => c.status === 'healthy');

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <Activity className="w-4 h-4" />
              <span>Production Architecture</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 font-semibold text-emerald-800">
              {allHealthy ? 'All Systems Operational' : 'Degraded Services Detected'}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
            System Health & Infrastructure Monitor
          </h1>
          <p className="text-xs text-editorial-muted">
            Live latency probes, database health, R2 storage availability, and background job engine diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isRefreshing}
            onClick={handleRefresh}
            className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Checking...' : 'Run Live Diagnostic'}</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/system/performance"
          className="group p-5 rounded-3xl bg-white border border-editorial-border hover:border-editorial-borderStrong shadow-xs hover:shadow-card transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-serif font-bold text-base text-editorial-text group-hover:text-emerald-600 transition-colors block">
              Core Web Vitals
            </span>
            <span className="text-xs text-editorial-muted">
              LCP, CLS, TTFB, and performance budget checks
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-editorial-lightMuted group-hover:text-emerald-600 transition-colors" />
        </Link>

        <Link
          href="/admin/system/seo-health"
          className="group p-5 rounded-3xl bg-white border border-editorial-border hover:border-editorial-borderStrong shadow-xs hover:shadow-card transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-serif font-bold text-base text-editorial-text group-hover:text-emerald-600 transition-colors block">
              Technical SEO Audit
            </span>
            <span className="text-xs text-editorial-muted">
              Canonical checks, orphan recipes, and broken links
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-editorial-lightMuted group-hover:text-emerald-600 transition-colors" />
        </Link>

        <Link
          href="/admin/system/jobs"
          className="group p-5 rounded-3xl bg-white border border-editorial-border hover:border-editorial-borderStrong shadow-xs hover:shadow-card transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-serif font-bold text-base text-editorial-text group-hover:text-emerald-600 transition-colors block">
              Background Jobs
            </span>
            <span className="text-xs text-editorial-muted">
              Idempotent queues, retries, and task states
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-editorial-lightMuted group-hover:text-emerald-600 transition-colors" />
        </Link>
      </div>

      {/* Component Health Grid */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-editorial-text">
              Connected Infrastructure Components
            </h3>
            <p className="text-xs text-editorial-muted">
              Deterministic real-time checks across primary application dependencies.
            </p>
          </div>
          <span className="text-xs text-editorial-muted font-medium">
            {components.length} components monitored
          </span>
        </div>

        <div className="divide-y divide-editorial-border">
          {components.map((comp) => (
            <div
              key={comp.component}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      comp.status === 'healthy'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {comp.status}
                  </span>
                  <span className="font-serif font-bold text-sm text-editorial-text">
                    {comp.component}
                  </span>
                </div>
                <p className="text-xs text-editorial-muted leading-relaxed">
                  {comp.details}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
                  Response Latency
                </span>
                <span className="font-mono font-bold text-sm text-emerald-600">
                  {comp.latencyMs}ms
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
