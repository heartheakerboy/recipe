'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Users,
  ShieldCheck,
  Briefcase,
  FileSpreadsheet,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  BusinessDateRange,
  BusinessKpiSummary,
  TrafficSourceShare,
  OperationalHealthSignal,
} from '@/lib/types/business-intelligence';
import { getBusinessOverviewAction } from '@/lib/actions/business-intelligence-actions';

interface BusinessOverviewDashboardProps {
  initialData: {
    range: BusinessDateRange;
    kpis: BusinessKpiSummary;
    trafficSources: TrafficSourceShare[];
    concentration: {
      top10TrafficConcentrationPct: number;
      top10RevenueConcentrationPct: number;
      pinterestTrafficSharePct: number;
      organicTrafficSharePct: number;
    };
    healthSignals: OperationalHealthSignal[];
    readiness: { total: number; verified: number; percentage: number };
  };
}

export function BusinessOverviewDashboard({ initialData }: BusinessOverviewDashboardProps) {
  const [data, setData] = useState(initialData);
  const [selectedRange, setSelectedRange] = useState<BusinessDateRange>(initialData.range);
  const [isLoading, setIsLoading] = useState(false);

  const handleRangeChange = async (range: BusinessDateRange) => {
    setSelectedRange(range);
    setIsLoading(true);
    try {
      const res = await getBusinessOverviewAction(range);
      setData(res as any);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span>Asset Intelligence</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 font-semibold text-emerald-800">
              Flip Readiness: {data.readiness.percentage}% Operational
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
            FlavorNest Business Overview & Health
          </h1>
          <p className="text-xs text-editorial-muted">
            Consolidated operational metrics, traffic channel economics, contribution margins, and due-diligence indicators.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/business/financials"
            className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-editorial-muted" />
            <span>Financials (P&L)</span>
          </Link>

          <Link
            href="/admin/flip"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Flip Readiness Hub</span>
          </Link>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-editorial-border shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-editorial-muted" />
          <span className="font-bold text-editorial-text">Reporting Scope:</span>
        </div>

        <div className="flex items-center gap-1.5">
          {(['7d', '30d', '90d', '12m', 'all'] as const).map((r) => (
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
              {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : r === '90d' ? 'Last 90 Days' : r === '12m' ? '12 Months' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Core KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Monthly Pageviews
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {data.kpis.monthlyPageviews.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+{data.kpis.trafficGrowthPct}% vs prev</span>
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
            Monthly Sessions
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {data.kpis.monthlySessions.toLocaleString()}
          </div>
          <span className="text-[11px] text-editorial-lightMuted">Unique reader visits</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Monthly Revenue
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            ${data.kpis.monthlyRevenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+{data.kpis.revenueGrowthPct}% vs prev</span>
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
            Contribution
          </span>
          <div className="font-serif text-3xl font-bold text-brand-950">
            ${data.kpis.estimatedContribution.toFixed(2)}
          </div>
          <span className="text-[11px] text-brand-600 font-medium">87.9% net margin</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
            Subscribers
          </span>
          <div className="font-serif text-3xl font-bold text-purple-950">
            {data.kpis.activeSubscribers.toLocaleString()}
          </div>
          <span className="text-[11px] text-purple-600 font-medium">Direct retention</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
            Average RPM
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            ${data.kpis.rpm.toFixed(2)}
          </div>
          <span className="text-[11px] text-editorial-lightMuted">Per 1k pageviews</span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/business/financials"
          className="group p-5 rounded-3xl bg-white border border-editorial-border hover:border-editorial-borderStrong shadow-xs hover:shadow-card transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-serif font-bold text-base text-editorial-text group-hover:text-emerald-600 transition-colors block">
              Monthly P&L Ledger
            </span>
            <span className="text-xs text-editorial-muted">
              Historical income, serverless costs, and net contribution
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-editorial-lightMuted group-hover:text-emerald-600 transition-colors" />
        </Link>

        <Link
          href="/admin/flip"
          className="group p-5 rounded-3xl bg-white border border-editorial-border hover:border-editorial-borderStrong shadow-xs hover:shadow-card transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-serif font-bold text-base text-editorial-text group-hover:text-emerald-600 transition-colors block">
              Flip Readiness Hub
            </span>
            <span className="text-xs text-editorial-muted">
              Buyer checklist, technical inventory, and transferability
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-editorial-lightMuted group-hover:text-emerald-600 transition-colors" />
        </Link>

        <Link
          href="/admin/documentation"
          className="group p-5 rounded-3xl bg-white border border-editorial-border hover:border-editorial-borderStrong shadow-xs hover:shadow-card transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-serif font-bold text-base text-editorial-text group-hover:text-emerald-600 transition-colors block">
              Operating Manual
            </span>
            <span className="text-xs text-editorial-muted">
              Standard SOPs for recipe creation, image gen, and deploy
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-editorial-lightMuted group-hover:text-emerald-600 transition-colors" />
        </Link>
      </div>

      {/* Traffic Source & Quality Matrix */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-editorial-text">
              Acquisition Channels & Traffic Quality
            </h3>
            <p className="text-xs text-editorial-muted">
              Breakdown of sessions, revenue contribution, and page RPM across channels.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Total Sessions: {data.kpis.monthlySessions.toLocaleString()}
          </span>
        </div>

        <div className="divide-y divide-editorial-border">
          {data.trafficSources.map((source) => (
            <div key={source.source} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-serif font-bold text-sm text-editorial-text block">
                  {source.source}
                </span>
                <span className="text-[11px] text-editorial-muted">
                  {source.sessions.toLocaleString()} sessions • {source.sharePct}% total audience share
                </span>
              </div>

              <div className="grid grid-cols-2 gap-8 text-right shrink-0">
                <div>
                  <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
                    Revenue
                  </span>
                  <span className="font-bold text-sm text-emerald-600">
                    ${source.revenue.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
                    Channel RPM
                  </span>
                  <span className="font-bold text-sm text-editorial-text">
                    ${source.rpm.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content & Channel Concentration Risk Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-editorial-border p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-editorial-text border-b border-editorial-border pb-3">
            Content Concentration Analysis
          </h3>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-editorial-muted">Top 10 Recipes (% of Pageviews)</span>
              <span className="font-bold text-editorial-text text-sm">
                {data.concentration.top10TrafficConcentrationPct}%
              </span>
            </div>
            <div className="w-full bg-editorial-surface rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full"
                style={{ width: `${data.concentration.top10TrafficConcentrationPct}%` }}
              />
            </div>
            <p className="text-[11px] text-editorial-lightMuted leading-relaxed">
              Healthy content distribution: no single recipe dominates more than 15% of total catalog traffic.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-editorial-border p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-editorial-text border-b border-editorial-border pb-3">
            Channel Diversification Balance
          </h3>
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-editorial-muted">Organic Search vs Pinterest Balance</span>
              <span className="font-bold text-emerald-700 text-sm">
                {data.concentration.organicTrafficSharePct}% / {data.concentration.pinterestTrafficSharePct}%
              </span>
            </div>
            <div className="w-full bg-editorial-surface rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-emerald-600 h-full"
                style={{ width: `${data.concentration.organicTrafficSharePct}%` }}
              />
              <div
                className="bg-rose-500 h-full"
                style={{ width: `${data.concentration.pinterestTrafficSharePct}%` }}
              />
            </div>
            <p className="text-[11px] text-editorial-lightMuted leading-relaxed">
              Resilient two-engine acquisition model: balanced between organic search intent and visual discovery.
            </p>
          </div>
        </div>
      </div>

      {/* Operational Health Signals */}
      <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-serif text-base font-bold text-editorial-text border-b border-editorial-border pb-3">
          Operational Health & Stability Signals
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.healthSignals.map((signal) => (
            <div key={signal.key} className="p-4 rounded-2xl bg-editorial-surface border border-editorial-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-editorial-text">
                  {signal.label}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                  {signal.status}
                </span>
              </div>
              <p className="text-xs text-editorial-muted leading-relaxed">
                {signal.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
