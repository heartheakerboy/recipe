'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Camera,
  Image as ImageIcon,
  Check,
  X,
  Layers,
  Flame,
  Sliders,
  Clock,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Recipe } from '@/lib/types/recipe';
import { RecipeDNA } from '@/lib/ai/recipe-dna';
import {
  FoodImageType,
  VisualStylePreset,
  VISUAL_STYLE_PRESETS,
  PromptConfig,
} from '@/lib/images/prompt-generator';
import { ImageGenerationHistoryRecord } from '@/lib/images/image-history.service';
import {
  generatePromptAction,
  startImageGenerationAction,
  approveImageAction,
  rejectImageAction,
} from '@/lib/actions/image-actions';

interface ImageStudioProps {
  recipe: Recipe;
  recipeDna: RecipeDNA;
  initialHistory: ImageGenerationHistoryRecord[];
}

export function ImageStudio({ recipe, recipeDna, initialHistory }: ImageStudioProps) {
  const router = useRouter();

  // Selected Target & Preset
  const [targetRole, setTargetRole] = useState<FoodImageType>('hero');
  const [stylePreset, setStylePreset] = useState<VisualStylePreset>('editorial-kitchen');

  // Prompt Customization State
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [currentPromptConfig, setCurrentPromptConfig] = useState<PromptConfig | null>(null);
  const [editablePrompt, setEditablePrompt] = useState('');
  const [editableNegative, setEditableNegative] = useState('');

  // Generation & Review State
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeGeneration, setActiveGeneration] = useState<ImageGenerationHistoryRecord | null>(null);
  const [history, setHistory] = useState<ImageGenerationHistoryRecord[]>(initialHistory);
  const [isApproving, setIsApproving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quality Checklist State for Preview
  const [checklist, setChecklist] = useState({
    correctDish: true,
    realisticTextures: true,
    noArtifacts: true,
    cleanComposition: true,
  });

  const handleOpenPromptModal = async (type: FoodImageType) => {
    setTargetRole(type);
    setIsPromptOpen(true);
    setStatusMsg(null);

    const res = await generatePromptAction(recipe.id, type, stylePreset);
    if (res.success && res.promptConfig) {
      setCurrentPromptConfig(res.promptConfig);
      setEditablePrompt(res.promptConfig.prompt);
      setEditableNegative(res.promptConfig.negativePrompt);
    }
  };

  const handlePresetChange = async (newPreset: VisualStylePreset) => {
    setStylePreset(newPreset);
    const res = await generatePromptAction(recipe.id, targetRole, newPreset);
    if (res.success && res.promptConfig) {
      setCurrentPromptConfig(res.promptConfig);
      setEditablePrompt(res.promptConfig.prompt);
      setEditableNegative(res.promptConfig.negativePrompt);
    }
  };

  const handleStartGeneration = async () => {
    if (!editablePrompt.trim()) return;
    setIsGenerating(true);
    setStatusMsg(null);

    try {
      const res = await startImageGenerationAction(
        recipe.id,
        targetRole,
        editablePrompt,
        stylePreset,
        editableNegative
      );

      if (res.success && res.historyRecord) {
        setActiveGeneration(res.historyRecord);
        setHistory((prev) => [res.historyRecord!, ...prev.filter((h) => h.id !== res.historyRecord!.id)]);
        setIsPromptOpen(false);
        setStatusMsg({ type: 'success', text: 'Image generated successfully! Please review below.' });
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Generation failed' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Generation error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async (role: 'hero' | 'secondary' | 'pinterest') => {
    if (!activeGeneration) return;
    setIsApproving(true);
    setStatusMsg(null);

    try {
      const res = await approveImageAction(recipe.id, activeGeneration.id, role);
      if (res.success) {
        setStatusMsg({
          type: 'success',
          text: `Approved and stored in Cloudflare R2 as ${role.toUpperCase()}!`,
        });
        setActiveGeneration(null);
        router.refresh();
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Approval failed' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Approval error' });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!activeGeneration) return;
    await rejectImageAction(activeGeneration.id);
    setHistory((prev) =>
      prev.map((h) => (h.id === activeGeneration.id ? { ...h, status: 'rejected' } : h))
    );
    setActiveGeneration(null);
    setStatusMsg({ type: 'success', text: 'Image rejected.' });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-28">
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
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                FLUX Media Pipeline
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-editorial-surface font-semibold text-editorial-muted border border-editorial-border">
                {recipe.id}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              Images: {recipe.title}
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
            href={`/admin/recipes/${recipe.id}/transform`}
            className="px-4 py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 border border-brand-200 font-bold text-xs text-brand-700 inline-flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>AI Editorial</span>
          </Link>
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
          ACTIVE GENERATION PREVIEW & APPROVAL CARD (If generated)
         ========================================================================= */}
      {activeGeneration && activeGeneration.imageUrl && (
        <div className="bg-white rounded-3xl border-2 border-brand-500 p-6 sm:p-8 shadow-card space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-editorial-border pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                Ready for Review
              </span>
              <h2 className="font-serif text-2xl font-bold text-editorial-text mt-0.5">
                Review Generated Image
              </h2>
            </div>
            <div className="text-xs text-editorial-muted font-mono">
              Role: <span className="uppercase font-bold text-editorial-text">{activeGeneration.imageType}</span> • Preset: {activeGeneration.stylePreset}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Image Preview Window */}
            <div className="lg:col-span-7 bg-editorial-surface rounded-2xl overflow-hidden border border-editorial-border relative aspect-video flex items-center justify-center">
              <img
                src={activeGeneration.imageUrl}
                alt="Generated food visual"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Quality Checklist & Approval Panel */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-3">
                <h3 className="font-serif text-sm font-bold text-editorial-text">
                  Food Photography Quality Checklist:
                </h3>

                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.correctDish}
                      onChange={(e) => setChecklist({ ...checklist, correctDish: e.target.checked })}
                      className="rounded text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-editorial-text font-medium">Correct dish and key ingredients</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.realisticTextures}
                      onChange={(e) => setChecklist({ ...checklist, realisticTextures: e.target.checked })}
                      className="rounded text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-editorial-text font-medium">Appetizing, realistic textures</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.noArtifacts}
                      onChange={(e) => setChecklist({ ...checklist, noArtifacts: e.target.checked })}
                      className="rounded text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-editorial-text font-medium">No text, watermarks, or distorted utensils</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.cleanComposition}
                      onChange={(e) => setChecklist({ ...checklist, cleanComposition: e.target.checked })}
                      className="rounded text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-editorial-text font-medium">Natural lighting and clean composition</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-editorial-border space-y-2.5">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isApproving}
                    onClick={() => handleApprove('hero')}
                    className="flex-1 px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve as Hero</span>
                  </button>

                  <button
                    type="button"
                    disabled={isApproving}
                    onClick={() => handleApprove('pinterest')}
                    className="px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Approve for Pinterest</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={isApproving}
                    onClick={() => handleApprove('secondary')}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-semibold text-xs text-editorial-text transition-colors cursor-pointer"
                  >
                    Approve as Secondary
                  </button>

                  <button
                    type="button"
                    disabled={isApproving}
                    onClick={handleReject}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          IMAGE SLOTS OVERVIEW (Hero, Secondary, Pinterest)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 1. Hero Image Card (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-editorial-border p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-editorial-border pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                Primary Landscape (3:2 / 4:3)
              </span>
              <h2 className="font-serif text-lg font-bold text-editorial-text mt-0.5">
                Recipe Hero Image
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
              Active
            </span>
          </div>

          <div className="aspect-video bg-editorial-surface rounded-2xl overflow-hidden border border-editorial-border relative">
            <img
              src={recipe.heroImage?.url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80'}
              alt={recipe.heroImage?.altText || recipe.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-editorial-muted">
              {(recipe.heroImage?.url || '').includes('media.flavornest.xyz') || (recipe.heroImage?.url || '').includes('r2') ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Cloudflare R2 Asset</span>
                </span>
              ) : (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Placeholder / External</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleOpenPromptModal('hero')}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Generate New Hero</span>
            </button>
          </div>
        </div>

        {/* 2. Pinterest 2:3 Vertical Card (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-editorial-border p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-editorial-border pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                Vertical 2:3 Creative Asset (1000×1500)
              </span>
              <h2 className="font-serif text-lg font-bold text-editorial-text mt-0.5">
                Pinterest Creative Source
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 uppercase">
              Pinterest Ready
            </span>
          </div>

          <div className="aspect-video sm:aspect-auto sm:h-56 bg-editorial-surface rounded-2xl overflow-hidden border border-editorial-border relative flex items-center justify-center">
            <img
              src={recipe.heroImage?.url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80'}
              alt="Pinterest creative"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-editorial-muted">
              Vertical 2:3 crop tailored for high Pinterest pin CTR.
            </div>

            <button
              type="button"
              onClick={() => handleOpenPromptModal('pinterest')}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Generate Pinterest (2:3)</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PROMPT CUSTOMIZATION & PRESET MODAL / DRAWER
         ========================================================================= */}
      {isPromptOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-editorial-border max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-editorial-border pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                  FLUX Prompt Studio
                </span>
                <h3 className="font-serif text-xl font-bold text-editorial-text mt-0.5">
                  Generate {targetRole.toUpperCase()} Image
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPromptOpen(false)}
                className="p-2 rounded-xl hover:bg-editorial-surface text-editorial-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Style Preset Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text">
                Select Visual Preset
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(VISUAL_STYLE_PRESETS) as VisualStylePreset[]).map((presetKey) => {
                  const preset = VISUAL_STYLE_PRESETS[presetKey];
                  const isSelected = stylePreset === presetKey;
                  return (
                    <button
                      type="button"
                      key={presetKey}
                      onClick={() => handlePresetChange(presetKey)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-editorial-surfaceAlt border-brand-500 shadow-xs'
                          : 'bg-white hover:bg-editorial-surface border-editorial-border'
                      }`}
                    >
                      <div className="font-bold text-xs text-editorial-text">{preset.name}</div>
                      <div className="text-[11px] text-editorial-muted mt-0.5 line-clamp-1">
                        {preset.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editable Prompt */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text">
                Generated Food Photography Prompt
              </label>
              <textarea
                rows={4}
                value={editablePrompt}
                onChange={(e) => setEditablePrompt(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs text-editorial-text font-mono leading-relaxed"
              />
            </div>

            {/* Negative Prompt */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text">
                Negative / Quality Guidance
              </label>
              <textarea
                rows={2}
                value={editableNegative}
                onChange={(e) => setEditableNegative(e.target.value)}
                className="w-full p-3 rounded-xl bg-editorial-surface border border-editorial-border text-[11px] text-editorial-muted font-mono"
              />
            </div>

            {/* Modal CTAs */}
            <div className="pt-4 border-t border-editorial-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPromptOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border text-xs font-bold text-editorial-muted cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isGenerating || !editablePrompt.trim()}
                onClick={handleStartGeneration}
                className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-50 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Calling FLUX API...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate with FLUX</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          GENERATION HISTORY LOG
         ========================================================================= */}
      <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-editorial-border pb-3">
          <h3 className="font-serif text-base font-bold text-editorial-text flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500" />
            <span>Generation History</span>
          </h3>
          <span className="text-xs text-editorial-muted">{history.length} records</span>
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-editorial-muted italic py-4 text-center">
            No image generations logged yet for this recipe.
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <div
                key={record.id}
                className="p-3.5 rounded-xl bg-editorial-surface/60 border border-editorial-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  {record.imageUrl && (
                    <img
                      src={record.imageUrl}
                      alt="Thumbnail"
                      className="w-12 h-12 rounded-lg object-cover border border-editorial-border shrink-0"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold uppercase text-editorial-text">
                        {record.imageType}
                      </span>
                      <span className="text-[10px] text-editorial-muted">
                        • {record.stylePreset} • {record.provider}
                      </span>
                    </div>
                    <p className="text-[11px] text-editorial-muted truncate max-w-md mt-0.5">
                      {record.prompt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      record.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : record.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : record.status === 'completed'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {record.status}
                  </span>

                  {record.imageUrl && record.status === 'completed' && (
                    <button
                      type="button"
                      onClick={() => setActiveGeneration(record)}
                      className="text-brand-600 font-bold hover:underline cursor-pointer"
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
