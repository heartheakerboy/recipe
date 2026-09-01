import { PinterestBoard, PinterestBoardMapping } from '../types/pinterest-connection';

declare global {
  var __FLAVORNEST_PINTEREST_BOARDS__: PinterestBoard[] | undefined;
  var __FLAVORNEST_PINTEREST_MAPPINGS__: PinterestBoardMapping[] | undefined;
  var __FLAVORNEST_DEFAULT_BOARD_ID__: string | undefined;
}

const DEFAULT_BOARDS: PinterestBoard[] = [
  {
    id: 'board_easy_dinner',
    name: 'Easy Dinner Recipes',
    description: 'Flavorful, simple weeknight dinner recipes for busy households.',
    privacy: 'PUBLIC',
    pinCount: 42,
    url: 'https://pinterest.com/flavornestrecipes/easy-dinner-recipes/',
  },
  {
    id: 'board_chicken',
    name: 'Chicken Dinner Ideas',
    description: 'Juicy skillet chicken, one-pan chicken bakes, and crispy dinners.',
    privacy: 'PUBLIC',
    pinCount: 28,
    url: 'https://pinterest.com/flavornestrecipes/chicken-dinner-ideas/',
  },
  {
    id: 'board_30_minute',
    name: '30-Minute Meals',
    description: 'Fast homemade meals ready in half an hour or less.',
    privacy: 'PUBLIC',
    pinCount: 35,
    url: 'https://pinterest.com/flavornestrecipes/30-minute-meals/',
  },
  {
    id: 'board_comfort_food',
    name: 'Cozy Comfort Food',
    description: 'Warm, satisfying pastas, casseroles, and family favorites.',
    privacy: 'PUBLIC',
    pinCount: 19,
    url: 'https://pinterest.com/flavornestrecipes/cozy-comfort-food/',
  },
];

const DEFAULT_MAPPINGS: PinterestBoardMapping[] = [
  {
    id: 'map_chicken',
    categorySlug: 'chicken',
    pinterestBoardId: 'board_chicken',
    boardName: 'Chicken Dinner Ideas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'map_quick_easy',
    categorySlug: 'quick-and-easy',
    pinterestBoardId: 'board_30_minute',
    boardName: '30-Minute Meals',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'map_dinner',
    categorySlug: 'dinner',
    pinterestBoardId: 'board_easy_dinner',
    boardName: 'Easy Dinner Recipes',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class PinterestBoardRepository {
  private getBoardsStore(): PinterestBoard[] {
    if (!global.__FLAVORNEST_PINTEREST_BOARDS__) {
      global.__FLAVORNEST_PINTEREST_BOARDS__ = [...DEFAULT_BOARDS];
    }
    return global.__FLAVORNEST_PINTEREST_BOARDS__;
  }

  private getMappingsStore(): PinterestBoardMapping[] {
    if (!global.__FLAVORNEST_PINTEREST_MAPPINGS__) {
      global.__FLAVORNEST_PINTEREST_MAPPINGS__ = [...DEFAULT_MAPPINGS];
    }
    return global.__FLAVORNEST_PINTEREST_MAPPINGS__;
  }

  async listBoards(): Promise<PinterestBoard[]> {
    return this.getBoardsStore();
  }

  async listMappings(): Promise<PinterestBoardMapping[]> {
    return this.getMappingsStore();
  }

  async getDefaultBoard(): Promise<PinterestBoard | null> {
    const boards = this.getBoardsStore();
    const defaultBoardId = global.__FLAVORNEST_DEFAULT_BOARD_ID__ || 'board_easy_dinner';
    return boards.find((b) => b.id === defaultBoardId) || boards[0] || null;
  }

  async setDefaultBoardId(boardId: string): Promise<void> {
    global.__FLAVORNEST_DEFAULT_BOARD_ID__ = boardId;
  }

  async saveMapping(mapping: Omit<PinterestBoardMapping, 'id' | 'createdAt' | 'updatedAt'>): Promise<PinterestBoardMapping> {
    const store = this.getMappingsStore();
    const boards = this.getBoardsStore();
    const board = boards.find((b) => b.id === mapping.pinterestBoardId);
    const now = new Date().toISOString();

    const existingIndex = store.findIndex(
      (m) =>
        (mapping.categorySlug && m.categorySlug === mapping.categorySlug) ||
        (mapping.collectionSlug && m.collectionSlug === mapping.collectionSlug)
    );

    const record: PinterestBoardMapping = {
      ...mapping,
      id: existingIndex !== -1 ? store[existingIndex].id : `map_${Date.now()}`,
      boardName: board?.name || mapping.boardName,
      createdAt: existingIndex !== -1 ? store[existingIndex].createdAt : now,
      updatedAt: now,
    };

    if (existingIndex !== -1) {
      store[existingIndex] = record;
    } else {
      store.push(record);
    }

    return record;
  }

  async resolveBoardForRecipe(categorySlug?: string, collectionSlug?: string): Promise<PinterestBoard | null> {
    const mappings = this.getMappingsStore();
    const boards = this.getBoardsStore();

    if (categorySlug) {
      const match = mappings.find((m) => m.categorySlug === categorySlug);
      if (match) {
        const board = boards.find((b) => b.id === match.pinterestBoardId);
        if (board) return board;
      }
    }

    if (collectionSlug) {
      const match = mappings.find((m) => m.collectionSlug === collectionSlug);
      if (match) {
        const board = boards.find((b) => b.id === match.pinterestBoardId);
        if (board) return board;
      }
    }

    return this.getDefaultBoard();
  }
}

export const pinterestBoardRepository = new PinterestBoardRepository();
