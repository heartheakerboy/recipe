import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getRecipeEconomicsAction } from '@/lib/actions/monetization-actions';
import { RecipeEconomicsView } from '@/components/admin/recipe-economics-view';

export const metadata = {
  title: 'Recipe Profitability & Economics | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function RecipeEconomicsPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const { economics } = await getRecipeEconomicsAction();

  return <RecipeEconomicsView economics={economics} />;
}
