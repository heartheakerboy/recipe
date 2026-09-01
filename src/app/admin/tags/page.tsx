import React from 'react';
import { tagRepository } from '@/lib/repositories/tag.repository';
import { verifyAdminSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { TagAdminManager } from '@/components/admin/tag-admin-manager';

export default async function AdminTagsPage() {
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  const tags = await tagRepository.list();

  return <TagAdminManager initialTags={tags} />;
}
