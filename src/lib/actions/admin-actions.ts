'use server';

import { revalidatePath } from 'next/cache';
import { recipeRepository } from '../repositories/recipe.repository';
import { categoryRepository } from '../repositories/category.repository';
import { tagRepository } from '../repositories/tag.repository';
import { imageRepository } from '../repositories/image.repository';
import { RecipeFormSchema } from '../validations/recipe.schema';
import { CategoryFormSchema } from '../validations/category.schema';
import { TagFormSchema } from '../validations/tag.schema';
import { verifyAdminSession } from '../auth/session';

async function checkAuth() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    throw new Error('Unauthorized: Admin session required.');
  }
}

// 1. RECIPE ACTIONS
export async function createRecipeAction(rawFormData: unknown) {
  await checkAuth();
  const parsed = RecipeFormSchema.safeParse(rawFormData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  try {
    const created = await recipeRepository.create(parsed.data);
    revalidatePath('/admin/recipes');
    revalidatePath('/recipes');
    revalidatePath('/');
    return { success: true, recipe: created };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Creation failed' };
  }
}

export async function updateRecipeAction(id: string, rawFormData: unknown) {
  await checkAuth();
  const parsed = RecipeFormSchema.partial().safeParse(rawFormData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  try {
    const updated = await recipeRepository.update(id, parsed.data);
    revalidatePath('/admin/recipes');
    revalidatePath(`/admin/recipes/${id}`);
    revalidatePath(`/recipes/${updated.slug}`);
    revalidatePath('/recipes');
    revalidatePath('/');
    return { success: true, recipe: updated };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Update failed' };
  }
}

export async function archiveRecipeAction(id: string) {
  await checkAuth();
  try {
    const archived = await recipeRepository.archive(id);
    revalidatePath('/admin/recipes');
    revalidatePath('/recipes');
    return { success: true, recipe: archived };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Archive failed' };
  }
}

export async function deleteRecipeAction(id: string) {
  await checkAuth();
  try {
    await recipeRepository.delete(id);
    revalidatePath('/admin/recipes');
    revalidatePath('/recipes');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
  }
}

// 2. CATEGORY ACTIONS
export async function createCategoryAction(rawFormData: unknown) {
  await checkAuth();
  const parsed = CategoryFormSchema.safeParse(rawFormData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  try {
    const created = await categoryRepository.create(parsed.data);
    revalidatePath('/admin/categories');
    revalidatePath('/recipes');
    return { success: true, category: created };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Category creation failed' };
  }
}

export async function updateCategoryAction(id: string, rawFormData: unknown) {
  await checkAuth();
  const parsed = CategoryFormSchema.partial().safeParse(rawFormData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  try {
    const updated = await categoryRepository.update(id, parsed.data);
    revalidatePath('/admin/categories');
    revalidatePath(`/category/${updated.slug}`);
    return { success: true, category: updated };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Category update failed' };
  }
}

export async function deleteCategoryAction(id: string) {
  await checkAuth();
  try {
    await categoryRepository.delete(id);
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Category deletion failed' };
  }
}

// 3. TAG ACTIONS
export async function createTagAction(name: string, slug: string) {
  await checkAuth();
  const parsed = TagFormSchema.safeParse({ name, slug });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Validation error' };
  }

  try {
    const created = await tagRepository.create(name, slug);
    revalidatePath('/admin/tags');
    return { success: true, tag: created };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Tag creation failed' };
  }
}

export async function deleteTagAction(id: string) {
  await checkAuth();
  try {
    await tagRepository.delete(id);
    revalidatePath('/admin/tags');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Tag deletion failed' };
  }
}
