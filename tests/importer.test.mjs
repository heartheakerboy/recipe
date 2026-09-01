import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import our TS modules via dynamic imports / local files
import { validateRecipeUrl, isPrivateOrReservedHost, normalizeRecipeUrl } from '../src/lib/importer/url-validator.ts';
import { parseIsoDurationToMinutes } from '../src/lib/importer/time-parser.ts';
import { normalizeIngredientLine, normalizeIngredientList } from '../src/lib/importer/ingredient-normalizer.ts';
import { extractRecipeFromJsonLd } from '../src/lib/importer/jsonld-extractor.ts';
import { extractRecipeFromHtmlFallback, extractPageMetadata } from '../src/lib/importer/html-extractor.ts';

test('1. SSRF & URL Validation', () => {
  // Disallowed hosts
  assert.equal(isPrivateOrReservedHost('localhost'), true);
  assert.equal(isPrivateOrReservedHost('127.0.0.1'), true);
  assert.equal(isPrivateOrReservedHost('10.0.0.1'), true);
  assert.equal(isPrivateOrReservedHost('172.16.0.5'), true);
  assert.equal(isPrivateOrReservedHost('192.168.1.100'), true);
  assert.equal(isPrivateOrReservedHost('169.254.169.254'), true);
  assert.equal(isPrivateOrReservedHost('::1'), true);
  assert.equal(isPrivateOrReservedHost('app.internal'), true);

  // Allowed valid public hosts
  assert.equal(isPrivateOrReservedHost('example.com'), false);
  assert.equal(isPrivateOrReservedHost('allrecipes.com'), false);
  assert.equal(isPrivateOrReservedHost('nytimes.com'), false);

  // validateRecipeUrl results
  const badUrl = validateRecipeUrl('http://localhost:3000/recipe/1');
  assert.equal(badUrl.isValid, false);
  assert.match(badUrl.error || '', /Security Exception/i);

  const privateIpUrl = validateRecipeUrl('http://192.168.1.1/food');
  assert.equal(privateIpUrl.isValid, false);

  const goodUrl = validateRecipeUrl('https://example.com/recipes/tuscan-chicken?utm_source=fb&ref=123');
  assert.equal(goodUrl.isValid, true);
  assert.equal(goodUrl.normalizedUrl, 'https://example.com/recipes/tuscan-chicken');
  assert.equal(goodUrl.domain, 'example.com');
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
  assert.equal(parseIsoDurationToMinutes(''), 0);
  assert.equal(parseIsoDurationToMinutes(null), 0);
});

test('3. Ingredient Normalizer', () => {
  const line1 = normalizeIngredientLine('2 cups heavy whipping cream, chilled', 0);
  assert.equal(line1.quantity, 2);
  assert.equal(line1.unit, 'cups');
  assert.equal(line1.item, 'heavy whipping cream');
  assert.equal(line1.notes, 'chilled');

  const line2 = normalizeIngredientLine('1/2 tsp kosher salt', 1);
  assert.equal(line2.quantity, 0.5);
  assert.equal(line2.unit, 'tsp');
  assert.equal(line2.item, 'kosher salt');

  const line3 = normalizeIngredientLine('4 cloves garlic, minced', 2);
  assert.equal(line3.quantity, 4);
  assert.equal(line3.unit, 'cloves');
  assert.equal(line3.item, 'garlic');
});

test('4. JSON-LD Recipe Extraction', () => {
  const fixturePath = path.join(__dirname, 'fixtures', 'sample-jsonld-recipe.html');
  const html = fs.readFileSync(fixturePath, 'utf8');

  const recipe = extractRecipeFromJsonLd(html);
  assert.ok(recipe);
  assert.equal(recipe.title, 'Crispy Lemon Garlic Chicken Thighs');
  assert.equal(recipe.prepTimeMinutes, 10);
  assert.equal(recipe.cookTimeMinutes, 20);
  assert.equal(recipe.totalTimeMinutes, 30);
  assert.equal(recipe.servings, 4);
  assert.equal(recipe.ingredients.length, 6);
  assert.equal(recipe.instructions.length, 4);
  assert.equal(recipe.imageUrl, 'https://images.example.com/chicken.jpg');
});

test('5. JSON-LD @graph & HowToStep Extraction', () => {
  const fixturePath = path.join(__dirname, 'fixtures', 'sample-graph-recipe.html');
  const html = fs.readFileSync(fixturePath, 'utf8');

  const recipe = extractRecipeFromJsonLd(html);
  assert.ok(recipe);
  assert.equal(recipe.title, 'One-Pan Creamy Sun-Dried Tomato Gnocchi');
  assert.equal(recipe.prepTimeMinutes, 5);
  assert.equal(recipe.cookTimeMinutes, 15);
  assert.equal(recipe.totalTimeMinutes, 20);
  assert.equal(recipe.servings, 4);
  assert.equal(recipe.ingredients.length, 4);
  assert.equal(recipe.instructions.length, 3); // 2 inside HowToSection + 1 HowToStep
  assert.equal(recipe.instructions[0].title, 'Sauce Preparation');
  assert.equal(recipe.imageUrl, 'https://images.example.com/gnocchi.webp');
});

test('6. HTML & Microdata Fallback Extraction', () => {
  const fixturePath = path.join(__dirname, 'fixtures', 'sample-fallback-recipe.html');
  const html = fs.readFileSync(fixturePath, 'utf8');

  const recipe = extractRecipeFromHtmlFallback(html);
  assert.ok(recipe);
  assert.equal(recipe.title, 'Easy 20-Minute Garlic Butter Shrimp Skillet');
  assert.equal(recipe.ingredients.length, 4);
  assert.equal(recipe.instructions.length, 3);
  assert.equal(recipe.imageUrl, 'https://images.example.com/shrimp.jpg');
});
