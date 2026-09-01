import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getContentClustersAction } from '@/lib/actions/content-cluster-actions';
import { ClustersDirectoryView } from '@/components/admin/clusters-directory-view';

export const metadata = {
  title: 'Topical Content Clusters | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function ContentClustersPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const clusters = await getContentClustersAction();

  return <ClustersDirectoryView clusters={clusters} />;
}
