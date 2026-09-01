'use server';

import { recipeImportService, NormalizedImportedRecipe } from '../importer/recipe-import.service';
import { recipeRepository } from '../repositories/recipe.repository';
import { verifyAdminSession } from '../auth/session';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    throw new Error('Unauthorized: Admin session required.');
  }
}

export async function analyzeRecipeUrlAction(url: string) {
  await checkAuth();
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
  await checkAuth();

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

    revalidatePath('/admin/recipes');
    revalidatePath('/admin');

    return { success: true, recipeId: created.id, slug: created.slug };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save imported draft',
    };
  }
}
