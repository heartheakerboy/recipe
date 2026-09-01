import { RecipeDNA } from './recipe-dna';

export type EditorialStyleId =
  | 'quick-easy'
  | 'comfort-food'
  | 'budget-friendly'
  | 'family-favorite'
  | 'beginner-friendly'
  | 'meal-prep'
  | 'seasonal-occasion';

export interface EditorialStyleDefinition {
  id: EditorialStyleId;
  name: string;
  tagline: string;
  focus: string[];
  toneVoice: string;
  proseGuidelines: string[];
  rules: string[];
}

export const EDITORIAL_STYLE_DEFINITIONS: Record<EditorialStyleId, EditorialStyleDefinition> = {
  'quick-easy': {
    id: 'quick-easy',
    name: 'Quick & Easy',
    tagline: 'Fast weeknight wins in 30 minutes or less',
    focus: ['Speed', 'Simplicity', 'Weeknight convenience', 'Minimal effort & cleanup'],
    toneVoice: 'Direct, energetic, practical, motivating.',
    proseGuidelines: [
      'Emphasize fast preparation time and minimal pan cleanup.',
      'Highlight streamlined steps and smart kitchen shortcuts.',
      'Keep sentences punchy, helpful, and focused on dinner efficiency.',
    ],
    rules: [
      'Do not exaggerate time savings beyond factual numbers.',
      'Focus on weeknight practicality.',
    ],
  },
  'comfort-food': {
    id: 'comfort-food',
    name: 'Comfort Food',
    tagline: 'Cozy, satisfying meals with deep, rich flavor',
    focus: ['Cozy experience', 'Rich flavors', 'Satisfying textures', 'Comforting occasion'],
    toneVoice: 'Warm, inviting, sensory, grounded.',
    proseGuidelines: [
      'Highlight savory aromatics, velvety sauces, and hearty satisfaction.',
      'Use evocative, tasteful sensory descriptions of texture and aroma.',
      'Frame the dish as a comforting reward at the end of the day.',
    ],
    rules: [
      'Avoid exaggerated superlatives ("the best on earth").',
      'Keep the focus on authentic flavor depth.',
    ],
  },
  'budget-friendly': {
    id: 'budget-friendly',
    name: 'Budget Friendly',
    tagline: 'Delicious meals made with accessible everyday ingredients',
    focus: ['Accessible ingredients', 'Economical cooking', 'Pantry staples', 'Zero waste'],
    toneVoice: 'Practical, encouraging, resourceful, clear.',
    proseGuidelines: [
      'Emphasize common supermarket staples and pantry versatility.',
      'Use phrases like "made with everyday ingredients" rather than claiming specific dollar amounts.',
      'Highlight simple stretching tips and flexible side pairings.',
    ],
    rules: [
      'Never claim a recipe costs a specific price (e.g. "$5 dinner") unless verified.',
      'Focus on everyday accessible ingredients rather than "cheap".',
    ],
  },
  'family-favorite': {
    id: 'family-favorite',
    name: 'Family Favorite',
    tagline: 'Crowd-pleasing dinners that bring everyone to the table',
    focus: ['Broad crowd appeal', 'Easy serving', 'Familiar flavor balances', 'Kid-friendly adaptability'],
    toneVoice: 'Approachable, warm, cheerful, trustworthy.',
    proseGuidelines: [
      'Focus on balanced, universally loved flavors that appeal across generations.',
      'Highlight simple serving tips and easy customization for picky eaters.',
      'Use editorial framing of crowd appeal.',
    ],
    rules: [
      'Do NOT fabricate personal anecdotes ("my picky toddler loved this").',
      'Maintain an objective editorial identity: "A reliable crowd-pleaser for busy weeknights."',
    ],
  },
  'beginner-friendly': {
    id: 'beginner-friendly',
    name: 'Beginner Friendly',
    tagline: 'Step-by-step foolproof guidance with zero kitchen intimidation',
    focus: ['Simple instructions', 'Clear visual cues', 'No jargon', 'Reassuring technique tips'],
    toneVoice: 'Encouraging, instructional, calm, patient.',
    proseGuidelines: [
      'Clearly describe visual cues (e.g., "until golden brown and bubbling at the edges").',
      'Explain any cooking terms simply and clearly without condescension.',
      'Provide reassuring checkpoint tips so new home cooks feel confident.',
    ],
    rules: [
      'Do not use unexplained culinary jargon.',
      'Break multi-part instructions into clear, sequential milestones.',
    ],
  },
  'meal-prep': {
    id: 'meal-prep',
    name: 'Meal Prep',
    tagline: 'Cook once, enjoy delicious make-ahead meals all week',
    focus: ['Storage longevity', 'Batch preparation', 'Reheating quality', 'Make-ahead assembly'],
    toneVoice: 'Organized, efficient, practical, modern.',
    proseGuidelines: [
      'Highlight how well the dish holds up in the refrigerator or lunchbox.',
      'Provide structured storage and gentle reheating instructions.',
      'Suggest batch preparation and component meal-prep strategies.',
    ],
    rules: [
      'Only provide storage durations that are safe (e.g. 3-4 days refrigerated for cooked meats).',
      'Never fabricate unsafe freezing claims for dairy-heavy cream sauces.',
    ],
  },
  'seasonal-occasion': {
    id: 'seasonal-occasion',
    name: 'Seasonal / Occasion',
    tagline: 'Celebrate seasonal produce and cozy gathering moments',
    focus: ['Seasonality', 'Holiday gatherings', 'Seasonal ingredients', 'Special occasions'],
    toneVoice: 'Celebratory, thoughtful, evocative, festive.',
    proseGuidelines: [
      'Connect the recipe to natural seasonal moments (fall comfort, summer grilling, spring freshness).',
      'Highlight seasonal produce (apples, squash, berries, fresh herbs).',
      'Frame the dish for gatherings, potlucks, and relaxed weekend hosting.',
    ],
    rules: [
      'Do not force a seasonal holiday angle onto a timeless year-round dish.',
      'Keep seasonality natural and ingredient-driven.',
    ],
  },
};

