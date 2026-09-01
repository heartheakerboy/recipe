'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sliders,
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { EmailProviderSettings } from '@/lib/types/newsletter';
import { updateEmailSettingsAction } from '@/lib/actions/newsletter-mgmt-actions';

interface EmailSettingsFormProps {
  initialSettings: EmailProviderSettings;
}

export function EmailSettingsForm({ initialSettings }: EmailSettingsFormProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<EmailProviderSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);

    try {
      const res = await updateEmailSettingsAction(settings);
      if (res.success) {
        setNotification({ type: 'success', text: 'Email provider settings saved!' });
        router.refresh();
      }
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Failed to update settings' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/audience"
            className="p-2 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>Email Configuration</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              Email Provider Settings
            </h1>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Provider Selector */}
      <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs space-y-5">
        <h3 className="font-serif text-base font-bold text-editorial-text border-b border-editorial-border pb-3">
          1. Active Dispatch Service
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="p-4 rounded-2xl border border-editorial-border hover:bg-editorial-surface flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="provider"
              value="resend"
              checked={settings.provider === 'resend'}
              onChange={() => setSettings((s) => ({ ...s, provider: 'resend' }))}
              className="mt-0.5 text-brand-600 focus:ring-brand-500"
            />
            <div className="space-y-1">
              <span className="font-bold text-sm text-editorial-text block">
                Resend API
              </span>
              <p className="text-xs text-editorial-muted">
                Modern developer-first email platform with high inbox deliverability.
              </p>
            </div>
          </label>

          <label className="p-4 rounded-2xl border border-editorial-border hover:bg-editorial-surface flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="provider"
              value="mock"
              checked={settings.provider === 'mock'}
              onChange={() => setSettings((s) => ({ ...s, provider: 'mock' }))}
              className="mt-0.5 text-brand-600 focus:ring-brand-500"
            />
            <div className="space-y-1">
              <span className="font-bold text-sm text-editorial-text block">
                Development Mock Service
              </span>
              <p className="text-xs text-editorial-muted">
                Safe local environment logger that never dispatches real external emails.
              </p>
            </div>
          </label>
        </div>

        {settings.provider === 'resend' && (
          <div className="max-w-md space-y-1.5 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text">
              Resend API Key
            </label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings((s) => ({ ...s, apiKey: e.target.value }))}
              placeholder="re_••••••••••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border font-mono text-xs text-editorial-text"
            />
          </div>
        )}
      </div>

      {/* Sender Information */}
      <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-serif text-base font-bold text-editorial-text border-b border-editorial-border pb-3">
          2. Sender Identity
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text">
              Sender Name
            </label>
            <input
              type="text"
              required
              value={settings.fromName}
              onChange={(e) => setSettings((s) => ({ ...s, fromName: e.target.value }))}
              placeholder="FlavorNest Kitchen"
              className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs text-editorial-text"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text">
              Sender Email Address
            </label>
            <input
              type="email"
              required
              value={settings.fromEmail}
              onChange={(e) => setSettings((s) => ({ ...s, fromEmail: e.target.value }))}
              placeholder="recipes@flavornest.xyz"
              className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border font-mono text-xs text-editorial-text"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
