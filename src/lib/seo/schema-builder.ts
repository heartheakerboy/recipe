import { Recipe } from '../types/recipe';
import { formatIsoDuration } from '../utils/formatters';

export function buildRecipeJsonLd(recipe: Recipe) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.shortDescription,
    image: [recipe.heroImage.url],
    author: {
      '@type': 'Organization',
      name: 'FlavorNest',
      url: 'https://flavornest.xyz',
    },
    publisher: {
      '@type': 'Organization',
      name: 'FlavorNest',
      url: 'https://flavornest.xyz',
      logo: {
        '@type': 'ImageObject',
        url: 'https://flavornest.xyz/images/logo.png',
      },
    },
    datePublished: recipe.publishedAt || recipe.createdAt,
    dateModified: recipe.updatedAt || recipe.createdAt,
    prepTime: formatIsoDuration(recipe.prepTimeMinutes),
    cookTime: formatIsoDuration(recipe.cookTimeMinutes),
    totalTime: formatIsoDuration(recipe.totalTimeMinutes),
    recipeYield: `${recipe.servings} ${recipe.servingsUnit || 'servings'}`,
    recipeCategory: recipe.primaryCategorySlug,
    recipeCuisine: recipe.cuisine || 'American',
    keywords: recipe.tags ? recipe.tags.join(', ') : '',
    recipeIngredient: recipe.ingredients.map((ing) => ing.rawText),
    recipeInstructions: recipe.instructions.map((ins) => ({
      '@type': 'HowToStep',
      name: ins.title || `Step ${ins.stepNumber}`,
      text: ins.instructionText,
      url: `${recipe.canonicalUrl}#step-${ins.stepNumber}`,
    })),
  };

  if (recipe.nutrition) {
    schema.nutrition = {
      '@type': 'NutritionInformation',
      calories: recipe.nutrition.calories ? `${recipe.nutrition.calories} calories` : undefined,
      proteinContent: recipe.nutrition.proteinGrams ? `${recipe.nutrition.proteinGrams} g` : undefined,
      carbohydrateContent: recipe.nutrition.carbsGrams ? `${recipe.nutrition.carbsGrams} g` : undefined,
      fatContent: recipe.nutrition.fatGrams ? `${recipe.nutrition.fatGrams} g` : undefined,
      fiberContent: recipe.nutrition.fiberGrams ? `${recipe.nutrition.fiberGrams} g` : undefined,
      sodiumContent: recipe.nutrition.sodiumMg ? `${recipe.nutrition.sodiumMg} mg` : undefined,
    };
  }

  return schema;
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FlavorNest',
    url: 'https://flavornest.xyz',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://flavornest.xyz/recipes?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FlavorNest',
    url: 'https://flavornest.xyz',
    logo: 'https://flavornest.xyz/images/logo.png',
    sameAs: ['https://pinterest.com/flavornestrecipes'],
  };
}
