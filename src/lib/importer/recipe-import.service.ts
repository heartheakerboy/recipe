import { validateRecipeUrl, normalizeRecipeUrl } from './url-validator';
import { fetchSourceHtml } from './source-fetcher';
import { extractRecipeFromJsonLd } from './jsonld-extractor';
import { extractRecipeFromHtmlFallback, extractPageMetadata } from './html-extractor';
import { recipeRepository } from '../repositories/recipe.repository';
import { RecipeIngredient, RecipeInstruction } from '../types/recipe';
import { slugify } from '../utils/slug';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface FieldConfidence {
  confidence: ConfidenceLevel;
  source: 'jsonld' | 'html' | 'metadata' | 'default' | 'none';
  note?: string;
}

export interface NormalizedImportedRecipe {
  title: string;
  slug: string;
  shortDescription: string;
  introduction: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  mealType: string;
  cookingMethod: string;
  primaryCategorySlug: string;
  categorySlugs: string[];
  tags: string[];
  heroImageUrl: string;
  heroImageAlt: string;
  editorialStyle: string;
  sourceUrl: string;
  sourceDomain: string;
  sourceMetadata: {
    originalTitle?: string;
    extractedAt: string;
    domain: string;
    author?: string;
    ogImage?: string;
    nutrition?: any;
  };
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  existingRecipeId?: string;
  existingTitle?: string;
  existingStatus?: string;
}

export interface RecipeExtractionResult {
  success: boolean;
  originalUrl: string;
  normalizedUrl: string;
  domain: string;
  duplicate: DuplicateDetectionResult;
  recipe?: NormalizedImportedRecipe;
  confidences: Record<string, FieldConfidence>;
  warnings: string[];
  errors: string[];
  durationMs: number;
}

export class RecipeImportService {
  async checkForDuplicate(normalizedUrl: string): Promise<DuplicateDetectionResult> {
    const { recipes } = await recipeRepository.list({ limit: 1000 });
    const existing = recipes.find(
      (r) => r.sourceUrl && normalizeRecipeUrl(r.sourceUrl) === normalizedUrl
    );

    if (existing) {
      return {
        isDuplicate: true,
        existingRecipeId: existing.id,
        existingTitle: existing.title,
        existingStatus: existing.status,
      };
    }

    return { isDuplicate: false };
  }

