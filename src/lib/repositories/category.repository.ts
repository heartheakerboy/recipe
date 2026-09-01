import { Category } from '../types/category';
import { CategoryFormValues } from '../validations/category.schema';
import { PRIMARY_CATEGORIES } from '../config/categories.config';
import { getCloudflareContext } from '@opennextjs/cloudflare';

declare global {
  var __FLAVORNEST_CATEGORIES__: Category[] | undefined;
}

function getD1Database(): any | null {
  try {
    const ctx = getCloudflareContext();
    if ((ctx?.env as any)?.DB) return (ctx.env as any).DB;
  } catch {}
  if (typeof (globalThis as any)?.DB !== 'undefined') {
    return (globalThis as any).DB;
  }
  return null;
}

function mapD1RowToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    shortDescription: row.short_description || '',
    heroImage: row.hero_image_url || undefined,
    iconName: row.icon_name || undefined,
    sortOrder: row.sort_order || 0,
    featured: Boolean(row.featured),
  };
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
    const db = getD1Database();
    if (db) {
      try {
        const { results } = await db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
        if (results && results.length > 0) {
          return results.map(mapD1RowToCategory);
        }
      } catch (e) {
        console.warn('D1 category list fallback:', e);
      }
    }

    const store = await this.getStore();
    return [...store].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getById(id: string): Promise<Category | null> {
    const db = getD1Database();
    if (db) {
      try {
        const row = await db.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first();
        if (row) return mapD1RowToCategory(row);
      } catch (e) {
        console.warn('D1 category getById fallback:', e);
      }
    }

    const store = await this.getStore();
    return store.find((c) => c.id === id) || null;
  }

  async getBySlug(slug: string): Promise<Category | null> {
    const db = getD1Database();
    if (db) {
      try {
        const row = await db.prepare('SELECT * FROM categories WHERE slug = ?').bind(slug).first();
        if (row) return mapD1RowToCategory(row);
      } catch (e) {
        console.warn('D1 category getBySlug fallback:', e);
      }
    }

    const store = await this.getStore();
    return store.find((c) => c.slug === slug) || null;
  }

  async create(data: CategoryFormValues): Promise<Category> {
    const newCategory: Category = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name,
      slug: data.slug,
      description: data.description,
      shortDescription: data.shortDescription,
      heroImage: data.heroImage || undefined,
      sortOrder: data.sortOrder ?? 1,
      featured: false,
    };

    const db = getD1Database();
    if (db) {
      try {
        await db.prepare(`INSERT OR REPLACE INTO categories (
          id, name, slug, description, short_description, hero_image_url, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(
          newCategory.id,
          newCategory.name,
          newCategory.slug,
          newCategory.description || '',
          newCategory.shortDescription || '',
          newCategory.heroImage || '',
          newCategory.sortOrder
        ).run();
      } catch (e) {
        console.warn('D1 category create fallback:', e);
      }
    }

    const store = await this.getStore();
    store.push(newCategory);
    return newCategory;
  }

  async update(id: string, data: Partial<CategoryFormValues>): Promise<Category> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Category with ID "${id}" not found.`);
    }

    const updated: Category = {
      ...existing,
      name: data.name ?? existing.name,
      slug: data.slug ?? existing.slug,
      description: data.description ?? existing.description,
      shortDescription: data.shortDescription ?? existing.shortDescription,
      heroImage: data.heroImage ?? existing.heroImage,
      sortOrder: data.sortOrder ?? existing.sortOrder,
    };

    const db = getD1Database();
    if (db) {
      try {
        await db.prepare(`UPDATE categories SET
          name = ?, slug = ?, description = ?, short_description = ?, hero_image_url = ?, sort_order = ?
          WHERE id = ?`).bind(
          updated.name,
          updated.slug,
          updated.description || '',
          updated.shortDescription || '',
          updated.heroImage || '',
          updated.sortOrder,
          id
        ).run();
      } catch (e) {
        console.warn('D1 category update fallback:', e);
      }
    }

    const store = await this.getStore();
    const index = store.findIndex((c) => c.id === id);
    if (index !== -1) {
      store[index] = updated;
    }

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const db = getD1Database();
    if (db) {
      try {
        await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
      } catch (e) {
        console.warn('D1 category delete fallback:', e);
      }
    }

    const store = await this.getStore();
    const index = store.findIndex((c) => c.id === id);
    if (index === -1) return false;
    store.splice(index, 1);
    return true;
  }
}

export const categoryRepository = new CategoryRepository();
