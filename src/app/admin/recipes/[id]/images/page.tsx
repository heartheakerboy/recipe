import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { recipeRepository } from '@/lib/repositories/recipe.repository';
import { verifyAdminSession } from '@/lib/auth/session';
import { extractRuleBasedRecipeDNA } from '@/lib/ai/recipe-dna';
import { imageHistoryService } from '@/lib/images/image-history.service';
import { ImageStudio } from '@/components/admin/image-studio';

export const metadata = {
  title: 'FLUX AI Image Studio | FlavorNest Admin',
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminRecipeImagesPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminRecipeImagesPage({ params }: AdminRecipeImagesPageProps) {
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const recipe = await recipeRepository.getById(id);

  if (!recipe) {
    notFound();
  }

  const recipeDna = extractRuleBasedRecipeDNA(recipe);
  const initialHistory = imageHistoryService.listByRecipe(id);

  return (
    <ImageStudio
      recipe={recipe}
      recipeDna={recipeDna}
      initialHistory={initialHistory}
    />
  );
}
