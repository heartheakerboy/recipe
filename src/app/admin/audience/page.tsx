import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getAudienceDashboardAction } from '@/lib/actions/newsletter-mgmt-actions';
import { AudienceDashboard } from '@/components/admin/audience-dashboard';

export const metadata = {
  title: 'Audience & Subscriber Growth | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function AdminAudiencePage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const initialData = await getAudienceDashboardAction();

  return <AudienceDashboard initialData={initialData} />;
}
