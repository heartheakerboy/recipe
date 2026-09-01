import React from 'react';
import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'Terms of Service — FlavorNest',
  description: 'Terms of service and usage conditions for FlavorNest.xyz.',
  canonicalPath: '/terms',
});

export default function TermsPage() {
  return (
    <div className="pb-24">
      <div className="bg-editorial-surfaceAlt/60 border-b border-editorial-border py-10">
        <Container size="md">
          <Breadcrumbs items={[{ name: 'Terms of Service', url: '/terms' }]} />
          <div className="mt-4 space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-editorial-text">
              Terms of Service
            </h1>
            <p className="text-xs text-editorial-muted">Last updated: August 2026</p>
          </div>
        </Container>
      </div>

      <Container size="md" className="mt-10">
        <div className="bg-white rounded-2xl border border-editorial-border p-6 sm:p-10 prose prose-stone max-w-none text-editorial-muted space-y-6">
          <p>
            Welcome to FlavorNest.xyz. By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use FlavorNest if you do not agree to all of the terms and conditions stated on this page.
          </p>

          <h2 className="font-serif text-xl font-bold text-editorial-text">1. License & Intellectual Property</h2>
          <p>
            Unless otherwise stated, FlavorNest and/or its licensors own the intellectual property rights for all editorial content, articles, images, and brand materials on FlavorNest. All intellectual property rights are reserved. You may view and print pages for your own personal use subject to restrictions set in these terms.
          </p>

          <h2 className="font-serif text-xl font-bold text-editorial-text">2. Content & Recipe Usage</h2>
          <p>
            You must not republish recipe articles without explicit permission, sell, rent, sub-license, or duplicate material from FlavorNest for commercial exploitation.
          </p>

          <h2 className="font-serif text-xl font-bold text-editorial-text">3. Disclaimer of Liability</h2>
          <p>
            All content on FlavorNest is provided on an &ldquo;as is&rdquo; basis for general inspiration and home cooking instruction. We make no warranties of any kind regarding accuracy, completeness, or safety of prepared food items.
          </p>
        </div>
      </Container>
    </div>
  );
}
