import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PRIMARY_CATEGORIES } from '@/lib/config/categories.config';
import { Container } from '../layout/container';

const INTERNAL_SEARCH_TERMS = [
  { label: 'Easy Dinner Recipes', href: '/category/quick-and-easy' },
  { label: 'Chicken Recipes', href: '/category/chicken' },
  { label: 'Pasta Recipes', href: '/category/pasta' },
  { label: 'Air Fryer Recipes', href: '/category/air-fryer' },
  { label: '30-Minute Meals', href: '/category/30-minute-meals' },
  { label: 'Slow Cooker Recipes', href: '/category/slow-cooker' },
  { label: 'Dessert Recipes', href: '/category/desserts' },
  { label: 'Breakfast Recipes', href: '/category/breakfast' },
  { label: 'One-Pot Dinners', href: '/category/one-pot-meals' },
  { label: 'Beef Dinners', href: '/category/beef' },
  { label: 'Seasonal Recipes', href: '/category/seasonal-recipes' },
];

export function ExploreCategories() {
  return (
    <section className="bg-white border-y border-editorial-border py-12 sm:py-16">
      <Container size="xl">
        <div className="max-w-3xl mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Internal Directory</span>
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text">
            Explore FlavorNest by Category
          </h2>
          <p className="text-sm text-editorial-muted mt-2 leading-relaxed">
            Find the exact dinner idea you need by meal type, cooking technique, or main ingredient.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {INTERNAL_SEARCH_TERMS.map((term) => (
            <Link
              key={term.label}
              href={term.href}
              className="p-3.5 sm:p-4 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border/80 hover:border-brand-500/40 text-xs sm:text-sm font-semibold text-editorial-text hover:text-brand-600 transition-all flex items-center justify-between group shadow-sm"
            >
              <span>{term.label}</span>
              <ArrowRight className="w-3.5 h-3.5 text-editorial-lightMuted group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
