'use client';

import React from 'react';
import { AdPlacementSlot } from '@/lib/types/revenue';

interface AdSlotProps {
  slot: AdPlacementSlot;
  device?: 'all' | 'desktop' | 'mobile';
  className?: string;
}

export function AdSlot({ slot, device = 'all', className = '' }: AdSlotProps) {
  // Device visibility classes
  const deviceClass =
    device === 'desktop' ? 'hidden sm:flex' : device === 'mobile' ? 'flex sm:hidden' : 'flex';

  // Dimension reservation to prevent Cumulative Layout Shift (CLS)
  const isHorizontalBanner = slot === 'recipe_top' || slot === 'homepage';
  const minHeightClass = isHorizontalBanner ? 'min-h-[90px]' : 'min-h-[250px]';

  return (
    <div
      data-ad-slot={slot}
      className={`my-8 w-full ${deviceClass} flex-col items-center justify-center rounded-2xl bg-editorial-surface/40 border border-dashed border-editorial-border/60 ${minHeightClass} p-4 transition-all ${className}`}
    >
      <div className="text-center space-y-1 select-none pointer-events-none">
        <span className="text-[9px] font-bold uppercase tracking-widest text-editorial-lightMuted block">
          Advertisement
        </span>
        <span className="text-[10px] text-editorial-muted/80 font-mono">
          Sponsored culinary showcase
        </span>
      </div>
    </div>
  );
}
