import { Recipe } from '../types/recipe';
import { InternalLinkOpportunity } from '../types/seo-intelligence';

export class InternalLinkOpportunitiesService {
  findOpportunitiesForRecipe(
    targetRecipe: Recipe,
    allRecipes: Recipe[],
    maxOpportunities = 4
  ): InternalLinkOpportunity[] {
    const candidates = allRecipes.filter(
      (r) => r.id !== targetRecipe.id && r.status === 'published'
    );

    const targetIngredients = new Set(
      targetRecipe.ingredients.map((i) => i.item.toLowerCase())
    );

    const opportunities: InternalLinkOpportunity[] = [];

    for (const candidate of candidates) {
      let score = 0;
      const reasons: string[] = [];

      // 1. Same Category
      if (candidate.primaryCategorySlug === targetRecipe.primaryCategorySlug) {
        score += 35;
        reasons.push(`both in ${targetRecipe.primaryCategorySlug.replace(/-/g, ' ')}`);
      }

      // 2. Same Meal Type
      if (candidate.mealType && candidate.mealType === targetRecipe.mealType) {
        score += 20;
        reasons.push(`shared ${candidate.mealType} meal type`);
      }

      // 3. Shared Ingredients
      const sharedIngredients: string[] = [];
      for (const ing of candidate.ingredients) {
        if (targetIngredients.has(ing.item.toLowerCase())) {
          sharedIngredients.push(ing.item.toLowerCase());
        }
      }

      if (sharedIngredients.length > 0) {
        score += Math.min(30, sharedIngredients.length * 10);
        reasons.push(`features ${sharedIngredients.slice(0, 2).join(' & ')}`);
      }

      if (score >= 35) {
        // Generate natural, non-keyword-stuffed conversational anchor text
        const anchor = `our ${candidate.title.toLowerCase().replace(/recipe/g, '').trim()}`;

        opportunities.push({
          sourceRecipeId: targetRecipe.id,
          targetRecipeId: candidate.id,
          targetTitle: candidate.title,
          targetSlug: candidate.slug,
          reason: `High relevance: ${reasons.join(', ')}`,
          suggestedAnchor: anchor,
          relevanceScore: Math.min(100, score),
        });
      }
    }

    opportunities.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return opportunities.slice(0, maxOpportunities);
  }

  detectOrphanRecipes(allRecipes: Recipe[]): Array<{ recipe: Recipe; inboundLinkCount: number }> {
    const published = allRecipes.filter((r) => r.status === 'published');
    const inboundCounts = new Map<string, number>();

    // Initialize counts
    for (const r of published) {
      inboundCounts.set(r.slug, 0);
    }

    // Scan prose of all recipes for links
    for (const source of published) {
      const allText = `${source.introduction || ''} ${(source.recipeCardData?.chefTips || []).join(' ')}`.toLowerCase();
      for (const target of published) {
        if (target.slug !== source.slug && allText.includes(target.slug.toLowerCase())) {
          inboundCounts.set(target.slug, (inboundCounts.get(target.slug) || 0) + 1);
        }
      }
    }

    // Return recipes with 0 or 1 inbound link
    return published
      .map((recipe) => ({
        recipe,
        inboundLinkCount: inboundCounts.get(recipe.slug) || 0,
      }))
      .filter((item) => item.inboundLinkCount <= 1);
  }
}

export const internalLinkOpportunitiesService = new InternalLinkOpportunitiesService();
