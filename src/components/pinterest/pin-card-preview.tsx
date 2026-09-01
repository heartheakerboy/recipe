'use client';

import React from 'react';
import { PinterestCreative } from '@/lib/types/pinterest';
import { PINTEREST_TEMPLATES } from '@/lib/pinterest/templates';

interface PinCardPreviewProps {
  creative: PinterestCreative;
  className?: string;
}

export function PinCardPreview({ creative, className = '' }: PinCardPreviewProps) {
  const template = PINTEREST_TEMPLATES[creative.creativeTemplate] || PINTEREST_TEMPLATES['template-a-hero'];

  return (
    <div
      className={`relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-md bg-zinc-900 select-none group font-sans border border-editorial-border ${className}`}
    >
      {/* Background / Main Food Image */}
      <img
        src={creative.imageUrl}
        alt={creative.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* =========================================================================
          TEMPLATE A: HERO FOOD (Floating Top Badge & Clean Food Dominance)
         ========================================================================= */}
      {creative.creativeTemplate === 'template-a-hero' && (
        <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5 bg-gradient-to-b from-black/60 via-transparent to-black/50">
          {/* Top Headline Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3.5 sm:p-4 text-center shadow-lg border border-white/40">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-600 block mb-0.5">
              FlavorNest Original
            </span>
            <h3 className="font-serif text-sm sm:text-base md:text-lg font-black text-zinc-900 leading-tight">
              {creative.overlayText}
            </h3>
            {creative.subheadline && (
              <p className="text-[10px] sm:text-xs text-zinc-600 font-medium mt-0.5">
                {creative.subheadline}
              </p>
            )}
          </div>

          {/* Bottom Branding Bar */}
          <div className="flex items-center justify-between text-white/90 text-[10px] font-bold tracking-wider px-1">
            <span className="drop-shadow-md">FLAVORNEST.XYZ</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[9px]">
              Tap for Recipe
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          TEMPLATE B: EDITORIAL MAGAZINE (Serif Typography Block & Texture)
         ========================================================================= */}
      {creative.creativeTemplate === 'template-b-editorial' && (
        <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-5 bg-gradient-to-t from-black/80 via-black/20 to-black/40">
          {/* Top Subtle Brand Tag */}
          <div className="flex justify-center">
            <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[9px] font-bold uppercase tracking-widest text-zinc-900 shadow-sm">
              FlavorNest Kitchen
            </span>
          </div>

          {/* Lower Content Plate */}
          <div className="bg-zinc-900/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 text-center text-white border border-white/10 shadow-2xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
              {creative.contentAngle.replace(/-/g, ' ')}
            </span>
            <h3 className="font-serif text-base sm:text-lg md:text-xl font-bold text-white leading-snug">
              {creative.overlayText}
            </h3>
            {creative.subheadline && (
              <p className="text-[11px] text-zinc-300 font-light">
                {creative.subheadline}
              </p>
            )}
            <div className="pt-2 flex justify-center">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                flavornest.xyz
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TEMPLATE C: RECIPE FOCUS (Timing / Feature Badge Callouts)
         ========================================================================= */}
      {creative.creativeTemplate === 'template-c-recipe-focus' && (
        <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-b from-black/70 via-transparent to-black/70">
          {/* Top Badge Overlay */}
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-lg bg-brand-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
              ★ Quick & Easy Dinner
            </div>
            <div className="bg-white/95 backdrop-blur-xs rounded-xl p-3.5 shadow-lg border border-white/50 text-left">
              <h3 className="font-serif text-sm sm:text-base font-bold text-zinc-950 leading-tight">
                {creative.overlayText}
              </h3>
              {creative.subheadline && (
                <div className="text-[10px] font-semibold text-brand-600 mt-1">
                  ✓ {creative.subheadline}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Branding Callout */}
          <div className="bg-black/60 backdrop-blur-xs rounded-xl p-2.5 flex items-center justify-between text-white text-[10px]">
            <span className="font-serif font-bold text-brand-400">FlavorNest</span>
            <span className="font-medium text-zinc-300">Get the full recipe →</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          TEMPLATE D: COLLAGE (Main Plated Shot + Inset Detail Panels)
         ========================================================================= */}
      {creative.creativeTemplate === 'template-d-collage' && (
        <div className="absolute inset-0 flex flex-col justify-between p-3.5 bg-gradient-to-t from-black/80 via-transparent to-black/30">
          {/* Inset Process Thumbnails Grid */}
          <div className="flex justify-end gap-2">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md bg-zinc-800 shrink-0">
              <img src={creative.imageUrl} alt="Detail" className="w-full h-full object-cover" />
            </div>
            {creative.secondaryImageUrls && creative.secondaryImageUrls[0] && (
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md bg-zinc-800 shrink-0">
                <img src={creative.secondaryImageUrls[0]} alt="Step" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Bottom Headline Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 text-center shadow-2xl border border-white/60">
            <span className="text-[9px] font-black uppercase tracking-wider text-rose-600 block mb-0.5">
              Step-By-Step Recipe
            </span>
            <h3 className="font-serif text-sm sm:text-base font-bold text-zinc-900 leading-snug">
              {creative.overlayText}
            </h3>
            <span className="text-[10px] text-zinc-500 font-bold block mt-1">
              flavornest.xyz
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          TEMPLATE E: CLEAN MINIMAL (Restrained Lower Third Caption Bar)
         ========================================================================= */}
      {creative.creativeTemplate === 'template-e-minimal' && (
        <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/90 via-black/30 to-transparent">
          <div className="border-l-4 border-brand-500 pl-3 py-1 space-y-0.5 text-left">
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-300">
              FlavorNest.xyz
            </span>
            <h3 className="font-serif text-sm sm:text-base md:text-lg font-bold text-white leading-tight drop-shadow-sm">
              {creative.overlayText}
            </h3>
            {creative.subheadline && (
              <p className="text-[10px] text-zinc-300 font-light">
                {creative.subheadline}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
