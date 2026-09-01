import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { pinterestBoardRepository } from '@/lib/repositories/pinterest-board.repository';
import { PinterestBoardsManager } from '@/components/admin/pinterest-boards-manager';

export const metadata = {
  title: 'Pinterest Board Management | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function PinterestBoardsPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  const boards = await pinterestBoardRepository.listBoards();
  const mappings = await pinterestBoardRepository.listMappings();
  const defaultBoard = await pinterestBoardRepository.getDefaultBoard();

  return (
    <PinterestBoardsManager
      boards={boards}
      mappings={mappings}
      defaultBoardId={defaultBoard?.id}
    />
  );
}
