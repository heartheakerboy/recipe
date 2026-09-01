import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getFlipReadinessAction } from '@/lib/actions/business-intelligence-actions';
import { FlipReadinessView } from '@/components/admin/flip-readiness-view';

export const metadata = {
  title: 'Flip Readiness Hub | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function FlipReadinessPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const initialData = await getFlipReadinessAction();

  return <FlipReadinessView initialData={initialData} />;
}
