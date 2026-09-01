import { ImageAsset, ImageVariantRole } from '../types/image';

export interface ImageRecord {
  id: string;
  recipeId?: string;
  type: ImageVariantRole;
  r2Key: string;
  url: string;
  width: number;
  height: number;
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  altText: string;
  sourceType: 'uploaded' | 'generated' | 'licensed';
  sourceUrl?: string;
  generationProvider?: string;
  generationModel?: string;
  generationPrompt?: string;
  createdAt: string;
}

const INITIAL_IMAGES: ImageRecord[] = [
  {
    id: 'img_01',
    recipeId: 'rec_creamy_garlic_chicken_01',
    type: 'hero',
    r2Key: 'recipes/creamy-garlic-butter-tuscan-chicken/hero.webp',
    url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80',
    width: 1200,
    height: 800,
    format: 'webp',
    altText: 'Creamy Garlic Butter Tuscan Chicken in skillet',
    sourceType: 'uploaded',
    createdAt: '2026-08-15T12:00:00Z',
  },
  {
    id: 'img_02',
    recipeId: 'rec_crispy_air_fryer_wings_02',
    type: 'hero',
    r2Key: 'recipes/ultra-crispy-air-fryer-garlic-parmesan-wings/hero.webp',
    url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=1200&q=80',
    width: 1200,
    height: 800,
    format: 'webp',
    altText: 'Crispy Garlic Parmesan Air Fryer Wings',
    sourceType: 'uploaded',
    createdAt: '2026-08-16T14:00:00Z',
  },
  {
    id: 'img_03',
    recipeId: 'rec_one_pot_creamy_tomato_pasta_03',
    type: 'hero',
    r2Key: 'recipes/one-pot-creamy-tomato-basil-pasta/hero.webp',
    url: 'https://images.unsplash.com/photo-1621996346565-e3d5d628169b?auto=format&fit=crop&w=1200&q=80',
    width: 1200,
    height: 800,
    format: 'webp',
    altText: 'One Pot Creamy Tomato Basil Pasta',
    sourceType: 'uploaded',
    createdAt: '2026-08-17T10:00:00Z',
  },
  {
    id: 'img_04',
    recipeId: 'rec_sheet_pan_salmon_04',
    type: 'hero',
    r2Key: 'recipes/sheet-pan-lemon-herb-butter-salmon-asparagus/hero.webp',
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80',
    width: 1200,
    height: 800,
    format: 'webp',
    altText: 'Sheet Pan Lemon Herb Butter Salmon',
    sourceType: 'uploaded',
    createdAt: '2026-08-18T10:00:00Z',
  },
  {
    id: 'img_05',
    recipeId: 'rec_slow_cooker_beef_pot_roast_05',
    type: 'hero',
    r2Key: 'recipes/melt-in-your-mouth-slow-cooker-beef-pot-roast/hero.webp',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    width: 1200,
    height: 800,
    format: 'webp',
    altText: 'Slow Cooker Beef Pot Roast',
    sourceType: 'uploaded',
    createdAt: '2026-08-19T09:00:00Z',
  },
];

declare global {
  var __FLAVORNEST_IMAGES__: ImageRecord[] | undefined;
}

export class ImageRepository {
  private async getStore(): Promise<ImageRecord[]> {
    if (!global.__FLAVORNEST_IMAGES__) {
      global.__FLAVORNEST_IMAGES__ = [...INITIAL_IMAGES];
    }
    return global.__FLAVORNEST_IMAGES__;
  }

  async list(type?: string): Promise<ImageRecord[]> {
    const store = await this.getStore();
    if (!type || type === 'all') return store;
    return store.filter((img) => img.type === type);
  }

  async listByRecipe(recipeId: string): Promise<ImageRecord[]> {
    const store = await this.getStore();
    return store.filter((img) => img.recipeId === recipeId);
  }

  async getById(id: string): Promise<ImageRecord | null> {
    const store = await this.getStore();
    return store.find((img) => img.id === id) || null;
  }

  async create(data: Omit<ImageRecord, 'id' | 'createdAt'>): Promise<ImageRecord> {
    const store = await this.getStore();
    const newImage: ImageRecord = {
      ...data,
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    store.unshift(newImage);
    return newImage;
  }

  async delete(id: string): Promise<boolean> {
    const store = await this.getStore();
    const index = store.findIndex((img) => img.id === id);
    if (index === -1) return false;
    store.splice(index, 1);
    return true;
  }
}

export const imageRepository = new ImageRepository();
