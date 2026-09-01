'use client';

import React from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Award,
} from 'lucide-react';
import { GrowthExperiment } from '@/lib/types/growth-system';

interface GrowthExperimentsViewProps {
  experiments: GrowthExperiment[];
}

export function GrowthExperimentsView({ experiments }: GrowthExperimentsViewProps) {
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
              <FlaskConical className="w-4 h-4" />
              <span>Scientific A/B Learning</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              Growth Experiments Studio
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

      {/* Experiments List */}
      <div className="space-y-6">
        {experiments.map((exp) => (
          <div
            key={exp.id}
            className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      exp.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {exp.status}
                  </span>
                  <span className="font-mono text-[11px] text-editorial-lightMuted">
                    Variable: {exp.variable}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-editorial-text">
                  Hypothesis: {exp.hypothesis}
                </h3>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
                  Outcome
                </span>
                <span
                  className={`font-serif font-bold text-base uppercase ${
                    exp.outcome === 'winner'
                      ? 'text-emerald-700'
                      : exp.outcome === 'inconclusive'
                      ? 'text-zinc-600'
                      : 'text-amber-700'
                  }`}
                >
                  {exp.outcome}
                </span>
              </div>
            </div>

            {/* Control vs Variant Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-editorial-surface border border-editorial-border space-y-2">
                <span className="font-bold text-[10px] uppercase tracking-wider text-editorial-muted block">
                  Control Version
                </span>
                <p className="font-serif font-semibold text-editorial-text text-sm leading-snug">
                  {exp.control}
                </p>
                {exp.controlMetricValue !== undefined && (
                  <span className="text-editorial-muted font-mono block">
                    Result: <strong>{exp.controlMetricValue}%</strong> ({exp.metric})
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 space-y-2">
                <span className="font-bold text-[10px] uppercase tracking-wider text-brand-700 block">
                  Variant Version
                </span>
                <p className="font-serif font-semibold text-brand-950 text-sm leading-snug">
                  {exp.variant}
                </p>
                {exp.variantMetricValue !== undefined && (
                  <span className="text-brand-700 font-mono block font-semibold">
                    Result: <strong>{exp.variantMetricValue}%</strong> ({exp.metric})
                  </span>
                )}
              </div>
            </div>

            {/* Operational Decision */}
            {exp.decision && (
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 space-y-1">
                <span className="font-bold text-zinc-900 block">
                  Applied Operational Policy:
                </span>
                <p className="text-zinc-700 leading-relaxed">
                  {exp.decision}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
