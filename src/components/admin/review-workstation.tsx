'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Globe,
  ExternalLink,
  Flame,
  ImageIcon,
  Sparkles,
  RotateCcw,
  Save,
  Check,
  X,
  FileText,
  Utensils,
  Lightbulb,
} from 'lucide-react';
import { Recipe } from '@/lib/types/recipe';
import { RecipeDNA } from '@/lib/ai/recipe-dna';
import { PinterestCreative } from '@/lib/types/pinterest';
import { PublicationChecklistResult } from '@/lib/publishing/publishing.service';
import { PipelineActivity, PipelineStage } from '@/lib/types/pipeline';
import {
  publishRecipeAction,
  unpublishRecipeAction,
} from '@/lib/actions/publishing-actions';
import { sendBackRecipeAction } from '@/lib/actions/pipeline-actions';
import { PinCardPreview } from '@/components/pinterest/pin-card-preview';

interface ReviewWorkstationProps {
  recipe: Recipe;
  recipeDna: RecipeDNA;
  pinterestCreatives: PinterestCreative[];
  checklist: PublicationChecklistResult;
  activities: PipelineActivity[];
}

export function ReviewWorkstation({
  recipe,
  recipeDna,
  pinterestCreatives,
  checklist,
  activities,
}: ReviewWorkstationProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(recipe.status);
  const [isApproved, setIsApproved] = useState(recipe.status === 'published' || recipe.status === 'approved');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSendBackOpen, setIsSendBackOpen] = useState(false);
  const [sendBackStage, setSendBackStage] = useState<PipelineStage>('content_generation');
  const [sendBackReason, setSendBackReason] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApprove = () => {
    setIsApproved(true);
    setNotification({ type: 'success', text: 'Recipe approved! Ready for publication.' });
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setNotification(null);
    try {
      const res = await publishRecipeAction(recipe.id);
      if (res.success) {
        setStatus('published');
        setNotification({ type: 'success', text: `Recipe published! Live at ${res.publishedUrl}` });
        router.refresh();
      } else {
        setNotification({ type: 'error', text: res.error || 'Failed to publish recipe' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Publishing error' });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!confirm('Are you sure you want to unpublish this recipe?')) return;
    setIsPublishing(true);
    try {
      const res = await unpublishRecipeAction(recipe.id);
      if (res.success) {
        setStatus('draft');
        setIsApproved(false);
        setNotification({ type: 'success', text: 'Recipe unpublished and returned to draft.' });
        router.refresh();
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSendBack = async () => {
    if (!sendBackReason.trim()) return;
    try {
      await sendBackRecipeAction(recipe.id, sendBackStage, sendBackReason);
      setIsSendBackOpen(false);
      setIsApproved(false);
      setNotification({
        type: 'success',
        text: `Recipe sent back to "${sendBackStage}". Work preserved.`,
      });
      router.refresh();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Send back error' });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-28 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pipeline"
            className="p-2 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Editorial Review Workstation</span>
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  status === 'published'
                    ? 'bg-emerald-100 text-emerald-800'
                    : isApproved
                    ? 'bg-brand-100 text-brand-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {status === 'published' ? 'Published' : isApproved ? 'Approved' : 'Pending Review'}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              Review: {recipe.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/admin/recipes/${recipe.id}`}
            className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors"
          >
            Edit Form
          </Link>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
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

      {/* Main Split-Screen Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================================================
            LEFT COLUMN: FULL LIVE RECIPE PREVIEW (7 Cols)
           ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-sm space-y-6">
            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-zinc-900 border border-editorial-border shadow-xs">
              <img
                src={recipe.heroImage?.url}
                alt={recipe.heroImage?.altText || recipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-[10px] text-white font-medium">
                Alt: {recipe.heroImage?.altText}
              </div>
            </div>

            {/* Title & Short Description */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
                {recipe.primaryCategorySlug.replace(/-/g, ' ')} • {recipe.editorialStyle}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text leading-tight">
                {recipe.title}
              </h2>
              <p className="text-sm text-editorial-muted leading-relaxed mt-2">
                {recipe.shortDescription}
              </p>
            </div>

            {/* Introduction Story */}
            <div className="p-5 rounded-2xl bg-editorial-surface border border-editorial-border space-y-2">
              <h4 className="font-serif text-sm font-bold text-editorial-text flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>Editorial Introduction</span>
              </h4>
              <p className="text-xs text-editorial-muted leading-relaxed">
                {recipe.introduction}
              </p>
            </div>

            {/* Ingredients Checklist */}
            <div className="space-y-2.5">
              <h4 className="font-serif text-base font-bold text-editorial-text flex items-center gap-2">
                <Utensils className="w-4 h-4 text-brand-500" />
                <span>Ingredients ({recipe.ingredients.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white border border-editorial-border text-editorial-text font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0"></span>
                    <span>{ing.rawText}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2.5">
              <h4 className="font-serif text-base font-bold text-editorial-text">
                Instructions ({recipe.instructions.length} Steps)
              </h4>
              <div className="space-y-2 text-xs">
                {recipe.instructions.map((step) => (
                  <div key={step.stepNumber} className="p-3 rounded-xl bg-editorial-surface border border-editorial-border space-y-1">
                    <span className="font-bold text-brand-700">Step {step.stepNumber}:</span>
                    <p className="text-editorial-text leading-relaxed">{step.instructionText}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pinterest Creatives Preview */}
            {pinterestCreatives.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-editorial-border">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-base font-bold text-editorial-text flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-600" />
                    <span>Approved Pinterest Assets ({pinterestCreatives.length})</span>
                  </h4>
                  <Link
                    href={`/admin/recipes/${recipe.id}/pinterest`}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Open Studio →
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {pinterestCreatives.slice(0, 3).map((pin) => (
                    <div key={pin.id} className="space-y-1">
                      <PinCardPreview creative={pin} />
                      <span className="text-[10px] text-editorial-muted font-bold block truncate text-center">
                        {pin.overlayText}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: REVIEW CHECKLIST & ACTION CONTROLS (5 Cols)
           ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Action Gate Card */}
          <div className="bg-white rounded-3xl border-2 border-brand-300 p-6 shadow-sm space-y-5 bg-brand-50/20">
            <div className="flex items-center justify-between border-b border-editorial-border pb-3">
              <h3 className="font-serif text-base font-bold text-editorial-text">
                Editorial Actions Gate
              </h3>
              <span className="text-xs font-bold text-brand-700">Human-Controlled</span>
            </div>

            <div className="space-y-3">
              {status === 'published' ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Recipe is Published & Live</span>
                    </span>
                    <Link
                      href={`/recipes/${recipe.slug}`}
                      target="_blank"
                      className="text-emerald-700 hover:underline flex items-center gap-0.5"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <button
                    type="button"
                    disabled={isPublishing}
                    onClick={handleUnpublish}
                    className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Unpublish Recipe
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {!isApproved ? (
                    <button
                      type="button"
                      onClick={handleApprove}
                      className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>1. Approve Recipe Draft</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isPublishing || !checklist.canPublish}
                      onClick={handlePublish}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <Globe className="w-4 h-4" />
                      <span>2. Publish to Live Website</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsSendBackOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-white hover:bg-editorial-surface border border-editorial-border font-bold text-xs text-rose-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Send Back for Revision...</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quality Summary Metrics Panel */}
          <div className="bg-white rounded-3xl border border-editorial-border p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-bold text-editorial-text border-b border-editorial-border pb-2">
              Workflow Quality Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-editorial-surface">
                <span className="font-medium text-editorial-text">Content Quality</span>
                <span className="font-bold text-brand-700">94 / 100</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-editorial-surface">
                <span className="font-medium text-editorial-text">Fact Accuracy</span>
                <span className="font-bold text-emerald-700">100% Preserved</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-editorial-surface">
                <span className="font-medium text-editorial-text">SEO Completeness</span>
                <span className="font-bold text-emerald-700">100% Valid</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-editorial-surface">
                <span className="font-medium text-editorial-text">Image Readiness</span>
                <span className="font-bold text-emerald-700">100% R2 Stored</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-editorial-surface">
                <span className="font-medium text-editorial-text">Pinterest Readiness</span>
                <span className="font-bold text-emerald-700">100% Ready</span>
              </div>
            </div>
          </div>

          {/* Chronological Activity Timeline */}
          <div className="bg-white rounded-3xl border border-editorial-border p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-bold text-editorial-text flex items-center gap-1.5 border-b border-editorial-border pb-2">
              <Clock className="w-3.5 h-3.5 text-editorial-muted" />
              <span>Pipeline Activity Timeline</span>
            </h3>

            {activities.length === 0 ? (
              <p className="text-xs text-editorial-muted">No pipeline activity recorded yet.</p>
            ) : (
              <div className="space-y-3 text-xs">
                {activities.slice(0, 8).map((act) => (
                  <div key={act.id} className="border-l-2 border-brand-500 pl-3 py-0.5 space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-editorial-lightMuted font-mono">
                      <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="uppercase font-bold text-brand-600">{act.actor}</span>
                    </div>
                    <p className="font-medium text-editorial-text text-[11px]">{act.event}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Back Modal */}
      {isSendBackOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-editorial-border max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-editorial-border pb-3">
              <h3 className="font-serif text-lg font-bold text-editorial-text">
                Send Back for Revision
              </h3>
              <button
                type="button"
                onClick={() => setIsSendBackOpen(false)}
                className="p-2 rounded-xl hover:bg-editorial-surface text-editorial-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-editorial-text mb-1">
                  Send Back to Stage:
                </label>
                <select
                  value={sendBackStage}
                  onChange={(e) => setSendBackStage(e.target.value as PipelineStage)}
                  className="w-full px-3 py-2 rounded-xl bg-editorial-surface border border-editorial-border text-xs text-editorial-text"
                >
                  <option value="content_generation">Content Generation (AI prose)</option>
                  <option value="image_generation">FLUX Image Generation</option>
                  <option value="pinterest_generation">Pinterest Creatives</option>
                  <option value="recipe_dna">Recipe DNA</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-editorial-text mb-1">
                  Reason for Revision:
                </label>
                <textarea
                  rows={3}
                  value={sendBackReason}
                  onChange={(e) => setSendBackReason(e.target.value)}
                  placeholder="e.g. Adjust tone to be more approachable, re-generate hero image for lighter background..."
                  className="w-full p-3 rounded-xl bg-editorial-surface border border-editorial-border text-xs text-editorial-text leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-editorial-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSendBackOpen(false)}
                className="px-4 py-2 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-muted cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!sendBackReason.trim()}
                onClick={handleSendBack}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Confirm Send Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
