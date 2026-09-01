import { Recipe, RecipeIngredient, RecipeInstruction } from '../types/recipe';
import { RecipeDNA } from './recipe-dna';
import { RecipeFactsLock } from './recipe-facts';
import { EditorialStyleId, EDITORIAL_STYLE_DEFINITIONS } from './editorial-styles';
import { getAIProvider, AIProvider } from './ai-provider';
import { slugify } from '../utils/slug';

export interface GeneratedEditorialContent {
  title: string;
  slug: string;
  shortDescription: string;
  introduction: string;
  whyYoullLoveThis: string[];
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  chefTips: string[];
  substitutions: Array<{ original: string; substitute: string; note?: string }>;
  servingPairings: string[];
  storageInstructions: string;
  reheatingInstructions: string;
  makeAheadTips?: string;
  faq: Array<{ question: string; answer: string }>;
  seoTitle: string;
  metaDescription: string;
  pinterestMetadata: {
    pinTitle: string;
    pinDescription: string;
    suggestedHeadline: string;
    keywords: string[];
  };
}

export function generateDeterministicEditorialDraft(
  recipe: Recipe,
  dna: RecipeDNA,
  facts: RecipeFactsLock,
  styleId: EditorialStyleId
): GeneratedEditorialContent {
  const style = EDITORIAL_STYLE_DEFINITIONS[styleId] || EDITORIAL_STYLE_DEFINITIONS['quick-easy'];
  const cleanTitle = recipe.title.replace(/\b(Best|Ultimate|World's|Amazing|Viral)\b/gi, '').trim();

  // Natural Introduction (2-3 concise paragraphs, style tailored, no cliché openings)
  let introParagraphs: string[] = [];
  if (styleId === 'quick-easy') {
    introParagraphs = [
      `When busy weeknights demand a fast, satisfying dinner without endless cleanup, ${cleanTitle.toLowerCase()} delivers big flavor in just ${facts.totalTimeMinutes} minutes.`,
      `Made using ${facts.ingredients.length} straightforward ingredients and cooked in a single ${dna.cookingMethod.toLowerCase()}, this recipe keeps hands-on effort to a minimum while ensuring ${dna.textureProfile[0] || 'tender'} results.`,
      `Serve it alongside your favorite easy sides for a complete weeknight meal that comes together with zero stress.`,
    ];
  } else if (styleId === 'comfort-food') {
    introParagraphs = [
      `Nothing warms the kitchen quite like ${cleanTitle.toLowerCase()}, simmered with aromatic garlic and savory herbs until deeply flavorful and satisfying.`,
      `This cozy recipe combines ${facts.ingredients.slice(0, 3).map((i) => i.item.toLowerCase()).join(', ')} to create a dish that is both comforting and deeply rewarding for relaxed dinners.`,
      `Pair it with warm crusty bread or fluffy mashed potatoes to soak up every drop of delicious sauce.`,
    ];
  } else if (styleId === 'budget-friendly') {
    introParagraphs = [
      `Built around accessible pantry staples and everyday ingredients, ${cleanTitle.toLowerCase()} proves that delicious home-cooked dinners don't require expensive specialty items.`,
      `With simple preparation in ${dna.cookingMethod.toLowerCase()}, this reliable recipe makes the most of ${facts.ingredients.slice(0, 3).map((i) => i.item.toLowerCase()).join(', ')}.`,
      `It's an economical, flavor-first dinner you can return to whenever you want a dependable meal on a budget.`,
    ];
  } else if (styleId === 'beginner-friendly') {
    introParagraphs = [
      `If you're looking for a foolproof recipe with clear milestones, ${cleanTitle.toLowerCase()} is designed for easy, stress-free cooking from start to finish.`,
      `Every step is broken down into simple visual checkpoints, so you'll know exactly when ingredients are cooked to perfection without guessing.`,
      `In just ${facts.totalTimeMinutes} minutes, you'll have a wonderful homemade dinner on the table with total confidence.`,
    ];
  } else {
    introParagraphs = [
      `A delicious, family-friendly dinner that brings everyone to the table, ${cleanTitle.toLowerCase()} combines tender texture with savory richness in every bite.`,
      `Prepared in about ${facts.totalTimeMinutes} minutes with everyday ingredients, this recipe offers reliable weeknight appeal and easy serving for the whole family.`,
    ];
  }

  // Why you'll love it (Factual bullet points only)
  const whyYoullLoveThis = [
    `Ready in about ${facts.totalTimeMinutes} minutes from start to finish`,
    `Cooked in a single ${dna.cookingMethod.toLowerCase()} for easy cleanup`,
    `Made with ${facts.ingredients.length} everyday, accessible ingredients`,
    `Delivers balanced ${dna.flavorProfile.join(' and ')} flavors in every portion`,
  ];

  // Chef tips
  const chefTips = [
    `Pat protein completely dry with paper towels before cooking to achieve an even golden sear.`,
    `Allow the dish to rest for 2–3 minutes after removing from heat so juices redistribute evenly.`,
    `Garnish with fresh chopped herbs right before serving for a pop of color and fresh aroma.`,
  ];

  // Safe substitutions
  const substitutions: Array<{ original: string; substitute: string; note?: string }> = [];
  const dairyIng = facts.ingredients.find((i) => i.rawText.toLowerCase().includes('heavy cream') || i.rawText.toLowerCase().includes('milk'));
  if (dairyIng) {
    substitutions.push({
      original: dairyIng.item,
      substitute: 'Full-fat canned coconut milk or unflavored oat milk',
      note: 'Provides a similar creamy body for dairy-free diets.',
    });
  }

  const garlicIng = facts.ingredients.find((i) => i.rawText.toLowerCase().includes('garlic'));
  if (garlicIng) {
    substitutions.push({
      original: 'Fresh garlic cloves',
      substitute: '1/2 tsp garlic powder per clove',
      note: 'A convenient pantry swap when fresh cloves are not on hand.',
    });
  }

  // Serving pairings
  const servingPairings = [
    'Fluffy steamed jasmine rice or buttered egg noodles',
    'Crisp green salad with a light lemon vinaigrette',
    'Roasted seasonal vegetables or steamed broccoli',
    'Warm garlic bread for dipping',
  ];

  // Storage & reheating
  const storageInstructions = `Store leftover ${cleanTitle.toLowerCase()} in an airtight container in the refrigerator for up to 3–4 days.`;
  const reheatingInstructions = `Reheat gently in a skillet over medium-low heat with a splash of broth or water to keep it moist and tender, or microwave in 45-second bursts until steaming hot.`;
  const makeAheadTips = `You can measure and prep all ingredients up to 24 hours in advance and store refrigerated in separate containers for fast weeknight assembly.`;

  // FAQs
  const faq = [
    {
      question: `How long will this ${cleanTitle.toLowerCase()} keep in the fridge?`,
      answer: `Stored in a sealed container, leftovers will remain fresh and flavorful for up to 3 to 4 days in the refrigerator.`,
    },
    {
      question: `Can I double this recipe for a crowd?`,
      answer: `Yes! You can double all ingredient amounts. If doubling, use a larger pan or cook in batches to avoid crowding the cooking vessel.`,
    },
    {
      question: `What are the best side dishes to serve with this?`,
      answer: `This pairs wonderfully with steamed rice, buttery egg noodles, roasted green vegetables, or a crisp side salad.`,
    },
  ];

  // SEO & Pinterest metadata
  const seoTitle = `${cleanTitle} (${facts.totalTimeMinutes}-Minute Recipe) | FlavorNest`;
  const metaDescription = `An easy, flavorful ${cleanTitle.toLowerCase()} recipe ready in ${facts.totalTimeMinutes} minutes. Made with simple ingredients in ${dna.cookingMethod.toLowerCase()}.`;

  return {
    title: cleanTitle,
    slug: slugify(cleanTitle),
    shortDescription: metaDescription,
    introduction: introParagraphs.join('\n\n'),
    whyYoullLoveThis,
    ingredients: recipe.ingredients, // strictly preserved
    instructions: recipe.instructions, // strictly preserved
    chefTips,
    substitutions,
    servingPairings,
    storageInstructions,
    reheatingInstructions,
    makeAheadTips,
    faq,
    seoTitle,
    metaDescription,
    pinterestMetadata: {
      pinTitle: `${cleanTitle} (${facts.totalTimeMinutes} Mins)`,
      pinDescription: `Easy ${cleanTitle.toLowerCase()} ready in ${facts.totalTimeMinutes} minutes! The perfect weeknight dinner made with simple ingredients.`,
      suggestedHeadline: `${facts.totalTimeMinutes} MINUTE ${cleanTitle.toUpperCase()}`,
      keywords: [
        cleanTitle.toLowerCase(),
        `${facts.totalTimeMinutes} minute recipes`,
        'easy dinner recipes',
        'weeknight dinner',
        dna.cookingMethod.toLowerCase(),
      ],
    },
  };
}

export async function generateEditorialContent(
  recipe: Recipe,
  dna: RecipeDNA,
  facts: RecipeFactsLock,
  styleId: EditorialStyleId,
  provider: AIProvider = getAIProvider()
): Promise<GeneratedEditorialContent> {
  const style = EDITORIAL_STYLE_DEFINITIONS[styleId] || EDITORIAL_STYLE_DEFINITIONS['quick-easy'];
  const fallback = () => generateDeterministicEditorialDraft(recipe, dna, facts, styleId);

  const systemPrompt = `You are a world-class food editor at FlavorNest.xyz.
Your task is to write an original, high-quality recipe article using the "${style.name}" editorial voice.

RULES:
1. Preserve ALL ingredient facts, quantities, and cooking instructions exactly. Never hallucinate or alter cooking times or ingredients.
2. Tone: ${style.toneVoice}
3. Focus: ${style.focus.join(', ')}
4. Introduction: 2 to 3 natural paragraphs. Answer what it is, why it's great, when to make it. NEVER start with "This delicious recipe...".
5. Why You'll Love It: 3 to 5 concise, factual bullets.
6. Tips: 3 to 4 useful culinary technique and timing tips.
7. Substitutions: 1 to 3 logically valid pantry swaps. If none exist, return an empty array.
8. Output MUST be valid JSON.`;

  const userPrompt = `Generate FlavorNest editorial content for:
Title: ${recipe.title}
DNA: ${JSON.stringify(dna)}
Facts:
- Total Time: ${facts.totalTimeMinutes} mins (Prep: ${facts.prepTimeMinutes}m, Cook: ${facts.cookTimeMinutes}m)
- Servings: ${facts.servings}
- Ingredients: ${facts.ingredients.map((i) => i.rawText).join('; ')}
- Steps: ${facts.instructions.map((i) => `${i.stepNumber}. ${i.text}`).join(' ')}

Required JSON fields:
title, slug, shortDescription, introduction, whyYoullLoveThis, chefTips, substitutions, servingPairings, storageInstructions, reheatingInstructions, makeAheadTips, faq, seoTitle, metaDescription, pinterestMetadata.`;

  return provider.generateStructuredContent<GeneratedEditorialContent>({
    systemPrompt,
    userPrompt,
    fallbackGenerator: fallback,
  });
}
