'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Save,
  Utensils,
} from 'lucide-react';
import { Collection, CreateCollectionInput } from '@/lib/types/collection';
import { Recipe } from '@/lib/types/recipe';

interface CollectionsManagerProps {
  initialCollections: Collection[];
  allRecipes: Recipe[];
}

export function CollectionsManager({
  initialCollections,
  allRecipes,
}: CollectionsManagerProps) {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('published');
  const [formRecipeIds, setFormRecipeIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleOpenCreate = () => {
    setEditingCollection(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&h=800&q=80');
    setFormStatus('published');
    setFormRecipeIds([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col: Collection) => {
    setEditingCollection(col);
    setFormName(col.name);
    setFormSlug(col.slug);
    setFormDescription(col.description);
    setFormImageUrl(col.imageUrl);
    setFormStatus(col.status as any);
    setFormRecipeIds(col.recipeIds || []);
    setIsModalOpen(true);
  };

  const handleToggleRecipe = (recipeId: string) => {
    setFormRecipeIds((prev) =>
      prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
    );
  };

  const handleSave = async () => {
    if (!formName.trim() || !formSlug.trim()) return;

    if (editingCollection) {
      // Update local state
      const updated = collections.map((c) =>
        c.id === editingCollection.id
          ? {
              ...c,
              name: formName,
              slug: formSlug,
              description: formDescription,
              imageUrl: formImageUrl,
              status: formStatus,
              recipeIds: formRecipeIds,
              updatedAt: new Date().toISOString(),
            }
          : c
      );
      setCollections(updated);
      setNotification({ type: 'success', text: `Collection "${formName}" updated.` });
    } else {
      // Create local state
      const newCol: Collection = {
        id: `col_${Date.now()}`,
        name: formName,
        slug: formSlug,
        description: formDescription,
        imageUrl: formImageUrl,
        status: formStatus,
        sortOrder: collections.length + 1,
        recipeIds: formRecipeIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCollections([...collections, newCol]);
      setNotification({ type: 'success', text: `Collection "${formName}" created.` });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
            <Layers className="w-4 h-4" />
            <span>Editorial Content</span>
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
            Recipe Collections
          </h1>
          <p className="text-xs text-editorial-muted">
            Curate thematic recipe roundups, holiday menus, and 30-minute weeknight collections.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification.text}</span>
        </div>
      )}

      {/* Grid of Collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((col) => (
          <div
            key={col.id}
            className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-zinc-900">
              <img src={col.imageUrl} alt={col.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] text-white font-bold uppercase">
                {col.status}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5">
                <h3 className="font-serif text-lg font-bold text-editorial-text leading-snug">
                  {col.name}
                </h3>
                <p className="text-xs text-editorial-muted line-clamp-2 leading-relaxed">
                  {col.description}
                </p>
                <div className="text-[11px] font-bold text-brand-600">
                  {col.recipeIds?.length || 0} recipes attached
                </div>
              </div>

              <div className="pt-3 border-t border-editorial-border flex items-center justify-between">
                <Link
                  href={`/collection/${col.slug}/`}
                  target="_blank"
                  className="text-xs font-bold text-editorial-muted hover:text-editorial-text flex items-center gap-1"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(col)}
                  className="px-3 py-1.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt text-editorial-text font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-editorial-border max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-editorial-border pb-3">
              <h3 className="font-serif text-lg font-bold text-editorial-text">
                {editingCollection ? 'Edit Collection' : 'Create New Collection'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-editorial-surface text-editorial-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-editorial-text mb-1">Collection Name:</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingCollection) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs text-editorial-text"
                />
              </div>

              <div>
                <label className="block font-bold text-editorial-text mb-1">Slug:</label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border font-mono text-xs text-editorial-text"
                />
              </div>

              <div>
                <label className="block font-bold text-editorial-text mb-1">Editorial Description:</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-editorial-surface border border-editorial-border text-xs text-editorial-text leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-editorial-text mb-1">Cover Image URL:</label>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border font-mono text-xs text-editorial-text"
                />
              </div>

              <div>
                <label className="block font-bold text-editorial-text mb-2">
                  Select Included Recipes ({formRecipeIds.length}):
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto border border-editorial-border rounded-xl p-2 bg-editorial-surface">
                  {allRecipes.map((r) => {
                    const isChecked = formRecipeIds.includes(r.id);
                    return (
                      <label
                        key={r.id}
                        className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRecipe(r.id)}
                          className="rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span className="font-medium text-editorial-text truncate">{r.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-editorial-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-muted cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Collection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
