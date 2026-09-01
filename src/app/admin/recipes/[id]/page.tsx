import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { recipeRepository } from '@/lib/repositories/recipe.repository';
import { categoryRepository } from '@/lib/repositories/category.repository';
import { tagRepository } from '@/lib/repositories/tag.repository';
import { RecipeForm } from '@/components/admin/recipe-form';
import { verifyAdminSession } from '@/lib/auth/session';

interface AdminEditRecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditRecipePage({ params }: AdminEditRecipePageProps) {
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const recipe = await recipeRepository.getById(id);

  if (!recipe) {
    notFound();
  }

  const categories = await categoryRepository.list();
  const tags = await tagRepository.list();

  return <RecipeForm initialRecipe={recipe} categories={categories} tags={tags} />;
}
