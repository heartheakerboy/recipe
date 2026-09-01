export interface GrowthCycleProgress {
  currentDay: number;
  totalDays: number;
  recipesPublished: number;
  pinsPublished: number;
  organicSessions: number;
  pinterestSessions: number;
  emailSubscribers: number;
  revenue: number;
}

export interface GrowthWeeklyGoal {
  recipesTarget: number;
  pinsTarget: number;
  refreshesTarget: number;
}

export type WinnerCategory =
  | 'pinterest_winner'
  | 'seo_winner'
  | 'traffic_winner'
  | 'engagement_winner';

export interface GrowthWinnerRecipe {
  recipeId: string;
  title: string;
  slug: string;
  type: WinnerCategory;
  sessions: number;
  ctr: number;
  revenue: number;
  suggestedExpansion: string;
}

export type ExperimentStatus = 'active' | 'completed' | 'inconclusive';
export type ExperimentOutcome = 'winner' | 'control' | 'inconclusive' | 'pending';

export interface GrowthExperiment {
  id: string;
  hypothesis: string;
  variable: string;
  control: string;
  variant: string;
  metric: string;
  status: ExperimentStatus;
  outcome: ExperimentOutcome;
  controlMetricValue?: number;
  variantMetricValue?: number;
  decision?: string;
}

export type ScorecardAction =
  | 'scale'
  | 'monitor'
  | 'refresh'
  | 'improve_image'
  | 'improve_pinterest'
  | 'improve_seo'
  | 'archive_candidate';

export interface ContentScorecard {
  recipeId: string;
  title: string;
  slug: string;
  trafficGrade: 'high' | 'medium' | 'low';
  pinterestGrade: 'high' | 'medium' | 'low';
  seoGrade: 'growing' | 'stable' | 'declining';
  revenueGrade: 'high' | 'medium' | 'low';
  action: ScorecardAction;
}

export interface GrowthRecommendation {
  id: string;
  type: 'content' | 'pinterest' | 'seo' | 'refresh';
  title: string;
  rationale: string;
  supportingData: string;
  status: 'pending' | 'accepted' | 'ignored';
}

export interface GrowthWeeklyReport {
  weekNumber: number;
  trafficChangePct: number;
  pinterestChangePct: number;
  organicChangePct: number;
  revenueChangePct: number;
  bestRecipe: string;
  bestPinStyle: string;
  recommendedAction: string;
}
