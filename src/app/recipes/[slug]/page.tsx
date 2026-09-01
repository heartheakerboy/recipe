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

        {/* Section 1: Why You'll Love This Recipe */}
        <section className="space-y-4 pt-4 border-t border-editorial-border">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-500" />
            <span>Why You&rsquo;ll Love This Recipe</span>
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-editorial-muted">
            {recipe.introduction}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-editorial-surface border border-editorial-border">
              <span className="font-bold text-xs uppercase tracking-wider text-brand-600 block mb-1">
                Fast Prep
              </span>
              <p className="text-sm text-editorial-muted">
                Ready in just {recipe.totalTimeMinutes} minutes from start to finish.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-editorial-surface border border-editorial-border">
              <span className="font-bold text-xs uppercase tracking-wider text-brand-600 block mb-1">
                Everyday Staples
              </span>
              <p className="text-sm text-editorial-muted">
                Made using approachable pantry ingredients you already own.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-editorial-surface border border-editorial-border">
              <span className="font-bold text-xs uppercase tracking-wider text-brand-600 block mb-1">
                Foolproof Results
              </span>
              <p className="text-sm text-editorial-muted">
                Tested times and temperatures for foolproof tenderness.
              </p>
            </div>
          </div>
        </section>

        {/* Respectful In-Content Ad Placement 1 */}
        <AdSlot slot="recipe_after_intro" />

        {/* Section 2: Ingredients */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text">
            Ingredients You&rsquo;ll Need
          </h2>
          <p className="text-sm text-editorial-muted leading-relaxed">
            Here are the key ingredients required. For exact measurements, jump to the recipe card below.
          </p>
          <IngredientList ingredients={recipe.ingredients} />
        </section>

        {/* Respectful In-Content Ad Placement 2 */}
        <AdSlot slot="recipe_after_ingredients" />

        {/* Section 3: Step-by-Step Instructions */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text">
            How to Make It Step-by-Step
          </h2>
          <InstructionList instructions={recipe.instructions} />
        </section>

        {/* Section 4: Pro Tips & Substitutions */}
        <section className="p-6 sm:p-8 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-4">
          <h3 className="font-serif text-xl font-bold text-amber-950 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <span>Chef&rsquo;s Helpful Tips & Variations</span>
          </h3>
          <ul className="space-y-2.5 text-sm text-amber-900 leading-relaxed list-disc list-inside">
            <li>
              <strong>Pat dry before cooking:</strong> Remove excess moisture with paper towels for maximum browning.
            </li>
            <li>
              <strong>Don&rsquo;t crowd the pan:</strong> Give the ingredients room to sear rather than steam.
            </li>
            <li>
              <strong>Make it dairy-free:</strong> Substitute full-fat coconut milk or cashew cream for heavy cream if desired.
            </li>
          </ul>
        </section>

        {/* Section 5: Printable Recipe Card Block */}
        <section id="recipe-card" className="pt-4">
          <RecipeCardBlock recipe={recipe} />
        </section>

        {/* Newsletter Signup: Converting Reader to Returning Audience */}
        <NewsletterSignup
          source="recipe_page"
          title="Loved this recipe? Get our weekly dinner ideas."
          description="Join thousands of home cooks getting simple, delicious weeknight recipes delivered fresh every week."
        />

        {/* Section 6: Contextual Related Recipes */}
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
