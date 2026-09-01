import { Recipe } from '../types/recipe';
import { RecipeFormValues } from '../validations/recipe.schema';
import { SEED_RECIPES } from '../db/seed-data';
import { getCloudflareContext } from '@opennextjs/cloudflare';

declare global {
  var __FLAVORNEST_RECIPES__: Recipe[] | undefined;
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

function mapD1RowToRecipe(row: any): Recipe {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description,
    introduction: row.introduction,
    ingredients: typeof row.ingredients_json === 'string' ? JSON.parse(row.ingredients_json) : (row.ingredients_json || []),
    instructions: typeof row.instructions_json === 'string' ? JSON.parse(row.instructions_json) : (row.instructions_json || []),
    prepTimeMinutes: row.prep_time_minutes,
    cookTimeMinutes: row.cook_time_minutes,
    totalTimeMinutes: row.total_time_minutes,
    servings: row.servings,
    servingsUnit: row.servings_unit || 'servings',
    difficulty: row.difficulty,
    cuisine: row.cuisine || 'American',
    mealType: row.meal_type,
    cookingMethod: row.cooking_method,
    primaryCategorySlug: row.primary_category_slug,
    categorySlugs: typeof row.category_slugs_json === 'string' ? JSON.parse(row.category_slugs_json) : (row.category_slugs_json || []),
    tags: typeof row.tags_json === 'string' ? JSON.parse(row.tags_json) : (row.tags_json || []),
    heroImage: {
      url: row.hero_image_url,
      r2Key: row.hero_image_r2_key,
      altText: row.hero_image_alt,
      width: row.hero_image_width || 1200,
      height: row.hero_image_height || 800,
    },
    recipeCardData: typeof row.recipe_card_data_json === 'string' ? JSON.parse(row.recipe_card_data_json) : row.recipe_card_data_json,
    nutrition: typeof row.nutrition_json === 'string' ? JSON.parse(row.nutrition_json) : row.nutrition_json,
    faq: typeof row.faq_json === 'string' ? JSON.parse(row.faq_json) : row.faq_json,
    editorialStyle: row.editorial_style,
    seoTitle: row.seo_title,
    metaDescription: row.meta_description,
    canonicalUrl: row.canonical_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  };
}

export class RecipeRepository {
  private async getStore(): Promise<Recipe[]> {
    if (!global.__FLAVORNEST_RECIPES__) {
      // Seed with initial sample recipes
      global.__FLAVORNEST_RECIPES__ = SEED_RECIPES.map((r) => ({ ...r }));
    }
    return global.__FLAVORNEST_RECIPES__;
  }

