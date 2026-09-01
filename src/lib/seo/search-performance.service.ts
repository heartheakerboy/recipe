import { SearchPerformanceRecord, SearchOpportunityAlert } from '../types/seo-intelligence';
import { Recipe } from '../types/recipe';

declare global {
  var __FLAVORNEST_SEARCH_PERFORMANCE__: SearchPerformanceRecord[] | undefined;
}

const INITIAL_PERFORMANCE_RECORDS: SearchPerformanceRecord[] = [
  {
    date: '2026-08-30',
    url: 'https://flavornest.xyz/recipes/creamy-garlic-butter-tuscan-chicken/',
    query: 'creamy garlic chicken recipe',
    impressions: 4850,
    clicks: 112,
    ctr: 0.023,
    position: 7.2,
    source: 'google',
  },
  {
    date: '2026-08-30',
    url: 'https://flavornest.xyz/recipes/creamy-garlic-butter-tuscan-chicken/',
    query: 'tuscan chicken skillet 30 minutes',
    impressions: 2100,
    clicks: 18,
    ctr: 0.0085,
    position: 8.4,
    source: 'bing',
  },
  {
    date: '2026-08-30',
    url: 'https://flavornest.xyz/recipes/creamy-garlic-butter-tuscan-chicken/',
    query: 'easy garlic cream chicken dinner',
    impressions: 1650,
    clicks: 94,
    ctr: 0.057,
    position: 14.1,
    source: 'google',
  },
];

export class SearchPerformanceService {
  private getStore(): SearchPerformanceRecord[] {
    if (!global.__FLAVORNEST_SEARCH_PERFORMANCE__) {
      global.__FLAVORNEST_SEARCH_PERFORMANCE__ = [...INITIAL_PERFORMANCE_RECORDS];
    }
    return global.__FLAVORNEST_SEARCH_PERFORMANCE__;
  }

  async getPerformanceRecords(): Promise<SearchPerformanceRecord[]> {
    return this.getStore();
  }

  async detectOpportunities(publishedRecipes: Recipe[]): Promise<SearchOpportunityAlert[]> {
    const records = this.getStore();
    const alerts: SearchOpportunityAlert[] = [];

    for (const record of records) {
      const recipe = publishedRecipes.find((r) => record.url.includes(r.slug));
      const recipeTitle = recipe?.title || 'Published Recipe';
      const recipeId = recipe?.id || 'unknown';

      // 1. Striking Distance (Position 5 to 20 with good impressions)
      if (record.position >= 5 && record.position <= 20 && record.impressions >= 1000) {
        alerts.push({
          id: `opp_striking_${record.query.replace(/\s+/g, '_')}`,
          type: 'striking_distance',
          recipeId,
          recipeTitle,
          query: record.query,
          metricText: `Avg. Position: ${record.position.toFixed(1)} • ${record.impressions.toLocaleString()} impressions`,
          recommendation: `Target query "${record.query}" is ranking in striking distance (pos ${record.position.toFixed(1)}). Enhance H2 subheadings or add a focused tip section to move into top 3.`,
          severity: 'medium',
        });
      }

      // 2. Low CTR (Top 10 ranking but CTR under 1.5%)
      if (record.position <= 10 && record.ctr < 0.015 && record.impressions >= 1000) {
        alerts.push({
          id: `opp_low_ctr_${record.query.replace(/\s+/g, '_')}`,
          type: 'low_ctr',
          recipeId,
          recipeTitle,
          query: record.query,
          metricText: `CTR: ${(record.ctr * 100).toFixed(2)}% (Expected > 2.5%) • Pos: ${record.position.toFixed(1)}`,
          recommendation: `High impression query "${record.query}" is ranking on Page 1 but receiving below-average clicks. Refine meta description and title hook to increase CTR.`,
          severity: 'high',
        });
      }
    }

    return alerts;
  }
}

export const searchPerformanceService = new SearchPerformanceService();
