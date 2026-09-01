'use server';

import { verifyAdminSession } from '../auth/session';
import { systemHealthService } from '../system/system-health.service';
import { brokenLinksAuditService } from '../system/broken-links-audit.service';
import { backgroundJobRepository } from '../repositories/background-job.repository';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    throw new Error('Unauthorized: Admin session required.');
  }
}

export async function getSystemHealthAction() {
  await checkAuth();
  const components = await systemHealthService.getComponentHealth();
  return { components };
}

export async function getPerformanceMetricsAction() {
  await checkAuth();
  const budget = systemHealthService.getPerformanceBudget();
  return { budget };
}

export async function getTechnicalSeoHealthAction() {
  await checkAuth();
  const seo = await brokenLinksAuditService.runAudit();
  return { seo };
}

export async function getBackgroundJobsAction() {
  await checkAuth();
  const jobs = await backgroundJobRepository.listJobs();
  return { jobs };
}

export async function retryFailedJobAction(jobId: string): Promise<{ success: boolean; error?: string }> {
  await checkAuth();
  const res = await backgroundJobRepository.retryJob(jobId);
  revalidatePath('/admin/system/jobs');
  revalidatePath('/admin/system/health');
  return res;
}
