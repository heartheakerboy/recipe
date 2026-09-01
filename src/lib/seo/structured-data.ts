import { Recipe } from '../types/recipe';

export function formatMinutesToIsoDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return 'PT0M';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `PT${hours}H${mins}M`;
  if (hours > 0) return `PT${hours}H`;
  return `PT${mins}M`;
}

export function generateRecipeJsonLd(recipe: Recipe) {
  const imageUrls: string[] = [];
  if (recipe.heroImage?.url) imageUrls.push(recipe.heroImage.url);
  if (recipe.secondaryImages && recipe.secondaryImages.length > 0) {
    recipe.secondaryImages.forEach((img) => imageUrls.push(img.url));
  }

  const instructions = recipe.instructions.map((ins) => ({
    '@type': 'HowToStep',
    name: ins.title || `Step ${ins.stepNumber}`,
    text: ins.instructionText,
    position: ins.stepNumber,
  }));

  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    image: imageUrls.length > 0 ? imageUrls : undefined,
    description: recipe.shortDescription || recipe.introduction.slice(0, 200),
    prepTime: formatMinutesToIsoDuration(recipe.prepTimeMinutes),
    cookTime: formatMinutesToIsoDuration(recipe.cookTimeMinutes),
    totalTime: formatMinutesToIsoDuration(recipe.totalTimeMinutes),
    recipeYield: `${recipe.servings} ${recipe.servingsUnit || 'servings'}`,
    recipeCategory: recipe.primaryCategorySlug.replace(/-/g, ' '),
    recipeCuisine: recipe.cuisine || 'American',
    recipeIngredient: recipe.ingredients.map((i) => i.rawText),
    recipeInstructions: instructions,
    author: {
      '@type': 'Organization',
      name: 'FlavorNest Editorial Team',
      url: 'https://flavornest.xyz/about/',
    },
    publisher: {
      '@type': 'Organization',
      name: 'FlavorNest',
      url: 'https://flavornest.xyz/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://flavornest.xyz/logo.png',
      },
    },
    datePublished: recipe.publishedAt || recipe.createdAt,
    dateModified: recipe.updatedAt || recipe.createdAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://flavornest.xyz/recipes/${recipe.slug}/`,
    },
  };

  if (recipe.nutrition) {
    jsonLd.nutrition = {
      '@type': 'NutritionInformation',
      calories: recipe.nutrition.calories ? `${recipe.nutrition.calories} calories` : undefined,
      proteinContent: recipe.nutrition.proteinGrams ? `${recipe.nutrition.proteinGrams} g` : undefined,
      carbohydrateContent: recipe.nutrition.carbsGrams ? `${recipe.nutrition.carbsGrams} g` : undefined,
      fatContent: recipe.nutrition.fatGrams ? `${recipe.nutrition.fatGrams} g` : undefined,
      fiberContent: recipe.nutrition.fiberGrams ? `${recipe.nutrition.fiberGrams} g` : undefined,
      sodiumContent: recipe.nutrition.sodiumMg ? `${recipe.nutrition.sodiumMg} mg` : undefined,
      sugarContent: recipe.nutrition.sugarGrams ? `${recipe.nutrition.sugarGrams} g` : undefined,
    };
  }

  return jsonLd;
}

export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.endsWith('/') ? item.url : `${item.url}/`,
    })),
  };
}

export function generateWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FlavorNest',
    url: 'https://flavornest.xyz/',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://flavornest.xyz/search/?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FlavorNest',
    url: 'https://flavornest.xyz/',
    logo: 'https://flavornest.xyz/logo.png',
    sameAs: ['https://pinterest.com/flavornest'],
  };
}
