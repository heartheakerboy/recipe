import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Users, Sparkles } from 'lucide-react';
import { Recipe } from '@/lib/types/recipe';
import { OptimizedImage } from '../common/optimized-image';
import { PinterestSaveButton } from '../common/pinterest-save-button';
import { EditorialBadge } from './recipe-badge';
import { formatDuration } from '@/lib/utils/formatters';

interface FeaturedRecipeProps {
  recipe: Recipe;
}

export function FeaturedRecipe({ recipe }: FeaturedRecipeProps) {
  const recipeUrl = `https://flavornest.xyz/recipes/${recipe.slug}`;

  return (
    <div className="relative rounded-3xl bg-white border border-editorial-border overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Large Image */}
        <div className="relative lg:col-span-7 aspect-recipe-card lg:aspect-auto min-h-[280px] sm:min-h-[380px] bg-editorial-surfaceAlt overflow-hidden">
          <Link href={`/recipes/${recipe.slug}`} className="block h-full w-full" tabIndex={-1}>
            <OptimizedImage
              src={recipe.heroImage.url}
              alt={recipe.heroImage.altText || recipe.title}
              fill
              priority
              className="object-cover hover:scale-105 transition-transform duration-500"
              pinMedia={recipe.heroImage.url}
              pinDescription={recipe.shortDescription}
              pinUrl={recipeUrl}
            />
          </Link>
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-bold uppercase tracking-wider shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Editor&rsquo;s Pick</span>
            </span>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <PinterestSaveButton
              url={recipeUrl}
              media={recipe.heroImage.url}
              description={recipe.shortDescription}
              size="sm"
            />
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <EditorialBadge angle={recipe.editorialStyle} size="md" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                {recipe.primaryCategorySlug.replace(/-/g, ' ')}
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-editorial-text leading-tight">
              <Link href={`/recipes/${recipe.slug}`} className="hover:text-brand-500 transition-colors">
                {recipe.title}
              </Link>
            </h2>

            <p className="text-sm sm:text-base text-editorial-muted leading-relaxed">
              {recipe.shortDescription}
            </p>

            <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold text-editorial-text pt-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-500" />
                <span>{formatDuration(recipe.totalTimeMinutes)}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-editorial-lightMuted" />
                <span>{recipe.servings} Servings</span>
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-editorial-border">
            <Link
              href={`/recipes/${recipe.slug}`}
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm inline-flex items-center gap-2 shadow-sm transition-all w-full sm:w-auto justify-center"
            >
              <span>Get The Recipe</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
