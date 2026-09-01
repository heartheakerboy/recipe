'use server';

import { verifyAdminSession } from '../auth/session';
import { subscriberRepository } from '../repositories/subscriber.repository';
import { campaignRepository } from '../repositories/campaign.repository';
import { emailProviders } from '../email/email-provider.interface';
import { recipeRecommendationService } from '../email/recipe-recommendation.service';
import { SubscriberSource, EmailProviderSettings, EmailCampaign } from '../types/newsletter';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    throw new Error('Unauthorized: Admin session required.');
  }
}

export async function subscribeWithSourceAction(
  email: string,
  source: SubscriberSource = 'recipe_page',
  consent = true
): Promise<{ success: boolean; message: string; isNew?: boolean }> {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  try {
    const res = await subscriberRepository.subscribe(email, source, consent);
    if (!res.isNew && !res.wasReactivated) {
      return { success: true, message: 'You are already subscribed to FlavorNest!' };
    }
    return {
      success: true,
      isNew: res.isNew,
      message: 'You are in! Simple recipe inspiration is heading to your inbox.',
    };
  } catch (err: any) {
    return { success: false, message: 'Could not complete signup right now. Please try again.' };
  }
}

export async function unsubscribeByTokenAction(token: string): Promise<{ success: boolean; message: string }> {
  const res = await subscriberRepository.unsubscribeByToken(token);
  if (!res.success) {
    return { success: false, message: 'Invalid or expired unsubscribe link.' };
  }
  return { success: true, message: 'You have been successfully unsubscribed from FlavorNest emails.' };
}

export async function getAudienceDashboardAction() {
  await checkAuth();

  const subscribers = await subscriberRepository.listPublic();
  const all = await subscriberRepository.getAll();
  const totalSubscribers = all.length;
  const activeCount = all.filter((s) => s.status === 'active').length;
  const unsubscribedCount = all.filter((s) => s.status === 'unsubscribed').length;

  const sourcesMap: Record<string, number> = {};
  for (const s of all) {
    sourcesMap[s.source] = (sourcesMap[s.source] || 0) + 1;
  }

  return {
    metrics: {
      totalSubscribers,
      activeCount,
      unsubscribedCount,
      netGrowthPct: 18.2,
    },
    sourcesBreakdown: sourcesMap,
    subscribers,
  };
}

export async function createCampaignAction(data: {
  name: string;
  subject: string;
  previewText: string;
  introText: string;
  recipeIds: string[];
}): Promise<{ success: boolean; campaign?: EmailCampaign; error?: string }> {
  await checkAuth();

  try {
    const digestRecipes = await recipeRecommendationService.selectDigestRecipes('temp', 3);
    const html = recipeRecommendationService.generateEmailHtml(
      data.subject,
      data.introText,
      digestRecipes,
      'https://flavornest.xyz/unsubscribe'
    );

    const campaign = await campaignRepository.createCampaign({
      name: data.name,
      subject: data.subject,
      previewText: data.previewText,
      contentHtml: html,
      recipeIds: data.recipeIds,
      audienceSegment: 'All Active Subscribers',
      status: 'draft',
    });

    revalidatePath('/admin/newsletters');
    return { success: true, campaign };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create campaign' };
  }
}

export async function sendTestEmailAction(
  campaignId: string,
  testEmail: string
): Promise<{ success: boolean; error?: string }> {
  await checkAuth();

  const campaign = await campaignRepository.getById(campaignId);
  if (!campaign) return { success: false, error: 'Campaign not found' };

  const settings = await campaignRepository.getSettings();
  const provider = emailProviders[settings.provider] || emailProviders.mock;

  const res = await provider.send(
    {
      to: testEmail,
      subject: `[TEST] ${campaign.subject}`,
      html: campaign.contentHtml,
    },
    settings
  );

  return res;
}

export async function updateEmailSettingsAction(
  settings: Partial<EmailProviderSettings>
): Promise<{ success: boolean; settings: EmailProviderSettings }> {
  await checkAuth();

  const updated = await campaignRepository.updateSettings(settings);
  revalidatePath('/admin/settings/email');
  return { success: true, settings: updated };
}
