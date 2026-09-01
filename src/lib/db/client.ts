import { Recipe } from '../types/recipe';
import { Category } from '../types/category';
import { recipeRepository } from '../repositories/recipe.repository';
import { categoryRepository } from '../repositories/category.repository';

export interface DatabaseClient {
  getRecipeBySlug(slug: string): Promise<Recipe | null>;
  listPublishedRecipes(limit?: number, offset?: number): Promise<Recipe[]>;
  listRecipesByCategory(categorySlug: string, limit?: number): Promise<Recipe[]>;
  getTrendingRecipes(limit?: number): Promise<Recipe[]>;
  getQuickAndEasyRecipes(limit?: number): Promise<Recipe[]>;
  get30MinuteRecipes(limit?: number): Promise<Recipe[]>;
  getFeaturedRecipe(): Promise<Recipe | null>;
  getRelatedRecipes(recipe: Recipe, limit?: number): Promise<Recipe[]>;
  searchRecipes(query?: string, categorySlug?: string): Promise<Recipe[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  listCategories(): Promise<Category[]>;
}

class D1IntegratedDatabaseClient implements DatabaseClient {
  async getRecipeBySlug(slug: string): Promise<Recipe | null> {
    const recipe = await recipeRepository.getBySlug(slug);
    if (!recipe || recipe.status !== 'published') return null;
    return recipe;
  }

  async listPublishedRecipes(limit = 50, offset = 0): Promise<Recipe[]> {
    return recipeRepository.listPublished(limit, offset);
  }

  async listRecipesByCategory(categorySlug: string, limit = 50): Promise<Recipe[]> {
    const { recipes } = await recipeRepository.list({
      status: 'published',
      categorySlug,
      limit,
    });
    return recipes;
  }

  async getTrendingRecipes(limit = 4): Promise<Recipe[]> {
    const published = await recipeRepository.listPublished(50);
    return published.filter((r) => r.trending).slice(0, limit);
  }

  async getQuickAndEasyRecipes(limit = 4): Promise<Recipe[]> {
    const published = await recipeRepository.listPublished(50);
    return published
      .filter(
        (r) =>
          r.primaryCategorySlug === 'quick-and-easy' ||
          r.categorySlugs.includes('quick-and-easy') ||
          r.totalTimeMinutes <= 30
      )
      .slice(0, limit);
  }

  async get30MinuteRecipes(limit = 6): Promise<Recipe[]> {
    const published = await recipeRepository.listPublished(50);
    return published.filter((r) => r.totalTimeMinutes <= 30).slice(0, limit);
  }

  async getFeaturedRecipe(): Promise<Recipe | null> {
    const published = await recipeRepository.listPublished(50);
    const featured = published.find((r) => r.featured);
    return featured || published[0] || null;
  }

  async getRelatedRecipes(recipe: Recipe, limit = 3): Promise<Recipe[]> {
    const published = await recipeRepository.listPublished(50);
    return published
      .filter(
        (r) =>
          r.id !== recipe.id &&
          (r.primaryCategorySlug === recipe.primaryCategorySlug ||
            r.categorySlugs.some((cat) => recipe.categorySlugs.includes(cat)))
      )
      .slice(0, limit);
  }

  async searchRecipes(query?: string, categorySlug?: string): Promise<Recipe[]> {
    const { recipes } = await recipeRepository.list({
      status: 'published',
      categorySlug: categorySlug !== 'all' ? categorySlug : undefined,
      search: query,
      limit: 100,
    });
    return recipes;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return categoryRepository.getBySlug(slug);
  }

  async listCategories(): Promise<Category[]> {
    return categoryRepository.list();
  }
}

export const db: DatabaseClient = new D1IntegratedDatabaseClient();
