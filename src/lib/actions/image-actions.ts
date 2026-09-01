'use server';

import { verifyAdminSession } from '../auth/session';
import { recipeRepository } from '../repositories/recipe.repository';
import { imageRepository } from '../repositories/image.repository';
import { extractRuleBasedRecipeDNA } from '../ai/recipe-dna';
import {
  generateFoodImagePrompt,
  FoodImageType,
  VisualStylePreset,
  PromptConfig,
} from '../images/prompt-generator';
import { getImageProvider, ImageGenerationRequest } from '../images/image-provider';
import { imageHistoryService, ImageGenerationHistoryRecord } from '../images/image-history.service';
import { mediaStorageService } from '../r2/media-storage.service';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    throw new Error('Unauthorized: Admin session required.');
  }
}

export async function generatePromptAction(
  recipeId: string,
  imageType: FoodImageType = 'hero',
  stylePreset: VisualStylePreset = 'editorial-kitchen'
): Promise<{
  success: boolean;
  promptConfig?: PromptConfig;
  error?: string;
}> {
  await checkAuth();

  try {
    const recipe = await recipeRepository.getById(recipeId);
    if (!recipe) {
      return { success: false, error: 'Recipe not found' };
    }

    const dna = extractRuleBasedRecipeDNA(recipe);
    const promptConfig = generateFoodImagePrompt(dna, imageType, stylePreset);

    return {
      success: true,
      promptConfig,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to generate image prompt',
    };
  }
}

export async function startImageGenerationAction(
  recipeId: string,
  imageType: FoodImageType,
  prompt: string,
  stylePreset: VisualStylePreset,
  negativePrompt?: string
): Promise<{
  success: boolean;
  historyRecord?: ImageGenerationHistoryRecord;
  error?: string;
}> {
  await checkAuth();

  try {
    const recipe = await recipeRepository.getById(recipeId);
    if (!recipe) return { success: false, error: 'Recipe not found' };

    const provider = getImageProvider();
    const width = imageType === 'pinterest' ? 1000 : 1200;
    const height = imageType === 'pinterest' ? 1500 : imageType === 'hero' ? 800 : 900;
    const aspectRatio = imageType === 'pinterest' ? '2:3' : imageType === 'hero' ? '3:2' : '4:3';

    // 1. Create history record
    const historyRecord = imageHistoryService.createRecord({
      recipeId,
      imageType,
      prompt,
      negativePrompt,
      stylePreset,
      width,
      height,
      provider: provider.name,
      model: 'flux-pro-1.1',
    });

    // 2. Call Image Provider
    const genResponse = await provider.generateImage({
      prompt,
      negativePrompt,
      aspectRatio,
      width,
      height,
      stylePreset,
    });

    if (genResponse.success && genResponse.imageUrl) {
      imageHistoryService.completeRecord(historyRecord.id, genResponse.imageUrl);
      const updated = imageHistoryService.getById(historyRecord.id);
      return {
        success: true,
        historyRecord: updated,
      };
    } else if (genResponse.status === 'generating') {
      return {
        success: true,
        historyRecord,
      };
    } else {
      imageHistoryService.failRecord(historyRecord.id, genResponse.error || 'Generation failed');
      return {
        success: false,
        error: genResponse.error || 'Image generation failed',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Image generation encountered an unexpected error',
    };
  }
}

export async function approveImageAction(
  recipeId: string,
  historyRecordId: string,
  targetRole: 'hero' | 'secondary' | 'pinterest'
): Promise<{
  success: boolean;
  publicUrl?: string;
  error?: string;
}> {
  await checkAuth();

  try {
    const recipe = await recipeRepository.getById(recipeId);
    if (!recipe) return { success: false, error: 'Recipe not found' };

    const historyRecord = imageHistoryService.getById(historyRecordId);
    if (!historyRecord || !historyRecord.imageUrl) {
      return { success: false, error: 'Generated image record not found' };
    }

    const dna = extractRuleBasedRecipeDNA(recipe);
    const promptConfig = generateFoodImagePrompt(dna, targetRole);

    // 1. Store in Cloudflare R2 & create D1 Image Record
    const stored = await mediaStorageService.storeGeneratedImage({
      recipeId,
      recipeSlug: recipe.slug,
      imageType: targetRole,
      sourceUrl: historyRecord.imageUrl,
      width: historyRecord.width,
      height: historyRecord.height,
      altText: promptConfig.altText,
      generationProvider: historyRecord.provider,
      generationModel: historyRecord.model,
      generationPrompt: historyRecord.prompt,
    });

    // 2. Assign to Recipe Record
    if (targetRole === 'hero') {
      await recipeRepository.update(recipeId, {
        heroImageUrl: stored.publicUrl,
        heroImageAlt: promptConfig.altText,
      });
    }

    // 3. Mark history record approved
    imageHistoryService.updateStatus(historyRecordId, 'approved', stored.r2Key);

    revalidatePath(`/admin/recipes/${recipeId}`);
    revalidatePath(`/admin/recipes/${recipeId}/images`);
    revalidatePath(`/recipes/${recipe.slug}`);
    revalidatePath('/');

    return {
      success: true,
      publicUrl: stored.publicUrl,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to approve image',
    };
  }
}

export async function rejectImageAction(historyRecordId: string): Promise<{ success: boolean }> {
  await checkAuth();
  imageHistoryService.updateStatus(historyRecordId, 'rejected');
  return { success: true };
}
