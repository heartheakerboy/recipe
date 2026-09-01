import React from 'react';
import { verifyAdminSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { siteConfig } from '@/lib/config/site.config';
import { env } from '@/lib/config/env';
import { ShieldCheck, Database, Cloud, Sparkles, Key, CheckCircle2 } from 'lucide-react';

export default async function AdminSettingsPage() {
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="border-b border-editorial-border pb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text">
          CMS & System Settings
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted">
          Platform configurations, Cloudflare database bindings, and security parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand & Publication Settings */}
        <div className="p-6 bg-white rounded-3xl border border-editorial-border shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-editorial-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <span>Publication Profile</span>
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-editorial-muted block">Site Name:</span>
              <span className="font-semibold text-editorial-text">{siteConfig.name}</span>
            </div>
            <div>
              <span className="font-bold text-editorial-muted block">Domain:</span>
              <span className="font-mono text-editorial-text">{siteConfig.domain}</span>
            </div>
            <div>
              <span className="font-bold text-editorial-muted block">Tagline:</span>
              <span className="text-editorial-text">{siteConfig.tagline}</span>
            </div>
            <div>
              <span className="font-bold text-editorial-muted block">Author:</span>
              <span className="text-editorial-text">{siteConfig.author.name}</span>
            </div>
          </div>
        </div>

        {/* Database & Cloudflare Status */}
        <div className="p-6 bg-white rounded-3xl border border-editorial-border shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-editorial-text flex items-center gap-2">
            <Database className="w-5 h-5 text-brand-500" />
            <span>Cloudflare D1 & R2 Status</span>
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-editorial-muted">Database Engine:</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                D1 Active / SQLite Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-editorial-muted">R2 Storage Bucket:</span>
              <span className="font-mono text-editorial-text">{env.R2_BUCKET_NAME}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-editorial-muted">R2 CDN Endpoint:</span>
              <span className="font-mono text-editorial-text">{env.NEXT_PUBLIC_R2_PUBLIC_URL}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-editorial-muted">Environment:</span>
              <span className="font-semibold uppercase text-brand-600">{env.NODE_ENV}</span>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="p-6 bg-white rounded-3xl border border-editorial-border shadow-sm space-y-4 md:col-span-2">
          <h2 className="font-serif text-lg font-bold text-editorial-text flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-500" />
            <span>Owner Authentication & Security Architecture</span>
          </h2>
          <p className="text-xs text-editorial-muted leading-relaxed">
            All administrative routes are protected server-side with strict session verification. Public registration is permanently disabled. In production, set the <code className="bg-editorial-surface px-1.5 py-0.5 rounded font-mono text-brand-600">ADMIN_PASSWORD</code> environment variable to your preferred secret passphrase.
          </p>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Authenticated session is active. Public website only serves published recipes.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
