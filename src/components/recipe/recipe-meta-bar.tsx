import React from 'react';
import { Clock, Users, Flame, Utensils } from 'lucide-react';
import { formatDuration } from '@/lib/utils/formatters';
import { Recipe } from '@/lib/types/recipe';
import { cn } from '@/lib/utils/cn';

interface RecipeMetaBarProps {
  recipe: Pick<Recipe, 'prepTimeMinutes' | 'cookTimeMinutes' | 'totalTimeMinutes' | 'servings' | 'difficulty' | 'mealType'>;
  className?: string;
  variant?: 'compact' | 'expanded';
}

export function RecipeMetaBar({ recipe, className, variant = 'compact' }: RecipeMetaBarProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3 text-xs text-editorial-muted font-medium', className)}>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-brand-500" />
          <span>{formatDuration(recipe.totalTimeMinutes)}</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-editorial-lightMuted" />
          <span>{recipe.servings} servings</span>
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 sm:p-5 rounded-xl bg-editorial-surface border border-editorial-border text-center',
        className
      )}
    >
      <div className="flex flex-col items-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-editorial-lightMuted">Prep Time</span>
        <span className="font-serif text-lg font-bold text-editorial-text mt-0.5">
          {formatDuration(recipe.prepTimeMinutes)}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-editorial-lightMuted">Cook Time</span>
        <span className="font-serif text-lg font-bold text-editorial-text mt-0.5">
          {formatDuration(recipe.cookTimeMinutes)}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-editorial-lightMuted">Total Time</span>
        <span className="font-serif text-lg font-bold text-brand-600 mt-0.5">
          {formatDuration(recipe.totalTimeMinutes)}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-editorial-lightMuted">Yield</span>
        <span className="font-serif text-lg font-bold text-editorial-text mt-0.5">
          {recipe.servings} Servings
        </span>
      </div>
    </div>
  );
}
