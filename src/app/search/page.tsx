'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon, ChefHat, X, Sparkles, ArrowRight } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { RecipeCard } from '@/components/recipe/recipe-card';
import { PRIMARY_CATEGORIES } from '@/lib/config/categories.config';
import { db } from '@/lib/db/client';
import { Recipe } from '@/lib/types/recipe';

const POPULAR_SEARCH_SUGGESTIONS = [
  'Chicken',
  'Garlic Butter',
  'Air Fryer',
  'Pasta',
  '30 Minute',
  'Salmon',
  'Pot Roast',
  'Gnocchi',
  'Pancakes',
];

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecipes() {
      setIsLoading(true);
      const all = await db.listPublishedRecipes(100);
      setRecipes(all);
      setIsLoading(false);
    }
    loadRecipes();
  }, []);

  const filteredRecipes = useMemo(() => {
    let result = recipes;

    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(
        (r) =>
          r.primaryCategorySlug === selectedCategory ||
          r.categorySlugs.includes(selectedCategory)
      );
    }

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.shortDescription.toLowerCase().includes(q) ||
          r.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          r.ingredients.some((ing) => ing.item.toLowerCase().includes(q))
      );
    }

    return result;
  }, [recipes, query, selectedCategory]);

  const categories = Object.values(PRIMARY_CATEGORIES);

  return (
    <div className="pb-24">
      {/* Header Search Banner */}
      <div className="bg-editorial-surfaceAlt/60 border-b border-editorial-border py-8 sm:py-12">
        <Container size="md">
          <Breadcrumbs items={[{ name: 'Search Recipes', url: '/search' }]} />

          <div className="mt-4 space-y-4">
            <h1 className="font-serif text-3xl sm:text-4xl font-black text-editorial-text tracking-tight">
              Search Recipes
            </h1>
            <p className="text-sm sm:text-base text-editorial-muted leading-relaxed">
              Find quick weeknight dinners, meal-prep staples, and family favorites by ingredient or keyword.
            </p>

            {/* Search Input Box */}
            <div className="relative pt-2">
              <SearchIcon className="w-5 h-5 text-editorial-lightMuted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none mt-1" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by ingredient, dish name, or keyword (e.g. chicken, pasta, air fryer)..."
                className="w-full rounded-2xl bg-white border-2 border-editorial-border hover:border-brand-500/50 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 pl-12 pr-12 py-4 text-base text-editorial-text shadow-sm transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Clear search input"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-editorial-lightMuted hover:text-editorial-text rounded-full hover:bg-editorial-surfaceAlt mt-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Popular Search Suggestion Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-editorial-lightMuted">
              <span className="font-semibold text-editorial-text flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                Popular:
              </span>
              {POPULAR_SEARCH_SUGGESTIONS.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-editorial-surface border border-editorial-border text-editorial-muted hover:text-brand-600 transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </div>

      <Container size="xl" className="mt-8">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-4 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`text-xs font-semibold px-4 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white hover:bg-editorial-surfaceAlt border border-editorial-border text-editorial-muted hover:text-editorial-text'
            }`}
          >
            All Categories ({recipes.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`text-xs font-semibold px-4 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.slug
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white hover:bg-editorial-surfaceAlt border border-editorial-border text-editorial-muted hover:text-editorial-text'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between border-b border-editorial-border pb-4 mb-8">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-editorial-text">
            {query ? (
              <span>
                Search Results for &ldquo;<span className="text-brand-600">{query}</span>&rdquo;
              </span>
            ) : selectedCategory !== 'all' ? (
              <span>
                Recipes in <span className="text-brand-600 capitalize">{selectedCategory.replace(/-/g, ' ')}</span>
              </span>
            ) : (
              <span>All Available Recipes</span>
            )}
          </h2>

          <span className="text-xs font-semibold text-editorial-lightMuted">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'} found
          </span>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-editorial-surfaceAlt rounded-2xl" />
            ))}
          </div>
        ) : filteredRecipes.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-editorial-border max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto">
              <ChefHat className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-editorial-text">
              No recipes found for &ldquo;{query}&rdquo;
            </h3>
            <p className="text-sm text-editorial-muted leading-relaxed">
              Try checking your spelling, using more general keywords like &ldquo;chicken&rdquo; or &ldquo;pasta&rdquo;, or browse our popular categories below.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => {
                  setQuery('');
                  setSelectedCategory('all');
                }}
                className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Clear Search Filters
              </button>
            </div>
          </div>
        ) : (
          /* Results Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredRecipes.map((recipe) => (
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
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-editorial-muted">
          Loading recipes...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
