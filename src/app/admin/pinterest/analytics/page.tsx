import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getPinterestAnalyticsDashboardAction } from '@/lib/actions/pinterest-analytics-actions';
import { PinterestAnalyticsDashboard } from '@/components/admin/pinterest-analytics-dashboard';

export const metadata = {
  title: 'Pinterest Analytics & Growth Intelligence | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function PinterestAnalyticsPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const initialData = await getPinterestAnalyticsDashboardAction('30d');

  return <PinterestAnalyticsDashboard initialData={initialData as any} />;
}
