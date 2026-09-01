export interface ConsistencyValidationResult {
  valid: boolean;
  warnings: string[];
  passedChecks: string[];
}

export class RecipeConsistencyValidatorService {
  validate(recipe: {
    title: string;
    ingredients: string[];
    instructions: string[];
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
    totalTimeMinutes?: number;
  }): ConsistencyValidationResult {
    const warnings: string[] = [];
    const passedChecks: string[] = [];

    // 1. Ingredients Count Check
    if (!recipe.ingredients || recipe.ingredients.length < 3) {
      warnings.push('Recipe lists fewer than 3 ingredients, which may be incomplete.');
    } else {
      passedChecks.push(`Lists ${recipe.ingredients.length} distinct ingredients`);
    }

    // 2. Instructions Count Check
    if (!recipe.instructions || recipe.instructions.length < 2) {
      warnings.push('Recipe has fewer than 2 instruction steps.');
    } else {
      passedChecks.push(`Contains ${recipe.instructions.length} sequential instruction steps`);
    }

    // 3. Time Plausibility Check
    const prep = recipe.prepTimeMinutes || 0;
    const cook = recipe.cookTimeMinutes || 0;
    const total = recipe.totalTimeMinutes || 0;

    if (total <= 0) {
      warnings.push('Total time is 0 minutes or missing.');
    } else if (prep + cook > 0 && Math.abs(prep + cook - total) > 5) {
      warnings.push(`Time mismatch: Prep (${prep}m) + Cook (${cook}m) does not equal Total (${total}m).`);
    } else {
      passedChecks.push('Cooking durations and totals are consistent');
    }

    // 4. Ingredient Mention in Instructions
    const combinedInstructions = (recipe.instructions || []).join(' ').toLowerCase();
    const unmentionedIngredients: string[] = [];

    for (const rawIng of recipe.ingredients || []) {
      // Extract main noun e.g. "2 cloves garlic, minced" -> "garlic"
      const words = rawIng.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
      const significantWords = words.filter(
        (w) => !['cup', 'cups', 'tbsp', 'tsp', 'tablespoon', 'teaspoon', 'cloves', 'pinch', 'of', 'fresh', 'minced', 'chopped', 'sliced'].includes(w)
      );

      const found = significantWords.some((w) => combinedInstructions.includes(w));
      if (!found && significantWords.length > 0) {
        unmentionedIngredients.push(rawIng);
      }
    }

    if (unmentionedIngredients.length > 0) {
      warnings.push(
        `${unmentionedIngredients.length} ingredient(s) appear unreferenced in the instructions: ${unmentionedIngredients.slice(0, 2).join(', ')}`
      );
    } else {
      passedChecks.push('All listed ingredients are referenced in the preparation steps');
    }

    return {
      valid: warnings.length === 0,
      warnings,
      passedChecks,
    };
  }

  checkDifferentiation(
    proposedTitle: string,
    existingTitles: string[]
  ): { isDuplicate: boolean; similarityScore: number; closestMatch?: string } {
    const cleanProposed = proposedTitle.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const proposedWords = new Set(cleanProposed.split(/\s+/).filter((w) => w.length > 3));

    let maxOverlap = 0;
    let closest = '';

    for (const existing of existingTitles) {
      const cleanExisting = existing.toLowerCase().replace(/[^a-z0-9\s]/g, '');
      const existingWords = cleanExisting.split(/\s+/).filter((w) => w.length > 3);

      let overlapCount = 0;
      for (const w of existingWords) {
        if (proposedWords.has(w)) overlapCount++;
      }

      const similarity = existingWords.length > 0 ? overlapCount / Math.max(proposedWords.size, existingWords.length) : 0;
      if (similarity > maxOverlap) {
        maxOverlap = similarity;
        closest = existing;
      }
    }

    return {
      isDuplicate: maxOverlap >= 0.75,
      similarityScore: parseFloat((maxOverlap * 100).toFixed(0)),
      closestMatch: maxOverlap > 0.4 ? closest : undefined,
    };
  }
}

export const recipeConsistencyValidator = new RecipeConsistencyValidatorService();
