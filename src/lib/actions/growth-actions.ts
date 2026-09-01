'use server';

import { verifyAdminSession } from '../auth/session';
import { growthEngineService } from '../growth/growth-engine.service';
import { growthSystemRepository } from '../repositories/growth-system.repository';
import { GrowthWeeklyGoal } from '../types/growth-system';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    throw new Error('Unauthorized: Admin session required.');
  }
}

export async function getGrowthControlCenterAction() {
  await checkAuth();

  const progress = await growthEngineService.getCycleProgress();
  const goal = await growthSystemRepository.getGoal();
  const winners = growthEngineService.getEarlyWinners();
  const scorecards = growthEngineService.getContentScorecards();
  const recommendations = await growthSystemRepository.getRecommendations();

  return {
    progress,
    goal,
    winners,
    scorecards,
    recommendations,
  };
}

export async function getGrowthExperimentsAction() {
  await checkAuth();
  const experiments = await growthSystemRepository.getExperiments();
  return { experiments };
}

export async function getGrowthWeeklyReportAction() {
  await checkAuth();
  const report = growthEngineService.getWeeklyReport();
  return { report };
}

export async function updateGrowthGoalAction(goal: GrowthWeeklyGoal): Promise<{ success: boolean }> {
  await checkAuth();
  await growthSystemRepository.updateGoal(goal);
  revalidatePath('/admin/growth');
  return { success: true };
}

export async function updateRecommendationStatusAction(
  id: string,
  status: 'accepted' | 'ignored'
): Promise<{ success: boolean }> {
  await checkAuth();
  const success = await growthSystemRepository.updateRecommendationStatus(id, status);
  revalidatePath('/admin/growth');
  return { success };
}
