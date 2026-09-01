import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { collectionRepository } from '@/lib/repositories/collection.repository';
import { recipeRepository } from '@/lib/repositories/recipe.repository';
import { CollectionsManager } from '@/components/admin/collections-manager';

export const metadata = {
  title: 'Manage Collections | FlavorNest Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminCollectionsPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const collections = await collectionRepository.list();
  const { recipes } = await recipeRepository.list({ limit: 100 });

  return (
    <CollectionsManager
      initialCollections={collections}
      allRecipes={recipes}
    />
  );
}
