import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { recipeRepository } from '@/lib/repositories/recipe.repository';
import { pinterestRepository } from '@/lib/repositories/pinterest.repository';
import { verifyAdminSession } from '@/lib/auth/session';
import { extractRuleBasedRecipeDNA } from '@/lib/ai/recipe-dna';
import { PinterestStudio } from '@/components/admin/pinterest-studio';

export const metadata = {
  title: 'Pinterest Creative Studio | FlavorNest Admin',
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminRecipePinterestPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminRecipePinterestPage({ params }: AdminRecipePinterestPageProps) {
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
  const initialCreatives = await pinterestRepository.listByRecipe(id);

  return (
    <PinterestStudio
      recipe={recipe}
      recipeDna={recipeDna}
      initialCreatives={initialCreatives}
    />
  );
}
