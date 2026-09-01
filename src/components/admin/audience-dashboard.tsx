'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Mail,
  Send,
  Sliders,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { SubscriberPublic } from '@/lib/types/newsletter';

interface AudienceDashboardProps {
  initialData: {
    metrics: {
      totalSubscribers: number;
      activeCount: number;
      unsubscribedCount: number;
      netGrowthPct: number;
    };
    sourcesBreakdown: Record<string, number>;
    subscribers: SubscriberPublic[];
  };
}

export function AudienceDashboard({ initialData }: AudienceDashboardProps) {
  const { metrics, sourcesBreakdown, subscribers } = initialData;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Audience Growth & Retention</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-editorial-surface border border-editorial-border font-semibold text-editorial-muted">
              Privacy Masked
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
            Subscriber Growth & Retention Hub
          </h1>
          <p className="text-xs text-editorial-muted">
            Grow direct culinary readership and measure returning visitor conversions from Pinterest and search.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/newsletters"
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Newsletter Campaigns</span>
          </Link>

          <Link
            href="/admin/settings/email"
            className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-editorial-muted" />
            <span>Email Settings</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
            Active Subscribers
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {metrics.activeCount.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>+{metrics.netGrowthPct}% this month</span>
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
            Total Signups
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {metrics.totalSubscribers.toLocaleString()}
          </div>
          <span className="text-[11px] text-editorial-lightMuted">All-time entries</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
            Unsubscribed
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {metrics.unsubscribedCount.toLocaleString()}
          </div>
          <span className="text-[11px] text-editorial-lightMuted">1-click honor policy</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Retention Rate
          </span>
          <div className="font-serif text-3xl font-bold text-emerald-950">
            {(
              metrics.totalSubscribers > 0
                ? (metrics.activeCount / metrics.totalSubscribers) * 100
                : 100
            ).toFixed(1)}%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Low churn audience</span>
        </div>
      </div>

      {/* Acquisition Sources Breakdown */}
      <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-serif text-base font-bold text-editorial-text border-b border-editorial-border pb-3">
          Subscriber Acquisition Sources
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(sourcesBreakdown).map(([source, count]) => (
            <div key={source} className="p-4 rounded-2xl bg-editorial-surface border border-editorial-border space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted block capitalize">
                {source.replace(/_/g, ' ')}
              </span>
              <div className="font-serif text-2xl font-bold text-editorial-text">
                {count}
              </div>
              <span className="text-[11px] text-editorial-lightMuted">
                {((count / (metrics.totalSubscribers || 1)) * 100).toFixed(0)}% of total
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Masked Subscriber Ledger */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-editorial-text flex items-center gap-2">
              <span>Recent Subscribers</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </h3>
            <p className="text-xs text-editorial-muted">
              Emails are automatically privacy-masked to safeguard reader confidentiality.
            </p>
          </div>
          <span className="text-xs text-editorial-muted font-medium">
            {subscribers.length} records
          </span>
        </div>

        <div className="divide-y divide-editorial-border">
          {subscribers.map((sub) => (
            <div key={sub.id} className="p-5 flex items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-editorial-text text-sm">
                    {sub.maskedEmail}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      sub.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
                <span className="text-[11px] text-editorial-lightMuted">
                  Subscribed via <strong className="capitalize">{sub.source.replace(/_/g, ' ')}</strong> on{' '}
                  {new Date(sub.subscribedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-editorial-muted uppercase block">
                  Consent
                </span>
                <span className="text-xs font-semibold text-emerald-700">Verified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
