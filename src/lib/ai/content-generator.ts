import { Recipe, RecipeIngredient, RecipeInstruction } from '../types/recipe';
import { RecipeDNA } from './recipe-dna';
import { RecipeFactsLock } from './recipe-facts';
import { EditorialStyleId, EDITORIAL_STYLE_DEFINITIONS } from './editorial-styles';
import { getAIProvider, AIProvider } from './ai-provider';
import { slugify } from '../utils/slug';
import { sanitizeCookingTimes } from '../importer/time-parser';

export interface GeneratedEditorialContent {
  title: string;
  slug: string;
  shortDescription: string;
  introduction: string;
  whyYoullLoveThis: string[];
  scienceWhyItWorks?: string[];
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  totalTimeMinutes?: number;
  chefTips: string[];
  variations?: Array<{ name: string; description: string }>;
  substitutions: Array<{ original: string; substitute: string; note?: string }>;
  servingPairings: string[];
  storageInstructions: string;
  reheatingInstructions: string;
  makeAheadTips?: string;
  equipmentNeeded?: string[];
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
  const cleanTitle = recipe.title.replace(/\b(Best|Ultimate|World's|Amazing|Viral|Easy)\b/gi, '').trim();

  // Sanitize Times (no crazy 27-hour numbers)
  const sanitized = sanitizeCookingTimes(
    facts.prepTimeMinutes,
    facts.cookTimeMinutes,
    facts.totalTimeMinutes
  );

  // Natural Introduction (3 comprehensive paragraphs with culinary context)
  let introParagraphs: string[] = [];
  if (styleId === 'quick-easy') {
    introParagraphs = [
      `When busy weeknights demand a fast, satisfying dinner without endless cleanup, ${cleanTitle.toLowerCase()} delivers big flavor in just ${sanitized.totalTimeMinutes} minutes.`,
      `Made using ${facts.ingredients.length} straightforward ingredients and cooked with ${dna.cookingMethod.toLowerCase()}, this recipe keeps hands-on effort to a minimum while ensuring ${dna.textureProfile[0] || 'tender'} results.`,
      `Whether you are feeding a hungry family or preparing wholesome meals for the week ahead, this dish balances simplicity with restaurant-worthy satisfaction.`,
    ];
  } else if (styleId === 'comfort-food') {
    introParagraphs = [
      `Nothing warms the kitchen quite like ${cleanTitle.toLowerCase()}, simmered with aromatic garlic, savory seasonings, and rich pan juices until deeply flavorful.`,
      `This cozy recipe combines ${facts.ingredients.slice(0, 3).map((i) => i.item.toLowerCase()).join(', ')} to create a comforting meal that feels special enough for Sunday dinners yet approachable for any night.`,
      `Pair it with warm crusty bread or fluffy mashed potatoes to soak up every drop of delicious sauce.`,
    ];
  } else if (styleId === 'budget-friendly') {
    introParagraphs = [
      `Built around accessible pantry staples and everyday ingredients, ${cleanTitle.toLowerCase()} proves that delicious home-cooked dinners don't require expensive specialty items.`,
      `With simple preparation in ${dna.cookingMethod.toLowerCase()}, this reliable recipe maximizes flavor from ${facts.ingredients.slice(0, 3).map((i) => i.item.toLowerCase()).join(', ')}.`,
      `It's an economical, flavor-first dinner you can return to whenever you want a dependable meal on a budget.`,
    ];
  } else if (styleId === 'beginner-friendly') {
    introParagraphs = [
      `If you're looking for a foolproof recipe with clear milestones, ${cleanTitle.toLowerCase()} is designed for easy, stress-free cooking from start to finish.`,
      `Every step is broken down into simple sensory checkpoints—from listening for that gentle pan sizzle to watching for golden-brown browning—so you cook with complete confidence.`,
      `In just ${sanitized.totalTimeMinutes} minutes, you'll have a wonderful homemade dinner on the table without second-guessing a single step.`,
    ];
  } else {
    introParagraphs = [
      `A delicious, family-friendly dinner that brings everyone to the table, ${cleanTitle.toLowerCase()} combines tender texture with savory richness in every bite.`,
      `Prepared in about ${sanitized.totalTimeMinutes} minutes with everyday ingredients, this recipe offers reliable weeknight appeal and easy serving for the whole family.`,
    ];
  }

  // Why you'll love it
  const whyYoullLoveThis = [
    `Lightning Fast: Table-ready in just ${sanitized.totalTimeMinutes} minutes from start to finish`,
    `Minimal Cleanup: Efficient ${dna.cookingMethod.toLowerCase()} workflow leaves fewer dishes in the sink`,
    `Accessible Ingredients: Made with ${facts.ingredients.length} approachable items found in any grocery store`,
    `Balanced Flavor Profile: Delivers harmony between ${dna.flavorProfile.join(', ')} notes with wonderful ${dna.textureProfile[0] || 'tender'} texture`,
  ];

  // The Culinary Science: Why This Recipe Works
  const scienceWhyItWorks = [
    `High-Heat Searing: Starting in a hot cooking surface triggers the Maillard reaction, developing a golden crust that locks in natural moisture and savory fond.`,
    `Aromatics Layering: Sautéing aromatics in fat releases fat-soluble flavor compounds that distribute seasoning evenly across every bite.`,
    `Carryover Resting: Letting the dish rest for a couple minutes before slicing allows internal juices to redistribute evenly rather than spilling onto the board.`,
  ];

  // Actionable Chef Pro Tips
  const chefTips = [
    `Pat protein completely dry with paper towels before cooking to achieve an even golden sear instead of steaming.`,
    `Avoid overcrowding the pan—cook in batches if needed so moisture can evaporate freely and develop deep caramelization.`,
    `Deglaze with a splash of broth or wine to scrape up the delicious browned bits (fond) stuck to the bottom of the skillet.`,
    `Finish with fresh chopped herbs or a squeeze of fresh lemon right before serving for a vibrant pop of acidity and color.`,
  ];

  // Flavor Variations & Customizations
  const variations = [
    {
      name: 'Spicy Kick',
      description: 'Add 1/2 teaspoon of crushed red pepper flakes or a dash of cayenne pepper when cooking aromatics for subtle, warming heat.',
    },
    {
      name: 'Herb Garden Twist',
      description: 'Stir in fresh chopped rosemary, thyme, or basil during the final two minutes of cooking for aromatic herbal richness.',
    },
    {
      name: 'Low-Carb & Keto Friendly',
      description: 'Serve over riced cauliflower or zucchini noodles with an extra drizzle of good olive oil.',
    },
  ];

  // Safe substitutions
  const substitutions: Array<{ original: string; substitute: string; note?: string }> = [];
  const dairyIng = facts.ingredients.find((i) => i.rawText.toLowerCase().includes('heavy cream') || i.rawText.toLowerCase().includes('milk') || i.rawText.toLowerCase().includes('butter'));
  if (dairyIng) {
    substitutions.push({
      original: dairyIng.item,
      substitute: 'Full-fat canned coconut milk or vegan butter',
      note: 'Maintains rich, velvety body while keeping the dish completely dairy-free.',
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

  const brothIng = facts.ingredients.find((i) => i.rawText.toLowerCase().includes('chicken broth') || i.rawText.toLowerCase().includes('beef broth'));
  if (brothIng) {
    substitutions.push({
      original: brothIng.item,
      substitute: 'Vegetable broth or warm water with a pinch of bouillon',
      note: 'Works seamlessly without altering cooking liquid ratios.',
    });
  }

  // Serving pairings
  const servingPairings = [
    'Fluffy steamed jasmine rice or buttered egg noodles to catch all the juices',
    'Crisp green salad with a bright lemon-shallot vinaigrette to cut through richness',
    'Roasted garlic green beans, asparagus, or steamed broccoli',
    'Warm crusty sourdough or garlic bread for dipping',
  ];

  // Equipment Needed
  const equipmentNeeded = [
    'Large heavy-bottomed skillet or cast iron pan',
    'Sharp chef knife and cutting board',
    'Instant-read meat thermometer (for precise doneness)',
    'Tongs or heatproof spatula',
  ];

  // Storage & reheating
  const storageInstructions = `Store leftover ${cleanTitle.toLowerCase()} in an airtight glass container in the refrigerator for up to 4 days. Let cool completely before sealing. For freezing, store in a freezer-safe container for up to 3 months.`;
  const reheatingInstructions = `For the juiciest texture, reheat gently in a covered skillet over medium-low heat with a splash of broth or water for 3–5 minutes. Alternatively, microwave in 45-second intervals at 80% power until steaming hot throughout.`;
  const makeAheadTips = `You can chop all aromatics, measure seasonings, and prep ingredients up to 24 hours in advance. Store in airtight containers in the fridge for a 10-minute dinner assembly.`;

  // FAQs
  const faq = [
    {
      question: `How do I store and reheat leftovers?`,
      answer: `Keep leftovers in an airtight container refrigerated for up to 4 days. Reheat gently in a skillet with 1–2 tablespoons of water or broth over medium-low heat to maintain moisture.`,
    },
    {
      question: `Can I make this recipe ahead of time?`,
      answer: `Yes! You can prep and chop all ingredients up to 24 hours in advance. The cooked dish also keeps well for meal prep lunches throughout the week.`,
    },
    {
      question: `Can I double this recipe for meal prep or a crowd?`,
      answer: `Absolutely. Double all ingredient quantities, but make sure to use a larger pan or sear in two separate batches to prevent pan crowding and ensure proper browning.`,
    },
    {
      question: `What are the best side dishes to serve alongside?`,
      answer: `Steamed jasmine rice, roasted potatoes, egg noodles, garlic bread, or a crisp Caesar salad pair exceptionally well with the flavors in this dish.`,
    },
  ];

  // SEO & Pinterest metadata
  const seoTitle = `${cleanTitle} (${sanitized.totalTimeMinutes}-Minute Recipe) | FlavorNest`;
  const metaDescription = `An easy, flavorful ${cleanTitle.toLowerCase()} recipe ready in ${sanitized.totalTimeMinutes} minutes. Made with simple ingredients in ${dna.cookingMethod.toLowerCase()}.`;

  return {
    title: cleanTitle,
    slug: slugify(cleanTitle),
    shortDescription: metaDescription,
    introduction: introParagraphs.join('\n\n'),
    whyYoullLoveThis,
    scienceWhyItWorks,
    ingredients: recipe.ingredients, // strictly preserved facts
    instructions: recipe.instructions, // fallback instructions
    prepTimeMinutes: sanitized.prepTimeMinutes,
    cookTimeMinutes: sanitized.cookTimeMinutes,
    totalTimeMinutes: sanitized.totalTimeMinutes,
    chefTips,
    variations,
    substitutions,
    servingPairings,
    storageInstructions,
    reheatingInstructions,
    makeAheadTips,
    equipmentNeeded,
    faq,
    seoTitle,
    metaDescription,
    pinterestMetadata: {
      pinTitle: `${cleanTitle} (${sanitized.totalTimeMinutes} Mins)`,
      pinDescription: `Easy ${cleanTitle.toLowerCase()} ready in ${sanitized.totalTimeMinutes} minutes! The perfect weeknight dinner made with simple ingredients.`,
      suggestedHeadline: `${sanitized.totalTimeMinutes} MINUTE ${cleanTitle.toUpperCase()}`,
      keywords: [
        cleanTitle.toLowerCase(),
        `${sanitized.totalTimeMinutes} minute recipes`,
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
  const base = fallback();

  const systemPrompt = `You are the Lead Culinary Director & Senior Food Editor at FlavorNest.xyz.
Your mission is to completely REWRITE, TRANSFORM, and ELEVATE imported recipe drafts into 100% original, authoritative, culinary-school-grade recipe articles that pass all plagiarism checks and rank #1 on Google.

CRITICAL ANTI-PLAGIARISM & EDITORIAL RULES:
1. 100% ORIGINAL REWRITING: Do NOT copy-paste sentences from the source. Completely rephrase and elevate the Title, Introduction, Step-by-Step Instructions, and Tips in our signature "${style.name}" voice (${style.toneVoice}).
2. FACT LOCK: Keep exact ingredient items and quantities true to culinary science. Never hallucinate random missing ingredients.
3. REWRITE EVERY INSTRUCTION STEP: Rewrite all instructions into clear, professional, active-voice cooking steps with descriptive titles (e.g. "Step 1: Prep the Aromatics", "Step 2: Sear to Golden Perfection"). Include sensory cues (smell, sizzle, color).
4. REALISTIC COOKING TIMES: Analyze the dish and return realistic prepTimeMinutes, cookTimeMinutes, and totalTimeMinutes (e.g., a simple chicken skillet should be 10m prep, 20m cook = 30m total, NOT 27 hours!).
5. NO CLICHÉ AI FLUFF: Never use lazy phrases like "In this fast-paced world", "Look no further", "Tantalize your tastebuds", or "This culinary delight".
6. THE SCIENCE OF WHY IT WORKS: Include 3 to 4 scientific explanations of cooking techniques (e.g. Maillard browning, emulsion stability, resting meat, acid balance).
7. SENSORY CHEF TIPS: Provide 4 actionable, practical tips focusing on sensory cues.
8. VARIATIONS & SUBS: Provide 3 creative, tested variations and 2 to 3 smart pantry substitutions with ratio advice.
9. OUTPUT FORMAT: Return strictly valid JSON conforming to the requested schema.`;

  const userPrompt = `Completely rewrite and elevate this recipe with 100% original, plagiarism-free editorial prose:
Original Title: ${recipe.title}
Cuisine / Style: ${dna.cuisine || 'American'} / ${style.name}
Method: ${dna.cookingMethod}
Source Ingredients: ${(facts.ingredients || []).map((i) => i.rawText || i.item).join('; ')}
Source Instructions: ${(facts.instructions || []).map((i) => `${i.stepNumber}. ${i.text}`).join(' ')}
Source Times: Prep: ${facts.prepTimeMinutes}m, Cook: ${facts.cookTimeMinutes}m, Total: ${facts.totalTimeMinutes}m

Required JSON Schema:
{
  "title": "Fresh, original, appetizing recipe title (e.g. Garlic Butter Chicken Skillet)",
  "slug": "url-slug-matching-title",
  "shortDescription": "Compelling 1-2 sentence search snippet (150-160 chars)",
  "introduction": "3-4 rich, original paragraphs explaining the dish, sensory texture, and weeknight appeal",
  "prepTimeMinutes": 15,
  "cookTimeMinutes": 20,
  "totalTimeMinutes": 35,
  "whyYoullLoveThis": ["3-5 clear value propositions"],
  "scienceWhyItWorks": ["3-4 culinary science reasons why this recipe succeeds"],
  "instructions": [
    {
      "stepNumber": 1,
      "title": "Step Title (e.g. Prep & Season)",
      "instructionText": "Completely rewritten, clear, active-voice cooking instruction with sensory cues.",
      "tip": "Specific chef tip for this step"
    }
  ],
  "chefTips": ["4 actionable professional tips with sensory cues"],
  "variations": [
    { "name": "Variation Name", "description": "Exact adjustment instructions" }
  ],
  "substitutions": [
    { "original": "Ingredient", "substitute": "Alternative", "note": "Flavor/texture impact" }
  ],
  "servingPairings": ["4 complementary side dishes, carbs, and beverages"],
  "storageInstructions": "Exact fridge/freezer storage guidelines and shelf-life",
  "reheatingInstructions": "Detailed skillet vs oven vs microwave reheating methods",
  "makeAheadTips": "Advance prep advice for busy cooks",
  "equipmentNeeded": ["Essential pans, knives, and tools"],
  "faq": [
    { "question": "Real user question?", "answer": "Clear, helpful expert answer." }
  ],
  "seoTitle": "High CTR SEO Title | FlavorNest",
  "metaDescription": "Search meta description with keywords",
  "pinterestMetadata": {
    "pinTitle": "Catchy Pin Title",
    "pinDescription": "Pinterest-optimized pin copy",
    "suggestedHeadline": "BOLD PIN OVERLAY TEXT",
    "keywords": ["tag1", "tag2", "tag3"]
  }
}`;

  try {
    const raw = await provider.generateStructuredContent<Partial<GeneratedEditorialContent>>({
      systemPrompt,
      userPrompt,
      fallbackGenerator: fallback,
    });

    // Merge rewritten instructions while preserving step images from original import
    let mergedInstructions: RecipeInstruction[] = recipe.instructions;
    if (Array.isArray(raw?.instructions) && raw.instructions.length > 0) {
      mergedInstructions = raw.instructions.map((step, idx) => {
        const originalStep = recipe.instructions[idx];
        return {
          stepNumber: step.stepNumber || idx + 1,
          title: step.title || originalStep?.title,
          instructionText: step.instructionText || originalStep?.instructionText || '',
          tip: step.tip || originalStep?.tip,
          imageUrl: originalStep?.imageUrl,
          imageAlt: originalStep?.imageAlt || step.title || `Step ${idx + 1}`,
        };
      });
    }

    // Sanitize AI times
    const sanitizedTimes = sanitizeCookingTimes(
      raw?.prepTimeMinutes ?? base.prepTimeMinutes ?? 15,
      raw?.cookTimeMinutes ?? base.cookTimeMinutes ?? 20,
      raw?.totalTimeMinutes ?? base.totalTimeMinutes ?? 35
    );

    return {
      ...base,
      ...raw,
      title: raw?.title || base.title,
      slug: slugify(raw?.title || base.title),
      shortDescription: raw?.shortDescription || base.shortDescription,
      introduction: raw?.introduction || base.introduction,
      ingredients: recipe.ingredients, // strictly preserved facts
      instructions: mergedInstructions, // completely rewritten fresh instructions
      prepTimeMinutes: sanitizedTimes.prepTimeMinutes,
      cookTimeMinutes: sanitizedTimes.cookTimeMinutes,
      totalTimeMinutes: sanitizedTimes.totalTimeMinutes,
      whyYoullLoveThis: Array.isArray(raw?.whyYoullLoveThis) && raw.whyYoullLoveThis.length > 0 ? raw.whyYoullLoveThis : base.whyYoullLoveThis,
      scienceWhyItWorks: Array.isArray(raw?.scienceWhyItWorks) && raw.scienceWhyItWorks.length > 0 ? raw.scienceWhyItWorks : base.scienceWhyItWorks,
      chefTips: Array.isArray(raw?.chefTips) && raw.chefTips.length > 0 ? raw.chefTips : base.chefTips,
      variations: Array.isArray(raw?.variations) && raw.variations.length > 0 ? raw.variations : base.variations,
      substitutions: Array.isArray(raw?.substitutions) ? raw.substitutions : base.substitutions,
      servingPairings: Array.isArray(raw?.servingPairings) && raw.servingPairings.length > 0 ? raw.servingPairings : base.servingPairings,
      equipmentNeeded: Array.isArray(raw?.equipmentNeeded) && raw.equipmentNeeded.length > 0 ? raw.equipmentNeeded : base.equipmentNeeded,
      faq: Array.isArray(raw?.faq) && raw.faq.length > 0 ? raw.faq : base.faq,
      pinterestMetadata: raw?.pinterestMetadata || base.pinterestMetadata,
    };
  } catch (err) {
    console.warn('AI editorial generation failed, using rich deterministic fallback:', err);
    return fallback();
  }
}
