import { GeneratedEditorialContent } from './content-generator';
import { RecipeFactsLock, verifyRecipeFactsIntegrity, FactIntegrityCheckResult } from './recipe-facts';

export interface UnsupportedClaimAlert {
  phrase: string;
  category: string;
  context: string;
  recommendation: string;
}

export interface QualityValidationReport {
  score: number; // 0 to 100
  grade: 'Excellent' | 'Good' | 'Needs Review' | 'Regenerate';
  factCheck: FactIntegrityCheckResult;
  unsupportedClaims: UnsupportedClaimAlert[];
  repetitivePhrasesDetected: string[];
  contentDiversityScore: number; // 0 to 100
  warnings: string[];
  recommendations: string[];
}

const UNSUPPORTED_CLAIM_PATTERNS = [
  { pattern: /\baward[- ]winning\b/gi, category: 'Unsubstantiated claim', phrase: 'award-winning', rec: 'Remove award claim unless a specific culinary award is verified.' },
  { pattern: /\bviral\b/gi, category: 'Sensationalism', phrase: 'viral', rec: 'Focus on recipe attributes rather than social media virality.' },
  { pattern: /\beveryone loves this\b/gi, category: 'Generalization', phrase: 'everyone loves this', rec: 'Frame as "A crowd-pleasing option for gatherings."' },
  { pattern: /\bmy family(?:'s)? favorite\b/gi, category: 'Fabricated anecdote', phrase: 'my family favorite', rec: 'Use neutral editorial phrasing like "A dependable weeknight favorite."' },
  { pattern: /\bthe best (?:ever|on earth|in the world)\b/gi, category: 'Superlative', phrase: 'the best ever', rec: 'Use balanced descriptive language.' },
  { pattern: /\brestaurant quality\b/gi, category: 'Cliche', phrase: 'restaurant quality', rec: 'Describe the specific rich flavor or silky texture instead.' },
  { pattern: /\bcheap\b/gi, category: 'Pricing claim', phrase: 'cheap', rec: 'Use "made with everyday pantry staples" instead.' },
];

const REPETITIVE_AI_CLICHES = [
  /\bthis delicious recipe\b/gi,
  /\byou('re| are) going to love\b/gi,
  /\bpacked with flavor\b/gi,
  /\bsimple yet delicious\b/gi,
  /\bflavor-packed\b/gi,
  /\btake (?:your )?cooking to the next level\b/gi,
  /\bmelt-in-your-mouth goodness\b/gi,
  /\bbursting with flavor\b/gi,
];

export function validateEditorialQuality(
  generated: GeneratedEditorialContent,
  facts: RecipeFactsLock
): QualityValidationReport {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // 1. Fact Integrity Check
  const factCheck = verifyRecipeFactsIntegrity(facts, {
    ingredients: generated.ingredients,
    instructions: generated.instructions,
    prepTimeMinutes: facts.prepTimeMinutes,
    cookTimeMinutes: facts.cookTimeMinutes,
    totalTimeMinutes: facts.totalTimeMinutes,
    servings: facts.servings,
  });

  if (!factCheck.passed) {
    warnings.push(...factCheck.discrepancies);
  }

  // 2. Unsupported Claim Detection
  const allProse = `${generated.title} ${generated.shortDescription} ${generated.introduction} ${generated.whyYoullLoveThis.join(' ')} ${generated.chefTips.join(' ')}`;
  const unsupportedClaims: UnsupportedClaimAlert[] = [];

  for (const item of UNSUPPORTED_CLAIM_PATTERNS) {
    const match = item.pattern.exec(allProse);
    if (match) {
      unsupportedClaims.push({
        phrase: item.phrase,
        category: item.category,
        context: match[0],
        recommendation: item.rec,
      });
      warnings.push(`Unsupported claim detected: "${match[0]}". ${item.rec}`);
    }
  }

  // 3. Repetition Detection
  const repetitivePhrasesDetected: string[] = [];
  for (const pattern of REPETITIVE_AI_CLICHES) {
    const match = pattern.exec(allProse);
    if (match) {
      repetitivePhrasesDetected.push(match[0]);
    }
  }

  const repetitionPenalty = Math.min(25, repetitivePhrasesDetected.length * 8);
  const contentDiversityScore = Math.max(50, 100 - repetitionPenalty);

  if (repetitivePhrasesDetected.length > 0) {
    recommendations.push(
      `Consider rephrasing repetitive AI expressions: ${repetitivePhrasesDetected.map((p) => `"${p}"`).join(', ')}.`
    );
  }

  // 4. Structure & Completeness Checks
  if (generated.introduction.length < 80) {
    warnings.push('Introduction is shorter than expected (minimum 80 characters recommended).');
  }

  if (generated.whyYoullLoveThis.length < 3) {
    warnings.push('Why You\'ll Love It should contain at least 3 points.');
  }

  if (generated.chefTips.length < 2) {
    warnings.push('Chef tips should contain at least 2 practical culinary suggestions.');
  }

  // 5. Calculate Overall Composite Quality Score (0 - 100)
  let baseScore = factCheck.score * 0.45 + contentDiversityScore * 0.35 + 20;

  // Penalize unsupported claims (-10 each)
  baseScore -= unsupportedClaims.length * 10;

  // Penalize major warnings (-5 each)
  baseScore -= Math.min(20, warnings.length * 4);

  const finalScore = Math.max(0, Math.min(100, Math.round(baseScore)));

  let grade: 'Excellent' | 'Good' | 'Needs Review' | 'Regenerate' = 'Needs Review';
  if (finalScore >= 90) grade = 'Excellent';
  else if (finalScore >= 75) grade = 'Good';
  else if (finalScore >= 60) grade = 'Needs Review';
  else grade = 'Regenerate';

  return {
    score: finalScore,
    grade,
    factCheck,
    unsupportedClaims,
    repetitivePhrasesDetected,
    contentDiversityScore,
    warnings,
    recommendations,
  };
}
