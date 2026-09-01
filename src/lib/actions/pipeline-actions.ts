'use server';

import { pipelineOrchestrator } from '../pipeline/orchestrator';
import { bulkImporterService, BulkImportBatchResult } from '../pipeline/bulk-importer';
import { budgetGuard } from '../pipeline/budget-guard';
import { recipeRepository } from '../repositories/recipe.repository';
import { pinterestRepository } from '../repositories/pinterest.repository';
import { publishingService } from '../publishing/publishing.service';
import { extractRuleBasedRecipeDNA } from '../ai/recipe-dna';
import { PipelineStage, PipelineRecipeItem, BudgetGuardConfig } from '../types/pipeline';
import { verifyActionAuth, safeRevalidatePath } from './action-utils';

export async function startPipelineAction(recipeId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  const res = await pipelineOrchestrator.runFullPipeline(recipeId);
  safeRevalidatePath('/admin/pipeline');
  safeRevalidatePath(`/admin/recipes/${recipeId}`);
  return res;
}

export async function runPipelineStageAction(
  recipeId: string,
  stage: PipelineStage
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  const res = await pipelineOrchestrator.runStage(recipeId, stage);
  safeRevalidatePath('/admin/pipeline');
  safeRevalidatePath(`/admin/recipes/${recipeId}`);
  return res;
}

export async function bulkImportUrlsAction(rawUrlsText: string): Promise<{
  success: boolean;
  batch?: BulkImportBatchResult;
  error?: string;
}> {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  try {
    const validated = await bulkImporterService.parseAndValidateBatch(rawUrlsText);
    const processed = await bulkImporterService.processValidImports(validated.results);

    // Auto-trigger full pipeline for successfully imported items
    for (const item of processed) {
      if (item.status === 'imported' && item.recipeId) {
        await pipelineOrchestrator.runFullPipeline(item.recipeId).catch((e) => {
          console.warn('Pipeline run warning:', e);
        });
      }
    }

    safeRevalidatePath('/admin/pipeline');
    safeRevalidatePath('/admin/recipes');

    return {
      success: true,
      batch: {
        ...validated,
        results: processed,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Bulk import failed',
    };
  }
}

export async function sendBackRecipeAction(
  recipeId: string,
  stage: PipelineStage,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  const res = await pipelineOrchestrator.sendBackToStage(recipeId, stage, reason);
  safeRevalidatePath('/admin/pipeline');
  safeRevalidatePath(`/admin/recipes/${recipeId}/review`);
  return res;
}

export async function getPipelineDashboardDataAction(): Promise<{
  recipes: PipelineRecipeItem[];
  budget: BudgetGuardConfig;
  stats: {
    importedToday: number;
    processing: number;
    readyForReview: number;
    published: number;
    failed: number;
  };
}> {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return {
      recipes: [],
      budget: budgetGuard.getStatus(),
      stats: {
        importedToday: 0,
        processing: 0,
        readyForReview: 0,
        published: 0,
        failed: 0,
      },
    };
  }

  const { recipes } = await recipeRepository.list({ limit: 100 });
  const pipelineItems: PipelineRecipeItem[] = [];

  for (const r of recipes) {
    const item = await pipelineOrchestrator.getPipelineStatusForRecipe(r.id);
    if (item) pipelineItems.push(item);
  }

  const budget = budgetGuard.getStatus();

  const stats = {
    importedToday: pipelineItems.length,
    processing: pipelineItems.filter((i) => i.overallStatus === 'content_ready' || i.overallStatus === 'images_generating').length,
    readyForReview: pipelineItems.filter((i) => i.overallStatus === 'review').length,
    published: pipelineItems.filter((i) => i.overallStatus === 'published').length,
    failed: pipelineItems.filter((i) => i.overallStatus === 'failed').length,
  };

  return {
    recipes: pipelineItems,
    budget,
    stats,
  };
}

export async function getRecipeReviewDataAction(recipeId: string) {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    throw new Error('Unauthorized');
  }

  const recipe = await recipeRepository.getById(recipeId);
  if (!recipe) throw new Error('Recipe not found');

  const recipeDna = extractRuleBasedRecipeDNA(recipe);
  const pinterestCreatives = await pinterestRepository.listByRecipe(recipeId);
  const checklist = await publishingService.getPublicationChecklist(recipeId);
  const activities = pipelineOrchestrator.getActivitiesForRecipe(recipeId);

  return {
    recipe,
    recipeDna,
    pinterestCreatives,
    checklist,
    activities,
  };
}
