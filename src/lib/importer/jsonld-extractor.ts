import { parseIsoDurationToMinutes } from './time-parser';
import { normalizeIngredientList } from './ingredient-normalizer';
import type { RecipeIngredient, RecipeInstruction } from '../types/recipe';

export interface ExtractedJsonLdRecipe {
  title?: string;
  description?: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  totalTimeMinutes?: number;
  servings?: number;
  cuisine?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  imageAlt?: string;
  authorName?: string;
  datePublished?: string;
  nutrition?: {
    calories?: number;
    proteinGrams?: number;
    carbsGrams?: number;
    fatGrams?: number;
    sodiumMg?: number;
  };
  rawJsonLd?: any;
}

function findRecipeInObject(node: any): any | null {
  if (!node || typeof node !== 'object') return null;

  // Direct Recipe
  const type = node['@type'];
  if (
    type === 'Recipe' ||
    (Array.isArray(type) && type.includes('Recipe')) ||
    (typeof type === 'string' && type.toLowerCase() === 'recipe')
  ) {
    return node;
  }

  // @graph array
  if (Array.isArray(node['@graph'])) {
    for (const item of node['@graph']) {
      const found = findRecipeInObject(item);
      if (found) return found;
    }
  }

  // Array of top-level items
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findRecipeInObject(item);
      if (found) return found;
    }
  }

  // Nested in mainEntity or about
  if (node.mainEntity) {
    const found = findRecipeInObject(node.mainEntity);
    if (found) return found;
  }

  return null;
}

export function extractInstructionsFromJsonLd(rawInstructions: any): RecipeInstruction[] {
  if (!rawInstructions) return [];

  const steps: RecipeInstruction[] = [];

  const addStep = (text: string, title?: string, tip?: string) => {
    const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
    if (cleanText.length > 0) {
      steps.push({
        stepNumber: steps.length + 1,
        title: title ? title.replace(/<[^>]*>?/gm, '').trim() : undefined,
        instructionText: cleanText,
        tip,
      });
    }
  };

  if (typeof rawInstructions === 'string') {
    // String with line breaks or numbered lists
    const lines = rawInstructions.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const cleaned = line.replace(/^\d+[\.\)]\s*/, '');
      addStep(cleaned);
    }
    return steps;
  }

  if (Array.isArray(rawInstructions)) {
    for (const item of rawInstructions) {
      if (typeof item === 'string') {
        addStep(item.replace(/^\d+[\.\)]\s*/, ''));
      } else if (item && typeof item === 'object') {
        const itemType = item['@type'];

        // HowToStep
        if (itemType === 'HowToStep' || item.text) {
          addStep(item.text || item.itemListElement || '', item.name);
        }
        // HowToSection (nested list of steps)
        else if (itemType === 'HowToSection' && Array.isArray(item.itemListElement)) {
          const sectionTitle = item.name;
          for (const subItem of item.itemListElement) {
            if (typeof subItem === 'string') {
              addStep(subItem, sectionTitle);
            } else if (subItem && typeof subItem === 'object') {
              addStep(subItem.text || '', subItem.name || sectionTitle);
            }
          }
        }
      }
    }
  }

  return steps;
}

export function extractImageFromJsonLd(rawImage: any): string | undefined {
  if (!rawImage) return undefined;
  if (typeof rawImage === 'string') return rawImage;
  if (Array.isArray(rawImage) && rawImage.length > 0) {
    return extractImageFromJsonLd(rawImage[0]);
  }
  if (typeof rawImage === 'object') {
    return rawImage.url || rawImage.contentUrl || rawImage['@id'];
  }
  return undefined;
}

export function extractServingsFromJsonLd(rawYield: any): number | undefined {
  if (!rawYield) return undefined;
  if (typeof rawYield === 'number') return rawYield;
  if (Array.isArray(rawYield)) return extractServingsFromJsonLd(rawYield[0]);

  if (typeof rawYield === 'string') {
    const match = rawYield.match(/(\d+)/);
    if (match) return parseInt(match[1], 10);
  }
  return undefined;
}

