import { validateRecipeUrl, isPrivateOrReservedHost } from './url-validator';

export interface SourceFetchResult {
  success: boolean;
  html?: string;
  finalUrl?: string;
  statusCode?: number;
  contentType?: string;
  error?: string;
  durationMs: number;
}

export interface FetchOptions {
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
}

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024; // 5MB
const DEFAULT_MAX_REDIRECTS = 5;

export async function fetchSourceHtml(
  targetUrl: string,
  options: FetchOptions = {}
): Promise<SourceFetchResult> {
  const startTime = Date.now();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;

  let currentUrl = targetUrl;
  let redirectCount = 0;

  while (redirectCount <= maxRedirects) {
    const validation = validateRecipeUrl(currentUrl);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error || 'Invalid URL or SSRF protection triggered',
        durationMs: Date.now() - startTime,
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'User-Agent': DEFAULT_USER_AGENT,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
        redirect: 'manual', // Manual redirect handling to enforce SSRF validation at every hop
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle Redirects (301, 302, 303, 307, 308)
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) {
          return {
            success: false,
            error: 'Redirect location header missing from response',
            durationMs: Date.now() - startTime,
          };
        }

        const nextUrl = new URL(location, currentUrl).toString();
        const nextValidation = validateRecipeUrl(nextUrl);
        if (!nextValidation.isValid) {
          return {
            success: false,
            error: `Redirect blocked for security: ${nextValidation.error}`,
            durationMs: Date.now() - startTime,
          };
        }

        currentUrl = nextUrl;
        redirectCount++;
        continue;
      }

      if (!response.ok) {
        return {
          success: false,
          statusCode: response.status,
          error: `HTTP Error ${response.status}: ${response.statusText}`,
          durationMs: Date.now() - startTime,
        };
      }

      const contentType = response.headers.get('content-type') || '';
      if (
        !contentType.includes('text/html') &&
        !contentType.includes('application/xhtml+xml') &&
        !contentType.includes('text/plain')
      ) {
        return {
          success: false,
          statusCode: response.status,
          contentType,
          error: `Invalid content type: "${contentType}". Expected HTML document.`,
          durationMs: Date.now() - startTime,
        };
      }

      // Read response with size limitation
      const text = await response.text();
      if (text.length > maxBytes) {
        return {
          success: false,
          error: `Response size (${Math.round(text.length / 1024)} KB) exceeded limit (${Math.round(maxBytes / 1024)} KB).`,
          durationMs: Date.now() - startTime,
        };
      }

      return {
        success: true,
        html: text,
        finalUrl: currentUrl,
        statusCode: response.status,
        contentType,
        durationMs: Date.now() - startTime,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      const isTimeout = error.name === 'AbortError';
      return {
        success: false,
        error: isTimeout
          ? `Connection timed out after ${timeoutMs / 1000} seconds.`
          : error.message || 'Failed to fetch source page',
        durationMs: Date.now() - startTime,
      };
    }
  }

  return {
    success: false,
    error: `Exceeded maximum redirect limit (${maxRedirects}).`,
    durationMs: Date.now() - startTime,
  };
}
