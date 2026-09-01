'use client';

import React, { useState } from 'react';
import { Tag } from '@/lib/repositories/tag.repository';
import { Plus, Trash2, Tags, Search, X } from 'lucide-react';
import { slugify } from '@/lib/utils/slug';
import { createTagAction, deleteTagAction } from '@/lib/actions/admin-actions';

interface TagAdminManagerProps {
  initialTags: Tag[];
}

export function TagAdminManager({ initialTags }: TagAdminManagerProps) {
  const [tags, setTags] = useState(initialTags);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setErrorMsg('');

    const targetSlug = slug || slugify(name);
    const res = await createTagAction(name.trim(), targetSlug);
    if (res.success && res.tag) {
      setTags((prev) => [...prev, res.tag!]);
      setName('');
      setSlug('');
    } else {
      setErrorMsg(res.error || 'Failed to create tag');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, tagName: string) => {
    if (!confirm(`Delete tag "${tagName}"?`)) return;
    const res = await deleteTagAction(id);
    if (res.success) {
      setTags((prev) => prev.filter((t) => t.id !== id));
    } else {
      alert('Failed to delete tag');
    }
  };

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text">
            Tag Taxonomy
          </h1>
          <p className="text-xs sm:text-sm text-editorial-muted">
            Manage reusable keyword tags for recipe indexing and cross-linking.
          </p>
        </div>
      </div>

      {/* Add New Tag Card */}
      <form
        onSubmit={handleCreate}
        className="p-6 bg-white rounded-2xl border border-editorial-border shadow-sm space-y-4"
      >
        <h2 className="font-serif text-base font-bold text-editorial-text flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand-500" />
          <span>Add New Tag</span>
        </h2>

        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(slugify(e.target.value));
              }}
              placeholder="Tag name (e.g. 30-minute)"
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-editorial-surface border border-editorial-border text-editorial-text"
            />
          </div>
          <div>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="Slug (e.g. 30-minute)"
              className="w-full px-4 py-2.5 text-xs font-mono rounded-xl bg-editorial-surface border border-editorial-border text-editorial-text"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create Tag'}
            </button>
          </div>
        </div>
      </form>

      {/* Tag Filter & List */}
      <div className="bg-white rounded-2xl border border-editorial-border p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-editorial-lightMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter tags..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-editorial-surface border border-editorial-border text-editorial-text"
            />
          </div>
          <span className="text-xs font-semibold text-editorial-muted">
            {filteredTags.length} tags
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {filteredTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs font-semibold text-editorial-text hover:border-brand-500/40 transition-colors"
            >
              <span>#{tag.name}</span>
              <button
                type="button"
                onClick={() => handleDelete(tag.id, tag.name)}
                className="text-editorial-lightMuted hover:text-rose-600 transition-colors"
                title="Delete tag"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
