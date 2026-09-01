import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getBusinessOverviewAction } from '@/lib/actions/business-intelligence-actions';
import { BusinessOverviewDashboard } from '@/components/admin/business-overview-dashboard';

export const metadata = {
  title: 'Business Overview & Health | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function AdminBusinessPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const initialData = await getBusinessOverviewAction('30d');

  return <BusinessOverviewDashboard initialData={initialData} />;
}
