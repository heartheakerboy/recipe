'use server';

import { verifyAdminSession } from '../auth/session';
import { pinterestAnalyticsRepository } from '../pinterest/pinterest-analytics.repository';
import { pinterestInsightService } from '../pinterest/pinterest-insight.service';
import { pinterestAnalyticsSyncService } from '../pinterest/pinterest-analytics-sync.service';
import { PinterestDateRange } from '../types/pinterest-analytics';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    throw new Error('Unauthorized: Admin session required.');
  }
}

export async function getPinterestAnalyticsDashboardAction(dateRange: PinterestDateRange = '30d') {
  await checkAuth();

  const records = await pinterestAnalyticsRepository.getMetrics(dateRange);
  const summary = pinterestInsightService.computeSummary(records);
  const topPins = await pinterestInsightService.computeTopPins(records);
  const templates = pinterestInsightService.computeTemplatePerformance(records);
  const angles = pinterestInsightService.computeAnglePerformance(records);
  const boards = pinterestInsightService.computeBoardPerformance(records);
  const insights = pinterestInsightService.generateInsights(records);
  const syncLog = await pinterestAnalyticsSyncService.getSyncStatus();

  return {
    dateRange,
    summary,
    topPins,
    templates,
    angles,
    boards,
    insights,
    syncLog,
    totalRecords: records.length,
  };
}

export async function triggerPinterestAnalyticsSyncAction(): Promise<{
  success: boolean;
  recordsUpdated: number;
  error?: string;
}> {
  await checkAuth();
  const res = await pinterestAnalyticsSyncService.syncLatestMetrics();
  revalidatePath('/admin/pinterest/analytics');
  revalidatePath('/admin/pinterest/analytics/sync');
  return res;
}

export async function exportPinterestAnalyticsCsvAction(): Promise<{
  success: boolean;
  csvContent?: string;
  filename?: string;
  error?: string;
}> {
  await checkAuth();
  try {
    const records = await pinterestAnalyticsRepository.getMetrics('all');
    const csvContent = pinterestAnalyticsRepository.generateCsv(records);
    const filename = `flavornest-pinterest-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    return { success: true, csvContent, filename };
  } catch (err: any) {
    return { success: false, error: err.message || 'Export failed' };
  }
}
