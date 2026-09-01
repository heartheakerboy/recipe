import React from 'react';
import { RecipeEditorialAngle, RecipeDifficulty } from '@/lib/types/recipe';
import { EDITORIAL_STYLES } from '@/lib/config/categories.config';
import { cn } from '@/lib/utils/cn';

interface EditorialBadgeProps {
  angle: RecipeEditorialAngle;
  className?: string;
  size?: 'sm' | 'md';
}

export function EditorialBadge({ angle, className, size = 'sm' }: EditorialBadgeProps) {
  const config = EDITORIAL_STYLES[angle] || EDITORIAL_STYLES['quick-easy'];

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border tracking-wide uppercase',
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        config.badgeColorClass,
        className
      )}
    >
      {config.title}
    </span>
  );
}

interface DifficultyBadgeProps {
  difficulty: RecipeDifficulty;
  className?: string;
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const colors = {
    easy: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    medium: 'bg-amber-50 text-amber-800 border-amber-200',
    hard: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  const labels = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Advanced',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide',
        colors[difficulty],
        className
      )}
    >
      {labels[difficulty]}
    </span>
  );
}
