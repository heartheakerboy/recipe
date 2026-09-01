import React from 'react';
import { Recipe } from '@/lib/types/recipe';
import { PinterestSaveButton } from '../common/pinterest-save-button';
import { IngredientList } from './ingredient-list';
import { InstructionList } from './instruction-list';
import { RecipeMetaBar } from './recipe-meta-bar';
import { Printer, Sparkles, ShieldCheck } from 'lucide-react';

interface RecipeCardBlockProps {
  recipe: Recipe;
}

export function RecipeCardBlock({ recipe }: RecipeCardBlockProps) {
  const recipeUrl = `https://flavornest.xyz/recipes/${recipe.slug}`;

  return (
    <section
      id="recipe-card"
      className="scroll-mt-24 rounded-3xl bg-white border-2 border-editorial-borderStrong p-6 sm:p-10 shadow-card space-y-8"
    >
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-editorial-border pb-6">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FlavorNest Official Recipe Card</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-editorial-text">
            {recipe.title}
          </h2>
          <p className="text-xs sm:text-sm text-editorial-muted">
            {recipe.shortDescription}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <PinterestSaveButton
            url={recipeUrl}
            media={recipe.heroImage.url}
            description={recipe.shortDescription}
          />
        </div>
      </div>

      {/* Timing and Yield Meta Grid */}
      <RecipeMetaBar recipe={recipe} variant="expanded" />

      {/* Ingredients List */}
      <IngredientList ingredients={recipe.ingredients} />

      {/* Step-by-Step Instructions */}
      <InstructionList instructions={recipe.instructions} />

      {/* Storage, Reheating & Nutrition Box */}
      <div className="border-t border-editorial-border pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-editorial-muted">
        {recipe.recipeCardData?.storageInstructions && (
          <div className="p-4 rounded-xl bg-editorial-surface border border-editorial-border">
            <strong className="text-editorial-text block mb-1 font-bold">Storage Guidelines:</strong>
            <p>{recipe.recipeCardData.storageInstructions}</p>
          </div>
        )}

        {recipe.recipeCardData?.reheatingInstructions && (
          <div className="p-4 rounded-xl bg-editorial-surface border border-editorial-border">
            <strong className="text-editorial-text block mb-1 font-bold">Reheating Tips:</strong>
            <p>{recipe.recipeCardData.reheatingInstructions}</p>
          </div>
        )}
      </div>

      {/* Nutrition Summary */}
      {recipe.nutrition && (
        <div className="border-t border-editorial-border pt-4 text-xs text-editorial-lightMuted flex flex-wrap items-center gap-3">
          <span className="font-bold text-editorial-text uppercase tracking-wider">Nutrition (per serving):</span>
          <span>{recipe.nutrition.calories} Calories</span>
          <span>•</span>
          <span>{recipe.nutrition.proteinGrams}g Protein</span>
          <span>•</span>
          <span>{recipe.nutrition.carbsGrams}g Carbs</span>
          <span>•</span>
          <span>{recipe.nutrition.fatGrams}g Fat</span>
        </div>
      )}
    </section>
  );
}
