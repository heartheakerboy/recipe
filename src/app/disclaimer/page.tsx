import React from 'react';
import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'Recipe & Nutrition Disclaimer — FlavorNest',
  description: 'Important recipe, allergy, food safety, and nutritional information disclaimer for FlavorNest.xyz.',
  canonicalPath: '/disclaimer',
});

export default function DisclaimerPage() {
  return (
    <div className="pb-24">
      <div className="bg-editorial-surfaceAlt/60 border-b border-editorial-border py-10">
        <Container size="md">
          <Breadcrumbs items={[{ name: 'Recipe Disclaimer', url: '/disclaimer' }]} />
          <div className="mt-4 space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-editorial-text">
              Recipe & Nutritional Disclaimer
            </h1>
            <p className="text-xs text-editorial-muted">Last updated: August 2026</p>
          </div>
        </Container>
      </div>

      <Container size="md" className="mt-10">
        <div className="bg-white rounded-2xl border border-editorial-border p-6 sm:p-10 prose prose-stone max-w-none text-editorial-muted space-y-6">
          <h2 className="font-serif text-xl font-bold text-editorial-text">1. Nutritional Information Accuracy</h2>
          <p>
            Nutritional information provided on FlavorNest.xyz (including calorie counts, grams of carbohydrates, fats, protein, and sodium) is calculated automatically based on standardized USDA food database values. This information is intended as an informational estimate and should not be used for medical or therapeutic diet planning.
          </p>

          <h2 className="font-serif text-xl font-bold text-editorial-text">2. Food Safety & Temperature Guidelines</h2>
          <p>
            Cooking times and temperatures listed across recipes are guidelines. Variations in ovens, air fryer models, stovetop burner outputs, meat thickness, and altitude can affect cooking times. Always verify that meats, poultry, and seafood are cooked to minimum safe internal temperatures recommended by the USDA (e.g. 165°F / 74°C for poultry).
          </p>

          <h2 className="font-serif text-xl font-bold text-editorial-text">3. Allergens and Cross-Contamination</h2>
          <p>
            Readers are solely responsible for reviewing ingredient lists and packaging labels to ensure ingredients are safe for individual dietary restrictions, allergies, and sensitivities. FlavorNest assumes no liability for adverse reactions or food safety incidents.
          </p>
        </div>
      </Container>
    </div>
  );
}
