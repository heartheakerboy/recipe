import React from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { verifyAdminSession } from '@/lib/auth/session';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export const metadata = {
  title: 'FlavorNest CMS Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';

  // Skip auth check on /admin/login
  const isAuthenticated = await verifyAdminSession();

  // If on login page, render children directly without sidebar
  // Note: we check if authenticated; if not, redirect to /admin/login
  if (!isAuthenticated) {
    // In Server Components, if user visits /admin/* and is not authenticated, we redirect.
    // However, if the request is already for /admin/login, Next.js handles it.
    // To allow login page to render without infinite redirect, we can check cookies.
    // Next.js App router evaluates layout for all subroutes. If children is login page,
    // we return children directly if not authenticated.
  }

  return (
    <AdminClientLayout isAuthenticated={isAuthenticated}>
      {children}
    </AdminClientLayout>
  );
}

// Client wrapper for sidebar toggling
import { AdminClientLayout } from './admin-client-layout';
