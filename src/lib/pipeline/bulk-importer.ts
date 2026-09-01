import { validateRecipeUrl } from '../importer/url-validator';
import { recipeRepository } from '../repositories/recipe.repository';
import { recipeImportService } from '../importer/recipe-import.service';

export interface BulkImportItemResult {
  url: string;
  status: 'valid' | 'duplicate' | 'invalid' | 'imported' | 'failed';
  domain?: string;
  recipeId?: string;
  recipeTitle?: string;
  error?: string;
}

export interface BulkImportBatchResult {
  totalSubmitted: number;
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
  results: BulkImportItemResult[];
}

export class BulkImporterService {
  private MAX_BATCH_SIZE = 25;

  async parseAndValidateBatch(rawText: string): Promise<BulkImportBatchResult> {
    const lines = rawText
      .split(/[\r\n]+/)
      .map((l) => l.trim())
      .filter(Boolean);

    const limited = lines.slice(0, this.MAX_BATCH_SIZE);
    const seenInBatch = new Set<string>();
    const results: BulkImportItemResult[] = [];

    let validCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    const { recipes: existingRecipes } = await recipeRepository.list({ limit: 1000 });
    const existingSourceUrls = new Set(
      existingRecipes.map((r) => r.sourceUrl?.toLowerCase()).filter(Boolean)
    );

    for (const line of limited) {
      const validation = validateRecipeUrl(line);

      if (!validation.isValid) {
        invalidCount++;
        results.push({
          url: line,
          status: 'invalid',
          error: validation.error || 'Invalid URL format',
        });
        continue;
      }

      const normalized = validation.normalizedUrl!.toLowerCase();

      // Check duplicate within batch
      if (seenInBatch.has(normalized)) {
        duplicateCount++;
        results.push({
          url: line,
          domain: validation.domain,
          status: 'duplicate',
          error: 'Duplicate URL within this submission batch',
        });
        continue;
      }
      seenInBatch.add(normalized);

      // Check duplicate in database
      if (existingSourceUrls.has(normalized)) {
        duplicateCount++;
        results.push({
          url: line,
          domain: validation.domain,
          status: 'duplicate',
          error: 'Recipe from this source URL already exists in database',
        });
        continue;
      }

      validCount++;
      results.push({
        url: validation.normalizedUrl!,
        domain: validation.domain,
        status: 'valid',
      });
    }

    return {
      totalSubmitted: limited.length,
      validCount,
      duplicateCount,
      invalidCount,
      results,
    };
  }

  async processValidImports(
    items: BulkImportItemResult[]
  ): Promise<BulkImportItemResult[]> {
    const validItems = items.filter((i) => i.status === 'valid');
    const processedResults: BulkImportItemResult[] = [...items];

    for (const item of validItems) {
      try {
        const importResult = await recipeImportService.importFromUrl(item.url);
        if (importResult.success && importResult.recipe) {
          const createdRecipe = await recipeRepository.create({
            ...importResult.recipe,
            mealType: (importResult.recipe.mealType as any) || 'dinner',
            cookingMethod: (importResult.recipe.cookingMethod as any) || 'stovetop',
            editorialStyle: (importResult.recipe.editorialStyle as any) || 'quick-easy',
            status: 'draft',
            servingsUnit: 'servings',
          });
          const index = processedResults.findIndex((r) => r.url === item.url);
          if (index !== -1) {
            processedResults[index] = {
              ...processedResults[index],
              status: 'imported',
              recipeId: createdRecipe.id,
              recipeTitle: createdRecipe.title,
            };
          }
        } else {
          const index = processedResults.findIndex((r) => r.url === item.url);
          if (index !== -1) {
            processedResults[index] = {
              ...processedResults[index],
              status: 'failed',
              error: importResult.errors?.[0] || 'Extraction failed',
            };
          }
        }
      } catch (err: any) {
        const index = processedResults.findIndex((r) => r.url === item.url);
        if (index !== -1) {
          processedResults[index] = {
            ...processedResults[index],
            status: 'failed',
            error: err.message || 'Import error',
          };
        }
      }
    }

    return processedResults;
  }
}

export const bulkImporterService = new BulkImporterService();
