import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config/site.config';
import { PRIMARY_CATEGORIES } from '@/lib/config/categories.config';
import { recipeRepository } from '@/lib/repositories/recipe.repository';
import { collectionRepository } from '@/lib/repositories/collection.repository';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url.replace(/\/$/, '');
  const now = new Date();

  // 1. Static Core Pages (with consistent trailing slash)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/recipes/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy/`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms/`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclaimer/`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // 2. Fetch Published Recipes Only
  const { recipes: publishedRecipes } = await recipeRepository.list({
    status: 'published',
    limit: 1000,
  });

  const activeCategorySlugs = new Set(publishedRecipes.map((r) => r.primaryCategorySlug));

  // 3. Category Pages (Include primary categories with active content)
  const categoryRoutes: MetadataRoute.Sitemap = Object.values(PRIMARY_CATEGORIES)
    .filter((cat) => activeCategorySlugs.has(cat.slug) || publishedRecipes.length < 5)
    .map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  // 4. Published Collections
  const publishedCollections = await collectionRepository.list({ status: 'published' });
  const collectionRoutes: MetadataRoute.Sitemap = publishedCollections.map((col) => ({
    url: `${baseUrl}/collection/${col.slug}/`,
    lastModified: new Date(col.updatedAt || col.createdAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 5. Published Recipe Pages
  const recipeRoutes: MetadataRoute.Sitemap = publishedRecipes.map((recipe) => ({
    url: `${baseUrl}/recipes/${recipe.slug}/`,
    lastModified: new Date(recipe.updatedAt || recipe.createdAt),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  return [...staticRoutes, ...categoryRoutes, ...collectionRoutes, ...recipeRoutes];
}
