import {
  RecipeExtractionService,
  RecipeNormalizationService,
  RecipeDNAAnalyzer,
  EditorialArticleGenerator,
  SEOGenerationService,
} from './pipeline-interface';
import {
  RawExtractedRecipe,
  NormalizedRecipeDraft,
  RecipeDNAAnalysis,
  GeneratedArticleEditorial,
  GeneratedSEOMetadata,
} from './types';
import { RecipeEditorialAngle } from '../types/recipe';

export class MockAIPipelineService
  implements
    RecipeExtractionService,
    RecipeNormalizationService,
    RecipeDNAAnalyzer,
    EditorialArticleGenerator,
    SEOGenerationService
{
  async extractFromUrl(targetUrl: string): Promise<RawExtractedRecipe> {
    return {
      rawTitle: 'Sample Extracted Dish',
      rawIngredients: ['2 chicken breasts', '1 cup heavy cream', '4 cloves garlic'],
      rawInstructions: ['Sear chicken', 'Simmer cream with garlic', 'Combine and serve'],
      sourceUrl: targetUrl,
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
    };
  }

  async normalize(raw: RawExtractedRecipe): Promise<NormalizedRecipeDraft> {
    return {
      normalizedTitle: raw.rawTitle,
      ingredients: raw.rawIngredients.map((ing, i) => ({
        id: String(i + 1),
        rawText: ing,
        item: ing,
      })),
      instructions: raw.rawInstructions.map((ins, i) => ({
        stepNumber: i + 1,
        instructionText: ins,
      })),
      prepTimeMinutes: raw.prepTimeMinutes || 10,
      cookTimeMinutes: raw.cookTimeMinutes || 20,
      totalTimeMinutes: (raw.prepTimeMinutes || 10) + (raw.cookTimeMinutes || 20),
      servings: 4,
      cookingMethod: 'stovetop',
      mealType: 'dinner',
      suggestedPrimaryCategory: 'quick-and-easy',
    };
  }

  async analyze(_draft: NormalizedRecipeDraft): Promise<RecipeDNAAnalysis> {
    return {
      coreFlavorProfile: ['Garlic', 'Savory Cream', 'Herb'],
      complexityScore: 'simple',
      bestEditorialAngles: [
        {
          angle: 'quick-easy',
          score: 0.95,
          pitch: 'Perfect 30-minute weeknight dinner win with minimal dishes.',
        },
      ],
      keyDifferentiator: 'Fast velvety sauce made directly in the skillet without roux.',
    };
  }

  async generateArticle(
    draft: NormalizedRecipeDraft,
    _angle: RecipeEditorialAngle
  ): Promise<GeneratedArticleEditorial> {
    return {
      title: draft.normalizedTitle,
      shortDescription: `A foolproof, flavor-packed ${draft.normalizedTitle} ready in under ${draft.totalTimeMinutes} minutes.`,
      introduction: `This ${draft.normalizedTitle} combines simple wholesome ingredients into an irresistible family favorite.`,
      whyThisWorks: [
        'High heat searing locks in moisture.',
        'Pan drippings enrich the final sauce with deep caramelized depth.',
      ],
      chefTips: [
        'Always bring meat close to room temperature for 10 minutes before searing.',
      ],
      storageAdvice: 'Refrigerate in an airtight container for up to 3 days.',
      faqList: [
        {
          question: 'Can I make this ahead?',
          answer: 'Yes, prep the ingredients ahead and cook fresh for optimal texture.',
        },
      ],
    };
  }

  async generateMetadata(
    draft: NormalizedRecipeDraft,
    _article: GeneratedArticleEditorial,
    _angle: RecipeEditorialAngle
  ): Promise<GeneratedSEOMetadata> {
    return {
      seoTitle: `${draft.normalizedTitle} (Easy ${draft.totalTimeMinutes}-Min Recipe) | FlavorNest`,
      metaDescription: `Learn how to make delicious ${draft.normalizedTitle} in just ${draft.totalTimeMinutes} minutes with simple step-by-step instructions.`,
      focusKeywords: [draft.normalizedTitle.toLowerCase(), 'easy recipe', 'weeknight dinner'],
      bingSearchQueries: [`how to cook ${draft.normalizedTitle.toLowerCase()}`, `best ${draft.normalizedTitle.toLowerCase()} recipe`],
      pinterestKeywords: [`${draft.normalizedTitle.toLowerCase()} easy`, 'dinner ideas weeknight', 'quick recipes'],
    };
  }
}

export const aiPipeline = new MockAIPipelineService();
