import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Edit, ArrowLeft, AlertTriangle } from 'lucide-react';
import { recipeRepository } from '@/lib/repositories/recipe.repository';
import { verifyAdminSession } from '@/lib/auth/session';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { RecipeHero } from '@/components/recipe/recipe-hero';
import { IngredientList } from '@/components/recipe/ingredient-list';
import { InstructionList } from '@/components/recipe/instruction-list';
import { RecipeCardBlock } from '@/components/recipe/recipe-card-block';

export const metadata = {
  title: 'Recipe Admin Preview | FlavorNest',
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminRecipePreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminRecipePreviewPage({ params }: AdminRecipePreviewPageProps) {
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const recipe = await recipeRepository.getById(id);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="pb-24">
      {/* Top Admin Preview Banner */}
      <div className="sticky top-16 z-30 bg-amber-500 text-amber-950 px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-bold -mt-4 sm:-mt-8 -mx-4 sm:-mx-8 mb-8">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-900" />
          <span>
            Admin Preview Mode (Status: <strong className="uppercase">{recipe.status}</strong>) — Not indexed by search engines.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/recipes/${recipe.id}`}
            className="px-3 py-1 bg-amber-950 text-white rounded-lg hover:bg-black text-xs font-bold inline-flex items-center gap-1 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Recipe</span>
          </Link>
          <Link
            href="/admin/recipes"
            className="px-3 py-1 bg-amber-600 text-amber-950 rounded-lg hover:bg-amber-700 text-xs font-bold transition-colors"
          >
            Back to List
          </Link>
        </div>
      </div>

      {/* Public Recipe Layout Preview */}
      <Container size="md" className="space-y-12">
        <Breadcrumbs
          items={[
            { name: 'Recipes', url: '/recipes' },
            {
              name: recipe.primaryCategorySlug.replace(/-/g, ' '),
              url: `/category/${recipe.primaryCategorySlug}`,
            },
            { name: recipe.title, url: `/recipes/${recipe.slug}` },
          ]}
        />

        <RecipeHero recipe={recipe} />

        <section className="space-y-4 pt-4 border-t border-editorial-border">
          <h2 className="font-serif text-2xl font-bold text-editorial-text">
            Why You&rsquo;ll Love This Recipe
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-editorial-muted">
            {recipe.introduction}
          </p>
        </section>

        <section className="p-6 sm:p-8 rounded-2xl bg-white border border-editorial-border shadow-sm">
          <IngredientList ingredients={recipe.ingredients} />
        </section>

        <section className="space-y-4">
          <InstructionList instructions={recipe.instructions} />
        </section>

        <RecipeCardBlock recipe={recipe} />
      </Container>
    </div>
  );
}
