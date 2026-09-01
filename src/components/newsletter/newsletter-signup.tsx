'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { SubscriberSource } from '@/lib/types/newsletter';
import { subscribeWithSourceAction } from '@/lib/actions/newsletter-mgmt-actions';

interface NewsletterSignupProps {
  source?: SubscriberSource;
  title?: string;
  description?: string;
  className?: string;
}

export function NewsletterSignup({
  source = 'recipe_page',
  title = 'Get easy dinner ideas straight to your inbox.',
  description = 'Simple recipes, useful kitchen tips, and newly tested FlavorNest favorites. No spam, unsubscribe anytime.',
  className = '',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus('loading');
    try {
      const res = await subscribeWithSourceAction(email, source, true);
      setMessage(res.message);
      setStatus(res.success ? 'success' : 'error');
      if (res.success) setEmail('');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again later.');
    }
  };

  return (
    <div
      className={`rounded-3xl bg-editorial-surface/80 border border-editorial-border p-6 sm:p-8 text-center max-w-xl mx-auto my-10 font-sans shadow-xs ${className}`}
    >
      <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-3">
        <Mail className="w-5 h-5" />
      </div>

      <h3 className="font-serif text-xl sm:text-2xl font-bold text-editorial-text">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-editorial-muted max-w-md mx-auto mt-2 leading-relaxed">
        {description}
      </p>

      {status === 'success' ? (
        <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 px-4 py-3 rounded-xl bg-white border border-editorial-border text-xs text-editorial-text placeholder:text-editorial-lightMuted focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>{status === 'loading' ? 'Joining...' : 'Get Recipes'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className="text-xs text-rose-600 font-semibold mt-3 animate-in fade-in">
          {message}
        </p>
      )}
    </div>
  );
}
