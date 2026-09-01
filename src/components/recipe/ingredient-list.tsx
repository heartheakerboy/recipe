'use client';

import React, { useState } from 'react';
import { Check, Utensils } from 'lucide-react';
import { RecipeIngredient } from '@/lib/types/recipe';
import { cn } from '@/lib/utils/cn';

interface IngredientListProps {
  ingredients: RecipeIngredient[];
}

export function IngredientList({ ingredients }: IngredientListProps) {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  const toggleIngredient = (id: string) => {
    setCheckedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl font-bold text-editorial-text flex items-center gap-2">
          <Utensils className="w-5 h-5 text-brand-500" />
          <span>Ingredients Checklist</span>
        </h3>
        <span className="text-xs text-editorial-lightMuted font-medium">
          Click item to check off while cooking
        </span>
      </div>

      <ul className="space-y-2">
        {ingredients.map((ingredient) => {
          const isChecked = !!checkedIds[ingredient.id];
          return (
            <li
              key={ingredient.id}
              onClick={() => toggleIngredient(ingredient.id)}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none text-sm sm:text-base',
                isChecked
                  ? 'bg-emerald-50/50 border-emerald-200 text-editorial-lightMuted line-through'
                  : 'bg-editorial-surface/40 hover:bg-white border-editorial-border text-editorial-text shadow-sm'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors',
                  isChecked
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-editorial-borderStrong bg-white text-transparent'
                )}
              >
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="leading-snug">{ingredient.rawText}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
