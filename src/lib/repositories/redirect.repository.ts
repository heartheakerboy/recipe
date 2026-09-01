export interface RedirectRecord {
  id: string;
  sourcePath: string;
  destinationPath: string;
  statusCode: number; // 301 or 302
  createdAt: string;
}

declare global {
  var __FLAVORNEST_REDIRECTS__: RedirectRecord[] | undefined;
}

export class RedirectRepository {
  private async getStore(): Promise<RedirectRecord[]> {
    if (!global.__FLAVORNEST_REDIRECTS__) {
      global.__FLAVORNEST_REDIRECTS__ = [];
    }
    return global.__FLAVORNEST_REDIRECTS__;
  }

  normalizePath(path: string): string {
    let clean = path.trim();
    if (!clean.startsWith('/')) clean = `/${clean}`;
    if (!clean.endsWith('/')) clean = `${clean}/`;
    return clean.toLowerCase();
  }

  async list(): Promise<RedirectRecord[]> {
    return this.getStore();
  }

  async getBySourcePath(sourcePath: string): Promise<RedirectRecord | null> {
    const store = await this.getStore();
    const normalized = this.normalizePath(sourcePath);
    return store.find((r) => r.sourcePath === normalized) || null;
  }

  async create(sourcePath: string, destinationPath: string, statusCode = 301): Promise<RedirectRecord | null> {
    const store = await this.getStore();
    const cleanSource = this.normalizePath(sourcePath);
    const cleanDest = this.normalizePath(destinationPath);

    if (cleanSource === cleanDest) return null;

    // Prevent redirect chains: If any existing redirect points to cleanSource, update its destination to cleanDest
    for (const existing of store) {
      if (existing.destinationPath === cleanSource) {
        existing.destinationPath = cleanDest;
      }
    }

    // Check if redirect from this source already exists
    const existingIndex = store.findIndex((r) => r.sourcePath === cleanSource);
    if (existingIndex !== -1) {
      store[existingIndex].destinationPath = cleanDest;
      store[existingIndex].statusCode = statusCode;
      return store[existingIndex];
    }

    const newRecord: RedirectRecord = {
      id: `redir_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sourcePath: cleanSource,
      destinationPath: cleanDest,
      statusCode,
      createdAt: new Date().toISOString(),
    };

    store.unshift(newRecord);
    return newRecord;
  }
}

export const redirectRepository = new RedirectRepository();
