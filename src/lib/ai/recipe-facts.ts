import { Recipe, RecipeIngredient, RecipeInstruction } from '../types/recipe';

export interface LockedIngredientFact {
  rawText: string;
  item: string;
  quantity?: number;
  unit?: string;
}

export interface LockedInstructionFact {
  stepNumber: number;
  text: string;
  temperaturesDetected?: string[];
  timingsDetected?: string[];
}

export interface RecipeFactsLock {
  recipeId: string;
  title: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  ingredients: LockedIngredientFact[];
  instructions: LockedInstructionFact[];
  equipment: string[];
  checksum: string;
}

export interface FactIntegrityCheckResult {
  passed: boolean;
  score: number; // 0 to 100
  ingredientMatchRate: number; // 0 to 1
  instructionMatchRate: number; // 0 to 1
  discrepancies: string[];
  warnings: string[];
}

function extractTemperatures(text: string): string[] {
  const matches = text.match(/\b\d{2,3}\s*°\s*[FC]\b|\b\d{2,3}\s*degrees\s*(?:fahrenheit|celsius)?\b/gi);
  return matches || [];
}

function extractTimings(text: string): string[] {
  const matches = text.match(/\b\d+(?:-\d+)?\s*(?:minutes?|mins?|hours?|hrs?|seconds?|secs?)\b/gi);
  return matches || [];
}

export function createRecipeFactsLock(recipe: Recipe): RecipeFactsLock {
  const ingredients: LockedIngredientFact[] = recipe.ingredients.map((ing) => ({
    rawText: ing.rawText.trim(),
    item: ing.item.trim(),
    quantity: ing.quantity,
    unit: ing.unit,
  }));

  const instructions: LockedInstructionFact[] = recipe.instructions.map((ins) => ({
    stepNumber: ins.stepNumber,
    text: ins.instructionText.trim(),
    temperaturesDetected: extractTemperatures(ins.instructionText),
    timingsDetected: extractTimings(ins.instructionText),
  }));

  // Create lightweight deterministic checksum
  const rawPayload = JSON.stringify({
    id: recipe.id,
    ingredients: ingredients.map((i) => i.rawText),
    instructions: instructions.map((i) => i.text),
    times: [recipe.prepTimeMinutes, recipe.cookTimeMinutes, recipe.totalTimeMinutes],
    servings: recipe.servings,
  });

  let hash = 0;
  for (let i = 0; i < rawPayload.length; i++) {
    hash = (hash << 5) - hash + rawPayload.charCodeAt(i);
    hash |= 0;
  }

  return {
    recipeId: recipe.id,
    title: recipe.title,
    servings: recipe.servings,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    totalTimeMinutes: recipe.totalTimeMinutes,
    ingredients,
    instructions,
    equipment: [],
    checksum: `fact_${Math.abs(hash).toString(16)}`,
  };
}

export function verifyRecipeFactsIntegrity(
  lockedFacts: RecipeFactsLock,
  generated: {
    ingredients?: RecipeIngredient[];
    instructions?: RecipeInstruction[];
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
    totalTimeMinutes?: number;
    servings?: number;
  }
): FactIntegrityCheckResult {
  const discrepancies: string[] = [];
  const warnings: string[] = [];

  const genIngs = Array.isArray(generated?.ingredients) ? generated.ingredients : (lockedFacts?.ingredients || []);
  const genInsts = Array.isArray(generated?.instructions) ? generated.instructions : (lockedFacts?.instructions || []);
  const originalIngs = Array.isArray(lockedFacts?.ingredients) ? lockedFacts.ingredients : [];
  const originalInsts = Array.isArray(lockedFacts?.instructions) ? lockedFacts.instructions : [];

  // 1. Check Ingredient Completeness
  let matchedIngredients = 0;
  for (const original of originalIngs) {
    const origItemLower = (original.item || '').toLowerCase();
    const found = genIngs.some((gen) => {
      const genRawLower = (gen.rawText || '').toLowerCase();
      const genItemLower = (gen.item || '').toLowerCase();
      return genRawLower.includes(origItemLower) || genItemLower.includes(origItemLower) || origItemLower.includes(genItemLower);
    });

    if (found) {
      matchedIngredients++;
    } else {
      discrepancies.push(`Missing ingredient: "${original.rawText}" was in source facts but omitted from output.`);
    }
  }

  // Check for unexpected hallucinated ingredients
  if (genIngs.length > originalIngs.length + 2) {
    warnings.push(`Generated recipe contains ${genIngs.length} ingredients (expected ${originalIngs.length}). Ensure no unrelated ingredients were added.`);
  }

  const ingredientMatchRate = originalIngs.length > 0
    ? matchedIngredients / originalIngs.length
    : 1;

  // 2. Check Instruction Step Count & Core Content
  const originalStepCount = originalInsts.length;
  const generatedStepCount = genInsts.length;

  let instructionMatchRate = 1.0;
  if (generatedStepCount === 0 && originalStepCount > 0) {
    instructionMatchRate = 0;
    discrepancies.push('Generated instructions are empty.');
  } else if (generatedStepCount < Math.max(1, originalStepCount - 2)) {
    instructionMatchRate = generatedStepCount / originalStepCount;
    warnings.push(`Generated recipe has fewer instruction steps (${generatedStepCount}) than source facts (${originalStepCount}). Check for omitted cooking steps.`);
  }

  // 3. Time & Servings Consistency
  if (generated.totalTimeMinutes && generated.totalTimeMinutes !== lockedFacts.totalTimeMinutes) {
    warnings.push(`Total time modified from ${lockedFacts.totalTimeMinutes}m to ${generated.totalTimeMinutes}m.`);
  }

  if (generated.servings && generated.servings !== lockedFacts.servings) {
    warnings.push(`Servings modified from ${lockedFacts.servings} to ${generated.servings}.`);
  }

  const passed = discrepancies.length === 0 && ingredientMatchRate >= 0.9;
  const score = Math.round((ingredientMatchRate * 0.6 + instructionMatchRate * 0.4) * 100);

  return {
    passed,
    score,
    ingredientMatchRate,
    instructionMatchRate,
    discrepancies,
    warnings,
  };
}
