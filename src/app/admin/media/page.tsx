import React from 'react';
import { imageRepository } from '@/lib/repositories/image.repository';
import { recipeRepository } from '@/lib/repositories/recipe.repository';
import { verifyAdminSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { MediaAdminManager } from '@/components/admin/media-admin-manager';

export default async function AdminMediaPage() {
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  const images = await imageRepository.list();
  const { recipes } = await recipeRepository.list({ limit: 100 });

  return <MediaAdminManager initialImages={images} recipes={recipes} />;
}
