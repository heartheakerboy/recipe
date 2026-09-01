export type PinterestDateRange = '7d' | '30d' | '90d' | 'all';

export interface PinterestPinMetricRecord {
  id: string;
  pinId: string;
  creativeId: string;
  recipeId: string;
  recipeTitle: string;
  boardId: string;
  boardName: string;
  template: string;
  angle: string;
  date: string;
  impressions: number;
  saves: number;
  pinClicks: number;
  outboundClicks: number;
  engagements: number;
  createdAt: string;
}

export interface PinterestAnalyticsSummary {
  impressions: number;
  saves: number;
  pinClicks: number;
  outboundClicks: number;
  engagements: number;
  saveRate: number; // saves / impressions
  outboundCtr: number; // outboundClicks / impressions
  engagementRate: number; // engagements / impressions
  previousPeriodDiff?: {
    impressionsPct: number;
    savesPct: number;
    outboundClicksPct: number;
  };
}

export interface TopPinPerformance {
  pinId: string;
  creativeId: string;
  recipeTitle: string;
  boardName: string;
  template: string;
  angle: string;
  imageUrl: string;
  impressions: number;
  saves: number;
  outboundClicks: number;
  outboundCtr: number;
  saveRate: number;
  publishedAt: string;
}

export interface TemplatePerformance {
  template: string;
  templateName: string;
  pinCount: number;
  impressions: number;
  saves: number;
  outboundClicks: number;
  outboundCtr: number;
  classification: 'strong' | 'average' | 'weak' | 'insufficient_data';
}

export interface AnglePerformance {
  angle: string;
  angleName: string;
  pinCount: number;
  impressions: number;
  saves: number;
  outboundClicks: number;
  outboundCtr: number;
}

export interface BoardPerformance {
  boardId: string;
  boardName: string;
  pinCount: number;
  impressions: number;
  saves: number;
  outboundClicks: number;
  outboundCtr: number;
}

export interface PinterestInsight {
  id: string;
  type: 'top_template' | 'top_angle' | 'top_board' | 'underperforming' | 'info';
  title: string;
  description: string;
  sampleSize: number;
  metricBadge: string;
  recommendation: string;
  confidence: 'high' | 'moderate' | 'tentative';
}

export interface PinterestSyncLog {
  lastSyncedAt: string;
  nextSyncAt: string;
  status: 'idle' | 'syncing' | 'success' | 'failed';
  recordsUpdated: number;
  errorMessage?: string;
}
