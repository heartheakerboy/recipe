'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  ArrowRight,
  Layers,
  Sparkles,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { RecipeSeoAuditResult } from '@/lib/types/seo-intelligence';

interface SeoDashboardProps {
  metrics: {
    totalRecipes: number;
    publishedCount: number;
    indexedReadyCount: number;
    totalFindings: number;
    highSeverityCount: number;
    mediumSeverityCount: number;
    lowSeverityCount: number;
    orphanCount: number;
  };
  auditedRecipes: RecipeSeoAuditResult[];
  orphans: Array<{ id: string; title: string; slug: string; inboundCount: number }>;
}

export function SeoDashboard({
  metrics,
  auditedRecipes,
  orphans,
}: SeoDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'clean'>('all');

  const filtered = auditedRecipes.filter((r) => {
    if (filterSeverity === 'high' && r.highSeverityCount === 0) return false;
    if (filterSeverity === 'clean' && r.findings.length > 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return r.recipeTitle.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
            <Search className="w-4 h-4" />
            <span>Search Growth & Discovery</span>
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
            SEO Intelligence & Health Engine
          </h1>
          <p className="text-xs text-editorial-muted">
            Actionable technical audits, orphan detection, and striking-distance search performance insights.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/seo/opportunities"
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Opportunities Hub</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Index-Ready Recipes
          </span>
          <div className="font-serif text-3xl font-bold text-emerald-950">
            {metrics.indexedReadyCount}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">0 blocking issues</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
            High-Priority Issues
          </span>
          <div className="font-serif text-3xl font-bold text-rose-950">
            {metrics.highSeverityCount}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">Needs immediate action</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
            Medium Improvements
          </span>
          <div className="font-serif text-3xl font-bold text-amber-950">
            {metrics.mediumSeverityCount}
          </div>
          <span className="text-[11px] text-editorial-lightMuted">Content & metadata polish</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
            Orphan Recipes
          </span>
          <div className="font-serif text-3xl font-bold text-purple-950">
            {metrics.orphanCount}
          </div>
          <span className="text-[11px] text-purple-600 font-medium">≤1 internal link</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
            Total Audited
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {metrics.totalRecipes}
          </div>
          <span className="text-[11px] text-editorial-lightMuted">Across all catalogs</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-editorial-border shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-editorial-surface px-3 py-2 rounded-xl border border-editorial-border">
          <Search className="w-4 h-4 text-editorial-lightMuted shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audited recipes..."
            className="w-full bg-transparent text-xs text-editorial-text placeholder:text-editorial-lightMuted focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              filterSeverity === 'all'
                ? 'bg-brand-500 text-white'
                : 'bg-editorial-surface hover:bg-editorial-surfaceAlt text-editorial-muted'
            }`}
          >
            All Recipes ({auditedRecipes.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterSeverity('high')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              filterSeverity === 'high'
                ? 'bg-rose-600 text-white'
                : 'bg-editorial-surface hover:bg-editorial-surfaceAlt text-rose-700'
            }`}
          >
            High Priority ({metrics.highSeverityCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterSeverity('clean')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              filterSeverity === 'clean'
                ? 'bg-emerald-600 text-white'
                : 'bg-editorial-surface hover:bg-editorial-surfaceAlt text-emerald-700'
            }`}
          >
            Fully Clean
          </button>
        </div>
      </div>

      {/* Audited Recipes Table */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-editorial-text">
            Recipe Catalog SEO Audits
          </h3>
          <span className="text-xs text-editorial-muted">
            Showing {filtered.length} audited items
          </span>
        </div>

        <div className="divide-y divide-editorial-border">
          {filtered.map((audit) => (
            <div
              key={audit.recipeId}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-editorial-surface/40 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  {audit.highSeverityCount > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">
                      {audit.highSeverityCount} High Priority
                    </span>
                  ) : audit.mediumSeverityCount > 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                      {audit.mediumSeverityCount} Improvements
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Optimized</span>
                    </span>
                  )}
                  <span className="text-[11px] text-editorial-lightMuted font-mono">
                    /recipes/{audit.slug}/
                  </span>
                </div>

                <h4 className="font-serif font-bold text-base text-editorial-text">
                  {audit.recipeTitle}
                </h4>

                {audit.findings.length > 0 ? (
                  <p className="text-xs text-editorial-muted line-clamp-1">
                    Top issue: {audit.findings[0].title} — {audit.findings[0].suggestion}
                  </p>
                ) : (
                  <p className="text-xs text-emerald-700 font-medium">
                    All technical, content, image, and structured data checks passed cleanly.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Link
                  href={`/admin/recipes/${audit.recipeId}`}
                  className="px-4 py-2 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border text-editorial-text font-bold text-xs transition-colors"
                >
                  Edit Form
                </Link>
                <Link
                  href={`/admin/recipes/${audit.recipeId}/review`}
                  className="px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-800 font-bold text-xs transition-colors"
                >
                  Review Panel
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
