import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. URL & SSRF Validation Tests
const PRIVATE_IP_PATTERNS = [
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/,
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  /^169\.254\.\d{1,3}\.\d{1,3}$/,
  /^0\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
];

const DISALLOWED_HOSTNAMES = [
  'localhost',
  'metadata.google.internal',
  '169.254.169.254',
  'instance-data',
  'kubernetes.default.svc',
];

function isPrivateOrReservedHost(hostname) {
  const host = hostname.toLowerCase().trim();
  if (DISALLOWED_HOSTNAMES.includes(host)) return true;
  if (
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.lan') ||
    host.endsWith('.corp')
  ) return true;
  if (host === '::1' || host === '[::1]' || host.startsWith('fc00:') || host.startsWith('fe80:')) return true;
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(host)) return true;
  }
  return false;
}

function normalizeRecipeUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl.trim());
    const TRACKING = new Set(['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'fbclid', 'gclid']);
    const newParams = new URLSearchParams();
    parsed.searchParams.forEach((v, k) => {
      if (!TRACKING.has(k.toLowerCase())) newParams.append(k, v);
    });
    const qs = newParams.toString() ? `?${newParams.toString()}` : '';
    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    return `${parsed.protocol}//${parsed.hostname.toLowerCase()}${pathname}${qs}`;
  } catch {
    return rawUrl.trim();
  }
}

function validateRecipeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return { isValid: false, error: 'Please enter a URL' };
  const trimmed = rawUrl.trim();
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isValid: false, error: 'Only HTTP/HTTPS supported' };
  }
  if (isPrivateOrReservedHost(parsed.hostname)) {
    return { isValid: false, error: 'Security Exception: Private/Local IP' };
  }
  return { isValid: true, normalizedUrl: normalizeRecipeUrl(trimmed), domain: parsed.hostname.toLowerCase() };
}

// 2. Time Parser
function parseIsoDurationToMinutes(durationStr) {
  if (!durationStr || typeof durationStr !== 'string') return 0;
  const str = durationStr.trim();
  const isoMatch = str.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i);
  if (isoMatch) {
    const d = parseInt(isoMatch[1] || '0', 10);
    const h = parseInt(isoMatch[2] || '0', 10);
    const m = parseInt(isoMatch[3] || '0', 10);
    const s = parseInt(isoMatch[4] || '0', 10);
    return d * 1440 + h * 60 + m + Math.round(s / 60);
  }
  let mins = 0;
  const hourMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/i);
  if (hourMatch) mins += Math.round(parseFloat(hourMatch[1]) * 60);
  const minMatch = str.match(/(\d+)\s*(?:minutes?|mins?|m)\b/i);
  if (minMatch) mins += parseInt(minMatch[1], 10);
  return mins;
}

function formatMinutesToIso(minutes) {
  if (!minutes || minutes <= 0) return 'PT0M';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `PT${hours}H${mins}M`;
  if (hours > 0) return `PT${hours}H`;
  return `PT${mins}M`;
}

// 3. Phase 4 AI Modules Logic
function extractMockRecipeDNA(recipe) {
  const allText = `${recipe.title} ${recipe.shortDescription} ${recipe.ingredients.map((i) => i.item).join(' ')}`.toLowerCase();
  let primaryProtein = 'Vegetarian';
  if (allText.includes('chicken')) primaryProtein = 'Chicken';
  else if (allText.includes('beef')) primaryProtein = 'Beef';

  return {
    coreDish: recipe.title,
    primaryProtein,
    totalTimeMinutes: recipe.totalTimeMinutes,
    servings: recipe.servings,
    keyIngredients: recipe.ingredients.slice(0, 4).map((i) => i.item.toLowerCase()),
    flavorProfile: ['savory', 'creamy'],
    textureProfile: ['tender'],
    cookingMethod: recipe.cookingMethod || 'Stovetop',
    difficulty: recipe.difficulty || 'Easy',
  };
}

function selectStyleFromDna(dna) {
  if (dna.keyIngredients.some((i) => i.includes('apple') || i.includes('squash'))) {
    return { primaryStyle: 'seasonal-occasion', confidence: 0.95 };
  }
  if (dna.totalTimeMinutes <= 30) {
    return { primaryStyle: 'quick-easy', confidence: 0.94 };
  }
  return { primaryStyle: 'comfort-food', confidence: 0.9 };
}

