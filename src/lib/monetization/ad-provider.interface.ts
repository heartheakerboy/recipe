import { AdPlacementSlot, MonetizationSettings } from '../types/revenue';

export interface AdProvider {
  id: string;
  name: string;
  isConfigured(settings: MonetizationSettings): boolean;
  getClientScriptUrl(settings: MonetizationSettings): string | null;
}

export class GoogleAdSenseProvider implements AdProvider {
  id = 'adsense';
  name = 'Google AdSense';

  isConfigured(settings: MonetizationSettings): boolean {
    return Boolean(settings.adSenseClientId && settings.adSenseClientId.startsWith('ca-pub-'));
  }

  getClientScriptUrl(settings: MonetizationSettings): string | null {
    if (!this.isConfigured(settings)) return null;
    return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.adSenseClientId}`;
  }
}

export class MockAdProvider implements AdProvider {
  id = 'mock';
  name = 'Development Mock Ad Provider';

  isConfigured(_settings: MonetizationSettings): boolean {
    return true;
  }

  getClientScriptUrl(_settings: MonetizationSettings): string | null {
    return null;
  }
}

export const adProviders: Record<string, AdProvider> = {
  adsense: new GoogleAdSenseProvider(),
  mock: new MockAdProvider(),
};
