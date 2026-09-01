import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getSystemHealthAction } from '@/lib/actions/system-health-actions';
import { SystemHealthDashboard } from '@/components/admin/system-health-dashboard';

export const metadata = {
  title: 'System Health & Infrastructure | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function AdminSystemHealthPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const { components } = await getSystemHealthAction();

  return <SystemHealthDashboard initialComponents={components} />;
}
