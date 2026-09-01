'use server';

import { verifyAdminSession } from '../auth/session';
import { launchAuditService } from '../audit/launch-audit.service';
import { launchAuditRepository } from '../repositories/launch-audit.repository';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    throw new Error('Unauthorized: Admin session required.');
  }
}

export async function runFullLaunchAuditAction() {
  await checkAuth();
  const audit = await launchAuditService.runAudit();
  revalidatePath('/admin/launch');
  return { audit };
}

export async function getLatestLaunchAuditAction() {
  await checkAuth();
  let audit = await launchAuditRepository.getLatestAudit();
  if (!audit) {
    audit = await launchAuditService.runAudit();
  }
  return { audit };
}

export async function getLaunchChecklistAction() {
  await checkAuth();
  const checklist = await launchAuditRepository.getChecklist();
  return { checklist };
}

export async function toggleLaunchChecklistItemAction(
  id: string,
  verified: boolean
): Promise<{ success: boolean }> {
  await checkAuth();
  const success = await launchAuditRepository.toggleChecklistItem(id, verified);
  revalidatePath('/admin/launch/checklist');
  revalidatePath('/admin/launch');
  return { success };
}
