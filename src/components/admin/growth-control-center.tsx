'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Sparkles,
  Flame,
  Search,
  CheckCircle2,
  X,
  Check,
  ArrowRight,
  FlaskConical,
  FileSpreadsheet,
  Award,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  GrowthCycleProgress,
  GrowthWeeklyGoal,
  GrowthWinnerRecipe,
  ContentScorecard,
  GrowthRecommendation,
} from '@/lib/types/growth-system';
import { updateRecommendationStatusAction } from '@/lib/actions/growth-actions';

interface GrowthControlCenterProps {
  initialData: {
    progress: GrowthCycleProgress;
    goal: GrowthWeeklyGoal;
    winners: GrowthWinnerRecipe[];
    scorecards: ContentScorecard[];
    recommendations: GrowthRecommendation[];
  };
}

export function GrowthControlCenter({ initialData }: GrowthControlCenterProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [actingRecId, setActingRecId] = useState<string | null>(null);

  const handleRecommendation = async (id: string, status: 'accepted' | 'ignored') => {
    setActingRecId(id);
    try {
      const res = await updateRecommendationStatusAction(id, status);
      if (res.success) {
        setData((prev) => ({
          ...prev,
          recommendations: prev.recommendations.map((r) =>
            r.id === id ? { ...r, status } : r
          ),
        }));
        router.refresh();
      }
    } finally {
      setActingRecId(null);
    }
  };

  const pctCompleted = Math.round((data.progress.currentDay / data.progress.totalDays) * 100);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>30-Day Growth Operating System</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 border border-brand-200 font-semibold text-brand-800">
              Cycle Day {data.progress.currentDay} of {data.progress.totalDays}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
            Growth Control Center
          </h1>
          <p className="text-xs text-editorial-muted">
            Track real acquisition signals, identify early recipe winners, test creative hypotheses, and execute data-backed expansions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/growth/experiments"
            className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors flex items-center gap-1.5"
          >
            <FlaskConical className="w-3.5 h-3.5 text-editorial-muted" />
            <span>Experiments</span>
          </Link>

          <Link
            href="/admin/growth/report"
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Weekly Report</span>
          </Link>
        </div>
      </div>

      {/* Cycle Progress Bar */}
      <div className="bg-white rounded-3xl border border-editorial-border p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            <span className="font-bold text-editorial-text">
              30-Day Launch Operating Window
            </span>
          </div>
          <span className="font-bold text-brand-600">
            Day {data.progress.currentDay} of {data.progress.totalDays} ({pctCompleted}%)
          </span>
        </div>

        <div className="w-full bg-editorial-surface rounded-full h-3 overflow-hidden">
          <div
            className="bg-brand-500 h-full rounded-full transition-all"
            style={{ width: `${pctCompleted}%` }}
          />
        </div>
      </div>

      {/* Core Sourced Progress KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
            Published Recipes
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {data.progress.recipesPublished}
          </div>
          <span className="text-[11px] text-editorial-lightMuted">Target: {data.goal.recipesTarget}/week</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
            Pinterest Pins
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {data.progress.pinsPublished}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">Distributed assets</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Organic Search
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {data.progress.organicSessions.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Bing & Google</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
            Pinterest Visits
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {data.progress.pinterestSessions.toLocaleString()}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">Outbound readers</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
            Subscribers
          </span>
          <div className="font-serif text-3xl font-bold text-purple-950">
            {data.progress.emailSubscribers.toLocaleString()}
          </div>
          <span className="text-[11px] text-purple-600 font-medium">Direct audience</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Gross Revenue
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            ${data.progress.revenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-editorial-lightMuted">Ad network ledger</span>
        </div>
      </div>

      {/* Early Winners Radar */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-serif text-base font-bold text-editorial-text">
                Early Growth Winners Radar
              </h3>
            </div>
            <p className="text-xs text-editorial-muted">
              Recipes with statistically significant engagement and proven outbound clicks.
            </p>
          </div>
        </div>

        <div className="divide-y divide-editorial-border">
          {data.winners.length === 0 ? (
            <div className="p-10 text-center text-xs text-editorial-muted space-y-1">
              <span className="font-semibold text-editorial-text block text-sm">
                No Breakout Winners Identified Yet
              </span>
              <p>
                Winner detection runs automatically as published recipe pins and organic rankings generate reader sessions.
              </p>
            </div>
          ) : (
            data.winners.map((winner) => (
              <div key={winner.recipeId} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-xs">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase">
                      {winner.type.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-[10px] text-editorial-lightMuted">
                      /recipes/{winner.slug}/
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-lg text-editorial-text">
                    {winner.title}
                  </h4>

                  <p className="text-xs text-editorial-muted leading-relaxed">
                    <strong>Recommended Expansion:</strong> {winner.suggestedExpansion}
                  </p>
                </div>

                <div className="flex items-center gap-6 text-right shrink-0">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
                      Sessions
                    </span>
                    <span className="font-serif font-bold text-xl text-editorial-text">
                      {winner.sessions.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
                      Outbound CTR
                    </span>
                    <span className="font-serif font-bold text-xl text-emerald-700">
                      {winner.ctr}%
                    </span>
                  </div>

                  <Link
                    href="/admin/content/generation"
                    className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    <span>Expand Pillar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Data-Backed Recommendations */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border">
          <h3 className="font-serif text-base font-bold text-editorial-text">
            Actionable Growth Decisions
          </h3>
          <p className="text-xs text-editorial-muted">
            Synthesized from Pinterest CTR, Bing discovery, and revenue trends. Requires human signoff.
          </p>
        </div>

        <div className="divide-y divide-editorial-border">
          {data.recommendations.map((rec) => (
            <div key={rec.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-editorial-surface border border-editorial-border text-[10px] font-bold uppercase text-editorial-muted">
                    {rec.type}
                  </span>
                  <h4 className="font-serif font-bold text-base text-editorial-text">
                    {rec.title}
                  </h4>
                </div>
                <p className="text-xs text-editorial-muted">{rec.rationale}</p>
                <span className="text-[11px] text-brand-700 font-semibold block">
                  Data: {rec.supportingData}
                </span>
              </div>

              <div className="shrink-0">
                {rec.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={actingRecId === rec.id}
                      onClick={() => handleRecommendation(rec.id, 'ignored')}
                      className="px-3 py-1.5 rounded-xl border border-editorial-border text-editorial-muted hover:bg-editorial-surface text-xs font-semibold cursor-pointer"
                    >
                      Ignore
                    </button>
                    <button
                      type="button"
                      disabled={actingRecId === rec.id}
                      onClick={() => handleRecommendation(rec.id, 'accepted')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      Accept Action
                    </button>
                  </div>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      rec.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {rec.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Scorecards */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-editorial-text">
              Recipe Performance Scorecard
            </h3>
            <p className="text-xs text-editorial-muted">
              Holistic ranking across Traffic, Pinterest, SEO, and Monetization.
            </p>
          </div>
        </div>

        <div className="divide-y divide-editorial-border">
          {data.scorecards.length === 0 ? (
            <div className="p-10 text-center text-xs text-editorial-muted space-y-1">
              <span className="font-semibold text-editorial-text block text-sm">
                No Recipe Scorecards Generated Yet
              </span>
              <p>
                Scorecards will be ranked automatically as pageviews and Pinterest outbound clicks accumulate.
              </p>
            </div>
          ) : (
            data.scorecards.map((sc) => (
              <div key={sc.recipeId} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-serif font-bold text-sm text-editorial-text block">
                    {sc.title}
                  </span>
                  <div className="flex items-center gap-3 text-[11px] text-editorial-lightMuted">
                    <span>Traffic: <strong className="text-editorial-text capitalize">{sc.trafficGrade}</strong></span>
                    <span>•</span>
                    <span>Pinterest: <strong className="text-editorial-text capitalize">{sc.pinterestGrade}</strong></span>
                    <span>•</span>
                    <span>SEO: <strong className="text-emerald-700 capitalize">{sc.seoGrade}</strong></span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase shrink-0 ${
                    sc.action === 'scale'
                      ? 'bg-emerald-100 text-emerald-800'
                      : sc.action === 'monitor'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Action: {sc.action.replace(/_/g, ' ')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
