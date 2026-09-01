import { BudgetGuardConfig } from '../types/pipeline';

declare global {
  var __FLAVORNEST_BUDGET_GUARD__: BudgetGuardConfig | undefined;
}

const DEFAULT_BUDGET_CONFIG: BudgetGuardConfig = {
  dailyAiBudget: 15.0, // $15.00 daily limit
  dailyImageBudget: 20.0, // $20.00 daily limit
  dailyAiSpent: 1.24,
  dailyImageSpent: 2.16,
  isPaused: false,
  lastResetDate: new Date().toISOString().slice(0, 10),
};

export class BudgetGuardService {
  private getConfig(): BudgetGuardConfig {
    if (!global.__FLAVORNEST_BUDGET_GUARD__) {
      global.__FLAVORNEST_BUDGET_GUARD__ = { ...DEFAULT_BUDGET_CONFIG };
    }

    const today = new Date().toISOString().slice(0, 10);
    if (global.__FLAVORNEST_BUDGET_GUARD__.lastResetDate !== today) {
      global.__FLAVORNEST_BUDGET_GUARD__.dailyAiSpent = 0;
      global.__FLAVORNEST_BUDGET_GUARD__.dailyImageSpent = 0;
      global.__FLAVORNEST_BUDGET_GUARD__.lastResetDate = today;
    }

    return global.__FLAVORNEST_BUDGET_GUARD__;
  }

  getStatus(): BudgetGuardConfig {
    return { ...this.getConfig() };
  }

  canExecuteAiJob(estimatedCost = 0.05): { allowed: boolean; reason?: string } {
    const config = this.getConfig();
    if (config.isPaused) {
      return { allowed: false, reason: 'Pipeline is currently paused by administrator.' };
    }
    if (config.dailyAiSpent + estimatedCost > config.dailyAiBudget) {
      return {
        allowed: false,
        reason: `Generation paused — daily AI budget limit of $${config.dailyAiBudget.toFixed(2)} reached.`,
      };
    }
    return { allowed: true };
  }

  canExecuteImageJob(estimatedCost = 0.08): { allowed: boolean; reason?: string } {
    const config = this.getConfig();
    if (config.isPaused) {
      return { allowed: false, reason: 'Pipeline is currently paused by administrator.' };
    }
    if (config.dailyImageSpent + estimatedCost > config.dailyImageBudget) {
      return {
        allowed: false,
        reason: `Generation paused — daily image budget limit of $${config.dailyImageBudget.toFixed(2)} reached.`,
      };
    }
    return { allowed: true };
  }

  recordAiSpend(amount = 0.04): void {
    const config = this.getConfig();
    config.dailyAiSpent += amount;
  }

  recordImageSpend(amount = 0.08): void {
    const config = this.getConfig();
    config.dailyImageSpent += amount;
  }

  pause(): void {
    const config = this.getConfig();
    config.isPaused = true;
  }

  resume(): void {
    const config = this.getConfig();
    config.isPaused = false;
  }

  updateLimits(dailyAiBudget: number, dailyImageBudget: number): void {
    const config = this.getConfig();
    config.dailyAiBudget = dailyAiBudget;
    config.dailyImageBudget = dailyImageBudget;
  }
}

export const budgetGuard = new BudgetGuardService();
