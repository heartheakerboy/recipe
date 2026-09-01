'use server';

import { publishingService, PublicationChecklistResult } from '../publishing/publishing.service';
import { publishingAuditService, PublishingAuditRecord } from '../publishing/audit-log.service';
import { verifyActionAuth, safeRevalidatePath } from './action-utils';

export async function getPublicationChecklistAction(recipeId: string): Promise<{
  success: boolean;
  checklist?: PublicationChecklistResult;
  error?: string;
}> {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

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
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  try {
    const result = await publishingService.publishRecipe(recipeId);
    safeRevalidatePath(`/admin/recipes/${recipeId}`);
    safeRevalidatePath('/admin/recipes');
    safeRevalidatePath('/admin');
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
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  try {
    await publishingService.unpublishRecipe(recipeId);
    safeRevalidatePath(`/admin/recipes/${recipeId}`);
    safeRevalidatePath('/admin/recipes');
    safeRevalidatePath('/admin');
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
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: true, logs: [] };
  }
  const logs = publishingAuditService.listByRecipe(recipeId);
  return { success: true, logs };
}
