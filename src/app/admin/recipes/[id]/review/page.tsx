import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { getRecipeReviewDataAction } from '@/lib/actions/pipeline-actions';
import { ReviewWorkstation } from '@/components/admin/review-workstation';

export const metadata = {
  title: 'Final Editorial Review | FlavorNest Admin',
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminRecipeReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminRecipeReviewPage({ params }: AdminRecipeReviewPageProps) {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const { id } = await params;

  try {
    const data = await getRecipeReviewDataAction(id);
    return (
      <ReviewWorkstation
        recipe={data.recipe}
        recipeDna={data.recipeDna}
        pinterestCreatives={data.pinterestCreatives}
        checklist={data.checklist}
        activities={data.activities}
      />
    );
  } catch {
    notFound();
  }
}
