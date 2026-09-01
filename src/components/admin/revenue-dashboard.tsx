'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  PieChart,
  Sliders,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import {
  RevenueDateRange,
  DailyRevenueRecord,
  MonetizationSettings,
} from '@/lib/types/revenue';
import { RevenueSummary } from '@/lib/monetization/revenue-intelligence.service';
import {
  getRevenueDashboardAction,
  exportRevenueCsvAction,
} from '@/lib/actions/monetization-actions';

interface RevenueDashboardProps {
  initialData: {
    dateRange: RevenueDateRange;
    summary: RevenueSummary;
    records: DailyRevenueRecord[];
    settings: MonetizationSettings;
  };
}

export function RevenueDashboard({ initialData }: RevenueDashboardProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [selectedRange, setSelectedRange] = useState<RevenueDateRange>(initialData.dateRange);
  const [isLoadingRange, setIsLoadingRange] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleRangeChange = async (range: RevenueDateRange) => {
    setSelectedRange(range);
    setIsLoadingRange(true);
    try {
      const res = await getRevenueDashboardAction(range);
      setData(res as any);
    } finally {
      setIsLoadingRange(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const res = await exportRevenueCsvAction();
      if (res.success && res.csvContent) {
        const blob = new Blob([res.csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', res.filename || 'flavornest-revenue.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>Revenue Intelligence</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-editorial-surface border border-editorial-border font-semibold text-editorial-muted">
              Source: {data.settings.activeProvider === 'adsense' ? 'Google AdSense' : 'Monetization Engine'}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
            FlavorNest Revenue & Ad Intelligence Hub
          </h1>
          <p className="text-xs text-editorial-muted">
            Track daily ad earnings, pageview economics, fill rates, and recipe-level profitability.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/revenue/recipes"
            className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors flex items-center gap-1.5"
          >
            <PieChart className="w-3.5 h-3.5 text-editorial-muted" />
            <span>Recipe Economics</span>
          </Link>

          <Link
            href="/admin/monetization"
            className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-editorial-muted" />
            <span>Ad Settings</span>
          </Link>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-editorial-border shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-editorial-muted" />
          <span className="font-bold text-editorial-text">Period Filter:</span>
        </div>

        <div className="flex items-center gap-1.5">
          {(['7d', '30d', '90d', 'all'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRangeChange(r)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedRange === r
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-editorial-surface hover:bg-editorial-surfaceAlt text-editorial-muted'
              }`}
            >
              {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : r === '90d' ? 'Last 90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Top KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Estimated Earnings
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            ${data.summary.totalRevenue.toFixed(2)}
          </div>
          {data.summary.previousPeriodDiff ? (
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+{data.summary.previousPeriodDiff.revenuePct}% vs prev</span>
            </span>
          ) : (
            <span className="text-[11px] text-editorial-lightMuted">Authentic live data</span>
          )}
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
            Pageviews
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {data.summary.totalPageviews.toLocaleString()}
          </div>
          {data.summary.previousPeriodDiff ? (
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+{data.summary.previousPeriodDiff.pageviewsPct}% vs prev</span>
            </span>
          ) : (
            <span className="text-[11px] text-editorial-lightMuted">Authentic live data</span>
          )}
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
            Page RPM
          </span>
          <div className="font-serif text-3xl font-bold text-brand-950">
            ${data.summary.overallRpm.toFixed(2)}
          </div>
          <span className="text-[11px] text-brand-600 font-medium">Revenue per 1k views</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
            Ad Impressions
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {data.summary.totalImpressions.toLocaleString()}
          </div>
          <span className="text-[11px] text-editorial-lightMuted">Served in slots</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
            Fill Rate
          </span>
          <div className="font-serif text-3xl font-bold text-purple-950">
            {(data.summary.averageFillRate * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-purple-600 font-medium">Ads matched</span>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/revenue/recipes"
          className="group p-6 rounded-3xl bg-white border border-editorial-border hover:border-editorial-borderStrong shadow-xs hover:shadow-card transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-serif font-bold text-lg text-editorial-text group-hover:text-brand-600 transition-colors block">
              Recipe Economics & Profitability
            </span>
            <span className="text-xs text-editorial-muted">
              Inspect revenue generated vs AI/FLUX generation costs per dish
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-editorial-lightMuted group-hover:text-brand-600 transition-colors" />
        </Link>

        <Link
          href="/admin/monetization"
          className="group p-6 rounded-3xl bg-white border border-editorial-border hover:border-editorial-borderStrong shadow-xs hover:shadow-card transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-serif font-bold text-lg text-editorial-text group-hover:text-brand-600 transition-colors block">
              Ad Placement & Provider Controls
            </span>
            <span className="text-xs text-editorial-muted">
              Configure active ad slots, publisher client ID, and unit cost assumptions
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-editorial-lightMuted group-hover:text-brand-600 transition-colors" />
        </Link>
      </div>

      {/* Daily Revenue Log Table */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-editorial-text">
              Daily Revenue & Ingestion History
            </h3>
            <p className="text-xs text-editorial-muted">
              Authentic provider earnings and impressions logged server-side.
            </p>
          </div>
          <span className="text-xs text-editorial-muted font-medium">
            {data.records.length} days recorded
          </span>
        </div>

        <div className="divide-y divide-editorial-border">
          {data.records.length === 0 ? (
            <div className="p-12 text-center text-xs text-editorial-muted space-y-1">
              <span className="font-semibold text-editorial-text block text-sm">
                No revenue records logged yet
              </span>
              <p>
                Authentic earnings and impression data will appear automatically once Google AdSense or another ad network is connected and logs server-side impressions.
              </p>
            </div>
          ) : (
            data.records.map((r) => {
              const rpm = r.pageviews > 0 ? (r.estimatedEarnings / r.pageviews) * 1000 : 0;
              return (
                <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-editorial-text text-sm">
                        {r.date}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-editorial-surface border border-editorial-border font-semibold text-[10px] text-editorial-muted">
                        {r.provider}
                      </span>
                    </div>
                    <span className="text-[11px] text-editorial-lightMuted">
                      {r.pageviews.toLocaleString()} pageviews • {r.impressions.toLocaleString()} ad impressions
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-6 text-right shrink-0">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
                        Revenue
                      </span>
                      <span className="font-bold text-sm text-emerald-600">
                        ${r.estimatedEarnings.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
                        Page RPM
                      </span>
                      <span className="font-bold text-sm text-editorial-text">
                        ${rpm.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
                        Fill Rate
                      </span>
                      <span className="font-bold text-sm text-purple-700">
                        {(r.fillRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
