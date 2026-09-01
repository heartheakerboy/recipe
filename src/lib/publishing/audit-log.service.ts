export type PublishingAuditAction =
  | 'published'
  | 'unpublished'
  | 'updated'
  | 'archived'
  | 'restored';

export interface PublishingAuditRecord {
  id: string;
  recipeId: string;
  action: PublishingAuditAction;
  adminId: string;
  previousStatus: string;
  newStatus: string;
  timestamp: string;
  details?: Record<string, any>;
}

declare global {
  var __FLAVORNEST_AUDIT_LOGS__: PublishingAuditRecord[] | undefined;
}

export class PublishingAuditService {
  private getStore(): PublishingAuditRecord[] {
    if (!global.__FLAVORNEST_AUDIT_LOGS__) {
      global.__FLAVORNEST_AUDIT_LOGS__ = [];
    }
    return global.__FLAVORNEST_AUDIT_LOGS__;
  }

  recordEvent(data: {
    recipeId: string;
    action: PublishingAuditAction;
    adminId?: string;
    previousStatus: string;
    newStatus: string;
    details?: Record<string, any>;
  }): PublishingAuditRecord {
    const store = this.getStore();
    const record: PublishingAuditRecord = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      recipeId: data.recipeId,
      action: data.action,
      adminId: data.adminId || 'admin_user',
      previousStatus: data.previousStatus,
      newStatus: data.newStatus,
      timestamp: new Date().toISOString(),
      details: data.details,
    };
    store.unshift(record);
    return record;
  }

  listByRecipe(recipeId: string): PublishingAuditRecord[] {
    return this.getStore().filter((r) => r.recipeId === recipeId);
  }

  listAll(): PublishingAuditRecord[] {
    return this.getStore();
  }
}

export const publishingAuditService = new PublishingAuditService();
