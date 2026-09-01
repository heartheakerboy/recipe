import { PinterestMetadata } from '../types/pinterest';
import { Recipe } from '../types/recipe';
import { PinterestPinDraft, PinterestPublishResult } from './types';

export interface PinterestCreativeService {
  buildPinMetadata(recipe: Recipe): PinterestMetadata;
  generatePinDraft(recipe: Recipe): PinterestPinDraft;
  publishPin(draft: PinterestPinDraft): Promise<PinterestPublishResult>;
}

export class FlavorNestPinterestService implements PinterestCreativeService {
  buildPinMetadata(recipe: Recipe): PinterestMetadata {
    const pinTitle = `${recipe.title} (${recipe.totalTimeMinutes} Mins!)`.slice(0, 100);
    const pinDescription = `${recipe.shortDescription} Quick, easy weeknight dinner recipe with simple ingredients. Click to get the full step-by-step recipe!`.slice(0, 500);

    return {
      id: `pin_${recipe.id}`,
      recipeId: recipe.id,
      pinTitle,
      pinDescription,
      pinKeywords: [
        recipe.primaryCategorySlug.replace(/-/g, ' '),
        recipe.cookingMethod.replace(/-/g, ' '),
        'easy dinner recipes',
        '30 minute meals',
        'family dinner ideas',
      ],
      destinationUrl: `https://flavornest.xyz/recipes/${recipe.slug}`,
      imageAsset: {
        id: `img_${recipe.id}_pin`,
        r2Key: `pinterest/${recipe.slug}/pin-01.webp`,
        cdnUrl: recipe.heroImage.url,
        altText: recipe.heroImage.altText,
        width: 1000,
        height: 1500,
        format: 'webp',
        role: 'pin_vertical',
        aspectRatio: '2:3',
        createdAt: new Date().toISOString(),
      },
      creativeStyle: 'editorial_minimal',
      suggestedBoards: ['Easy Dinner Recipes', 'Quick Weeknight Meals', 'Family Favorites'],
      status: 'ready',
    };
  }

  generatePinDraft(recipe: Recipe): PinterestPinDraft {
    const meta = this.buildPinMetadata(recipe);
    return {
      title: meta.pinTitle,
      description: meta.pinDescription,
      link: meta.destinationUrl,
      boardName: meta.suggestedBoards[0] || 'Dinner Recipes',
      imageCdnUrl: meta.imageAsset.cdnUrl,
      keywords: meta.pinKeywords,
    };
  }

  async publishPin(_draft: PinterestPinDraft): Promise<PinterestPublishResult> {
    return {
      success: true,
      pinId: 'mock_pin_id_12345',
      pinUrl: 'https://pinterest.com/pin/mock_pin_id_12345',
    };
  }
}

export const pinterestService: PinterestCreativeService = new FlavorNestPinterestService();
