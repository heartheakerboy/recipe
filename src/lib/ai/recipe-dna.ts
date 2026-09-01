import { Recipe } from '../types/recipe';
import { getAIProvider, AIProvider } from './ai-provider';

export interface RecipeDNA {
  coreDish: string;
  primaryProtein: string;
  mealType: string;
  cuisine: string;
  cookingMethod: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  totalTimeMinutes: number;
  servings: number;
  keyIngredients: string[];
  flavorProfile: string[];
  textureProfile: string[];
  equipment: string[];
  dietaryAttributes: string[];
  seasonality: string[];
  occasion: string[];
  searchThemes: string[];
}

export function extractRuleBasedRecipeDNA(recipe: Recipe): RecipeDNA {
  const titleLower = recipe.title.toLowerCase();
  const allText = `${recipe.title} ${recipe.shortDescription} ${recipe.ingredients.map((i) => i.item).join(' ')}`.toLowerCase();

  // 1. Primary Protein
  let primaryProtein = 'Vegetarian';
  if (allText.includes('chicken') || allText.includes('poultry')) primaryProtein = 'Chicken';
  else if (allText.includes('beef') || allText.includes('steak') || allText.includes('ground beef') || allText.includes('chuck roast')) primaryProtein = 'Beef';
  else if (allText.includes('pork') || allText.includes('sausage') || allText.includes('bacon')) primaryProtein = 'Pork';
  else if (allText.includes('salmon') || allText.includes('shrimp') || allText.includes('fish') || allText.includes('seafood')) primaryProtein = 'Seafood';
  else if (allText.includes('turkey')) primaryProtein = 'Turkey';

  // 2. Cooking Method
  let cookingMethod = 'Stovetop Skillet';
  if (recipe.cookingMethod === 'air-fryer' || allText.includes('air fryer')) cookingMethod = 'Air Fryer';
  else if (recipe.cookingMethod === 'slow-cooker' || allText.includes('slow cooker') || allText.includes('crockpot')) cookingMethod = 'Slow Cooker';
  else if (recipe.cookingMethod === 'one-pot' || allText.includes('one-pot') || allText.includes('one pot')) cookingMethod = 'One-Pot Dutch Oven';
  else if (recipe.cookingMethod === 'baking' || allText.includes('bake') || allText.includes('oven')) cookingMethod = 'Oven Baking';
  else if (recipe.cookingMethod === 'grilling' || allText.includes('grill')) cookingMethod = 'Grill';

  // 3. Flavor Profile
  const flavorProfile: string[] = [];
  if (allText.includes('garlic')) flavorProfile.push('garlicky');
  if (allText.includes('cream') || allText.includes('parmesan') || allText.includes('cheese')) flavorProfile.push('creamy', 'rich');
  if (allText.includes('lemon') || allText.includes('vinegar') || allText.includes('lime')) flavorProfile.push('bright', 'zesty');
  if (allText.includes('honey') || allText.includes('sugar') || allText.includes('maple')) flavorProfile.push('sweet');
  if (allText.includes('paprika') || allText.includes('pepper flakes') || allText.includes('cayenne')) flavorProfile.push('subtly spiced');
  if (flavorProfile.length === 0) flavorProfile.push('savory', 'comforting');

  // 4. Texture Profile
  const textureProfile: string[] = [];
  if (allText.includes('crispy') || allText.includes('crunchy') || allText.includes('wings')) textureProfile.push('crispy');
  if (allText.includes('cream') || allText.includes('sauce') || allText.includes('soup')) textureProfile.push('velvety', 'silky');
  if (allText.includes('tender') || allText.includes('melt-in-your-mouth') || allText.includes('roast')) textureProfile.push('fork-tender');
  if (allText.includes('fluffy') || allText.includes('pancake')) textureProfile.push('fluffy');
  if (textureProfile.length === 0) textureProfile.push('tender', 'satisfying');

  // 5. Key Ingredients
  const keyIngredients = recipe.ingredients
    .slice(0, 5)
    .map((i) => i.item.toLowerCase().replace(/^(organic|fresh|raw|boneless|skinless)\s+/g, ''))
    .filter(Boolean);

  // 6. Equipment
  const equipment: string[] = [];
  if (cookingMethod.includes('Skillet')) equipment.push('Large 12-inch skillet');
  if (cookingMethod.includes('Air Fryer')) equipment.push('Air fryer');
  if (cookingMethod.includes('Slow Cooker')) equipment.push('6-quart Slow cooker');
  if (cookingMethod.includes('One-Pot')) equipment.push('Heavy Dutch oven');
  if (cookingMethod.includes('Baking')) equipment.push('Rimmed baking sheet', 'Parchment paper');
  if (equipment.length === 0) equipment.push('Chef knife', 'Cutting board', 'Skillet');

  // 7. Dietary Attributes
  const dietaryAttributes: string[] = [];
  if (!allText.includes('flour') && !allText.includes('pasta') && !allText.includes('bread') && !allText.includes('gnocchi')) {
    dietaryAttributes.push('Naturally gluten-free friendly');
  }
  if (!allText.includes('sugar') && !allText.includes('pasta') && !allText.includes('potatoes') && !allText.includes('rice')) {
    dietaryAttributes.push('Low carb');
  }

  // 8. Search Themes
  const searchThemes = [
    `easy ${recipe.primaryCategorySlug.replace(/-/g, ' ')} recipes`,
    `${recipe.totalTimeMinutes} minute dinner ideas`,
    `how to make ${recipe.title.toLowerCase()}`,
    `${cookingMethod.toLowerCase()} dinner recipes`,
  ];

  return {
    coreDish: recipe.title.replace(/\b(Easy|Simple|Quick|Best|Classic|Homemade|20-Minute|30-Minute)\b/gi, '').trim() || recipe.title,
    primaryProtein,
    mealType: recipe.mealType ? recipe.mealType.charAt(0).toUpperCase() + recipe.mealType.slice(1) : 'Dinner',
    cuisine: recipe.cuisine || 'American',
    cookingMethod,
    difficulty: recipe.difficulty === 'easy' ? 'Easy' : recipe.difficulty === 'medium' ? 'Medium' : 'Advanced',
    totalTimeMinutes: recipe.totalTimeMinutes,
    servings: recipe.servings,
    keyIngredients,
    flavorProfile,
    textureProfile,
    equipment,
    dietaryAttributes,
    seasonality: ['Year-round weeknight staple'],
    occasion: recipe.totalTimeMinutes <= 30 ? ['Busy weeknights', 'Fast dinners'] : ['Comfort dinner', 'Family gathering'],
    searchThemes,
  };
}

