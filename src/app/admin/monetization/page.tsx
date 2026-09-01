import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { revenueRepository } from '@/lib/repositories/revenue.repository';
import { MonetizationSettingsForm } from '@/components/admin/monetization-settings-form';

export const metadata = {
  title: 'Ad Placements & Monetization Settings | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function MonetizationSettingsPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const settings = await revenueRepository.getSettings();

  return <MonetizationSettingsForm initialSettings={settings} />;
}
