import React from 'react';
import { recipeRepository } from '@/lib/repositories/recipe.repository';
import { categoryRepository } from '@/lib/repositories/category.repository';
import { tagRepository } from '@/lib/repositories/tag.repository';
import { RecipeForm } from '@/components/admin/recipe-form';
import { verifyAdminSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function AdminNewRecipePage() {
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  const categories = await categoryRepository.list();
  const tags = await tagRepository.list();

  return <RecipeForm categories={categories} tags={tags} />;
}
