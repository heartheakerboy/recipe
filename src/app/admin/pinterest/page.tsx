import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getPinterestDashboardDataAction } from '@/lib/actions/pinterest-publishing-actions';
import { PinterestPublishingDashboard } from '@/components/admin/pinterest-publishing-dashboard';

export const metadata = {
  title: 'Pinterest Distribution Hub | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function PinterestAdminPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const { connection, metrics, boards, publishLogs } = await getPinterestDashboardDataAction();

  return (
    <PinterestPublishingDashboard
      connection={connection}
      metrics={metrics}
      boards={boards}
      recentLogs={publishLogs}
    />
  );
}
