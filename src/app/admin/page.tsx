import React from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  PlusCircle,
  Sparkles,
  ArrowRight,
  UploadCloud,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { recipeRepository } from '@/lib/repositories/recipe.repository';
import { categoryRepository } from '@/lib/repositories/category.repository';
import { RecipeCard } from '@/components/recipe/recipe-card';
import { verifyAdminSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  const stats = await recipeRepository.getStats();
  const categories = await categoryRepository.list();
  const { recipes: recentRecipes } = await recipeRepository.list({ limit: 5 });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            FlavorNest Editorial Control Center
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-editorial-text mt-1">
            Admin Dashboard
          </h1>
          <p className="text-sm text-editorial-muted">
            Manage recipes, editorial workflows, publishing status, and taxonomies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/recipes/import"
            className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border text-editorial-text text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all"
          >
            <UploadCloud className="w-4 h-4 text-brand-500" />
            <span>Import Recipe</span>
          </Link>

          <Link
            href="/admin/recipes/new"
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Recipe</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-editorial-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-editorial-lightMuted">
            <span className="text-xs font-bold uppercase tracking-wider">Total Recipes</span>
            <UtensilsCrossed className="w-4 h-4 text-brand-500" />
          </div>
          <div className="font-serif text-3xl font-black text-editorial-text">{stats.total}</div>
          <div className="text-[11px] text-editorial-muted">Catalog total</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-editorial-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-editorial-lightMuted">
            <span className="text-xs font-bold uppercase tracking-wider">Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif text-3xl font-black text-emerald-700">{stats.published}</div>
          <div className="text-[11px] text-editorial-muted">Live on FlavorNest.xyz</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-editorial-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-editorial-lightMuted">
            <span className="text-xs font-bold uppercase tracking-wider">Drafts</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-serif text-3xl font-black text-amber-700">{stats.draft}</div>
          <div className="text-[11px] text-editorial-muted">Unpublished drafts</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-editorial-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-editorial-lightMuted">
            <span className="text-xs font-bold uppercase tracking-wider">In Review</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="font-serif text-3xl font-black text-sky-700">{stats.review}</div>
          <div className="text-[11px] text-editorial-muted">Pending approval</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-editorial-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-editorial-lightMuted">
            <span className="text-xs font-bold uppercase tracking-wider">Categories</span>
            <Layers className="w-4 h-4 text-brand-600" />
          </div>
          <div className="font-serif text-3xl font-black text-editorial-text">{categories.length}</div>
          <div className="text-[11px] text-editorial-muted">Active collections</div>
        </div>
      </div>

      {/* Quick Actions & Recent Recipes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Recipes Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-editorial-border shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-editorial-border pb-4">
            <h2 className="font-serif text-xl font-bold text-editorial-text">
              Recent Recipes
            </h2>
            <Link
              href="/admin/recipes"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-editorial-border text-editorial-lightMuted font-bold uppercase tracking-wider">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-editorial-border/60">
                {recentRecipes.map((recipe) => (
                  <tr key={recipe.id} className="hover:bg-editorial-surface/40 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="font-bold text-editorial-text line-clamp-1">{recipe.title}</div>
                      <div className="text-[11px] text-editorial-muted">/{recipe.slug}</div>
                    </td>
                    <td className="py-3.5 pr-4 font-semibold text-editorial-muted capitalize">
                      {recipe.primaryCategorySlug.replace(/-/g, ' ')}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          recipe.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : recipe.status === 'draft'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {recipe.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <Link
                        href={`/admin/recipes/${recipe.id}/preview`}
                        className="text-xs font-semibold text-editorial-muted hover:text-brand-600"
                        title="Preview"
                      >
                        Preview
                      </Link>
                      <Link
                        href={`/admin/recipes/${recipe.id}`}
                        className="text-xs font-bold text-brand-600 hover:text-brand-700"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & System Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-editorial-border shadow-sm p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-editorial-text">
              Quick Shortcuts
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/recipes/new"
                className="w-full p-3 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border text-xs font-bold text-editorial-text flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-brand-500" />
                  <span>Create New Recipe</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-editorial-lightMuted" />
              </Link>
              <Link
                href="/admin/categories"
                className="w-full p-3 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border text-xs font-bold text-editorial-text flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-500" />
                  <span>Manage Categories</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-editorial-lightMuted" />
              </Link>
              <Link
                href="/admin/media"
                className="w-full p-3 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border text-xs font-bold text-editorial-text flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-brand-500" />
                  <span>Media Library (R2)</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-editorial-lightMuted" />
              </Link>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-xs text-amber-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Phase 2 Database Connected</span>
            </div>
            <p className="leading-relaxed">
              All recipe edits and creations are processed through the server-side D1 repository layer with instant live preview.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
