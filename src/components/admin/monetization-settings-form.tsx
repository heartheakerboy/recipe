'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sliders,
  DollarSign,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { MonetizationSettings, AdPlacementSlot } from '@/lib/types/revenue';
import { updateMonetizationSettingsAction } from '@/lib/actions/monetization-actions';

interface MonetizationSettingsFormProps {
  initialSettings: MonetizationSettings;
}

const ALL_SLOTS: Array<{ id: AdPlacementSlot; label: string; description: string }> = [
  {
    id: 'recipe_after_intro',
    label: 'Recipe — After Introduction',
    description: 'Displays directly after the opening culinary story, before ingredients.',
  },
  {
    id: 'recipe_after_ingredients',
    label: 'Recipe — After Ingredients List',
    description: 'Natural reading break before step-by-step cooking instructions.',
  },
  {
    id: 'recipe_after_instructions',
    label: 'Recipe — After Instructions',
    description: 'Appears after the last instruction step, before printable card and comments.',
  },
  {
    id: 'recipe_top',
    label: 'Recipe — Top Leaderboard',
    description: 'Header billboard banner (Disabled by default to preserve editorial hero experience).',
  },
  {
    id: 'recipe_related',
    label: 'Recipe — Related Recipes Rail',
    description: 'Placed within the recommendations section at the bottom of the page.',
  },
  {
    id: 'homepage',
    label: 'Homepage — Mid-Page Break',
    description: 'Editorial divider between curated collections and latest recipes.',
  },
  {
    id: 'category',
    label: 'Category Index — Grid Divider',
    description: 'Natural card slot embedded within category recipe browsing grids.',
  },
];

export function MonetizationSettingsForm({ initialSettings }: MonetizationSettingsFormProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<MonetizationSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggleSlot = (slot: AdPlacementSlot) => {
    setSettings((prev) => {
      const exists = prev.enabledSlots.includes(slot);
      return {
        ...prev,
        enabledSlots: exists
          ? prev.enabledSlots.filter((s) => s !== slot)
          : [...prev.enabledSlots, slot],
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotification(null);

    try {
      const res = await updateMonetizationSettingsAction(settings);
      if (res.success) {
        setNotification({ type: 'success', text: 'Monetization settings saved successfully!' });
        router.refresh();
      }
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
            <Sliders className="w-4 h-4" />
            <span>Monetization Controls</span>
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
            Ad Placement & Provider Configuration
          </h1>
          <p className="text-xs text-editorial-muted">
            Configure active advertising networks, slot positions, and unit cost baselines.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Provider Selection Card */}
      <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs space-y-5">
        <h3 className="font-serif text-base font-bold text-editorial-text border-b border-editorial-border pb-3">
          1. Active Ad Network Provider
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="p-4 rounded-2xl border border-editorial-border hover:bg-editorial-surface flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="activeProvider"
              value="adsense"
              checked={settings.activeProvider === 'adsense'}
              onChange={() => setSettings((s) => ({ ...s, activeProvider: 'adsense' }))}
              className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
            />
            <div className="space-y-1">
              <span className="font-bold text-sm text-editorial-text block">
                Google AdSense
              </span>
              <p className="text-xs text-editorial-muted">
                Official Google AdSense integration using client publisher ID.
              </p>
            </div>
          </label>

          <label className="p-4 rounded-2xl border border-editorial-border hover:bg-editorial-surface flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="activeProvider"
              value="mock"
              checked={settings.activeProvider === 'mock'}
              onChange={() => setSettings((s) => ({ ...s, activeProvider: 'mock' }))}
              className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
            />
            <div className="space-y-1">
              <span className="font-bold text-sm text-editorial-text block">
                Development Mock Provider
              </span>
              <p className="text-xs text-editorial-muted">
                Clean placeholder containers with reserved heights for layout and CLS testing.
              </p>
            </div>
          </label>
        </div>

        {settings.activeProvider === 'adsense' && (
          <div className="max-w-md space-y-1.5 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text">
              Google AdSense Publisher Client ID
            </label>
            <input
              type="text"
              required
              value={settings.adSenseClientId}
              onChange={(e) => setSettings((s) => ({ ...s, adSenseClientId: e.target.value }))}
              placeholder="ca-pub-0000000000000000"
              className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border font-mono text-xs text-editorial-text"
            />
          </div>
        )}
      </div>

      {/* Controlled Ad Slot Toggles */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs">
        <div className="p-6 border-b border-editorial-border">
          <h3 className="font-serif text-base font-bold text-editorial-text">
            2. Controlled Ad Slot Placements
          </h3>
          <p className="text-xs text-editorial-muted">
            Enable or disable individual ad placements across recipe pages, homepage, and category hubs.
          </p>
        </div>

        <div className="divide-y divide-editorial-border">
          {ALL_SLOTS.map((slot) => {
            const isEnabled = settings.enabledSlots.includes(slot.id);
            return (
              <div key={slot.id} className="p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-serif font-bold text-sm text-editorial-text block">
                    {slot.label}
                  </span>
                  <p className="text-xs text-editorial-muted">
                    {slot.description}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => handleToggleSlot(slot.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unit Cost Assumptions */}
      <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs space-y-4">
        <div className="border-b border-editorial-border pb-3">
          <h3 className="font-serif text-base font-bold text-editorial-text">
            3. Recipe Unit Cost Assumptions
          </h3>
          <p className="text-xs text-editorial-muted">
            Baseline production cost per recipe used to calculate net content contribution and ROI.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text">
              Cost per AI Editorial Rewrite ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={settings.costPerAiRewrite}
              onChange={(e) => setSettings((s) => ({ ...s, costPerAiRewrite: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border font-mono text-xs text-editorial-text"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-editorial-text">
              Cost per FLUX Food Image ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={settings.costPerFluxImage}
              onChange={(e) => setSettings((s) => ({ ...s, costPerFluxImage: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border font-mono text-xs text-editorial-text"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
