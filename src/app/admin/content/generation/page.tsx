import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getGenerationJobsAction } from '@/lib/actions/content-cluster-actions';
import { GenerationQueueView } from '@/components/admin/generation-queue-view';

export const metadata = {
  title: 'Generation Queue & Review | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function GenerationQueuePage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const jobs = await getGenerationJobsAction();

  return <GenerationQueueView initialJobs={jobs} />;
}
