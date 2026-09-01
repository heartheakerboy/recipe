import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle2,
  ChefHat,
  Clock,
  Sparkles,
  Utensils,
  HelpCircle,
  Lightbulb,
  Repeat,
  Wine,
  Archive,
  ArrowDown,
  Flame,
  BookmarkCheck,
  Layers,
  Thermometer,
} from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { RecipeHero } from '@/components/recipe/recipe-hero';
import { IngredientList } from '@/components/recipe/ingredient-list';
import { InstructionList } from '@/components/recipe/instruction-list';
import { RecipeCardBlock } from '@/components/recipe/recipe-card-block';
import { RelatedRecipes } from '@/components/recipe/related-recipes';
import { recipeRepository } from '@/lib/repositories/recipe.repository';
import { redirectRepository } from '@/lib/repositories/redirect.repository';
import { internalLinkingService } from '@/lib/seo/internal-linking.service';
import { generateRecipeJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo/structured-data';
import { JsonLd } from '@/lib/seo/json-ld';
import { constructMetadata } from '@/lib/seo/metadata';
import { AdSlot } from '@/components/monetization/ad-slot';
import { NewsletterSignup } from '@/components/newsletter/newsletter-signup';

interface RecipePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await recipeRepository.getBySlug(slug);

  if (!recipe || recipe.status !== 'published') {
    return {
      title: 'Recipe Not Found | FlavorNest',
      robots: { index: false, follow: false },
    };
  }

  return constructMetadata({
    title: recipe.seoTitle,
    description: recipe.metaDescription,
    canonicalPath: `/recipes/${recipe.slug}/`,
    image: recipe.heroImage.url,
    imageAlt: recipe.heroImage.altText,
    type: 'article',
    publishedTime: recipe.publishedAt,
    modifiedTime: recipe.updatedAt,
  });
}

