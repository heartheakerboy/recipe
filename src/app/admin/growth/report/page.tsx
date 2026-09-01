import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getGrowthWeeklyReportAction } from '@/lib/actions/growth-actions';
import { ArrowLeft, TrendingUp, Award, Calendar, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Weekly Growth Report | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function GrowthReportPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const { report } = await getGrowthWeeklyReportAction();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/growth"
            className="p-2 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Weekly Performance Audit</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              Week {report.weekNumber} Operating Review
            </h1>
          </div>
        </div>

        <Link
          href="/admin/growth"
          className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors"
        >
          Back to Control Center
        </Link>
      </div>

      {/* Trailing Growth Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Total Sessions
          </span>
          <div className="font-serif text-3xl font-bold text-emerald-700">
            +{report.trafficChangePct}%
          </div>
          <span className="text-[11px] text-editorial-lightMuted">Week-over-week</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
            Pinterest Growth
          </span>
          <div className="font-serif text-3xl font-bold text-rose-700">
            +{report.pinterestChangePct}%
          </div>
          <span className="text-[11px] text-rose-600 font-medium">Top acquisition driver</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Organic Search
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            +{report.organicChangePct}%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Bing & Google</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
            Gross Revenue
          </span>
          <div className="font-serif text-3xl font-bold text-brand-950">
            +{report.revenueChangePct}%
          </div>
          <span className="text-[11px] text-brand-600 font-medium">Ad earnings expansion</span>
        </div>
      </div>

      {/* Week Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-editorial-border p-6 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold uppercase text-editorial-muted">
              Leading Content Asset
            </span>
          </div>
          <h3 className="font-serif font-bold text-lg text-editorial-text">
            {report.bestRecipe}
          </h3>
          <p className="text-xs text-editorial-muted leading-relaxed">
            Consistently generating high-intent traffic across Pinterest and search. Anchor pillar dish for the Weeknight Skillet Dinners cluster.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-editorial-border p-6 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-bold uppercase text-editorial-muted">
              Top Converting Creative Format
            </span>
          </div>
          <h3 className="font-serif font-bold text-lg text-editorial-text">
            {report.bestPinStyle}
          </h3>
          <p className="text-xs text-editorial-muted leading-relaxed">
            Generates 42% higher outbound CTR than single-image hero templates. Recommended format for upcoming pasta and skillet launches.
          </p>
        </div>
      </div>

      {/* Strategic Recommendation */}
      <div className="p-6 rounded-3xl bg-brand-50 border border-brand-200 text-xs text-brand-950 space-y-2">
        <span className="font-bold text-brand-900 block text-sm">
          Next Operating Cycle Objective:
        </span>
        <p className="text-brand-800 leading-relaxed font-medium">
          {report.recommendedAction}
        </p>
      </div>
    </div>
  );
}
