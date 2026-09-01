'use server';

import { verifyAdminSession } from '../auth/session';
import { businessIntelligenceService } from '../business/business-intelligence.service';
import { businessIntelligenceRepository } from '../repositories/business-intelligence.repository';
import { BusinessDateRange } from '../types/business-intelligence';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    throw new Error('Unauthorized: Admin session required.');
  }
}

export async function getBusinessOverviewAction(range: BusinessDateRange = '30d') {
  await checkAuth();

  const kpis = await businessIntelligenceService.getKpiSummary();
  const trafficSources = businessIntelligenceService.getTrafficSources();
  const concentration = businessIntelligenceService.getConcentrationMetrics();
  const healthSignals = businessIntelligenceService.getHealthSignals();
  const readiness = await businessIntelligenceService.getReadinessScore();

  return {
    range,
    kpis,
    trafficSources,
    concentration,
    healthSignals,
    readiness,
  };
}

export async function getFinancialsAction() {
  await checkAuth();
  const financials = await businessIntelligenceRepository.getFinancials();
  return { financials };
}

export async function getFlipReadinessAction() {
  await checkAuth();
  const checklist = await businessIntelligenceRepository.getChecklist();
  const integrations = await businessIntelligenceRepository.getIntegrations();
  const score = await businessIntelligenceService.getReadinessScore();

  return {
    checklist,
    integrations,
    score,
  };
}

export async function toggleChecklistItemAction(id: string, verified: boolean): Promise<{ success: boolean }> {
  await checkAuth();
  const success = await businessIntelligenceRepository.toggleChecklistItem(id, verified);
  revalidatePath('/admin/flip');
  revalidatePath('/admin/business');
  return { success };
}

export async function exportDataRoomCsvAction(
  type: 'financials' | 'traffic' | 'integrations'
): Promise<{ success: boolean; csvContent?: string; filename?: string; error?: string }> {
  await checkAuth();
  try {
    const csvContent = businessIntelligenceService.generateDataRoomCsv(type);
    const filename = `flavornest-dataroom-${type}-${new Date().toISOString().split('T')[0]}.csv`;
    return { success: true, csvContent, filename };
  } catch (err: any) {
    return { success: false, error: err.message || 'Export failed' };
  }
}
