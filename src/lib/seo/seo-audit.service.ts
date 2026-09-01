import { Recipe } from '../types/recipe';
import { SeoFinding, RecipeSeoAuditResult, TopicOverlapAlert } from '../types/seo-intelligence';
import { generateRecipeJsonLd } from './structured-data';

export class SeoAuditService {
  auditRecipe(recipe: Recipe, allRecipes: Recipe[] = []): RecipeSeoAuditResult {
    const findings: SeoFinding[] = [];
    const passedChecks: string[] = [];

    // =========================================================================
    // 1. TECHNICAL SEO CHECKS
    // =========================================================================

    // Canonical & Trailing Slash
    const expectedCanonical = `https://flavornest.xyz/recipes/${recipe.slug}/`;
    if (!recipe.canonicalUrl) {
      findings.push({
        id: `tech_canonical_missing_${recipe.id}`,
        recipeId: recipe.id,
        category: 'technical',
        severity: 'high',
        title: 'Missing Canonical URL',
        description: 'The recipe does not specify a canonical link, risking duplicate content in search engines.',
        suggestion: `Set canonical URL to ${expectedCanonical}`,
        proposedValue: expectedCanonical,
      });
    } else if (recipe.canonicalUrl !== expectedCanonical) {
      findings.push({
        id: `tech_canonical_mismatch_${recipe.id}`,
        recipeId: recipe.id,
        category: 'technical',
        severity: 'medium',
        title: 'Canonical URL Mismatch or Missing Trailing Slash',
        description: `Canonical (${recipe.canonicalUrl}) does not match expected format (${expectedCanonical}).`,
        suggestion: `Update canonical URL to ${expectedCanonical}`,
        currentValue: recipe.canonicalUrl,
        proposedValue: expectedCanonical,
      });
    } else {
      passedChecks.push('Canonical URL valid with consistent trailing slash');
    }

    // SEO Title
    if (!recipe.seoTitle || recipe.seoTitle.trim() === '') {
      findings.push({
        id: `tech_title_missing_${recipe.id}`,
        recipeId: recipe.id,
        category: 'technical',
        severity: 'high',
        title: 'Missing SEO Title',
        description: 'A custom SEO title tag is required for search engine result snippets.',
        suggestion: `Use: ${recipe.title} (${recipe.totalTimeMinutes}-Minute Recipe) | FlavorNest`,
        proposedValue: `${recipe.title} (${recipe.totalTimeMinutes}-Minute Recipe) | FlavorNest`,
      });
    } else if (recipe.seoTitle.length < 25) {
      findings.push({
        id: `tech_title_short_${recipe.id}`,
        recipeId: recipe.id,
        category: 'technical',
        severity: 'low',
        title: 'Short SEO Title',
        description: `SEO title is ${recipe.seoTitle.length} characters. Consider expanding to 45–60 characters for higher CTR.`,
        suggestion: `Expand to include time or cooking method: ${recipe.title} (${recipe.totalTimeMinutes}-Minute Recipe) | FlavorNest`,
        currentValue: recipe.seoTitle,
      });
    } else if (recipe.seoTitle.length > 65) {
      findings.push({
        id: `tech_title_long_${recipe.id}`,
        recipeId: recipe.id,
        category: 'technical',
        severity: 'low',
        title: 'Long SEO Title May Be Truncated',
        description: `SEO title is ${recipe.seoTitle.length} characters and may be clipped in search snippets (ideal: under 60).`,
        suggestion: 'Shorten title to keep key dish name and branding visible.',
        currentValue: recipe.seoTitle,
      });
    } else {
      passedChecks.push(`SEO Title optimized (${recipe.seoTitle.length} chars)`);
    }

    // Meta Description
    if (!recipe.metaDescription || recipe.metaDescription.trim() === '') {
      findings.push({
        id: `tech_meta_missing_${recipe.id}`,
        recipeId: recipe.id,
        category: 'technical',
        severity: 'high',
        title: 'Missing Meta Description',
        description: 'A compelling meta description is critical for search snippet click-through rates.',
        suggestion: `An easy, flavorful ${recipe.title.toLowerCase()} ready in ${recipe.totalTimeMinutes} minutes. Made with simple pantry staples.`,
        proposedValue: `An easy, flavorful ${recipe.title.toLowerCase()} ready in ${recipe.totalTimeMinutes} minutes. Made with simple pantry staples.`,
      });
    } else if (recipe.metaDescription.length < 60) {
      findings.push({
        id: `tech_meta_short_${recipe.id}`,
        recipeId: recipe.id,
        category: 'technical',
        severity: 'medium',
        title: 'Short Meta Description',
        description: `Meta description is only ${recipe.metaDescription.length} characters (ideal: 120–155).`,
        suggestion: 'Add details about flavor, key ingredients, or why readers will love it.',
        currentValue: recipe.metaDescription,
      });
    } else if (recipe.metaDescription.length > 165) {
      findings.push({
        id: `tech_meta_long_${recipe.id}`,
        recipeId: recipe.id,
        category: 'technical',
        severity: 'low',
        title: 'Meta Description Exceeds Recommended Length',
        description: `Meta description is ${recipe.metaDescription.length} characters and may truncate on mobile displays.`,
        suggestion: 'Trim to under 155 characters.',
        currentValue: recipe.metaDescription,
      });
    } else {
      passedChecks.push(`Meta description optimized (${recipe.metaDescription.length} chars)`);
    }

    // =========================================================================
    // 2. CONTENT SEO CHECKS
    // =========================================================================

    // Introduction check
    if (!recipe.introduction || recipe.introduction.length < 80) {
      findings.push({
        id: `content_thin_intro_${recipe.id}`,
        recipeId: recipe.id,
        category: 'content',
        severity: 'medium',
        title: 'Thin Editorial Story & Introduction',
        description: 'The recipe introduction is unusually short or missing, reducing helpful context for home cooks.',
        suggestion: 'Add 2–3 sentences describing the dish flavor profile, texture, and best serving occasions.',
      });
    } else {
      passedChecks.push('Editorial introduction provides sufficient culinary context');
    }

    // Step Completeness
    if (!recipe.instructions || recipe.instructions.length < 2) {
      findings.push({
        id: `content_few_steps_${recipe.id}`,
        recipeId: recipe.id,
        category: 'content',
        severity: 'high',
        title: 'Insufficient Instruction Steps',
        description: 'The recipe contains fewer than 2 instruction steps, making it difficult for visitors to follow.',
        suggestion: 'Break preparation into clear, sequential culinary steps.',
      });
    } else {
      passedChecks.push(`Instructions well structured (${recipe.instructions.length} steps)`);
    }

    // =========================================================================
    // 3. STRUCTURED DATA & SCHEMA PARITY
    // =========================================================================
    try {
      const jsonLd = generateRecipeJsonLd(recipe);
      if (!jsonLd.name || !jsonLd.recipeIngredient || jsonLd.recipeIngredient.length === 0) {
        findings.push({
          id: `schema_incomplete_${recipe.id}`,
          recipeId: recipe.id,
          category: 'schema',
          severity: 'high',
          title: 'Schema.org Recipe JSON-LD Incomplete',
          description: 'Essential Recipe schema fields (name or ingredients) are missing.',
          suggestion: 'Ensure ingredients and title are properly populated.',
        });
      } else {
        passedChecks.push('Schema.org Recipe JSON-LD valid with all rich snippet attributes');
      }

      // Check cooking time parity between Schema and visible recipe
      if (recipe.totalTimeMinutes <= 0) {
        findings.push({
          id: `schema_time_missing_${recipe.id}`,
          recipeId: recipe.id,
          category: 'schema',
          severity: 'medium',
          title: 'Zero or Missing Total Cooking Time',
          description: 'Total cooking time is 0 minutes, causing missing duration in Schema.org.',
          suggestion: 'Enter an estimated total prep and cook time in minutes.',
        });
      }
    } catch {
      findings.push({
        id: `schema_error_${recipe.id}`,
        recipeId: recipe.id,
        category: 'schema',
        severity: 'high',
        title: 'Error Generating Schema JSON-LD',
        description: 'Failed to construct valid structured data.',
        suggestion: 'Inspect recipe fields for invalid characters or structure.',
      });
    }

    // =========================================================================
    // 4. IMAGE SEO CHECKS
    // =========================================================================
    if (!recipe.heroImage?.url) {
      findings.push({
        id: `img_missing_${recipe.id}`,
        recipeId: recipe.id,
        category: 'images',
        severity: 'high',
        title: 'Missing Hero Food Image',
        description: 'Food recipes require a visual hero image for discoverability and rich snippet eligibility.',
        suggestion: 'Generate or assign an approved FLUX food image.',
      });
    } else {
      if (!recipe.heroImage.altText || recipe.heroImage.altText.trim() === '') {
        findings.push({
          id: `img_alt_missing_${recipe.id}`,
          recipeId: recipe.id,
          category: 'images',
          severity: 'medium',
          title: 'Missing Hero Image Alt Text',
          description: 'Descriptive alt text is required for image accessibility and Google Image search.',
          suggestion: `Add descriptive alt text: ${recipe.title} served fresh in skillet with garnish`,
          proposedValue: `${recipe.title} served fresh in skillet with garnish`,
        });
      } else if (recipe.heroImage.altText.toLowerCase() === recipe.title.toLowerCase()) {
        findings.push({
          id: `img_alt_generic_${recipe.id}`,
          recipeId: recipe.id,
          category: 'images',
          severity: 'low',
          title: 'Generic Image Alt Text',
          description: 'Alt text is an exact copy of the title rather than describing the food presentation.',
          suggestion: 'Describe plating, garnishes, or serving vessel.',
        });
      } else {
        passedChecks.push('Hero image accessible with descriptive alt text');
      }
    }

    // =========================================================================
    // 5. TOPIC OVERLAP / CANNIBALIZATION DETECTION
    // =========================================================================
    const cleanTitle = recipe.title.toLowerCase().trim();
    for (const other of allRecipes) {
      if (other.id === recipe.id) continue;
      const otherClean = other.title.toLowerCase().trim();

      // Check title containment or near match
      if (
        (cleanTitle.includes(otherClean) || otherClean.includes(cleanTitle)) &&
        Math.abs(cleanTitle.length - otherClean.length) < 15
      ) {
        findings.push({
          id: `topic_overlap_${recipe.id}_${other.id}`,
          recipeId: recipe.id,
          category: 'content',
          severity: 'medium',
          title: 'Potential Topic Cannibalization',
          description: `This recipe title closely overlaps with "${other.title}". Both may compete for the same keyword intent.`,
          suggestion: 'Differentiate the focus (e.g. emphasize 30-minute timing, skillet technique, or unique ingredients).',
        });
        break;
      }
    }

    const highSeverityCount = findings.filter((f) => f.severity === 'high').length;
    const mediumSeverityCount = findings.filter((f) => f.severity === 'medium').length;
    const lowSeverityCount = findings.filter((f) => f.severity === 'low').length;

    return {
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      slug: recipe.slug,
      findings,
      passedChecks,
      highSeverityCount,
      mediumSeverityCount,
      lowSeverityCount,
      lastAuditedAt: new Date().toISOString(),
    };
  }
}

export const seoAuditService = new SeoAuditService();
