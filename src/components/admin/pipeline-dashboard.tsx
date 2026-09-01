'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Workflow,
  Sparkles,
  RefreshCw,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  Search,
  Filter,
  Flame,
  ImageIcon,
  ShieldCheck,
  Zap,
  DollarSign,
  Layers,
  X,
  FileText,
} from 'lucide-react';
import { PipelineRecipeItem, BudgetGuardConfig } from '@/lib/types/pipeline';
import {
  startPipelineAction,
  runPipelineStageAction,
  bulkImportUrlsAction,
} from '@/lib/actions/pipeline-actions';

interface PipelineDashboardProps {
  initialRecipes: PipelineRecipeItem[];
  budget: BudgetGuardConfig;
  stats: {
    importedToday: number;
    processing: number;
    readyForReview: number;
    published: number;
    failed: number;
  };
}

export function PipelineDashboard({
  initialRecipes,
  budget,
  stats,
}: PipelineDashboardProps) {
  const router = useRouter();
  const [recipes, setRecipes] = useState<PipelineRecipeItem[]>(initialRecipes);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkUrlsText, setBulkUrlsText] = useState('');
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [activePipelineId, setActivePipelineId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredRecipes = recipes.filter((recipe) => {
    if (statusFilter === 'review' && recipe.overallStatus !== 'review') return false;
    if (statusFilter === 'processing' && (recipe.overallStatus === 'published' || recipe.overallStatus === 'review')) return false;
    if (statusFilter === 'published' && recipe.overallStatus !== 'published') return false;
    if (statusFilter === 'failed' && recipe.overallStatus !== 'failed') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        recipe.title.toLowerCase().includes(q) ||
        recipe.slug.toLowerCase().includes(q) ||
        (recipe.sourceDomain && recipe.sourceDomain.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleStartPipeline = async (recipeId: string) => {
    setActivePipelineId(recipeId);
    setNotification(null);
    try {
      const res = await startPipelineAction(recipeId);
      if (res.success) {
        setNotification({ type: 'success', text: 'Full pipeline executed successfully! Ready for review.' });
        router.refresh();
      } else {
        setNotification({ type: 'error', text: res.error || 'Pipeline execution failed' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Pipeline error' });
    } finally {
      setActivePipelineId(null);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkUrlsText.trim()) return;
    setIsBulkSubmitting(true);
    setNotification(null);
    try {
      const res = await bulkImportUrlsAction(bulkUrlsText);
      if (res.success && res.batch) {
        setNotification({
          type: 'success',
          text: `Bulk imported ${res.batch.validCount} valid URL(s) and queued for automated pipeline!`,
        });
        setIsBulkModalOpen(false);
        setBulkUrlsText('');
        router.refresh();
      } else {
        setNotification({ type: 'error', text: res.error || 'Bulk import failed' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Bulk import error' });
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-28 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
              <Workflow className="w-4 h-4" />
              <span>Operations Control</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 font-semibold text-emerald-800">
              Pipeline Active
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
            Recipe Content Pipeline
          </h1>
          <p className="text-xs text-editorial-muted">
            End-to-end automated recipe preparation with human editorial review.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Bulk URL Import</span>
          </button>
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

      {/* KPI Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
            Imported Today
          </span>
          <div className="font-serif text-2xl font-bold text-editorial-text">
            {stats.importedToday}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
            Processing
          </span>
          <div className="font-serif text-2xl font-bold text-amber-950">
            {stats.processing}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border-2 border-brand-300 shadow-xs space-y-1 bg-brand-50/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
            Ready for Review
          </span>
          <div className="font-serif text-2xl font-bold text-brand-950">
            {stats.readyForReview}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Published
          </span>
          <div className="font-serif text-2xl font-bold text-emerald-950">
            {stats.published}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
            Failed
          </span>
          <div className="font-serif text-2xl font-bold text-rose-950">
            {stats.failed}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-editorial-border shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            AI / FLUX Spend
          </span>
          <div className="font-serif text-2xl font-bold text-zinc-900">
            ${(budget.dailyAiSpent + budget.dailyImageSpent).toFixed(2)}
          </div>
        </div>
      </div>

      {/* System Health Monitor */}
      <div className="p-4 rounded-2xl bg-editorial-surface border border-editorial-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-editorial-text font-bold">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>System Health:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-editorial-muted">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>URL Importer: Operational</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>AI Provider: Operational</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>FLUX Image API: Operational</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Cloudflare R2: Operational</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-editorial-border shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md bg-editorial-surface px-3 py-2 rounded-xl border border-editorial-border">
          <Search className="w-4 h-4 text-editorial-lightMuted shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes by title, slug, or source..."
            className="w-full bg-transparent text-xs text-editorial-text placeholder:text-editorial-lightMuted focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-editorial-lightMuted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs text-editorial-text font-medium"
          >
            <option value="all">All Pipeline States ({recipes.length})</option>
            <option value="review">Ready for Review ({stats.readyForReview})</option>
            <option value="processing">Processing ({stats.processing})</option>
            <option value="published">Published ({stats.published})</option>
            <option value="failed">Failed ({stats.failed})</option>
          </select>
        </div>
      </div>

      {/* Pipeline Recipes Cards List */}
      <div className="space-y-4">
        {filteredRecipes.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-editorial-border text-center space-y-2">
            <Workflow className="w-8 h-8 text-brand-500 mx-auto opacity-60" />
            <h4 className="font-serif text-base font-bold text-editorial-text">
              No recipes waiting in this pipeline filter
            </h4>
            <p className="text-xs text-editorial-muted max-w-sm mx-auto">
              Use the Bulk Import tool above to import recipe URLs and start the automated workflow.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecipes.map((item) => (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-editorial-border shadow-xs space-y-4 hover:border-editorial-borderStrong transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          item.overallStatus === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.overallStatus === 'review'
                            ? 'bg-brand-100 text-brand-800 font-black'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.overallStatus === 'review' ? '★ READY FOR REVIEW' : item.overallStatus.replace(/_/g, ' ')}
                      </span>
                      {item.sourceDomain && (
                        <span className="text-[11px] text-editorial-muted">
                          Source: <strong>{item.sourceDomain}</strong>
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-editorial-text mt-1">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.overallStatus === 'review' ? (
                      <Link
                        href={`/admin/recipes/${item.recipeId}/review`}
                        className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Open Final Review</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled={activePipelineId === item.recipeId}
                        onClick={() => handleStartPipeline(item.recipeId)}
                        className="px-4 py-2.5 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {activePipelineId === item.recipeId ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-600" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 text-brand-600" />
                            <span>Run Pipeline</span>
                          </>
                        )}
                      </button>
                    )}

                    <Link
                      href={`/admin/recipes/${item.recipeId}`}
                      className="p-2.5 rounded-xl border border-editorial-border hover:bg-editorial-surface text-editorial-muted hover:text-editorial-text transition-colors"
                      title="Edit Recipe"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Visual Pipeline Stage Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs pt-1 border-t border-editorial-border/60">
                  <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${item.progress.import === 'completed' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-zinc-50 text-zinc-400 border-zinc-200'}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="text-[10px] font-medium">1. Import</span>
                  </div>

                  <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${item.progress.recipe_dna === 'completed' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-zinc-50 text-zinc-400 border-zinc-200'}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="text-[10px] font-medium">2. DNA</span>
                  </div>

                  <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${item.progress.content_generation === 'completed' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-zinc-50 text-zinc-400 border-zinc-200'}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="text-[10px] font-medium">3. Editorial</span>
                  </div>

                  <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${item.progress.content_validation === 'completed' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-zinc-50 text-zinc-400 border-zinc-200'}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="text-[10px] font-medium">4. Validate</span>
                  </div>

                  <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${item.progress.image_generation === 'completed' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-zinc-50 text-zinc-400 border-zinc-200'}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="text-[10px] font-medium">5. FLUX R2</span>
                  </div>

                  <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${item.progress.pinterest_generation === 'completed' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-zinc-50 text-zinc-400 border-zinc-200'}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="text-[10px] font-medium">6. Pinterest</span>
                  </div>

                  <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${item.progress.seo_audit === 'completed' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-zinc-50 text-zinc-400 border-zinc-200'}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="text-[10px] font-medium">7. SEO Audit</span>
                  </div>

                  <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${item.overallStatus === 'review' || item.overallStatus === 'published' ? 'bg-brand-50 text-brand-900 border-brand-300 font-bold' : 'bg-zinc-50 text-zinc-400 border-zinc-200'}`}>
                    <ShieldCheck className="w-3 h-3 text-brand-600 shrink-0" />
                    <span className="text-[10px]">8. Review</span>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-editorial-muted pt-1">
                  <div className="flex items-center gap-4">
                    <span>Quality Score: <strong className="text-editorial-text">{item.qualityScore}/100</strong></span>
                    <span>Fact Accuracy: <strong className="text-editorial-text">{item.factScore}%</strong></span>
                    <span>SEO Completeness: <strong className="text-editorial-text">{item.seoScore}%</strong></span>
                  </div>
                  <div>
                    <span>Est. Spend: <strong className="text-editorial-text">${item.cost.totalEstimatedCost.toFixed(2)}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          BULK IMPORT MODAL
         ========================================================================= */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-editorial-border max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-editorial-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                  Bulk Operations
                </span>
                <h3 className="font-serif text-lg font-bold text-editorial-text mt-0.5">
                  Bulk Recipe URL Importer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="p-2 rounded-xl hover:bg-editorial-surface text-editorial-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label htmlFor="bulk-urls-textarea" className="block font-bold text-editorial-text">
                Paste Recipe URLs (One per line, up to 25):
              </label>
              <textarea
                id="bulk-urls-textarea"
                rows={6}
                value={bulkUrlsText}
                onChange={(e) => setBulkUrlsText(e.target.value)}
                placeholder="https://example.com/creamy-chicken&#10;https://example.com/one-pan-pasta&#10;https://example.com/garlic-shrimp"
                className="w-full p-3.5 rounded-2xl bg-editorial-surface border border-editorial-border font-mono text-xs text-editorial-text leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-[11px] text-editorial-muted">
                Each valid URL will be extracted, normalized, assigned Recipe DNA, generated with editorial prose & FLUX imagery, and queued at <strong>Ready for Review</strong>.
              </p>
            </div>

            <div className="pt-3 border-t border-editorial-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-muted cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isBulkSubmitting || !bulkUrlsText.trim()}
                onClick={handleBulkImport}
                className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer"
              >
                {isBulkSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Batch...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Batch Import</span>
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
