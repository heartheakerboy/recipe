import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Recipe } from '@/lib/types/recipe';
import { RecipeCard } from './recipe-card';

interface RelatedRecipesProps {
  recipes: Recipe[];
  categorySlug?: string;
  categoryName?: string;
}

export function RelatedRecipes({ recipes, categorySlug, categoryName }: RelatedRecipesProps) {
  if (!recipes || recipes.length === 0) return null;

  return (
    <section className="space-y-6 pt-10 border-t border-editorial-border">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>More Inspiration</span>
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text">
            You Might Also Love
          </h2>
        </div>

        {categorySlug && (
          <Link
            href={`/category/${categorySlug}`}
            className="text-xs sm:text-sm font-semibold text-brand-500 hover:text-brand-600 inline-flex items-center gap-1 shrink-0"
          >
            <span>See more {categoryName || categorySlug.replace(/-/g, ' ')} recipes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((r) => (
          <RecipeCard
            key={r.id}
            title={r.title}
            slug={r.slug}
            image={r.heroImage.url}
            imageAlt={r.heroImage.altText}
            category={r.primaryCategorySlug}
            description={r.shortDescription}
            totalTimeMinutes={r.totalTimeMinutes}
            servings={r.servings}
            difficulty={r.difficulty}
          />
        ))}
      </div>
    </section>
  );
}