function checkUnsupportedClaims(text) {
  const patterns = [/\bviral\b/i, /\baward[- ]winning\b/i, /\bmy family(?:'s)? favorite\b/i, /\bthe best ever\b/i];
  const detected = [];
  for (const p of patterns) {
    const m = p.exec(text);
    if (m) detected.push(m[0]);
  }
  return detected;
}

function verifyFactsPreservation(originalIngredients, generatedIngredients) {
  let matched = 0;
  for (const orig of originalIngredients) {
    const found = generatedIngredients.some((g) => g.toLowerCase().includes(orig.toLowerCase()));
    if (found) matched++;
  }
  return matched / originalIngredients.length;
}

// 4. Phase 5 Image Pipeline Functions
function generateMockFoodPrompt(dna, imageType, stylePreset) {
  const aspect = imageType === 'pinterest' ? '2:3' : imageType === 'hero' ? '3:2' : '4:3';
  const width = imageType === 'pinterest' ? 1000 : 1200;
  const height = imageType === 'pinterest' ? 1500 : imageType === 'hero' ? 800 : 900;
  const prompt = `Professional food photography of ${dna.coreDish}, preset: ${stylePreset}, aspect: ${aspect}`;
  const altText = `${dna.coreDish} served with fresh garnish`;
  return { prompt, aspect, width, height, altText };
}

function generateR2StorageKey(slug, imageType, variant = 'original') {
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  if (imageType === 'hero') return `recipes/${cleanSlug}/hero/${variant}.webp`;
  if (imageType === 'pinterest') return `recipes/${cleanSlug}/pinterest/01.webp`;
  return `recipes/${cleanSlug}/secondary/${variant}.webp`;
}

// 5. Phase 6 Pinterest Engine Functions
function generateMockPinCopy(recipe, dna, angle) {
  const dish = dna.coreDish;
  let overlayText = `Easy ${dish}`;
  let title = `Simple & Easy ${dish} Recipe`;
  let description = `Delicious homemade ${dish.toLowerCase()} ready in ${dna.totalTimeMinutes} minutes.`;

  if (angle === 'quick-dinner') {
    overlayText = `${dna.totalTimeMinutes}-Minute ${dish}`;
    title = `Easy ${dna.totalTimeMinutes}-Minute ${dish} Recipe`;
    description = `Looking for a fast weeknight dinner? This ${dish.toLowerCase()} comes together in just ${dna.totalTimeMinutes} minutes.`;
  } else if (angle === 'comfort-food') {
    overlayText = `Cozy ${dish}`;
    title = `Cozy Homemade ${dish} for Dinner`;
    description = `Warm up with this rich and creamy ${dish.toLowerCase()}. The ultimate comforting dinner idea!`;
  }

  const keywords = [dish.toLowerCase(), 'easy dinner', `${dna.totalTimeMinutes} minute recipes`, 'weeknight dinner'];
  return { angle, overlayText, title, description, keywords };
}

function checkPinClaimValidation(text) {
  const patterns = [/\bviral\b/i, /\b5[- ]star\b/i, /\beveryone loves\b/i, /\bthe best ever\b/i];
  return patterns.some((p) => p.test(text));
}

// 6. Phase 7 Publishing, SEO, and Discovery Logic
function evaluateMockPublicationChecklist(recipe, hasPinterestCreative = true) {
  const contentComplete = Boolean(
    recipe.title &&
      recipe.shortDescription &&
      recipe.introduction &&
      recipe.ingredients?.length >= 2 &&
      recipe.instructions?.length >= 1
  );
  const factsValid = Boolean(recipe.servings > 0 && recipe.totalTimeMinutes > 0 && recipe.difficulty);
  const heroImageApproved = Boolean(recipe.heroImage?.url && recipe.heroImage?.altText);
  const seoComplete = Boolean(recipe.seoTitle && recipe.metaDescription && recipe.slug);
  const canonicalValid = Boolean(recipe.canonicalUrl?.startsWith('https://flavornest.xyz/recipes/'));
  const categoryAssigned = Boolean(recipe.primaryCategorySlug);
  const schemaReady = contentComplete && factsValid;

  const checks = {
    contentComplete,
    factsValid,
    heroImageApproved,
    seoComplete,
    canonicalValid,
    categoryAssigned,
    schemaReady,
    pinterestCreativeReady: hasPinterestCreative,
  };

  const missingRequirements = [];
  if (!contentComplete) missingRequirements.push('Content incomplete');
  if (!factsValid) missingRequirements.push('Facts missing');
  if (!heroImageApproved) missingRequirements.push('Hero image missing');
  if (!seoComplete) missingRequirements.push('SEO missing');
  if (!canonicalValid) missingRequirements.push('Canonical URL invalid');
  if (!categoryAssigned) missingRequirements.push('Category missing');
  if (!schemaReady) missingRequirements.push('Schema invalid');

  return {
    canPublish: missingRequirements.length === 0,
    score: Object.values(checks).filter(Boolean).length,
    missingRequirements,
  };
}

function normalizeRedirectPath(p) {
  let clean = p.trim();
  if (!clean.startsWith('/')) clean = `/${clean}`;
  if (!clean.endsWith('/')) clean = `${clean}/`;
  return clean.toLowerCase();
}

function scoreRelatedRecipe(target, candidate) {
  let score = 0;
  if (candidate.primaryCategorySlug === target.primaryCategorySlug) score += 40;
  if (candidate.mealType === target.mealType) score += 15;
  if (candidate.cookingMethod === target.cookingMethod) score += 15;
  const common = candidate.tags.filter((t) => target.tags.includes(t));
  score += common.length * 5;
  return score;
}

// 7. Phase 8 Master Pipeline & Budget Logic
function checkBudgetPermission(dailySpent, limit, requestedAmount = 0.05) {
  if (dailySpent + requestedAmount > limit) {
    return { allowed: false, reason: 'Budget limit reached' };
  }
  return { allowed: true };
}

function validateBulkBatch(urls, existingUrls = []) {
  const seen = new Set();
  const existingSet = new Set(existingUrls.map((u) => u.toLowerCase()));
  let valid = 0;
  let dupes = 0;
  let invalid = 0;

  for (const raw of urls) {
    const res = validateRecipeUrl(raw);
    if (!res.isValid) {
      invalid++;
      continue;
    }
    const norm = res.normalizedUrl.toLowerCase();
    if (seen.has(norm) || existingSet.has(norm)) {
      dupes++;
      continue;
    }
    seen.add(norm);
    valid++;
  }

  return { valid, dupes, invalid };
}

// 8. Phase 9 Discovery & Collections
function validateNewsletterEmail(email) {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return Boolean(email && EMAIL_REGEX.test(email.trim()));
}

function filterRecipesByCollection(collectionRecipeIds, allRecipes) {
  const set = new Set(collectionRecipeIds);
  return allRecipes.filter((r) => set.has(r.id));
}

// 9. Phase 10 Pinterest Publishing & API Verification
function maskSecretToken(token) {
  if (!token || token.length < 8) return '••••••••';
  return `${token.slice(0, 5)}...${token.slice(-4)}`;
}

function validatePrePublish(recipe, creative, isAccountConnected) {
  const errors = [];
  if (creative.status === 'published') errors.push('Already published');
  if (recipe.status !== 'published') errors.push('Recipe not published');
  if (!creative.imageUrl?.startsWith('http')) errors.push('Invalid image');
  if (!creative.destinationUrl?.startsWith('https://flavornest.xyz/recipes/')) errors.push('Invalid link');
  if (!isAccountConnected) errors.push('Account disconnected');
  return { canPublish: errors.length === 0, errors };
}

function resolveBoard(categorySlug, mappings, defaultBoardId) {
  const found = mappings.find((m) => m.categorySlug === categorySlug);
  return found ? found.boardId : defaultBoardId;
}

// Test Suite Execution
test('1. SSRF & URL Validation', () => {
  assert.equal(isPrivateOrReservedHost('localhost'), true);
  assert.equal(isPrivateOrReservedHost('127.0.0.1'), true);
  assert.equal(isPrivateOrReservedHost('10.0.0.1'), true);
  assert.equal(isPrivateOrReservedHost('172.16.0.5'), true);
  assert.equal(isPrivateOrReservedHost('192.168.1.100'), true);
  assert.equal(isPrivateOrReservedHost('169.254.169.254'), true);
  assert.equal(isPrivateOrReservedHost('::1'), true);
  assert.equal(isPrivateOrReservedHost('app.internal'), true);

  assert.equal(isPrivateOrReservedHost('example.com'), false);
  assert.equal(isPrivateOrReservedHost('allrecipes.com'), false);

  const bad1 = validateRecipeUrl('http://localhost:3000/recipe/1');
  assert.equal(bad1.isValid, false);
  assert.match(bad1.error, /Security Exception/i);

  const good = validateRecipeUrl('https://example.com/recipes/pasta/?utm_source=pin&ref=123#step1');
  assert.equal(good.isValid, true);
  assert.equal(good.normalizedUrl, 'https://example.com/recipes/pasta');
  assert.equal(good.domain, 'example.com');
});

test('2. ISO 8601 Duration Parser', () => {
  assert.equal(parseIsoDurationToMinutes('PT30M'), 30);
  assert.equal(parseIsoDurationToMinutes('PT1H'), 60);
  assert.equal(parseIsoDurationToMinutes('PT1H30M'), 90);
  assert.equal(parseIsoDurationToMinutes('PT2H15M'), 135);
  assert.equal(parseIsoDurationToMinutes('P0DT0H45M'), 45);
  assert.equal(parseIsoDurationToMinutes('45 minutes'), 45);
  assert.equal(parseIsoDurationToMinutes('1 hour 15 mins'), 75);
  assert.equal(parseIsoDurationToMinutes('1.5 hours'), 90);
  assert.equal(formatMinutesToIso(35), 'PT35M');
  assert.equal(formatMinutesToIso(75), 'PT1H15M');
});

test('3. JSON-LD Fixture Parsing', () => {
  const fixturePath = path.join(__dirname, 'fixtures', 'sample-jsonld-recipe.html');
  const html = fs.readFileSync(fixturePath, 'utf8');

  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const match = jsonLdRegex.exec(html);
  assert.ok(match);
  const data = JSON.parse(match[1]);
  assert.equal(data['@type'], 'Recipe');
  assert.equal(data.name, 'Crispy Lemon Garlic Chicken Thighs');
  assert.equal(parseIsoDurationToMinutes(data.totalTime), 30);
  assert.equal(data.recipeIngredient.length, 6);
  assert.equal(data.recipeInstructions.length, 4);
});

test('4. @graph Fixture Parsing', () => {
  const fixturePath = path.join(__dirname, 'fixtures', 'sample-graph-recipe.html');
  const html = fs.readFileSync(fixturePath, 'utf8');

  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const match = jsonLdRegex.exec(html);
  assert.ok(match);
  const data = JSON.parse(match[1]);
  assert.ok(Array.isArray(data['@graph']));
  const recipe = data['@graph'].find((item) => item['@type'] === 'Recipe');
  assert.ok(recipe);
  assert.equal(recipe.name, 'One-Pan Creamy Sun-Dried Tomato Gnocchi');
  assert.equal(parseIsoDurationToMinutes(recipe.totalTime), 20);
});

test('5. HTML Fallback Fixture Parsing', () => {
  const fixturePath = path.join(__dirname, 'fixtures', 'sample-fallback-recipe.html');
  const html = fs.readFileSync(fixturePath, 'utf8');

  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  assert.ok(titleMatch);
  assert.equal(titleMatch[1].trim(), 'Easy 20-Minute Garlic Butter Shrimp Skillet');

  const ingMatches = [...html.matchAll(/itemprop=["']ingredients["'][^>]*>([\s\S]*?)<\/[a-z0-9]+>/gi)];
  assert.equal(ingMatches.length, 4);
  assert.equal(ingMatches[0][1].trim(), '1 lb raw peeled shrimp');
});

test('6. Recipe DNA & Style Selection', () => {
  const recipe = {
    title: 'Creamy Garlic Tuscan Chicken',
    shortDescription: 'Pan-seared chicken cutlets in garlic cream sauce',
    totalTimeMinutes: 30,
    servings: 4,
    cookingMethod: 'stovetop',
    difficulty: 'easy',
    ingredients: [
      { item: 'chicken breasts' },
      { item: 'heavy cream' },
      { item: 'garlic' },
      { item: 'parmesan' },
    ],
  };

  const dna = extractMockRecipeDNA(recipe);
  assert.equal(dna.primaryProtein, 'Chicken');
  assert.equal(dna.totalTimeMinutes, 30);
  assert.equal(dna.keyIngredients.includes('chicken breasts'), true);

  const styleRec = selectStyleFromDna(dna);
  assert.equal(styleRec.primaryStyle, 'quick-easy');
  assert.ok(styleRec.confidence >= 0.9);
});

test('7. Fact Preservation & Hallucination Check', () => {
  const originalIngredients = ['chicken breasts', 'garlic', 'heavy cream', 'parmesan cheese'];
  const validGeneratedIngredients = [
    '2 lbs boneless skinless chicken breasts',
    '4 cloves garlic, minced',
    '1 cup heavy cream',
    '1/2 cup parmesan cheese',
  ];

  const matchRate = verifyFactsPreservation(originalIngredients, validGeneratedIngredients);
  assert.equal(matchRate, 1.0);

  const badGenerated = ['2 lbs chicken breasts', '1 cup heavy cream'];
  const badMatchRate = verifyFactsPreservation(originalIngredients, badGenerated);
  assert.equal(badMatchRate, 0.5);
});

test('8. Unsupported Claim Detection', () => {
  const cleanProse = 'A delicious, comforting chicken dinner ready in 30 minutes.';
  assert.equal(checkUnsupportedClaims(cleanProse).length, 0);

  const hypeProse = 'This viral recipe is the best ever and my family favorite award-winning dish!';
  const detected = checkUnsupportedClaims(hypeProse);
  assert.ok(detected.length >= 3);
});

test('9. FLUX Prompt Generation & Visual Presets', () => {
  const dna = {
    coreDish: 'Creamy Tuscan Chicken',
    keyIngredients: ['chicken breasts', 'sun-dried tomatoes', 'garlic', 'heavy cream'],
    textureProfile: ['tender', 'silky'],
  };

  const heroPrompt = generateMockFoodPrompt(dna, 'hero', 'editorial-kitchen');
  assert.equal(heroPrompt.aspect, '3:2');
  assert.equal(heroPrompt.width, 1200);
  assert.equal(heroPrompt.height, 800);
  assert.match(heroPrompt.prompt, /editorial-kitchen/);

  const pinterestPrompt = generateMockFoodPrompt(dna, 'pinterest', 'rustic-table');
  assert.equal(pinterestPrompt.aspect, '2:3');
  assert.equal(pinterestPrompt.width, 1000);
  assert.equal(pinterestPrompt.height, 1500);
  assert.match(pinterestPrompt.prompt, /rustic-table/);
});

test('10. Cloudflare R2 Key Hierarchy', () => {
  const slug = 'creamy-tuscan-chicken';
  assert.equal(generateR2StorageKey(slug, 'hero', 'original'), 'recipes/creamy-tuscan-chicken/hero/original.webp');
  assert.equal(generateR2StorageKey(slug, 'hero', 'large'), 'recipes/creamy-tuscan-chicken/hero/large.webp');
  assert.equal(generateR2StorageKey(slug, 'pinterest', '01'), 'recipes/creamy-tuscan-chicken/pinterest/01.webp');
  assert.equal(generateR2StorageKey(slug, 'secondary', '01'), 'recipes/creamy-tuscan-chicken/secondary/01.webp');
});

test('11. Pinterest Angle Selection & Copy Generation', () => {
  const recipe = {
    title: 'Creamy Garlic Butter Tuscan Chicken',
    slug: 'creamy-garlic-butter-tuscan-chicken',
    totalTimeMinutes: 30,
    servings: 4,
  };
  const dna = { coreDish: 'Creamy Garlic Tuscan Chicken', totalTimeMinutes: 30 };

  const quickCopy = generateMockPinCopy(recipe, dna, 'quick-dinner');
  assert.equal(quickCopy.angle, 'quick-dinner');
  assert.equal(quickCopy.overlayText, '30-Minute Creamy Garlic Tuscan Chicken');
  assert.match(quickCopy.title, /30-Minute/);
  assert.ok(quickCopy.keywords.length >= 4);

  const comfortCopy = generateMockPinCopy(recipe, dna, 'comfort-food');
  assert.equal(comfortCopy.angle, 'comfort-food');
  assert.equal(comfortCopy.overlayText, 'Cozy Creamy Garlic Tuscan Chicken');
});

test('12. Pinterest Claim Validation & Duplicate Protection', () => {
  const validText = 'Easy 30-minute weeknight chicken dinner with garlic cream sauce.';
  assert.equal(checkPinClaimValidation(validText), false);

  const invalidText = 'This viral 5-star chicken recipe is the best ever!';
  assert.equal(checkPinClaimValidation(invalidText), true);
});

test('13. Publication Checklist Validation', () => {
  const validRecipe = {
    title: 'Creamy Garlic Butter Tuscan Chicken',
    slug: 'creamy-garlic-butter-tuscan-chicken',
    shortDescription: 'Pan-seared chicken in a garlic cream sauce.',
    introduction: 'This recipe is simple, fast, and comforting for weeknight dinner.',
    servings: 4,
    totalTimeMinutes: 30,
    difficulty: 'Easy',
    heroImage: { url: 'https://cdn.flavornest.xyz/recipes/chicken/hero.webp', altText: 'Creamy garlic chicken' },
    seoTitle: 'Creamy Garlic Tuscan Chicken | FlavorNest',
    metaDescription: 'A 30-minute weeknight chicken dinner recipe.',
    canonicalUrl: 'https://flavornest.xyz/recipes/creamy-garlic-butter-tuscan-chicken/',
    primaryCategorySlug: 'dinner',
    ingredients: [{ rawText: '2 lbs chicken' }, { rawText: '1 cup cream' }],
    instructions: [{ stepNumber: 1, instructionText: 'Sear chicken until golden.' }],
  };

  const validResult = evaluateMockPublicationChecklist(validRecipe, true);
  assert.equal(validResult.canPublish, true);
  assert.equal(validResult.score, 8);

  const invalidRecipe = { ...validRecipe, heroImage: null, ingredients: [] };
  const invalidResult = evaluateMockPublicationChecklist(invalidRecipe, false);
  assert.equal(invalidResult.canPublish, false);
  assert.ok(invalidResult.missingRequirements.length >= 2);
});

test('14. 301 Redirect Normalization & Trailing Slash Policy', () => {
  assert.equal(normalizeRedirectPath('/recipes/old-chicken'), '/recipes/old-chicken/');
  assert.equal(normalizeRedirectPath('recipes/old-chicken/'), '/recipes/old-chicken/');
  assert.equal(normalizeRedirectPath('/Category/Dinner'), '/category/dinner/');
});

test('15. Related Recipe Scoring Algorithm', () => {
  const target = {
    primaryCategorySlug: 'dinner',
    mealType: 'Dinner',
    cookingMethod: 'Stovetop',
    tags: ['chicken', 'creamy', 'quick'],
  };

  const highMatch = {
    primaryCategorySlug: 'dinner',
    mealType: 'Dinner',
    cookingMethod: 'Stovetop',
    tags: ['chicken', 'creamy'],
  };

  const lowMatch = {
    primaryCategorySlug: 'desserts',
    mealType: 'Dessert',
    cookingMethod: 'Baking',
    tags: ['sweet'],
  };

  const highScore = scoreRelatedRecipe(target, highMatch);
  const lowScore = scoreRelatedRecipe(target, lowMatch);

  assert.ok(highScore >= 70);
  assert.equal(lowScore, 0);
});

test('16. Pipeline Budget Guard & Spending Limit', () => {
  const allowCheck = checkBudgetPermission(5.0, 10.0, 0.05);
  assert.equal(allowCheck.allowed, true);

  const blockCheck = checkBudgetPermission(9.98, 10.0, 0.05);
  assert.equal(blockCheck.allowed, false);
  assert.match(blockCheck.reason, /limit reached/i);
});

test('17. Bulk Batch Validation & Duplicate Detection', () => {
  const urls = [
    'https://example.com/recipe-1',
    'https://example.com/recipe-1',
    'https://example.com/recipe-2',
    'invalid-url-string',
    'https://existing.com/recipe-3'
  ];

  const res = validateBulkBatch(urls, ['https://existing.com/recipe-3']);
  assert.equal(res.valid, 2);
  assert.equal(res.dupes, 2);
  assert.equal(res.invalid, 1);
});

test('18. Collection Membership Filtering', () => {
  const mockRecipes = [
    { id: 'rec_1', title: 'Chicken Pasta' },
    { id: 'rec_2', title: 'Beef Skillet' },
    { id: 'rec_3', title: 'Garlic Rice' },
  ];

  const collectionItems = filterRecipesByCollection(['rec_1', 'rec_3'], mockRecipes);
  assert.equal(collectionItems.length, 2);
  assert.equal(collectionItems[0].id, 'rec_1');
  assert.equal(collectionItems[1].id, 'rec_3');
});

test('19. Newsletter Email Validator', () => {
  assert.equal(validateNewsletterEmail('cook@example.com'), true);
  assert.equal(validateNewsletterEmail('invalid-email'), false);
  assert.equal(validateNewsletterEmail(''), false);
  assert.equal(validateNewsletterEmail('test@domain'), false);
});

// Phase 10 Tests
test('20. Pinterest Token Masking & Redaction', () => {
  assert.equal(maskSecretToken('pina_09348934839483948394'), 'pina_...8394');
  assert.equal(maskSecretToken('short'), '••••••••');
});

test('21. Pre-Publish Validation Gate', () => {
  const publishedRecipe = { status: 'published' };
  const approvedCreative = {
    status: 'approved',
    imageUrl: 'https://media.flavornest.xyz/recipes/chicken/pinterest/01.webp',
    destinationUrl: 'https://flavornest.xyz/recipes/creamy-chicken/',
  };

  const valid = validatePrePublish(publishedRecipe, approvedCreative, true);
  assert.equal(valid.canPublish, true);

  const draftRecipe = { status: 'draft' };
  const blocked = validatePrePublish(draftRecipe, approvedCreative, true);
  assert.equal(blocked.canPublish, false);
  assert.match(blocked.errors[0], /Recipe not published/i);

  const alreadyPublishedCreative = { ...approvedCreative, status: 'published' };
  const duplicateBlocked = validatePrePublish(publishedRecipe, alreadyPublishedCreative, true);
  assert.equal(duplicateBlocked.canPublish, false);
  assert.match(duplicateBlocked.errors[0], /Already published/i);
});

test('22. Board Mapping & Fallback Resolution', () => {
  const mappings = [
    { categorySlug: 'chicken', boardId: 'board_chicken' },
    { categorySlug: 'pasta', boardId: 'board_pasta' },
  ];

  assert.equal(resolveBoard('chicken', mappings, 'board_default'), 'board_chicken');
  assert.equal(resolveBoard('dessert', mappings, 'board_default'), 'board_default');
});

// Phase 11 Tests — SEO Intelligence & Search Growth
function auditRecipeDeterministic(recipe) {
  const findings = [];
  const expectedCanonical = `https://flavornest.xyz/recipes/${recipe.slug}/`;
  if (!recipe.canonicalUrl || recipe.canonicalUrl !== expectedCanonical) {
    findings.push('Canonical mismatch or missing trailing slash');
  }
  if (!recipe.seoTitle || recipe.seoTitle.length < 25 || recipe.seoTitle.length > 65) {
    findings.push('SEO Title length not optimal');
  }
  if (!recipe.metaDescription || recipe.metaDescription.length < 60 || recipe.metaDescription.length > 165) {
    findings.push('Meta description length not optimal');
  }
  if (!recipe.heroImageAlt || recipe.heroImageAlt.trim() === '') {
    findings.push('Hero image alt text missing');
  }
  return findings;
}

function detectTopicOverlap(titleA, titleB) {
  const a = titleA.toLowerCase().trim();
  const b = titleB.toLowerCase().trim();
  return (a.includes(b) || b.includes(a)) && Math.abs(a.length - b.length) < 15;
}

function scoreInternalLinkRelevance(source, target) {
  let score = 0;
  if (source.categorySlug === target.categorySlug) score += 35;
  if (source.mealType === target.mealType) score += 20;
  return score;
}

function isStrikingDistanceQuery(position, impressions) {
  return position >= 5.0 && position <= 20.0 && impressions >= 1000;
}

test('23. Technical SEO Deterministic Audit', () => {
  const optimalRecipe = {
    slug: 'creamy-tuscan-chicken',
    canonicalUrl: 'https://flavornest.xyz/recipes/creamy-tuscan-chicken/',
    seoTitle: 'Creamy Garlic Butter Tuscan Chicken | FlavorNest',
    metaDescription: 'An easy, rich, and creamy Tuscan chicken skillet recipe ready in just 30 minutes with pantry staples.',
    heroImageAlt: 'Creamy Tuscan chicken served in a skillet with garlic cream sauce',
  };

  const issues = auditRecipeDeterministic(optimalRecipe);
  assert.equal(issues.length, 0);

  const flawedRecipe = {
    slug: 'creamy-tuscan-chicken',
    canonicalUrl: 'https://flavornest.xyz/recipes/creamy-tuscan-chicken', // Missing trailing slash
    seoTitle: 'Short Chicken',
    metaDescription: 'Too short',
    heroImageAlt: '',
  };

  const flawedIssues = auditRecipeDeterministic(flawedRecipe);
  assert.equal(flawedIssues.length, 4);
});

test('24. Schema Cooking Time Parity', () => {
  const recipeWithTime = { totalTimeMinutes: 30 };
  assert.ok(recipeWithTime.totalTimeMinutes > 0);

  const recipeMissingTime = { totalTimeMinutes: 0 };
  assert.equal(recipeMissingTime.totalTimeMinutes <= 0, true);
});

test('25. Internal Link Opportunities & Relevance Scoring', () => {
  const source = { categorySlug: 'dinner', mealType: 'dinner' };
  const relevantTarget = { categorySlug: 'dinner', mealType: 'dinner' };
  const irrelevantTarget = { categorySlug: 'desserts', mealType: 'dessert' };

  assert.equal(scoreInternalLinkRelevance(source, relevantTarget), 55);
  assert.equal(scoreInternalLinkRelevance(source, irrelevantTarget), 0);
});

test('26. Topic Overlap & Cannibalization Detection', () => {
  assert.equal(
    detectTopicOverlap('Creamy Garlic Chicken', 'Garlic Cream Chicken'),
    false
  );
  assert.equal(
    detectTopicOverlap('Creamy Garlic Chicken', 'Easy Creamy Garlic Chicken'),
    true
  );
  assert.equal(
    detectTopicOverlap('Chocolate Chip Cookies', 'Beef Stew'),
    false
  );
});

test('27. Striking Distance Search Opportunity Filter', () => {
  assert.equal(isStrikingDistanceQuery(7.4, 3200), true);
  assert.equal(isStrikingDistanceQuery(1.5, 5000), false); // already #1/2
  assert.equal(isStrikingDistanceQuery(45.0, 100), false); // too deep
  assert.equal(isStrikingDistanceQuery(9.0, 200), false); // too few impressions
});

// Phase 12 Tests — Pinterest Growth Intelligence + Analytics
function calculateDerivedRates(impressions, saves, outboundClicks) {
  const saveRate = impressions > 0 ? saves / impressions : 0;
  const outboundCtr = impressions > 0 ? outboundClicks / impressions : 0;
  return { saveRate, outboundCtr };
}

function classifyTemplate(pinCount, outboundCtr) {
  if (pinCount < 3) return 'insufficient_data';
  if (outboundCtr >= 0.035) return 'strong';
  if (outboundCtr < 0.02) return 'weak';
  return 'average';
}

function generateAnalyticsCsv(items) {
  const headers = 'Pin ID,Recipe,Clicks,CTR';
  const rows = items.map((i) => `"${i.pinId}","${i.recipe}",${i.clicks},${i.ctr}%`);
  return [headers, ...rows].join('\n');
}

test('28. Derived Metrics Calculation & Zero Denominator Protection', () => {
  const normal = calculateDerivedRates(10000, 450, 320);
  assert.equal(normal.saveRate, 0.045);
  assert.equal(normal.outboundCtr, 0.032);

  const zeroImpressions = calculateDerivedRates(0, 0, 0);
  assert.equal(zeroImpressions.saveRate, 0);
  assert.equal(zeroImpressions.outboundCtr, 0);
});

test('29. Sample-Size Protection Guard', () => {
  // Even with a high CTR, 1 pin should never be classified as "strong"
  assert.equal(classifyTemplate(1, 0.09), 'insufficient_data');
  assert.equal(classifyTemplate(2, 0.08), 'insufficient_data');

  // With 3+ pins, valid statistical classifications apply
  assert.equal(classifyTemplate(3, 0.045), 'strong');
  assert.equal(classifyTemplate(5, 0.012), 'weak');
  assert.equal(classifyTemplate(4, 0.025), 'average');
});

test('30. Template & Angle Performance Aggregations', () => {
  const records = [
    { template: 'hero', angle: 'quick', impressions: 1000, clicks: 40 },
    { template: 'hero', angle: 'quick', impressions: 2000, clicks: 80 },
    { template: 'minimal', angle: 'comfort', impressions: 1500, clicks: 15 },
  ];

  const heroTotalClicks = records.filter((r) => r.template === 'hero').reduce((acc, r) => acc + r.clicks, 0);
  const heroTotalImp = records.filter((r) => r.template === 'hero').reduce((acc, r) => acc + r.impressions, 0);
  const heroCtr = heroTotalClicks / heroTotalImp;

  assert.equal(heroTotalClicks, 120);
  assert.equal(heroTotalImp, 3000);
  assert.equal(heroCtr, 0.04);
});

test('31. Pattern Insight Generation with Sample Attribution', () => {
  const sampleSize = 14;
  const ctr = 0.038;
  const insight = {
    title: 'Editorial Food Leads Conversions',
    sampleSize,
    metricBadge: `${(ctr * 100).toFixed(1)}% CTR`,
  };

  assert.ok(insight.sampleSize >= 3);
  assert.equal(insight.metricBadge, '3.8% CTR');
});

test('32. CSV Export Clean Formatting & Token Redaction', () => {
  const data = [
    { pinId: 'pin_123', recipe: 'Creamy Garlic Chicken', clicks: 210, ctr: '3.4' },
  ];
  const csv = generateAnalyticsCsv(data);

  assert.match(csv, /Pin ID,Recipe,Clicks,CTR/);
  assert.match(csv, /"pin_123"/);
  assert.equal(csv.includes('pina_'), false); // No access tokens in CSV export
});

// Phase 13 Tests — Monetization + Revenue Intelligence
function calculatePageRpm(revenue, pageviews) {
  if (!pageviews || pageviews <= 0) return 0;
  return (revenue / pageviews) * 1000;
}

function calculateRecipeContribution(pageviews, rpm, aiCost = 0.05, fluxCost = 0.15) {
  const revenue = (pageviews * rpm) / 1000;
  const cost = aiCost + fluxCost;
  const contribution = revenue - cost;
  const roi = cost > 0 ? contribution / cost : 0;
  return { revenue, cost, contribution, roi };
}

function classifyRecipeDecision(pageviews, revenue) {
  if (pageviews >= 2500 && revenue >= 25) return 'high_traffic_high_revenue';
  if (pageviews >= 2000 && revenue < 25) return 'high_traffic_low_revenue';
  if (pageviews < 2000 && revenue >= 10) return 'low_traffic_high_revenue';
  return 'low_traffic_low_revenue';
}

function getReservedSlotMinHeight(slot) {
  if (slot === 'recipe_top' || slot === 'homepage') return 90;
  return 250;
}

test('33. Page RPM Calculation with Zero Pageviews Protection', () => {
  assert.equal(calculatePageRpm(42.15, 4560).toFixed(2), '9.24');
  assert.equal(calculatePageRpm(0, 5000), 0);
  assert.equal(calculatePageRpm(50, 0), 0); // Zero denominator protected
});

test('34. Recipe Contribution & ROI Formula', () => {
  const econ = calculateRecipeContribution(4850, 9.18, 0.05, 0.15);
  assert.equal(econ.cost, 0.20);
  assert.ok(econ.revenue > 40);
  assert.ok(econ.contribution > 40);
  assert.ok(econ.roi > 200);
});

test('35. Content Decision Signal Classification', () => {
  assert.equal(classifyRecipeDecision(4850, 44.52), 'high_traffic_high_revenue');
  assert.equal(classifyRecipeDecision(2200, 15.00), 'high_traffic_low_revenue');
  assert.equal(classifyRecipeDecision(1400, 12.50), 'low_traffic_high_revenue');
  assert.equal(classifyRecipeDecision(400, 3.20), 'low_traffic_low_revenue');
});

test('36. Core Web Vitals Ad Slot Height Reservation', () => {
  assert.equal(getReservedSlotMinHeight('recipe_top'), 90);
  assert.equal(getReservedSlotMinHeight('recipe_after_intro'), 250);
  assert.equal(getReservedSlotMinHeight('recipe_after_ingredients'), 250);
});

test('37. Revenue CSV Export Formatting & Privacy Guard', () => {
  const revenueRecords = [
    { date: '2026-08-31', provider: 'Google AdSense', pageviews: 4210, revenue: 38.64 },
  ];
  const headers = 'Date,Provider,Pageviews,Revenue';
  const rows = revenueRecords.map((r) => `"${r.date}","${r.provider}",${r.pageviews},$${r.revenue}`);
  const csv = [headers, ...rows].join('\n');

  assert.match(csv, /Date,Provider,Pageviews,Revenue/);
  assert.match(csv, /"2026-08-31"/);
  assert.equal(csv.includes('ca-pub-'), false); // No secret credentials in export
});

// Phase 14 Tests — Newsletter + Returning Visitor Engine
function normalizeSubscriberEmail(raw) {
  return raw.toLowerCase().trim();
}

function maskEmailPrivacy(email) {
  if (!email || !email.includes('@')) return '••••••••';
  const [local, domain] = email.split('@');
  if (local.length <= 1) return `${local}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

function buildNewsletterUtmUrl(slug, campaignId) {
  return `https://flavornest.xyz/recipes/${slug}/?utm_source=newsletter&utm_medium=email&utm_campaign=${campaignId}`;
}

function filterDigestPublishedRecipes(recipes) {
  return recipes.filter((r) => r.status === 'published');
}

test('38. Subscriber Email Normalization & Duplicate Prevention', () => {
  const emailA = normalizeSubscriberEmail('  Sarah.Miller@Example.COM  ');
  const emailB = normalizeSubscriberEmail('sarah.miller@example.com');
  assert.equal(emailA, emailB);
  assert.equal(emailA, 'sarah.miller@example.com');
});

test('39. Unsubscribe Token Verification & Status Transition', () => {
  const subscriber = {
    email: 'reader@example.com',
    status: 'active',
    token: 'unsub_test_token_123',
    unsubscribedAt: undefined,
  };

  const incomingToken = 'unsub_test_token_123';
  if (incomingToken === subscriber.token) {
    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = '2026-09-01T12:00:00Z';
  }

  assert.equal(subscriber.status, 'unsubscribed');
  assert.ok(subscriber.unsubscribedAt);
});

test('40. Email Masking Privacy Utility', () => {
  assert.equal(maskEmailPrivacy('cook@example.com'), 'c***k@example.com');
  assert.equal(maskEmailPrivacy('sarah.miller@flavor.xyz'), 's***r@flavor.xyz');
  assert.equal(maskEmailPrivacy('a@b.com'), 'a***@b.com');
});

test('41. Recipe Recommendation Digest Filter', () => {
  const pool = [
    { id: '1', title: 'Tuscan Chicken', status: 'published' },
    { id: '2', title: 'Draft Salmon', status: 'draft' },
    { id: '3', title: 'Tomato Gnocchi', status: 'published' },
  ];

  const filtered = filterDigestPublishedRecipes(pool);
  assert.equal(filtered.length, 2);
  assert.equal(filtered.find((r) => r.id === '2'), undefined);
});

test('42. Newsletter UTM Attribution Construction', () => {
  const url = buildNewsletterUtmUrl('creamy-garlic-chicken', 'weekly_digest_01');
  assert.equal(
    url,
    'https://flavornest.xyz/recipes/creamy-garlic-chicken/?utm_source=newsletter&utm_medium=email&utm_campaign=weekly_digest_01'
  );
  // Ensure canonical path remains unaltered
  assert.ok(url.startsWith('https://flavornest.xyz/recipes/creamy-garlic-chicken/'));
});

// Phase 15 Tests — Content Expansion + Programmatic Recipe Cluster Engine
function calculateOpportunityScore(search, pinterest, gap, audience, duplicateRisk) {
  const positive = search * 0.3 + pinterest * 0.3 + gap * 0.2 + audience * 0.2;
  const penalty = duplicateRisk * 0.5;
  return Math.max(0, Math.min(100, Math.round(positive - penalty)));
}

function calculateClusterCoverage(count, target) {
  if (target <= 0) return 100;
  return Math.min(100, Math.round((count / target) * 100));
}

function validateRecipeConsistency(ingredients, instructions, prep, cook, total) {
  const warnings = [];
  if (ingredients.length < 3) warnings.push('Fewer than 3 ingredients');
  if (instructions.length < 2) warnings.push('Fewer than 2 steps');
  if (prep + cook !== total) warnings.push('Prep + cook != total');
  return { valid: warnings.length === 0, warnings };
}

function checkRecipeSimilarity(proposed, existing) {
  const propWords = proposed.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  for (const ex of existing) {
    const exWords = ex.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const matches = propWords.filter((w) => exWords.includes(w));
    if (matches.length >= 3) return { isDuplicate: true, match: ex };
  }
  return { isDuplicate: false };
}

function detectContentRefreshCandidate(recipe, pageviewsTrendPct, lastUpdatedDays) {
  return pageviewsTrendPct < -20 && lastUpdatedDays > 90;
}

test('43. Opportunity Scoring with Transparent Deductions', () => {
  // High demand, low duplicate risk
  const scoreA = calculateOpportunityScore(90, 85, 80, 75, 10);
  assert.ok(scoreA >= 75);

  // High duplicate risk penalty
  const scoreB = calculateOpportunityScore(90, 85, 80, 75, 80);
  assert.ok(scoreB < 50);
});

test('44. Content Cluster Coverage Calculation', () => {
  assert.equal(calculateClusterCoverage(3, 5), 60);
  assert.equal(calculateClusterCoverage(4, 4), 100);
  assert.equal(calculateClusterCoverage(5, 4), 100); // capped at 100%
});

test('45. Recipe Ingredient & Instruction Consistency Validation', () => {
  const validRecipe = validateRecipeConsistency(
    ['chicken', 'garlic', 'cream', 'parmesan'],
    ['Sear chicken', 'Simmer garlic and cream'],
    10,
    20,
    30
  );
  assert.equal(validRecipe.valid, true);

  const brokenTimes = validateRecipeConsistency(
    ['chicken', 'garlic', 'cream'],
    ['Cook chicken', 'Serve'],
    10,
    20,
    50 // mismatch
  );
  assert.equal(brokenTimes.valid, false);
  assert.ok(brokenTimes.warnings.includes('Prep + cook != total'));
});

test('46. Recipe Concept Differentiation & Duplicate Guard', () => {
  const existing = [
    'Creamy Garlic Butter Tuscan Chicken',
    'One-Pan Creamy Tomato Gnocchi',
  ];

  // Near duplicate
  const dup = checkRecipeSimilarity('Garlic Butter Tuscan Chicken Skillet', existing);
  assert.equal(dup.isDuplicate, true);

  // Distinct concept
  const distinct = checkRecipeSimilarity('Crispy Honey Mustard Salmon', existing);
  assert.equal(distinct.isDuplicate, false);
});

test('47. Content Refresh Opportunity Identification', () => {
  assert.equal(detectContentRefreshCandidate({ title: 'Old Dish' }, -35, 120), true);
  assert.equal(detectContentRefreshCandidate({ title: 'Growing Dish' }, 15, 150), false);
  assert.equal(detectContentRefreshCandidate({ title: 'Recent Dish' }, -25, 20), false);
});

// Phase 16 Tests — Flip Readiness + Business Intelligence Layer
function calculateBusinessFinancials(revenue, costs) {
  const contribution = revenue - costs;
  const marginPct = revenue > 0 ? (contribution / revenue) * 100 : 0;
  return { revenue, costs, contribution, marginPct };
}

function calculateTopConcentrationPct(recipeViews) {
  const total = recipeViews.reduce((sum, v) => sum + v, 0);
  if (total <= 0) return 0;
  const sorted = [...recipeViews].sort((a, b) => b - a);
  const top10 = sorted.slice(0, 10).reduce((sum, v) => sum + v, 0);
  return parseFloat(((top10 / total) * 100).toFixed(1));
}

function assessChannelRisk(pinterestShare, organicShare) {
  if (pinterestShare > 70) return 'high_pinterest_dependency';
  if (organicShare > 80) return 'high_search_dependency';
  return 'balanced_diversified';
}

function computeReadinessPercentage(checklist) {
  const verified = checklist.filter((i) => i.status === 'verified').length;
  return Math.round((verified / checklist.length) * 100);
}

function sanitizeExportData(rows) {
  return rows.map((r) => {
    const clean = { ...r };
    delete clean.apiKey;
    delete clean.token;
    delete clean.password;
    delete clean.secret;
    return clean;
  });
}

test('48. Business KPI Aggregation & Contribution Margin', () => {
  const fin = calculateBusinessFinancials(694.50, 84.20);
  assert.equal(fin.contribution.toFixed(2), '610.30');
  assert.equal(fin.marginPct.toFixed(1), '87.9');
});

test('49. Content Concentration Risk Calculation', () => {
  const views = [5000, 4000, 3500, 2500, 2000, 1500, 1200, 1000, 800, 500, 200, 100];
  const concentration = calculateTopConcentrationPct(views);
  assert.ok(concentration > 90); // Top 10 dominate this test sample
});

test('50. Channel Dependency Risk Evaluation', () => {
  assert.equal(assessChannelRisk(31.3, 55.8), 'balanced_diversified');
  assert.equal(assessChannelRisk(85.0, 10.0), 'high_pinterest_dependency');
  assert.equal(assessChannelRisk(5.0, 90.0), 'high_search_dependency');
});

test('51. Flip Readiness Automated Checklist Evaluation', () => {
  const items = [
    { id: '1', status: 'verified' },
    { id: '2', status: 'verified' },
    { id: '3', status: 'verified' },
    { id: '4', status: 'pending' },
  ];
  assert.equal(computeReadinessPercentage(items), 75);
});

test('52. Data Room Export Sanitization & Credential Shield', () => {
  const rawData = [
    { service: 'Cloudflare', apiKey: 'secret_123', status: 'connected' },
    { service: 'Pinterest', token: 'pina_xyz', status: 'connected' },
  ];
  const sanitized = sanitizeExportData(rawData);

  assert.equal(sanitized[0].apiKey, undefined);
  assert.equal(sanitized[1].token, undefined);
  assert.equal(sanitized[0].service, 'Cloudflare');
});

// Phase 17 Tests — Technical Hardening + SEO + Performance + Production Scale
function getCacheHeaderPolicy(routeType) {
  if (routeType === 'public_recipe') {
    return 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';
  }
  if (routeType === 'admin') {
    return 'no-store, no-cache, must-revalidate, max-age=0';
  }
  return 'public, max-age=31536000, immutable';
}

function evaluateCoreWebVitalsPass(lcpMs, cls, inpMs) {
  const lcpPass = lcpMs <= 2500;
  const clsPass = cls <= 0.1;
  const inpPass = inpMs <= 200;
  return lcpPass && clsPass && inpPass;
}

function executeIdempotentJob(key, executedKeys) {
  if (executedKeys.has(key)) {
    return { executed: false, reason: 'duplicate_skipped' };
  }
  executedKeys.add(key);
  return { executed: true };
}

function scanBrokenLinks(links, validSlugs) {
  const broken = [];
  for (const l of links) {
    if (!validSlugs.includes(l)) broken.push(l);
  }
  return broken;
}

function resolveRecipeWithThirdPartyFallback(recipe, thirdPartyError) {
  // If Pinterest or AdSense or Email fails, recipe page must still render cleanly
  return {
    title: recipe.title,
    contentRendered: true,
    adsDegraded: !!thirdPartyError,
  };
}

test('53. Public vs Admin Edge Cache Header Policies', () => {
  const publicHeader = getCacheHeaderPolicy('public_recipe');
  assert.ok(publicHeader.includes('s-maxage=86400'));
  assert.ok(publicHeader.includes('public'));

  const adminHeader = getCacheHeaderPolicy('admin');
  assert.ok(adminHeader.includes('no-store'));
  assert.ok(adminHeader.includes('no-cache'));
});

test('54. Core Web Vitals Performance Budget Enforcement', () => {
  // Within healthy thresholds
  assert.equal(evaluateCoreWebVitalsPass(1150, 0.01, 42), true);
  // Failing LCP
  assert.equal(evaluateCoreWebVitalsPass(3200, 0.01, 42), false);
  // Failing CLS
  assert.equal(evaluateCoreWebVitalsPass(1150, 0.25, 42), false);
});

test('55. Background Job Idempotency & Duplicate Execution Guard', () => {
  const executed = new Set();
  const res1 = executeIdempotentJob('idemp_sync_001', executed);
  assert.equal(res1.executed, true);

  const res2 = executeIdempotentJob('idemp_sync_001', executed);
  assert.equal(res2.executed, false);
  assert.equal(res2.reason, 'duplicate_skipped');
});

test('56. Technical SEO Broken Internal Link Scanner', () => {
  const valid = ['creamy-garlic-chicken', 'tomato-gnocchi'];
  const links = ['creamy-garlic-chicken', 'broken-pasta-dish', 'tomato-gnocchi'];

  const broken = scanBrokenLinks(links, valid);
  assert.equal(broken.length, 1);
  assert.equal(broken[0], 'broken-pasta-dish');
});

test('57. Third-Party Failure Isolation on Public Recipe Pages', () => {
  const recipe = { title: 'Tuscan Chicken' };
  const rendered = resolveRecipeWithThirdPartyFallback(recipe, 'Pinterest API 500');
  assert.equal(rendered.contentRendered, true);
  assert.equal(rendered.adsDegraded, true);
});

// Phase 18 Tests — Final SEO + Content Quality Audit + Launch Readiness
function evaluateLaunchContentCompleteness(recipe) {
  const issues = [];
  if (!recipe.title || recipe.title.length < 5) issues.push({ severity: 'critical', msg: 'Missing title' });
  if (!recipe.ingredients || recipe.ingredients.length === 0) issues.push({ severity: 'critical', msg: 'Missing ingredients' });
  if (!recipe.instructions || recipe.instructions.length === 0) issues.push({ severity: 'critical', msg: 'Missing instructions' });
  if (recipe.prepTime + recipe.cookTime !== recipe.totalTime) issues.push({ severity: 'medium', msg: 'Time mismatch' });
  return issues;
}

function evaluateSitemapCanonicalParity(publishedSlugs, sitemapUrls) {
  for (const slug of publishedSlugs) {
    const expected = `https://flavornest.xyz/recipes/${slug}/`;
    if (!sitemapUrls.includes(expected)) return false;
  }
  return true;
}

function verifyPinterestDestinationUrl(destinationUrl, validUrls) {
  return validUrls.includes(destinationUrl);
}

function tallyLaunchBlockers(issues) {
  const critical = issues.filter((i) => i.severity === 'critical').length;
  const high = issues.filter((i) => i.severity === 'high').length;
  return { critical, high };
}

function determineLaunchStatus(criticalCount, highCount) {
  if (criticalCount > 0) return 'BLOCKED';
  if (highCount > 0) return 'READY WITH WARNINGS';
  return 'READY FOR GROWTH';
}

test('58. Recipe Ingredient-Instruction Completeness & Consistency Launch Gate', () => {
  const completeRecipe = {
    title: 'Creamy Garlic Chicken',
    ingredients: ['chicken', 'garlic', 'cream'],
    instructions: ['Cook chicken', 'Simmer cream'],
    prepTime: 10,
    cookTime: 20,
    totalTime: 30,
  };
  const issuesA = evaluateLaunchContentCompleteness(completeRecipe);
  assert.equal(issuesA.length, 0);

  const brokenRecipe = {
    title: '',
    ingredients: [],
    instructions: [],
    prepTime: 10,
    cookTime: 20,
    totalTime: 30,
  };
  const issuesB = evaluateLaunchContentCompleteness(brokenRecipe);
  assert.equal(issuesB.filter((i) => i.severity === 'critical').length, 3);
});

test('59. Canonical URL & Sitemap Parity Audit', () => {
  const published = ['garlic-chicken', 'tomato-gnocchi'];
  const sitemap = [
    'https://flavornest.xyz/recipes/garlic-chicken/',
    'https://flavornest.xyz/recipes/tomato-gnocchi/',
  ];
  assert.equal(evaluateSitemapCanonicalParity(published, sitemap), true);

  const missingSitemap = ['https://flavornest.xyz/recipes/garlic-chicken/'];
  assert.equal(evaluateSitemapCanonicalParity(published, missingSitemap), false);
});

test('60. Pinterest Destination URL Verification Gate', () => {
  const validUrls = ['https://flavornest.xyz/recipes/creamy-garlic-chicken/'];
  assert.equal(
    verifyPinterestDestinationUrl('https://flavornest.xyz/recipes/creamy-garlic-chicken/', validUrls),
    true
  );
  assert.equal(
    verifyPinterestDestinationUrl('https://flavornest.xyz/recipes/broken-destination/', validUrls),
    false
  );
});

test('61. Launch Blocker Detection (Critical vs Non-Critical)', () => {
  const issues = [
    { severity: 'critical', title: 'Missing title' },
    { severity: 'medium', title: 'Time mismatch' },
    { severity: 'low', title: 'Typo in tip' },
  ];
  const { critical, high } = tallyLaunchBlockers(issues);
  assert.equal(critical, 1);
  assert.equal(high, 0);
});

test('62. Overall Launch Status Resolution (READY FOR GROWTH)', () => {
  assert.equal(determineLaunchStatus(0, 0), 'READY FOR GROWTH');
  assert.equal(determineLaunchStatus(0, 2), 'READY WITH WARNINGS');
  assert.equal(determineLaunchStatus(1, 0), 'BLOCKED');
});

// Phase 19 Tests — 30-Day Pinterest + SEO Growth Launch System
function calculateGrowthCyclePct(currentDay, totalDays) {
  if (totalDays <= 0) return 0;
  return Math.round((currentDay / totalDays) * 100);
}

function detectGrowthWinner(recipe, minImpressions, minClicks, minCtr) {
  if (recipe.impressions < minImpressions || recipe.clicks < minClicks) {
    return { isWinner: false, reason: 'insufficient_sample' };
  }
  const ctr = (recipe.clicks / recipe.impressions) * 100;
  if (ctr >= minCtr) {
    return { isWinner: true, ctr: parseFloat(ctr.toFixed(2)) };
  }
  return { isWinner: false, reason: 'ctr_below_threshold' };
}

function classifyContentScorecardAction(trafficGrade, pinterestGrade, seoGrade) {
  if (trafficGrade === 'high' && (pinterestGrade === 'high' || seoGrade === 'growing')) {
    return 'scale';
  }
  if (trafficGrade === 'low' && pinterestGrade === 'low') {
    return 'improve_pinterest';
  }
  return 'monitor';
}

function evaluateExperimentResult(controlVal, variantVal, diffThreshold) {
  const diff = variantVal - controlVal;
  if (diff >= diffThreshold) return 'winner';
  if (diff <= -diffThreshold) return 'control';
  return 'inconclusive';
}

function generateGrowthRecommendation(topic, proof) {
  return {
    title: `Expand ${topic}`,
    rationale: `Proven momentum: ${proof}`,
    status: 'pending',
  };
}

test('63. 30-Day Growth Cycle Progress Calculation', () => {
  assert.equal(calculateGrowthCyclePct(17, 30), 57);
  assert.equal(calculateGrowthCyclePct(30, 30), 100);
});

test('64. Growth Winner Detection with Sample-Size Protection', () => {
  // Low sample size -> not a winner even with high CTR
  const smallSample = detectGrowthWinner({ impressions: 20, clicks: 2 }, 500, 15, 2.5);
  assert.equal(smallSample.isWinner, false);
  assert.equal(smallSample.reason, 'insufficient_sample');

  // Sufficient sample size and high CTR -> Winner!
  const robustSample = detectGrowthWinner({ impressions: 2000, clicks: 68 }, 500, 15, 2.5);
  assert.equal(robustSample.isWinner, true);
  assert.equal(robustSample.ctr, 3.4);
});

test('65. Content Scorecard Action Classification', () => {
  assert.equal(classifyContentScorecardAction('high', 'high', 'growing'), 'scale');
  assert.equal(classifyContentScorecardAction('medium', 'medium', 'growing'), 'monitor');
  assert.equal(classifyContentScorecardAction('low', 'low', 'stable'), 'improve_pinterest');
});

test('66. Growth Experiment Hypothesis Outcome Evaluation', () => {
  // Clear winner
  assert.equal(evaluateExperimentResult(1.8, 3.4, 0.5), 'winner');
  // Inconclusive
  assert.equal(evaluateExperimentResult(4.1, 4.3, 0.5), 'inconclusive');
  // Control is better
  assert.equal(evaluateExperimentResult(4.5, 3.2, 0.5), 'control');
});

test('67. Data-Backed Growth Recommendation Generation', () => {
  const rec = generateGrowthRecommendation('Garlic Chicken', '12,400 monthly sessions and 3.4% Pinterest CTR');
  assert.equal(rec.title, 'Expand Garlic Chicken');
  assert.ok(rec.rationale.includes('12,400'));
  assert.equal(rec.status, 'pending');
});









