'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  ArrowLeft,
  Eye,
  ShieldCheck,
  Flame,
  Clock,
  Users,
  Utensils,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Repeat,
  Wine,
  Archive,
  Layers,
  Lock,
} from 'lucide-react';
import { Recipe } from '@/lib/types/recipe';
import { RecipeDNA } from '@/lib/ai/recipe-dna';
import { RecipeFactsLock } from '@/lib/ai/recipe-facts';
import { EditorialStyleId, EDITORIAL_STYLE_DEFINITIONS, StyleRecommendation } from '@/lib/ai/editorial-styles';
import { GeneratedEditorialContent } from '@/lib/ai/content-generator';
import { QualityValidationReport } from '@/lib/ai/quality-validator';
import {
  generateEditorialDraftAction,
  regenerateSectionAction,
  saveTransformedDraftAction,
} from '@/lib/actions/transform-actions';

interface EditorialWorkstationProps {
  recipe: Recipe;
  initialDna: RecipeDNA;
  initialFacts: RecipeFactsLock;
  initialRecommendation: StyleRecommendation;
  initialContent?: GeneratedEditorialContent | null;
  initialQualityReport?: QualityValidationReport | null;
}

export function EditorialWorkstation({
  recipe,
  initialDna,
  initialFacts,
  initialRecommendation,
  initialContent,
  initialQualityReport,
}: EditorialWorkstationProps) {
  const router = useRouter();

  // State
  const [selectedStyle, setSelectedStyle] = useState<EditorialStyleId>(
    (recipe.editorialStyle as EditorialStyleId) || initialRecommendation.primaryStyle
  );
  const [content, setContent] = useState<GeneratedEditorialContent | null>(initialContent || null);
  const [qualityReport, setQualityReport] = useState<QualityValidationReport | null>(
    initialQualityReport || null
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Auto-generate if no initial content
  useEffect(() => {
    if (!initialContent) {
      handleGenerateDraft();
    }
  }, []);

  const handleGenerateDraft = async (styleOverride?: EditorialStyleId) => {
    const style = styleOverride || selectedStyle;
    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const res = await generateEditorialDraftAction(recipe.id, style);
      if (res.success && res.content && res.qualityReport) {
        setContent(res.content);
        setQualityReport(res.qualityReport);
        setStatusMessage({ type: 'success', text: 'Editorial draft generated and fact-verified!' });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Generation failed' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error occurred during generation' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateSection = async (
    section: 'introduction' | 'whyYoullLoveThis' | 'chefTips' | 'faq' | 'substitutions'
  ) => {
    if (!content) return;
    setRegeneratingSection(section);

    try {
      const res = await regenerateSectionAction(recipe.id, section, selectedStyle);
      if (res.success && res.sectionData) {
        setContent((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            [section]: res.sectionData,
          };
        });
        setStatusMessage({ type: 'success', text: `Regenerated ${section} section.` });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to regenerate section' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Regeneration error' });
    } finally {
      setRegeneratingSection(null);
    }
  };

  const handleSaveDraft = async () => {
    if (!content) return;
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await saveTransformedDraftAction(recipe.id, content, selectedStyle);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Draft successfully saved to database!' });
        router.refresh();
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to save draft' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save' });
    } finally {
      setIsSaving(false);
    }
  };

  const currentStyleDef = EDITORIAL_STYLE_DEFINITIONS[selectedStyle];

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
                AI Editorial Workstation
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-editorial-surface font-semibold text-editorial-muted border border-editorial-border">
                {recipe.id}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
              Transform: {recipe.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/admin/recipes/${recipe.id}/preview`}
            className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-semibold text-xs text-editorial-text inline-flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-editorial-lightMuted" />
            <span>Preview Layout</span>
          </Link>

          <button
            type="button"
            disabled={isGenerating || !content}
            onClick={() => handleGenerateDraft()}
            className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate All</span>
          </button>

          <button
            type="button"
            disabled={isSaving || !content}
            onClick={handleSaveDraft}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-50 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Draft...' : 'Save as Draft'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Left Panel (DNA & Facts) vs Right Panel (Generated Editorial & Quality Report) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* =========================================================================
            LEFT COLUMN (4 Cols): Recipe DNA, Locked Facts & Style Selection
           ========================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Style Selection Card */}
          <div className="bg-white rounded-3xl border border-editorial-border p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-editorial-border pb-3">
              <h2 className="font-serif text-base font-bold text-editorial-text flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span>Editorial Style</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  setSelectedStyle(initialRecommendation.primaryStyle);
                  handleGenerateDraft(initialRecommendation.primaryStyle);
                }}
                className="text-[11px] font-bold text-brand-600 hover:underline cursor-pointer"
              >
                Let AI Choose
              </button>
            </div>

            {/* AI Recommendation Banner */}
            <div className="p-3.5 rounded-xl bg-brand-50/80 border border-brand-200 text-xs space-y-1">
              <div className="font-bold text-brand-900 flex items-center justify-between">
                <span>AI Recommended: {EDITORIAL_STYLE_DEFINITIONS[initialRecommendation.primaryStyle].name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-200/80 text-brand-800 font-mono">
                  {Math.round(initialRecommendation.confidence * 100)}% match
                </span>
              </div>
              <p className="text-[11px] text-brand-800 leading-relaxed">
                {initialRecommendation.reason}
              </p>
            </div>

            {/* Style Selector Radio List */}
            <div className="space-y-2">
              {(Object.keys(EDITORIAL_STYLE_DEFINITIONS) as EditorialStyleId[]).map((styleId) => {
                const def = EDITORIAL_STYLE_DEFINITIONS[styleId];
                const isSelected = selectedStyle === styleId;

                return (
                  <label
                    key={styleId}
                    onClick={() => {
                      setSelectedStyle(styleId);
                      handleGenerateDraft(styleId);
                    }}
                    className={`block p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-editorial-surfaceAlt/80 border-brand-500 shadow-sm'
                        : 'bg-white hover:bg-editorial-surface border-editorial-border'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-editorial-text">
                      <span>{def.name}</span>
                      <input
                        type="radio"
                        name="editorial-style"
                        checked={isSelected}
                        onChange={() => {}}
                        className="text-brand-500 focus:ring-brand-500"
                      />
                    </div>
                    <div className="text-[11px] text-editorial-muted mt-0.5 leading-snug">
                      {def.tagline}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 2. Recipe DNA Summary Card */}
          <div className="bg-white rounded-3xl border border-editorial-border p-6 shadow-sm space-y-4">
            <h2 className="font-serif text-base font-bold text-editorial-text flex items-center gap-2 border-b border-editorial-border pb-3">
              <Layers className="w-4 h-4 text-brand-500" />
              <span>Recipe DNA</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-editorial-border/60">
                <span className="text-editorial-muted font-medium">Core Dish:</span>
                <span className="font-bold text-editorial-text">{initialDna.coreDish}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-editorial-border/60">
                <span className="text-editorial-muted font-medium">Protein:</span>
                <span className="font-bold text-editorial-text">{initialDna.primaryProtein}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-editorial-border/60">
                <span className="text-editorial-muted font-medium">Cooking Method:</span>
                <span className="font-bold text-editorial-text">{initialDna.cookingMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-editorial-border/60">
                <span className="text-editorial-muted font-medium">Total Time:</span>
                <span className="font-bold text-editorial-text">{initialDna.totalTimeMinutes} minutes</span>
              </div>
              <div className="flex justify-between py-1 border-b border-editorial-border/60">
                <span className="text-editorial-muted font-medium">Difficulty:</span>
                <span className="font-bold text-editorial-text">{initialDna.difficulty}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-editorial-muted uppercase tracking-wider block mb-1.5">
                Flavor & Texture Profile:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[...initialDna.flavorProfile, ...initialDna.textureProfile].map((tag, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-full bg-editorial-surface border border-editorial-border text-[10px] font-semibold text-editorial-text capitalize">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Locked Facts Card */}
          <div className="bg-white rounded-3xl border border-editorial-border p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-editorial-border pb-3">
              <h2 className="font-serif text-base font-bold text-editorial-text flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Locked Cooking Facts</span>
              </h2>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {initialFacts.checksum}
              </span>
            </div>

            <p className="text-[11px] text-editorial-muted leading-relaxed">
              These facts are protected against hallucination and preserved in the final output.
            </p>

            <div className="space-y-1.5 text-xs text-editorial-text max-h-48 overflow-y-auto pr-1">
              {initialFacts.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] py-1 border-b border-editorial-border/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="leading-snug">{ing.rawText}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN (8 Cols): Generated Editorial Content & Quality Score
           ========================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Quality Report Card */}
          {qualityReport && (
            <div className="bg-white rounded-3xl border-2 border-editorial-borderStrong p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-editorial-lightMuted">
                    Validation & Quality Verification
                  </span>
                  <h3 className="font-serif text-xl font-bold text-editorial-text mt-0.5">
                    Content Quality Report
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-black font-serif text-editorial-text">
                      {qualityReport.score} <span className="text-xs text-editorial-lightMuted font-sans">/ 100</span>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-editorial-muted">
                      Quality Score
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase shadow-sm ${
                      qualityReport.grade === 'Excellent'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : qualityReport.grade === 'Good'
                        ? 'bg-sky-100 text-sky-800 border border-sky-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {qualityReport.grade}
                  </span>
                </div>
              </div>

              {/* Fact Check and Diversity Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex items-center justify-between">
                  <div>
                    <div className="font-bold">Fact Preservation</div>
                    <div className="text-[11px] text-emerald-800">
                      {Math.round(qualityReport.factCheck.ingredientMatchRate * 100)}% ingredients locked
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>

                <div className="p-3 rounded-xl bg-editorial-surface border border-editorial-border text-editorial-text flex items-center justify-between">
                  <div>
                    <div className="font-bold">Content Diversity</div>
                    <div className="text-[11px] text-editorial-muted">
                      {qualityReport.contentDiversityScore} / 100 diversity
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-brand-500" />
                </div>

                <div className="p-3 rounded-xl bg-editorial-surface border border-editorial-border text-editorial-text flex items-center justify-between">
                  <div>
                    <div className="font-bold">Unsupported Claims</div>
                    <div className="text-[11px] text-editorial-muted">
                      {qualityReport.unsupportedClaims.length === 0 ? 'None detected' : `${qualityReport.unsupportedClaims.length} flagged`}
                    </div>
                  </div>
                  {qualityReport.unsupportedClaims.length === 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  )}
                </div>
              </div>

              {/* Warnings / Claims details */}
              {qualityReport.warnings.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Editorial Review Notices:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {qualityReport.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Generated Editorial Fields */}
          {content ? (
            <div className="space-y-6">
              {/* Section 1: Title & Description */}
              <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-7 shadow-sm space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1">
                    Editorial Title
                  </label>
                  <input
                    type="text"
                    value={content.title}
                    onChange={(e) => setContent({ ...content, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border font-serif text-lg font-bold text-editorial-text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1">
                    Short Description (1–2 Sentences)
                  </label>
                  <textarea
                    rows={2}
                    value={content.shortDescription}
                    onChange={(e) => setContent({ ...content, shortDescription: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-editorial-surface border border-editorial-border text-xs sm:text-sm text-editorial-text"
                  />
                </div>

                {/* Timing Inputs (Minutes) */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-editorial-border">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-editorial-muted mb-1">
                      Prep Time (Mins)
                    </label>
                    <input
                      type="number"
                      value={content.prepTimeMinutes ?? 15}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setContent({
                          ...content,
                          prepTimeMinutes: val,
                          totalTimeMinutes: val + (content.cookTimeMinutes ?? 20),
                        });
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs font-bold text-editorial-text"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-editorial-muted mb-1">
                      Cook Time (Mins)
                    </label>
                    <input
                      type="number"
                      value={content.cookTimeMinutes ?? 20}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setContent({
                          ...content,
                          cookTimeMinutes: val,
                          totalTimeMinutes: (content.prepTimeMinutes ?? 15) + val,
                        });
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs font-bold text-editorial-text"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-600 mb-1">
                      Total Time (Mins)
                    </label>
                    <input
                      type="number"
                      value={content.totalTimeMinutes ?? 35}
                      onChange={(e) => setContent({ ...content, totalTimeMinutes: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-xs font-bold text-brand-700"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Introduction Story (2–4 Paragraphs) */}
              <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-editorial-border pb-3">
                  <h3 className="font-serif text-base font-bold text-editorial-text flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand-500" />
                    <span>Editorial Introduction (2–3 Paragraphs)</span>
                  </h3>
                  <button
                    type="button"
                    disabled={regeneratingSection === 'introduction'}
                    onClick={() => handleRegenerateSection('introduction')}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${regeneratingSection === 'introduction' ? 'animate-spin' : ''}`} />
                    <span>Regenerate Intro</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={content.introduction}
                  onChange={(e) => setContent({ ...content, introduction: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-editorial-surface border border-editorial-border text-sm text-editorial-text leading-relaxed font-sans"
                />
              </div>

              {/* Section 3: Why You'll Love This Recipe */}
              <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-editorial-border pb-3">
                  <h3 className="font-serif text-base font-bold text-editorial-text flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Why You&rsquo;ll Love This Recipe (Bullet Highlights)</span>
                  </h3>
                  <button
                    type="button"
                    disabled={regeneratingSection === 'whyYoullLoveThis'}
                    onClick={() => handleRegenerateSection('whyYoullLoveThis')}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${regeneratingSection === 'whyYoullLoveThis' ? 'animate-spin' : ''}`} />
                    <span>Regenerate</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {content.whyYoullLoveThis.map((point, i) => (
                    <input
                      key={i}
                      type="text"
                      value={point}
                      onChange={(e) => {
                        const updated = [...content.whyYoullLoveThis];
                        updated[i] = e.target.value;
                        setContent({ ...content, whyYoullLoveThis: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-editorial-surface border border-editorial-border text-xs text-editorial-text font-medium"
                    />
                  ))}
                </div>
              </div>

              {/* Section 3.5: The Science (Why This Recipe Works) */}
              {Array.isArray(content.scienceWhyItWorks) && content.scienceWhyItWorks.length > 0 && (
                <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-brand-400" />
                      <span>Test Kitchen Science (Why This Recipe Works)</span>
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {content.scienceWhyItWorks.map((item, i) => (
                      <textarea
                        key={i}
                        rows={2}
                        value={item}
                        onChange={(e) => {
                          const updated = [...(content.scienceWhyItWorks || [])];
                          updated[i] = e.target.value;
                          setContent({ ...content, scienceWhyItWorks: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3.6: Flavor Variations */}
              {Array.isArray(content.variations) && content.variations.length > 0 && (
                <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-7 shadow-sm space-y-4">
                  <h3 className="font-serif text-base font-bold text-editorial-text flex items-center gap-2 border-b border-editorial-border pb-3">
                    <Layers className="w-4 h-4 text-brand-500" />
                    <span>Flavor Variations & Customizations</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {content.variations.map((v: any, i) => {
                      const name = typeof v === 'string' ? `Variation ${i + 1}` : v.name;
                      const description = typeof v === 'string' ? v : v.description;
                      return (
                        <div key={i} className="p-3 rounded-xl bg-editorial-surface border border-editorial-border space-y-1.5">
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                              const updated: any[] = [...(content.variations || [])];
                              updated[i] = { name: e.target.value, description };
                              setContent({ ...content, variations: updated });
                            }}
                            className="w-full font-bold text-xs bg-white px-2 py-1 rounded border border-editorial-border"
                          />
                          <textarea
                            rows={2}
                            value={description}
                            onChange={(e) => {
                              const updated: any[] = [...(content.variations || [])];
                              updated[i] = { name, description: e.target.value };
                              setContent({ ...content, variations: updated });
                            }}
                            className="w-full text-xs text-editorial-muted bg-white px-2 py-1 rounded border border-editorial-border"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 3.7: Rewritten Step-by-Step Instructions */}
              {Array.isArray(content.instructions) && content.instructions.length > 0 && (
                <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-7 shadow-sm space-y-4">
                  <h3 className="font-serif text-base font-bold text-editorial-text flex items-center gap-2 border-b border-editorial-border pb-3">
                    <Utensils className="w-4 h-4 text-brand-500" />
                    <span>Rewritten Step-by-Step Instructions (Original Editorial Copy)</span>
                  </h3>
                  <div className="space-y-4">
                    {content.instructions.map((step, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-editorial-surface border border-editorial-border space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {step.stepNumber || idx + 1}
                          </span>
                          <input
                            type="text"
                            placeholder="Step Title (e.g. Prep & Season)"
                            value={step.title || ''}
                            onChange={(e) => {
                              const updated = [...content.instructions];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              setContent({ ...content, instructions: updated });
                            }}
                            className="flex-1 font-bold text-xs bg-white px-3 py-1.5 rounded-lg border border-editorial-border"
                          />
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Detailed instruction text..."
                          value={step.instructionText}
                          onChange={(e) => {
                            const updated = [...content.instructions];
                            updated[idx] = { ...updated[idx], instructionText: e.target.value };
                            setContent({ ...content, instructions: updated });
                          }}
                          className="w-full text-xs text-editorial-text bg-white px-3 py-2 rounded-lg border border-editorial-border leading-relaxed"
                        />
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <input
                            type="text"
                            placeholder="Step Chef Tip (optional)"
                            value={step.tip || ''}
                            onChange={(e) => {
                              const updated = [...content.instructions];
                              updated[idx] = { ...updated[idx], tip: e.target.value };
                              setContent({ ...content, instructions: updated });
                            }}
                            className="flex-1 text-[11px] text-amber-900 bg-amber-50/50 px-2.5 py-1 rounded border border-amber-200"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: Chef Tips & Substitutions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Chef Tips */}
                <div className="bg-white rounded-3xl border border-editorial-border p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-editorial-border pb-2">
                    <h4 className="font-serif text-sm font-bold text-editorial-text flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>Chef Tips</span>
                    </h4>
                    <button
                      type="button"
                      disabled={regeneratingSection === 'chefTips'}
                      onClick={() => handleRegenerateSection('chefTips')}
                      className="text-[11px] font-bold text-brand-600 hover:underline cursor-pointer"
                    >
                      Regenerate
                    </button>
                  </div>
                  <div className="space-y-2">
                    {content.chefTips.map((tip, idx) => (
                      <textarea
                        key={idx}
                        rows={2}
                        value={tip}
                        onChange={(e) => {
                          const updated = [...content.chefTips];
                          updated[idx] = e.target.value;
                          setContent({ ...content, chefTips: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-editorial-surface border border-editorial-border text-xs text-editorial-text"
                      />
                    ))}
                  </div>
                </div>

                {/* Substitutions */}
                <div className="bg-white rounded-3xl border border-editorial-border p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-editorial-border pb-2">
                    <h4 className="font-serif text-sm font-bold text-editorial-text flex items-center gap-1.5">
                      <Repeat className="w-4 h-4 text-brand-500" />
                      <span>Substitutions</span>
                    </h4>
                    <button
                      type="button"
                      disabled={regeneratingSection === 'substitutions'}
                      onClick={() => handleRegenerateSection('substitutions')}
                      className="text-[11px] font-bold text-brand-600 hover:underline cursor-pointer"
                    >
                      Regenerate
                    </button>
                  </div>
                  <div className="space-y-2">
                    {content.substitutions.length === 0 ? (
                      <p className="text-xs text-editorial-muted italic">No substitutions required for this recipe.</p>
                    ) : (
                      content.substitutions.map((sub, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-editorial-surface border border-editorial-border text-xs space-y-1">
                          <div className="font-bold text-editorial-text">Swap: {sub.original} → {sub.substitute}</div>
                          {sub.note && <div className="text-[11px] text-editorial-muted">{sub.note}</div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Section 5: Storage & Reheating */}
              <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-7 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-editorial-text flex items-center gap-2 border-b border-editorial-border pb-3">
                  <Archive className="w-4 h-4 text-brand-500" />
                  <span>Storage, Reheating & Make-Ahead</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-editorial-muted mb-1">
                      Storage Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={content.storageInstructions}
                      onChange={(e) => setContent({ ...content, storageInstructions: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-editorial-surface border border-editorial-border text-xs text-editorial-text"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-editorial-muted mb-1">
                      Reheating Guidelines
                    </label>
                    <textarea
                      rows={3}
                      value={content.reheatingInstructions}
                      onChange={(e) => setContent({ ...content, reheatingInstructions: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-editorial-surface border border-editorial-border text-xs text-editorial-text"
                    />
                  </div>
                </div>
              </div>

              {/* Section 6: Frequently Asked Questions */}
              <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-7 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-editorial-border pb-3">
                  <h3 className="font-serif text-base font-bold text-editorial-text flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-brand-500" />
                    <span>Frequently Asked Questions</span>
                  </h3>
                  <button
                    type="button"
                    disabled={regeneratingSection === 'faq'}
                    onClick={() => handleRegenerateSection('faq')}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${regeneratingSection === 'faq' ? 'animate-spin' : ''}`} />
                    <span>Regenerate FAQ</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {content.faq.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-editorial-surface/60 border border-editorial-border space-y-1.5">
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) => {
                          const updated = [...content.faq];
                          updated[idx].question = e.target.value;
                          setContent({ ...content, faq: updated });
                        }}
                        className="w-full font-bold text-xs text-editorial-text bg-white px-3 py-1.5 rounded-lg border border-editorial-border"
                      />
                      <textarea
                        rows={2}
                        value={item.answer}
                        onChange={(e) => {
                          const updated = [...content.faq];
                          updated[idx].answer = e.target.value;
                          setContent({ ...content, faq: updated });
                        }}
                        className="w-full text-xs text-editorial-muted bg-white px-3 py-1.5 rounded-lg border border-editorial-border"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 7: SEO & Pinterest Metadata */}
              <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-7 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-editorial-text flex items-center gap-2 border-b border-editorial-border pb-3">
                  <Flame className="w-4 h-4 text-brand-500" />
                  <span>SEO & Pinterest Preparation</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-editorial-muted mb-1">SEO Title</label>
                    <input
                      type="text"
                      value={content.seoTitle}
                      onChange={(e) => setContent({ ...content, seoTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-editorial-surface border border-editorial-border text-editorial-text font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-editorial-muted mb-1">Pinterest Pin Title</label>
                    <input
                      type="text"
                      value={content.pinterestMetadata.pinTitle}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          pinterestMetadata: { ...content.pinterestMetadata, pinTitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-editorial-surface border border-editorial-border text-editorial-text font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-editorial-muted mb-1">Pinterest Pin Description</label>
                    <textarea
                      rows={2}
                      value={content.pinterestMetadata.pinDescription}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          pinterestMetadata: { ...content.pinterestMetadata, pinDescription: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-editorial-surface border border-editorial-border text-editorial-text"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-editorial-border">
                <Link
                  href={`/admin/recipes/${recipe.id}`}
                  className="text-xs font-bold text-editorial-muted hover:text-editorial-text"
                >
                  ← Return to Recipe Form
                </Link>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveDraft}
                  className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-50 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Draft...' : 'Save Transformed Draft'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-white rounded-3xl border border-editorial-border text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mx-auto" />
              <h3 className="font-serif text-lg font-bold text-editorial-text">
                Analyzing facts & generating editorial draft...
              </h3>
              <p className="text-xs text-editorial-muted">
                Extracting culinary DNA and verifying locked ingredient facts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
