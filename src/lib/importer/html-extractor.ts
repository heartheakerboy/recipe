import { normalizeIngredientList } from './ingredient-normalizer';
import type { RecipeIngredient, RecipeInstruction } from '../types/recipe';
import { ExtractedImageItem } from './jsonld-extractor';

export interface ExtractedHtmlMetadata {
  pageTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterImage?: string;
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
  allImages: ExtractedImageItem[];
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

function isDisallowedImage(url: string): boolean {
  const lower = url.toLowerCase();
  if (lower.endsWith('.svg') || lower.endsWith('.gif') || lower.endsWith('.ico')) return true;
  const junkPatterns = [
    'avatar', 'gravatar', 'logo', 'icon', 'emoji', 'badge', 'pixel', 'spacer',
    'wp-includes', 'advertisement', 'share-button', '1x1', 'analytics', 'author',
    'profile', 'header-bg', 'sidebar', 'footer', 'button', 'social'
  ];
  return junkPatterns.some((pattern) => lower.includes(pattern));
}

function resolveUrl(src: string, baseUrl?: string): string | undefined {
  if (!src) return undefined;
  const trimmed = src.trim();
  if (trimmed.startsWith('data:')) return undefined;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (baseUrl) {
    try {
      return new URL(trimmed, baseUrl).href;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function extractPageMetadata(html: string, baseUrl?: string): ExtractedHtmlMetadata {
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

  const ogImgMatch = html.match(/<meta[^>]*property=["']og:image(?::secure_url)?["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i);
  if (ogImgMatch) {
    metadata.ogImage = resolveUrl(ogImgMatch[1], baseUrl);
  }

  const twImgMatch = html.match(/<meta[^>]*(?:name|property)=["']twitter:image(?::src)?["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i);
  if (twImgMatch) {
    metadata.twitterImage = resolveUrl(twImgMatch[1], baseUrl);
  }

  // Canonical
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([\s\S]*?)["'][^>]*>/i);
  if (canonicalMatch) {
    metadata.canonicalUrl = canonicalMatch[1].trim();
  }

  return metadata;
}

export function extractAllImagesFromHtml(html: string, baseUrl?: string, defaultAlt?: string): ExtractedImageItem[] {
  const images: ExtractedImageItem[] = [];
  const seenUrls = new Set<string>();

  const addImage = (rawUrl?: string, type: 'hero' | 'step' | 'gallery' | 'og' | 'body' = 'gallery', altText?: string, width?: number, height?: number) => {
    if (!rawUrl) return;
    const resolved = resolveUrl(rawUrl, baseUrl);
    if (!resolved || seenUrls.has(resolved) || isDisallowedImage(resolved)) return;
    seenUrls.add(resolved);

    images.push({
      url: resolved,
      alt: altText || defaultAlt,
      width,
      height,
      type,
    });
  };

  // 1. Metadata Images
  const meta = extractPageMetadata(html, baseUrl);
  if (meta.ogImage) addImage(meta.ogImage, 'og', defaultAlt);
  if (meta.twitterImage) addImage(meta.twitterImage, 'gallery', defaultAlt);

  // 2. Extract Pinterest specific media
  const pinMediaRegex = /data-pin-media=["']([^"']+)["']/gi;
  let pinMatch: RegExpExecArray | null;
  while ((pinMatch = pinMediaRegex.exec(html)) !== null) {
    addImage(pinMatch[1], 'gallery', defaultAlt);
  }

  // 3. Extract <img> Tags
  const imgTagRegex = /<img\b([^>]+)>/gi;
  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = imgTagRegex.exec(html)) !== null) {
    const attributes = imgMatch[1];
    
    // Find src or lazy loading source
    const srcMatch = attributes.match(/\b(?:src|data-src|data-lazy-src|data-original)=["']([^"']+)["']/i);
    const altMatch = attributes.match(/\balt=["']([^"']*)["']/i);
    const widthMatch = attributes.match(/\bwidth=["']?(\d+)["']?/i);
    const heightMatch = attributes.match(/\bheight=["']?(\d+)["']?/i);

    if (srcMatch && srcMatch[1]) {
      const w = widthMatch ? parseInt(widthMatch[1], 10) : undefined;
      const h = heightMatch ? parseInt(heightMatch[1], 10) : undefined;
      const alt = altMatch ? cleanHtmlText(altMatch[1]) : undefined;

      // Skip tiny icon images if width/height specified
      if ((w && w < 150) || (h && h < 150)) continue;

      const isStepImg = /step|instruction/i.test(attributes);
      addImage(srcMatch[1], isStepImg ? 'step' : 'body', alt, w, h);
    }
  }

  return images;
}

export function extractRecipeFromHtmlFallback(html: string, baseUrl?: string): ExtractedHtmlRecipe {
  const metadata = extractPageMetadata(html, baseUrl);

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

  // 2. All Images
  const allImages = extractAllImagesFromHtml(html, baseUrl, title);

  // 3. Ingredients fallback: Look for microdata or standard list items
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

  // 4. Instructions fallback: Look for itemprop="recipeInstructions" or HowToStep
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
    imageUrl: metadata.ogImage || allImages[0]?.url,
    allImages,
    metadata,
  };
}
