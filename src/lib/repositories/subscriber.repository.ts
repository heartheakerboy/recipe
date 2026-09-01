import {
  Subscriber,
  SubscriberPublic,
  SubscriberStatus,
  SubscriberSource,
} from '../types/newsletter';

declare global {
  var __FLAVORNEST_SUBSCRIBERS__: Subscriber[] | undefined;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '••••••••';
  const [local, domain] = email.split('@');
  if (local.length <= 1) return `${local}***@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

// Clean start: zero mock subscribers. Real subscribers are registered via the newsletter forms.
const SEED_SUBSCRIBERS: Subscriber[] = [];

export class SubscriberRepository {
  private getStore(): Subscriber[] {
    if (!global.__FLAVORNEST_SUBSCRIBERS__) {
      global.__FLAVORNEST_SUBSCRIBERS__ = [...SEED_SUBSCRIBERS];
    }
    return global.__FLAVORNEST_SUBSCRIBERS__;
  }

  async subscribe(
    rawEmail: string,
    source: SubscriberSource = 'recipe_page',
    consent = true
  ): Promise<{ subscriber: Subscriber; isNew: boolean; wasReactivated: boolean }> {
    const email = rawEmail.toLowerCase().trim();
    const store = this.getStore();
    const existing = store.find((s) => s.email === email);
    const now = new Date().toISOString();

    if (existing) {
      if (existing.status === 'unsubscribed' || existing.status === 'pending') {
        existing.status = 'active';
        existing.source = source;
        existing.subscribedAt = now;
        existing.unsubscribedAt = undefined;
        existing.updatedAt = now;
        return { subscriber: existing, isNew: false, wasReactivated: true };
      }
      return { subscriber: existing, isNew: false, wasReactivated: false };
    }

    const token = `unsub_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const newSubscriber: Subscriber = {
      id: `sub_${Date.now()}`,
      email,
      status: 'active',
      source,
      consentStatus: consent,
      consentTimestamp: now,
      subscribedAt: now,
      preferences: ['new_recipes', 'weekly_favorites'],
      unsubscribeToken: token,
      createdAt: now,
      updatedAt: now,
    };

    store.push(newSubscriber);
    return { subscriber: newSubscriber, isNew: true, wasReactivated: false };
  }

  async unsubscribe(token: string): Promise<boolean> {
    const store = this.getStore();
    const sub = store.find((s) => s.unsubscribeToken === token);
    if (!sub || sub.status === 'unsubscribed') return false;

    sub.status = 'unsubscribed';
    sub.unsubscribedAt = new Date().toISOString();
    sub.updatedAt = new Date().toISOString();
    return true;
  }

  async unsubscribeByToken(token: string): Promise<{ success: boolean }> {
    const success = await this.unsubscribe(token);
    return { success };
  }

  async findByToken(token: string): Promise<Subscriber | null> {
    const store = this.getStore();
    return store.find((s) => s.unsubscribeToken === token) || null;
  }

  async getAll(): Promise<Subscriber[]> {
    return this.getStore();
  }

  async list(status?: SubscriberStatus): Promise<SubscriberPublic[]> {
    const store = this.getStore();
    let filtered = store;
    if (status) {
      filtered = store.filter((s) => s.status === status);
    }

    return filtered.map((s) => ({
      id: s.id,
      maskedEmail: maskEmail(s.email),
      status: s.status,
      source: s.source,
      subscribedAt: s.subscribedAt,
      preferences: s.preferences,
    }));
  }

  async listPublic(status?: SubscriberStatus): Promise<SubscriberPublic[]> {
    return this.list(status);
  }

  async countActive(): Promise<number> {
    const store = this.getStore();
    return store.filter((s) => s.status === 'active').length;
  }
}

export const subscriberRepository = new SubscriberRepository();
