export interface AIJobRecord {
  id: string;
  entityType: 'recipe' | 'category';
  entityId: string;
  jobType: 'recipe_dna' | 'style_selection' | 'content_generation' | 'content_validation' | 'seo_generation';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  provider: string;
  model: string;
  inputReference?: string;
  outputReference?: string;
  errorMessage?: string;
  durationMs?: number;
  createdAt: string;
  updatedAt: string;
}

declare global {
  var __FLAVORNEST_AI_JOBS__: AIJobRecord[] | undefined;
}

export class AIJobService {
  private getStore(): AIJobRecord[] {
    if (!global.__FLAVORNEST_AI_JOBS__) {
      global.__FLAVORNEST_AI_JOBS__ = [];
    }
    return global.__FLAVORNEST_AI_JOBS__;
  }

  createJob(data: {
    entityType: 'recipe' | 'category';
    entityId: string;
    jobType: AIJobRecord['jobType'];
    provider?: string;
    model?: string;
  }): AIJobRecord {
    const store = this.getStore();
    const now = new Date().toISOString();
    const job: AIJobRecord = {
      id: `ai_job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      entityType: data.entityType,
      entityId: data.entityId,
      jobType: data.jobType,
      status: 'processing',
      provider: data.provider || 'default',
      model: data.model || 'standard',
      createdAt: now,
      updatedAt: now,
    };
    store.unshift(job);
    return job;
  }

  completeJob(jobId: string, outputReference?: string, durationMs?: number): void {
    const store = this.getStore();
    const job = store.find((j) => j.id === jobId);
    if (job) {
      job.status = 'completed';
      job.outputReference = outputReference;
      job.durationMs = durationMs;
      job.updatedAt = new Date().toISOString();
    }
  }

  failJob(jobId: string, errorMessage: string, durationMs?: number): void {
    const store = this.getStore();
    const job = store.find((j) => j.id === jobId);
    if (job) {
      job.status = 'failed';
      job.errorMessage = errorMessage;
      job.durationMs = durationMs;
      job.updatedAt = new Date().toISOString();
    }
  }

  listJobsByEntity(entityId: string): AIJobRecord[] {
    return this.getStore().filter((j) => j.entityId === entityId);
  }
}

export const aiJobService = new AIJobService();
