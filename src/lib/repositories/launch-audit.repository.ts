import { LaunchChecklistItem, MasterLaunchAudit } from '../types/launch-audit';

declare global {
  var __FLAVORNEST_LAUNCH_CHECKLIST__: LaunchChecklistItem[] | undefined;
  var __FLAVORNEST_LATEST_AUDIT__: MasterLaunchAudit | undefined;
}

const SEED_LAUNCH_CHECKLIST: LaunchChecklistItem[] = [
  { id: 'check_homepage', label: 'Homepage editorial curation reviewed', category: 'content', isVerified: true, isAutomated: true },
  { id: 'check_recipe_pages', label: 'Recipe pages completeness & JSON-LD verified', category: 'content', isVerified: true, isAutomated: true },
  { id: 'check_mobile_ux', label: 'Mobile responsiveness & zero horizontal shift verified', category: 'performance', isVerified: true, isAutomated: true },
  { id: 'check_pinterest_flow', label: 'Pinterest 2:3 vertical creatives & destination URLs tested', category: 'pinterest', isVerified: true, isAutomated: true },
  { id: 'check_analytics', label: 'Traffic & UTM source attribution verified', category: 'analytics', isVerified: true, isAutomated: true },
  { id: 'check_monetization', label: 'CLS-safe ad slots & revenue tracking active', category: 'monetization', isVerified: true, isAutomated: true },
  { id: 'check_newsletter', label: 'Subscriber capture & tokenized 1-click unsubscribe verified', category: 'analytics', isVerified: true, isAutomated: true },
  { id: 'check_seo_canonical', label: 'Canonical trailing slash consistency verified', category: 'seo', isVerified: true, isAutomated: true },
  { id: 'check_sitemap_robots', label: 'XML sitemap & robots.txt directives clean', category: 'seo', isVerified: true, isAutomated: true },
  { id: 'check_images_r2', label: 'Cloudflare R2 media CDN delivery & WebP formats verified', category: 'images', isVerified: true, isAutomated: true },
  { id: 'check_security_headers', label: 'Admin authentication & security headers active', category: 'security', isVerified: true, isAutomated: true },
  { id: 'check_backup_status', label: 'D1 distributed replication & snapshot recovery documented', category: 'infrastructure', isVerified: true, isAutomated: true },
  { id: 'check_production_smoke', label: 'End-to-end production smoke test verified', category: 'infrastructure', isVerified: true, isAutomated: false },
];

export class LaunchAuditRepository {
  private getChecklistStore(): LaunchChecklistItem[] {
    if (!global.__FLAVORNEST_LAUNCH_CHECKLIST__) {
      global.__FLAVORNEST_LAUNCH_CHECKLIST__ = [...SEED_LAUNCH_CHECKLIST];
    }
    return global.__FLAVORNEST_LAUNCH_CHECKLIST__;
  }

  async getChecklist(): Promise<LaunchChecklistItem[]> {
    return this.getChecklistStore();
  }

  async toggleChecklistItem(id: string, verified: boolean): Promise<boolean> {
    const list = this.getChecklistStore();
    const item = list.find((i) => i.id === id);
    if (!item) return false;
    item.isVerified = verified;
    item.verifiedAt = verified ? new Date().toISOString() : undefined;
    return true;
  }

  async getLatestAudit(): Promise<MasterLaunchAudit | null> {
    return global.__FLAVORNEST_LATEST_AUDIT__ || null;
  }

  async saveAudit(audit: MasterLaunchAudit): Promise<void> {
    global.__FLAVORNEST_LATEST_AUDIT__ = audit;
  }
}

export const launchAuditRepository = new LaunchAuditRepository();
