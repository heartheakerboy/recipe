import {
  PinterestCreative,
  CreatePinterestCreativeInput,
  PinterestCreativeStatus,
} from '../types/pinterest';

declare global {
  var __FLAVORNEST_PINTEREST_CREATIVES__: PinterestCreative[] | undefined;
}

const INITIAL_PINTEREST_CREATIVES: PinterestCreative[] = [
  {
    id: 'pin_creamy_chicken_01',
    recipeId: 'rec_creamy_garlic_chicken_01',
    creativeTemplate: 'template-b-editorial',
    contentAngle: 'quick-dinner',
    overlayText: '30-Minute Creamy Garlic Chicken',
    subheadline: 'The Ultimate Fast Weeknight Skillet',
    title: 'Easy 30-Minute Creamy Garlic Chicken Recipe',
    description: 'This easy creamy garlic chicken comes together in one skillet in just 30 minutes. Juicy golden chicken in a rich garlic parmesan cream sauce. Perfect weeknight dinner idea!',
    keywords: [
      'creamy garlic chicken',
      '30 minute chicken dinner',
      'easy weeknight dinner',
      'one skillet chicken',
      'garlic parmesan chicken',
    ],
    destinationUrl: 'https://flavornest.xyz/recipes/creamy-garlic-butter-tuscan-chicken',
    boardName: 'Easy Dinner Recipes',
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1000&h=1500&q=80',
    status: 'approved',
    createdAt: '2026-08-15T14:00:00Z',
    updatedAt: '2026-08-15T14:00:00Z',
  },
  {
    id: 'pin_creamy_chicken_02',
    recipeId: 'rec_creamy_garlic_chicken_01',
    creativeTemplate: 'template-c-recipe-focus',
    contentAngle: 'comfort-food',
    overlayText: 'Cozy Garlic Tuscan Chicken',
    subheadline: 'Rich Parmesan Cream Sauce',
    title: 'Cozy Creamy Tuscan Chicken with Garlic Cream Sauce',
    description: 'Tender chicken cutlets simmered in a velvety garlic parmesan sauce with sun-dried tomatoes and spinach. The most comforting dinner for a cozy evening!',
    keywords: [
      'tuscan chicken',
      'comfort food recipes',
      'chicken with cream sauce',
      'garlic chicken skillet',
      'family dinner ideas',
    ],
    destinationUrl: 'https://flavornest.xyz/recipes/creamy-garlic-butter-tuscan-chicken',
    boardName: 'Comfort Food Dinners',
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1000&h=1500&q=80',
    status: 'approved',
    createdAt: '2026-08-15T14:30:00Z',
    updatedAt: '2026-08-15T14:30:00Z',
  },
];

export class PinterestRepository {
  private async getStore(): Promise<PinterestCreative[]> {
    if (!global.__FLAVORNEST_PINTEREST_CREATIVES__) {
      global.__FLAVORNEST_PINTEREST_CREATIVES__ = INITIAL_PINTEREST_CREATIVES.map((p) => ({ ...p }));
    }
    return global.__FLAVORNEST_PINTEREST_CREATIVES__;
  }

  async list(options?: { status?: string }): Promise<PinterestCreative[]> {
    const store = await this.getStore();
    if (options?.status && options.status !== 'all') {
      return store.filter((p) => p.status === options.status);
    }
    return [...store];
  }

  async listByRecipe(recipeId: string): Promise<PinterestCreative[]> {
    const store = await this.getStore();
    return store.filter((p) => p.recipeId === recipeId);
  }

  async getById(id: string): Promise<PinterestCreative | null> {
    const store = await this.getStore();
    return store.find((p) => p.id === id) || null;
  }

  async checkDuplicate(
    recipeId: string,
    contentAngle: string,
    overlayText: string
  ): Promise<boolean> {
    const store = await this.getStore();
    const cleanOverlay = overlayText.toLowerCase().trim();
    return store.some(
      (p) =>
        p.recipeId === recipeId &&
        p.contentAngle === contentAngle &&
        p.overlayText.toLowerCase().trim() === cleanOverlay
    );
  }

  async create(input: CreatePinterestCreativeInput): Promise<PinterestCreative> {
    const store = await this.getStore();
    const now = new Date().toISOString();
    const newCreative: PinterestCreative = {
      ...input,
      id: `pin_creative_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };
    store.unshift(newCreative);
    return newCreative;
  }

  async update(
    id: string,
    data: Partial<CreatePinterestCreativeInput> & { status?: PinterestCreativeStatus }
  ): Promise<PinterestCreative> {
    const store = await this.getStore();
    const index = store.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Pinterest creative with ID "${id}" not found.`);
    }

    const existing = store[index];
    const now = new Date().toISOString();

    const updated: PinterestCreative = {
      ...existing,
      ...data,
      updatedAt: now,
      publishedAt: data.status === 'published' && !existing.publishedAt ? now : existing.publishedAt,
    };

    store[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const store = await this.getStore();
    const index = store.findIndex((p) => p.id === id);
    if (index !== -1) {
      store.splice(index, 1);
      return true;
    }
    return false;
  }
}

export const pinterestRepository = new PinterestRepository();
