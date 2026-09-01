import { recipeRepository } from '../repositories/recipe.repository';
import { pinterestRepository } from '../repositories/pinterest.repository';
import { publishingAuditService } from './audit-log.service';
import { indexNowService } from '../seo/indexnow.service';
import { generateRecipeJsonLd } from '../seo/structured-data';
import { revalidatePath } from 'next/cache';

export interface PublicationChecklistResult {
  canPublish: boolean;
  score: number; // 0 to 8
  checks: {
    contentComplete: boolean;
    factsValid: boolean;
    heroImageApproved: boolean;
    seoComplete: boolean;
    canonicalValid: boolean;
    categoryAssigned: boolean;
    schemaReady: boolean;
    pinterestCreativeReady: boolean;
  };
  missingRequirements: string[];
  warnings: string[];
}

export class PublishingService {
  async getPublicationChecklist(recipeId: string): Promise<PublicationChecklistResult> {
    const recipe = await recipeRepository.getById(recipeId);
    if (!recipe) {
      throw new Error(`Recipe with ID "${recipeId}" not found.`);
    }

    const missingRequirements: string[] = [];
    const warnings: string[] = [];

    // 1. Content Complete
    const contentComplete = Boolean(
      recipe.title?.trim() &&
        recipe.shortDescription?.trim() &&
        recipe.introduction?.trim() &&
        recipe.ingredients &&
        recipe.ingredients.length >= 2 &&
        recipe.instructions &&
        recipe.instructions.length >= 1
    );
    if (!contentComplete) {
      missingRequirements.push('Recipe title, description, introduction, and at least 2 ingredients and 1 instruction step are required.');
    }

    // 2. Facts Valid
    const factsValid = Boolean(
      recipe.servings > 0 &&
        recipe.totalTimeMinutes > 0 &&
        recipe.difficulty
    );
    if (!factsValid) {
      missingRequirements.push('Valid servings count (>0) and total cooking time (>0) must be specified.');
    }

    // 3. Hero Image
    const heroImageApproved = Boolean(
      recipe.heroImage?.url &&
        recipe.heroImage?.altText &&
        recipe.heroImage.url.startsWith('http')
    );
    if (!heroImageApproved) {
      missingRequirements.push('An approved hero image with descriptive alt text is required.');
    }

    // 4. SEO Complete
    const seoComplete = Boolean(
      recipe.seoTitle?.trim() &&
        recipe.metaDescription?.trim() &&
        recipe.slug?.trim()
    );
    if (!seoComplete) {
      missingRequirements.push('SEO title, meta description, and valid URL slug are required.');
    }

    // 5. Canonical URL
    const canonicalValid = Boolean(
      recipe.canonicalUrl?.startsWith('https://flavornest.xyz/recipes/')
    );
    if (!canonicalValid) {
      missingRequirements.push('A valid canonical URL (https://flavornest.xyz/recipes/{slug}/) is required.');
    }

    // 6. Category Assigned
    const categoryAssigned = Boolean(
      recipe.primaryCategorySlug?.trim() && recipe.categorySlugs.length > 0
    );
    if (!categoryAssigned) {
      missingRequirements.push('At least one recipe category must be assigned.');
    }

    // 7. Schema Ready
    let schemaReady = false;
    try {
      const jsonLd = generateRecipeJsonLd(recipe);
      schemaReady = Boolean(jsonLd && jsonLd.name && jsonLd.recipeIngredient);
    } catch {
      schemaReady = false;
    }
    if (!schemaReady) {
      missingRequirements.push('Recipe structured data (JSON-LD) generation failed.');
    }

    // 8. Pinterest Creative Ready (Non-blocking warning)
    const pinterestCreatives = await pinterestRepository.listByRecipe(recipeId);
    const pinterestCreativeReady = pinterestCreatives.some((c) => c.status === 'approved');
    if (!pinterestCreativeReady) {
      warnings.push('No approved Pinterest creatives found for this recipe. (Recommended for traffic, non-blocking).');
    }

    const checks = {
      contentComplete,
      factsValid,
      heroImageApproved,
      seoComplete,
      canonicalValid,
      categoryAssigned,
      schemaReady,
      pinterestCreativeReady,
    };

    const passedCount = Object.values(checks).filter(Boolean).length;
    const canPublish = missingRequirements.length === 0;

    return {
      canPublish,
      score: passedCount,
      checks,
      missingRequirements,
      warnings,
    };
  }

  async publishRecipe(recipeId: string, adminId = 'admin_user'): Promise<{ success: boolean; publishedUrl: string }> {
    const checklist = await this.getPublicationChecklist(recipeId);
    if (!checklist.canPublish) {
      throw new Error(`Recipe isn't ready to publish: ${checklist.missingRequirements.join(' ')}`);
    }

    const existing = await recipeRepository.getById(recipeId);
    if (!existing) throw new Error('Recipe not found');

    const prevStatus = existing.status;
    const now = new Date().toISOString();

    const updated = await recipeRepository.update(recipeId, {
      status: 'published',
    });

    // Record Audit Log
    publishingAuditService.recordEvent({
      recipeId,
      action: 'published',
      adminId,
      previousStatus: prevStatus,
      newStatus: 'published',
      details: {
        score: checklist.score,
        publishedAt: now,
      },
    });

    const canonicalUrl = `https://flavornest.xyz/recipes/${updated.slug}/`;

    // Revalidate paths
    try {
      revalidatePath(`/recipes/${updated.slug}`);
      revalidatePath(`/category/${updated.primaryCategorySlug}`);
      revalidatePath('/recipes');
      revalidatePath('/');
      revalidatePath('/sitemap.xml');
      revalidatePath('/feed.xml');
    } catch (err) {
      console.warn('Path revalidation warning:', err);
    }

    // Submit to IndexNow (Failure-safe)
    indexNowService.submitUrls([canonicalUrl]).catch((err) => {
      console.warn('IndexNow non-blocking error:', err);
    });

    return {
      success: true,
      publishedUrl: canonicalUrl,
    };
  }

  async unpublishRecipe(recipeId: string, adminId = 'admin_user'): Promise<{ success: boolean }> {
    const existing = await recipeRepository.getById(recipeId);
    if (!existing) throw new Error('Recipe not found');

    const prevStatus = existing.status;
    const updated = await recipeRepository.update(recipeId, {
      status: 'draft',
    });

    // Record Audit Log
    publishingAuditService.recordEvent({
      recipeId,
      action: 'unpublished',
      adminId,
      previousStatus: prevStatus,
      newStatus: 'draft',
    });

    // Revalidate paths
    try {
      revalidatePath(`/recipes/${updated.slug}`);
      revalidatePath(`/category/${updated.primaryCategorySlug}`);
      revalidatePath('/recipes');
      revalidatePath('/');
      revalidatePath('/sitemap.xml');
      revalidatePath('/feed.xml');
    } catch (err) {
      console.warn('Path revalidation warning:', err);
    }

    return { success: true };
  }
}

export const publishingService = new PublishingService();
