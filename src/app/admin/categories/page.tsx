import React from 'react';
import { categoryRepository } from '@/lib/repositories/category.repository';
import { verifyAdminSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { CategoryAdminManager } from '@/components/admin/category-admin-manager';

export default async function AdminCategoriesPage() {
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  const categories = await categoryRepository.list();

  return <CategoryAdminManager initialCategories={categories} />;
}
