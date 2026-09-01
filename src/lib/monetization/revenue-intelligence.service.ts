import {
  DailyRevenueRecord,
  RecipeEconomics,
  RecipeDecisionSignal,
  MonetizationSettings,
} from '../types/revenue';
import { recipeRepository } from '../repositories/recipe.repository';

export interface RevenueSummary {
  totalRevenue: number;
  totalPageviews: number;
  totalImpressions: number;
  overallRpm: number;
  averageFillRate: number;
  previousPeriodDiff?: {
    revenuePct: number;
    pageviewsPct: number;
    rpmPct: number;
  };
}

export class RevenueIntelligenceService {
  computeSummary(records: DailyRevenueRecord[]): RevenueSummary {
    if (!records || records.length === 0) {
      return {
        totalRevenue: 0,
        totalPageviews: 0,
        totalImpressions: 0,
        overallRpm: 0,
        averageFillRate: 0,
      };
    }

    let totalRevenue = 0;
    let totalPageviews = 0;
    let totalImpressions = 0;
    let fillRateSum = 0;

    for (const r of records) {
      totalRevenue += r.estimatedEarnings;
      totalPageviews += r.pageviews;
      totalImpressions += r.impressions;
      fillRateSum += r.fillRate;
    }

    const overallRpm = totalPageviews > 0 ? (totalRevenue / totalPageviews) * 1000 : 0;
    const averageFillRate = records.length > 0 ? fillRateSum / records.length : 0;

    return {
      totalRevenue,
      totalPageviews,
      totalImpressions,
      overallRpm,
      averageFillRate,
    };
  }

  async computeRecipeEconomics(
    summary: RevenueSummary,
    settings: MonetizationSettings
  ): Promise<RecipeEconomics[]> {
    const { recipes } = await recipeRepository.list({ limit: 100 });
    const published = recipes.filter((r) => r.status === 'published');

    const baseCost = (settings.costPerAiRewrite || 0.05) + (settings.costPerFluxImage || 0.15);

    // If no real traffic or revenue is recorded yet, report zero metrics truthfully
    if (!summary || summary.totalPageviews === 0) {
      return published.map((recipe) => ({
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        slug: recipe.slug,
        pageviews: 0,
        pinterestClicks: 0,
        estimatedRevenue: 0,
        generationCost: baseCost,
        netContribution: -baseCost,
        roi: 0,
        decisionSignal: 'low_traffic_low_revenue' as RecipeDecisionSignal,
        actionableTip: 'Awaiting traffic and ad impression data. Monitor once distributed on Pinterest.',
      }));
    }

    const rpm = summary.overallRpm || 0;

    return published.map((recipe) => {
      const pageviews = 0;
      const pinterestClicks = 0;
      const estimatedRevenue = (pageviews * rpm) / 1000;
      const generationCost = baseCost;
      const netContribution = estimatedRevenue - generationCost;
      const roi = generationCost > 0 ? netContribution / generationCost : 0;

      return {
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        slug: recipe.slug,
        pageviews,
        pinterestClicks,
        estimatedRevenue,
        generationCost,
        netContribution,
        roi,
        decisionSignal: 'low_traffic_low_revenue' as RecipeDecisionSignal,
        actionableTip: 'Monitor performance. Review topic interest before creating further spin-offs.',
      };
    });
  }
}

export const revenueIntelligenceService = new RevenueIntelligenceService();
