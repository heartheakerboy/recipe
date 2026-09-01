export type SeoSeverity = 'high' | 'medium' | 'low' | 'info';

export type SeoCategory =
  | 'technical'
  | 'content'
  | 'schema'
  | 'internal_links'
  | 'images'
  | 'indexability';

export interface SeoFinding {
  id: string;
  recipeId: string;
  category: SeoCategory;
  severity: SeoSeverity;
  title: string;
  description: string;
  suggestion: string;
  currentValue?: string;
  proposedValue?: string;
}

export interface RecipeSeoAuditResult {
  recipeId: string;
  recipeTitle: string;
  slug: string;
  findings: SeoFinding[];
  passedChecks: string[];
  highSeverityCount: number;
  mediumSeverityCount: number;
  lowSeverityCount: number;
  lastAuditedAt: string;
}

export interface InternalLinkOpportunity {
  sourceRecipeId: string;
  targetRecipeId: string;
  targetTitle: string;
  targetSlug: string;
  reason: string;
  suggestedAnchor: string;
  relevanceScore: number; // 0 to 100
}

export interface TopicOverlapAlert {
  recipeAId: string;
  recipeBId: string;
  titleA: string;
  titleB: string;
  overlapReason: string;
  similarityPercent: number;
  recommendation: string;
}

export interface SearchPerformanceRecord {
  date: string;
  url: string;
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  source: 'google' | 'bing';
}

export interface SearchOpportunityAlert {
  id: string;
  type: 'striking_distance' | 'low_ctr' | 'content_decay' | 'orphan_recipe' | 'topic_overlap';
  recipeId: string;
  recipeTitle: string;
  query?: string;
  metricText: string;
  recommendation: string;
  severity: SeoSeverity;
}
