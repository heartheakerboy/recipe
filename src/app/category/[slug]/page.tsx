import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Sparkles, Clock, Utensils } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { RecipeCard } from '@/components/recipe/recipe-card';
import { FeaturedRecipe } from '@/components/recipe/featured-recipe';
import { CategoryCard } from '@/components/category/category-card';
import { db } from '@/lib/db/client';
import { PRIMARY_CATEGORIES } from '@/lib/config/categories.config';
import { constructMetadata } from '@/lib/seo/metadata';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await db.getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Category Not Found | FlavorNest',
      robots: { index: false, follow: false },
    };
  }

  const recipes = await db.listRecipesByCategory(category.slug, 5);
  const isEmpty = recipes.length === 0;

  return constructMetadata({
    title: `${category.name} Recipes — Easy & Delicious Ideas`,
    description: category.description,
    canonicalPath: `/category/${category.slug}/`,
    noIndex: isEmpty,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await db.getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const recipes = await db.listRecipesByCategory(category.slug, 50);
  const featuredCategoryRecipe = recipes[0] || null;
  const otherCategoryRecipes = recipes.slice(1);

  // Filter 30-min recipes in this category if available
  const quickCategoryRecipes = recipes.filter((r) => r.totalTimeMinutes <= 30);

  // Other related categories
  const relatedCategories = Object.values(PRIMARY_CATEGORIES)
    .filter((c) => c.slug !== category.slug)
    .slice(0, 4);

  return (
    <div className="space-y-12 sm:space-y-16 pb-24">
      {/* Category Hero Banner */}
      <div className="bg-editorial-surfaceAlt/60 border-b border-editorial-border py-8 sm:py-12">
        <Container size="xl">
          <Breadcrumbs
            items={[
              { name: 'Categories', url: '/recipes' },
              { name: category.name, url: `/category/${category.slug}` },
            ]}
          />

          <div className="mt-4 max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Recipe Category
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-editorial-text tracking-tight">
              {category.name} Recipes
            </h1>
            <p className="text-base sm:text-lg text-editorial-muted leading-relaxed">
              {category.description}
            </p>
          </div>

          {/* Subcategory & Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-6 pb-2">
            <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-brand-500 text-white whitespace-nowrap shadow-sm">
              All {category.name} ({recipes.length})
            </span>
            <Link
              href="/category/30-minute-meals"
              className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white hover:bg-editorial-surface border border-editorial-border text-editorial-text whitespace-nowrap transition-colors"
            >
              30-Minute Meals
            </Link>
            <Link
              href="/category/quick-and-easy"
              className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white hover:bg-editorial-surface border border-editorial-border text-editorial-text whitespace-nowrap transition-colors"
            >
              Quick & Easy
            </Link>
            <Link
              href="/category/air-fryer"
              className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white hover:bg-editorial-surface border border-editorial-border text-editorial-text whitespace-nowrap transition-colors"
            >
              Air Fryer
            </Link>
            <Link
              href="/category/one-pot-meals"
              className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white hover:bg-editorial-surface border border-editorial-border text-editorial-text whitespace-nowrap transition-colors"
            >
              One-Pot
            </Link>
          </div>
        </Container>
      </div>

      {/* Featured Recipe in Category */}
      {featuredCategoryRecipe && (
        <section>
          <Container size="xl">
            <FeaturedRecipe recipe={featuredCategoryRecipe} />
          </Container>
        </section>
      )}

      {/* Popular Recipes in Category */}
      <section>
        <Container size="xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
                Collection Grid
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text">
                Popular {category.name} Dishes
              </h2>
            </div>
            <span className="text-xs font-semibold text-editorial-lightMuted">
              Showing {recipes.length} recipes
            </span>
          </div>

          {recipes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-editorial-border p-8">
              <h3 className="font-serif text-xl font-bold text-editorial-text mb-2">
                New recipes cooking up soon!
              </h3>
              <p className="text-sm text-editorial-muted max-w-md mx-auto">
                Our test kitchen is currently crafting fresh {category.name.toLowerCase()} recipes.
              </p>
            </div>
          ) : (
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
          )}
        </Container>
      </section>

      {/* Related Categories Grid */}
      <section className="bg-editorial-surfaceAlt/60 border-y border-editorial-border py-14 sm:py-16">
        <Container size="xl">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
              Explore More Categories
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text">
              More Recipe Categories
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedCategories.map((cat) => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
