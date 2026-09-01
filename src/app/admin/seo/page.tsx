import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getSeoDashboardDataAction } from '@/lib/actions/seo-intelligence-actions';
import { SeoDashboard } from '@/components/admin/seo-dashboard';

export const metadata = {
  title: 'SEO Intelligence & Health | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function AdminSeoPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const data = await getSeoDashboardDataAction();

  return (
    <SeoDashboard
      metrics={data.metrics}
      auditedRecipes={data.auditedRecipes}
      orphans={data.orphans}
    />
  );
}
