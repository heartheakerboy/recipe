export type RecipeEditorialAngle =
  | 'quick-easy'
  | 'comfort-food'
  | 'budget-friendly'
  | 'family-favorite'
  | 'beginner-friendly'
  | 'meal-prep'
  | 'seasonal-occasion';

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

export type RecipeMealType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'dessert'
  | 'snack'
  | 'appetizer'
  | 'side-dish';

export type RecipeCookingMethod =
  | 'air-fryer'
  | 'slow-cooker'
  | 'one-pot'
  | 'baking'
  | 'stovetop'
  | 'grilling'
  | 'instant-pot'
  | 'no-cook';

export type RecipeStatus =
  | 'draft'
  | 'processing'
  | 'review'
  | 'approved'
  | 'published'
  | 'archived';

export interface RecipeIngredient {
  id: string;
  rawText: string;
  item: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  group?: string; // e.g. "For the Marinade", "For the Sauce"
}

export interface RecipeInstruction {
  stepNumber: number;
  instructionText: string;
  title?: string;
  timerMinutes?: number;
  tip?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export interface RecipeFAQ {
  question: string;
  answer: string;
}

export interface RecipeNutrition {
  calories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  fiberGrams?: number;
  sodiumMg?: number;
  sugarGrams?: number;
}

export interface RecipeCardData {
  storageInstructions?: string;
  reheatingInstructions?: string;
  makeAheadTips?: string;
  chefTips?: string[];
  variations?: Array<string | { name: string; description: string }>;
  substitutions?: Array<{ original: string; substitute: string; note?: string }>;
  servingPairings?: string[];
  whyYoullLoveThis?: string[];
  scienceWhyItWorks?: string[];
  equipmentNeeded?: string[];
  secondaryImages?: Array<{
    url: string;
    r2Key?: string;
    altText?: string;
    width?: number;
    height?: number;
  }>;
  _sourceUrl?: string;
  _sourceMetadata?: any;
}

export interface Recipe {
  id: string;
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
  servingsUnit?: string;
  difficulty: RecipeDifficulty;
  cuisine?: string;
  mealType: RecipeMealType;
  cookingMethod: RecipeCookingMethod;
  primaryCategorySlug: string;
  categorySlugs: string[];
  tags: string[];
  heroImage: {
    url: string;
    r2Key: string;
    altText: string;
    width: number;
    height: number;
  };
  secondaryImages?: Array<{
    url: string;
    r2Key: string;
    altText: string;
    width: number;
    height: number;
  }>;
  nutrition?: RecipeNutrition;
  recipeCardData?: RecipeCardData;
  faq?: RecipeFAQ[];
  editorialStyle: RecipeEditorialAngle;
  sourceUrl?: string;
  sourceMetadata?: {
    originalTitle?: string;
    extractedAt?: string;
    domain?: string;
  };
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  status: RecipeStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  trending?: boolean;
  featured?: boolean;
}
