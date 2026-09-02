import React from 'react';
import Link from 'next/link';
import { ArrowDown, Clock, Users, ChefHat } from 'lucide-react';
import { Recipe } from '@/lib/types/recipe';
import { OptimizedImage } from '../common/optimized-image';
import { PinterestSaveButton } from '../common/pinterest-save-button';
import { EditorialBadge, DifficultyBadge } from './recipe-badge';
import { formatDuration } from '@/lib/utils/formatters';

interface RecipeHeroProps {
  recipe: Recipe;
}

export function RecipeHero({ recipe }: RecipeHeroProps) {
  const recipeUrl = `https://flavornest.xyz/recipes/${recipe.slug}`;
  const heroUrl = recipe.heroImage?.url || (recipe as any).heroImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&h=800&q=80';
  const heroAlt = recipe.heroImage?.altText || (recipe as any).heroImageAlt || recipe.title;

  return (
    <div className="space-y-6">
      {/* Category Pill & Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/category/${recipe.primaryCategorySlug}`}
          className="text-xs font-bold uppercase tracking-wider text-brand-600 hover:underline"
        >
          {recipe.primaryCategorySlug.replace(/-/g, ' ')}
        </Link>
        <span className="text-editorial-border">•</span>
        <EditorialBadge angle={recipe.editorialStyle} size="md" />
        <DifficultyBadge difficulty={recipe.difficulty} />
      </div>

      {/* H1 Recipe Title */}
      <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-editorial-text leading-[1.15] tracking-tight">
        {recipe.title}
      </h1>

      {/* Short Introduction Story */}
      <p className="text-base sm:text-lg text-editorial-muted leading-relaxed max-w-3xl">
        {recipe.shortDescription}
      </p>

      {/* Large Food Photography Hero with Pinterest Save Button */}
      <div className="relative rounded-2xl overflow-hidden border border-editorial-border shadow-card bg-editorial-surfaceAlt">
        <OptimizedImage
          src={heroUrl}
          alt={heroAlt}
          aspectRatioClass="aspect-recipe-hero"
          priority
          pinMedia={heroUrl}
          pinDescription={recipe.shortDescription || recipe.title}
          pinUrl={recipeUrl}
        />
        <div className="absolute top-4 right-4 z-10">
          <PinterestSaveButton
            url={recipeUrl}
            media={heroUrl}
            description={recipe.shortDescription || recipe.title}
            size="md"
          />
        </div>
      </div>

      {/* Quick Scanning Meta Pills & Jump-to-Recipe Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-editorial-border shadow-sm">
        {/* Quick Meta Pills */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-semibold text-editorial-text">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-brand-500" />
            <span>{formatDuration(recipe.totalTimeMinutes)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-editorial-lightMuted" />
            <span>{recipe.servings} Servings</span>
          </div>
          <div className="flex items-center gap-1.5 capitalize text-xs px-2.5 py-1 rounded-full bg-editorial-surface border border-editorial-border">
            <ChefHat className="w-3.5 h-3.5 text-brand-500" />
            <span>{recipe.difficulty}</span>
          </div>
        </div>

        {/* CTAs: Jump to Recipe & Save */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <a
            href="#recipe-card"
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <span>Jump to Recipe</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </a>
          <PinterestSaveButton
            url={recipeUrl}
            media={recipe.heroImage.url}
            description={recipe.shortDescription || recipe.title}
            size="md"
          />
        </div>
      </div>
    </div>
  );
}
