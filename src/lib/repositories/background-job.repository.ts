import { BackgroundJobRecord, BackgroundJobStatus } from '../types/system-health';

declare global {
  var __FLAVORNEST_BACKGROUND_JOBS__: BackgroundJobRecord[] | undefined;
}

const SEED_JOBS: BackgroundJobRecord[] = [
  {
    id: 'job_pinterest_sync_daily',
    name: 'Pinterest Analytics Daily Sync',
    status: 'completed',
    attempts: 1,
    maxAttempts: 3,
    idempotencyKey: 'idemp_pin_sync_2026_09_01',
    createdAt: '2026-09-01T02:00:00Z',
    updatedAt: '2026-09-01T02:00:15Z',
  },
  {
    id: 'job_sitemap_indexnow',
    name: 'Sitemap & IndexNow Ping Coordinator',
    status: 'completed',
    attempts: 1,
    maxAttempts: 3,
    idempotencyKey: 'idemp_sitemap_ping_2026_08_31',
    createdAt: '2026-08-31T18:00:00Z',
    updatedAt: '2026-08-31T18:00:04Z',
  },
  {
    id: 'job_newsletter_digest_weekly',
    name: 'Weekly Digest Newsletter Broadcast',
    status: 'completed',
    attempts: 1,
    maxAttempts: 3,
    idempotencyKey: 'idemp_news_digest_w35',
    createdAt: '2026-08-29T14:00:00Z',
    updatedAt: '2026-08-29T14:01:20Z',
  },
];

export class BackgroundJobRepository {
  private getStore(): BackgroundJobRecord[] {
    if (!global.__FLAVORNEST_BACKGROUND_JOBS__) {
      global.__FLAVORNEST_BACKGROUND_JOBS__ = [...SEED_JOBS];
    }
    return global.__FLAVORNEST_BACKGROUND_JOBS__;
  }

  async listJobs(): Promise<BackgroundJobRecord[]> {
    return this.getStore();
  }

  async getById(id: string): Promise<BackgroundJobRecord | null> {
    const store = this.getStore();
    return store.find((j) => j.id === id) || null;
  }

  async retryJob(id: string): Promise<{ success: boolean; job?: BackgroundJobRecord; error?: string }> {
    const store = this.getStore();
    const job = store.find((j) => j.id === id);
    if (!job) return { success: false, error: 'Job not found' };

    job.attempts += 1;
    job.status = 'completed'; // Simulates successful retry completion
    job.error = undefined;
    job.updatedAt = new Date().toISOString();

    return { success: true, job };
  }
}

export const backgroundJobRepository = new BackgroundJobRepository();
