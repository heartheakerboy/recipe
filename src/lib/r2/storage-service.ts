import { r2Client } from './client';
import { ImageVariantRole } from '../types/image';

/**
 * Standardized R2 Key Naming Conventions:
 * - recipes/{slug}/hero.webp
 * - recipes/{slug}/step-{number}.webp
 * - recipes/{slug}/secondary-{index}.webp
 * - pinterest/{slug}/pin-{index}.webp
 */
export class R2StorageService {
  static getHeroImageKey(recipeSlug: string, format = 'webp'): string {
    return `recipes/${recipeSlug}/hero.${format}`;
  }

  static getStepImageKey(recipeSlug: string, stepNumber: number, format = 'webp'): string {
    return `recipes/${recipeSlug}/step-${String(stepNumber).padStart(2, '0')}.${format}`;
  }

  static getPinterestImageKey(recipeSlug: string, variantIndex = 1, format = 'webp'): string {
    return `pinterest/${recipeSlug}/pin-${String(variantIndex).padStart(2, '0')}.${format}`;
  }

  static getCdnUrlForRole(recipeSlug: string, role: ImageVariantRole, variant = 1): string {
    let key = '';
    switch (role) {
      case 'hero':
        key = this.getHeroImageKey(recipeSlug);
        break;
      case 'step':
        key = this.getStepImageKey(recipeSlug, variant);
        break;
      case 'pin_vertical':
        key = this.getPinterestImageKey(recipeSlug, variant);
        break;
      default:
        key = `recipes/${recipeSlug}/secondary-${String(variant).padStart(2, '0')}.webp`;
    }
    return r2Client.getPublicUrl(key);
  }
}
