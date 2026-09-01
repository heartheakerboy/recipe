import {
  PinterestPinMetricRecord,
  PinterestDateRange,
  PinterestSyncLog,
} from '../types/pinterest-analytics';

declare global {
  var __FLAVORNEST_PINTEREST_METRICS__: PinterestPinMetricRecord[] | undefined;
  var __FLAVORNEST_PINTEREST_SYNC_LOG__: PinterestSyncLog | undefined;
}

const SEED_METRICS: PinterestPinMetricRecord[] = [
  {
    id: 'm_pin_creamy_01_d1',
    pinId: 'pin_creamy_chicken_01',
    creativeId: 'pin_creamy_chicken_01',
    recipeId: 'rec_creamy_garlic_chicken_01',
    recipeTitle: 'Creamy Garlic Butter Tuscan Chicken',
    boardId: 'board_easy_dinner',
    boardName: 'Easy Dinner Recipes',
    template: 'template-b-editorial',
    angle: 'quick-dinner',
    date: '2026-08-30',
    impressions: 4820,
    saves: 215,
    pinClicks: 410,
    outboundClicks: 168,
    engagements: 625,
    createdAt: '2026-08-30T10:00:00Z',
  },
  {
    id: 'm_pin_creamy_02_d1',
    pinId: 'pin_creamy_chicken_02',
    creativeId: 'pin_creamy_chicken_02',
    recipeId: 'rec_creamy_garlic_chicken_01',
    recipeTitle: 'Creamy Garlic Butter Tuscan Chicken',
    boardId: 'board_comfort_food',
    boardName: 'Cozy Comfort Food',
    template: 'template-c-recipe-focus',
    angle: 'comfort-food',
    date: '2026-08-30',
    impressions: 3410,
    saves: 180,
    pinClicks: 290,
    outboundClicks: 95,
    engagements: 470,
    createdAt: '2026-08-30T10:00:00Z',
  },
  {
    id: 'm_pin_shrimp_01_d1',
    pinId: 'pin_garlic_shrimp_01',
    creativeId: 'pin_shrimp_01',
    recipeId: 'rec_garlic_butter_shrimp_01',
    recipeTitle: 'Easy 20-Minute Garlic Butter Shrimp Skillet',
    boardId: 'board_30_minute',
    boardName: '30-Minute Meals',
    template: 'template-b-editorial',
    angle: 'quick-dinner',
    date: '2026-08-29',
    impressions: 5200,
    saves: 340,
    pinClicks: 560,
    outboundClicks: 210,
    engagements: 900,
    createdAt: '2026-08-29T10:00:00Z',
  },
  {
    id: 'm_pin_gnocchi_01_d1',
    pinId: 'pin_gnocchi_01',
    creativeId: 'pin_gnocchi_01',
    recipeId: 'rec_tomato_gnocchi_01',
    recipeTitle: 'One-Pan Creamy Sun-Dried Tomato Gnocchi',
    boardId: 'board_easy_dinner',
    boardName: 'Easy Dinner Recipes',
    template: 'template-a-hero',
    angle: 'family-meal',
    date: '2026-08-28',
    impressions: 2950,
    saves: 120,
    pinClicks: 210,
    outboundClicks: 74,
    engagements: 330,
    createdAt: '2026-08-28T10:00:00Z',
  },
];

export class PinterestAnalyticsRepository {
  private getStore(): PinterestPinMetricRecord[] {
    if (!global.__FLAVORNEST_PINTEREST_METRICS__) {
      global.__FLAVORNEST_PINTEREST_METRICS__ = [...SEED_METRICS];
    }
    return global.__FLAVORNEST_PINTEREST_METRICS__;
  }

  async getMetrics(dateRange: PinterestDateRange = '30d'): Promise<PinterestPinMetricRecord[]> {
    const store = this.getStore();
    const now = new Date();
    let daysToSubtract = 30;

    if (dateRange === '7d') daysToSubtract = 7;
    else if (dateRange === '30d') daysToSubtract = 30;
    else if (dateRange === '90d') daysToSubtract = 90;
    else if (dateRange === 'all') return store;

    const cutoffDate = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);
    return store.filter((m) => new Date(m.date) >= cutoffDate);
  }

  async saveMetric(metric: PinterestPinMetricRecord): Promise<void> {
    const store = this.getStore();
    store.push(metric);
  }

  async getSyncLog(): Promise<PinterestSyncLog> {
    if (!global.__FLAVORNEST_PINTEREST_SYNC_LOG__) {
      const now = new Date();
      global.__FLAVORNEST_PINTEREST_SYNC_LOG__ = {
        lastSyncedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        nextSyncAt: new Date(now.getTime() + 22 * 60 * 60 * 1000).toISOString(),
        status: 'success',
        recordsUpdated: SEED_METRICS.length,
      };
    }
    return global.__FLAVORNEST_PINTEREST_SYNC_LOG__;
  }

  async updateSyncLog(log: Partial<PinterestSyncLog>): Promise<PinterestSyncLog> {
    const current = await this.getSyncLog();
    const updated: PinterestSyncLog = { ...current, ...log };
    global.__FLAVORNEST_PINTEREST_SYNC_LOG__ = updated;
    return updated;
  }

  generateCsv(metrics: PinterestPinMetricRecord[]): string {
    const headers = [
      'Pin ID',
      'Recipe Title',
      'Board Name',
      'Template Style',
      'Content Angle',
      'Date',
      'Impressions',
      'Saves',
      'Pin Clicks',
      'Outbound Clicks',
      'Outbound CTR %',
      'Save Rate %',
    ];

    const rows = metrics.map((m) => {
      const ctr = m.impressions > 0 ? ((m.outboundClicks / m.impressions) * 100).toFixed(2) : '0.00';
      const saveRate = m.impressions > 0 ? ((m.saves / m.impressions) * 100).toFixed(2) : '0.00';
      return [
        `"${m.pinId}"`,
        `"${m.recipeTitle.replace(/"/g, '""')}"`,
        `"${m.boardName}"`,
        `"${m.template}"`,
        `"${m.angle}"`,
        `"${m.date}"`,
        m.impressions,
        m.saves,
        m.pinClicks,
        m.outboundClicks,
        ctr,
        saveRate,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}

export const pinterestAnalyticsRepository = new PinterestAnalyticsRepository();
