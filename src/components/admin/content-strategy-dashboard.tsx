'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  ContentOpportunity,
  ContentCluster,
  RecipeGenerationJob,
} from '@/lib/types/content-cluster';
import { StrategyOverview } from '@/lib/content/content-opportunity.service';

interface ContentStrategyDashboardProps {
  initialData: {
    overview: StrategyOverview;
    opportunities: ContentOpportunity[];
    clusters: ContentCluster[];
    jobs: RecipeGenerationJob[];
  };
}

export function ContentStrategyDashboard({ initialData }: ContentStrategyDashboardProps) {
  const { overview, opportunities, clusters, jobs } = initialData;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
              <Compass className="w-4 h-4" />
              <span>Programmatic Content Strategy</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-editorial-surface border border-editorial-border font-semibold text-editorial-muted">
              Quality-First Expansion
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
            Recipe Cluster & Content Expansion Engine
          </h1>
          <p className="text-xs text-editorial-muted">
            Identify high-intent culinary opportunities, organize recipes into topical clusters, and maintain human editorial review.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/content/clusters"
            className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-editorial-muted" />
            <span>Topical Clusters ({clusters.length})</span>
          </Link>

          <Link
            href="/admin/content/generation"
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Review Queue ({overview.inReviewCount})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
            Open Opportunities
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {overview.totalOpportunities}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>Validated demand</span>
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
            Active Clusters
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {overview.activeClusters}
          </div>
          <span className="text-[11px] text-editorial-lightMuted">Curated authority hubs</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
            In Review
          </span>
          <div className="font-serif text-3xl font-bold text-amber-950">
            {overview.inReviewCount}
          </div>
          <span className="text-[11px] text-amber-700 font-medium">Awaiting human approval</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
            Cluster Coverage
          </span>
          <div className="font-serif text-3xl font-bold text-purple-950">
            {overview.publishedCoverageAvg}%
          </div>
          <span className="text-[11px] text-purple-600 font-medium">Average hub completion</span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/content/clusters"
          className="group p-6 rounded-3xl bg-white border border-editorial-border hover:border-editorial-borderStrong shadow-xs hover:shadow-card transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-serif font-bold text-lg text-editorial-text group-hover:text-brand-600 transition-colors block">
              Topical Clusters Directory
            </span>
            <span className="text-xs text-editorial-muted">
              Inspect pillar dishes, supporting recipes, and internal-linking graphs
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-editorial-lightMuted group-hover:text-brand-600 transition-colors" />
        </Link>

        <Link
          href="/admin/content/generation"
          className="group p-6 rounded-3xl bg-white border border-editorial-border hover:border-editorial-borderStrong shadow-xs hover:shadow-card transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-serif font-bold text-lg text-editorial-text group-hover:text-brand-600 transition-colors block">
              Editorial Generation & Review Queue
            </span>
            <span className="text-xs text-editorial-muted">
              Validate ingredient consistency, review recipe briefs, and approve drafts
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-editorial-lightMuted group-hover:text-brand-600 transition-colors" />
        </Link>
      </div>

      {/* Opportunities List */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-editorial-text">
              High-Value Content Opportunities
            </h3>
            <p className="text-xs text-editorial-muted">
              Ranked deterministically using Pinterest CTR signals, search gaps, and duplication penalties.
            </p>
          </div>
          <span className="text-xs text-editorial-muted font-medium">
            {opportunities.length} suggested topics
          </span>
        </div>

        <div className="divide-y divide-editorial-border">
          {opportunities.map((opp) => (
            <div key={opp.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-xs">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      opp.priority === 'high'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {opp.priority} Priority
                  </span>
                  {opp.clusterName && (
                    <span className="text-[11px] text-editorial-lightMuted font-mono">
                      Cluster: {opp.clusterName}
                    </span>
                  )}
                </div>

                <h4 className="font-serif font-bold text-lg text-editorial-text">
                  {opp.topic}
                </h4>

                <p className="text-xs text-editorial-muted leading-relaxed">
                  <strong>Reason:</strong> {opp.reason}
                </p>

                <p className="text-xs text-brand-700 font-semibold">
                  <strong>Recommendation:</strong> {opp.recommendation}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-right shrink-0">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
                    Opportunity Score
                  </span>
                  <span className="font-serif font-bold text-2xl text-emerald-700">
                    {opp.scoreBreakdown.totalScore}/100
                  </span>
                  <span className="text-[10px] text-editorial-lightMuted block">
                    Pinterest ({opp.scoreBreakdown.pinterest}) • Search ({opp.scoreBreakdown.search})
                  </span>
                </div>

                <Link
                  href="/admin/content/generation"
                  className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Review Draft</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
