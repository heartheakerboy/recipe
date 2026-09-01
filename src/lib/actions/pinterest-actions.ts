'use server';

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
import { verifyActionAuth, safeRevalidatePath } from './action-utils';

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
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  try {
    const recipe = await recipeRepository.getById(recipeId);
    if (!recipe) return { success: false, error: 'Recipe not found' };

    const dna = extractRuleBasedRecipeDNA(recipe);
    const targetAngles = angles && angles.length > 0 ? angles : getEligibleAngles(dna).slice(0, 3);

    const createdCreatives: PinterestCreative[] = [];

    for (let i = 0; i < targetAngles.length; i++) {
      const angle = targetAngles[i];
      const template = preferredTemplate || TEMPLATE_ROTATION[i % TEMPLATE_ROTATION.length];

      let copy;
      try {
        copy = await generatePinterestCopy(recipe, dna, angle);
      } catch {
        copy = generateDeterministicPinterestCopy(recipe, dna, angle);
      }

      const input: CreatePinterestCreativeInput = {
        recipeId: recipe.id,
        title: copy.title,
        description: copy.description,
        boardName: copy.boardName,
        keywords: copy.keywords,
        contentAngle: angle,
        creativeTemplate: template,
        overlayText: copy.overlayText,
        subheadline: copy.subheadline,
        imageUrl: recipe.heroImage?.url || '',
        status: 'draft',
        destinationUrl: `https://flavornest.xyz/recipes/${recipe.slug}?utm_source=pinterest&utm_medium=social&utm_campaign=pin_${angle}`,
      };

      const creative = await pinterestRepository.create(input);
      createdCreatives.push(creative);
    }

    safeRevalidatePath(`/admin/recipes/${recipeId}/pinterest`);

    return {
      success: true,
      creatives: createdCreatives,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to generate pin concepts',
    };
  }
}

export async function updatePinterestCreativeAction(
  id: string,
  updates: Partial<PinterestCreative>
): Promise<{
  success: boolean;
  creative?: PinterestCreative;
  error?: string;
}> {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  try {
    const updated = await pinterestRepository.update(id, updates);
    safeRevalidatePath(`/admin/recipes/${updated.recipeId}/pinterest`);
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
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  try {
    const updated = await pinterestRepository.update(id, { status: 'approved' });
    safeRevalidatePath(`/admin/recipes/${updated.recipeId}/pinterest`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Approval failed' };
  }
}

export async function rejectPinterestCreativeAction(id: string): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  try {
    const updated = await pinterestRepository.update(id, { status: 'archived' });
    safeRevalidatePath(`/admin/recipes/${updated.recipeId}/pinterest`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Rejection failed' };
  }
}

export async function deletePinterestCreativeAction(id: string, recipeId: string): Promise<{ success: boolean }> {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false };
  }
  await pinterestRepository.delete(id);
  safeRevalidatePath(`/admin/recipes/${recipeId}/pinterest`);
  return { success: true };
}