export function extractRecipeFromJsonLd(html: string): ExtractedJsonLdRecipe | null {
  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = jsonLdRegex.exec(html)) !== null) {
    const rawContent = match[1]?.trim();
    if (!rawContent) continue;

    try {
      const parsed = JSON.parse(rawContent);
      const recipeNode = findRecipeInObject(parsed);

      if (recipeNode) {
        // Extract Ingredients
        const rawIngredients = Array.isArray(recipeNode.recipeIngredient)
          ? recipeNode.recipeIngredient
          : Array.isArray(recipeNode.ingredients)
          ? recipeNode.ingredients
          : [];
        const ingredients = normalizeIngredientList(rawIngredients.map((i: any) => String(i)));

        // Extract Instructions
        const instructions = extractInstructionsFromJsonLd(
          recipeNode.recipeInstructions || recipeNode.instructions
        );

        // Extract Times
        const prepTimeMinutes = parseIsoDurationToMinutes(recipeNode.prepTime);
        const cookTimeMinutes = parseIsoDurationToMinutes(recipeNode.cookTime);
        let totalTimeMinutes = parseIsoDurationToMinutes(recipeNode.totalTime);
        if (!totalTimeMinutes && (prepTimeMinutes || cookTimeMinutes)) {
          totalTimeMinutes = (prepTimeMinutes || 0) + (cookTimeMinutes || 0);
        }

        // Extract Servings
        const servings = extractServingsFromJsonLd(recipeNode.recipeYield || recipeNode.yield);

        // Extract Image
        const imageUrl = extractImageFromJsonLd(recipeNode.image);

        // Extract Category & Cuisine
        const category = Array.isArray(recipeNode.recipeCategory)
          ? recipeNode.recipeCategory[0]
          : recipeNode.recipeCategory;
        const cuisine = Array.isArray(recipeNode.recipeCuisine)
          ? recipeNode.recipeCuisine[0]
          : recipeNode.recipeCuisine;

        // Extract Keywords / Tags
        let tags: string[] = [];
        if (typeof recipeNode.keywords === 'string') {
          tags = recipeNode.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
        } else if (Array.isArray(recipeNode.keywords)) {
          tags = recipeNode.keywords.map((k: any) => String(k).trim()).filter(Boolean);
        }

        // Nutrition
        const rawNutr = recipeNode.nutrition;
        let nutrition;
        if (rawNutr && typeof rawNutr === 'object') {
          nutrition = {
            calories: rawNutr.calories ? parseInt(String(rawNutr.calories).replace(/\D/g, ''), 10) : undefined,
            proteinGrams: rawNutr.proteinContent ? parseInt(String(rawNutr.proteinContent).replace(/\D/g, ''), 10) : undefined,
            carbsGrams: rawNutr.carbohydrateContent ? parseInt(String(rawNutr.carbohydrateContent).replace(/\D/g, ''), 10) : undefined,
            fatGrams: rawNutr.fatContent ? parseInt(String(rawNutr.fatContent).replace(/\D/g, ''), 10) : undefined,
            sodiumMg: rawNutr.sodiumContent ? parseInt(String(rawNutr.sodiumContent).replace(/\D/g, ''), 10) : undefined,
          };
        }

        return {
          title: recipeNode.name || recipeNode.headline,
          description: recipeNode.description,
          ingredients,
          instructions,
          prepTimeMinutes: prepTimeMinutes || undefined,
          cookTimeMinutes: cookTimeMinutes || undefined,
          totalTimeMinutes: totalTimeMinutes || undefined,
          servings: servings || undefined,
          cuisine: typeof cuisine === 'string' ? cuisine : undefined,
          category: typeof category === 'string' ? category : undefined,
          tags,
          imageUrl,
          imageAlt: recipeNode.name,
          authorName: typeof recipeNode.author === 'string' ? recipeNode.author : recipeNode.author?.name,
          datePublished: recipeNode.datePublished,
          nutrition,
          rawJsonLd: recipeNode,
        };
      }
    } catch {
      // Ignore malformed JSON-LD scripts and continue searching next script tag
      continue;
    }
  }

  return null;
}
