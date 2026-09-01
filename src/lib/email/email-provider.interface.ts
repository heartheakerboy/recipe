import { EmailProviderSettings } from '../types/newsletter';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendBatchOptions {
  recipients: string[];
  subject: string;
  html: string;
}

export interface EmailProvider {
  id: string;
  name: string;
  send(options: SendEmailOptions, settings: EmailProviderSettings): Promise<{ success: boolean; id?: string; error?: string }>;
  sendBatch(options: SendBatchOptions, settings: EmailProviderSettings): Promise<{ success: boolean; sentCount: number; error?: string }>;
  getStatus(settings: EmailProviderSettings): Promise<{ connected: boolean; provider: string }>;
}

export class ResendEmailProvider implements EmailProvider {
  id = 'resend';
  name = 'Resend';

  async send(options: SendEmailOptions, settings: EmailProviderSettings) {
    if (!settings.apiKey) {
      return { success: false, error: 'Resend API key is not configured.' };
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${settings.fromName} <${settings.fromEmail}>`,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.message || `Resend error (${res.status})` };
      }

      const data = await res.json();
      return { success: true, id: data.id };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async sendBatch(options: SendBatchOptions, settings: EmailProviderSettings) {
    let sentCount = 0;
    for (const to of options.recipients) {
      const res = await this.send({ to, subject: options.subject, html: options.html }, settings);
      if (res.success) sentCount++;
    }
    return { success: true, sentCount };
  }

  async getStatus(settings: EmailProviderSettings) {
    return {
      connected: Boolean(settings.apiKey && settings.apiKey.startsWith('re_')),
      provider: 'Resend',
    };
  }
}

export class MockEmailProvider implements EmailProvider {
  id = 'mock';
  name = 'Development Mock Email Provider';

  async send(_options: SendEmailOptions, _settings: EmailProviderSettings) {
    return {
      success: true,
      id: `msg_mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
  }

  async sendBatch(options: SendBatchOptions, _settings: EmailProviderSettings) {
    return {
      success: true,
      sentCount: options.recipients.length,
    };
  }

  async getStatus(_settings: EmailProviderSettings) {
    return {
      connected: true,
      provider: 'Mock Email Service',
    };
  }
}

export const emailProviders: Record<string, EmailProvider> = {
  resend: new ResendEmailProvider(),
  mock: new MockEmailProvider(),
};
