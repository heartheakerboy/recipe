import { Recipe } from '../types/recipe';
import { recipeRepository } from '../repositories/recipe.repository';

export interface DigestRecipeItem {
  recipe: Recipe;
  trackingUrl: string;
  cookingTimeText: string;
}

export class RecipeRecommendationService {
  async selectDigestRecipes(campaignId: string, limit = 3): Promise<DigestRecipeItem[]> {
    const { recipes } = await recipeRepository.list({ limit: 50 });
    const published = recipes.filter((r) => r.status === 'published');

    const selected = published.slice(0, limit);

    return selected.map((recipe) => ({
      recipe,
      cookingTimeText: `${recipe.totalTimeMinutes} Minutes`,
      trackingUrl: `https://flavornest.xyz/recipes/${recipe.slug}/?utm_source=newsletter&utm_medium=email&utm_campaign=${campaignId}`,
    }));
  }

  generateEmailHtml(
    subject: string,
    introText: string,
    recipes: DigestRecipeItem[],
    unsubscribeUrl: string
  ): string {
    const recipeCardsHtml = recipes
      .map(
        (item) => `
        <div style="margin-bottom: 24px; border: 1px solid #E4DFD7; border-radius: 16px; overflow: hidden; background-color: #FFFFFF;">
          <img src="${item.recipe.heroImage?.url || 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d'}" alt="${item.recipe.title}" style="width: 100%; height: 200px; object-fit: cover; display: block;" />
          <div style="padding: 20px;">
            <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #D94625; letter-spacing: 0.05em;">${item.cookingTimeText}</span>
            <h3 style="font-family: Georgia, serif; font-size: 18px; margin: 6px 0; color: #1E1B18;">${item.recipe.title}</h3>
            <p style="font-size: 13px; color: #6E685F; line-height: 1.5; margin: 8px 0 16px 0;">${item.recipe.shortDescription}</p>
            <a href="${item.trackingUrl}" style="display: inline-block; background-color: #D94625; color: #FFFFFF; font-size: 12px; font-weight: bold; text-decoration: none; padding: 10px 18px; border-radius: 8px;">View Full Recipe &rarr;</a>
          </div>
        </div>`
      )
      .join('');

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8F6F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 560px; margin: 0 auto; padding: 32px 16px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="font-family: Georgia, serif; font-size: 26px; font-weight: bold; color: #D94625; margin: 0;">FlavorNest</h1>
            <p style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #8C8275; margin-top: 4px;">Simple Recipes. Big Flavor.</p>
          </div>

          <!-- Intro Story -->
          <div style="background-color: #FFFFFF; border: 1px solid #E4DFD7; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #3A3530; line-height: 1.6; margin: 0;">${introText}</p>
          </div>

          <!-- Recipe Cards -->
          ${recipeCardsHtml}

          <!-- Footer -->
          <div style="text-align: center; padding-top: 16px; border-top: 1px solid #E4DFD7; font-size: 11px; color: #8C8275;">
            <p style="margin: 0 0 8px 0;">You are receiving this because you subscribed at FlavorNest.xyz.</p>
            <p style="margin: 0;"><a href="${unsubscribeUrl}" style="color: #8C8275; text-decoration: underline;">Unsubscribe from these emails</a></p>
          </div>
        </div>
      </body>
    </html>`;
  }
}

export const recipeRecommendationService = new RecipeRecommendationService();
