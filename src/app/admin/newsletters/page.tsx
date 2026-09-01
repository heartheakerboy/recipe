import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { campaignRepository } from '@/lib/repositories/campaign.repository';
import { CampaignsManager } from '@/components/admin/campaigns-manager';

export const metadata = {
  title: 'Newsletter Campaigns | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function AdminNewslettersPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const campaigns = await campaignRepository.listCampaigns();

  return <CampaignsManager initialCampaigns={campaigns} />;
}
