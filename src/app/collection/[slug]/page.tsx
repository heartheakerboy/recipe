import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Layers, Sparkles } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { RecipeCard } from '@/components/recipe/recipe-card';
import { collectionRepository } from '@/lib/repositories/collection.repository';
import { recipeRepository } from '@/lib/repositories/recipe.repository';
import { constructMetadata } from '@/lib/seo/metadata';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await collectionRepository.getBySlug(slug);

  if (!collection || collection.status !== 'published') {
    return {
      title: 'Collection Not Found | FlavorNest',
      robots: { index: false, follow: false },
    };
  }

  return constructMetadata({
    title: `${collection.name} | FlavorNest Recipe Collection`,
    description: collection.description,
    canonicalPath: `/collection/${collection.slug}/`,
    image: collection.imageUrl,
  });
}

export default async function SingleCollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await collectionRepository.getBySlug(slug);

  if (!collection || collection.status !== 'published') {
    notFound();
  }

  const { recipes: allPublished } = await recipeRepository.list({ status: 'published', limit: 100 });
  const recipes = allPublished.filter((r) => collection.recipeIds.includes(r.id));

  return (
    <div className="py-10 sm:py-14 space-y-10 font-sans">
      <Container size="xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs font-semibold text-editorial-muted flex items-center gap-1.5 mb-6">
          <Link href="/" className="hover:text-editorial-text transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-editorial-lightMuted" />
          <Link href="/collections/" className="hover:text-editorial-text transition-colors">
            Collections
          </Link>
          <ChevronRight className="w-3 h-3 text-editorial-lightMuted" />
          <span className="text-editorial-text font-bold">{collection.name}</span>
        </nav>

        {/* Collection Header Banner */}
        <div className="bg-editorial-surfaceAlt/60 rounded-3xl border border-editorial-border p-8 sm:p-12 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600">
            <Layers className="w-4 h-4" />
            <span>Curated Collection</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-editorial-text leading-tight">
            {collection.name}
          </h1>
          <p className="text-sm sm:text-base text-editorial-muted leading-relaxed max-w-2xl">
            {collection.description}
          </p>
        </div>

        {/* Recipe Grid */}
        {recipes.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-editorial-border text-center space-y-2">
            <p className="text-sm font-serif font-bold text-editorial-text">
              No recipes currently in this collection.
            </p>
            <p className="text-xs text-editorial-muted">
              Check back soon as our editors publish new dishes to this menu.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-editorial-border pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-editorial-muted">
                {recipes.length} {recipes.length === 1 ? 'Recipe' : 'Recipes'} in Collection
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
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
          </div>
        )}
      </Container>
    </div>
  );
}