export default async function RecipeDetailPage({ params }: RecipePageProps) {
  const { slug } = await params;

  // Check 301 Redirects Table
  const redirectRecord = await redirectRepository.getBySourcePath(`/recipes/${slug}/`);
  if (redirectRecord) {
    redirect(redirectRecord.destinationPath);
  }

  const recipe = await recipeRepository.getBySlug(slug);

  // If recipe does not exist or is not published, return 404
  if (!recipe || recipe.status !== 'published') {
    notFound();
  }

  const cardData = recipe.recipeCardData || {};
  const relatedRecipes = await internalLinkingService.getRelatedRecipes(recipe, 6);
  const recipeJsonLd = generateRecipeJsonLd(recipe);
  const breadcrumbsData = [
    { name: 'Home', url: 'https://flavornest.xyz/' },
    { name: 'Recipes', url: 'https://flavornest.xyz/recipes/' },
    {
      name: recipe.primaryCategorySlug.replace(/-/g, ' '),
      url: `https://flavornest.xyz/category/${recipe.primaryCategorySlug}/`,
    },
    { name: recipe.title, url: `https://flavornest.xyz/recipes/${recipe.slug}/` },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbsData);

  return (
    <div className="pb-24 font-sans">
      <JsonLd data={[recipeJsonLd, breadcrumbJsonLd]} />

      {/* Top Breadcrumbs Section */}
      <div className="bg-editorial-surfaceAlt/50 border-b border-editorial-border py-4 sm:py-6">
        <Container size="md">
          <Breadcrumbs
            items={[
              { name: 'Recipes', url: '/recipes/' },
              {
                name: recipe.primaryCategorySlug.replace(/-/g, ' '),
                url: `/category/${recipe.primaryCategorySlug}/`,
              },
              { name: recipe.title, url: `/recipes/${recipe.slug}/` },
            ]}
          />
        </Container>
      </div>

      <Container size="md" className="mt-8 space-y-12">
        {/* Recipe Hero with Jump to Recipe and Save to Pinterest */}
        <RecipeHero recipe={recipe} />

        {/* Section 1: Introduction & Editorial Overview */}
        <section className="space-y-6 pt-4 border-t border-editorial-border">
          <div className="prose prose-lg max-w-none text-editorial-text leading-relaxed font-serif text-lg sm:text-xl space-y-4">
            {recipe.introduction.split('\n\n').map((para, i) => (
              <p key={i} className="text-editorial-muted leading-relaxed font-sans text-base sm:text-lg">
                {para}
              </p>
            ))}
          </div>

          {/* Why You'll Love This Recipe */}
          {Array.isArray(cardData.whyYoullLoveThis) && cardData.whyYoullLoveThis.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-brand-50/50 border border-brand-200/80 space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-950 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                <span>Why You&rsquo;ll Love This Recipe</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cardData.whyYoullLoveThis.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-brand-900 leading-snug">
                    <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Section 2: The Science of Why This Recipe Works */}
        {Array.isArray(cardData.scienceWhyItWorks) && cardData.scienceWhyItWorks.length > 0 && (
          <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-slate-100 space-y-4 shadow-md">
            <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4 text-brand-400" />
              <span>Test Kitchen Science</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              The Science: Why This Recipe Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {cardData.scienceWhyItWorks.map((item, idx) => {
                const [heading, ...desc] = item.includes(':') ? item.split(':') : [`Secret ${idx + 1}`, item];
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                    <h3 className="font-bold text-brand-300 text-sm">{heading.trim()}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {desc.join(':').trim()}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* In-Content Ad Placement 1 */}
        <AdSlot slot="recipe_after_intro" />

        {/* Section 3: Ingredients & Substitutions Guide */}
        <section className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text">
              Ingredients You&rsquo;ll Need
            </h2>
            <p className="text-sm text-editorial-muted leading-relaxed mt-1">
              Fresh, accessible components designed for maximum flavor harmony. Exact measurements are in the recipe card below.
            </p>
          </div>

          <IngredientList ingredients={recipe.ingredients} />

          {/* Substitutions Guide */}
          {Array.isArray(cardData.substitutions) && cardData.substitutions.length > 0 && (
            <div className="p-6 rounded-2xl bg-editorial-surface border border-editorial-border space-y-3">
              <h3 className="font-serif text-lg font-bold text-editorial-text flex items-center gap-2">
                <Repeat className="w-4 h-4 text-brand-600" />
                <span>Smart Ingredient Substitutions</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cardData.substitutions.map((sub, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-editorial-border text-xs sm:text-sm space-y-1">
                    <div className="flex items-center gap-2 font-bold text-editorial-text">
                      <span>{sub.original}</span>
                      <span className="text-brand-600">&rarr;</span>
                      <span className="text-brand-700">{sub.substitute}</span>
                    </div>
                    {sub.note && <p className="text-editorial-muted text-xs leading-relaxed">{sub.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* In-Content Ad Placement 2 */}
        <AdSlot slot="recipe_after_ingredients" />

        {/* Section 4: Step-by-Step Instructions */}
        <section className="space-y-6">
          <InstructionList instructions={recipe.instructions} />
        </section>

        {/* Section 5: Chef's Crucial Pro Tips & Common Mistakes */}
        {Array.isArray(cardData.chefTips) && cardData.chefTips.length > 0 && (
          <section className="p-6 sm:p-8 rounded-3xl bg-amber-50/60 border border-amber-200/90 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-amber-950 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-amber-600" />
              <span>Chef&rsquo;s Crucial Tips for Success</span>
            </h2>
            <div className="space-y-3">
              {cardData.chefTips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm sm:text-base text-amber-950 leading-relaxed">
                  <span className="w-6 h-6 rounded-full bg-amber-200/80 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 6: Flavor Variations & Customizations */}
        {Array.isArray(cardData.variations) && cardData.variations.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text flex items-center gap-2">
              <Layers className="w-6 h-6 text-brand-600" />
              <span>Flavor Variations & Customizations</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {cardData.variations.map((v: any, idx) => {
                const name = typeof v === 'string' ? `Variation ${idx + 1}` : v.name;
                const desc = typeof v === 'string' ? v : v.description;
                return (
                  <div key={idx} className="p-5 rounded-2xl bg-white border border-editorial-border shadow-sm space-y-1.5">
                    <h3 className="font-serif font-bold text-base text-editorial-text">{name}</h3>
                    <p className="text-xs sm:text-sm text-editorial-muted leading-relaxed">{desc}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Section 7: Serving Pairings */}
        {Array.isArray(cardData.servingPairings) && cardData.servingPairings.length > 0 && (
          <section className="p-6 rounded-2xl bg-editorial-surface border border-editorial-border space-y-3">
            <h2 className="font-serif text-xl font-bold text-editorial-text flex items-center gap-2">
              <Utensils className="w-5 h-5 text-brand-600" />
              <span>What to Serve With This</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {cardData.servingPairings.map((pairing, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-editorial-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                  <span>{pairing}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 8: Printable Recipe Card Block */}
        <section id="recipe-card" className="pt-4">
          <RecipeCardBlock recipe={recipe} />
        </section>

        {/* Section 9: Frequently Asked Questions (FAQ) */}
        {Array.isArray(recipe.faq) && recipe.faq.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-editorial-border">
            <div>
              <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-1">
                Got Questions? We&rsquo;ve Got Answers
              </h2>
            </div>

            <div className="space-y-4">
              {recipe.faq.map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white border border-editorial-border shadow-sm space-y-2">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-editorial-text">
                    {item.question}
                  </h3>
                  <p className="text-sm sm:text-base text-editorial-muted leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Newsletter Signup */}
        <NewsletterSignup
          source="recipe_page"
          title="Loved this recipe? Get our weekly dinner ideas."
          description="Join thousands of home cooks getting simple, delicious weeknight recipes delivered fresh every week."
        />

        {/* Section 10: Contextual Related Recipes */}
        {relatedRecipes.length > 0 && (
          <section className="space-y-6 pt-8 border-t border-editorial-border">
            <RelatedRecipes
              recipes={relatedRecipes}
              categorySlug={recipe.primaryCategorySlug}
              categoryName={recipe.primaryCategorySlug.replace(/-/g, ' ')}
            />
          </section>
        )}
      </Container>
    </div>
  );
}
