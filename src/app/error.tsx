'use client';

import React, { useEffect } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';
import { Container } from '@/components/layout/container';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App runtime error caught by boundary:', error);
  }, [error]);

  const isServerActionMismatch =
    error.message?.includes('was not found on the server') ||
    error.message?.includes('failed-to-find-server-action');

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16">
      <Container size="sm" className="text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
            {isServerActionMismatch ? 'New App Version Available' : 'Something Went Wrong'}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-editorial-text">
            {isServerActionMismatch ? 'Please Reload This Page' : 'Unable to Load This Page'}
          </h1>
          <p className="text-sm sm:text-base text-editorial-muted max-w-md mx-auto leading-relaxed">
            {isServerActionMismatch
              ? 'A fresh update was just deployed to the server. Your browser needs a quick reload to synchronize with the new server actions.'
              : 'We encountered an unexpected error while loading this recipe or resource. Please try refreshing or return to the homepage.'}
          </p>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              if (isServerActionMismatch) {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isServerActionMismatch ? 'Reload Page Now' : 'Try Again'}</span>
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-editorial-surfaceAlt text-editorial-text border border-editorial-border font-semibold text-sm inline-flex items-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </Container>
    </div>
  );
}