  async list(options?: {
    status?: string;
    categorySlug?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ recipes: Recipe[]; totalCount: number }> {
    const db = getD1Database();
    if (db) {
      try {
        let query = 'SELECT * FROM recipes WHERE 1=1';
        const params: any[] = [];

        if (options?.status && options.status !== 'all') {
          query += ' AND status = ?';
          params.push(options.status);
        }

        if (options?.categorySlug && options.categorySlug !== 'all') {
          query += ' AND (primary_category_slug = ? OR category_slugs_json LIKE ?)';
          params.push(options.categorySlug, `%"${options.categorySlug}"%`);
        }

        if (options?.search && options.search.trim()) {
          query += ' AND (title LIKE ? OR slug LIKE ? OR short_description LIKE ?)';
          const searchPattern = `%${options.search.trim()}%`;
          params.push(searchPattern, searchPattern, searchPattern);
        }

        query += ' ORDER BY updated_at DESC';

        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
        const countRes = await db.prepare(countQuery).bind(...params).first();
        const totalCount = (countRes as any)?.count || 0;

        const limit = options?.limit || 50;
        const offset = options?.offset || 0;
        query += ` LIMIT ${limit} OFFSET ${offset}`;

        const { results } = await db.prepare(query).bind(...params).all();
        if (results && results.length > 0) {
          return {
            recipes: results.map(mapD1RowToRecipe),
            totalCount,
          };
        }
      } catch (e) {
        console.warn('D1 list query warning, falling back to memory:', e);
      }
    }

    const store = await this.getStore();
    let filtered = [...store];

    if (options?.status && options.status !== 'all') {
      filtered = filtered.filter((r) => r.status === options.status);
    }

    if (options?.categorySlug && options.categorySlug !== 'all') {
      filtered = filtered.filter(
        (r) =>
          r.primaryCategorySlug === options.categorySlug ||
          r.categorySlugs.includes(options.categorySlug!)
      );
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.slug.toLowerCase().includes(q) ||
          r.shortDescription.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort by updated descending
    filtered.sort(
      (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    );

    const totalCount = filtered.length;
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    const paginated = filtered.slice(offset, offset + limit);

    return { recipes: paginated, totalCount };
  }

  async listPublished(limit = 50, offset = 0): Promise<Recipe[]> {
    const { recipes } = await this.list({ status: 'published', limit, offset });
    return recipes;
  }

  async getById(id: string): Promise<Recipe | null> {
    const db = getD1Database();
    if (db) {
      try {
        const row = await db.prepare('SELECT * FROM recipes WHERE id = ?').bind(id).first();
        if (row) return mapD1RowToRecipe(row);
      } catch (e) {
        console.warn('D1 getById query error:', e);
      }
    }

    const store = await this.getStore();
    return store.find((r) => r.id === id) || null;
  }

  async getBySlug(slug: string): Promise<Recipe | null> {
    const db = getD1Database();
    if (db) {
      try {
        const row = await db.prepare('SELECT * FROM recipes WHERE slug = ?').bind(slug).first();
        if (row) return mapD1RowToRecipe(row);
      } catch (e) {
        console.warn('D1 getBySlug query error:', e);
      }
    }

    const store = await this.getStore();
    return store.find((r) => r.slug === slug) || null;
  }

  async create(data: RecipeFormValues): Promise<Recipe> {
    const now = new Date().toISOString();
    const newRecipe: Recipe = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: data.title,
      slug: data.slug,
      shortDescription: data.shortDescription,
      introduction: data.introduction,
      ingredients: data.ingredients,
      instructions: data.instructions,
      prepTimeMinutes: data.prepTimeMinutes,
      cookTimeMinutes: data.cookTimeMinutes,
      totalTimeMinutes: data.totalTimeMinutes,
      servings: data.servings,
      servingsUnit: data.servingsUnit,
      difficulty: data.difficulty,
      cuisine: data.cuisine,
      mealType: data.mealType,
      cookingMethod: data.cookingMethod,
      primaryCategorySlug: data.primaryCategorySlug,
      categorySlugs: data.categorySlugs,
      tags: data.tags,
      heroImage: {
        url: data.heroImageUrl,
        r2Key: `recipes/${data.slug}/hero.webp`,
        altText: data.heroImageAlt,
        width: 1200,
        height: 800,
      },
      nutrition: data.nutrition,
      recipeCardData: data.recipeCardData,
      faq: data.faq,
      editorialStyle: data.editorialStyle,
      seoTitle: data.seoTitle || `${data.title} | FlavorNest`,
      metaDescription: data.metaDescription || data.shortDescription,
      canonicalUrl: data.canonicalUrl || `https://flavornest.xyz/recipes/${data.slug}`,
      status: data.status,
      createdAt: now,
      updatedAt: now,
      publishedAt: data.status === 'published' ? now : undefined,
    };

    const db = getD1Database();
    if (db) {
      try {
        await db.prepare(`INSERT OR REPLACE INTO recipes (
          id, title, slug, short_description, introduction, ingredients_json, instructions_json,
          prep_time_minutes, cook_time_minutes, total_time_minutes, servings, servings_unit,
          difficulty, cuisine, meal_type, cooking_method, primary_category_slug, category_slugs_json,
          tags_json, hero_image_url, hero_image_r2_key, hero_image_alt, hero_image_width, hero_image_height,
          recipe_card_data_json, nutrition_json, faq_json, editorial_style, seo_title, meta_description,
          canonical_url, status, created_at, updated_at, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
          newRecipe.id,
          newRecipe.title,
          newRecipe.slug,
          newRecipe.shortDescription,
          newRecipe.introduction,
          JSON.stringify(newRecipe.ingredients),
          JSON.stringify(newRecipe.instructions),
          newRecipe.prepTimeMinutes,
          newRecipe.cookTimeMinutes,
          newRecipe.totalTimeMinutes,
          newRecipe.servings,
          newRecipe.servingsUnit,
          newRecipe.difficulty,
          newRecipe.cuisine,
          newRecipe.mealType,
          newRecipe.cookingMethod,
          newRecipe.primaryCategorySlug,
          JSON.stringify(newRecipe.categorySlugs),
          JSON.stringify(newRecipe.tags),
          newRecipe.heroImage.url,
          newRecipe.heroImage.r2Key,
          newRecipe.heroImage.altText,
          newRecipe.heroImage.width,
          newRecipe.heroImage.height,
          newRecipe.recipeCardData ? JSON.stringify(newRecipe.recipeCardData) : null,
          newRecipe.nutrition ? JSON.stringify(newRecipe.nutrition) : null,
          newRecipe.faq ? JSON.stringify(newRecipe.faq) : null,
          newRecipe.editorialStyle,
          newRecipe.seoTitle,
          newRecipe.metaDescription,
          newRecipe.canonicalUrl,
          newRecipe.status,
          newRecipe.createdAt,
          newRecipe.updatedAt,
          newRecipe.publishedAt || null
        ).run();
      } catch (err) {
        console.warn('D1 create error:', err);
      }
    }

    const store = await this.getStore();
    store.unshift(newRecipe);
    return newRecipe;
  }

  async update(id: string, data: Partial<RecipeFormValues>): Promise<Recipe> {
    const existing = await this.getById(id);
    if (!existing) {
      if (data.title && data.slug) {
        const newRecipe = await this.create(data as RecipeFormValues);
        newRecipe.id = id;
        return newRecipe;
      }
      throw new Error(`Recipe with ID "${id}" not found.`);
    }

    const now = new Date().toISOString();
    const isPublishing = data.status === 'published' && existing.status !== 'published';

    const updatedRecipe: Recipe = {
      ...existing,
      title: data.title ?? existing.title,
      slug: data.slug ?? existing.slug,
      shortDescription: data.shortDescription ?? existing.shortDescription,
      introduction: data.introduction ?? existing.introduction,
      ingredients: data.ingredients ?? existing.ingredients,
      instructions: data.instructions ?? existing.instructions,
      prepTimeMinutes: data.prepTimeMinutes ?? existing.prepTimeMinutes,
      cookTimeMinutes: data.cookTimeMinutes ?? existing.cookTimeMinutes,
      totalTimeMinutes: data.totalTimeMinutes ?? existing.totalTimeMinutes,
      servings: data.servings ?? existing.servings,
      servingsUnit: data.servingsUnit ?? existing.servingsUnit,
      difficulty: data.difficulty ?? existing.difficulty,
      cuisine: data.cuisine ?? existing.cuisine,
      mealType: data.mealType ?? existing.mealType,
      cookingMethod: data.cookingMethod ?? existing.cookingMethod,
      primaryCategorySlug: data.primaryCategorySlug ?? existing.primaryCategorySlug,
      categorySlugs: data.categorySlugs ?? existing.categorySlugs,
      tags: data.tags ?? existing.tags,
      heroImage: {
        url: data.heroImageUrl ?? existing.heroImage.url,
        r2Key: data.slug ? `recipes/${data.slug}/hero.webp` : existing.heroImage.r2Key,
        altText: data.heroImageAlt ?? existing.heroImage.altText,
        width: existing.heroImage.width,
        height: existing.heroImage.height,
      },
      nutrition: data.nutrition ?? existing.nutrition,
      recipeCardData: data.recipeCardData ?? existing.recipeCardData,
      faq: data.faq ?? existing.faq,
      editorialStyle: data.editorialStyle ?? existing.editorialStyle,
      seoTitle: data.seoTitle ?? existing.seoTitle,
      metaDescription: data.metaDescription ?? existing.metaDescription,
      canonicalUrl: data.canonicalUrl ?? existing.canonicalUrl,
      status: data.status ?? existing.status,
      updatedAt: now,
      publishedAt: isPublishing ? now : existing.publishedAt,
    };

    const db = getD1Database();
    if (db) {
      try {
        await db.prepare(`UPDATE recipes SET
          title = ?, slug = ?, short_description = ?, introduction = ?,
          ingredients_json = ?, instructions_json = ?, prep_time_minutes = ?,
          cook_time_minutes = ?, total_time_minutes = ?, servings = ?, servings_unit = ?,
          difficulty = ?, cuisine = ?, meal_type = ?, cooking_method = ?,
          primary_category_slug = ?, category_slugs_json = ?, tags_json = ?,
          hero_image_url = ?, hero_image_r2_key = ?, hero_image_alt = ?,
          recipe_card_data_json = ?, nutrition_json = ?, faq_json = ?,
          editorial_style = ?, seo_title = ?, meta_description = ?, canonical_url = ?,
          status = ?, updated_at = ?, published_at = ?
          WHERE id = ?`).bind(
          updatedRecipe.title,
          updatedRecipe.slug,
          updatedRecipe.shortDescription,
          updatedRecipe.introduction,
          JSON.stringify(updatedRecipe.ingredients),
          JSON.stringify(updatedRecipe.instructions),
          updatedRecipe.prepTimeMinutes,
          updatedRecipe.cookTimeMinutes,
          updatedRecipe.totalTimeMinutes,
          updatedRecipe.servings,
          updatedRecipe.servingsUnit,
          updatedRecipe.difficulty,
          updatedRecipe.cuisine,
          updatedRecipe.mealType,
          updatedRecipe.cookingMethod,
          updatedRecipe.primaryCategorySlug,
          JSON.stringify(updatedRecipe.categorySlugs),
          JSON.stringify(updatedRecipe.tags),
          updatedRecipe.heroImage.url,
          updatedRecipe.heroImage.r2Key,
          updatedRecipe.heroImage.altText,
          updatedRecipe.recipeCardData ? JSON.stringify(updatedRecipe.recipeCardData) : null,
          updatedRecipe.nutrition ? JSON.stringify(updatedRecipe.nutrition) : null,
          updatedRecipe.faq ? JSON.stringify(updatedRecipe.faq) : null,
          updatedRecipe.editorialStyle,
          updatedRecipe.seoTitle,
          updatedRecipe.metaDescription,
          updatedRecipe.canonicalUrl,
          updatedRecipe.status,
          updatedRecipe.updatedAt,
          updatedRecipe.publishedAt || null,
          id
        ).run();
      } catch (err) {
        console.warn('D1 update error:', err);
      }
    }

    const store = await this.getStore();
    const idx = store.findIndex((r) => r.id === id);
    if (idx !== -1) {
      store[idx] = updatedRecipe;
    } else {
      store.unshift(updatedRecipe);
    }

    return updatedRecipe;
  }

  async archive(id: string): Promise<Recipe> {
    return this.update(id, { status: 'archived' });
  }

  async delete(id: string): Promise<boolean> {
    const db = getD1Database();
    if (db) {
      try {
        await db.prepare('DELETE FROM recipes WHERE id = ?').bind(id).run();
      } catch (err) {
        console.warn('D1 delete error:', err);
      }
    }

    const store = await this.getStore();
    const index = store.findIndex((r) => r.id === id);
    if (index !== -1) {
      store.splice(index, 1);
      return true;
    }
    return false;
  }

  async getStats(): Promise<RecipeStats> {
    const { recipes, totalCount } = await this.list({ limit: 1000 });
    return {
      total: totalCount,
      published: recipes.filter((r) => r.status === 'published').length,
      draft: recipes.filter((r) => r.status === 'draft').length,
      review: recipes.filter((r) => r.status === 'review' || r.status === 'processing' || r.status === 'approved').length,
      archived: recipes.filter((r) => r.status === 'archived').length,
    };
  }
}

export interface RecipeStats {
  total: number;
  published: number;
  draft: number;
  review: number;
  archived: number;
}

export const recipeRepository = new RecipeRepository();
