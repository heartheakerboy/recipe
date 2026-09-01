export type AuditSeverity = 'critical' | 'high' | 'medium' | 'low';

export type AuditCategory =
  | 'content'
  | 'seo'
  | 'pinterest'
  | 'images'
  | 'performance'
  | 'monetization'
  | 'analytics'
  | 'security'
  | 'infrastructure';

export type AuditStatus = 'ready' | 'needs_attention' | 'blocked' | 'not_configured';

export interface AuditIssue {
  id: string;
  category: AuditCategory;
  severity: AuditSeverity;
  title: string;
  description: string;
  recipeSlug?: string;
  suggestedAction?: string;
}

export interface CategoryAuditResult {
  category: AuditCategory;
  status: AuditStatus;
  summary: string;
  issuesCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  issues: AuditIssue[];
}

export type LaunchStatus = 'READY FOR GROWTH' | 'READY WITH WARNINGS' | 'BLOCKED';

export interface MasterLaunchAudit {
  status: LaunchStatus;
  timestamp: string;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  categories: CategoryAuditResult[];
}

export interface LaunchChecklistItem {
  id: string;
  label: string;
  category: AuditCategory;
  isVerified: boolean;
  isAutomated: boolean;
  verifiedAt?: string;
}
