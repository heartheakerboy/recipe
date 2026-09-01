import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getLaunchChecklistAction } from '@/lib/actions/launch-audit-actions';
import { LaunchChecklistView } from '@/components/admin/launch-checklist-view';

export const metadata = {
  title: 'Launch Checklist | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function LaunchChecklistPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const { checklist } = await getLaunchChecklistAction();

  return <LaunchChecklistView initialChecklist={checklist} />;
}
