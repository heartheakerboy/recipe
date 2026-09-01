export type PinterestConnectionStatus = 'connected' | 'expired' | 'disconnected';

export interface PinterestConnection {
  id: string;
  accountIdentifier: string;
  accountUsername: string;
  accessToken: string; // SERVER-SIDE ONLY - NEVER RETURN TO CLIENT
  refreshToken?: string;
  tokenExpiresAt?: string;
  scopes: string[];
  status: PinterestConnectionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PinterestConnectionPublic {
  id: string;
  accountIdentifier: string;
  accountUsername: string;
  tokenExpiresAt?: string;
  scopes: string[];
  status: PinterestConnectionStatus;
  isTokenValid: boolean;
  maskedToken: string; // e.g. "pina_...4f8a"
  createdAt: string;
  updatedAt: string;
}

export interface PinterestBoard {
  id: string;
  name: string;
  description?: string;
  privacy: 'PUBLIC' | 'PROTECTED' | 'SECRET';
  pinCount?: number;
  url?: string;
}

export interface PinterestBoardMapping {
  id: string;
  categorySlug?: string;
  collectionSlug?: string;
  pinterestBoardId: string;
  boardName: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PinterestPublishLog {
  id: string;
  recipeId: string;
  recipeTitle: string;
  creativeId: string;
  pinId?: string;
  pinUrl?: string;
  boardId: string;
  boardName: string;
  status: 'success' | 'failed';
  error?: string;
  attemptCount: number;
  publishedAt: string;
}
