import React from 'react';
import Link from 'next/link';
import { PlusCircle, Search, Filter, Eye, Edit, Archive, CheckCircle2, Clock, FileText, Sparkles, ImageIcon, Flame, ShieldCheck } from 'lucide-react';
import { recipeRepository } from '@/lib/repositories/recipe.repository';
import { categoryRepository } from '@/lib/repositories/category.repository';
import { verifyAdminSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { formatDate } from '@/lib/utils/formatters';

interface AdminRecipesPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function AdminRecipesPage({ searchParams }: AdminRecipesPageProps) {
  const isAuthenticated = await verifyAdminSession();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  const { search = '', status = 'all', category = 'all', page = '1' } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;
  const pageSize = 15;
  const offset = (currentPage - 1) * pageSize;

  const { recipes, totalCount } = await recipeRepository.list({
    search,
    status,
    categorySlug: category,
    limit: pageSize,
    offset,
  });

  const categories = await categoryRepository.list();
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text">
            Recipe Management
          </h1>
          <p className="text-xs sm:text-sm text-editorial-muted">
            Manage your recipe library, update SEO metadata, and publish recipes.
          </p>
        </div>

        <Link
          href="/admin/recipes/new"
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Recipe</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-editorial-border p-4 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Search input form */}
        <form method="GET" className="flex-1 relative">
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="category" value={category} />
          <Search className="w-4 h-4 text-editorial-lightMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search recipes by title, slug, or tags..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-editorial-surface border border-editorial-border text-editorial-text focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-xs font-bold text-editorial-muted whitespace-nowrap">
            Status:
          </label>
          <select
            id="status-filter"
            defaultValue={status}
            onChange={(e) => {
              const val = e.target.value;
              window.location.href = `/admin/recipes?status=${val}&category=${category}&search=${encodeURIComponent(search)}`;
            }}
            className="text-xs rounded-xl bg-editorial-surface border border-editorial-border py-2 px-3 text-editorial-text focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="cat-filter" className="text-xs font-bold text-editorial-muted whitespace-nowrap">
            Category:
          </label>
          <select
            id="cat-filter"
            defaultValue={category}
            onChange={(e) => {
              const val = e.target.value;
              window.location.href = `/admin/recipes?status=${status}&category=${val}&search=${encodeURIComponent(search)}`;
            }}
            className="text-xs rounded-xl bg-editorial-surface border border-editorial-border py-2 px-3 text-editorial-text focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-editorial-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-editorial-surface/60 border-b border-editorial-border text-editorial-lightMuted font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Title & URL</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Updated</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-editorial-border/60">
              {recipes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-editorial-muted">
                    No recipes found matching your search criteria.
                  </td>
                </tr>
              ) : (
                recipes.map((recipe) => (
                  <tr key={recipe.id} className="hover:bg-editorial-surface/30 transition-colors">
                    <td className="py-4 px-4 sm:px-6 max-w-sm">
                      <div className="font-bold text-editorial-text text-sm line-clamp-1">
                        <Link href={`/admin/recipes/${recipe.id}`} className="hover:text-brand-600 transition-colors">
                          {recipe.title}
                        </Link>
                      </div>
                      <div className="text-[11px] text-editorial-muted font-mono truncate mt-0.5">
                        /recipes/{recipe.slug}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-editorial-muted capitalize">
                      {recipe.primaryCategorySlug.replace(/-/g, ' ')}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          recipe.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : recipe.status === 'draft'
                            ? 'bg-amber-100 text-amber-800'
                            : recipe.status === 'archived'
                            ? 'bg-zinc-100 text-zinc-600'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {recipe.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-editorial-muted text-[11px] whitespace-nowrap">
                      {formatDate(recipe.updatedAt || recipe.createdAt)}
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/admin/recipes/${recipe.id}/review`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-800 font-bold text-xs transition-colors"
                        title="Final Editorial Review & Quality Checklist"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                        <span>Review</span>
                      </Link>

                      <Link
                        href={`/admin/recipes/${recipe.id}/pinterest`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors"
                        title="Manage Pinterest Creative Studio"
                      >
                        <Flame className="w-3.5 h-3.5 text-rose-600" />
                        <span>Pinterest</span>
                      </Link>

                      <Link
                        href={`/admin/recipes/${recipe.id}/images`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-editorial-surface hover:bg-editorial-surfaceAlt text-editorial-text font-semibold text-xs transition-colors"
                        title="Manage FLUX AI Images"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-editorial-muted" />
                        <span>Images</span>
                      </Link>

                      <Link
                        href={`/admin/recipes/${recipe.id}/transform`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs transition-colors"
                        title="Transform recipe with AI editorial styles"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                        <span>AI Transform</span>
                      </Link>

                      <Link
                        href={`/admin/recipes/${recipe.id}/preview`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-editorial-surface hover:bg-editorial-surfaceAlt text-editorial-text font-semibold text-xs transition-colors"
                        title="Preview public recipe page"
                      >
                        <Eye className="w-3.5 h-3.5 text-editorial-muted" />
                        <span>Preview</span>
                      </Link>

                      <Link
                        href={`/admin/recipes/${recipe.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-editorial-surfaceAlt hover:bg-editorial-surface text-editorial-text font-semibold text-xs transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-editorial-border flex items-center justify-between text-xs text-editorial-muted">
          <span>
            Showing {recipes.length} of {totalCount} recipes
          </span>

          <div className="flex items-center gap-1.5">
            {currentPage > 1 && (
              <Link
                href={`/admin/recipes?page=${currentPage - 1}&status=${status}&category=${category}&search=${encodeURIComponent(search)}`}
                className="px-3 py-1 rounded-lg border border-editorial-border hover:bg-editorial-surface font-semibold"
              >
                Previous
              </Link>
            )}
            <span className="px-2 font-bold">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/admin/recipes?page=${currentPage + 1}&status=${status}&category=${category}&search=${encodeURIComponent(search)}`}
                className="px-3 py-1 rounded-lg border border-editorial-border hover:bg-editorial-surface font-semibold"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
