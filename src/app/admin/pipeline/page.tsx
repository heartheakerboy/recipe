import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getPipelineDashboardDataAction } from '@/lib/actions/pipeline-actions';
import { PipelineDashboard } from '@/components/admin/pipeline-dashboard';

export const metadata = {
  title: 'Content Operations Pipeline | FlavorNest Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPipelinePage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const { recipes, budget, stats } = await getPipelineDashboardDataAction();

  return (
    <PipelineDashboard
      initialRecipes={recipes}
      budget={budget}
      stats={stats}
    />
  );
}
