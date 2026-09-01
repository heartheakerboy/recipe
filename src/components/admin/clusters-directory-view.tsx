'use client';

import React from 'react';
import Link from 'next/link';
import {
  Layers,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { ContentCluster } from '@/lib/types/content-cluster';

interface ClustersDirectoryViewProps {
  clusters: ContentCluster[];
}

export function ClustersDirectoryView({ clusters }: ClustersDirectoryViewProps) {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/content"
            className="p-2 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
              <Layers className="w-4 h-4" />
              <span>Thematic Pillar Hubs</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              Topical Content Clusters
            </h1>
          </div>
        </div>

        <Link
          href="/admin/content"
          className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors"
        >
          Back to Strategy
        </Link>
      </div>

      {/* Clusters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clusters.map((cluster) => (
          <div
            key={cluster.id}
            className="bg-white rounded-3xl border border-editorial-border p-6 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    cluster.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {cluster.status}
                </span>
                <span className="text-[10px] font-bold text-editorial-lightMuted uppercase">
                  {cluster.priority} Priority
                </span>
              </div>

              <h3 className="font-serif font-bold text-lg text-editorial-text">
                {cluster.name}
              </h3>

              <p className="text-xs text-editorial-muted line-clamp-2 leading-relaxed">
                {cluster.description}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-editorial-border text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-editorial-muted font-medium">Coverage Progress</span>
                <span className="font-bold text-editorial-text">
                  {cluster.recipeCount} / {cluster.targetCount} Recipes ({cluster.coveragePct}%)
                </span>
              </div>

              <div className="w-full bg-editorial-surface rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full transition-all"
                  style={{ width: `${cluster.coveragePct}%` }}
                />
              </div>

              <Link
                href={`/admin/content/clusters/${cluster.id}`}
                className="w-full py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Cluster Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
