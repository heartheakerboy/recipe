import React from 'react';
import { Metadata } from 'next';
import { Mail, MessageSquare, Clock } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { constructMetadata } from '@/lib/seo/metadata';
import { siteConfig } from '@/lib/config/site.config';

export const metadata: Metadata = constructMetadata({
  title: 'Contact Us — FlavorNest',
  description: 'Have a recipe question, culinary suggestion, or partnership inquiry? Reach out to the FlavorNest team.',
  canonicalPath: '/contact',
});

export default function ContactPage() {
  return (
    <div className="pb-24">
      <div className="bg-editorial-surfaceAlt/60 border-b border-editorial-border py-10">
        <Container size="md">
          <Breadcrumbs items={[{ name: 'Contact Us', url: '/contact' }]} />
          <div className="mt-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Get in Touch
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-black text-editorial-text tracking-tight">
              Contact FlavorNest
            </h1>
            <p className="text-base sm:text-lg text-editorial-muted leading-relaxed">
              We love hearing from home cooks, recipe enthusiasts, and editorial partners.
            </p>
          </div>
        </Container>
      </div>

      <Container size="md" className="mt-12">
        <div className="bg-white rounded-2xl border border-editorial-border p-6 sm:p-10 shadow-sm space-y-8">
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-editorial-text">
              How to Reach Us
            </h2>
            <p className="text-sm sm:text-base text-editorial-muted leading-relaxed">
              Whether you have feedback on a recipe, noticed an error in an ingredient measurement, or want to explore digital advertising opportunities, please reach out via email:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-editorial-surface border border-editorial-border space-y-2">
              <div className="flex items-center gap-2 text-brand-600 font-semibold text-sm">
                <Mail className="w-4 h-4" />
                <span>Editorial & Recipes</span>
              </div>
              <p className="text-xs text-editorial-muted">
                For recipe tips, ingredient substitutions, and general feedback:
              </p>
              <p className="text-sm font-bold text-editorial-text">
                editorial@{siteConfig.domain}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-editorial-surface border border-editorial-border space-y-2">
              <div className="flex items-center gap-2 text-brand-600 font-semibold text-sm">
                <MessageSquare className="w-4 h-4" />
                <span>Business & Partnerships</span>
              </div>
              <p className="text-xs text-editorial-muted">
                For brand partnerships, advertising, or asset acquisition inquiries:
              </p>
              <p className="text-sm font-bold text-editorial-text">
                contact@{siteConfig.domain}
              </p>
            </div>
          </div>

          <div className="border-t border-editorial-border pt-6 flex items-center gap-2 text-xs text-editorial-lightMuted">
            <Clock className="w-4 h-4" />
            <span>We typically respond to inquiries within 1-2 business days.</span>
          </div>
        </div>
      </Container>
    </div>
  );
}
