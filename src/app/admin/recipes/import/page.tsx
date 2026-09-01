'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UploadCloud,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Edit,
  ExternalLink,
  ShieldAlert,
  Clock,
  Sparkles,
} from 'lucide-react';
import { analyzeRecipeUrlAction, saveImportedDraftAction } from '@/lib/actions/import-actions';
import { RecipeExtractionResult } from '@/lib/importer/recipe-import.service';

export default function AdminRecipeImportPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [result, setResult] = useState<RecipeExtractionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setErrorMsg('');
    setResult(null);
    setAnalyzing(true);

    try {
      const res = await analyzeRecipeUrlAction(url.trim());
      if (!res.success) {
        setErrorMsg(res.errors[0] || 'Analysis failed. Please check the URL.');
      } else {
        setResult(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during extraction.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!result?.recipe) return;
    setSavingDraft(true);
    setErrorMsg('');

    try {
      const res = await saveImportedDraftAction(result.recipe);
      if (res.success && res.recipeId) {
        router.push(`/admin/recipes/${res.recipeId}`);
      } else {
        setErrorMsg(res.error || 'Failed to save draft.');
        setSavingDraft(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving recipe draft.');
      setSavingDraft(false);
    }
  };

  const getConfidenceBadge = (confidence?: string) => {
    if (confidence === 'high') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>High confidence</span>
        </span>
      );
    }
    if (confidence === 'medium') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          <span>Medium confidence</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 uppercase">
        <AlertTriangle className="w-3 h-3 text-rose-600" />
        <span>Low / Fallback</span>
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24">
      {/* Page Header */}
      <div className="border-b border-editorial-border pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
          Recipe Ingestion Pipeline
        </span>
        <h1 className="font-serif text-3xl font-bold text-editorial-text mt-1">
          Import Recipe from URL
        </h1>
        <p className="text-xs sm:text-sm text-editorial-muted">
          Extract structured ingredients, timings, and instructions from external recipe pages to prepare a draft.
        </p>
      </div>

      {/* URL Input Form */}
      <div className="bg-white rounded-3xl border-2 border-editorial-borderStrong p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label htmlFor="recipe-url" className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-2">
              Paste a Recipe URL
            </label>
            <div className="relative">
              <input
                id="recipe-url"
                type="url"
                required
                disabled={analyzing}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/recipes/creamy-garlic-chicken"
                className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-editorial-surface border border-editorial-border text-sm text-editorial-text font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <p className="text-[11px] text-editorial-lightMuted mt-1.5">
              Supports Schema.org JSON-LD, @graph collections, and semantic HTML recipe layouts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={analyzing || !url.trim()}
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Recipe...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Recipe</span>
                </>
              )}
            </button>

            {result && (
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setUrl('');
                }}
                className="px-4 py-3 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border text-xs font-semibold text-editorial-muted cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Duplicate Notice */}
      {result?.duplicate?.isDuplicate && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Duplicate Source Warning</span>
          </div>
          <p>
            This source URL was already imported as &ldquo;<strong>{result.duplicate.existingTitle}</strong>&rdquo; (Status: <span className="uppercase font-bold">{result.duplicate.existingStatus}</span>).
          </p>
          <div className="pt-1">
            <Link
              href={`/admin/recipes/${result.duplicate.existingRecipeId}`}
              className="text-brand-600 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Open Existing Recipe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Extraction Results Breakdown */}
      {result && result.recipe && (
        <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-card space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-editorial-border pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-lightMuted">
                Source: {result.domain}
              </span>
              <h2 className="font-serif text-2xl font-bold text-editorial-text mt-0.5">
                {result.recipe.title}
              </h2>
            </div>
            <div className="text-right text-[11px] text-editorial-lightMuted font-mono">
              Processed in {result.durationMs}ms
            </div>
          </div>

          {/* Warnings list */}
          {result.warnings.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Extraction Notices:</span>
              </span>
              <ul className="list-disc pl-5 space-y-0.5">
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Field Confidence Grid */}
          <div className="space-y-3 text-xs">
            <h3 className="font-serif text-sm font-bold text-editorial-text">
              Supported Information Detected:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-editorial-surface/60 border border-editorial-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-editorial-text">Recipe Title</div>
                  <div className="text-[11px] text-editorial-muted truncate max-w-xs">{result.recipe.title}</div>
                </div>
                {getConfidenceBadge(result.confidences.title?.confidence)}
              </div>

              <div className="p-3.5 rounded-xl bg-editorial-surface/60 border border-editorial-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-editorial-text">Ingredients</div>
                  <div className="text-[11px] text-editorial-muted">{result.recipe.ingredients.length} items detected</div>
                </div>
                {getConfidenceBadge(result.confidences.ingredients?.confidence)}
              </div>

              <div className="p-3.5 rounded-xl bg-editorial-surface/60 border border-editorial-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-editorial-text">Instructions</div>
                  <div className="text-[11px] text-editorial-muted">{result.recipe.instructions.length} steps detected</div>
                </div>
                {getConfidenceBadge(result.confidences.instructions?.confidence)}
              </div>

              <div className="p-3.5 rounded-xl bg-editorial-surface/60 border border-editorial-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-editorial-text">Cooking Timings</div>
                  <div className="text-[11px] text-editorial-muted">
                    Prep: {result.recipe.prepTimeMinutes}m • Cook: {result.recipe.cookTimeMinutes}m • Total: {result.recipe.totalTimeMinutes}m
                  </div>
                </div>
                {getConfidenceBadge(result.confidences.cookTime?.confidence)}
              </div>

              <div className="p-3.5 rounded-xl bg-editorial-surface/60 border border-editorial-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-editorial-text">Servings Yield</div>
                  <div className="text-[11px] text-editorial-muted">{result.recipe.servings} servings</div>
                </div>
                {getConfidenceBadge(result.confidences.servings?.confidence)}
              </div>

              <div className="p-3.5 rounded-xl bg-editorial-surface/60 border border-editorial-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-editorial-text">Category & Cuisine</div>
                  <div className="text-[11px] text-editorial-muted capitalize">
                    {result.recipe.primaryCategorySlug} ({result.recipe.cuisine})
                  </div>
                </div>
                {getConfidenceBadge(result.confidences.category?.confidence)}
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-xl bg-editorial-surface/60 border border-editorial-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-editorial-text">Image Reference</div>
                  <div className="text-[11px] text-amber-800">
                    ⚠ External reference only — Will be replaced by original FLUX image in future editorial pipeline.
                  </div>
                </div>
                {getConfidenceBadge(result.confidences.image?.confidence)}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-editorial-border flex flex-wrap items-center justify-between gap-4">
            <div className="text-[11px] text-editorial-lightMuted">
              Saving will create a private <strong>draft</strong> record.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={savingDraft}
                onClick={handleSaveDraft}
                className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {savingDraft ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Draft...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Editor</span>
                    <ArrowRight className="w-4 h-4" />
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
