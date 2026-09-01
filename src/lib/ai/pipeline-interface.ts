import {
  RawExtractedRecipe,
  NormalizedRecipeDraft,
  RecipeDNAAnalysis,
  GeneratedArticleEditorial,
  GeneratedSEOMetadata,
} from './types';
import { RecipeEditorialAngle } from '../types/recipe';

export interface RecipeExtractionService {
  extractFromUrl(targetUrl: string): Promise<RawExtractedRecipe>;
}

export interface RecipeNormalizationService {
  normalize(raw: RawExtractedRecipe): Promise<NormalizedRecipeDraft>;
}

export interface RecipeDNAAnalyzer {
  analyze(draft: NormalizedRecipeDraft): Promise<RecipeDNAAnalysis>;
}

export interface EditorialArticleGenerator {
  generateArticle(
    draft: NormalizedRecipeDraft,
    angle: RecipeEditorialAngle
  ): Promise<GeneratedArticleEditorial>;
}

export interface SEOGenerationService {
  generateMetadata(
    draft: NormalizedRecipeDraft,
    article: GeneratedArticleEditorial,
    angle: RecipeEditorialAngle
  ): Promise<GeneratedSEOMetadata>;
}
