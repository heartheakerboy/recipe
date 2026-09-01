'use server';

import { verifyAdminSession } from '../auth/session';
import { recipeRepository } from '../repositories/recipe.repository';
import { pinterestRepository } from '../repositories/pinterest.repository';
import { extractRuleBasedRecipeDNA } from '../ai/recipe-dna';
import {
  generatePinterestCopy,
  generateDeterministicPinterestCopy,
} from '../pinterest/copy-generator';
import {
  getEligibleAngles,
} from '../pinterest/angles';
import {
  PinterestContentAngle,
  PinterestCreativeStyle,
  PinterestCreative,
  CreatePinterestCreativeInput,
} from '../types/pinterest';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    throw new Error('Unauthorized: Admin session required.');
  }
}

const TEMPLATE_ROTATION: PinterestCreativeStyle[] = [
  'template-b-editorial',
  'template-c-recipe-focus',
  'template-a-hero',
  'template-e-minimal',
  'template-d-collage',
];

export async function generatePinConceptsAction(
  recipeId: string,
  angles?: PinterestContentAngle[],
  preferredTemplate?: PinterestCreativeStyle
): Promise<{
  success: boolean;
  creatives?: PinterestCreative[];
  error?: string;
}> {
  await checkAuth();

  try {
    const recipe = await recipeRepository.getById(recipeId);
    if (!recipe) {
      return { success: false, error: 'Recipe not found' };
    }

    const dna = extractRuleBasedRecipeDNA(recipe);
    const targetAngles = angles && angles.length > 0 ? angles : getEligibleAngles(dna).slice(0, 3);
    const createdList: PinterestCreative[] = [];

    // Select primary image (prefers R2/hero image)
    const primaryImage =
      recipe.heroImage?.url ||
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&h=1500&q=80';
    const secondaryImages = recipe.secondaryImages?.map((i) => i.url) || [];

    const canonicalDestination = `https://flavornest.xyz/recipes/${recipe.slug}`;

    for (let i = 0; i < targetAngles.length; i++) {
      const angle = targetAngles[i];
      const template = preferredTemplate || TEMPLATE_ROTATION[i % TEMPLATE_ROTATION.length];

      const copy = await generatePinterestCopy(recipe, dna, angle);

      // Check for exact duplicate
      const isDup = await pinterestRepository.checkDuplicate(recipeId, angle, copy.overlayText);
      if (!isDup) {
        const input: CreatePinterestCreativeInput = {
          recipeId,
          creativeTemplate: template,
          contentAngle: angle,
          overlayText: copy.overlayText,
          subheadline: copy.subheadline,
          title: copy.title,
          description: copy.description,
          keywords: copy.keywords,
          destinationUrl: canonicalDestination,
          boardName: copy.boardName,
          imageUrl: primaryImage,
          secondaryImageUrls: secondaryImages,
          status: 'review',
        };

        const created = await pinterestRepository.create(input);
        createdList.push(created);
      }
    }

    revalidatePath(`/admin/recipes/${recipeId}/pinterest`);

    return {
      success: true,
      creatives: createdList,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to generate Pinterest creative concepts',
    };
  }
}

export async function updatePinterestCreativeAction(
  id: string,
  updates: Partial<CreatePinterestCreativeInput>
): Promise<{
  success: boolean;
  creative?: PinterestCreative;
  error?: string;
}> {
  await checkAuth();

  try {
    const updated = await pinterestRepository.update(id, updates);
    revalidatePath(`/admin/recipes/${updated.recipeId}/pinterest`);
    return {
      success: true,
      creative: updated,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to update Pinterest creative',
    };
  }
}

export async function approvePinterestCreativeAction(id: string): Promise<{ success: boolean; error?: string }> {
  await checkAuth();

  try {
    const updated = await pinterestRepository.update(id, { status: 'approved' });
    revalidatePath(`/admin/recipes/${updated.recipeId}/pinterest`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Approval failed' };
  }
}

export async function rejectPinterestCreativeAction(id: string): Promise<{ success: boolean; error?: string }> {
  await checkAuth();

  try {
    const updated = await pinterestRepository.update(id, { status: 'archived' });
    revalidatePath(`/admin/recipes/${updated.recipeId}/pinterest`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Rejection failed' };
  }
}

export async function deletePinterestCreativeAction(id: string, recipeId: string): Promise<{ success: boolean }> {
  await checkAuth();
  await pinterestRepository.delete(id);
  revalidatePath(`/admin/recipes/${recipeId}/pinterest`);
  return { success: true };
}
