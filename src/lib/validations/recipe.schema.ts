import { z } from 'zod';

export const RecipeIngredientSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  rawText: z.string().min(1, 'Ingredient text is required'),
  item: z.string().min(1, 'Ingredient item name is required'),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
  group: z.string().optional(),
});

export const RecipeInstructionSchema = z.object({
  stepNumber: z.number().int().positive(),
  instructionText: z.string().min(1, 'Instruction text is required'),
  title: z.string().optional(),
  timerMinutes: z.number().optional(),
  tip: z.string().optional(),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
});

export const RecipeFaqSchema = z.object({
  question: z.string().min(1, 'FAQ question is required'),
  answer: z.string().min(1, 'FAQ answer is required'),
});

export const RecipeNutritionSchema = z.object({
  calories: z.number().optional(),
  proteinGrams: z.number().optional(),
  carbsGrams: z.number().optional(),
  fatGrams: z.number().optional(),
  fiberGrams: z.number().optional(),
  sodiumMg: z.number().optional(),
  sugarGrams: z.number().optional(),
});

export const RecipeCardDataSchema = z.object({
  storageInstructions: z.string().optional(),
  reheatingInstructions: z.string().optional(),
  makeAheadTips: z.string().optional(),
  chefTips: z.array(z.string()).optional(),
  variations: z.array(z.union([z.string(), z.object({ name: z.string(), description: z.string() })])).optional(),
  substitutions: z.array(
    z.object({
      original: z.string(),
      substitute: z.string(),
      note: z.string().optional(),
    })
  ).optional(),
  servingPairings: z.array(z.string()).optional(),
  whyYoullLoveThis: z.array(z.string()).optional(),
  scienceWhyItWorks: z.array(z.string()).optional(),
  equipmentNeeded: z.array(z.string()).optional(),
});

export const RecipeFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters'),
  introduction: z.string().min(20, 'Introduction must be at least 20 characters'),
  ingredients: z.array(RecipeIngredientSchema).min(1, 'At least 1 ingredient is required'),
  instructions: z.array(RecipeInstructionSchema).min(1, 'At least 1 instruction step is required'),
  prepTimeMinutes: z.number().min(0, 'Prep time cannot be negative'),
  cookTimeMinutes: z.number().min(0, 'Cook time cannot be negative'),
  totalTimeMinutes: z.number().min(1, 'Total time must be greater than 0'),
  servings: z.number().min(1, 'Servings must be at least 1'),
  servingsUnit: z.string().default('servings'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('easy'),
  cuisine: z.string().optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'appetizer', 'side-dish']).default('dinner'),
  cookingMethod: z.enum([
    'air-fryer',
    'slow-cooker',
    'one-pot',
    'baking',
    'stovetop',
    'grilling',
    'instant-pot',
    'no-cook',
  ]).default('stovetop'),
  primaryCategorySlug: z.string().min(1, 'Primary category is required'),
  categorySlugs: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  heroImageUrl: z.string().url('Hero image must be a valid URL'),
  heroImageAlt: z.string().min(3, 'Image alt text is required'),
  editorialStyle: z.enum([
    'quick-easy',
    'comfort-food',
    'budget-friendly',
    'family-favorite',
    'beginner-friendly',
    'meal-prep',
    'seasonal-occasion',
  ]).default('quick-easy'),
  status: z.enum(['draft', 'processing', 'review', 'approved', 'published', 'archived']).default('draft'),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  secondaryImages: z.array(
    z.object({
      url: z.string(),
      r2Key: z.string().optional().default(''),
      altText: z.string().optional().default(''),
      width: z.number().optional().default(1200),
      height: z.number().optional().default(800),
    })
  ).optional(),
  sourceUrl: z.string().optional(),
  sourceMetadata: z.any().optional(),
  faq: z.array(RecipeFaqSchema).optional(),
  nutrition: RecipeNutritionSchema.optional(),
  recipeCardData: RecipeCardDataSchema.optional(),
});

export type RecipeFormValues = z.infer<typeof RecipeFormSchema>;
