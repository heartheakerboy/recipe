'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  PieChart,
  DollarSign,
  TrendingUp,
  Flame,
  Sparkles,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { RecipeEconomics, RecipeDecisionSignal } from '@/lib/types/revenue';

interface RecipeEconomicsViewProps {
  economics: RecipeEconomics[];
}

const SIGNAL_BADGES: Record<RecipeDecisionSignal, { label: string; class: string }> = {
  high_traffic_high_revenue: {
    label: 'High Traffic / High Revenue',
    class: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  high_traffic_low_revenue: {
    label: 'High Traffic / Low Revenue',
    class: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  low_traffic_high_revenue: {
    label: 'Low Traffic / High Revenue',
    class: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  low_traffic_low_revenue: {
    label: 'Low Traffic / Low Revenue',
    class: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  },
  insufficient_data: {
    label: 'Insufficient Data',
    class: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  },
};

export function RecipeEconomicsView({ economics }: RecipeEconomicsViewProps) {
  const totalNetContribution = economics.reduce((sum, e) => sum + e.netContribution, 0);
  const totalRevenue = economics.reduce((sum, e) => sum + e.estimatedRevenue, 0);
  const totalCosts = economics.reduce((sum, e) => sum + e.generationCost, 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/revenue"
            className="p-2 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <PieChart className="w-4 h-4" />
              <span>Unit Economics</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              Recipe Profitability & Content ROI
            </h1>
          </div>
        </div>

        <Link
          href="/admin/revenue"
          className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors"
        >
          Back to Overview
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Net Catalog Contribution
          </span>
          <div className="font-serif text-3xl font-bold text-emerald-950">
            ${totalNetContribution.toFixed(2)}
          </div>
          <span className="text-[11px] text-editorial-lightMuted">
            Gross revenue minus AI & FLUX production costs
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
            Average Recipe ROI
          </span>
          <div className="font-serif text-3xl font-bold text-brand-950">
            {(totalCosts > 0 ? totalNetContribution / totalCosts : 0).toFixed(1)}x
          </div>
          <span className="text-[11px] text-brand-600 font-medium">
            Return on content generation investment
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
            Total Content Cost
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            ${totalCosts.toFixed(2)}
          </div>
          <span className="text-[11px] text-editorial-lightMuted">
            Across {economics.length} published recipe records
          </span>
        </div>
      </div>

      {/* Recipe Economics Table */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-editorial-text">
              Recipe-Level Performance & Decision Signals
            </h3>
            <p className="text-xs text-editorial-muted">
              Correlates recipe page traffic with ad earnings and AI/FLUX generation costs.
            </p>
          </div>
          <span className="text-xs text-editorial-muted font-medium">
            {economics.length} published recipes
          </span>
        </div>

        <div className="divide-y divide-editorial-border">
          {economics.map((item) => {
            const badge = SIGNAL_BADGES[item.decisionSignal];
            return (
              <div key={item.recipeId} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
                <div className="space-y-1.5 min-w-0 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${badge.class}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-editorial-lightMuted font-mono">
                      /recipes/{item.slug}/
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-editorial-text">
                    {item.recipeTitle}
                  </h4>

                  <p className="text-xs text-editorial-muted leading-relaxed">
                    <strong>Action:</strong> {item.actionableTip}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-right shrink-0">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
                      Pageviews
                    </span>
                    <span className="font-bold text-sm text-editorial-text">
                      {item.pageviews.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-rose-600 font-medium block">
                      {item.pinterestClicks.toLocaleString()} pin clicks
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
                      Est. Revenue
                    </span>
                    <span className="font-bold text-sm text-emerald-600">
                      ${item.estimatedRevenue.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
                      Content Cost
                    </span>
                    <span className="font-mono text-sm text-editorial-muted">
                      ${item.generationCost.toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
                      Contribution
                    </span>
                    <span className="font-bold text-sm text-emerald-700">
                      +${item.netContribution.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-brand-700 font-bold block">
                      {item.roi.toFixed(1)}x ROI
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
