import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { RecipeCard } from '@/components/recipe/recipe-card';
import { ExploreCategories } from '@/components/category/explore-categories';
import { db } from '@/lib/db/client';
import { PRIMARY_CATEGORIES } from '@/lib/config/categories.config';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'All Tested Recipes — Delicious & Easy Ideas',
  description:
    'Browse our full collection of foolproof weeknight dinners, 30-minute meals, air fryer classics, and comforting one-pot recipes.',
  canonicalPath: '/recipes',
});

export default async function RecipesIndexPage() {
  const recipes = await db.listPublishedRecipes(50);
  const categories = Object.values(PRIMARY_CATEGORIES);

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* Header Banner */}
      <div className="bg-editorial-surfaceAlt/60 border-b border-editorial-border py-8 sm:py-12">
        <Container size="xl">
          <Breadcrumbs items={[{ name: 'All Recipes', url: '/recipes' }]} />
          <div className="mt-4 max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Recipe Index
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-editorial-text tracking-tight">
              All Tested Recipes
            </h1>
            <p className="text-base sm:text-lg text-editorial-muted leading-relaxed">
              Explore our full recipe catalog. Every recipe is crafted with straightforward ingredients, clear timing, and tested step-by-step guidance.
            </p>
          </div>

          {/* Category Scroller */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-6 pb-2">
            <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-brand-500 text-white whitespace-nowrap shadow-sm">
              All ({recipes.length})
            </span>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white hover:bg-editorial-surface border border-editorial-border text-editorial-text whitespace-nowrap transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </Container>
      </div>

      {/* Recipe Grid */}
      <Container size="xl">
        <div className="flex items-center justify-between mb-8 border-b border-editorial-border pb-4">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-editorial-text">
            Complete Recipe Library
          </h2>
          <span className="text-xs font-semibold text-editorial-lightMuted">
            {recipes.length} recipes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              title={recipe.title}
              slug={recipe.slug}
              image={recipe.heroImage.url}
              imageAlt={recipe.heroImage.altText}
              category={recipe.primaryCategorySlug}
              description={recipe.shortDescription}
              totalTimeMinutes={recipe.totalTimeMinutes}
              servings={recipe.servings}
              difficulty={recipe.difficulty}
            />
          ))}
        </div>
      </Container>

      {/* Internal SEO Explore */}
      <ExploreCategories />
    </div>
  );
}
