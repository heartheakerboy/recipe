import { RecipeDNA } from '../ai/recipe-dna';
import { AspectRatio } from './image-provider';

export type FoodImageType = 'hero' | 'secondary' | 'pinterest' | 'overhead' | 'closeup';

export type VisualStylePreset =
  | 'editorial-kitchen'
  | 'rustic-table'
  | 'clean-minimal'
  | 'cozy-dinner'
  | 'bright-fresh';

export interface VisualPresetDefinition {
  id: VisualStylePreset;
  name: string;
  description: string;
  lighting: string;
  surface: string;
  props: string;
  atmosphere: string;
}

export const VISUAL_STYLE_PRESETS: Record<VisualStylePreset, VisualPresetDefinition> = {
  'editorial-kitchen': {
    id: 'editorial-kitchen',
    name: 'Editorial Kitchen',
    description: 'Modern marble countertop, natural morning window light, high-end food magazine aesthetic',
    lighting: 'Soft directional natural window light from the side, subtle gentle shadows',
    surface: 'Honed light marble countertop with subtle grey veining',
    props: 'Matte ceramic serving dish, small pinch bowl with sea salt, vintage brass fork',
    atmosphere: 'Clean, sophisticated, premium culinary publication style',
  },
  'rustic-table': {
    id: 'rustic-table',
    name: 'Rustic Table',
    description: 'Warm dark wood table, natural linen, cozy ambient glow',
    lighting: 'Warm diffused ambient lighting with soft highlights on glossy textures',
    surface: 'Reclaimed dark oak dining table with rich wood grain',
    props: 'Cast-iron skillet or stoneware plate, folded natural linen napkin, rustic wooden spoon',
    atmosphere: 'Hearty, comforting, grounded home-cooked warmth',
  },
  'clean-minimal': {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    description: 'Light stone background, crisp white dishware, bright modern daylight',
    lighting: 'Bright, even daylight with crisp clarity and realistic contrast',
    surface: 'Neutral warm-grey textured microcement surface',
    props: 'Minimalist white ceramic plate, single modern fork, zero clutter',
    atmosphere: 'Fresh, airy, contemporary, focus entirely on the food',
  },
  'cozy-dinner': {
    id: 'cozy-dinner',
    name: 'Cozy Dinner',
    description: 'Evening table setting, warm golden glow, comforting family dinner vibe',
    lighting: 'Warm golden hour lighting, inviting glow highlighting steam and melted sauce',
    surface: 'Warm wooden dining table with a subtle woven placemat',
    props: 'Shallow ceramic dinner bowl, side plate with crusty bread, wine glass in soft background blur',
    atmosphere: 'Welcoming, appetizing, weeknight dinner comfort',
  },
  'bright-fresh': {
    id: 'bright-fresh',
    name: 'Bright & Fresh',
    description: 'Vibrant colors, scattered fresh herbs, clean daylight',
    lighting: 'Crisp, vibrant natural daylight highlighting colorful ingredients',
    surface: 'Light bleached wood table with clean white plates',
    props: 'Fresh scattered parsley leaves, freshly cracked black pepper, lemon wedge on the side',
    atmosphere: 'Lively, appetizing, health-conscious and invigorating',
  },
};

export interface PromptConfig {
  prompt: string;
  negativePrompt: string;
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  altText: string;
  targetRole: FoodImageType;
}

export function generateFoodImagePrompt(
  dna: RecipeDNA,
  imageType: FoodImageType = 'hero',
  presetId: VisualStylePreset = 'editorial-kitchen'
): PromptConfig {
  const preset = VISUAL_STYLE_PRESETS[presetId] || VISUAL_STYLE_PRESETS['editorial-kitchen'];
  const ingredientsList = dna.keyIngredients.slice(0, 4).join(', ');
  const mainDish = dna.coreDish;

  let composition = '';
  let aspectRatio: AspectRatio = '3:2';
  let width = 1200;
  let height = 800;

  if (imageType === 'hero') {
    aspectRatio = '3:2';
    width = 1200;
    height = 800;
    composition = 'Shot at an appetizing 45-degree three-quarter food photography angle, shallow depth of field with the main dish in sharp focus and a softly blurred background';
  } else if (imageType === 'pinterest') {
    aspectRatio = '2:3';
    width = 1000;
    height = 1500;
    composition = 'Vertical 2:3 composition framed from a dynamic 60-degree angle, with the appetizing plate centered in the lower two-thirds and clean, open negative space at the top';
  } else if (imageType === 'overhead') {
    aspectRatio = '4:3';
    width = 1200;
    height = 900;
    composition = 'Overhead flatlay 90-degree top-down view of the plated dish arranged harmoniously with subtle complementary table elements';
  } else if (imageType === 'closeup') {
    aspectRatio = '4:3';
    width = 1200;
    height = 900;
    composition = 'Macro close-up food photography highlighting rich sauce glazes, juicy protein textures, and fine garnish details with exquisite sensory clarity';
  } else {
    // Secondary
    aspectRatio = '4:3';
    width = 1200;
    height = 900;
    composition = 'Editorial culinary shot showcasing the dish ready to serve, balanced composition on the countertop';
  }

  const prompt = [
    `Professional editorial food photography of ${mainDish.toLowerCase()}, made with ${ingredientsList}.`,
    `Served in a ${preset.props}.`,
    `${composition}.`,
    `${preset.surface}, illuminated by ${preset.lighting.toLowerCase()}.`,
    `Appetizing ${dna.textureProfile.join(' and ')} textures, glistening sauce, fresh herb garnish, realistic culinary textures, Michelin-star recipe blog quality, shot on Hasselblad with 85mm f/1.8 lens, color graded, crisp natural food details, hyper-realistic, appetizing.`,
  ].join(' ');

  const negativePrompt = [
    'text, typography, watermark, logo, banner, overlay text, labels,',
    'deformed hands, fingers, human figures, distorted utensils, duplicate forks, extra spoons,',
    'floating ingredients, unrealistic food, plastic texture, neon colors, oversaturated,',
    'blurry, poorly lit, low resolution, dirty dishes, bad framing, cartoon, 3d render, CGI.',
  ].join(' ');

  const altText = `${mainDish} garnished with fresh herbs and served with a rich sauce on a ${preset.props.split(',')[0]}.`;

  return {
    prompt,
    negativePrompt,
    aspectRatio,
    width,
    height,
    altText,
    targetRole: imageType,
  };
}
