import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getContentStrategyOverviewAction } from '@/lib/actions/content-cluster-actions';
import { ContentStrategyDashboard } from '@/components/admin/content-strategy-dashboard';

export const metadata = {
  title: 'Content Strategy & Clusters | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function AdminContentPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const initialData = await getContentStrategyOverviewAction();

  return <ContentStrategyDashboard initialData={initialData} />;
}
