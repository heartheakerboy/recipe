import { pinterestConnectionRepository } from '../repositories/pinterest-connection.repository';
import { pinterestBoardRepository } from '../repositories/pinterest-board.repository';
import { pinterestRepository } from '../repositories/pinterest.repository';
import { recipeRepository } from '../repositories/recipe.repository';
import { pinterestApiClient } from './pinterest-api.client';
import { PinterestCreative } from '../types/pinterest';
import { PinterestPublishLog } from '../types/pinterest-connection';

declare global {
  var __FLAVORNEST_PINTEREST_PUBLISH_LOGS__: PinterestPublishLog[] | undefined;
}

export interface PrePublishValidationResult {
  canPublish: boolean;
  errors: string[];
  resolvedBoardId?: string;
  resolvedBoardName?: string;
}

export class PinterestPublisherService {
  private getLogsStore(): PinterestPublishLog[] {
    if (!global.__FLAVORNEST_PINTEREST_PUBLISH_LOGS__) {
      global.__FLAVORNEST_PINTEREST_PUBLISH_LOGS__ = [];
    }
    return global.__FLAVORNEST_PINTEREST_PUBLISH_LOGS__;
  }

  async validateForPublishing(creativeId: string): Promise<PrePublishValidationResult> {
    const errors: string[] = [];

    const creative = await pinterestRepository.getById(creativeId);
    if (!creative) {
      return { canPublish: false, errors: ['Pinterest creative not found.'] };
    }

    // 1. Creative Status Check
    if (creative.status === 'published') {
      return { canPublish: false, errors: ['Creative has already been published to Pinterest (Duplicate prevention).'] };
    }

    // 2. Recipe Status Check
    const recipe = await recipeRepository.getById(creative.recipeId);
    if (!recipe) {
      return { canPublish: false, errors: ['Associated recipe not found.'] };
    }
    if (recipe.status !== 'published') {
      errors.push(`Associated recipe "${recipe.title}" is not published. Recipes must be published before Pin distribution.`);
    }

    // 3. Image Check
    if (!creative.imageUrl || !creative.imageUrl.startsWith('http')) {
      errors.push('Creative is missing a valid, publicly accessible image URL.');
    }

    // 4. Destination URL Check
    if (!creative.destinationUrl || !creative.destinationUrl.startsWith('https://flavornest.xyz/recipes/')) {
      errors.push('Destination URL must point to a valid canonical FlavorNest recipe URL.');
    }

    // 5. Account Connection Check
    const connection = await pinterestConnectionRepository.getConnection();
    if (!connection || connection.status === 'disconnected') {
      errors.push('Pinterest account is not connected. Please connect in Settings.');
    }

    // 6. Board Mapping Check
    const board = await pinterestBoardRepository.resolveBoardForRecipe(recipe.primaryCategorySlug);
    if (!board) {
      errors.push('No valid Pinterest board mapped or configured for this recipe category.');
    }

    return {
      canPublish: errors.length === 0,
      errors,
      resolvedBoardId: board?.id,
      resolvedBoardName: board?.name,
    };
  }

  async publishPin(creativeId: string): Promise<{
    success: boolean;
    pinId?: string;
    pinUrl?: string;
    error?: string;
  }> {
    const validation = await this.validateForPublishing(creativeId);
    if (!validation.canPublish) {
      return { success: false, error: validation.errors.join(' | ') };
    }

    const creative = (await pinterestRepository.getById(creativeId))!;
    const recipe = (await recipeRepository.getById(creative.recipeId))!;
    const connection = (await pinterestConnectionRepository.getConnection())!;

    const boardId = validation.resolvedBoardId!;
    const boardName = validation.resolvedBoardName!;

    // Set status to publishing
    await pinterestRepository.update(creativeId, {
      status: 'publishing',
      pinterestBoardId: boardId,
      boardName,
      lastAttemptAt: new Date().toISOString(),
      attemptCount: (creative.attemptCount || 0) + 1,
    });

    const res = await pinterestApiClient.createPin(connection.accessToken, {
      boardId,
      title: creative.title,
      description: creative.description,
      link: creative.destinationUrl,
      mediaSource: {
        source_type: 'image_url',
        url: creative.imageUrl,
      },
      altText: creative.overlayText || recipe.title,
    });

    if (res.success && res.data) {
      const pinId = res.data.id;
      const pinUrl = `https://pinterest.com/pin/${pinId}/`;
      const now = new Date().toISOString();

      await pinterestRepository.update(creativeId, {
        status: 'published',
        pinterestPinId: pinId,
        publishedAt: now,
        publishingError: undefined,
      });

      // Record in publishing history log
      this.recordLog({
        id: `log_${Date.now()}`,
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        creativeId,
        pinId,
        pinUrl,
        boardId,
        boardName,
        status: 'success',
        attemptCount: (creative.attemptCount || 0) + 1,
        publishedAt: now,
      });

      return { success: true, pinId, pinUrl };
    } else {
      const errorMsg = res.error?.message || 'Unknown Pinterest API error';

      await pinterestRepository.update(creativeId, {
        status: 'failed',
        publishingError: errorMsg,
      });

      this.recordLog({
        id: `log_${Date.now()}`,
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        creativeId,
        boardId,
        boardName,
        status: 'failed',
        error: errorMsg,
        attemptCount: (creative.attemptCount || 0) + 1,
        publishedAt: new Date().toISOString(),
      });

      return { success: false, error: errorMsg };
    }
  }

  recordLog(log: PinterestPublishLog): void {
    const store = this.getLogsStore();
    store.unshift(log);
  }

  async listPublishLogs(): Promise<PinterestPublishLog[]> {
    return this.getLogsStore();
  }
}

export const pinterestPublisherService = new PinterestPublisherService();
