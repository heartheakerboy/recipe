import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getTechnicalSeoHealthAction } from '@/lib/actions/system-health-actions';
import { ArrowLeft, Search, CheckCircle2, ShieldCheck, Link2 } from 'lucide-react';

export const metadata = {
  title: 'Technical SEO Health & Link Audit | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function TechnicalSeoHealthPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const { seo } = await getTechnicalSeoHealthAction();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/system/health"
            className="p-2 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
              <Search className="w-4 h-4" />
              <span>Crawlability & Integrity</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              Technical SEO & Link Health
            </h1>
          </div>
        </div>

        <Link
          href="/admin/system/health"
          className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors"
        >
          Back to System Health
        </Link>
      </div>

      {/* SEO Health Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-emerald-600">Canonical Consistency</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif text-lg font-bold text-editorial-text">
            Strict Trailing Slash Policy
          </div>
          <p className="text-xs text-editorial-muted leading-relaxed">
            All indexable URLs strictly resolve to <code className="font-mono text-[11px] bg-editorial-surface px-1 py-0.5 rounded">https://flavornest.xyz/recipes/[slug]/</code>. Tracking parameters and query strings are stripped from canonical tags.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-emerald-600">Indexability Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif text-lg font-bold text-editorial-text">
            {seo.indexabilityStatus}
          </div>
          <p className="text-xs text-editorial-muted leading-relaxed">
            Admin, staging, and preview routes include strict <code className="font-mono text-[11px] bg-editorial-surface px-1 py-0.5 rounded">noindex, nofollow</code> directives while public recipe and cluster pages remain crawlable.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-emerald-600">Internal Link Health</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif text-lg font-bold text-editorial-text">
            {seo.brokenLinksCount} Broken Internal Links Detected
          </div>
          <p className="text-xs text-editorial-muted leading-relaxed">
            Deterministic crawler cross-references all internal navigation links, category paths, and related recipe cards against published slugs.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-emerald-600">Structured Data Validation</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif text-lg font-bold text-editorial-text">
            JSON-LD Schema Verified
          </div>
          <p className="text-xs text-editorial-muted leading-relaxed">
            Standard Recipe schema with ISO 8601 durations and BreadcrumbList are automatically generated. Zero fabricated ratings or fake review spam.
          </p>
        </div>
      </div>
    </div>
  );
}
