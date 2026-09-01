/**
 * IndexNow Search Engine Discovery Service for FlavorNest.xyz
 */

export interface IndexNowSubmitResult {
  success: boolean;
  urlsSubmitted: string[];
  status?: number;
  error?: string;
  durationMs: number;
}

export class IndexNowService {
  private key: string;
  private endpoint: string;
  private host: string;

  constructor() {
    this.key = process.env.INDEXNOW_KEY || 'flavornest_indexnow_2026';
    this.endpoint = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow';
    this.host = 'flavornest.xyz';
  }

  async submitUrls(urls: string[]): Promise<IndexNowSubmitResult> {
    const startTime = Date.now();
    if (!urls || urls.length === 0) {
      return { success: true, urlsSubmitted: [], durationMs: 0 };
    }

    // Ensure valid canonical URLs only
    const validUrls = urls.filter((u) => u.startsWith('https://flavornest.xyz/recipes/') || u.startsWith('https://flavornest.xyz/category/'));
    if (validUrls.length === 0) {
      return { success: true, urlsSubmitted: [], durationMs: 0 };
    }

    try {
      // In production or mock environment:
      if (process.env.NODE_ENV === 'test' || !process.env.INDEXNOW_KEY) {
        // Return successful simulated submission in test/dev
        return {
          success: true,
          urlsSubmitted: validUrls,
          status: 200,
          durationMs: Date.now() - startTime,
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: this.host,
          key: this.key,
          keyLocation: `https://${this.host}/${this.key}.txt`,
          urlList: validUrls,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return {
        success: response.ok,
        urlsSubmitted: validUrls,
        status: response.status,
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      // Failure-safe: IndexNow submission error must NEVER throw or block publishing
      console.warn('IndexNow submission failed (non-blocking):', err.message);
      return {
        success: false,
        urlsSubmitted: validUrls,
        error: err.message,
        durationMs: Date.now() - startTime,
      };
    }
  }
}

export const indexNowService = new IndexNowService();
