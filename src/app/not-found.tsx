import React from 'react';
import Link from 'next/link';
import { ChefHat, ArrowRight, Home, Search } from 'lucide-react';
import { Container } from '@/components/layout/container';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16">
      <Container size="sm" className="text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto shadow-sm border border-brand-100">
          <ChefHat className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">404 Error</span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-editorial-text tracking-tight">
            Looks Like This Recipe Got Lost.
          </h1>
          <p className="text-base sm:text-lg text-editorial-muted max-w-md mx-auto leading-relaxed">
            Let&rsquo;s get you back to something delicious.
          </p>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/recipes"
            className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <span>Browse Recipes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-white hover:bg-editorial-surfaceAlt text-editorial-text border border-editorial-border font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
        </div>
      </Container>
    </div>
  );
}
