import {
  GrowthWeeklyGoal,
  GrowthExperiment,
  GrowthRecommendation,
} from '../types/growth-system';

declare global {
  var __FLAVORNEST_GROWTH_GOAL__: GrowthWeeklyGoal | undefined;
  var __FLAVORNEST_GROWTH_EXPERIMENTS__: GrowthExperiment[] | undefined;
  var __FLAVORNEST_GROWTH_RECOMMENDATIONS__: GrowthRecommendation[] | undefined;
}

const SEED_GOAL: GrowthWeeklyGoal = {
  recipesTarget: 5,
  pinsTarget: 15,
  refreshesTarget: 2,
};

const SEED_EXPERIMENTS: GrowthExperiment[] = [
  {
    id: 'exp_pin_title_brevity',
    hypothesis: 'Shorter 4-6 word Pin titles improve outbound click-through rates over 12+ word titles.',
    variable: 'Title Length',
    control: 'Easy 20-Minute Creamy Garlic Butter Tuscan Chicken Skillet Dinner Recipe',
    variant: 'Creamy Garlic Butter Tuscan Chicken (20 Mins)',
    metric: 'Outbound CTR %',
    status: 'completed',
    outcome: 'winner',
    controlMetricValue: 1.8,
    variantMetricValue: 3.4,
    decision: 'Adopt concise benefit-driven titles for all weeknight skillet Pin creatives.',
  },
  {
    id: 'exp_overlay_density',
    hypothesis: 'Editorial minimal badge overlays yield higher save rates than high-contrast bold ribbons.',
    variable: 'Visual Text Badge Style',
    control: 'High-contrast bold red ribbon badge',
    variant: 'Subtle serif italic label with rounded pill background',
    metric: 'Save Rate %',
    status: 'active',
    outcome: 'pending',
    controlMetricValue: 4.1,
    variantMetricValue: 4.3,
    decision: 'Gathering sample data across 1,000+ pin impressions before declaring outcome.',
  },
];

const SEED_RECOMMENDATIONS: GrowthRecommendation[] = [
  {
    id: 'rec_chicken_cluster_expand',
    type: 'content',
    title: 'Expand Garlic Butter Chicken Pillar',
    rationale: 'Top-performing recipe across Pinterest and search. Strong signal for supporting variations.',
    supportingData: '12,400 monthly pageviews; 3.4% Outbound CTR on Pinterest; $142 revenue.',
    status: 'pending',
  },
  {
    id: 'rec_style_c_scale',
    type: 'pinterest',
    title: 'Scale Style C (Split Template) Across Pastas',
    rationale: 'Style C generates 42% higher CTR than single-image hero templates for pasta dishes.',
    supportingData: 'Style C average CTR: 3.2% vs Baseline: 2.1% across 18 Pin creatives.',
    status: 'pending',
  },
  {
    id: 'rec_refresh_gnocchi',
    type: 'refresh',
    title: 'Refresh One-Pan Tomato Gnocchi Internal Links',
    rationale: 'High search impressions with declining click-through rate over the last 14 days.',
    supportingData: '-18% weekly sessions; rank 8 in Bing discovery without cluster anchor support.',
    status: 'pending',
  },
];

export class GrowthSystemRepository {
  async getGoal(): Promise<GrowthWeeklyGoal> {
    if (!global.__FLAVORNEST_GROWTH_GOAL__) {
      global.__FLAVORNEST_GROWTH_GOAL__ = { ...SEED_GOAL };
    }
    return global.__FLAVORNEST_GROWTH_GOAL__;
  }

  async updateGoal(goal: GrowthWeeklyGoal): Promise<void> {
    global.__FLAVORNEST_GROWTH_GOAL__ = { ...goal };
  }

  async getExperiments(): Promise<GrowthExperiment[]> {
    if (!global.__FLAVORNEST_GROWTH_EXPERIMENTS__) {
      global.__FLAVORNEST_GROWTH_EXPERIMENTS__ = [...SEED_EXPERIMENTS];
    }
    return global.__FLAVORNEST_GROWTH_EXPERIMENTS__;
  }

  async getRecommendations(): Promise<GrowthRecommendation[]> {
    if (!global.__FLAVORNEST_GROWTH_RECOMMENDATIONS__) {
      global.__FLAVORNEST_GROWTH_RECOMMENDATIONS__ = [...SEED_RECOMMENDATIONS];
    }
    return global.__FLAVORNEST_GROWTH_RECOMMENDATIONS__;
  }

  async updateRecommendationStatus(
    id: string,
    status: 'accepted' | 'ignored'
  ): Promise<boolean> {
    const list = await this.getRecommendations();
    const rec = list.find((r) => r.id === id);
    if (!rec) return false;
    rec.status = status;
    return true;
  }
}

export const growthSystemRepository = new GrowthSystemRepository();
