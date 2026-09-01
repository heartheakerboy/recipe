'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  TrendingUp,
  Download,
  RefreshCw,
  ExternalLink,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  PinterestDateRange,
  PinterestAnalyticsSummary,
  TopPinPerformance,
  TemplatePerformance,
  AnglePerformance,
  BoardPerformance,
  PinterestInsight,
  PinterestSyncLog,
} from '@/lib/types/pinterest-analytics';
import {
  getPinterestAnalyticsDashboardAction,
  exportPinterestAnalyticsCsvAction,
  triggerPinterestAnalyticsSyncAction,
} from '@/lib/actions/pinterest-analytics-actions';

interface PinterestAnalyticsDashboardProps {
  initialData: {
    dateRange: PinterestDateRange;
    summary: PinterestAnalyticsSummary;
    topPins: TopPinPerformance[];
    templates: TemplatePerformance[];
    angles: AnglePerformance[];
    boards: BoardPerformance[];
    insights: PinterestInsight[];
    syncLog: PinterestSyncLog;
  };
}

export function PinterestAnalyticsDashboard({ initialData }: PinterestAnalyticsDashboardProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [selectedRange, setSelectedRange] = useState<PinterestDateRange>(initialData.dateRange);
  const [isLoadingRange, setIsLoadingRange] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleRangeChange = async (range: PinterestDateRange) => {
    setSelectedRange(range);
    setIsLoadingRange(true);
    try {
      const res = await getPinterestAnalyticsDashboardAction(range);
      setData(res as any);
    } finally {
      setIsLoadingRange(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const res = await exportPinterestAnalyticsCsvAction();
      if (res.success && res.csvContent) {
        const blob = new Blob([res.csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', res.filename || 'flavornest-pinterest-metrics.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await triggerPinterestAnalyticsSyncAction();
      if (res.success) {
        setNotification(`Analytics synchronized successfully! Updated ${res.recordsUpdated} records.`);
        router.refresh();
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
              <Flame className="w-4 h-4" />
              <span>Pinterest Growth Intelligence</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-editorial-surface border border-editorial-border font-semibold text-editorial-muted">
              Source: Pinterest API v5 & Derived
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
            Pinterest Performance & Analytics Hub
          </h1>
          <p className="text-xs text-editorial-muted">
            Track outbound click traffic, creative template efficacy, and content angle conversions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/pinterest/analytics/sync"
            className="px-3.5 py-2 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-editorial-muted" />
            <span>Sync Status</span>
          </Link>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-editorial-muted" />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Date Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-editorial-border shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-editorial-muted" />
          <span className="font-bold text-editorial-text">Reporting Period:</span>
        </div>

        <div className="flex items-center gap-1.5">
          {(['7d', '30d', '90d', 'all'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRangeChange(r)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedRange === r
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-editorial-surface hover:bg-editorial-surfaceAlt text-editorial-muted'
              }`}
            >
              {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : r === '90d' ? 'Last 90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
            Outbound Clicks
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {data.summary.outboundClicks.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+22.8% vs prev</span>
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
            Total Impressions
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {data.summary.impressions.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% vs prev</span>
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
            Recipe Saves
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {data.summary.saves.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+18.5% vs prev</span>
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
            Outbound CTR
          </span>
          <div className="font-serif text-3xl font-bold text-brand-950">
            {(data.summary.outboundCtr * 100).toFixed(2)}%
          </div>
          <span className="text-[11px] text-brand-600 font-medium">Clicks / Impressions</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
            Save Rate
          </span>
          <div className="font-serif text-3xl font-bold text-purple-950">
            {(data.summary.saveRate * 100).toFixed(2)}%
          </div>
          <span className="text-[11px] text-purple-600 font-medium">Saves / Impressions</span>
        </div>
      </div>

      {/* Intelligence Insights Cards */}
      {data.insights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <h3 className="font-serif text-base font-bold text-editorial-text">
              Growth Patterns & Insights
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.insights.map((insight) => (
              <div
                key={insight.id}
                className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-2 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 text-[10px] font-bold uppercase">
                    {insight.metricBadge}
                  </span>
                  <span className="text-[10px] font-bold text-editorial-lightMuted">
                    Sample: {insight.sampleSize} Pins
                  </span>
                </div>

                <h4 className="font-serif font-bold text-base text-editorial-text">
                  {insight.title}
                </h4>

                <p className="text-xs text-editorial-muted leading-relaxed">
                  {insight.description}
                </p>

                <div className="pt-2 text-[11px] font-semibold text-brand-700 border-t border-editorial-border">
                  Recommendation: {insight.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Performing Pins */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-editorial-text">
              Top Performing Pins by Outbound Clicks
            </h3>
            <p className="text-xs text-editorial-muted">
              Published creatives sending the highest direct traffic to FlavorNest recipe pages.
            </p>
          </div>
          <Link
            href="/admin/pinterest/queue"
            className="text-xs font-bold text-rose-600 hover:underline"
          >
            Manage Queue →
          </Link>
        </div>

        <div className="divide-y divide-editorial-border">
          {data.topPins.map((pin) => (
            <div key={pin.pinId} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-16 rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                  <img
                    src={pin.imageUrl}
                    alt={pin.recipeTitle}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                      {pin.boardName}
                    </span>
                    <span className="text-[10px] text-editorial-lightMuted font-mono">
                      Pin: {pin.pinId}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-editorial-text">
                    {pin.recipeTitle}
                  </h4>
                  <div className="text-[11px] text-editorial-muted">
                    Angle: {pin.angle} • Style: {pin.template}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 text-right shrink-0">
                <div>
                  <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
                    Clicks
                  </span>
                  <span className="font-bold text-sm text-rose-600">
                    {pin.outboundClicks.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
                    Saves
                  </span>
                  <span className="font-bold text-sm text-editorial-text">
                    {pin.saves.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
                    CTR
                  </span>
                  <span className="font-bold text-sm text-emerald-700">
                    {(pin.outboundCtr * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Creative Template & Angle Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Performance */}
        <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
          <div className="p-6 border-b border-editorial-border">
            <h3 className="font-serif text-base font-bold text-editorial-text">
              Creative Template Performance
            </h3>
            <p className="text-xs text-editorial-muted">
              Identifies which visual treatments generate the strongest click-through rates.
            </p>
          </div>

          <div className="divide-y divide-editorial-border">
            {data.templates.map((tpl) => (
              <div key={tpl.template} className="p-4 sm:p-5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-editorial-text">
                      {tpl.templateName}
                    </span>
                    {tpl.classification === 'strong' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                        Strong
                      </span>
                    )}
                    {tpl.classification === 'insufficient_data' && (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase">
                        Need Data
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-editorial-muted">
                    {tpl.pinCount} published pin(s) • {tpl.impressions.toLocaleString()} imp
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-rose-600 block">
                    {tpl.outboundClicks} clicks
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {(tpl.outboundCtr * 100).toFixed(2)}% CTR
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Angle Performance */}
        <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
          <div className="p-6 border-b border-editorial-border">
            <h3 className="font-serif text-base font-bold text-editorial-text">
              Content Angle Performance
            </h3>
            <p className="text-xs text-editorial-muted">
              Identifies which hook messaging converts best into outbound website visits.
            </p>
          </div>

          <div className="divide-y divide-editorial-border">
            {data.angles.map((ang) => (
              <div key={ang.angle} className="p-4 sm:p-5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-serif font-bold text-sm text-editorial-text block">
                    {ang.angleName}
                  </span>
                  <span className="text-[11px] text-editorial-muted">
                    {ang.pinCount} pin(s) • {ang.impressions.toLocaleString()} impressions
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-rose-600 block">
                    {ang.outboundClicks} clicks
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {(ang.outboundCtr * 100).toFixed(2)}% CTR
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
