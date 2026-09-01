'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit,
  Trash2,
  Check,
  X,
  Sparkles,
  ExternalLink,
  Layers,
  Sliders,
  Copy,
} from 'lucide-react';
import { Recipe } from '@/lib/types/recipe';
import { RecipeDNA } from '@/lib/ai/recipe-dna';
import {
  PinterestCreative,
  PinterestContentAngle,
  PinterestCreativeStyle,
} from '@/lib/types/pinterest';
import { PINTEREST_ANGLES, getEligibleAngles } from '@/lib/pinterest/angles';
import { PINTEREST_TEMPLATES } from '@/lib/pinterest/templates';
import { PinCardPreview } from '@/components/pinterest/pin-card-preview';
import {
  generatePinConceptsAction,
  updatePinterestCreativeAction,
  approvePinterestCreativeAction,
  rejectPinterestCreativeAction,
  deletePinterestCreativeAction,
} from '@/lib/actions/pinterest-actions';

interface PinterestStudioProps {
  recipe: Recipe;
  recipeDna: RecipeDNA;
  initialCreatives: PinterestCreative[];
}

export function PinterestStudio({
  recipe,
  recipeDna,
  initialCreatives,
}: PinterestStudioProps) {
  const router = useRouter();

  // Selected Angles for Bulk Generation
  const eligibleAngles = getEligibleAngles(recipeDna);
  const [selectedAngles, setSelectedAngles] = useState<PinterestContentAngle[]>([
    'quick-dinner',
    'easy-recipe',
    'comfort-food',
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('auto');

  // Creative Management State
  const [creatives, setCreatives] = useState<PinterestCreative[]>(initialCreatives);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingCreative, setEditingCreative] = useState<PinterestCreative | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleAngle = (angle: PinterestContentAngle) => {
    setSelectedAngles((prev) =>
      prev.includes(angle) ? prev.filter((a) => a !== angle) : [...prev, angle]
    );
  };

  const handleGenerateConcepts = async () => {
    if (selectedAngles.length === 0) return;
    setIsGenerating(true);
    setStatusMsg(null);

    try {
      const templateOverride = selectedTemplate !== 'auto' ? (selectedTemplate as PinterestCreativeStyle) : undefined;
      const res = await generatePinConceptsAction(recipe.id, selectedAngles, templateOverride);
      if (res.success && res.creatives) {
        setCreatives((prev) => [...res.creatives!, ...prev]);
        setStatusMsg({
          type: 'success',
          text: `Generated ${res.creatives.length} new Pinterest creative concept(s)!`,
        });
        router.refresh();
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Generation failed' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Generation error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async (id: string) => {
    const res = await approvePinterestCreativeAction(id);
    if (res.success) {
      setCreatives((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'approved' } : c))
      );
      setStatusMsg({ type: 'success', text: 'Creative approved for Pinterest publishing!' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this creative concept?')) return;
    await deletePinterestCreativeAction(id, recipe.id);
    setCreatives((prev) => prev.filter((c) => c.id !== id));
    setStatusMsg({ type: 'success', text: 'Creative removed.' });
  };

  const handleSaveEdit = async () => {
    if (!editingCreative) return;
    const res = await updatePinterestCreativeAction(editingCreative.id, {
      overlayText: editingCreative.overlayText,
      subheadline: editingCreative.subheadline,
      title: editingCreative.title,
      description: editingCreative.description,
      keywords: editingCreative.keywords,
      creativeTemplate: editingCreative.creativeTemplate,
      boardName: editingCreative.boardName,
    });

    if (res.success && res.creative) {
      setCreatives((prev) =>
        prev.map((c) => (c.id === editingCreative.id ? res.creative! : c))
      );
      setEditingCreative(null);
      setStatusMsg({ type: 'success', text: 'Pinterest creative updated!' });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-28 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/recipes/${recipe.id}`}
            className="p-2 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Pinterest Creative Studio</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-editorial-surface font-semibold text-editorial-muted border border-editorial-border">
                {creatives.length} concepts
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              Creatives: {recipe.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/recipes/${recipe.slug}`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-semibold text-xs text-editorial-text inline-flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-editorial-lightMuted" />
            <span>View Public Page</span>
          </Link>
          <Link
            href={`/admin/recipes/${recipe.id}/images`}
            className="px-4 py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 border border-brand-200 font-bold text-xs text-brand-700 inline-flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-brand-600" />
            <span>FLUX Images</span>
          </Link>
        </div>
      </div>

      {/* Canonical Destination Notice Banner */}
      <div className="p-4 rounded-2xl bg-white border border-editorial-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div>
          <span className="font-bold text-editorial-text block">Canonical Pin Destination:</span>
          <span className="text-[11px] font-mono text-editorial-muted">
            https://flavornest.xyz/recipes/{recipe.slug}
          </span>
        </div>
        <div className="text-[11px] text-editorial-lightMuted">
          All Pin variations point to this single high-authority recipe URL.
        </div>
      </div>

      {/* Notification Toast */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* =========================================================================
          BULK CONCEPT GENERATOR PANEL
         ========================================================================= */}
      <div className="bg-white rounded-3xl border-2 border-editorial-borderStrong p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-editorial-border pb-3">
          <h2 className="font-serif text-base font-bold text-editorial-text flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-600" />
            <span>Generate Pinterest Creative Concepts</span>
          </h2>
          <span className="text-xs text-editorial-muted font-medium">
            Controlled Creative Variation
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-2">
              Select Content Angles for Variation:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {eligibleAngles.map((angleKey) => {
                const angle = PINTEREST_ANGLES[angleKey];
                const isSelected = selectedAngles.includes(angleKey);
                return (
                  <button
                    type="button"
                    key={angleKey}
                    onClick={() => toggleAngle(angleKey)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50/80 border-rose-400 text-rose-950 shadow-xs'
                        : 'bg-white hover:bg-editorial-surface border-editorial-border text-editorial-muted'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>{angle.name}</span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                    </div>
                    <div className="text-[10px] text-editorial-muted mt-1 line-clamp-1">
                      {angle.tagline}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <label htmlFor="template-style" className="text-xs font-bold text-editorial-text">
                Template Style:
              </label>
              <select
                id="template-style"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs text-editorial-text font-medium"
              >
                <option value="auto">Auto-Rotate (Best Diversity)</option>
                <option value="template-a-hero">Template A — Hero Food</option>
                <option value="template-b-editorial">Template B — Editorial Magazine</option>
                <option value="template-c-recipe-focus">Template C — Recipe Focus Callout</option>
                <option value="template-d-collage">Template D — Multi-Shot Collage</option>
                <option value="template-e-minimal">Template E — Clean Minimal</option>
              </select>
            </div>

            <button
              type="button"
              disabled={isGenerating || selectedAngles.length === 0}
              onClick={handleGenerateConcepts}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Pin Concepts...</span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5" />
                  <span>Generate {selectedAngles.length} Creative Concepts</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CREATIVE CONCEPTS GRID (2:3 PREVIEWS & METADATA)
         ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold text-editorial-text">
            Pin Creative Concepts ({creatives.length})
          </h3>
          <span className="text-xs text-editorial-muted">
            Ready for visual export and Pin scheduling
          </span>
        </div>

        {creatives.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-editorial-border text-center space-y-2">
            <Flame className="w-8 h-8 text-rose-500 mx-auto opacity-60" />
            <h4 className="font-serif text-base font-bold text-editorial-text">
              No Pinterest Creatives Yet
            </h4>
            <p className="text-xs text-editorial-muted max-w-sm mx-auto">
              Select content angles above and click Generate to create tailored 2:3 vertical Pin variations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creatives.map((creative) => {
              const angleDef = PINTEREST_ANGLES[creative.contentAngle];
              const templateDef = PINTEREST_TEMPLATES[creative.creativeTemplate];

              return (
                <div
                  key={creative.id}
                  className="bg-white rounded-3xl border border-editorial-border p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      {angleDef?.name || creative.contentAngle}
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        creative.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {creative.status}
                    </span>
                  </div>

                  {/* 2:3 Vertical Card Preview */}
                  <div className="max-w-[260px] mx-auto w-full">
                    <PinCardPreview creative={creative} />
                  </div>

                  {/* Metadata Summary */}
                  <div className="space-y-2 text-xs pt-1">
                    <div>
                      <span className="font-bold text-editorial-text line-clamp-1">
                        {creative.title}
                      </span>
                      <p className="text-[11px] text-editorial-muted line-clamp-2 mt-0.5 leading-relaxed">
                        {creative.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-editorial-muted pt-1 border-t border-editorial-border/60">
                      <span>Board: <strong>{creative.boardName}</strong></span>
                      <span className="font-mono text-[10px]">{templateDef?.badge}</span>
                    </div>

                    {/* Keywords Chips */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {creative.keywords.slice(0, 4).map((kw, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-editorial-surface text-editorial-muted border border-editorial-border">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-3 border-t border-editorial-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingCreative(creative)}
                        className="p-2 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-text text-xs font-bold transition-colors cursor-pointer"
                        title="Edit Creative"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(creative.id)}
                        className="p-2 rounded-xl border border-editorial-border hover:bg-rose-50 text-rose-600 text-xs transition-colors cursor-pointer"
                        title="Delete Concept"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {creative.status !== 'approved' ? (
                      <button
                        type="button"
                        onClick={() => handleApprove(creative.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approved</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          EDIT CREATIVE MODAL
         ========================================================================= */}
      {editingCreative && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-editorial-border max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between border-b border-editorial-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  Creative Editor
                </span>
                <h3 className="font-serif text-lg font-bold text-editorial-text mt-0.5">
                  Edit Pin Concept
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCreative(null)}
                className="p-2 rounded-xl hover:bg-editorial-surface text-editorial-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-editorial-text mb-1">
                  Creative Template
                </label>
                <select
                  value={editingCreative.creativeTemplate}
                  onChange={(e) =>
                    setEditingCreative({
                      ...editingCreative,
                      creativeTemplate: e.target.value as PinterestCreativeStyle,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-editorial-surface border border-editorial-border text-xs text-editorial-text"
                >
                  <option value="template-a-hero">Template A — Hero Food</option>
                  <option value="template-b-editorial">Template B — Editorial Magazine</option>
                  <option value="template-c-recipe-focus">Template C — Recipe Focus Callout</option>
                  <option value="template-d-collage">Template D — Multi-Shot Collage</option>
                  <option value="template-e-minimal">Template E — Clean Minimal</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-editorial-text mb-1">
                  Overlay Text (Headline on Image)
                </label>
                <input
                  type="text"
                  value={editingCreative.overlayText}
                  onChange={(e) =>
                    setEditingCreative({ ...editingCreative, overlayText: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-editorial-surface border border-editorial-border font-serif font-bold text-sm text-editorial-text"
                />
              </div>

              <div>
                <label className="block font-bold text-editorial-text mb-1">
                  Subheadline Callout
                </label>
                <input
                  type="text"
                  value={editingCreative.subheadline || ''}
                  onChange={(e) =>
                    setEditingCreative({ ...editingCreative, subheadline: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-editorial-surface border border-editorial-border text-xs text-editorial-text"
                />
              </div>

              <div>
                <label className="block font-bold text-editorial-text mb-1">
                  Pinterest Pin Title
                </label>
                <input
                  type="text"
                  value={editingCreative.title}
                  onChange={(e) =>
                    setEditingCreative({ ...editingCreative, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-editorial-surface border border-editorial-border text-xs font-bold text-editorial-text"
                />
              </div>

              <div>
                <label className="block font-bold text-editorial-text mb-1">
                  Pinterest Pin Description
                </label>
                <textarea
                  rows={3}
                  value={editingCreative.description}
                  onChange={(e) =>
                    setEditingCreative({ ...editingCreative, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-editorial-surface border border-editorial-border text-xs text-editorial-text leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-editorial-text mb-1">
                  Target Board
                </label>
                <input
                  type="text"
                  value={editingCreative.boardName}
                  onChange={(e) =>
                    setEditingCreative({ ...editingCreative, boardName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-editorial-surface border border-editorial-border text-xs text-editorial-text"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-editorial-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingCreative(null)}
                className="px-4 py-2 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-muted cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
