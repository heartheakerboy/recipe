'use server';

import { verifyAdminSession } from '../auth/session';
import { seoAuditService } from '../seo/seo-audit.service';
import { internalLinkOpportunitiesService } from '../seo/internal-link-opportunities.service';
import { searchPerformanceService } from '../seo/search-performance.service';
import { recipeRepository } from '../repositories/recipe.repository';
import { categoryRepository } from '../repositories/category.repository';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    throw new Error('Unauthorized: Admin session required.');
  }
}

export async function getRecipeSeoAuditAction(recipeId: string) {
  await checkAuth();

  const recipe = await recipeRepository.getById(recipeId);
  if (!recipe) throw new Error('Recipe not found');

  const { recipes: allRecipes } = await recipeRepository.list({ limit: 100 });
  const audit = seoAuditService.auditRecipe(recipe, allRecipes);
  const linkOpportunities = internalLinkOpportunitiesService.findOpportunitiesForRecipe(
    recipe,
    allRecipes
  );

  return {
    recipe,
    audit,
    linkOpportunities,
  };
}

export async function getSeoDashboardDataAction() {
  await checkAuth();

  const { recipes } = await recipeRepository.list({ limit: 100 });
  const categories = await categoryRepository.list();

  let totalFindings = 0;
  let highSeverityCount = 0;
  let mediumSeverityCount = 0;
  let lowSeverityCount = 0;
  let indexedReadyCount = 0;

  const auditedRecipes = recipes.map((r) => {
    const res = seoAuditService.auditRecipe(r, recipes);
    totalFindings += res.findings.length;
    highSeverityCount += res.highSeverityCount;
    mediumSeverityCount += res.mediumSeverityCount;
    lowSeverityCount += res.lowSeverityCount;
    if (res.highSeverityCount === 0 && r.status === 'published') {
      indexedReadyCount++;
    }
    return res;
  });

  const orphans = internalLinkOpportunitiesService.detectOrphanRecipes(recipes);

  return {
    metrics: {
      totalRecipes: recipes.length,
      publishedCount: recipes.filter((r) => r.status === 'published').length,
      indexedReadyCount,
      totalFindings,
      highSeverityCount,
      mediumSeverityCount,
      lowSeverityCount,
      orphanCount: orphans.length,
    },
    auditedRecipes,
    orphans: orphans.map((o) => ({ id: o.recipe.id, title: o.recipe.title, slug: o.recipe.slug, inboundCount: o.inboundLinkCount })),
    categoriesCount: categories.length,
  };
}

export async function getSeoOpportunitiesAction() {
  await checkAuth();

  const { recipes } = await recipeRepository.list({ limit: 100 });
  const searchAlerts = await searchPerformanceService.detectOpportunities(recipes);
  const orphans = internalLinkOpportunitiesService.detectOrphanRecipes(recipes);

  const orphanAlerts = orphans.map((o) => ({
    id: `opp_orphan_${o.recipe.id}`,
    type: 'orphan_recipe' as const,
    recipeId: o.recipe.id,
    recipeTitle: o.recipe.title,
    metricText: `Inbound Links: ${o.inboundLinkCount}`,
    recommendation: `Recipe "${o.recipe.title}" has ${o.inboundLinkCount} inbound internal links. Add contextual links from related recipes in the same category.`,
    severity: 'medium' as const,
  }));

  return {
    opportunities: [...searchAlerts, ...orphanAlerts],
  };
}

export async function applySeoSuggestionAction(
  recipeId: string,
  field: 'seoTitle' | 'metaDescription' | 'canonicalUrl' | 'heroImageAlt',
  value: string
): Promise<{ success: boolean; error?: string }> {
  await checkAuth();

  try {
    const updateData: any = {};
    if (field === 'heroImageAlt') {
      const recipe = await recipeRepository.getById(recipeId);
      if (recipe) {
        updateData.heroImageAlt = value;
      }
    } else {
      updateData[field] = value;
    }

    await recipeRepository.update(recipeId, updateData);
    revalidatePath('/admin/seo');
    revalidatePath(`/admin/recipes/${recipeId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update SEO field' };
  }
}