export async function analyzeRecipeDNA(
  recipe: Recipe,
  provider: AIProvider = getAIProvider()
): Promise<RecipeDNA> {
  const fallback = () => extractRuleBasedRecipeDNA(recipe);

  return provider.generateStructuredContent<RecipeDNA>({
    systemPrompt: `You are an expert culinary analyst extracting deep structured Recipe DNA. You must analyze the core culinary components of the given recipe accurately without hallucinating unsupported attributes.`,
    userPrompt: `Extract Recipe DNA for the following recipe:
Title: ${recipe.title}
Category: ${recipe.primaryCategorySlug}
Cooking Method: ${recipe.cookingMethod}
Total Time: ${recipe.totalTimeMinutes} minutes
Servings: ${recipe.servings}
Ingredients:
${recipe.ingredients.map((i) => `- ${i.rawText}`).join('\n')}

Instructions:
${recipe.instructions.map((ins) => `${ins.stepNumber}. ${ins.instructionText}`).join('\n')}

Provide JSON output with keys: coreDish, primaryProtein, mealType, cuisine, cookingMethod, difficulty, totalTimeMinutes, servings, keyIngredients, flavorProfile, textureProfile, equipment, dietaryAttributes, seasonality, occasion, searchThemes.`,
    fallbackGenerator: fallback,
  });
}
