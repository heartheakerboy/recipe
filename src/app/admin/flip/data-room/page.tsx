import React from 'react';
import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth/session';
import { DataRoomView } from '@/components/admin/data-room-view';

export const metadata = {
  title: 'Due Diligence Data Room | FlavorNest Admin',
  robots: { index: false, follow: false },
};

export default async function DataRoomPage() {
  const isAuthed = await verifyAdminSession();
  if (!isAuthed) {
    redirect('/admin/login');
  }

  return <DataRoomView />;
}
