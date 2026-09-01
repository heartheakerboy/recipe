'use server';

import { recipeImportService, NormalizedImportedRecipe } from '../importer/recipe-import.service';
import { recipeRepository } from '../repositories/recipe.repository';
import { verifyActionAuth, safeRevalidatePath } from './action-utils';

export async function analyzeRecipeUrlAction(url: string) {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return {
      success: false,
      originalUrl: url,
      normalizedUrl: url,
      domain: '',
      duplicate: { isDuplicate: false },
      confidences: {},
      warnings: [],
      errors: [auth.error || 'Unauthorized: Admin session required.'],
      durationMs: 0,
    };
  }

  if (!url || typeof url !== 'string') {
    return {
      success: false,
      originalUrl: url,
      normalizedUrl: url,
      domain: '',
      duplicate: { isDuplicate: false },
      confidences: {},
      warnings: [],
      errors: ['Please enter a recipe URL.'],
      durationMs: 0,
    };
  }

  return recipeImportService.importFromUrl(url);
}

export async function saveImportedDraftAction(data: NormalizedImportedRecipe) {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  try {
    const created = await recipeRepository.create({
      ...data,
      servingsUnit: 'servings',
      status: 'draft',
      seoTitle: `${data.title} | FlavorNest`,
      metaDescription: data.shortDescription,
      canonicalUrl: `https://flavornest.xyz/recipes/${data.slug}`,
      editorialStyle: data.editorialStyle as any,
      difficulty: data.difficulty,
      mealType: data.mealType as any,
      cookingMethod: data.cookingMethod as any,
    });

    safeRevalidatePath('/admin/recipes');
    safeRevalidatePath('/admin');

    return { success: true, recipeId: created.id, slug: created.slug };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save imported draft',
    };
  }
}
