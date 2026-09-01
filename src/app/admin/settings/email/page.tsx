import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { campaignRepository } from '@/lib/repositories/campaign.repository';
import { EmailSettingsForm } from '@/components/admin/email-settings-form';

export const metadata = {
  title: 'Email Provider Settings | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function AdminEmailSettingsPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const settings = await campaignRepository.getSettings();

  return <EmailSettingsForm initialSettings={settings} />;
}
