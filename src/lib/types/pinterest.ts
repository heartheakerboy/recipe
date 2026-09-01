export type PinterestCreativeStyle =
  | 'template-a-hero'
  | 'template-b-editorial'
  | 'template-c-recipe-focus'
  | 'template-d-collage'
  | 'template-e-minimal';

export type PinterestContentAngle =
  | 'quick-dinner'
  | 'easy-recipe'
  | 'comfort-food'
  | 'family-meal'
  | 'meal-prep'
  | 'seasonal';

export type PinterestCreativeStatus =
  | 'draft'
  | 'generated'
  | 'review'
  | 'approved'
  | 'queued'
  | 'publishing'
  | 'scheduled'
  | 'published'
  | 'failed'
  | 'archived'
  | 'cancelled';

export interface PinterestCreative {
  id: string;
  recipeId: string;
  imageId?: string;
  creativeTemplate: PinterestCreativeStyle;
  contentAngle: PinterestContentAngle;
  overlayText: string;
  subheadline?: string;
  title: string;
  description: string;
  keywords: string[];
  destinationUrl: string;
  boardName: string;
  pinterestBoardId?: string;
  imageUrl: string;
  secondaryImageUrls?: string[];
  status: PinterestCreativeStatus;
  pinterestPinId?: string;
  publishingError?: string;
  lastAttemptAt?: string;
  attemptCount?: number;
  impressions?: number;
  saves?: number;
  outboundClicks?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export type CreatePinterestCreativeInput = Omit<
  PinterestCreative,
  'id' | 'createdAt' | 'updatedAt' | 'impressions' | 'saves' | 'outboundClicks'
>;

export interface PinterestMetadata {
  id: string;
  recipeId: string;
  pinTitle: string;
  pinDescription: string;
  pinKeywords: string[];
  destinationUrl: string;
  imageAsset: {
    id: string;
    r2Key: string;
    cdnUrl: string;
    altText: string;
    width: number;
    height: number;
    format: string;
    role: string;
    aspectRatio: string;
    createdAt: string;
  };
  creativeStyle: string;
  suggestedBoards: string[];
  status: string;
}
