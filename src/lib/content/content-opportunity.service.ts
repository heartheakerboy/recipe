import { ContentOpportunity, ContentCluster } from '../types/content-cluster';
import { contentClusterRepository } from '../repositories/content-cluster.repository';

export interface StrategyOverview {
  totalOpportunities: number;
  activeClusters: number;
  inReviewCount: number;
  plannedCount: number;
  publishedCoverageAvg: number;
}

export class ContentOpportunityService {
  async getOverview(): Promise<StrategyOverview> {
    const opportunities = await contentClusterRepository.listOpportunities();
    const clusters = await contentClusterRepository.listClusters();
    const jobs = await contentClusterRepository.listJobs();

    const inReviewCount = jobs.filter((j) => j.status === 'review').length;
    const plannedCount = opportunities.filter((o) => o.status === 'planned').length;
    const totalCoverage = clusters.reduce((sum, c) => sum + c.coveragePct, 0);
    const publishedCoverageAvg = clusters.length > 0 ? Math.round(totalCoverage / clusters.length) : 0;

    return {
      totalOpportunities: opportunities.length,
      activeClusters: clusters.filter((c) => c.status === 'active').length,
      inReviewCount,
      plannedCount,
      publishedCoverageAvg,
    };
  }

  calculateTransparentScore(factors: {
    searchVolume: number; // 0-100
    pinterestInterest: number; // 0-100
    catalogGap: number; // 0-100
    audienceRelevance: number; // 0-100
    duplicateRisk: number; // 0-100
  }) {
    const search = Math.min(100, Math.max(0, factors.searchVolume));
    const pinterest = Math.min(100, Math.max(0, factors.pinterestInterest));
    const contentGap = Math.min(100, Math.max(0, factors.catalogGap));
    const audience = Math.min(100, Math.max(0, factors.audienceRelevance));
    const duplicationPenalty = Math.min(50, Math.max(0, Math.round(factors.duplicateRisk * 0.5)));

    const positiveTotal = search * 0.3 + pinterest * 0.3 + contentGap * 0.2 + audience * 0.2;
    const totalScore = Math.max(0, Math.min(100, Math.round(positiveTotal - duplicationPenalty)));

    return {
      search,
      pinterest,
      contentGap,
      audience,
      duplicationPenalty,
      totalScore,
    };
  }
}

export const contentOpportunityService = new ContentOpportunityService();
