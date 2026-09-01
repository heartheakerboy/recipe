export interface ImageGenerationHistoryRecord {
  id: string;
  recipeId: string;
  imageType: 'hero' | 'secondary' | 'pinterest' | 'overhead' | 'closeup';
  prompt: string;
  negativePrompt?: string;
  stylePreset: string;
  status: 'generating' | 'completed' | 'failed' | 'approved' | 'rejected';
  imageUrl?: string;
  r2Key?: string;
  width: number;
  height: number;
  provider: string;
  model: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

declare global {
  var __FLAVORNEST_IMAGE_HISTORY__: ImageGenerationHistoryRecord[] | undefined;
}

export class ImageHistoryService {
  private getStore(): ImageGenerationHistoryRecord[] {
    if (!global.__FLAVORNEST_IMAGE_HISTORY__) {
      global.__FLAVORNEST_IMAGE_HISTORY__ = [];
    }
    return global.__FLAVORNEST_IMAGE_HISTORY__;
  }

  createRecord(data: {
    recipeId: string;
    imageType: ImageGenerationHistoryRecord['imageType'];
    prompt: string;
    negativePrompt?: string;
    stylePreset: string;
    width: number;
    height: number;
    provider: string;
    model: string;
  }): ImageGenerationHistoryRecord {
    const store = this.getStore();
    const record: ImageGenerationHistoryRecord = {
      id: `img_gen_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      recipeId: data.recipeId,
      imageType: data.imageType,
      prompt: data.prompt,
      negativePrompt: data.negativePrompt,
      stylePreset: data.stylePreset,
      status: 'generating',
      width: data.width,
      height: data.height,
      provider: data.provider,
      model: data.model,
      createdAt: new Date().toISOString(),
    };
    store.unshift(record);
    return record;
  }

  completeRecord(id: string, imageUrl: string): void {
    const store = this.getStore();
    const item = store.find((r) => r.id === id);
    if (item) {
      item.status = 'completed';
      item.imageUrl = imageUrl;
      item.completedAt = new Date().toISOString();
    }
  }

  failRecord(id: string, error: string): void {
    const store = this.getStore();
    const item = store.find((r) => r.id === id);
    if (item) {
      item.status = 'failed';
      item.error = error;
      item.completedAt = new Date().toISOString();
    }
  }

  updateStatus(id: string, status: 'approved' | 'rejected', r2Key?: string): void {
    const store = this.getStore();
    const item = store.find((r) => r.id === id);
    if (item) {
      item.status = status;
      if (r2Key) item.r2Key = r2Key;
    }
  }

  listByRecipe(recipeId: string): ImageGenerationHistoryRecord[] {
    return this.getStore().filter((r) => r.recipeId === recipeId);
  }

  getById(id: string): ImageGenerationHistoryRecord | undefined {
    return this.getStore().find((r) => r.id === id);
  }
}

export const imageHistoryService = new ImageHistoryService();
