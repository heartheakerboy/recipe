'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  Link2,
  ExternalLink,
  Flame,
  Search,
} from 'lucide-react';
import { SearchOpportunityAlert } from '@/lib/types/seo-intelligence';

interface SeoOpportunitiesViewProps {
  opportunities: SearchOpportunityAlert[];
}

export function SeoOpportunitiesView({ opportunities }: SeoOpportunitiesViewProps) {
  const strikingDistance = opportunities.filter((o) => o.type === 'striking_distance');
  const lowCtr = opportunities.filter((o) => o.type === 'low_ctr');
  const orphans = opportunities.filter((o) => o.type === 'orphan_recipe');

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/seo"
            className="p-2 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>Search Growth Engine</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              Content & Internal Linking Opportunities
            </h1>
          </div>
        </div>

        <Link
          href="/admin/seo"
          className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors"
        >
          Back to Health Overview
        </Link>
      </div>

      {/* 1. Striking Distance Opportunities */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-editorial-text flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Striking Distance Queries (Positions 5–20)</span>
            </h3>
            <p className="text-xs text-editorial-muted">
              High-impression queries ranking on the cusp of top 3. Modest content refinement can push these to dominant positions.
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            {strikingDistance.length} Opportunities
          </span>
        </div>

        <div className="divide-y divide-editorial-border">
          {strikingDistance.map((opp) => (
            <div key={opp.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  &ldquo;{opp.query}&rdquo;
                </span>
                <h4 className="font-serif font-bold text-base text-editorial-text mt-1">
                  {opp.recipeTitle}
                </h4>
                <div className="text-[11px] font-semibold text-editorial-lightMuted">
                  {opp.metricText}
                </div>
                <p className="text-xs text-editorial-muted leading-relaxed">
                  {opp.recommendation}
                </p>
              </div>

              <Link
                href={`/admin/recipes/${opp.recipeId}`}
                className="px-4 py-2 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text shrink-0"
              >
                Optimize Recipe
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Low CTR Opportunities */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-editorial-text flex items-center gap-2">
              <Search className="w-4 h-4 text-rose-600" />
              <span>Low CTR Snippet Polish (Page 1)</span>
            </h3>
            <p className="text-xs text-editorial-muted">
              Ranking on Page 1 but receiving below-average click-through rates. Improving title hooks and meta descriptions will unlock traffic immediately.
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
            {lowCtr.length} Opportunities
          </span>
        </div>

        <div className="divide-y divide-editorial-border">
          {lowCtr.map((opp) => (
            <div key={opp.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold font-mono text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full">
                  &ldquo;{opp.query}&rdquo;
                </span>
                <h4 className="font-serif font-bold text-base text-editorial-text mt-1">
                  {opp.recipeTitle}
                </h4>
                <div className="text-[11px] font-semibold text-rose-600">
                  {opp.metricText}
                </div>
                <p className="text-xs text-editorial-muted leading-relaxed">
                  {opp.recommendation}
                </p>
              </div>

              <Link
                href={`/admin/recipes/${opp.recipeId}`}
                className="px-4 py-2 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text shrink-0"
              >
                Refine Snippet
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Orphan Recipes */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-editorial-text flex items-center gap-2">
              <Link2 className="w-4 h-4 text-purple-600" />
              <span>Orphan Recipe Internal Linking</span>
            </h3>
            <p className="text-xs text-editorial-muted">
              Recipes with $\le$ 1 inbound contextual link. Internal linking helps search engine spiders discover and rank newly published dishes.
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
            {orphans.length} Orphans
          </span>
        </div>

        {orphans.length === 0 ? (
          <div className="p-8 text-center text-xs text-editorial-muted">
            All published recipes have strong inbound contextual link paths!
          </div>
        ) : (
          <div className="divide-y divide-editorial-border">
            {orphans.map((opp) => (
              <div key={opp.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-editorial-text">
                    {opp.recipeTitle}
                  </h4>
                  <div className="text-[11px] font-semibold text-purple-700">
                    {opp.metricText}
                  </div>
                  <p className="text-xs text-editorial-muted leading-relaxed">
                    {opp.recommendation}
                  </p>
                </div>

                <Link
                  href={`/admin/recipes/${opp.recipeId}`}
                  className="px-4 py-2 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text shrink-0"
                >
                  Add Links
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
