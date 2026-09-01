import { RecipeIngredient, RecipeInstruction, RecipeEditorialAngle } from '../types/recipe';

export interface RawExtractedRecipe {
  rawTitle: string;
  rawIngredients: string[];
  rawInstructions: string[];
  rawDescription?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  sourceUrl: string;
}

export interface NormalizedRecipeDraft {
  normalizedTitle: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
  cookingMethod: string;
  mealType: string;
  suggestedPrimaryCategory: string;
}

export interface RecipeDNAAnalysis {
  coreFlavorProfile: string[];
  complexityScore: 'simple' | 'moderate' | 'involved';
  bestEditorialAngles: Array<{
    angle: RecipeEditorialAngle;
    score: number;
    pitch: string;
  }>;
  keyDifferentiator: string;
}

export interface GeneratedArticleEditorial {
  title: string;
  shortDescription: string;
  introduction: string;
  whyThisWorks: string[];
  chefTips: string[];
  storageAdvice: string;
  faqList: Array<{ question: string; answer: string }>;
}

export interface GeneratedSEOMetadata {
  seoTitle: string;
  metaDescription: string;
  focusKeywords: string[];
  bingSearchQueries: string[];
  pinterestKeywords: string[];
}
