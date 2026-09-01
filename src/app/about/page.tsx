import React from 'react';
import { Metadata } from 'next';
import { ChefHat, Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { constructMetadata } from '@/lib/seo/metadata';
import { siteConfig } from '@/lib/config/site.config';

export const metadata: Metadata = constructMetadata({
  title: 'About FlavorNest — Simple Recipes. Big Flavor.',
  description:
    'Learn about our editorial principles, commitment to dependable home cooking, and how we craft delicious, approachable recipes for every home kitchen.',
  canonicalPath: '/about',
});

export default function AboutPage() {
  return (
    <div className="pb-24">
      <div className="bg-editorial-surfaceAlt/60 border-b border-editorial-border py-10">
        <Container size="md">
          <Breadcrumbs items={[{ name: 'About Us', url: '/about' }]} />
          <div className="mt-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Editorial Standards & Story
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-black text-editorial-text tracking-tight">
              About FlavorNest
            </h1>
            <p className="text-base sm:text-lg text-editorial-muted leading-relaxed">
              {siteConfig.tagline}
            </p>
          </div>
        </Container>
      </div>

      <Container size="md" className="mt-12 space-y-10">
        <section className="prose prose-stone max-w-none text-editorial-text space-y-4">
          <h2 className="font-serif text-2xl font-bold text-editorial-text">
            Our Mission: Delicious Cooking Made Simple
          </h2>
          <p className="text-base sm:text-lg text-editorial-muted leading-relaxed">
            Welcome to <strong>FlavorNest.xyz</strong>. We believe that cooking great food at home shouldn’t require hard-to-find ingredients, culinary school techniques, or hours of sink cleanup.
          </p>
          <p className="text-base text-editorial-muted leading-relaxed">
            Every recipe on FlavorNest is formulated with clear, realistic timing, accessible grocery staples, and practical kitchen steps. Our goal is to give you total confidence that whatever you start making at 6:00 PM turns into a flavorful, comforting dinner on the table by 6:30 PM.
          </p>
        </section>

        <section id="editorial" className="p-6 sm:p-8 rounded-2xl bg-white border border-editorial-border space-y-6 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-editorial-text flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-500" />
            <span>Our 4 Editorial Pillars</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <h3 className="font-serif text-base font-bold text-editorial-text">1. Everyday Ingredients</h3>
              <p className="text-xs sm:text-sm text-editorial-muted leading-relaxed">
                No wild ingredient scavenger hunts. Our recipes leverage supermarket staples and pantry spices that deliver huge flavor payoff.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif text-base font-bold text-editorial-text">2. Tested Timing & Heat</h3>
              <p className="text-xs sm:text-sm text-editorial-muted leading-relaxed">
                Accurate cook times and clear heat settings ensure your meat stays tender and your sauces never break.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif text-base font-bold text-editorial-text">3. Clean Visual Guidance</h3>
              <p className="text-xs sm:text-sm text-editorial-muted leading-relaxed">
                Step-by-step instructions with distinct visual cues (like golden bubbling cheese or aromatic garlic) so you always know when to advance.
              </p>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif text-base font-bold text-editorial-text">4. Zero Fluff, Human First</h3>
              <p className="text-xs sm:text-sm text-editorial-muted leading-relaxed">
                We respect your time. Jump straight to the recipe card or skim chef tips with zero endless scrolling or distracting popups.
              </p>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
