'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Eye,
  RefreshCw,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PinterestCreative } from '@/lib/types/pinterest';
import { Recipe } from '@/lib/types/recipe';
import { PinterestPublishLog } from '@/lib/types/pinterest-connection';
import {
  publishPinNowAction,
  enqueuePinsAction,
} from '@/lib/actions/pinterest-publishing-actions';
import { PinCardPreview } from '@/components/pinterest/pin-card-preview';

interface PinterestQueueWorkstationProps {
  creatives: PinterestCreative[];
  recipes: Recipe[];
  publishLogs: PinterestPublishLog[];
}

export function PinterestQueueWorkstation({
  creatives,
  recipes,
  publishLogs,
}: PinterestQueueWorkstationProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activePublishingId, setActivePublishingId] = useState<string | null>(null);
  const [previewCreative, setPreviewCreative] = useState<PinterestCreative | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const recipeMap = new Map(recipes.map((r) => [r.id, r]));

  const queueCreatives = creatives.filter(
    (c) => c.status === 'approved' || c.status === 'queued' || c.status === 'publishing' || c.status === 'review'
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    if (selectedIds.length === queueCreatives.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(queueCreatives.map((c) => c.id));
    }
  };

  const handlePublishSingle = async (creativeId: string) => {
    setActivePublishingId(creativeId);
    setNotification(null);

    try {
      const res = await publishPinNowAction(creativeId);
      if (res.success && res.pinUrl) {
        setNotification({
          type: 'success',
          text: `Pin published successfully to Pinterest! Pin ID: ${res.pinId}`,
        });
        if (previewCreative?.id === creativeId) {
          setPreviewCreative(null);
        }
        router.refresh();
      } else {
        setNotification({
          type: 'error',
          text: res.error || 'Publishing failed',
        });
      }
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Publishing error' });
    } finally {
      setActivePublishingId(null);
    }
  };

  const handleBulkQueue = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await enqueuePinsAction(selectedIds);
      if (res.success) {
        setNotification({
          type: 'success',
          text: `Queued ${res.queuedCount} pin(s) for controlled distribution.`,
        });
        setSelectedIds([]);
        router.refresh();
      }
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Error queueing pins' });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-28 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
            <Flame className="w-4 h-4" />
            <span>Publishing Engine</span>
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
            Pinterest Publishing Queue
          </h1>
          <p className="text-xs text-editorial-muted">
            Controlled distribution queue connecting approved recipe assets directly to Pinterest API v5.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/pinterest/boards"
            className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors"
          >
            Manage Boards
          </Link>
          <Link
            href="/admin/settings/pinterest"
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold text-xs text-rose-700 transition-colors"
          >
            Connection Settings
          </Link>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-editorial-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
            activeTab === 'queue'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'text-editorial-muted hover:bg-editorial-surface'
          }`}
        >
          Publishing Queue ({queueCreatives.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'text-editorial-muted hover:bg-editorial-surface'
          }`}
        >
          Publishing History ({publishLogs.length})
        </button>
      </div>

      {activeTab === 'queue' ? (
        <div className="space-y-4">
          {/* Bulk Action Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-editorial-border shadow-xs text-xs">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 font-bold text-editorial-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === queueCreatives.length}
                  onChange={handleSelectAll}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Select All ({queueCreatives.length})</span>
              </label>
              {selectedIds.length > 0 && (
                <span className="text-editorial-muted font-medium">
                  {selectedIds.length} creative(s) selected
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handleBulkQueue}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              Add Selected to Queue
            </button>
          </div>

          {/* Queue List */}
          {queueCreatives.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-editorial-border text-center space-y-2">
              <Flame className="w-8 h-8 text-rose-500 mx-auto opacity-60" />
              <h4 className="font-serif text-base font-bold text-editorial-text">
                No pins currently in queue
              </h4>
              <p className="text-xs text-editorial-muted max-w-sm mx-auto">
                Approve Pinterest creatives in the recipe editor or Pinterest Creative Studio to send them here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {queueCreatives.map((creative) => {
                const recipe = recipeMap.get(creative.recipeId);
                const isSelected = selectedIds.includes(creative.id);
                const isPublishing = activePublishingId === creative.id;

                return (
                  <div
                    key={creative.id}
                    className="p-5 rounded-3xl bg-white border border-editorial-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-editorial-borderStrong transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(creative.id)}
                        className="rounded text-brand-600 focus:ring-brand-500"
                      />

                      <div className="w-14 h-20 rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                        <img
                          src={creative.imageUrl}
                          alt={creative.overlayText}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                            {creative.boardName || 'Easy Dinner Recipes'}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              creative.status === 'queued'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-brand-100 text-brand-800'
                            }`}
                          >
                            {creative.status}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-editorial-text truncate">
                          {recipe?.title || creative.title}
                        </h4>
                        <p className="text-xs text-editorial-muted font-medium truncate">
                          Overlay: &ldquo;{creative.overlayText}&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setPreviewCreative(creative)}
                        className="p-2.5 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors cursor-pointer"
                        title="Preview Pin"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        disabled={isPublishing}
                        onClick={() => handlePublishSingle(creative.id)}
                        className="px-4 py-2.5 rounded-xl bg-[#E60023] hover:bg-[#c9021e] active:scale-95 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        {isPublishing ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Publishing...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Publish Now</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* History Tab */
        <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs">
          {publishLogs.length === 0 ? (
            <div className="p-12 text-center text-xs text-editorial-muted">
              No pins have been published yet.
            </div>
          ) : (
            <div className="divide-y divide-editorial-border">
              {publishLogs.map((log) => (
                <div key={log.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          log.status === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
                      <span className="text-editorial-lightMuted">
                        {new Date(log.publishedAt).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-editorial-text mt-1">
                      {log.recipeTitle}
                    </h4>
                    <span className="text-[11px] text-editorial-muted">
                      Board: {log.boardName} {log.pinId && `• Pin ID: ${log.pinId}`}
                    </span>
                    {log.error && (
                      <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                        Error: {log.error}
                      </p>
                    )}
                  </div>

                  {log.pinUrl && (
                    <a
                      href={log.pinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span>View on Pinterest</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pin Preview Modal */}
      {previewCreative && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-editorial-border max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-editorial-border pb-3">
              <h3 className="font-serif text-lg font-bold text-editorial-text">
                Pinterest Pin Preview
              </h3>
              <button
                type="button"
                onClick={() => setPreviewCreative(null)}
                className="p-2 rounded-xl hover:bg-editorial-surface text-editorial-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-editorial-border shadow-xs">
                <PinCardPreview creative={previewCreative} />
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
                    Title
                  </span>
                  <p className="font-serif font-bold text-sm text-editorial-text mt-0.5">
                    {previewCreative.title}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
                    Board
                  </span>
                  <p className="text-xs font-bold text-rose-600 mt-0.5">
                    {previewCreative.boardName || 'Easy Dinner Recipes'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
                    Destination URL
                  </span>
                  <p className="font-mono text-[11px] text-editorial-muted break-all mt-0.5">
                    {previewCreative.destinationUrl}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
                    Description
                  </span>
                  <p className="text-xs text-editorial-muted line-clamp-3 leading-relaxed mt-0.5">
                    {previewCreative.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-editorial-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPreviewCreative(null)}
                className="px-4 py-2 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-muted cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                disabled={activePublishingId === previewCreative.id}
                onClick={() => handlePublishSingle(previewCreative.id)}
                className="px-5 py-2 rounded-xl bg-[#E60023] hover:bg-[#c9021e] active:scale-95 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {activePublishingId === previewCreative.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish to Pinterest</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
