import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getRevenueDashboardAction } from '@/lib/actions/monetization-actions';
import { RevenueDashboard } from '@/components/admin/revenue-dashboard';

export const metadata = {
  title: 'Revenue & Ad Intelligence | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function AdminRevenuePage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const initialData = await getRevenueDashboardAction('30d');

  return <RevenueDashboard initialData={initialData as any} />;
}
