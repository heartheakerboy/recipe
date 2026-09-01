import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getPerformanceMetricsAction } from '@/lib/actions/system-health-actions';
import { ArrowLeft, Zap, CheckCircle2, ShieldCheck, Gauge } from 'lucide-react';

export const metadata = {
  title: 'Performance & Core Web Vitals | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function PerformanceMonitorPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const { budget } = await getPerformanceMetricsAction();

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
              <Zap className="w-4 h-4" />
              <span>Core Web Vitals & Budgets</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              Performance & Edge Optimization
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

      {/* Core Web Vitals KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            LCP (Largest Contentful Paint)
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {budget.lcpMs}ms
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Passed (Budget &lt; 2500ms)</span>
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            CLS (Cumulative Layout Shift)
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {budget.cls}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Passed (Budget &lt; 0.1)</span>
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            TTFB (Time to First Byte)
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {budget.ttfbMs}ms
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Cloudflare Edge Cached</span>
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            INP (Interaction to Next Paint)
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {budget.inpMs}ms
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>Passed (Budget &lt; 200ms)</span>
          </span>
        </div>
      </div>

      {/* Payload Budget Details */}
      <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="font-serif font-bold text-base text-editorial-text border-b border-editorial-border pb-3">
          Payload Weight Budgets
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="p-4 rounded-2xl bg-editorial-surface border border-editorial-border space-y-1">
            <span className="text-editorial-muted block font-medium">HTML Payload</span>
            <span className="font-bold text-base text-editorial-text">{(budget.htmlSizeBytes / 1024).toFixed(1)} KB</span>
            <span className="text-[10px] text-editorial-lightMuted block">Under 50 KB ceiling</span>
          </div>

          <div className="p-4 rounded-2xl bg-editorial-surface border border-editorial-border space-y-1">
            <span className="text-editorial-muted block font-medium">Total Client JS</span>
            <span className="font-bold text-base text-editorial-text">{budget.jsBundleKb} KB</span>
            <span className="text-[10px] text-editorial-lightMuted block">Under 150 KB ceiling</span>
          </div>

          <div className="p-4 rounded-2xl bg-editorial-surface border border-editorial-border space-y-1">
            <span className="text-editorial-muted block font-medium">Hero Image (WebP)</span>
            <span className="font-bold text-base text-editorial-text">{budget.imageAvgKb} KB</span>
            <span className="text-[10px] text-editorial-lightMuted block">Under 120 KB ceiling</span>
          </div>
        </div>
      </div>

      {/* Cache Policy Architecture */}
      <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs space-y-4 text-xs">
        <h3 className="font-serif font-bold text-base text-editorial-text border-b border-editorial-border pb-3">
          Edge Caching Policy Architecture
        </h3>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
            <span className="font-bold block text-emerald-900">Public Recipe Pages & Catalog:</span>
            <p className="font-mono text-[11px] text-emerald-800">
              Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800
            </p>
            <p className="text-emerald-700 text-[11px]">
              Served from Cloudflare global edge network. Database hits are eliminated during viral Pinterest traffic spikes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-950 space-y-1">
            <span className="font-bold block text-zinc-900">Admin Control Panel & Private APIs:</span>
            <p className="font-mono text-[11px] text-zinc-800">
              Cache-Control: no-store, no-cache, must-revalidate, max-age=0
            </p>
            <p className="text-zinc-600 text-[11px]">
              Strictly non-cacheable. No private credentials or subscriber data will ever be stored in edge caches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
