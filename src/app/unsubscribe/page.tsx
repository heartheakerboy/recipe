import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { unsubscribeByTokenAction } from '@/lib/actions/newsletter-mgmt-actions';

interface UnsubscribePageProps {
  searchParams: Promise<{ token?: string }>;
}

export const metadata = {
  title: 'Unsubscribe | FlavorNest',
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const params = await searchParams;
  const token = params.token;

  let message = 'You have been unsubscribed from FlavorNest emails.';
  let success = true;

  if (token) {
    const res = await unsubscribeByTokenAction(token);
    if (!res.success) {
      message = res.message;
      success = false;
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 font-sans">
      <div className="max-w-md w-full rounded-3xl bg-white border border-editorial-border p-8 sm:p-10 text-center shadow-xs space-y-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${success ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-editorial-text">
            {success ? 'Unsubscribed' : 'Unsubscribe Status'}
          </h1>
          <p className="text-xs sm:text-sm text-editorial-muted leading-relaxed">
            {message}
          </p>
        </div>

        <p className="text-xs text-editorial-lightMuted">
          You can always resubscribe voluntarily on any recipe page if you ever change your mind.
        </p>

        <div className="pt-4 border-t border-editorial-border">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to FlavorNest</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
