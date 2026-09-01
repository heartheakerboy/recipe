import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Clock, Flame, Utensils, BookOpen, Layers } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { RecipeCard } from '@/components/recipe/recipe-card';
import { NewsletterBox } from '@/components/home/newsletter-box';
import { PRIMARY_CATEGORIES } from '@/lib/config/categories.config';
import { recipeRepository } from '@/lib/repositories/recipe.repository';
import { collectionRepository } from '@/lib/repositories/collection.repository';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata = constructMetadata({
  title: 'FlavorNest — Simple Recipes. Big Flavor.',
  description:
    'Good food, made beautifully simple. Discover tested 30-minute dinners, comforting skillet meals, and easy family favorites.',
  canonicalPath: '/',
});

export default async function HomePage() {
  const { recipes: publishedRecipes } = await recipeRepository.list({
    status: 'published',
    limit: 50,
  });

  const collections = await collectionRepository.list({ status: 'published', limit: 3 });

  const featuredRecipe = publishedRecipes[0] || null;
  const quickAndEasy = publishedRecipes.filter((r) => r.totalTimeMinutes <= 30).slice(0, 4);
  const dinnerRecipes = publishedRecipes.filter((r) => r.primaryCategorySlug === 'dinner' || r.primaryCategorySlug === 'chicken' || r.primaryCategorySlug === 'pasta').slice(0, 3);
  const latestRecipes = publishedRecipes.slice(0, 6);

  const topCategories = [
    PRIMARY_CATEGORIES.chicken,
    PRIMARY_CATEGORIES.pasta,
    PRIMARY_CATEGORIES['quick-and-easy'],
    PRIMARY_CATEGORIES.desserts,
    PRIMARY_CATEGORIES['one-pot-meals'],
    PRIMARY_CATEGORIES.breakfast,
  ].filter(Boolean);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 font-sans">
      {/* =========================================================================
          1. EDITORIAL HERO SECTION
         ========================================================================= */}
      <section className="relative bg-gradient-to-b from-editorial-surfaceAlt/70 via-editorial-surface to-white pt-10 sm:pt-16 pb-12 sm:pb-18 border-b border-editorial-border">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Modern Food Editorial & Tested Recipes</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-editorial-text leading-[1.12] tracking-tight">
                Good food, made <br />
                <span className="text-brand-500 italic">beautifully simple.</span>
              </h1>

              <p className="text-base sm:text-lg text-editorial-muted leading-relaxed max-w-xl mx-auto lg:mx-0">
                Approachable, flavorful recipes designed for busy weeknights, relaxed family gatherings, and everyday home cooking.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
                <Link
                  href="/recipes/"
                  className="px-6 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs shadow-sm transition-all inline-flex items-center gap-2"
                >
                  <span>Explore All Recipes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/category/dinner/"
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-editorial-surfaceAlt text-editorial-text border border-editorial-border font-bold text-xs transition-all shadow-xs"
                >
                  <span>Quick & Easy Dinners</span>
                </Link>
              </div>
            </div>

            {/* Right Food Showcase */}
            <div className="lg:col-span-6">
              {featuredRecipe && (
                <RecipeCard
                  title={featuredRecipe.title}
                  slug={featuredRecipe.slug}
                  image={featuredRecipe.heroImage?.url}
                  imageAlt={featuredRecipe.heroImage?.altText || featuredRecipe.title}
                  category={featuredRecipe.primaryCategorySlug}
                  description={featuredRecipe.shortDescription}
                  totalTimeMinutes={featuredRecipe.totalTimeMinutes}
                  servings={featuredRecipe.servings}
                  difficulty={featuredRecipe.difficulty}
                  variant="featured"
                  priorityImage
                />
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          2. FEATURED RECIPES EDITORIAL GRID
         ========================================================================= */}
      <section>
        <Container size="xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 border-b border-editorial-border pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block mb-1">
                Editor&rsquo;s Table
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text">
                Featured Dinner Ideas
              </h2>
            </div>
            <Link
              href="/recipes/"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              <span>Browse All Recipes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dinnerRecipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                title={recipe.title}
                slug={recipe.slug}
                image={recipe.heroImage?.url}
                imageAlt={recipe.heroImage?.altText || recipe.title}
                category={recipe.primaryCategorySlug}
                description={recipe.shortDescription}
                totalTimeMinutes={recipe.totalTimeMinutes}
                servings={recipe.servings}
                difficulty={recipe.difficulty}
                variant={index === 0 ? 'standard' : 'standard'}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          3. QUICK & EASY SECTION (<=30 MIN MEALS)
         ========================================================================= */}
      {quickAndEasy.length > 0 && (
        <section className="bg-editorial-surfaceAlt/40 py-12 sm:py-16 border-y border-editorial-border">
          <Container size="xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block mb-1">
                  Speed & Simplicity
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text flex items-center gap-2">
                  <Clock className="w-6 h-6 text-brand-500" />
                  <span>30-Minute Weeknight Dinners</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickAndEasy.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  title={recipe.title}
                  slug={recipe.slug}
                  image={recipe.heroImage?.url}
                  imageAlt={recipe.heroImage?.altText || recipe.title}
                  category={recipe.primaryCategorySlug}
                  description={recipe.shortDescription}
                  totalTimeMinutes={recipe.totalTimeMinutes}
                  servings={recipe.servings}
                  difficulty={recipe.difficulty}
                  badge="30 MINS"
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* =========================================================================
          4. CATEGORY DISCOVERY HUB
         ========================================================================= */}
      <section>
        <Container size="xl">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              Browse by Meal & Ingredient
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text">
              Popular Recipe Categories
            </h2>
            <p className="text-xs sm:text-sm text-editorial-muted">
              Find exactly what you&rsquo;re in the mood to cook tonight.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {topCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}/`}
                className="group p-5 rounded-3xl bg-white border border-editorial-border text-center shadow-xs hover:shadow-md hover:border-editorial-borderStrong transition-all space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Utensils className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-sm text-editorial-text group-hover:text-brand-600 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-editorial-lightMuted block">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          5. CURATED EDITORIAL COLLECTIONS
         ========================================================================= */}
      {collections.length > 0 && (
        <section className="bg-editorial-surfaceAlt/60 py-12 sm:py-16 border-y border-editorial-border">
          <Container size="xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block mb-1">
                  Curated Menus
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text flex items-center gap-2">
                  <Layers className="w-6 h-6 text-brand-500" />
                  <span>Recipe Collections</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {collections.map((col) => (
                <Link
                  key={col.id}
                  href={`/collection/${col.slug}/`}
                  className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-zinc-900 shadow-md border border-editorial-border"
                >
                  <img
                    src={col.imageUrl}
                    alt={col.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end text-white space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                      Collection
                    </span>
                    <h3 className="font-serif text-xl font-bold leading-tight group-hover:text-brand-300 transition-colors">
                      {col.name}
                    </h3>
                    <p className="text-xs text-zinc-300 line-clamp-2 font-light">
                      {col.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* =========================================================================
          6. LATEST RECIPES FEED
         ========================================================================= */}
      <section>
        <Container size="xl">
          <div className="flex items-center justify-between mb-8 border-b border-editorial-border pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block mb-1">
                Fresh from the Kitchen
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text">
                Latest Published Recipes
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                title={recipe.title}
                slug={recipe.slug}
                image={recipe.heroImage?.url}
                imageAlt={recipe.heroImage?.altText || recipe.title}
                category={recipe.primaryCategorySlug}
                description={recipe.shortDescription}
                totalTimeMinutes={recipe.totalTimeMinutes}
                servings={recipe.servings}
                difficulty={recipe.difficulty}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          7. NEWSLETTER SUBSCRIPTION BOX
         ========================================================================= */}
      <section>
        <Container size="xl">
          <NewsletterBox />
        </Container>
      </section>
    </div>
  );
}
