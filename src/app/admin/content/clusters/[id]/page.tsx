import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getClusterDetailAction } from '@/lib/actions/content-cluster-actions';
import { ClusterDetailView } from '@/components/admin/cluster-detail-view';

interface ClusterPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Cluster Details | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function ClusterDetailPage({ params }: ClusterPageProps) {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const data = await getClusterDetailAction(id);

  if (!data) {
    notFound();
  }

  return (
    <ClusterDetailView
      cluster={data.cluster}
      members={data.members}
      opportunities={data.opportunities}
    />
  );
}
