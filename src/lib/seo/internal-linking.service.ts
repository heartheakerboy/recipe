import { Recipe } from '../types/recipe';
import { recipeRepository } from '../repositories/recipe.repository';

export interface RelatedRecipeScore {
  recipe: Recipe;
  score: number;
  matchingFactors: string[];
}

export interface OrphanReportItem {
  recipeId: string;
  title: string;
  slug: string;
  status: string;
  reasons: string[];
}

export class InternalLinkingService {
  async getRelatedRecipes(targetRecipe: Recipe, limit = 6): Promise<Recipe[]> {
    const { recipes: allPublished } = await recipeRepository.list({
      status: 'published',
      limit: 200,
    });

    const candidates = allPublished.filter((r) => r.id !== targetRecipe.id && r.slug !== targetRecipe.slug);
    const scored: RelatedRecipeScore[] = [];

    for (const candidate of candidates) {
      let score = 0;
      const factors: string[] = [];

      // 1. Same Primary Category (+40 pts)
      if (candidate.primaryCategorySlug === targetRecipe.primaryCategorySlug) {
        score += 40;
        factors.push('Same primary category');
      }

      // 2. Shared Categories (+20 pts)
      const candCats = candidate.categorySlugs || [];
      const targetCats = targetRecipe.categorySlugs || [];
      const sharedCat = candCats.some((c) => targetCats.includes(c));
      if (sharedCat && candidate.primaryCategorySlug !== targetRecipe.primaryCategorySlug) {
        score += 20;
        factors.push('Shared category tag');
      }

      // 3. Same Meal Type (+15 pts)
      if (candidate.mealType && candidate.mealType === targetRecipe.mealType) {
        score += 15;
        factors.push('Same meal type');
      }

      // 4. Same Cooking Method (+15 pts)
      if (candidate.cookingMethod && candidate.cookingMethod === targetRecipe.cookingMethod) {
        score += 15;
        factors.push('Same cooking method');
      }

      // 5. Overlapping Tags (+5 pts per tag, up to 20 pts)
      const commonTags = candidate.tags.filter((t) => targetRecipe.tags.includes(t));
      if (commonTags.length > 0) {
        const tagBonus = Math.min(20, commonTags.length * 5);
        score += tagBonus;
        factors.push(`${commonTags.length} shared tags`);
      }

      if (score > 0) {
        scored.push({ recipe: candidate, score, matchingFactors: factors });
      }
    }

    scored.sort((a, b) => b.score - a.score);

    // Return top matches, or fallback to latest published if fewer than 4 scored
    const results = scored.slice(0, limit).map((s) => s.recipe);
    if (results.length < limit) {
      const remainingNeeded = limit - results.length;
      const existingIds = new Set([targetRecipe.id, ...results.map((r) => r.id)]);
      const fallbacks = candidates.filter((c) => !existingIds.has(c.id)).slice(0, remainingNeeded);
      results.push(...fallbacks);
    }

    return results;
  }

  async detectOrphanRecipes(): Promise<OrphanReportItem[]> {
    const { recipes: allPublished } = await recipeRepository.list({
      status: 'published',
      limit: 500,
    });

    const orphans: OrphanReportItem[] = [];

    for (const recipe of allPublished) {
      const reasons: string[] = [];

      if (!recipe.primaryCategorySlug || recipe.categorySlugs.length === 0) {
        reasons.push('No category assigned');
      }

      if (!recipe.tags || recipe.tags.length === 0) {
        reasons.push('No tags defined');
      }

      const related = await this.getRelatedRecipes(recipe, 3);
      if (related.length === 0) {
        reasons.push('Zero inbound related recipes found');
      }

      if (reasons.length > 0) {
        orphans.push({
          recipeId: recipe.id,
          title: recipe.title,
          slug: recipe.slug,
          status: recipe.status,
          reasons,
        });
      }
    }

    return orphans;
  }
}

export const internalLinkingService = new InternalLinkingService();
