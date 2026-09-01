export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: 'subscribed' | 'unsubscribed';
  createdAt: string;
}

declare global {
  var __FLAVORNEST_NEWSLETTER__: NewsletterSubscriber[] | undefined;
}

export class NewsletterRepository {
  private async getStore(): Promise<NewsletterSubscriber[]> {
    if (!global.__FLAVORNEST_NEWSLETTER__) {
      global.__FLAVORNEST_NEWSLETTER__ = [];
    }
    return global.__FLAVORNEST_NEWSLETTER__;
  }

  async subscribe(email: string): Promise<{ success: boolean; isNew: boolean }> {
    const store = await this.getStore();
    const cleanEmail = email.toLowerCase().trim();

    const existing = store.find((s) => s.email === cleanEmail);
    if (existing) {
      existing.status = 'subscribed';
      return { success: true, isNew: false };
    }

    store.push({
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      status: 'subscribed',
      createdAt: new Date().toISOString(),
    });

    return { success: true, isNew: true };
  }

  async list(): Promise<NewsletterSubscriber[]> {
    return this.getStore();
  }
}

export const newsletterRepository = new NewsletterRepository();
