export type SystemHealthStatus = 'healthy' | 'degraded' | 'unavailable' | 'not_configured';

export interface SystemComponentHealth {
  component: string;
  status: SystemHealthStatus;
  latencyMs: number;
  lastChecked: string;
  details: string;
}

export interface PerformanceBudgetMetrics {
  ttfbMs: number;
  lcpMs: number;
  cls: number;
  inpMs: number;
  htmlSizeBytes: number;
  jsBundleKb: number;
  imageAvgKb: number;
}

export type BackgroundJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'retrying';

export interface BackgroundJobRecord {
  id: string;
  name: string;
  status: BackgroundJobStatus;
  attempts: number;
  maxAttempts: number;
  idempotencyKey: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicalSeoHealth {
  indexabilityStatus: string;
  canonicalConsistency: boolean;
  sitemapStatus: string;
  brokenLinksCount: number;
  orphanRecipesCount: number;
  schemaValidity: string;
}