  async importFromUrl(rawUrl: string): Promise<RecipeExtractionResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];
    const confidences: Record<string, FieldConfidence> = {};

    // 1. URL Validation
    const validation = validateRecipeUrl(rawUrl);
    if (!validation.isValid || !validation.normalizedUrl || !validation.domain) {
      return {
        success: false,
        originalUrl: rawUrl,
        normalizedUrl: rawUrl,
        domain: '',
        duplicate: { isDuplicate: false },
        confidences: {},
        warnings: [],
        errors: [validation.error || 'Invalid recipe URL'],
        durationMs: Date.now() - startTime,
      };
    }

    const normalizedUrl = validation.normalizedUrl;
    const domain = validation.domain;

    // 2. Duplicate Check
    const duplicate = await this.checkForDuplicate(normalizedUrl);
    if (duplicate.isDuplicate) {
      warnings.push(
        `This recipe source has already been imported as "${duplicate.existingTitle}" (${duplicate.existingStatus}).`
      );
    }

    // 3. Fetch Source HTML Server-Side
    const fetchResult = await fetchSourceHtml(normalizedUrl);
    if (!fetchResult.success || !fetchResult.html) {
      return {
        success: false,
        originalUrl: rawUrl,
        normalizedUrl,
        domain,
        duplicate,
        confidences: {},
        warnings,
        errors: [fetchResult.error || 'Failed to fetch source web page.'],
        durationMs: Date.now() - startTime,
      };
    }

    const html = fetchResult.html;

    // 4. Layer 1: JSON-LD Extraction
    const jsonLdRecipe = extractRecipeFromJsonLd(html);
    const htmlMetadata = extractPageMetadata(html);
    const htmlFallback = extractRecipeFromHtmlFallback(html);

    // 5. Normalization & Confidence Assignment
    let title = '';
    if (jsonLdRecipe?.title) {
      title = jsonLdRecipe.title;
      confidences.title = { confidence: 'high', source: 'jsonld' };
    } else if (htmlFallback.title) {
      title = htmlFallback.title;
      confidences.title = { confidence: 'medium', source: 'html' };
    } else {
      title = 'Imported Recipe';
      confidences.title = { confidence: 'low', source: 'none', note: 'Title not found, default used' };
      warnings.push('Recipe title could not be confidently identified.');
    }

    // Ingredients
    let ingredients: RecipeIngredient[] = [];
    if (jsonLdRecipe?.ingredients && jsonLdRecipe.ingredients.length > 0) {
      ingredients = jsonLdRecipe.ingredients;
      confidences.ingredients = { confidence: 'high', source: 'jsonld' };
    } else if (htmlFallback.ingredients.length > 0) {
      ingredients = htmlFallback.ingredients;
      confidences.ingredients = { confidence: 'medium', source: 'html' };
      warnings.push('Ingredients were extracted via HTML fallback; please verify measurements.');
    } else {
      confidences.ingredients = { confidence: 'low', source: 'none' };
      warnings.push('No ingredients could be detected. Please add ingredients manually.');
    }

    // Instructions
    let instructions: RecipeInstruction[] = [];
    if (jsonLdRecipe?.instructions && jsonLdRecipe.instructions.length > 0) {
      instructions = jsonLdRecipe.instructions;
      confidences.instructions = { confidence: 'high', source: 'jsonld' };
    } else if (htmlFallback.instructions.length > 0) {
      instructions = htmlFallback.instructions;
      confidences.instructions = { confidence: 'medium', source: 'html' };
      warnings.push('Instructions were extracted via HTML fallback; please check step order.');
    } else {
      confidences.instructions = { confidence: 'low', source: 'none' };
      warnings.push('No instructions could be detected. Please enter instructions manually.');
    }

    // Prep & Cook Times
    let prepTime = jsonLdRecipe?.prepTimeMinutes || 10;
    let cookTime = jsonLdRecipe?.cookTimeMinutes || 20;
    let totalTime = jsonLdRecipe?.totalTimeMinutes || prepTime + cookTime;

    if (jsonLdRecipe?.prepTimeMinutes || jsonLdRecipe?.cookTimeMinutes) {
      confidences.prepTime = { confidence: 'high', source: 'jsonld' };
      confidences.cookTime = { confidence: 'high', source: 'jsonld' };
    } else {
      confidences.prepTime = { confidence: 'low', source: 'default', note: 'Estimated default' };
      confidences.cookTime = { confidence: 'low', source: 'default', note: 'Estimated default' };
    }

    // Servings
    let servings = jsonLdRecipe?.servings || 4;
    confidences.servings = jsonLdRecipe?.servings
      ? { confidence: 'high', source: 'jsonld' }
      : { confidence: 'medium', source: 'default' };

    // Image
    let heroImageUrl =
      jsonLdRecipe?.imageUrl ||
      htmlMetadata.ogImage ||
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80';
    confidences.image = jsonLdRecipe?.imageUrl
      ? { confidence: 'high', source: 'jsonld' }
      : htmlMetadata.ogImage
      ? { confidence: 'medium', source: 'metadata' }
      : { confidence: 'low', source: 'default' };

    // Short Description & Introduction (Factual summary placeholder)
    const shortDesc =
      jsonLdRecipe?.description ||
      htmlMetadata.ogDescription ||
      htmlMetadata.metaDescription ||
      `A delicious home cooking recipe for ${title}.`;

    const intro = `A tested recipe for ${title}. Featuring clear step-by-step guidance and reliable cooking times.`;

    // Map Category
    let primaryCategorySlug = 'quick-and-easy';
    const lowerCategory = (jsonLdRecipe?.category || '').toLowerCase();
    if (lowerCategory.includes('chicken')) primaryCategorySlug = 'chicken';
    else if (lowerCategory.includes('pasta')) primaryCategorySlug = 'pasta';
    else if (lowerCategory.includes('air fryer') || lowerCategory.includes('air-fryer'))
      primaryCategorySlug = 'air-fryer';
    else if (lowerCategory.includes('slow cooker') || lowerCategory.includes('crockpot'))
      primaryCategorySlug = 'slow-cooker';
    else if (lowerCategory.includes('dessert') || lowerCategory.includes('sweet'))
      primaryCategorySlug = 'desserts';
    else if (lowerCategory.includes('breakfast') || lowerCategory.includes('brunch'))
      primaryCategorySlug = 'breakfast';
    else if (lowerCategory.includes('beef')) primaryCategorySlug = 'beef';

    confidences.category = jsonLdRecipe?.category
      ? { confidence: 'high', source: 'jsonld' }
      : { confidence: 'medium', source: 'inferred' as any };

    // Editorial style
    let editorialStyle = totalTime <= 30 ? 'quick-easy' : 'comfort-food';

    const normalizedRecipe: NormalizedImportedRecipe = {
      title,
      slug: slugify(title),
      shortDescription: shortDesc,
      introduction: intro,
      ingredients,
      instructions,
      prepTimeMinutes: prepTime,
      cookTimeMinutes: cookTime,
      totalTimeMinutes: totalTime,
      servings,
      difficulty: totalTime <= 30 ? 'easy' : 'medium',
      cuisine: jsonLdRecipe?.cuisine || 'American',
      mealType: 'dinner',
      cookingMethod: 'stovetop',
      primaryCategorySlug,
      categorySlugs: [primaryCategorySlug],
      tags: jsonLdRecipe?.tags || [],
      heroImageUrl,
      heroImageAlt: title,
      editorialStyle,
      sourceUrl: normalizedUrl,
      sourceDomain: domain,
      sourceMetadata: {
        originalTitle: title,
        extractedAt: new Date().toISOString(),
        domain,
        author: jsonLdRecipe?.authorName,
        ogImage: htmlMetadata.ogImage,
        nutrition: jsonLdRecipe?.nutrition,
      },
    };

    // Structured Import Log
    console.info(
      JSON.stringify({
        event: 'recipe_imported',
        domain,
        normalizedUrl,
        success: true,
        ingredientsCount: ingredients.length,
        instructionsCount: instructions.length,
        warningsCount: warnings.length,
        durationMs: Date.now() - startTime,
      })
    );

    return {
      success: true,
      originalUrl: rawUrl,
      normalizedUrl,
      domain,
      duplicate,
      recipe: normalizedRecipe,
      confidences,
      warnings,
      errors,
      durationMs: Date.now() - startTime,
    };
  }
}

export const recipeImportService = new RecipeImportService();
