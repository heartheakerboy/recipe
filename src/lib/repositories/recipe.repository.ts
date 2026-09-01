import { Recipe, RecipeStatus } from '../types/recipe';
import { RecipeFormValues } from '../validations/recipe.schema';
import { SEED_RECIPES } from '../db/seed-data';

export interface RecipeStats {
  total: number;
  published: number;
  draft: number;
  review: number;
  archived: number;
}

// In-memory / module-scoped repository store for development (persistent across dev hot-reloads)
declare global {
  var __FLAVORNEST_RECIPES__: Recipe[] | undefined;
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
    const store = await this.getStore();
    return store
      .filter((r) => r.status === 'published')
      .slice(offset, offset + limit);
  }

  async getById(id: string): Promise<Recipe | null> {
    const store = await this.getStore();
    return store.find((r) => r.id === id) || null;
  }

  async getBySlug(slug: string): Promise<Recipe | null> {
    const store = await this.getStore();
    return store.find((r) => r.slug === slug) || null;
  }

  async create(data: RecipeFormValues): Promise<Recipe> {
    const store = await this.getStore();

    // Check slug uniqueness
    const existing = store.find((r) => r.slug === data.slug);
    if (existing) {
      throw new Error(`A recipe with slug "${data.slug}" already exists.`);
    }

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

    store.unshift(newRecipe);
    return newRecipe;
  }

  async update(id: string, data: Partial<RecipeFormValues>): Promise<Recipe> {
    const store = await this.getStore();
    let index = store.findIndex((r) => r.id === id);
    if (index === -1) {
      if (data.title && data.slug) {
        // Recover/upsert recipe seamlessly across worker isolate recycles
        const newRecipe = await this.create(data as RecipeFormValues);
        newRecipe.id = id;
        return newRecipe;
      }
      throw new Error(`Recipe with ID "${id}" not found.`);
    }

    const existing = store[index];

    // If slug is changing, verify uniqueness
    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = store.find((r) => r.slug === data.slug && r.id !== id);
      if (slugConflict) {
        throw new Error(`A recipe with slug "${data.slug}" already exists.`);
      }
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
        r2Key: `recipes/${data.slug ?? existing.slug}/hero.webp`,
        altText: data.heroImageAlt ?? existing.heroImage.altText,
        width: 1200,
        height: 800,
      },
      nutrition: data.nutrition ?? existing.nutrition,
      recipeCardData: data.recipeCardData ?? existing.recipeCardData,
      faq: data.faq ?? existing.faq,
      editorialStyle: data.editorialStyle ?? existing.editorialStyle,
      seoTitle: data.seoTitle ?? existing.seoTitle,
      metaDescription: data.metaDescription ?? existing.metaDescription,
      canonicalUrl: data.canonicalUrl ?? existing.canonicalUrl,
      status: (data.status as RecipeStatus) ?? existing.status,
      updatedAt: now,
      publishedAt: isPublishing ? now : existing.publishedAt,
    };

    store[index] = updatedRecipe;
    return updatedRecipe;
  }

  async archive(id: string): Promise<Recipe> {
    return this.update(id, { status: 'archived' });
  }

  async delete(id: string): Promise<boolean> {
    const store = await this.getStore();
    const index = store.findIndex((r) => r.id === id);
    if (index === -1) return false;
    store.splice(index, 1);
    return true;
  }

  async getStats(): Promise<RecipeStats> {
    const store = await this.getStore();
    return {
      total: store.length,
      published: store.filter((r) => r.status === 'published').length,
      draft: store.filter((r) => r.status === 'draft').length,
      review: store.filter((r) => r.status === 'review' || r.status === 'processing' || r.status === 'approved').length,
      archived: store.filter((r) => r.status === 'archived').length,
    };
  }
}

export const recipeRepository = new RecipeRepository();