export interface StyleRecommendation {
  primaryStyle: EditorialStyleId;
  secondaryStyle: EditorialStyleId;
  reason: string;
  confidence: number;
}

export function selectEditorialStyle(dna: RecipeDNA): StyleRecommendation {
  const is30Min = dna.totalTimeMinutes <= 30;
  const isOnePot = dna.cookingMethod.includes('One-Pot') || dna.cookingMethod.includes('Skillet');
  const isSlowCooker = dna.cookingMethod.includes('Slow Cooker');
  const hasApplesOrSquash = dna.keyIngredients.some((i) => i.includes('apple') || i.includes('squash') || i.includes('pumpkin'));
  const isAirFryer = dna.cookingMethod.includes('Air Fryer');

  if (hasApplesOrSquash) {
    return {
      primaryStyle: 'seasonal-occasion',
      secondaryStyle: 'comfort-food',
      reason: 'Contains classic seasonal produce best framed around seasonal comfort cooking.',
      confidence: 0.95,
    };
  }

  if (is30Min && isOnePot) {
    return {
      primaryStyle: 'quick-easy',
      secondaryStyle: 'family-favorite',
      reason: `Quick cooking time (${dna.totalTimeMinutes} minutes) and single-vessel ${dna.cookingMethod} method make this ideal for speed and simplicity.`,
      confidence: 0.94,
    };
  }

  if (isSlowCooker || dna.flavorProfile.includes('rich') || dna.textureProfile.includes('fork-tender')) {
    return {
      primaryStyle: 'comfort-food',
      secondaryStyle: 'family-favorite',
      reason: 'Deep rich flavors, tender textures, and slow braising make this quintessential comfort food.',
      confidence: 0.91,
    };
  }

  if (dna.difficulty === 'Easy' && dna.keyIngredients.length <= 4) {
    return {
      primaryStyle: 'beginner-friendly',
      secondaryStyle: 'quick-easy',
      reason: 'Short ingredient list and straightforward cooking techniques provide great beginner appeal.',
      confidence: 0.88,
    };
  }

  if (isAirFryer) {
    return {
      primaryStyle: 'quick-easy',
      secondaryStyle: 'budget-friendly',
      reason: 'Fast air fryer technique is best framed around quick, crispy weeknight cooking.',
      confidence: 0.9,
    };
  }

  return {
    primaryStyle: 'family-favorite',
    secondaryStyle: 'comfort-food',
    reason: 'Broadly appealing balanced flavors suitable for family dinners and weeknight gatherings.',
    confidence: 0.85,
  };
}
