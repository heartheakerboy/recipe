'use server';

import { verifyAdminSession } from '../auth/session';
import { pinterestPublisherService } from '../pinterest/pinterest-publisher.service';
import { pinterestConnectionRepository } from '../repositories/pinterest-connection.repository';
import { pinterestBoardRepository } from '../repositories/pinterest-board.repository';
import { pinterestRepository } from '../repositories/pinterest.repository';
import { recipeRepository } from '../repositories/recipe.repository';
import { PinterestCreative } from '../types/pinterest';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    throw new Error('Unauthorized: Admin session required.');
  }
}

export async function publishPinNowAction(creativeId: string): Promise<{
  success: boolean;
  pinId?: string;
  pinUrl?: string;
  error?: string;
}> {
  await checkAuth();
  const res = await pinterestPublisherService.publishPin(creativeId);
  revalidatePath('/admin/pinterest');
  revalidatePath('/admin/pinterest/queue');
  return res;
}

export async function enqueuePinsAction(creativeIds: string[]): Promise<{
  success: boolean;
  queuedCount: number;
}> {
  await checkAuth();

  let queuedCount = 0;
  for (const id of creativeIds) {
    await pinterestRepository.update(id, { status: 'queued' });
    queuedCount++;
  }

  revalidatePath('/admin/pinterest');
  revalidatePath('/admin/pinterest/queue');
  return { success: true, queuedCount };
}

export async function saveBoardMappingAction(
  categorySlug: string,
  boardId: string
): Promise<{ success: boolean }> {
  await checkAuth();

  await pinterestBoardRepository.saveMapping({
    categorySlug,
    pinterestBoardId: boardId,
    boardName: '',
  });

  revalidatePath('/admin/pinterest/boards');
  return { success: true };
}

export async function setDefaultBoardAction(boardId: string): Promise<{ success: boolean }> {
  await checkAuth();
  await pinterestBoardRepository.setDefaultBoardId(boardId);
  revalidatePath('/admin/pinterest/boards');
  return { success: true };
}

export async function disconnectPinterestAction(): Promise<{ success: boolean }> {
  await checkAuth();
  await pinterestConnectionRepository.disconnect();
  revalidatePath('/admin/settings/pinterest');
  revalidatePath('/admin/pinterest');
  return { success: true };
}

export async function getPinterestDashboardDataAction() {
  await checkAuth();

  const connection = await pinterestConnectionRepository.getPublicConnection();
  const boards = await pinterestBoardRepository.listBoards();
  const mappings = await pinterestBoardRepository.listMappings();
  const allCreatives: PinterestCreative[] = await pinterestRepository.list();
  const publishLogs = await pinterestPublisherService.listPublishLogs();
  const { recipes } = await recipeRepository.list({ limit: 100 });

  const metrics = {
    approved: allCreatives.filter((c: PinterestCreative) => c.status === 'approved' || c.status === 'review').length,
    queued: allCreatives.filter((c: PinterestCreative) => c.status === 'queued').length,
    published: allCreatives.filter((c: PinterestCreative) => c.status === 'published').length,
    failed: allCreatives.filter((c: PinterestCreative) => c.status === 'failed').length,
  };

  return {
    connection,
    boards,
    mappings,
    allCreatives,
    recipes,
    publishLogs,
    metrics,
  };
}
