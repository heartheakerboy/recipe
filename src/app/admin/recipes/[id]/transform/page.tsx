import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { recipeRepository } from '@/lib/repositories/recipe.repository';
import { verifyAdminSession } from '@/lib/auth/session';
import { extractRuleBasedRecipeDNA } from '@/lib/ai/recipe-dna';
import { createRecipeFactsLock } from '@/lib/ai/recipe-facts';
import { selectEditorialStyle, EditorialStyleId } from '@/lib/ai/editorial-styles';
import { generateDeterministicEditorialDraft } from '@/lib/ai/content-generator';
import { validateEditorialQuality } from '@/lib/ai/quality-validator';
import { EditorialWorkstation } from '@/components/admin/editorial-workstation';

export const metadata = {
  title: 'AI Editorial Transformation Workstation | FlavorNest Admin',
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminRecipeTransformPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminRecipeTransformPage({ params }: AdminRecipeTransformPageProps) {
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const recipe = await recipeRepository.getById(id);

  if (!recipe) {
    notFound();
  }

  // Build baseline DNA, Facts, Recommendation, and Initial Quality Draft
  const dna = extractRuleBasedRecipeDNA(recipe);
  const facts = createRecipeFactsLock(recipe);
  const recommendation = selectEditorialStyle(dna);
  const selectedStyle = (recipe.editorialStyle as EditorialStyleId) || recommendation.primaryStyle;

  const initialContent = generateDeterministicEditorialDraft(recipe, dna, facts, selectedStyle);
  const initialQualityReport = validateEditorialQuality(initialContent, facts);

  return (
    <EditorialWorkstation
      recipe={recipe}
      initialDna={dna}
      initialFacts={facts}
      initialRecommendation={recommendation}
      initialContent={initialContent}
      initialQualityReport={initialQualityReport}
    />
  );
}
