'use client';

import React from 'react';
import Link from 'next/link';
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  Send,
  Settings,
} from 'lucide-react';
import { PinterestConnectionPublic, PinterestBoard, PinterestPublishLog } from '@/lib/types/pinterest-connection';
import { PinterestCreative } from '@/lib/types/pinterest';

interface PinterestPublishingDashboardProps {
  connection: PinterestConnectionPublic | null;
  metrics: {
    approved: number;
    queued: number;
    published: number;
    failed: number;
  };
  boards: PinterestBoard[];
  recentLogs: PinterestPublishLog[];
}

export function PinterestPublishingDashboard({
  connection,
  metrics,
  boards,
  recentLogs,
}: PinterestPublishingDashboardProps) {
  const isConnected = connection && connection.status === 'connected';

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
              <Flame className="w-4 h-4" />
              <span>Acquisition Engine</span>
            </span>
            {isConnected ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 font-semibold text-emerald-800">
                Connected: @{connection.accountIdentifier}
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 font-semibold text-zinc-600">
                Not Connected
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
            Pinterest Creative & Publishing Hub
          </h1>
          <p className="text-xs text-editorial-muted">
            Automated Pinterest 2:3 creative generation, board routing, and controlled distribution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/pinterest/queue"
            className="px-5 py-2.5 rounded-xl bg-[#E60023] hover:bg-[#c9021e] active:scale-95 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Open Queue ({metrics.queued + metrics.approved})</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
            Approved Creatives
          </span>
          <div className="font-serif text-3xl font-bold text-editorial-text">
            {metrics.approved}
          </div>
          <span className="text-[11px] text-editorial-lightMuted">Ready to be queued</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border-2 border-brand-300 shadow-xs space-y-1 bg-brand-50/30">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
            Publishing Queue
          </span>
          <div className="font-serif text-3xl font-bold text-brand-950">
            {metrics.queued}
          </div>
          <span className="text-[11px] text-brand-600 font-medium">Scheduled for publish</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Published Pins
          </span>
          <div className="font-serif text-3xl font-bold text-emerald-950">
            {metrics.published}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Live on Pinterest</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
            Failed Retries
          </span>
          <div className="font-serif text-3xl font-bold text-rose-950">
            {metrics.failed}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">Requires review</span>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/pinterest/analytics"
          className="group p-5 rounded-3xl bg-white border border-editorial-border hover:border-editorial-borderStrong shadow-xs hover:shadow-card transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-serif font-bold text-base text-editorial-text group-hover:text-brand-600 transition-colors block">
              Growth Analytics
            </span>
            <span className="text-xs text-editorial-muted">
              Outbound CTR, top pins & templates
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-editorial-lightMuted group-hover:text-brand-600 transition-colors" />
        </Link>

        <Link
          href="/admin/pinterest/queue"
          className="group p-5 rounded-3xl bg-white border border-editorial-border hover:border-editorial-borderStrong shadow-xs hover:shadow-card transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-serif font-bold text-base text-editorial-text group-hover:text-brand-600 transition-colors block">
              Review Queue
            </span>
            <span className="text-xs text-editorial-muted">
              Inspect approved pins and publish
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-editorial-lightMuted group-hover:text-brand-600 transition-colors" />
        </Link>

        <Link
          href="/admin/pinterest/boards"
          className="group p-5 rounded-3xl bg-white border border-editorial-border hover:border-editorial-borderStrong shadow-xs hover:shadow-card transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-serif font-bold text-base text-editorial-text group-hover:text-brand-600 transition-colors block">
              Manage Boards ({boards.length})
            </span>
            <span className="text-xs text-editorial-muted">
              Map categories to boards
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-editorial-lightMuted group-hover:text-brand-600 transition-colors" />
        </Link>

        <Link
          href="/admin/settings/pinterest"
          className="group p-5 rounded-3xl bg-white border border-editorial-border hover:border-editorial-borderStrong shadow-xs hover:shadow-card transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="font-serif font-bold text-base text-editorial-text group-hover:text-brand-600 transition-colors block">
              Connection Settings
            </span>
            <span className="text-xs text-editorial-muted">
              {isConnected ? 'OAuth token is valid' : 'Connect Pinterest account'}
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-editorial-lightMuted group-hover:text-brand-600 transition-colors" />
        </Link>
      </div>

      {/* Recent Publishing History Table */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-editorial-text">
              Recent Publishing Activity
            </h3>
            <p className="text-xs text-editorial-muted">
              Audit log of pins distributed to Pinterest boards.
            </p>
          </div>
          <Link
            href="/admin/pinterest/queue"
            className="text-xs font-bold text-brand-600 hover:underline"
          >
            View Full Queue →
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-editorial-muted">
            No pins published yet. Approved pins in the queue can be published now.
          </div>
        ) : (
          <div className="divide-y divide-editorial-border">
            {recentLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        log.status === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {log.status}
                    </span>
                    <span className="text-editorial-lightMuted font-mono">
                      {new Date(log.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-editorial-text mt-1">
                    {log.recipeTitle}
                  </h4>
                  <span className="text-[11px] text-editorial-muted">
                    Board: {log.boardName}
                  </span>
                </div>

                {log.pinUrl && (
                  <a
                    href={log.pinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>View on Pinterest</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
