'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  Plus,
  Trash2,
  Eye,
  Archive,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  Flame,
  Globe,
  ShieldCheck,
  ExternalLink,
  Search,
} from 'lucide-react';
import { Recipe } from '@/lib/types/recipe';
import { Category } from '@/lib/types/category';
import { Tag } from '@/lib/repositories/tag.repository';
import { slugify } from '@/lib/utils/slug';
import { createRecipeAction, updateRecipeAction, archiveRecipeAction } from '@/lib/actions/admin-actions';
import {
  publishRecipeAction,
  unpublishRecipeAction,
  getPublicationChecklistAction,
} from '@/lib/actions/publishing-actions';
import { PublicationChecklistResult } from '@/lib/publishing/publishing.service';
import { EDITORIAL_STYLES } from '@/lib/config/categories.config';

interface RecipeFormProps {
  initialRecipe?: Recipe | null;
  categories: Category[];
  tags: Tag[];
}

export function RecipeForm({ initialRecipe, categories, tags }: RecipeFormProps) {
  const router = useRouter();
  const isEditing = !!initialRecipe;

  // Form State
  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [slug, setSlug] = useState(initialRecipe?.slug || '');
  const [shortDescription, setShortDescription] = useState(initialRecipe?.shortDescription || '');
  const [introduction, setIntroduction] = useState(initialRecipe?.introduction || '');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(initialRecipe?.prepTimeMinutes || 10);
  const [cookTimeMinutes, setCookTimeMinutes] = useState(initialRecipe?.cookTimeMinutes || 20);
  const [servings, setServings] = useState(initialRecipe?.servings || 4);
  const [servingsUnit, setServingsUnit] = useState(initialRecipe?.servingsUnit || 'servings');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialRecipe?.difficulty || 'easy');
  const [cuisine, setCuisine] = useState(initialRecipe?.cuisine || 'American');
  const [mealType, setMealType] = useState<any>(initialRecipe?.mealType || 'dinner');
  const [cookingMethod, setCookingMethod] = useState<any>(initialRecipe?.cookingMethod || 'stovetop');
  const [primaryCategorySlug, setPrimaryCategorySlug] = useState(
    initialRecipe?.primaryCategorySlug || (categories[0]?.slug || 'quick-and-easy')
  );
  const [editorialStyle, setEditorialStyle] = useState<any>(initialRecipe?.editorialStyle || 'quick-easy');
  const [status, setStatus] = useState<any>(initialRecipe?.status || 'draft');

  // Hero Image
  const [heroImageUrl, setHeroImageUrl] = useState(
    initialRecipe?.heroImage?.url ||
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80'
  );
  const [heroImageAlt, setHeroImageAlt] = useState(initialRecipe?.heroImage?.altText || '');

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState(initialRecipe?.seoTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialRecipe?.metaDescription || '');

  // Ingredients repeater
  const [ingredients, setIngredients] = useState<Array<{ id: string; rawText: string; item: string }>>(
    initialRecipe?.ingredients?.length
      ? initialRecipe.ingredients.map((ing) => ({ id: ing.id, rawText: ing.rawText, item: ing.item }))
      : [
          { id: '1', rawText: '2 lbs chicken breasts, diced', item: 'Chicken breasts' },
          { id: '2', rawText: '4 cloves garlic, minced', item: 'Garlic' },
        ]
  );

  // Instructions repeater
  const [instructions, setInstructions] = useState<Array<{ stepNumber: number; title: string; instructionText: string; tip?: string }>>(
    initialRecipe?.instructions?.length
      ? initialRecipe.instructions.map((ins) => ({
          stepNumber: ins.stepNumber,
          title: ins.title || '',
          instructionText: ins.instructionText,
          tip: ins.tip || '',
        }))
      : [
          { stepNumber: 1, title: 'Prep', instructionText: 'Season ingredients thoroughly.', tip: '' },
          { stepNumber: 2, title: 'Cook', instructionText: 'Cook over medium-high heat until golden.', tip: '' },
        ]
  );

  // Status & Error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-generate slug from title if not custom
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing || !slug) {
      setSlug(slugify(val));
    }
  };

  // Ingredients operations
  const addIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(2, 8), rawText: '', item: '' },
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: 'rawText' | 'item', value: string) => {
    setIngredients((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'rawText' && !next[index].item) {
        next[index].item = value.split(',')[0].trim();
      }
      return next;
    });
  };

  // Instructions operations
  const addInstruction = () => {
    setInstructions((prev) => [
      ...prev,
      { stepNumber: prev.length + 1, title: '', instructionText: '', tip: '' },
    ]);
  };

  const removeInstruction = (index: number) => {
    setInstructions((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((ins, i) => ({ ...ins, stepNumber: i + 1 }))
    );
  };

  const updateInstruction = (index: number, field: 'title' | 'instructionText' | 'tip', value: string) => {
    setInstructions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Save handler
  const handleSave = async (forcedStatus?: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const targetStatus = forcedStatus || status;
    const totalTime = Number(prepTimeMinutes) + Number(cookTimeMinutes);

    const payload = {
      title,
      slug: slug || slugify(title),
      shortDescription,
      introduction,
      ingredients,
      instructions,
      prepTimeMinutes: Number(prepTimeMinutes),
      cookTimeMinutes: Number(cookTimeMinutes),
      totalTimeMinutes: totalTime,
      servings: Number(servings),
      servingsUnit,
      difficulty,
      cuisine,
      mealType,
      cookingMethod,
      primaryCategorySlug,
      categorySlugs: [primaryCategorySlug],
      tags: [],
      heroImageUrl,
      heroImageAlt: heroImageAlt || title,
      editorialStyle,
      status: targetStatus,
      seoTitle: seoTitle || `${title} | FlavorNest`,
      metaDescription: metaDescription || shortDescription,
      canonicalUrl: `https://flavornest.xyz/recipes/${slug || slugify(title)}`,
    };

    try {
      if (isEditing && initialRecipe) {
        const res = await updateRecipeAction(initialRecipe.id, payload);
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to update recipe');
        } else {
          setSuccessMsg('Recipe saved successfully!');
          router.refresh();
        }
      } else {
        const res = await createRecipeAction(payload);
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to create recipe');
        } else {
          setSuccessMsg('Recipe created successfully!');
          router.push(`/admin/recipes/${res.recipe?.id}`);
          router.refresh();
        }
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Minified React error') || msg.includes('441')) {
        setErrorMsg('Session expired or edge connection reset. Please refresh the page and verify login to save.');
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'Server error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const [checklist, setChecklist] = useState<PublicationChecklistResult | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Load publication checklist if editing
  React.useEffect(() => {
    if (isEditing && initialRecipe) {
      getPublicationChecklistAction(initialRecipe.id).then((res) => {
        if (res.success && res.checklist) {
          setChecklist(res.checklist);
        }
      });
    }
  }, [isEditing, initialRecipe, title, shortDescription, ingredients, instructions, heroImageUrl]);

  const handlePublish = async () => {
    if (!initialRecipe) return;
    setIsPublishing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await publishRecipeAction(initialRecipe.id);
      if (res.success) {
        setStatus('published');
        setSuccessMsg(`Recipe published successfully! Live at ${res.publishedUrl}`);
        router.refresh();
      } else {
        setErrorMsg(res.error || 'Failed to publish recipe');
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Minified React error') || msg.includes('441')) {
        setErrorMsg('Session expired or edge connection reset. Please refresh the page and verify login.');
      } else {
        setErrorMsg(err.message || 'Error occurred while publishing');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!initialRecipe || !confirm('Are you sure you want to unpublish this recipe? It will return to draft status and be removed from public listings.')) return;
    setIsPublishing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await unpublishRecipeAction(initialRecipe.id);
      if (res.success) {
        setStatus('draft');
        setSuccessMsg('Recipe unpublished and returned to draft.');
        router.refresh();
      } else {
        setErrorMsg(res.error || 'Failed to unpublish');
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Minified React error') || msg.includes('441')) {
        setErrorMsg('Session expired or edge connection reset. Please refresh the page and verify login.');
      } else {
        setErrorMsg(err.message || 'Error unpublishing');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleArchive = async () => {
    if (!initialRecipe || !confirm('Are you sure you want to archive this recipe?')) return;
    setIsSubmitting(true);
    const res = await archiveRecipeAction(initialRecipe.id);
    if (res.success) {
      setStatus('archived');
      setSuccessMsg('Recipe archived.');
      router.refresh();
    } else {
      setErrorMsg(res.error || 'Failed to archive');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/recipes"
            className="p-2 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text">
              {isEditing ? `Edit: ${initialRecipe.title}` : 'Create New Recipe'}
            </h1>
            <p className="text-xs text-editorial-muted">
              {isEditing ? `ID: ${initialRecipe.id}` : 'Fill in the recipe fields below.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isEditing && (
            <>
              <Link
                href={`/admin/recipes/${initialRecipe.id}/pinterest`}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold text-xs text-rose-700 inline-flex items-center gap-1.5 transition-colors"
              >
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                <span>Pinterest</span>
              </Link>
              <Link
                href={`/admin/recipes/${initialRecipe.id}/images`}
                className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text inline-flex items-center gap-1.5 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-editorial-lightMuted" />
                <span>Images</span>
              </Link>
              <Link
                href={`/admin/recipes/${initialRecipe.id}/transform`}
                className="px-4 py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 border border-brand-200 font-bold text-xs text-brand-700 inline-flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Transform with AI</span>
              </Link>
              <Link
                href={`/admin/recipes/${initialRecipe.id}/review`}
                className="px-4 py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 border border-brand-300 font-bold text-xs text-brand-800 inline-flex items-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                <span>Review</span>
              </Link>
              <Link
                href={`/admin/recipes/${initialRecipe.id}/preview`}
                className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-semibold text-xs text-editorial-text inline-flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-editorial-lightMuted" />
                <span>Preview</span>
              </Link>
            </>
          )}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave()}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-50 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Recipe'}</span>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Sections */}
      <div className="space-y-8">
        {/* Publishing & Search Engine Discovery Station (Only when editing) */}
        {isEditing && initialRecipe && (
          <div className="bg-white rounded-3xl border-2 border-editorial-borderStrong p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-editorial-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                    Publishing & Search Discovery Station
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      status === 'published'
                        ? 'bg-emerald-100 text-emerald-800'
                        : status === 'archived'
                        ? 'bg-zinc-200 text-zinc-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Status: {status}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-editorial-text mt-0.5">
                  Publication Health & Bing/Google Indexation
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {status === 'published' ? (
                  <>
                    <Link
                      href={`/recipes/${initialRecipe.slug}`}
                      target="_blank"
                      className="px-3.5 py-2 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border text-xs font-semibold text-editorial-text inline-flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live URL</span>
                    </Link>
                    <button
                      type="button"
                      disabled={isPublishing}
                      onClick={handleUnpublish}
                      className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      {isPublishing ? 'Updating...' : 'Unpublish'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={isPublishing || (checklist ? !checklist.canPublish : true)}
                    onClick={handlePublish}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isPublishing ? 'Publishing...' : 'Publish Recipe'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Checklist Grid */}
            {checklist && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-editorial-muted">
                  <span>Publication Readiness Checklist</span>
                  <span className="font-mono text-editorial-text">
                    Score: {checklist.score}/8 {checklist.canPublish ? '✓ Ready' : '✗ Requirements Missing'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${checklist.checks.contentComplete ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${checklist.checks.contentComplete ? 'text-emerald-600' : 'text-rose-400'}`} />
                    <span className="font-medium text-[11px]">Content Complete</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${checklist.checks.factsValid ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${checklist.checks.factsValid ? 'text-emerald-600' : 'text-rose-400'}`} />
                    <span className="font-medium text-[11px]">Recipe Facts Lock</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${checklist.checks.heroImageApproved ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${checklist.checks.heroImageApproved ? 'text-emerald-600' : 'text-rose-400'}`} />
                    <span className="font-medium text-[11px]">Hero Image Ready</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${checklist.checks.seoComplete ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${checklist.checks.seoComplete ? 'text-emerald-600' : 'text-rose-400'}`} />
                    <span className="font-medium text-[11px]">SEO Metadata</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${checklist.checks.canonicalValid ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${checklist.checks.canonicalValid ? 'text-emerald-600' : 'text-rose-400'}`} />
                    <span className="font-medium text-[11px]">Canonical URL</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${checklist.checks.categoryAssigned ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${checklist.checks.categoryAssigned ? 'text-emerald-600' : 'text-rose-400'}`} />
                    <span className="font-medium text-[11px]">Category Assigned</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${checklist.checks.schemaReady ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${checklist.checks.schemaReady ? 'text-emerald-600' : 'text-rose-400'}`} />
                    <span className="font-medium text-[11px]">JSON-LD Schema</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${checklist.checks.pinterestCreativeReady ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-amber-50/70 border-amber-200 text-amber-900'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${checklist.checks.pinterestCreativeReady ? 'text-emerald-600' : 'text-amber-500'}`} />
                    <span className="font-medium text-[11px]">Pinterest Ready</span>
                  </div>
                </div>

                {checklist.missingRequirements.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                    <span className="font-bold block mb-1">Recipe isn&apos;t ready to publish:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {checklist.missingRequirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-2xl border border-editorial-border p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-editorial-text border-b border-editorial-border pb-3">
            1. Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1.5">
                Recipe Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Creamy Garlic Butter Tuscan Chicken"
                className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-sm text-editorial-text focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1.5">
                URL Slug *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-editorial-surfaceAlt border border-r-0 border-editorial-border rounded-l-xl text-xs text-editorial-lightMuted font-mono">
                  /recipes/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="creamy-garlic-butter-tuscan-chicken"
                  className="flex-1 px-4 py-2.5 rounded-r-xl bg-editorial-surface border border-editorial-border text-sm font-mono text-editorial-text focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1.5">
                Short Description (Card & Social Snippet) *
              </label>
              <textarea
                rows={2}
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Pan-seared golden chicken breasts simmered in a rich garlic butter cream sauce..."
                className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-sm text-editorial-text focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1.5">
                Editorial Introduction Story *
              </label>
              <textarea
                rows={4}
                required
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                placeholder="Describe what makes this recipe special, appetizing texture notes, and culinary inspiration..."
                className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-sm text-editorial-text focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Recipe Metrics & Timings */}
        <div className="bg-white rounded-2xl border border-editorial-border p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-editorial-text border-b border-editorial-border pb-3">
            2. Timings, Servings & Difficulty
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1.5">
                Prep (Mins)
              </label>
              <input
                type="number"
                min={0}
                value={prepTimeMinutes}
                onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-sm text-editorial-text font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1.5">
                Cook (Mins)
              </label>
              <input
                type="number"
                min={0}
                value={cookTimeMinutes}
                onChange={(e) => setCookTimeMinutes(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-sm text-editorial-text font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-600 mb-1.5">
                Total Time
              </label>
              <div className="px-4 py-2.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 font-bold text-sm">
                {Number(prepTimeMinutes) + Number(cookTimeMinutes)} mins
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1.5">
                Servings
              </label>
              <input
                type="number"
                min={1}
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-sm text-editorial-text font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs font-bold text-editorial-text"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1.5">
                Meal Type
              </label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs font-bold text-editorial-text"
              >
                <option value="dinner">Dinner</option>
                <option value="lunch">Lunch</option>
                <option value="breakfast">Breakfast</option>
                <option value="dessert">Dessert</option>
                <option value="appetizer">Appetizer</option>
                <option value="side-dish">Side Dish</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1.5">
                Method
              </label>
              <select
                value={cookingMethod}
                onChange={(e) => setCookingMethod(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs font-bold text-editorial-text"
              >
                <option value="stovetop">Stovetop</option>
                <option value="baking">Baking</option>
                <option value="air-fryer">Air Fryer</option>
                <option value="slow-cooker">Slow Cooker</option>
                <option value="one-pot">One-Pot</option>
                <option value="grilling">Grilling</option>
                <option value="no-cook">No Cook</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1.5">
                Cuisine
              </label>
              <input
                type="text"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                placeholder="American / Italian"
                className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs font-bold text-editorial-text"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Ingredients Checklist Builder */}
        <div className="bg-white rounded-2xl border border-editorial-border p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-editorial-border pb-3">
            <h2 className="font-serif text-lg font-bold text-editorial-text">
              3. Ingredients List
            </h2>
            <button
              type="button"
              onClick={addIngredient}
              className="px-3 py-1.5 rounded-lg bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border text-xs font-bold text-brand-600 inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Ingredient</span>
            </button>
          </div>

          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div key={ing.id} className="flex items-center gap-2">
                <span className="text-xs font-bold text-editorial-lightMuted w-6 text-center">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  required
                  value={ing.rawText}
                  onChange={(e) => updateIngredient(idx, 'rawText', e.target.value)}
                  placeholder="e.g. 1/2 cup heavy whipping cream"
                  className="flex-1 px-4 py-2 rounded-xl bg-editorial-surface border border-editorial-border text-xs sm:text-sm text-editorial-text focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(idx)}
                  disabled={ingredients.length <= 1}
                  className="p-2 text-editorial-lightMuted hover:text-rose-600 disabled:opacity-30 rounded-lg hover:bg-rose-50 cursor-pointer"
                  title="Remove ingredient"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Step-by-Step Instructions Builder */}
        <div className="bg-white rounded-2xl border border-editorial-border p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-editorial-border pb-3">
            <h2 className="font-serif text-lg font-bold text-editorial-text">
              4. Instructions (Step-by-Step)
            </h2>
            <button
              type="button"
              onClick={addInstruction}
              className="px-3 py-1.5 rounded-lg bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border text-xs font-bold text-brand-600 inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Step</span>
            </button>
          </div>

          <div className="space-y-4">
            {instructions.map((ins, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-editorial-surface/60 border border-editorial-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                    Step {ins.stepNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeInstruction(idx)}
                    disabled={instructions.length <= 1}
                    className="p-1 text-editorial-lightMuted hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                    title="Remove step"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={ins.title}
                  onChange={(e) => updateInstruction(idx, 'title', e.target.value)}
                  placeholder="Optional Step Title (e.g. Sear until Golden)"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-editorial-border text-xs font-semibold text-editorial-text"
                />
                <textarea
                  rows={2}
                  required
                  value={ins.instructionText}
                  onChange={(e) => updateInstruction(idx, 'instructionText', e.target.value)}
                  placeholder="Describe step instructions..."
                  className="w-full px-3 py-2 rounded-lg bg-white border border-editorial-border text-xs sm:text-sm text-editorial-text"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Categorization, Editorial Angle & Media */}
        <div className="bg-white rounded-2xl border border-editorial-border p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-editorial-text border-b border-editorial-border pb-3">
            5. Categorization & Editorial Angle
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1.5">
                Primary Category *
              </label>
              <select
                value={primaryCategorySlug}
                onChange={(e) => setPrimaryCategorySlug(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs font-bold text-editorial-text"
              >
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1.5">
                7 Editorial Angle *
              </label>
              <select
                value={editorialStyle}
                onChange={(e) => setEditorialStyle(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs font-bold text-editorial-text"
              >
                {Object.values(EDITORIAL_STYLES).map((angle) => (
                  <option key={angle.id} value={angle.id}>
                    {angle.title} — {angle.tagline}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1.5">
                Hero Image URL (R2 or CDN reference) *
              </label>
              <input
                type="url"
                required
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs font-mono text-editorial-text"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1.5">
                Image Alt Text *
              </label>
              <input
                type="text"
                required
                value={heroImageAlt}
                onChange={(e) => setHeroImageAlt(e.target.value)}
                placeholder="Descriptive alt text for Pinterest & Bing SEO..."
                className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs text-editorial-text"
              />
            </div>
          </div>
        </div>

        {/* Section 6: SEO Intelligence & Rich Snippets */}
        <div className="bg-white rounded-2xl border border-editorial-border p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-editorial-border pb-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-editorial-text flex items-center gap-2">
                <Search className="w-4 h-4 text-brand-600" />
                <span>6. SEO Intelligence & Rich Snippets</span>
              </h2>
              <p className="text-xs text-editorial-muted">
                Control metadata, trailing slash canonical URL, and search engine snippet presentation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!seoTitle) setSeoTitle(`${title} (${prepTimeMinutes + cookTimeMinutes}-Minute Recipe) | FlavorNest`);
                if (!metaDescription) setMetaDescription(shortDescription || `An easy, delicious ${title.toLowerCase()} made with pantry staples.`);
              }}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 underline cursor-pointer"
            >
              Auto-Suggest Snippet
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text">
                  SEO Title Tag
                </label>
                <span className={`text-[11px] font-mono ${seoTitle.length > 60 ? 'text-amber-600 font-bold' : 'text-editorial-lightMuted'}`}>
                  {seoTitle.length} / 60 chars (optimal)
                </span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="e.g. Creamy Garlic Butter Tuscan Chicken (30-Minute Dinner) | FlavorNest"
                className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-sm text-editorial-text"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text">
                  Meta Description
                </label>
                <span className={`text-[11px] font-mono ${metaDescription.length > 160 ? 'text-amber-600 font-bold' : 'text-editorial-lightMuted'}`}>
                  {metaDescription.length} / 155 chars (optimal)
                </span>
              </div>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Pan-seared golden chicken breasts in a rich garlic butter cream sauce. An easy weeknight dinner recipe ready in 30 minutes with simple ingredients."
                className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-sm text-editorial-text"
              />
            </div>

            <div className="sm:col-span-2 p-4 rounded-xl bg-editorial-surface border border-editorial-border text-xs space-y-1">
              <span className="font-bold text-editorial-text block">
                Canonical URL (Always generated with trailing slash):
              </span>
              <span className="font-mono text-[11px] text-brand-700 break-all">
                https://flavornest.xyz/recipes/{slug}/
              </span>
            </div>
          </div>
        </div>

        {/* Section 7: Publishing & Actions */}
        <div className="bg-white rounded-2xl border border-editorial-border p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-editorial-text border-b border-editorial-border pb-3">
            7. Status & Publishing Control
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text mb-1.5">
                Recipe Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs font-bold text-editorial-text"
              >
                <option value="draft">Draft (Private)</option>
                <option value="review">Review (Pending Review)</option>
                <option value="approved">Approved (Ready to Publish)</option>
                <option value="published">Published (Live on Website)</option>
                <option value="archived">Archived (Unlisted)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-editorial-border flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSave('draft')}
                className="px-5 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-all cursor-pointer"
              >
                Save as Draft
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSave('review')}
                className="px-5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 font-bold text-xs text-sky-800 transition-all cursor-pointer"
              >
                Save & Review
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSave('published')}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Save & Publish
              </button>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={handleArchive}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive Recipe</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
