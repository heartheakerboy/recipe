'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { subscribeNewsletterAction } from '@/lib/actions/newsletter-actions';

export function NewsletterBox() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await subscribeNewsletterAction(email);
      if (res.success && res.message) {
        setResult({ success: true, message: res.message });
        setEmail('');
      } else {
        setResult({ success: false, message: res.error || 'Subscription failed' });
      }
    } catch {
      setResult({ success: false, message: 'Server connection error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-editorial-surfaceAlt/70 rounded-3xl border border-editorial-border p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6 shadow-xs font-sans">
      <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto shadow-xs">
        <Mail className="w-6 h-6" />
      </div>

      <div className="space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
          The FlavorNest Table
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text">
          Fresh Recipe Inspiration in Your Inbox
        </h3>
        <p className="text-sm text-editorial-muted leading-relaxed">
          Join home cooks who receive our tested 30-minute dinners, seasonal recipes, and weeknight cooking tips. No spam, ever.
        </p>
      </div>

      {result ? (
        <div
          className={`p-4 rounded-2xl max-w-md mx-auto text-xs font-semibold flex items-center justify-center gap-2 ${
            result.success
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{result.message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2.5 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address..."
            className="w-full px-4 py-3 rounded-2xl bg-white border border-editorial-border text-xs text-editorial-text placeholder:text-editorial-lightMuted focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
          />
          <button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-50 text-white font-bold text-xs shrink-0 shadow-sm transition-all cursor-pointer"
          >
            {isSubmitting ? 'Joining...' : 'Subscribe'}
          </button>
        </form>
      )}

      <p className="text-[10px] text-editorial-lightMuted">
        We respect your privacy. You can unsubscribe anytime with one click.
      </p>
    </section>
  );
}
