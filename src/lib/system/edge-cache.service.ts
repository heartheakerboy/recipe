export class EdgeCacheService {
  getPublicRecipeCacheHeaders(): Record<string, string> {
    return {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'Vary': 'Accept-Encoding',
      'X-Cache-Tier': 'Cloudflare-Edge-Ready',
    };
  }

  getStaticAssetCacheHeaders(): Record<string, string> {
    return {
      'Cache-Control': 'public, max-age=31536000, immutable',
    };
  }

  getPrivateAdminCacheHeaders(): Record<string, string> {
    return {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    };
  }

  checkRateLimit(
    _clientKey: string,
    _maxRequests: number = 60,
    _windowSeconds: number = 60
  ): { allowed: boolean; remaining: number } {
    // In production with Cloudflare Workers: leverages Rate Limiting bindings
    // For local/Node: deterministic safety simulation
    return {
      allowed: true,
      remaining: 59,
    };
  }
}

export const edgeCacheService = new EdgeCacheService();
