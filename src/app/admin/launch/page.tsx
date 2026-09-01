import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getLatestLaunchAuditAction } from '@/lib/actions/launch-audit-actions';
import { LaunchAuditDashboard } from '@/components/admin/launch-audit-dashboard';

export const metadata = {
  title: 'Launch Readiness & Audit | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function AdminLaunchPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const { audit } = await getLatestLaunchAuditAction();

  return <LaunchAuditDashboard initialAudit={audit} />;
}
