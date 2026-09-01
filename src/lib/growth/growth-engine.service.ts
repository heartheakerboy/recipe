import {
  GrowthCycleProgress,
  GrowthWinnerRecipe,
  ContentScorecard,
  GrowthWeeklyReport,
} from '../types/growth-system';
import { recipeRepository } from '../repositories/recipe.repository';
import { subscriberRepository } from '../repositories/subscriber.repository';
import { pinterestRepository } from '../repositories/pinterest.repository';

export class GrowthEngineService {
  async getCycleProgress(): Promise<GrowthCycleProgress> {
    const { recipes } = await recipeRepository.list({ limit: 100 });
    const published = recipes.filter((r) => r.status === 'published');
    const subscribers = await subscriberRepository.countActive();
    const pins = await pinterestRepository.list();

    return {
      currentDay: 1,
      totalDays: 30,
      recipesPublished: published.length,
      pinsPublished: pins.length,
      organicSessions: 0,
      pinterestSessions: 0,
      emailSubscribers: subscribers,
      revenue: 0,
    };
  }

  getEarlyWinners(): GrowthWinnerRecipe[] {
    return [];
  }

  getContentScorecards(): ContentScorecard[] {
    return [];
  }

  getWeeklyReport(): GrowthWeeklyReport {
    return {
      weekNumber: 1,
      trafficChangePct: 0,
      pinterestChangePct: 0,
      organicChangePct: 0,
      revenueChangePct: 0,
      bestRecipe: 'Awaiting initial traffic',
      bestPinStyle: 'Awaiting click distribution',
      recommendedAction: 'Publish initial Pinterest pins and submit sitemap to Google & Bing to start 30-day tracking loop.',
    };
  }
}

export const growthEngineService = new GrowthEngineService();
