import { normalizeIngredientList } from './ingredient-normalizer';
import type { RecipeIngredient, RecipeInstruction } from '../types/recipe';
import { parseIsoDurationToMinutes } from './time-parser';

export interface ExtractedHtmlMetadata {
  pageTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export interface ExtractedHtmlRecipe {
  title?: string;
  description?: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  totalTimeMinutes?: number;
  servings?: number;
  imageUrl?: string;
  metadata: ExtractedHtmlMetadata;
}

function cleanHtmlText(raw: string): string {
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractPageMetadata(html: string): ExtractedHtmlMetadata {
  const metadata: ExtractedHtmlMetadata = {};

  // Page Title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    metadata.pageTitle = cleanHtmlText(titleMatch[1]);
  }

  // Meta Description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i);
  if (metaDescMatch) {
    metadata.metaDescription = cleanHtmlText(metaDescMatch[1]);
  }

  // Open Graph
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i);
  if (ogTitleMatch) {
    metadata.ogTitle = cleanHtmlText(ogTitleMatch[1]);
  }

  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i);
  if (ogDescMatch) {
    metadata.ogDescription = cleanHtmlText(ogDescMatch[1]);
  }

  const ogImgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i);
  if (ogImgMatch) {
    metadata.ogImage = ogImgMatch[1].trim();
  }

  // Canonical
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([\s\S]*?)["'][^>]*>/i);
  if (canonicalMatch) {
    metadata.canonicalUrl = canonicalMatch[1].trim();
  }

  return metadata;
}

export function extractRecipeFromHtmlFallback(html: string): ExtractedHtmlRecipe {
  const metadata = extractPageMetadata(html);

  // 1. Title fallback
  let title = metadata.ogTitle;
  if (!title) {
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      title = cleanHtmlText(h1Match[1]);
    } else {
      title = metadata.pageTitle?.split(/[-|–]/)[0]?.trim();
    }
  }

  // 2. Ingredients fallback: Look for microdata or standard list items
  const ingredients: RecipeIngredient[] = [];
  const rawIngredientLines: string[] = [];

  // Look for itemprop="recipeIngredient" or itemprop="ingredients"
  const microdataIngRegex = /itemprop=["'](?:recipeIngredient|ingredients)["'][^>]*>([\s\S]*?)<\/[a-z0-9]+>/gi;
  let ingMatch: RegExpExecArray | null;
  while ((ingMatch = microdataIngRegex.exec(html)) !== null) {
    const text = cleanHtmlText(ingMatch[1]);
    if (text) rawIngredientLines.push(text);
  }

  // Look for common recipe class pattern if microdata returned nothing
  if (rawIngredientLines.length === 0) {
    const classIngRegex = /class=["'][^"']*(?:wprm-recipe-ingredient|ingredient-item|recipe-ingredient)[^"']*["'][^>]*>([\s\S]*?)<\/[a-z0-9]+>/gi;
    while ((ingMatch = classIngRegex.exec(html)) !== null) {
      const text = cleanHtmlText(ingMatch[1]);
      if (text && text.length > 2 && text.length < 200) rawIngredientLines.push(text);
    }
  }

  const normalizedIngredients = normalizeIngredientList(rawIngredientLines);

  // 3. Instructions fallback: Look for itemprop="recipeInstructions" or HowToStep
  const instructions: RecipeInstruction[] = [];
  const rawInstructionLines: string[] = [];

  const microdataInsRegex = /itemprop=["']recipeInstructions["'][^>]*>([\s\S]*?)<\/[a-z0-9]+>/gi;
  let insMatch: RegExpExecArray | null;
  while ((insMatch = microdataInsRegex.exec(html)) !== null) {
    const text = cleanHtmlText(insMatch[1]);
    if (text && text.length > 5) rawInstructionLines.push(text);
  }

  if (rawInstructionLines.length === 0) {
    const classInsRegex = /class=["'][^"']*(?:wprm-recipe-instruction|instruction-step|recipe-step)[^"']*["'][^>]*>([\s\S]*?)<\/[a-z0-9]+>/gi;
    while ((insMatch = classInsRegex.exec(html)) !== null) {
      const text = cleanHtmlText(insMatch[1]);
      if (text && text.length > 5 && text.length < 1000) rawInstructionLines.push(text);
    }
  }

  rawInstructionLines.forEach((line, idx) => {
    instructions.push({
      stepNumber: idx + 1,
      instructionText: line.replace(/^\d+[\.\)]\s*/, ''),
    });
  });

  return {
    title,
    description: metadata.ogDescription || metadata.metaDescription,
    ingredients: normalizedIngredients,
    instructions,
    imageUrl: metadata.ogImage,
    metadata,
  };
}
