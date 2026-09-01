export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

const INITIAL_TAGS: Tag[] = [
  { id: 'tag_1', name: '30-minute', slug: '30-minute', createdAt: new Date().toISOString() },
  { id: 'tag_2', name: 'quick-dinner', slug: 'quick-dinner', createdAt: new Date().toISOString() },
  { id: 'tag_3', name: 'skillet-meal', slug: 'skillet-meal', createdAt: new Date().toISOString() },
  { id: 'tag_4', name: 'chicken-breast', slug: 'chicken-breast', createdAt: new Date().toISOString() },
  { id: 'tag_5', name: 'garlic-parmesan', slug: 'garlic-parmesan', createdAt: new Date().toISOString() },
  { id: 'tag_6', name: 'one-pot', slug: 'one-pot', createdAt: new Date().toISOString() },
  { id: 'tag_7', name: 'comfort-food', slug: 'comfort-food', createdAt: new Date().toISOString() },
  { id: 'tag_8', name: 'air-fryer', slug: 'air-fryer', createdAt: new Date().toISOString() },
  { id: 'tag_9', name: 'family-favorite', slug: 'family-favorite', createdAt: new Date().toISOString() },
  { id: 'tag_10', name: 'budget-friendly', slug: 'budget-friendly', createdAt: new Date().toISOString() },
  { id: 'tag_11', name: 'meal-prep', slug: 'meal-prep', createdAt: new Date().toISOString() },
  { id: 'tag_12', name: 'low-carb', slug: 'low-carb', createdAt: new Date().toISOString() },
  { id: 'tag_13', name: 'keto-friendly', slug: 'keto-friendly', createdAt: new Date().toISOString() },
  { id: 'tag_14', name: 'weeknight-dinner', slug: 'weeknight-dinner', createdAt: new Date().toISOString() },
  { id: 'tag_15', name: 'sheet-pan', slug: 'sheet-pan', createdAt: new Date().toISOString() },
];

declare global {
  var __FLAVORNEST_TAGS__: Tag[] | undefined;
}

export class TagRepository {
  private async getStore(): Promise<Tag[]> {
    if (!global.__FLAVORNEST_TAGS__) {
      global.__FLAVORNEST_TAGS__ = [...INITIAL_TAGS];
    }
    return global.__FLAVORNEST_TAGS__;
  }

  async list(search?: string): Promise<Tag[]> {
    const store = await this.getStore();
    if (!search || !search.trim()) return store;
    const q = search.toLowerCase().trim();
    return store.filter((t) => t.name.toLowerCase().includes(q) || t.slug.includes(q));
  }

  async getById(id: string): Promise<Tag | null> {
    const store = await this.getStore();
    return store.find((t) => t.id === id) || null;
  }

  async getBySlug(slug: string): Promise<Tag | null> {
    const store = await this.getStore();
    return store.find((t) => t.slug === slug) || null;
  }

  async create(name: string, slug: string): Promise<Tag> {
    const store = await this.getStore();
    const existing = store.find((t) => t.slug === slug);
    if (existing) {
      throw new Error(`Tag with slug "${slug}" already exists.`);
    }

    const newTag: Tag = {
      id: `tag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      slug,
      createdAt: new Date().toISOString(),
    };

    store.push(newTag);
    return newTag;
  }

  async update(id: string, name: string, slug: string): Promise<Tag> {
    const store = await this.getStore();
    const index = store.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Tag with ID "${id}" not found.`);
    }

    if (slug !== store[index].slug) {
      const conflict = store.find((t) => t.slug === slug && t.id !== id);
      if (conflict) {
        throw new Error(`Tag with slug "${slug}" already exists.`);
      }
    }

    store[index].name = name;
    store[index].slug = slug;
    return store[index];
  }

  async delete(id: string): Promise<boolean> {
    const store = await this.getStore();
    const index = store.findIndex((t) => t.id === id);
    if (index === -1) return false;
    store.splice(index, 1);
    return true;
  }
}

export const tagRepository = new TagRepository();
