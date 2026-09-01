import {
  EmailCampaign,
  EmailProviderSettings,
} from '../types/newsletter';

declare global {
  var __FLAVORNEST_CAMPAIGNS__: EmailCampaign[] | undefined;
  var __FLAVORNEST_EMAIL_SETTINGS__: EmailProviderSettings | undefined;
}

const DEFAULT_EMAIL_SETTINGS: EmailProviderSettings = {
  provider: 'mock',
  fromName: 'FlavorNest Kitchen',
  fromEmail: 'recipes@flavornest.xyz',
  apiKey: '',
  isConfigured: true,
};

const SEED_CAMPAIGNS: EmailCampaign[] = [
  {
    id: 'camp_seed_01',
    name: 'Weekly Digest — Fast Skillet Dinners',
    subject: '3 Cozy Dinners You Can Make in 30 Minutes 🍳',
    previewText: 'Tuscan chicken, garlic butter shrimp, and sun-dried tomato gnocchi.',
    contentHtml: '<p>Welcome to this week’s FlavorNest table! Here are 3 reader-favorite weeknight dinners.</p>',
    recipeIds: ['rec_creamy_garlic_chicken_01', 'rec_tomato_gnocchi_01'],
    audienceSegment: 'All Active Subscribers',
    status: 'sent',
    sentCount: 1420,
    deliveredCount: 1412,
    openedCount: 685,
    clickedCount: 294,
    sentAt: '2026-08-29T14:00:00Z',
    createdAt: '2026-08-28T10:00:00Z',
    updatedAt: '2026-08-29T14:00:00Z',
  },
];

export class CampaignRepository {
  private getStore(): EmailCampaign[] {
    if (!global.__FLAVORNEST_CAMPAIGNS__) {
      global.__FLAVORNEST_CAMPAIGNS__ = [...SEED_CAMPAIGNS];
    }
    return global.__FLAVORNEST_CAMPAIGNS__;
  }

  async listCampaigns(): Promise<EmailCampaign[]> {
    return this.getStore();
  }

  async getById(id: string): Promise<EmailCampaign | null> {
    const store = this.getStore();
    return store.find((c) => c.id === id) || null;
  }

  async createCampaign(
    data: Omit<EmailCampaign, 'id' | 'sentCount' | 'deliveredCount' | 'openedCount' | 'clickedCount' | 'createdAt' | 'updatedAt'>
  ): Promise<EmailCampaign> {
    const store = this.getStore();
    const now = new Date().toISOString();
    const newCampaign: EmailCampaign = {
      ...data,
      id: `camp_${Date.now()}`,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    store.unshift(newCampaign);
    return newCampaign;
  }

  async updateCampaign(id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign | null> {
    const store = this.getStore();
    const index = store.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const updated = {
      ...store[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    store[index] = updated;
    return updated;
  }

  async getSettings(): Promise<EmailProviderSettings> {
    if (!global.__FLAVORNEST_EMAIL_SETTINGS__) {
      global.__FLAVORNEST_EMAIL_SETTINGS__ = { ...DEFAULT_EMAIL_SETTINGS };
    }
    return global.__FLAVORNEST_EMAIL_SETTINGS__;
  }

  async updateSettings(settings: Partial<EmailProviderSettings>): Promise<EmailProviderSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    global.__FLAVORNEST_EMAIL_SETTINGS__ = updated;
    return updated;
  }
}

export const campaignRepository = new CampaignRepository();
