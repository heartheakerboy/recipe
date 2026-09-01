import { Category } from '../types/category';
import { CategoryFormValues } from '../validations/category.schema';
import { PRIMARY_CATEGORIES } from '../config/categories.config';

declare global {
  var __FLAVORNEST_CATEGORIES__: Category[] | undefined;
}

export class CategoryRepository {
  private async getStore(): Promise<Category[]> {
    if (!global.__FLAVORNEST_CATEGORIES__) {
      const initial = Object.values(PRIMARY_CATEGORIES).map((c) => ({ ...c }));
      global.__FLAVORNEST_CATEGORIES__ = initial;
    }
    return global.__FLAVORNEST_CATEGORIES__;
  }

  async list(): Promise<Category[]> {
    const store = await this.getStore();
    return [...store].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getById(id: string): Promise<Category | null> {
    const store = await this.getStore();
    return store.find((c) => c.id === id) || null;
  }

  async getBySlug(slug: string): Promise<Category | null> {
    const store = await this.getStore();
    return store.find((c) => c.slug === slug) || null;
  }

  async create(data: CategoryFormValues): Promise<Category> {
    const store = await this.getStore();

    const existing = store.find((c) => c.slug === data.slug);
    if (existing) {
      throw new Error(`Category with slug "${data.slug}" already exists.`);
    }

    const newCategory: Category = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name,
      slug: data.slug,
      description: data.description,
      shortDescription: data.shortDescription,
      heroImage: data.heroImage || undefined,
      sortOrder: data.sortOrder ?? store.length + 1,
      featured: false,
    };

    store.push(newCategory);
    return newCategory;
  }

  async update(id: string, data: Partial<CategoryFormValues>): Promise<Category> {
    const store = await this.getStore();
    const index = store.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Category with ID "${id}" not found.`);
    }

    const existing = store[index];
    if (data.slug && data.slug !== existing.slug) {
      const conflict = store.find((c) => c.slug === data.slug && c.id !== id);
      if (conflict) {
        throw new Error(`Category with slug "${data.slug}" already exists.`);
      }
    }

    const updated: Category = {
      ...existing,
      name: data.name ?? existing.name,
      slug: data.slug ?? existing.slug,
      description: data.description ?? existing.description,
      shortDescription: data.shortDescription ?? existing.shortDescription,
      heroImage: data.heroImage !== undefined ? data.heroImage : existing.heroImage,
      sortOrder: data.sortOrder ?? existing.sortOrder,
    };

    store[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const store = await this.getStore();
    const index = store.findIndex((c) => c.id === id);
    if (index === -1) return false;
    store.splice(index, 1);
    return true;
  }
}

export const categoryRepository = new CategoryRepository();
