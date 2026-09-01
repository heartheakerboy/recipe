import { PinterestBoard } from '../types/pinterest-connection';

export interface CreatePinRequest {
  boardId: string;
  title: string;
  description: string;
  link: string;
  mediaSource: {
    source_type: 'image_url';
    url: string;
  };
  altText?: string;
}

export interface CreatePinResponse {
  id: string;
  title: string;
  description: string;
  link: string;
  board_id: string;
  created_at: string;
  media?: {
    images?: {
      '1200x'?: { url: string; width: number; height: number };
    };
  };
}

export interface PinterestApiErrorResponse {
  code: number;
  message: string;
  isRateLimited?: boolean;
  retryAfterSeconds?: number;
}

export class PinterestApiClient {
  private baseUrl = 'https://api.pinterest.com/v5';

  async getUserAccount(accessToken: string): Promise<{ username: string; profile_image?: string }> {
    if (!accessToken || accessToken.startsWith('mock_')) {
      return {
        username: 'flavornestrecipes',
        profile_image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&h=200&q=80',
      };
    }

    const res = await fetch(`${this.baseUrl}/user_account`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(`Pinterest API user_account error: ${err.message || res.status}`);
    }

    return res.json();
  }

  async getBoards(accessToken: string): Promise<PinterestBoard[]> {
    if (!accessToken || accessToken.startsWith('mock_')) {
      return [
        { id: 'board_easy_dinner', name: 'Easy Dinner Recipes', privacy: 'PUBLIC', pinCount: 42 },
        { id: 'board_chicken', name: 'Chicken Dinner Ideas', privacy: 'PUBLIC', pinCount: 28 },
        { id: 'board_30_minute', name: '30-Minute Meals', privacy: 'PUBLIC', pinCount: 35 },
        { id: 'board_comfort_food', name: 'Cozy Comfort Food', privacy: 'PUBLIC', pinCount: 19 },
      ];
    }

    const res = await fetch(`${this.baseUrl}/boards?page_size=50`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Pinterest API getBoards error: ${res.statusText}`);
    }

    const data = await res.json();
    return (data.items || []).map((b: any) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      privacy: b.privacy,
      pinCount: b.pin_count,
    }));
  }

  async createPin(
    accessToken: string,
    payload: CreatePinRequest
  ): Promise<{ success: boolean; data?: CreatePinResponse; error?: PinterestApiErrorResponse }> {
    // If running in development/mock or using mock token, return deterministic success
    if (!accessToken || accessToken.startsWith('mock_')) {
      const pinId = `pin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return {
        success: true,
        data: {
          id: pinId,
          title: payload.title,
          description: payload.description,
          link: payload.link,
          board_id: payload.boardId,
          created_at: new Date().toISOString(),
          media: {
            images: {
              '1200x': { url: payload.mediaSource.url, width: 1000, height: 1500 },
            },
          },
        },
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/pins`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Handle Rate Limiting
      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '60', 10);
        return {
          success: false,
          error: {
            code: 429,
            message: 'Pinterest API rate limit exceeded.',
            isRateLimited: true,
            retryAfterSeconds: retryAfter,
          },
        };
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ message: res.statusText }));
        return {
          success: false,
          error: {
            code: res.status,
            message: errJson.message || `Pinterest API error (${res.status})`,
          },
        };
      }

      const pinData = await res.json();
      return {
        success: true,
        data: pinData,
      };
    } catch (err: any) {
      return {
        success: false,
        error: {
          code: 500,
          message: err.message || 'Network error connecting to Pinterest API',
        },
      };
    }
  }
}

export const pinterestApiClient = new PinterestApiClient();
