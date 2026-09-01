export type ClusterStatus = 'idea' | 'planned' | 'active' | 'complete' | 'archived';

export type ClusterPriority = 'high' | 'medium' | 'low';

export type ClusterRole = 'primary' | 'supporting' | 'related';

export type OpportunityType =
  | 'new_topic'
  | 'cluster_expansion'
  | 'missing_recipe_type'
  | 'seasonal_opportunity'
  | 'internal_link_gap'
  | 'pinterest_opportunity'
  | 'high_value_topic'
  | 'content_refresh';

export interface ContentCluster {
  id: string;
  name: string;
  slug: string;
  description: string;
  primaryTopic: string;
  status: ClusterStatus;
  priority: ClusterPriority;
  recipeCount: number;
  targetCount: number;
  coveragePct: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClusterRecipeMember {
  clusterId: string;
  recipeId: string;
  recipeTitle: string;
  recipeSlug: string;
  role: ClusterRole;
  createdAt: string;
}

export interface ContentOpportunity {
  id: string;
  topic: string;
  type: OpportunityType;
  clusterId?: string;
  clusterName?: string;
  priority: ClusterPriority;
  scoreBreakdown: {
    search: number;
    pinterest: number;
    contentGap: number;
    audience: number;
    duplicationPenalty: number;
    totalScore: number;
  };
  reason: string;
  recommendation: string;
  status: 'open' | 'planned' | 'drafting' | 'completed' | 'dismissed';
  createdAt: string;
}

export interface RecipeBrief {
  id: string;
  concept: string;
  clusterId?: string;
  mealType: string;
  primaryIntent: string;
  differentiationNotes: string;
  keyIngredients: string[];
  approved: boolean;
  createdAt: string;
}

export interface RecipeGenerationJob {
  id: string;
  concept: string;
  briefId?: string;
  clusterId?: string;
  status: 'ready' | 'generating' | 'review' | 'approved' | 'rejected' | 'published';
  title: string;
  slug: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  ingredients: string[];
  instructions: string[];
  consistencyCheck: {
    valid: boolean;
    warnings: string[];
  };
  imageStatus: 'pending' | 'generated' | 'approved';
  seoStatus: 'pending' | 'audited';
  createdAt: string;
}
