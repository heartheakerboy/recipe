'use server';

import { verifyAdminSession } from '../auth/session';
import { revenueRepository } from '../repositories/revenue.repository';
import { revenueIntelligenceService } from '../monetization/revenue-intelligence.service';
import { RevenueDateRange, MonetizationSettings } from '../types/revenue';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    throw new Error('Unauthorized: Admin session required.');
  }
}

export async function getRevenueDashboardAction(dateRange: RevenueDateRange = '30d') {
  await checkAuth();

  const records = await revenueRepository.getRevenueRecords(dateRange);
  const summary = revenueIntelligenceService.computeSummary(records);
  const settings = await revenueRepository.getSettings();

  return {
    dateRange,
    summary,
    records,
    settings,
  };
}

export async function getRecipeEconomicsAction() {
  await checkAuth();

  const records = await revenueRepository.getRevenueRecords('30d');
  const summary = revenueIntelligenceService.computeSummary(records);
  const settings = await revenueRepository.getSettings();
  const economics = await revenueIntelligenceService.computeRecipeEconomics(summary, settings);

  return {
    summary,
    economics,
    settings,
  };
}

export async function updateMonetizationSettingsAction(
  settings: Partial<MonetizationSettings>
): Promise<{ success: boolean; settings: MonetizationSettings }> {
  await checkAuth();

  const updated = await revenueRepository.updateSettings(settings);
  revalidatePath('/admin/monetization');
  revalidatePath('/admin/revenue');
  revalidatePath('/admin/revenue/recipes');

  return { success: true, settings: updated };
}

export async function exportRevenueCsvAction(): Promise<{
  success: boolean;
  csvContent?: string;
  filename?: string;
  error?: string;
}> {
  await checkAuth();
  try {
    const records = await revenueRepository.getRevenueRecords('all');
    const csvContent = revenueRepository.generateCsv(records);
    const filename = `flavornest-revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
    return { success: true, csvContent, filename };
  } catch (err: any) {
    return { success: false, error: err.message || 'Export failed' };
  }
}
