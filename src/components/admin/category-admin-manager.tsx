'use client';

import React, { useState } from 'react';
import { Category } from '@/lib/types/category';
import { Plus, Edit, Trash2, Layers, Check, X, AlertCircle } from 'lucide-react';
import { slugify } from '@/lib/utils/slug';
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from '@/lib/actions/admin-actions';

interface CategoryAdminManagerProps {
  initialCategories: Category[];
}

export function CategoryAdminManager({ initialCategories }: CategoryAdminManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setShortDescription('');
    setHeroImage('');
    setSortOrder(categories.length + 1);
    setIsCreating(true);
  };

  const openEdit = (cat: Category) => {
    setIsCreating(false);
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setShortDescription(cat.shortDescription || '');
    setHeroImage(cat.heroImage || '');
    setSortOrder(cat.sortOrder);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setErrorMsg('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const payload = {
      name,
      slug: slug || slugify(name),
      description,
      shortDescription,
      heroImage,
      sortOrder: Number(sortOrder),
    };

    if (isCreating) {
      const res = await createCategoryAction(payload);
      if (res.success && res.category) {
        setCategories((prev) => [...prev, res.category!]);
        cancelForm();
      } else {
        setErrorMsg(res.error || 'Failed to create category');
      }
    } else if (editingId) {
      const res = await updateCategoryAction(editingId, payload);
      if (res.success && res.category) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? res.category! : c))
        );
        cancelForm();
      } else {
        setErrorMsg(res.error || 'Failed to update category');
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    const res = await deleteCategoryAction(id);
    if (res.success) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } else {
      alert('Failed to delete category');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text">
            Category Management
          </h1>
          <p className="text-xs sm:text-sm text-editorial-muted">
            Organize recipes into thematic editorial collections and URL taxonomy.
          </p>
        </div>

        {!isCreating && !editingId && (
          <button
            onClick={openCreate}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        )}
      </div>

      {/* Create / Edit Form Modal or Box */}
      {(isCreating || editingId) && (
        <form
          onSubmit={handleSave}
          className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-editorial-borderStrong shadow-card space-y-6 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-editorial-border pb-4">
            <h2 className="font-serif text-xl font-bold text-editorial-text">
              {isCreating ? 'Create New Category' : `Edit Category: ${name}`}
            </h2>
            <button
              type="button"
              onClick={cancelForm}
              className="p-1 rounded-lg text-editorial-lightMuted hover:text-editorial-text hover:bg-editorial-surface"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (isCreating) setSlug(slugify(e.target.value));
                }}
                placeholder="e.g. 30-Minute Meals"
                className="w-full px-4 py-2 text-sm rounded-xl bg-editorial-surface border border-editorial-border text-editorial-text"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1">
                Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="30-minute-meals"
                className="w-full px-4 py-2 text-sm font-mono rounded-xl bg-editorial-surface border border-editorial-border text-editorial-text"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1">
                Full Description (Editorial Intro) *
              </label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description for category landing page and search snippets..."
                className="w-full px-4 py-2 text-sm rounded-xl bg-editorial-surface border border-editorial-border text-editorial-text"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1">
                Hero Image URL
              </label>
              <input
                type="url"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2 text-xs font-mono rounded-xl bg-editorial-surface border border-editorial-border text-editorial-text"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-4 py-2 text-sm font-bold rounded-xl bg-editorial-surface border border-editorial-border text-editorial-text"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-editorial-border">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              {loading ? 'Saving...' : 'Save Category'}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border text-xs font-semibold text-editorial-text cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Category List Table */}
      <div className="bg-white rounded-2xl border border-editorial-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-editorial-surface/60 border-b border-editorial-border text-editorial-lightMuted font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Category Name</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Sort Order</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-editorial-border/60">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-editorial-surface/30 transition-colors">
                  <td className="py-4 px-4 sm:px-6 font-bold text-editorial-text text-sm">
                    {cat.name}
                  </td>
                  <td className="py-4 px-4 font-mono text-editorial-muted text-xs">
                    /category/{cat.slug}
                  </td>
                  <td className="py-4 px-4 font-bold text-editorial-text">
                    {cat.sortOrder}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right space-x-2">
                    <button
                      onClick={() => openEdit(cat)}
                      className="px-2.5 py-1.5 rounded-lg bg-editorial-surface hover:bg-editorial-surfaceAlt text-brand-600 font-bold text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 text-editorial-lightMuted hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
