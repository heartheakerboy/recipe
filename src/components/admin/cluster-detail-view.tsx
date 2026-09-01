'use client';

import React from 'react';
import Link from 'next/link';
import {
  Layers,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChefHat,
} from 'lucide-react';
import {
  ContentCluster,
  ClusterRecipeMember,
  ContentOpportunity,
} from '@/lib/types/content-cluster';

interface ClusterDetailViewProps {
  cluster: ContentCluster;
  members: ClusterRecipeMember[];
  opportunities: ContentOpportunity[];
}

export function ClusterDetailView({
  cluster,
  members,
  opportunities,
}: ClusterDetailViewProps) {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/content/clusters"
            className="p-2 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
              <Layers className="w-4 h-4" />
              <span>Pillar Cluster Details</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              {cluster.name}
            </h1>
          </div>
        </div>

        <Link
          href="/admin/content/generation"
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Queue New Recipe</span>
        </Link>
      </div>

      {/* Cluster Metadata Card */}
      <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-editorial-border pb-4 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
              Primary Theme
            </span>
            <span className="font-bold text-base text-editorial-text">
              {cluster.primaryTopic}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">
              Catalog Coverage
            </span>
            <span className="font-bold text-base text-emerald-700">
              {cluster.coveragePct}% ({members.length}/{cluster.targetCount})
            </span>
          </div>
        </div>

        <p className="text-xs text-editorial-muted leading-relaxed">
          {cluster.description}
        </p>
      </div>

      {/* Member Recipes */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-editorial-text">
              Cluster Recipes & Roles
            </h3>
            <p className="text-xs text-editorial-muted">
              Pillar recipes provide core topical authority; supporting recipes capture long-tail search intent.
            </p>
          </div>
          <span className="text-xs text-editorial-muted font-medium">
            {members.length} active dishes
          </span>
        </div>

        <div className="divide-y divide-editorial-border">
          {members.map((m) => (
            <div key={m.recipeId} className="p-5 flex items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      m.role === 'primary'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-editorial-surface text-editorial-muted border border-editorial-border'
                    }`}
                  >
                    {m.role} dish
                  </span>
                  <span className="font-mono text-[10px] text-editorial-lightMuted">
                    /recipes/{m.recipeSlug}/
                  </span>
                </div>

                <h4 className="font-serif font-bold text-sm text-editorial-text">
                  {m.recipeTitle}
                </h4>
              </div>

              <Link
                href={`/recipes/${m.recipeSlug}/`}
                target="_blank"
                className="px-3 py-1.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors flex items-center gap-1"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Missing Cluster Gaps */}
      {opportunities.length > 0 && (
        <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
          <div className="p-6 border-b border-editorial-border">
            <h3 className="font-serif text-base font-bold text-editorial-text">
              Identified Cluster Gaps
            </h3>
            <p className="text-xs text-editorial-muted">
              Topics needed to complete this cluster and maximize internal linking equity.
            </p>
          </div>

          <div className="divide-y divide-editorial-border">
            {opportunities.map((opp) => (
              <div key={opp.id} className="p-5 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">
                      Gap Opportunity
                    </span>
                    <span className="font-serif font-bold text-sm text-editorial-text">
                      {opp.topic}
                    </span>
                  </div>
                  <p className="text-xs text-editorial-muted">
                    {opp.recommendation}
                  </p>
                </div>

                <Link
                  href="/admin/content/generation"
                  className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-colors shrink-0"
                >
                  Generate Brief
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
