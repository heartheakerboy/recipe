'use server';

import { recipeRepository } from '../repositories/recipe.repository';
import { categoryRepository } from '../repositories/category.repository';
import { tagRepository } from '../repositories/tag.repository';
import { RecipeFormSchema } from '../validations/recipe.schema';
import { CategoryFormSchema } from '../validations/category.schema';
import { TagFormSchema } from '../validations/tag.schema';
import { verifyActionAuth, safeRevalidatePath } from './action-utils';

// 1. RECIPE ACTIONS
export async function createRecipeAction(rawFormData: unknown) {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  const parsed = RecipeFormSchema.safeParse(rawFormData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  try {
    const created = await recipeRepository.create(parsed.data);
    safeRevalidatePath('/admin/recipes');
    safeRevalidatePath('/recipes');
    safeRevalidatePath('/');
    return { success: true, recipe: created };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Creation failed' };
  }
}

export async function updateRecipeAction(id: string, rawFormData: unknown) {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  const parsed = RecipeFormSchema.partial().safeParse(rawFormData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  try {
    const updated = await recipeRepository.update(id, parsed.data);
    safeRevalidatePath('/admin/recipes');
    safeRevalidatePath(`/admin/recipes/${id}`);
    safeRevalidatePath(`/recipes/${updated.slug}`);
    safeRevalidatePath('/recipes');
    safeRevalidatePath('/');
    return { success: true, recipe: updated };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Update failed' };
  }
}

export async function archiveRecipeAction(id: string) {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  try {
    const archived = await recipeRepository.archive(id);
    safeRevalidatePath('/admin/recipes');
    safeRevalidatePath('/recipes');
    return { success: true, recipe: archived };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Archive failed' };
  }
}

export async function deleteRecipeAction(id: string) {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  try {
    await recipeRepository.delete(id);
    safeRevalidatePath('/admin/recipes');
    safeRevalidatePath('/recipes');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
  }
}

// 2. CATEGORY ACTIONS
export async function createCategoryAction(rawFormData: unknown) {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  const parsed = CategoryFormSchema.safeParse(rawFormData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  try {
    const created = await categoryRepository.create(parsed.data);
    safeRevalidatePath('/admin/categories');
    safeRevalidatePath('/recipes');
    return { success: true, category: created };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Category creation failed' };
  }
}

export async function updateCategoryAction(id: string, rawFormData: unknown) {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  const parsed = CategoryFormSchema.partial().safeParse(rawFormData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  try {
    const updated = await categoryRepository.update(id, parsed.data);
    safeRevalidatePath('/admin/categories');
    safeRevalidatePath(`/category/${updated.slug}`);
    return { success: true, category: updated };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Category update failed' };
  }
}

export async function deleteCategoryAction(id: string) {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  try {
    await categoryRepository.delete(id);
    safeRevalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Category deletion failed' };
  }
}

// 3. TAG ACTIONS
export async function createTagAction(name: string, slug: string) {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  const parsed = TagFormSchema.safeParse({ name, slug });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  try {
    const created = await tagRepository.create(name, slug);
    safeRevalidatePath('/admin/tags');
    return { success: true, tag: created };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Tag creation failed' };
  }
}

export async function deleteTagAction(id: string) {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  try {
    await tagRepository.delete(id);
    safeRevalidatePath('/admin/tags');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Tag deletion failed' };
  }
}
