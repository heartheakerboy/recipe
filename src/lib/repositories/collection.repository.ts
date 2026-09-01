import { Collection, CreateCollectionInput } from '../types/collection';

declare global {
  var __FLAVORNEST_COLLECTIONS__: Collection[] | undefined;
}

const SEED_COLLECTIONS: Collection[] = [
  {
    id: 'col_30_min_dinners',
    name: '30-Minute Dinners',
    slug: '30-minute-dinners',
    description: 'Fast, flavorful weeknight meals ready from start to table in 30 minutes or less.',
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&h=800&q=80',
    status: 'published',
    sortOrder: 1,
    recipeIds: ['rec_creamy_garlic_chicken_01'],
    createdAt: '2026-08-10T12:00:00Z',
    updatedAt: '2026-08-10T12:00:00Z',
  },
  {
    id: 'col_one_pan_meals',
    name: 'One-Pan & Skillet Meals',
    slug: 'one-pan-meals',
    description: 'Hearty comfort meals cooked in a single pan for big flavor and minimal cleanup.',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&h=800&q=80',
    status: 'published',
    sortOrder: 2,
    recipeIds: ['rec_creamy_garlic_chicken_01'],
    createdAt: '2026-08-10T12:00:00Z',
    updatedAt: '2026-08-10T12:00:00Z',
  },
  {
    id: 'col_weeknight_chicken',
    name: 'Easy Chicken Classics',
    slug: 'easy-chicken-classics',
    description: 'Dependable, tender chicken dinners that bring the whole family together.',
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&h=800&q=80',
    status: 'published',
    sortOrder: 3,
    recipeIds: ['rec_creamy_garlic_chicken_01'],
    createdAt: '2026-08-10T12:00:00Z',
    updatedAt: '2026-08-10T12:00:00Z',
  },
];

export class CollectionRepository {
  private async getStore(): Promise<Collection[]> {
    if (!global.__FLAVORNEST_COLLECTIONS__) {
      global.__FLAVORNEST_COLLECTIONS__ = SEED_COLLECTIONS.map((c) => ({ ...c }));
    }
    return global.__FLAVORNEST_COLLECTIONS__;
  }

  async list(options?: { status?: string; limit?: number }): Promise<Collection[]> {
    const store = await this.getStore();
    let filtered = [...store];

    if (options?.status && options.status !== 'all') {
      filtered = filtered.filter((c) => c.status === options.status);
    }

    filtered.sort((a, b) => a.sortOrder - b.sortOrder);

    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  async getBySlug(slug: string): Promise<Collection | null> {
    const store = await this.getStore();
    return store.find((c) => c.slug === slug) || null;
  }

  async getById(id: string): Promise<Collection | null> {
    const store = await this.getStore();
    return store.find((c) => c.id === id) || null;
  }

  async create(input: CreateCollectionInput): Promise<Collection> {
    const store = await this.getStore();
    const now = new Date().toISOString();
    const newCol: Collection = {
      ...input,
      id: `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };
    store.push(newCol);
    return newCol;
  }

  async update(id: string, updates: Partial<CreateCollectionInput>): Promise<Collection> {
    const store = await this.getStore();
    const index = store.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Collection "${id}" not found`);

    const updated: Collection = {
      ...store[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    store[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const store = await this.getStore();
    const index = store.findIndex((c) => c.id === id);
    if (index !== -1) {
      store.splice(index, 1);
      return true;
    }
    return false;
  }
}

export const collectionRepository = new CollectionRepository();
