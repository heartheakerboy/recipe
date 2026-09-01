'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Users, Flame, ArrowRight, Sparkles } from 'lucide-react';
import { OptimizedImage } from '../common/optimized-image';
import { PinterestSaveButton } from '../common/pinterest-save-button';
import { formatDuration } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';

export type RecipeCardVariant =
  | 'standard'
  | 'featured'
  | 'compact'
  | 'horizontal'
  | 'pinterest-landing';

export interface RecipeCardProps {
  title: string;
  slug: string;
  image: string;
  imageAlt: string;
  category: string;
  description: string;
  prepTimeMinutes?: number;
  totalTimeMinutes?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  badge?: string;
  featured?: boolean;
  variant?: RecipeCardVariant;
  priorityImage?: boolean;
  className?: string;
  aspectRatioClass?: string;
}

export function RecipeCard({
  title,
  slug,
  image,
  imageAlt,
  category,
  description,
  totalTimeMinutes = 30,
  servings,
  difficulty,
  badge,
  featured = false,
  variant: propVariant,
  priorityImage = false,
  className,
  aspectRatioClass = 'aspect-[4/3]',
}: RecipeCardProps) {
  const variant: RecipeCardVariant = propVariant || (featured ? 'featured' : 'standard');
  const recipeUrl = `https://flavornest.xyz/recipes/${slug}/`;
  const displayCategory = category.replace(/-/g, ' ');

  // =========================================================================
  // VARIANT: COMPACT (Horizontal split thumbnail for sidebars/discovery rails)
  // =========================================================================
  if (variant === 'compact') {
    return (
      <article
        className={cn(
          'group flex items-center gap-3.5 bg-white rounded-2xl border border-editorial-border p-2.5 transition-all hover:border-editorial-borderStrong hover:shadow-xs',
          className
        )}
      >
        <Link href={`/recipes/${slug}/`} className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-zinc-900">
          <img
            src={image}
            alt={imageAlt || title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="flex-1 min-w-0 space-y-1">
          <Link
            href={`/category/${category}/`}
            className="text-[10px] font-bold uppercase tracking-wider text-brand-600 hover:underline block truncate"
          >
            {displayCategory}
          </Link>
          <h4 className="font-serif font-bold text-xs sm:text-sm text-editorial-text leading-snug truncate group-hover:text-brand-600 transition-colors">
            <Link href={`/recipes/${slug}/`}>{title}</Link>
          </h4>
          <div className="flex items-center gap-2 text-[10px] text-editorial-muted">
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3 text-editorial-lightMuted" />
              <span>{formatDuration(totalTimeMinutes)}</span>
            </span>
          </div>
        </div>
      </article>
    );
  }

  // =========================================================================
  // VARIANT: HORIZONTAL (Wide landscape editorial card)
  // =========================================================================
  if (variant === 'horizontal') {
    return (
      <article
        className={cn(
          'group grid grid-cols-1 sm:grid-cols-12 bg-white rounded-3xl border border-editorial-border overflow-hidden transition-all duration-300 hover:shadow-card hover:border-editorial-borderStrong',
          className
        )}
      >
        <div className="sm:col-span-5 relative aspect-[16/10] sm:aspect-auto overflow-hidden bg-zinc-900">
          <img
            src={image}
            alt={imageAlt || title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3 z-10">
            <PinterestSaveButton url={recipeUrl} media={image} description={title} size="sm" />
          </div>
        </div>
        <div className="sm:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <Link
                href={`/category/${category}/`}
                className="font-bold uppercase tracking-wider text-brand-600 hover:underline"
              >
                {displayCategory}
              </Link>
              <span className="text-[11px] font-semibold text-editorial-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-editorial-lightMuted" />
                <span>{formatDuration(totalTimeMinutes)}</span>
              </span>
            </div>
            <h3 className="font-serif text-xl font-bold text-editorial-text leading-tight group-hover:text-brand-600 transition-colors">
              <Link href={`/recipes/${slug}/`}>{title}</Link>
            </h3>
            <p className="text-xs sm:text-sm text-editorial-muted leading-relaxed line-clamp-2">
              {description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-editorial-border/60 text-xs">
            <span className="text-editorial-lightMuted font-medium">FlavorNest Original</span>
            <Link
              href={`/recipes/${slug}/`}
              className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View Recipe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // =========================================================================
  // VARIANT: PINTEREST LANDING (Optimized for Pinterest referral traffic)
  // =========================================================================
  if (variant === 'pinterest-landing') {
    return (
      <article
        className={cn(
          'group relative flex flex-col bg-white rounded-3xl border-2 border-brand-200 overflow-hidden shadow-card transition-all hover:border-brand-400',
          className
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
          <img
            src={image}
            alt={imageAlt || title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-brand-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
            ★ {totalTimeMinutes} Mins
          </div>
          <div className="absolute top-3 right-3 z-10">
            <PinterestSaveButton url={recipeUrl} media={image} description={title} size="sm" />
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
              {displayCategory}
            </span>
            <h3 className="font-serif text-lg font-bold text-editorial-text leading-snug group-hover:text-brand-600 transition-colors">
              <Link href={`/recipes/${slug}/`}>{title}</Link>
            </h3>
            <p className="text-xs text-editorial-muted line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>

          <Link
            href={`/recipes/${slug}/#recipe-card`}
            className="w-full py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Jump to Recipe Card</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </article>
    );
  }

  // =========================================================================
  // VARIANT: FEATURED (Large dominant hero card)
  // =========================================================================
  if (variant === 'featured') {
    return (
      <article
        className={cn(
          'group relative flex flex-col md:flex-row bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-editorial-borderStrong',
          className
        )}
      >
        <div className="relative w-full md:w-7/12 aspect-[16/10] md:aspect-auto overflow-hidden bg-zinc-900 shrink-0">
          <img
            src={image}
            alt={imageAlt || title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-brand-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-md">
            ★ Featured Recipe
          </div>
          <div className="absolute top-4 right-4 z-10">
            <PinterestSaveButton url={recipeUrl} media={image} description={title} size="md" />
          </div>
        </div>

        <div className="p-6 sm:p-8 md:w-5/12 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <Link
                href={`/category/${category}/`}
                className="font-bold uppercase tracking-wider text-brand-600 hover:underline"
              >
                {displayCategory}
              </Link>
              <span className="text-editorial-lightMuted">•</span>
              <span className="font-semibold text-editorial-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-editorial-lightMuted" />
                <span>{formatDuration(totalTimeMinutes)}</span>
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text leading-tight group-hover:text-brand-600 transition-colors">
              <Link href={`/recipes/${slug}/`}>{title}</Link>
            </h2>

            <p className="text-sm text-editorial-muted leading-relaxed line-clamp-3">
              {description}
            </p>
          </div>

          <div className="pt-3 border-t border-editorial-border flex items-center justify-between">
            <Link
              href={`/recipes/${slug}/`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <span>Get Full Recipe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // =========================================================================
  // VARIANT: STANDARD (Default vertical card)
  // =========================================================================
  return (
    <article
      className={cn(
        'group relative flex flex-col bg-white rounded-3xl border border-editorial-border overflow-hidden transition-all duration-300 hover:shadow-card hover:border-editorial-borderStrong hover:-translate-y-1',
        className
      )}
    >
      <div className={cn('relative w-full overflow-hidden bg-zinc-900 shrink-0', aspectRatioClass)}>
        <img
          src={image}
          alt={imageAlt || title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {badge && (
          <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-zinc-900 text-[10px] font-bold uppercase tracking-wider shadow-sm">
            {badge}
          </div>
        )}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <PinterestSaveButton url={recipeUrl} media={image} description={title} size="sm" />
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <Link
              href={`/category/${category}/`}
              className="font-bold uppercase tracking-wider text-brand-600 hover:underline"
            >
              {displayCategory}
            </Link>
            <span className="text-[11px] font-semibold text-editorial-muted flex items-center gap-1">
              <Clock className="w-3 h-3 text-editorial-lightMuted" />
              <span>{formatDuration(totalTimeMinutes)}</span>
            </span>
          </div>

          <h3 className="font-serif text-base sm:text-lg font-bold text-editorial-text leading-snug group-hover:text-brand-600 transition-colors">
            <Link href={`/recipes/${slug}/`}>{title}</Link>
          </h3>

          <p className="text-xs text-editorial-muted line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="pt-2 border-t border-editorial-border/60 flex items-center justify-between text-[11px] text-editorial-muted">
          <span>{servings ? `${servings} servings` : 'Easy prep'}</span>
          <Link
            href={`/recipes/${slug}/`}
            className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View Recipe</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
