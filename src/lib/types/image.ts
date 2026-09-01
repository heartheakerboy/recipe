export type ImageVariantRole = 'hero' | 'secondary' | 'step' | 'pin_vertical' | 'social_square';

export interface ImageAsset {
  id: string;
  r2Key: string;
  cdnUrl: string;
  altText: string;
  width: number;
  height: number;
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  role: ImageVariantRole;
  aspectRatio: string;
  promptUsed?: string;
  provider?: string;
  createdAt: string;
}

export interface GenerateImageRequest {
  recipeTitle: string;
  cuisine?: string;
  keyIngredients: string[];
  cookingMethod?: string;
  styleContext?: string;
  aspectRatio: '16:9' | '4:3' | '2:3' | '1:1';
  role: ImageVariantRole;
}

export interface GenerateImageResponse {
  success: boolean;
  imageUrl?: string;
  r2Key?: string;
  promptUsed?: string;
  error?: string;
}
