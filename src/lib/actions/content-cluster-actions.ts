'use server';

import { verifyAdminSession } from '../auth/session';
import { contentClusterRepository } from '../repositories/content-cluster.repository';
import { contentOpportunityService } from '../content/content-opportunity.service';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    throw new Error('Unauthorized: Admin session required.');
  }
}

export async function getContentStrategyOverviewAction() {
  await checkAuth();

  const overview = await contentOpportunityService.getOverview();
  const opportunities = await contentClusterRepository.listOpportunities();
  const clusters = await contentClusterRepository.listClusters();
  const jobs = await contentClusterRepository.listJobs();

  return {
    overview,
    opportunities,
    clusters,
    jobs,
  };
}

export async function getContentClustersAction() {
  await checkAuth();
  return contentClusterRepository.listClusters();
}

export async function getClusterDetailAction(clusterId: string) {
  await checkAuth();

  const cluster = await contentClusterRepository.getClusterById(clusterId);
  if (!cluster) return null;

  const members = await contentClusterRepository.listClusterMembers(clusterId);
  const opportunities = (await contentClusterRepository.listOpportunities()).filter(
    (o) => o.clusterId === clusterId
  );

  return {
    cluster,
    members,
    opportunities,
  };
}

export async function getGenerationJobsAction() {
  await checkAuth();
  return contentClusterRepository.listJobs();
}

export async function approveGeneratedRecipeJobAction(jobId: string): Promise<{ success: boolean }> {
  await checkAuth();
  const success = await contentClusterRepository.updateJobStatus(jobId, 'approved');
  revalidatePath('/admin/content/generation');
  revalidatePath('/admin/content');
  return { success };
}

export async function rejectGeneratedRecipeJobAction(jobId: string): Promise<{ success: boolean }> {
  await checkAuth();
  const success = await contentClusterRepository.updateJobStatus(jobId, 'rejected');
  revalidatePath('/admin/content/generation');
  revalidatePath('/admin/content');
  return { success };
}
