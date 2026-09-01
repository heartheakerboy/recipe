import {
  DailyRevenueRecord,
  RevenueDateRange,
  MonetizationSettings,
  AdPlacementSlot,
} from '../types/revenue';

declare global {
  var __FLAVORNEST_DAILY_REVENUE__: DailyRevenueRecord[] | undefined;
  var __FLAVORNEST_MONETIZATION_SETTINGS__: MonetizationSettings | undefined;
}

const DEFAULT_SETTINGS: MonetizationSettings = {
  activeProvider: 'mock',
  enabledSlots: [
    'recipe_after_intro',
    'recipe_after_ingredients',
    'recipe_after_instructions',
  ],
  adSenseClientId: 'ca-pub-0000000000000000',
  costPerAiRewrite: 0.05,
  costPerFluxImage: 0.15,
};

// Start with zero mock data. Real revenue will be logged via ad network webhook or provider ingestion.
const SEED_DAILY_REVENUE: DailyRevenueRecord[] = [];

export class RevenueRepository {
  private getStore(): DailyRevenueRecord[] {
    if (!global.__FLAVORNEST_DAILY_REVENUE__) {
      global.__FLAVORNEST_DAILY_REVENUE__ = [...SEED_DAILY_REVENUE];
    }
    return global.__FLAVORNEST_DAILY_REVENUE__;
  }

  async getRevenueRecords(dateRange: RevenueDateRange = '30d'): Promise<DailyRevenueRecord[]> {
    const store = this.getStore();
    const now = new Date();
    let days = 30;
    if (dateRange === '7d') days = 7;
    else if (dateRange === '30d') days = 30;
    else if (dateRange === '90d') days = 90;
    else if (dateRange === 'all') return store;

    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return store.filter((r) => new Date(r.date) >= cutoff);
  }

  async getSettings(): Promise<MonetizationSettings> {
    if (!global.__FLAVORNEST_MONETIZATION_SETTINGS__) {
      global.__FLAVORNEST_MONETIZATION_SETTINGS__ = { ...DEFAULT_SETTINGS };
    }
    return global.__FLAVORNEST_MONETIZATION_SETTINGS__;
  }

  async updateSettings(settings: Partial<MonetizationSettings>): Promise<MonetizationSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    global.__FLAVORNEST_MONETIZATION_SETTINGS__ = updated;
    return updated;
  }

  generateCsv(records: DailyRevenueRecord[]): string {
    const headers = [
      'Date',
      'Provider',
      'Pageviews',
      'Ad Impressions',
      'Ad Requests',
      'Fill Rate %',
      'Estimated Revenue ($)',
      'Page RPM ($)',
    ];

    if (records.length === 0) {
      return headers.join(',') + '\n"No records","None",0,0,0,"0.0%","$0.00","$0.00"';
    }

    const rows = records.map((r) => {
      const rpm = r.pageviews > 0 ? ((r.estimatedEarnings / r.pageviews) * 1000).toFixed(2) : '0.00';
      const fillRatePct = (r.fillRate * 100).toFixed(1);
      return [
        `"${r.date}"`,
        `"${r.provider}"`,
        r.pageviews,
        r.impressions,
        r.adRequests,
        `${fillRatePct}%`,
        `$${r.estimatedEarnings.toFixed(2)}`,
        `$${rpm}`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}

export const revenueRepository = new RevenueRepository();
