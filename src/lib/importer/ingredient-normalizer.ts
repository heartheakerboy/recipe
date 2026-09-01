import type { RecipeIngredient } from '../types/recipe';

const FRACTION_MAP: Record<string, number> = {
  '½': 0.5,
  '⅓': 0.333,
  '⅔': 0.667,
  '¼': 0.25,
  '¾': 0.75,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
};

const COMMON_UNITS = [
  'tbsp',
  'tablespoon',
  'tablespoons',
  'tsp',
  'teaspoon',
  'teaspoons',
  'cup',
  'cups',
  'oz',
  'ounce',
  'ounces',
  'fl oz',
  'fluid ounce',
  'lb',
  'lbs',
  'pound',
  'pounds',
  'g',
  'gram',
  'grams',
  'kg',
  'kilogram',
  'ml',
  'milliliter',
  'l',
  'liter',
  'clove',
  'cloves',
  'pinch',
  'pinches',
  'dash',
  'can',
  'cans',
  'package',
  'pkg',
  'slice',
  'slices',
  'sprig',
  'sprigs',
  'stalk',
  'stalks',
  'head',
  'heads',
  'bunch',
  'bunches',
];

export function normalizeIngredientLine(raw: string, index: number): RecipeIngredient {
  const cleanRaw = raw.replace(/\s+/g, ' ').trim();
  if (!cleanRaw) {
    return {
      id: `ing_${index + 1}`,
      rawText: '',
      item: 'Unspecified Ingredient',
    };
  }

  let text = cleanRaw;

  // Replace unicode fractions
  for (const [frac, val] of Object.entries(FRACTION_MAP)) {
    if (text.includes(frac)) {
      text = text.replace(new RegExp(frac, 'g'), ` ${val} `);
    }
  }

  let quantity: number | undefined;
  let unit: string | undefined;
  let item = cleanRaw;
  let notes: string | undefined;

  // Extract trailing notes (e.g. "... , diced" or "... (room temperature)")
  const commaIndex = cleanRaw.indexOf(',');
  if (commaIndex !== -1) {
    notes = cleanRaw.substring(commaIndex + 1).trim();
  }

  // Check for leading quantity pattern (e.g., "1 1/2", "2.5", "1/2", "3")
  const qtyMatch = cleanRaw.match(
    /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(.*)$/
  );

  if (qtyMatch) {
    const rawQty = qtyMatch[1].trim();
    const remaining = qtyMatch[2].trim();

    if (rawQty.includes(' ') && rawQty.includes('/')) {
      const [whole, frac] = rawQty.split(' ');
      const [num, den] = frac.split('/');
      quantity = parseInt(whole, 10) + parseInt(num, 10) / parseInt(den, 10);
    } else if (rawQty.includes('/')) {
      const [num, den] = rawQty.split('/');
      quantity = parseInt(num, 10) / parseInt(den, 10);
    } else {
      quantity = parseFloat(rawQty);
    }

    // Check for unit in remaining string
    const firstWord = remaining.split(' ')[0].toLowerCase().replace(/[.,]/g, '');
    if (COMMON_UNITS.includes(firstWord)) {
      unit = firstWord;
      const itemWithoutUnit = remaining.substring(firstWord.length).trim();
      item = itemWithoutUnit.split(',')[0].trim() || cleanRaw;
    } else {
      item = remaining.split(',')[0].trim() || cleanRaw;
    }
  }

  return {
    id: `ing_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
    rawText: cleanRaw,
    item: item || cleanRaw,
    quantity: quantity ? Math.round(quantity * 100) / 100 : undefined,
    unit,
    notes,
  };
}

export function normalizeIngredientList(rawIngredients: string[]): RecipeIngredient[] {
  return rawIngredients
    .map((line, idx) => normalizeIngredientLine(line, idx))
    .filter((ing) => ing.rawText.length > 0);
}
