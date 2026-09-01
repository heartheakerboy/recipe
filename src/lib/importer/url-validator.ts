/**
 * URL Validator & SSRF Protection for FlavorNest Recipe Importer
 */

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
  domain?: string;
}

const PRIVATE_IP_PATTERNS = [
  // 127.0.0.0/8 (Loopback)
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  // 10.0.0.0/8 (Private Network)
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  // 172.16.0.0/12 (Private Network: 172.16.0.0 - 172.31.255.255)
  /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/,
  // 192.168.0.0/16 (Private Network)
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  // 169.254.0.0/16 (Link Local & AWS/GCP/Azure Metadata Endpoint)
  /^169\.254\.\d{1,3}\.\d{1,3}$/,
  // 0.0.0.0/8
  /^0\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
];

const DISALLOWED_HOSTNAMES = [
  'localhost',
  'metadata.google.internal',
  '169.254.169.254',
  'instance-data',
  'kubernetes.default.svc',
];

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'ref',
  'fbclid',
  'gclid',
  'msclkid',
  'mc_eid',
  '_ga',
  '_gl',
  'igshid',
]);

export function isPrivateOrReservedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().trim();

  if (DISALLOWED_HOSTNAMES.includes(host)) {
    return true;
  }

  if (
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.lan') ||
    host.endsWith('.corp')
  ) {
    return true;
  }

  // Check IPv6 loopback and private
  if (host === '::1' || host === '[::1]' || host.startsWith('fc00:') || host.startsWith('fe80:')) {
    return true;
  }

  // Check IPv4 patterns
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(host)) {
      return true;
    }
  }

  return false;
}

export function normalizeRecipeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());

    // Filter tracking params while preserving functional params (e.g. recipe IDs)
    const newParams = new URLSearchParams();
    parsed.searchParams.forEach((value, key) => {
      if (!TRACKING_PARAMS.has(key.toLowerCase())) {
        newParams.append(key, value);
      }
    });

    const queryString = newParams.toString() ? `?${newParams.toString()}` : '';
    let pathname = parsed.pathname;

    // Remove trailing slash if not root
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    return `${parsed.protocol}//${parsed.hostname.toLowerCase()}${pathname}${queryString}`;
  } catch {
    return rawUrl.trim();
  }
}

export function validateRecipeUrl(rawUrl: string): UrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, error: 'Please enter a recipe URL.' };
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length < 8 || trimmed.length > 2048) {
    return { isValid: false, error: 'URL length is invalid (must be between 8 and 2048 characters).' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { isValid: false, error: 'Invalid URL format. Please include http:// or https://' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isValid: false, error: 'Only HTTP and HTTPS protocols are supported.' };
  }

  const hostname = parsed.hostname;
  if (!hostname || hostname.length < 3) {
    return { isValid: false, error: 'Invalid hostname in URL.' };
  }

  if (isPrivateOrReservedHost(hostname)) {
    return {
      isValid: false,
      error: 'Security Exception: Cannot import recipes from internal, private, or local network addresses.',
    };
  }

  const normalized = normalizeRecipeUrl(trimmed);

  return {
    isValid: true,
    normalizedUrl: normalized,
    domain: hostname.toLowerCase(),
  };
}
