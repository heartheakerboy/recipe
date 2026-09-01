import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getPinterestDashboardDataAction } from '@/lib/actions/pinterest-publishing-actions';
import { PinterestQueueWorkstation } from '@/components/admin/pinterest-queue-workstation';

export const metadata = {
  title: 'Pinterest Publishing Queue | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function PinterestQueuePage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const { allCreatives, recipes, publishLogs } = await getPinterestDashboardDataAction();

  return (
    <PinterestQueueWorkstation
      creatives={allCreatives}
      recipes={recipes}
      publishLogs={publishLogs}
    />
  );
}
