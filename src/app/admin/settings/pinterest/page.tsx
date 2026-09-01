import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { pinterestConnectionRepository } from '@/lib/repositories/pinterest-connection.repository';
import { PinterestConnectionCard } from '@/components/admin/pinterest-connection-card';

export const metadata = {
  title: 'Pinterest Connection Settings | FlavorNest Admin',
  robots: { index: false, follow: false },
};

interface PinterestSettingsPageProps {
  searchParams: Promise<{ connected?: string; error?: string }>;
}

export default async function PinterestSettingsPage({ searchParams }: PinterestSettingsPageProps) {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const resolvedSearchParams = await searchParams;
  const connection = await pinterestConnectionRepository.getPublicConnection();

  return (
    <div className="space-y-6">
      <div className="border-b border-editorial-border pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text">
          Pinterest Settings
        </h1>
        <p className="text-xs text-editorial-muted">
          Manage API authentication, tokens, and publishing permissions.
        </p>
      </div>

      <PinterestConnectionCard
        initialConnection={connection}
        searchParams={resolvedSearchParams}
      />
    </div>
  );
}
