'use server';

import { recipeRepository } from '../repositories/recipe.repository';
import { analyzeRecipeDNA, extractRuleBasedRecipeDNA, RecipeDNA } from '../ai/recipe-dna';
import { createRecipeFactsLock, RecipeFactsLock } from '../ai/recipe-facts';
import { selectEditorialStyle, EditorialStyleId, StyleRecommendation } from '../ai/editorial-styles';
import { generateEditorialContent, generateDeterministicEditorialDraft, GeneratedEditorialContent } from '../ai/content-generator';
import { validateEditorialQuality, QualityValidationReport } from '../ai/quality-validator';
import { aiJobService } from '../ai/ai-jobs.service';
import { verifyActionAuth, safeRevalidatePath } from './action-utils';

export async function analyzeRecipeDnaAction(recipeId: string): Promise<{
  success: boolean;
  dna?: RecipeDNA;
  facts?: RecipeFactsLock;
  styleRecommendation?: StyleRecommendation;
  error?: string;
}> {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  const startTime = Date.now();

  try {
    const recipe = await recipeRepository.getById(recipeId);
    if (!recipe) {
      return { success: false, error: `Recipe with ID ${recipeId} not found.` };
    }

    const job = aiJobService.createJob({
      entityType: 'recipe',
      entityId: recipeId,
      jobType: 'recipe_dna',
    });

    const dna = await analyzeRecipeDNA(recipe);
    const facts = createRecipeFactsLock(recipe);
    const styleRecommendation = selectEditorialStyle(dna);

    aiJobService.completeJob(job.id, JSON.stringify({ coreDish: dna.coreDish, style: styleRecommendation.primaryStyle }), Date.now() - startTime);

    return {
      success: true,
      dna,
      facts,
      styleRecommendation,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'DNA analysis failed.',
    };
  }
}

export async function generateEditorialDraftAction(
  recipeId: string,
  styleId?: EditorialStyleId
): Promise<{
  success: boolean;
  content?: GeneratedEditorialContent;
  dna?: RecipeDNA;
  facts?: RecipeFactsLock;
  styleRecommendation?: StyleRecommendation;
  qualityReport?: QualityValidationReport;
  error?: string;
}> {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  const startTime = Date.now();

  try {
    const recipe = await recipeRepository.getById(recipeId);
    if (!recipe) {
      return { success: false, error: `Recipe with ID ${recipeId} not found.` };
    }

    const dna = extractRuleBasedRecipeDNA(recipe);
    const facts = createRecipeFactsLock(recipe);
    const styleRecommendation = selectEditorialStyle(dna);
    const targetStyle = styleId || styleRecommendation.primaryStyle;

    const job = aiJobService.createJob({
      entityType: 'recipe',
      entityId: recipeId,
      jobType: 'content_generation',
    });

    const content = await generateEditorialContent(recipe, dna, facts, targetStyle);
    const qualityReport = validateEditorialQuality(content, facts);

    aiJobService.completeJob(
      job.id,
      JSON.stringify({ qualityScore: qualityReport.score, grade: qualityReport.grade }),
      Date.now() - startTime
    );

    return {
      success: true,
      content,
      dna,
      facts,
      styleRecommendation,
      qualityReport,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Content generation failed.',
    };
  }
}

export async function regenerateSectionAction(
  recipeId: string,
  section: 'introduction' | 'whyYoullLoveThis' | 'chefTips' | 'faq' | 'substitutions',
  styleId: EditorialStyleId
): Promise<{
  success: boolean;
  sectionData?: any;
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
    const facts = createRecipeFactsLock(recipe);
    const fullDraft = generateDeterministicEditorialDraft(recipe, dna, facts, styleId);

    return {
      success: true,
      sectionData: fullDraft[section],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Regeneration failed',
    };
  }
}

export async function saveTransformedDraftAction(
  recipeId: string,
  content: GeneratedEditorialContent,
  styleId: EditorialStyleId
): Promise<{
  success: boolean;
  recipeId?: string;
  error?: string;
}> {
  const auth = await verifyActionAuth();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized' };
  }

  try {
    const existingRecipe = await recipeRepository.getById(recipeId);
    const existingCardData = existingRecipe?.recipeCardData || {};

    const updated = await recipeRepository.update(recipeId, {
      title: content.title,
      slug: content.slug,
      shortDescription: content.shortDescription,
      introduction: content.introduction,
      ingredients: content.ingredients,
      instructions: content.instructions,
      editorialStyle: styleId,
      seoTitle: content.seoTitle,
      metaDescription: content.metaDescription,
      recipeCardData: {
        ...existingCardData,
        storageInstructions: content.storageInstructions,
        reheatingInstructions: content.reheatingInstructions,
        makeAheadTips: content.makeAheadTips,
        chefTips: content.chefTips,
        variations: content.variations,
        substitutions: content.substitutions,
        servingPairings: content.servingPairings,
        whyYoullLoveThis: content.whyYoullLoveThis,
        scienceWhyItWorks: content.scienceWhyItWorks,
        equipmentNeeded: content.equipmentNeeded,
      },
      faq: content.faq,
      status: 'draft', // Preserve draft status; publishing is always a manual admin action
    });

    safeRevalidatePath(`/admin/recipes/${recipeId}`);
    safeRevalidatePath(`/admin/recipes/${recipeId}/transform`);
    safeRevalidatePath('/admin/recipes');

    return {
      success: true,
      recipeId: updated.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save transformed draft',
    };
  }
}
