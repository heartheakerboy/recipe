export type RevenueDateRange = '7d' | '30d' | '90d' | 'all';

export interface DailyRevenueRecord {
  id: string;
  date: string;
  provider: string;
  impressions: number;
  estimatedEarnings: number;
  pageviews: number;
  adRequests: number;
  fillRate: number; // percentage e.g. 0.985
  createdAt: string;
}

export type RecipeDecisionSignal =
  | 'high_traffic_high_revenue'
  | 'high_traffic_low_revenue'
  | 'low_traffic_high_revenue'
  | 'low_traffic_low_revenue'
  | 'insufficient_data';

export interface RecipeEconomics {
  recipeId: string;
  recipeTitle: string;
  slug: string;
  pageviews: number;
  pinterestClicks: number;
  estimatedRevenue: number;
  generationCost: number;
  netContribution: number;
  roi: number; // contribution / cost
  decisionSignal: RecipeDecisionSignal;
  actionableTip: string;
}

export type AdPlacementSlot =
  | 'recipe_top'
  | 'recipe_after_intro'
  | 'recipe_before_ingredients'
  | 'recipe_after_ingredients'
  | 'recipe_after_instructions'
  | 'recipe_related'
  | 'homepage'
  | 'category';

export interface MonetizationSettings {
  activeProvider: 'adsense' | 'mock';
  enabledSlots: AdPlacementSlot[];
  adSenseClientId: string;
  costPerAiRewrite: number;
  costPerFluxImage: number;
}
