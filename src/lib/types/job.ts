export type ContentJobStage =
  | 'url_import'
  | 'extraction'
  | 'normalization'
  | 'dna_analysis'
  | 'editorial_generation'
  | 'seo_generation'
  | 'image_generation'
  | 'human_review'
  | 'published';

export type ContentJobStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'paused';

export interface ContentPipelineJob {
  id: string;
  recipeId?: string;
  sourceUrl?: string;
  currentStage: ContentJobStage;
  status: ContentJobStatus;
  progressPercentage: number;
  errorMessage?: string;
  stageHistory: Array<{
    stage: ContentJobStage;
    timestamp: string;
    status: 'success' | 'failed';
    metadata?: Record<string, unknown>;
  }>;
  createdAt: string;
  updatedAt: string;
}
