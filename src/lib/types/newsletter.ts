export type SubscriberStatus = 'active' | 'unsubscribed' | 'suppressed' | 'pending';

export type SubscriberSource =
  | 'recipe_page'
  | 'homepage'
  | 'category_page'
  | 'footer'
  | 'pinterest_landing';

export interface Subscriber {
  id: string;
  email: string;
  status: SubscriberStatus;
  source: SubscriberSource;
  consentStatus: boolean;
  consentTimestamp: string;
  subscribedAt: string;
  unsubscribedAt?: string;
  preferences: string[];
  unsubscribeToken: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriberPublic {
  id: string;
  maskedEmail: string;
  status: SubscriberStatus;
  source: SubscriberSource;
  subscribedAt: string;
}

export type EmailCampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  previewText: string;
  contentHtml: string;
  recipeIds: string[];
  audienceSegment: string;
  status: EmailCampaignStatus;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  scheduledFor?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailProviderSettings {
  provider: 'resend' | 'postmark' | 'mock';
  fromName: string;
  fromEmail: string;
  apiKey: string;
  isConfigured: boolean;
}
