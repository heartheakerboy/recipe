import { RecipeDNA } from '../ai/recipe-dna';
import { Recipe } from '../types/recipe';
import { PinterestContentAngle } from '../types/pinterest';
import { PINTEREST_ANGLES, getSuggestedBoardForRecipe } from './angles';
import { getAIProvider, AIProvider } from '../ai/ai-provider';

export interface GeneratedPinterestCopy {
  angle: PinterestContentAngle;
  title: string;
  description: string;
  keywords: string[];
  overlayText: string;
  subheadline: string;
  boardName: string;
}

const PINTEREST_BANNED_CLAIMS = [
  /\bviral\b/gi,
  /\baward[- ]winning\b/gi,
  /\b5[- ]star\b/gi,
  /\beveryone loves\b/gi,
  /\bthe best ever\b/gi,
  /\bmost popular\b/gi,
];

export function validatePinterestCopy(copy: GeneratedPinterestCopy): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const allText = `${copy.title} ${copy.description} ${copy.overlayText} ${copy.subheadline}`;

  for (const pattern of PINTEREST_BANNED_CLAIMS) {
    const match = pattern.exec(allText);
    if (match) {
      warnings.push(`Unsupported promotional claim detected in Pinterest copy: "${match[0]}".`);
    }
  }

  if (copy.title.length < 20 || copy.title.length > 120) {
    warnings.push(`Pinterest title length (${copy.title.length} chars) is outside recommended range (40–100 chars).`);
  }

  if (copy.overlayText.split(/\s+/).length > 8) {
    warnings.push(`Overlay text is too long (${copy.overlayText.split(/\s+/).length} words). Keep under 7 words for optimal mobile readability.`);
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

export function generateDeterministicPinterestCopy(
  recipe: Recipe,
  dna: RecipeDNA,
  angle: PinterestContentAngle
): GeneratedPinterestCopy {
  const angleDef = PINTEREST_ANGLES[angle] || PINTEREST_ANGLES['quick-dinner'];
  const dish = dna.coreDish;
  const boardName = getSuggestedBoardForRecipe(dna, angle);

  let overlayText = `${angleDef.overlayPrefix} ${dish}`;
  let subheadline = `Cooked in ${dna.cookingMethod.toLowerCase()}`;
  let title = '';
  let description = '';

  if (angle === 'quick-dinner') {
    overlayText = `${dna.totalTimeMinutes}-Minute ${dish}`;
    subheadline = `One-Pan Weeknight Dinner`;
    title = `Easy ${dna.totalTimeMinutes}-Minute ${dish} Recipe`;
    description = `Looking for a fast weeknight dinner? This ${dish.toLowerCase()} comes together in just ${dna.totalTimeMinutes} minutes using everyday ingredients. Juicy, flavorful, and minimal cleanup!`;
  } else if (angle === 'comfort-food') {
    overlayText = `Cozy ${dish}`;
    subheadline = `Rich & Comforting Meal`;
    title = `Cozy Homemade ${dish} for Dinner`;
    description = `Warm up your evening with this delicious ${dish.toLowerCase()}. Rich, savory, and deeply satisfying with tender texture and a velvety sauce. The ultimate comforting family meal!`;
  } else if (angle === 'easy-recipe') {
    overlayText = `Easy ${dish}`;
    subheadline = `Foolproof Step-by-Step`;
    title = `Simple & Easy ${dish} Recipe`;
    description = `An easy, beginner-friendly recipe for ${dish.toLowerCase()}. Clear step-by-step instructions ensure tender, delicious results every single time. Save this simple dinner idea!`;
  } else if (angle === 'family-meal') {
    overlayText = `Family-Favorite ${dish}`;
    subheadline = `Crowd-Pleasing Weeknight Dinner`;
    title = `Crowd-Pleasing ${dish} for Family Dinner`;
    description = `A dependable, crowd-pleasing ${dish.toLowerCase()} that brings everyone to the table. Simple prep with balanced flavors the whole family will appreciate.`;
  } else if (angle === 'meal-prep') {
    overlayText = `Make-Ahead ${dish}`;
    subheadline = `Easy Batch Cook & Reheat`;
    title = `Make-Ahead ${dish} for Meal Prep`;
    description = `Prepare delicious make-ahead meals with this ${dish.toLowerCase()}. Stores wonderfully in the refrigerator for up to 4 days and reheats tender and moist.`;
  } else {
    // Seasonal
    overlayText = `Seasonal ${dish}`;
    subheadline = `Cozy Gathering Recipe`;
    title = `Seasonal ${dish} for Cozy Dinners`;
    description = `Celebrate seasonal cooking with this vibrant ${dish.toLowerCase()}. Perfect for relaxed weekend gatherings, potlucks, and cozy family dinners.`;
  }

  const keywords = [
    dish.toLowerCase(),
    `easy ${dish.toLowerCase()}`,
    `${dna.totalTimeMinutes} minute dinner`,
    `${dna.primaryProtein.toLowerCase()} dinner ideas`,
    'weeknight recipes',
    'easy dinner recipes',
    dna.cookingMethod.toLowerCase(),
    'dinner inspiration',
  ];

  return {
    angle,
    title,
    description,
    keywords,
    overlayText,
    subheadline,
    boardName,
  };
}

export async function generatePinterestCopy(
  recipe: Recipe,
  dna: RecipeDNA,
  angle: PinterestContentAngle,
  provider: AIProvider = getAIProvider()
): Promise<GeneratedPinterestCopy> {
  const fallback = () => generateDeterministicPinterestCopy(recipe, dna, angle);

  const angleDef = PINTEREST_ANGLES[angle];
  const systemPrompt = `You are a high-performing Pinterest strategist and copywriter for FlavorNest.xyz.
Create engaging, search-optimized Pinterest creative copy for a recipe targeting the "${angleDef.name}" angle.

RULES:
1. Title: 40–90 characters. Natural, search-friendly wording. No clickbait or ALL CAPS.
2. Description: 150–250 characters. Include recipe context, ingredients, and a natural reason to click. Avoid keyword stuffing.
3. Overlay Text: 2 to 6 punchy words for the image banner (e.g. "30-Minute Garlic Chicken").
4. Subheadline: 3 to 6 words supporting callout.
5. Keywords: 6 to 10 high-intent Pinterest search phrases.
6. NEVER use fake social proof or banned claims ("viral", "5-star", "world's best", "everyone loves").
7. Output MUST be valid JSON.`;

  const userPrompt = `Recipe: ${recipe.title}
DNA: ${JSON.stringify(dna)}
Angle: ${angle} (${angleDef.tagline})
Total Time: ${recipe.totalTimeMinutes} mins
Ingredients: ${recipe.ingredients.slice(0, 5).map((i) => i.item).join(', ')}

Provide JSON output with keys: angle, title, description, keywords, overlayText, subheadline, boardName.`;

  return provider.generateStructuredContent<GeneratedPinterestCopy>({
    systemPrompt,
    userPrompt,
    fallbackGenerator: fallback,
  });
}
