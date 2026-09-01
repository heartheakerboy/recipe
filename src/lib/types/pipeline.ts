export type PipelineStage =
  | 'import'
  | 'normalize'
  | 'recipe_dna'
  | 'content_generation'
  | 'content_validation'
  | 'image_generation'
  | 'pinterest_generation'
  | 'seo_audit'
  | 'review'
  | 'publish';

export type PipelineStageStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';

export type PipelineOverallStatus =
  | 'import_pending'
  | 'importing'
  | 'imported'
  | 'normalizing'
  | 'normalized'
  | 'dna_pending'
  | 'dna_ready'
  | 'content_pending'
  | 'content_generating'
  | 'content_ready'
  | 'validation_pending'
  | 'validation_failed'
  | 'validated'
  | 'images_pending'
  | 'images_generating'
  | 'images_ready'
  | 'images_approved'
  | 'pinterest_pending'
  | 'pinterest_generating'
  | 'pinterest_ready'
  | 'seo_pending'
  | 'seo_ready'
  | 'review'
  | 'approved'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'cancelled'
  | 'paused';

export interface PipelineActivity {
  id: string;
  recipeId: string;
  event: string;
  stage: PipelineStage;
  status: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  actor: 'system' | 'ai' | 'admin';
  metadata?: Record<string, any>;
}

export interface PipelineCostMetrics {
  textAiCost: number; // in USD, e.g. 0.04
  imageCost: number; // in USD, e.g. 0.08
  pinterestCost: number; // in USD, e.g. 0.02
  totalEstimatedCost: number;
}

export interface PipelineProgress {
  import: PipelineStageStatus;
  normalize: PipelineStageStatus;
  recipe_dna: PipelineStageStatus;
  content_generation: PipelineStageStatus;
  content_validation: PipelineStageStatus;
  image_generation: PipelineStageStatus;
  pinterest_generation: PipelineStageStatus;
  seo_audit: PipelineStageStatus;
  review: PipelineStageStatus;
  publish: PipelineStageStatus;
}

export interface PipelineRecipeItem {
  id: string;
  recipeId: string;
  title: string;
  slug: string;
  sourceUrl?: string;
  sourceDomain?: string;
  overallStatus: PipelineOverallStatus;
  currentStage: PipelineStage;
  progress: PipelineProgress;
  qualityScore: number; // 0 to 100
  factScore: number; // 0 to 100
  seoScore: number; // 0 to 100
  imageReady: boolean;
  pinterestReady: boolean;
  cost: PipelineCostMetrics;
  attempts: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetGuardConfig {
  dailyAiBudget: number; // e.g. $10.00
  dailyImageBudget: number; // e.g. $15.00
  dailyAiSpent: number;
  dailyImageSpent: number;
  isPaused: boolean;
  lastResetDate: string;
}
