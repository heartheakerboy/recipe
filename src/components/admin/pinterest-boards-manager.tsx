'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PinterestBoard, PinterestBoardMapping } from '@/lib/types/pinterest-connection';
import { PRIMARY_CATEGORIES } from '@/lib/config/categories.config';
import {
  saveBoardMappingAction,
  setDefaultBoardAction,
} from '@/lib/actions/pinterest-publishing-actions';

interface PinterestBoardsManagerProps {
  boards: PinterestBoard[];
  mappings: PinterestBoardMapping[];
  defaultBoardId?: string;
}

export function PinterestBoardsManager({
  boards,
  mappings,
  defaultBoardId = 'board_easy_dinner',
}: PinterestBoardsManagerProps) {
  const router = useRouter();
  const [currentMappings, setCurrentMappings] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const m of mappings) {
      if (m.categorySlug) map[m.categorySlug] = m.pinterestBoardId;
    }
    return map;
  });

  const [selectedDefaultBoard, setSelectedDefaultBoard] = useState(defaultBoardId);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories = Object.values(PRIMARY_CATEGORIES);

  const handleSelectBoard = (categorySlug: string, boardId: string) => {
    setCurrentMappings((prev) => ({ ...prev, [categorySlug]: boardId }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setNotification(null);

    try {
      // Save default board
      await setDefaultBoardAction(selectedDefaultBoard);

      // Save category mappings
      for (const [catSlug, boardId] of Object.entries(currentMappings)) {
        await saveBoardMappingAction(catSlug, boardId);
      }

      setNotification({ type: 'success', text: 'Pinterest board mappings and default fallback saved!' });
      router.refresh();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Failed to save board mappings' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
            <Flame className="w-4 h-4" />
            <span>Distribution Channels</span>
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
            Pinterest Board Management
          </h1>
          <p className="text-xs text-editorial-muted">
            Map FlavorNest categories to Pinterest boards and configure your default fallback board.
          </p>
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveAll}
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-50 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Mappings'}</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Default Fallback Board Card */}
      <div className="bg-white rounded-3xl border border-editorial-border p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-editorial-border pb-3">
          <div>
            <h3 className="font-serif text-base font-bold text-editorial-text">
              Default Fallback Board
            </h3>
            <p className="text-xs text-editorial-muted">
              Used when a recipe category does not have a dedicated Pinterest board mapping.
            </p>
          </div>
        </div>

        <div className="max-w-md">
          <label className="block text-xs font-bold text-editorial-text mb-1">
            Select Default Board:
          </label>
          <select
            value={selectedDefaultBoard}
            onChange={(e) => setSelectedDefaultBoard(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs text-editorial-text font-medium"
          >
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.pinCount || 0} pins)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Board Mappings Table */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs">
        <div className="p-6 border-b border-editorial-border">
          <h3 className="font-serif text-base font-bold text-editorial-text">
            Category to Board Mappings
          </h3>
          <p className="text-xs text-editorial-muted">
            Automatically routes newly published recipe Pins to their targeted Pinterest topic board.
          </p>
        </div>

        <div className="divide-y divide-editorial-border">
          {categories.map((cat) => {
            const mappedBoardId = currentMappings[cat.slug] || selectedDefaultBoard;
            return (
              <div
                key={cat.slug}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-editorial-surface/40 transition-colors"
              >
                <div>
                  <h4 className="font-serif font-bold text-sm text-editorial-text">
                    {cat.name}
                  </h4>
                  <span className="text-[11px] text-editorial-muted">
                    /category/{cat.slug}/
                  </span>
                </div>

                <div className="flex items-center gap-3 sm:w-80">
                  <select
                    value={mappedBoardId}
                    onChange={(e) => handleSelectBoard(cat.slug, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-editorial-surface border border-editorial-border text-xs text-editorial-text font-medium"
                  >
                    {boards.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
