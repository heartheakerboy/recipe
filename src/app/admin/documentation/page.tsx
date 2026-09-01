import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import {
  BookOpen,
  ArrowLeft,
  ChefHat,
  Sparkles,
  Flame,
  Mail,
  DollarSign,
  Server,
  ShieldCheck,
} from 'lucide-react';

export const metadata = {
  title: 'Standard Operating Manual & Architecture | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function DocumentationPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

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
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>Standard Operating Procedures (SOPs)</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              FlavorNest Operational Manual & Tech Stack
            </h1>
          </div>
        </div>

        <Link
          href="/admin/flip"
          className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors"
        >
          Flip Readiness Hub
        </Link>
      </div>

      <div className="space-y-6">
        {/* Section 1: Content Pipeline */}
        <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-brand-600">
            <ChefHat className="w-5 h-5" />
            <h3 className="font-serif font-bold text-lg text-editorial-text">
              1. Editorial Content & Recipe Creation SOP
            </h3>
          </div>
          <p className="text-xs text-editorial-muted leading-relaxed">
            Recipes originate through the <strong>Recipe Importer</strong> (/admin/recipes/import) or the <strong>Content Opportunity Engine</strong> (/admin/content). The system extracts factual Recipe DNA (times, ingredients, temperatures), locks facts to prevent hallucinations, and applies one of 4 editorial styles. Drafts pass through automated consistency validation before human approval.
          </p>
        </div>

        {/* Section 2: Image Generation */}
        <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-serif font-bold text-lg text-editorial-text">
              2. FLUX AI Food Photography & R2 Storage
            </h3>
          </div>
          <p className="text-xs text-editorial-muted leading-relaxed">
            Images are synthesized using configured FLUX image presets designed specifically for culinary realism. Images are uploaded to Cloudflare R2 under <code className="bg-editorial-surface px-1.5 py-0.5 rounded font-mono text-[11px]">recipes/[slug]/hero-[timestamp].webp</code> and served globally via edge CDN with zero origin egress fees.
          </p>
        </div>

        {/* Section 3: Pinterest Distribution */}
        <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-rose-600">
            <Flame className="w-5 h-5" />
            <h3 className="font-serif font-bold text-lg text-editorial-text">
              3. Pinterest Creative Studio & API Publishing
            </h3>
          </div>
          <p className="text-xs text-editorial-muted leading-relaxed">
            Published recipes are turned into high-converting 2:3 vertical Pinterest pins using 4 editorial templates (Hero, Split, Minimal, Bold). Creatives enter the queue at /admin/pinterest/queue, validate against pre-publish checklists, and publish directly to Pinterest boards via API v5.
          </p>
        </div>

        {/* Section 4: Audience Retention */}
        <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-purple-600">
            <Mail className="w-5 h-5" />
            <h3 className="font-serif font-bold text-lg text-editorial-text">
              4. Newsletter Digests & Returning Visitor Engine
            </h3>
          </div>
          <p className="text-xs text-editorial-muted leading-relaxed">
            Subscribers enter through post-recipe forms. The system handles duplicate prevention, privacy masking in admin views, automated recipe digests with UTM attribution, and tokenized 1-click unsubscribes via Resend.
          </p>
        </div>

        {/* Section 5: Technical Infrastructure & Backups */}
        <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-sky-600">
            <Server className="w-5 h-5" />
            <h3 className="font-serif font-bold text-lg text-editorial-text">
              5. Cloudflare D1 & R2 Deployment Architecture
            </h3>
          </div>
          <p className="text-xs text-editorial-muted leading-relaxed">
            FlavorNest runs on Next.js App Router deployed to Cloudflare Workers / Pages. Database queries are distributed on Cloudflare D1 with automatic global read replication. Media assets reside on Cloudflare R2. Backups rely on Cloudflare continuous point-in-time recovery and snapshot exports.
          </p>
        </div>
      </div>
    </div>
  );
}
