import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getGrowthExperimentsAction } from '@/lib/actions/growth-actions';
import { GrowthExperimentsView } from '@/components/admin/growth-experiments-view';

export const metadata = {
  title: 'Growth Experiments | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function GrowthExperimentsPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const { experiments } = await getGrowthExperimentsAction();

  return <GrowthExperimentsView experiments={experiments} />;
}
