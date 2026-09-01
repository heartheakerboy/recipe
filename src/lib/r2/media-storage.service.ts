import { imageRepository, ImageRecord } from '../repositories/image.repository';

export interface R2UploadOptions {
  recipeId: string;
  recipeSlug: string;
  imageType: 'hero' | 'secondary' | 'pinterest' | 'step';
  sourceUrl: string;
  width: number;
  height: number;
  format?: 'webp' | 'png' | 'jpeg';
  altText: string;
  generationProvider?: string;
  generationModel?: string;
  generationPrompt?: string;
}

export interface StoredMediaAsset {
  imageRecord: ImageRecord;
  publicUrl: string;
  r2Key: string;
  variants: {
    original: string;
    large: string;
    medium?: string;
  };
}

export class MediaStorageService {
  private r2PublicBaseUrl: string;

  constructor() {
    this.r2PublicBaseUrl = process.env.R2_PUBLIC_BASE_URL || 'https://media.flavornest.xyz';
  }

  generateR2Key(slug: string, imageType: string, variant = 'original', ext = 'webp'): string {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (imageType === 'hero') {
      return `recipes/${cleanSlug}/hero/${variant}.${ext}`;
    } else if (imageType === 'pinterest') {
      return `recipes/${cleanSlug}/pinterest/01.${ext}`;
    }
    return `recipes/${cleanSlug}/secondary/${variant}.${ext}`;
  }

  getPublicUrl(r2Key: string): string {
    return `${this.r2PublicBaseUrl.replace(/\/$/, '')}/${r2Key.replace(/^\//, '')}`;
  }

  async storeGeneratedImage(options: R2UploadOptions): Promise<StoredMediaAsset> {
    const ext = options.format || 'webp';
    const primaryKey = this.generateR2Key(options.recipeSlug, options.imageType, 'original', ext);

    const publicUrl = options.sourceUrl.startsWith('http')
      ? options.sourceUrl
      : this.getPublicUrl(primaryKey);

    const imageRecord = await imageRepository.create({
      recipeId: options.recipeId,
      type: options.imageType as any,
      r2Key: primaryKey,
      url: publicUrl,
      width: options.width,
      height: options.height,
      format: (ext === 'png' ? 'png' : ext === 'jpeg' ? 'jpeg' : 'webp'),
      altText: options.altText,
      sourceType: 'generated',
      generationProvider: options.generationProvider || 'flux-api',
      generationModel: options.generationModel || 'flux-pro-1.1',
      generationPrompt: options.generationPrompt,
    });

    return {
      imageRecord,
      publicUrl,
      r2Key: primaryKey,
      variants: {
        original: publicUrl,
        large: publicUrl,
        medium: publicUrl,
      },
    };
  }

  async deleteImage(imageId: string): Promise<boolean> {
    return imageRepository.delete(imageId);
  }
}

export const mediaStorageService = new MediaStorageService();
