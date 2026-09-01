import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getFinancialsAction } from '@/lib/actions/business-intelligence-actions';
import { ArrowLeft, FileSpreadsheet, Download, TrendingUp, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Monthly Financials (P&L) | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function MonthlyFinancialsPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const { financials } = await getFinancialsAction();

  const totalRevenue = financials.reduce((sum, f) => sum + f.revenue, 0);
  const totalCosts = financials.reduce((sum, f) => sum + f.costs, 0);
  const totalContribution = financials.reduce((sum, f) => sum + f.contribution, 0);
  const overallMargin = totalRevenue > 0 ? (totalContribution / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/business"
            className="p-2 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Profit & Loss Statement</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              Monthly Financial Performance
            </h1>
          </div>
        </div>

        <Link
          href="/admin/flip/data-room"
          className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-editorial-muted" />
          <span>Export P&L CSV</span>
        </Link>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Total Trailing Revenue
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            ${totalRevenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-editorial-lightMuted">Across reported months</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
            Net Trailing Contribution
          </span>
          <div className="font-serif text-3xl font-bold text-brand-950">
            ${totalContribution.toFixed(2)}
          </div>
          <span className="text-[11px] text-brand-600 font-medium">After all tracked costs</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
            Average Contribution Margin
          </span>
          <div className="font-serif text-3xl font-bold text-purple-950">
            {overallMargin.toFixed(1)}%
          </div>
          <span className="text-[11px] text-purple-600 font-medium">High operational efficiency</span>
        </div>
      </div>

      {/* Monthly Financials Ledger */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-editorial-text">
              Monthly P&L Ledger
            </h3>
            <p className="text-xs text-editorial-muted">
              Gross ad revenue vs verified serverless compute, AI generation, and image costs.
            </p>
          </div>
          <span className="text-xs text-editorial-muted font-medium">
            {financials.length} statements
          </span>
        </div>

        <div className="divide-y divide-editorial-border">
          {financials.map((f) => (
            <div key={f.month} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-serif font-bold text-base text-editorial-text block">
                  {f.month}
                </span>
                <span className="text-[11px] text-editorial-lightMuted">
                  Verified against Ad Network & Provider Ledgers
                </span>
              </div>

              <div className="grid grid-cols-4 gap-6 text-right shrink-0">
                <div>
                  <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">Revenue</span>
                  <span className="font-bold text-sm text-emerald-600">${f.revenue.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">Costs</span>
                  <span className="font-mono text-sm text-editorial-muted">${f.costs.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">Contribution</span>
                  <span className="font-bold text-sm text-brand-700">${f.contribution.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">Margin</span>
                  <span className="font-bold text-sm text-purple-700">{f.marginPct.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
