'use server';

import { verifyAdminSession } from '../auth/session';
import { publishingService, PublicationChecklistResult } from '../publishing/publishing.service';
import { publishingAuditService, PublishingAuditRecord } from '../publishing/audit-log.service';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    throw new Error('Unauthorized: Admin session required.');
  }
}

export async function getPublicationChecklistAction(recipeId: string): Promise<{
  success: boolean;
  checklist?: PublicationChecklistResult;
  error?: string;
}> {
  await checkAuth();

  try {
    const checklist = await publishingService.getPublicationChecklist(recipeId);
    return {
      success: true,
      checklist,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to evaluate publication checklist',
    };
  }
}

export async function publishRecipeAction(recipeId: string): Promise<{
  success: boolean;
  publishedUrl?: string;
  error?: string;
}> {
  await checkAuth();

  try {
    const result = await publishingService.publishRecipe(recipeId);
    revalidatePath(`/admin/recipes/${recipeId}`);
    revalidatePath('/admin/recipes');
    revalidatePath('/admin');
    return {
      success: true,
      publishedUrl: result.publishedUrl,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Publication failed',
    };
  }
}

export async function unpublishRecipeAction(recipeId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  await checkAuth();

  try {
    await publishingService.unpublishRecipe(recipeId);
    revalidatePath(`/admin/recipes/${recipeId}`);
    revalidatePath('/admin/recipes');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to unpublish recipe',
    };
  }
}

export async function getPublishingAuditLogsAction(recipeId: string): Promise<{
  success: boolean;
  logs: PublishingAuditRecord[];
}> {
  await checkAuth();
  const logs = publishingAuditService.listByRecipe(recipeId);
  return { success: true, logs };
}
