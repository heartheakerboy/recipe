import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getSeoOpportunitiesAction } from '@/lib/actions/seo-intelligence-actions';
import { SeoOpportunitiesView } from '@/components/admin/seo-opportunities-view';

export const metadata = {
  title: 'Search Opportunities Hub | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function SeoOpportunitiesPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const { opportunities } = await getSeoOpportunitiesAction();

  return <SeoOpportunitiesView opportunities={opportunities} />;
}
