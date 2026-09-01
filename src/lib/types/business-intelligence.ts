export type BusinessDateRange = '7d' | '30d' | '90d' | '12m' | 'all';

export interface BusinessKpiSummary {
  monthlyPageviews: number;
  monthlySessions: number;
  monthlyRevenue: number;
  monthlyCosts: number;
  estimatedContribution: number;
  activeSubscribers: number;
  publishedRecipes: number;
  pinterestOutboundClicks: number;
  trafficGrowthPct: number;
  revenueGrowthPct: number;
  rpm: number;
}

export interface TrafficSourceShare {
  source: string;
  sessions: number;
  sharePct: number;
  revenue: number;
  rpm: number;
}

export interface MonthlyFinancialRecord {
  month: string;
  revenue: number;
  costs: number;
  contribution: number;
  marginPct: number;
}

export type HealthSignalStatus = 'positive' | 'stable' | 'needs_attention' | 'insufficient_data';

export interface OperationalHealthSignal {
  key: string;
  label: string;
  status: HealthSignalStatus;
  detail: string;
}

export type FlipReadinessCategory = 'technology' | 'content' | 'revenue' | 'operations' | 'legal' | 'documentation';

export interface FlipReadinessItem {
  id: string;
  category: FlipReadinessCategory;
  title: string;
  description: string;
  isAutomated: boolean;
  status: 'verified' | 'pending' | 'action_required';
  verificationSource: string;
}

export interface ThirdPartyIntegration {
  service: string;
  purpose: string;
  status: 'connected' | 'disconnected';
  accountOwner: string;
  transferability: 'transferable' | 'new_account_required' | 'manual_setup';
}
