export type CollectionStatus = 'published' | 'draft' | 'archived';

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  status: CollectionStatus;
  sortOrder: number;
  recipeIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type CreateCollectionInput = Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>;
