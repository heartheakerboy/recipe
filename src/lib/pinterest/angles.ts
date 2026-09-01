export type { PinterestContentAngle } from '../types/pinterest';
import { PinterestContentAngle } from '../types/pinterest';
import { RecipeDNA } from '../ai/recipe-dna';

export interface PinterestAngleDefinition {
  id: PinterestContentAngle;
  name: string;
  tagline: string;
  overlayPrefix: string;
  focus: string[];
  suggestedBoards: string[];
}

export const PINTEREST_ANGLES: Record<PinterestContentAngle, PinterestAngleDefinition> = {
  'quick-dinner': {
    id: 'quick-dinner',
    name: 'Quick Dinner',
    tagline: 'Ready in 30 minutes or less with minimal pan cleanup',
    overlayPrefix: '30-Minute',
    focus: ['Speed', 'Weeknight simplicity', 'Minimal cleanup', 'Fast dinner ideas'],
    suggestedBoards: ['30-Minute Meals', 'Easy Dinner Recipes', 'Quick Weeknight Dinners'],
  },
  'easy-recipe': {
    id: 'easy-recipe',
    name: 'Easy Recipe',
    tagline: 'Simple preparation and everyday pantry ingredients',
    overlayPrefix: 'Easy',
    focus: ['Foolproof steps', 'Beginner accessible', 'Pantry staples', 'Simple cooking'],
    suggestedBoards: ['Easy Dinner Recipes', 'Simple Recipes', 'Weeknight Cooking'],
  },
  'comfort-food': {
    id: 'comfort-food',
    name: 'Comfort Food',
    tagline: 'Cozy, savory, rich flavors that satisfy',
    overlayPrefix: 'Cozy',
    focus: ['Rich flavor depth', 'Velvety sauces', 'Hearty satisfaction', 'Comforting dinners'],
    suggestedBoards: ['Comfort Food Dinners', 'Cozy Meals', 'Family Favorite Recipes'],
  },
  'family-meal': {
    id: 'family-meal',
    name: 'Family Meal',
    tagline: 'Crowd-pleasing dinners that bring everyone to the table',
    overlayPrefix: 'Family-Favorite',
    focus: ['Crowd appeal', 'Balanced flavors', 'Kid-friendly serving', 'Hearty portions'],
    suggestedBoards: ['Family Dinner Ideas', 'Crowd Pleasing Dinners', 'Weeknight Family Meals'],
  },
  'meal-prep': {
    id: 'meal-prep',
    name: 'Meal Prep',
    tagline: 'Make-ahead friendly dinners that store and reheat well',
    overlayPrefix: 'Make-Ahead',
    focus: ['Refrigeration longevity', 'Batch cooking', 'Reheating quality', 'Organized prep'],
    suggestedBoards: ['Meal Prep Ideas', 'Make Ahead Dinners', 'Healthy Lunch Prep'],
  },
  'seasonal': {
    id: 'seasonal',
    name: 'Seasonal / Occasion',
    tagline: 'Celebrate seasonal produce and cozy gathering moments',
    overlayPrefix: 'Seasonal',
    focus: ['Fresh seasonal produce', 'Holiday gatherings', 'Weekend hosting', 'Festive flavors'],
    suggestedBoards: ['Seasonal Recipes', 'Fall Dinner Ideas', 'Holiday Gathering Meals'],
  },
};

export function getEligibleAngles(dna: RecipeDNA): PinterestContentAngle[] {
  const eligible: PinterestContentAngle[] = ['quick-dinner', 'easy-recipe', 'comfort-food', 'family-meal'];

  if (dna.seasonality && dna.seasonality.length > 0 && !dna.seasonality.includes('Year-round weeknight staple')) {
    eligible.push('seasonal');
  }

  if (dna.cookingMethod.includes('Slow Cooker') || dna.cookingMethod.includes('One-Pot') || dna.mealType === 'Lunch') {
    eligible.push('meal-prep');
  }

  return eligible;
}

export function getSuggestedBoardForRecipe(dna: RecipeDNA, angle: PinterestContentAngle): string {
  const category = dna.primaryProtein.toLowerCase();
  if (category.includes('chicken')) return 'Chicken Recipes';
  if (category.includes('pasta')) return 'Pasta Recipes';
  if (dna.cookingMethod.includes('Air Fryer')) return 'Air Fryer Recipes';
  if (dna.cookingMethod.includes('Slow Cooker')) return 'Slow Cooker Meals';
  if (dna.totalTimeMinutes <= 30) return '30-Minute Meals';
  return PINTEREST_ANGLES[angle]?.suggestedBoards[0] || 'Easy Dinner Recipes';
}
