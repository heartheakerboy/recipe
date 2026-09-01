'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageRecord } from '@/lib/repositories/image.repository';
import { Recipe } from '@/lib/types/recipe';
import { Copy, Check, Filter, UploadCloud, Info, Trash2 } from 'lucide-react';

interface MediaAdminManagerProps {
  initialImages: ImageRecord[];
  recipes: Recipe[];
}

export function MediaAdminManager({ initialImages, recipes }: MediaAdminManagerProps) {
  const [images, setImages] = useState(initialImages);
  const [selectedType, setSelectedType] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredImages = images.filter((img) =>
    selectedType === 'all' ? true : img.type === selectedType
  );

  const getRecipeTitle = (recipeId?: string) => {
    if (!recipeId) return 'Unassigned';
    const r = recipes.find((x) => x.id === recipeId);
    return r ? r.title : recipeId;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text">
            Media & Image Library (R2)
          </h1>
          <p className="text-xs sm:text-sm text-editorial-muted">
            Metadata references for optimized food photography stored on Cloudflare R2.
          </p>
        </div>

        {/* Upload Placeholder info */}
        <div className="flex items-center gap-2">
          <button
            disabled
            title="Direct upload and automated FLUX generation will be activated in later phases"
            className="px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-editorial-lightMuted text-xs font-bold inline-flex items-center gap-2 cursor-not-allowed opacity-75"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload to R2 (Phase 2 Stub)</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-editorial-border shadow-sm">
        <div className="flex items-center gap-2">
          <label htmlFor="media-filter" className="text-xs font-bold text-editorial-muted">
            Filter Type:
          </label>
          <select
            id="media-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs rounded-xl bg-editorial-surface border border-editorial-border py-1.5 px-3 font-semibold text-editorial-text"
          >
            <option value="all">All Image Types</option>
            <option value="hero">Hero Images</option>
            <option value="step">Step Photos</option>
            <option value="pin_vertical">Pinterest (2:3)</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-editorial-muted">
          Showing {filteredImages.length} images
        </span>
      </div>

      {/* Grid of Media Assets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredImages.map((img) => (
          <div
            key={img.id}
            className="bg-white rounded-2xl border border-editorial-border overflow-hidden shadow-sm hover:shadow-card transition-all flex flex-col justify-between"
          >
            {/* Image Preview */}
            <div className="relative aspect-recipe-card bg-editorial-surfaceAlt overflow-hidden">
              <Image
                src={img.url}
                alt={img.altText}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover"
              />
              <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white uppercase tracking-wide">
                {img.type}
              </span>
            </div>

            {/* Info Body */}
            <div className="p-4 space-y-2 text-xs flex-1 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[11px] font-bold text-editorial-text truncate" title={img.r2Key}>
                  {img.r2Key}
                </div>
                <div className="text-[11px] text-editorial-muted line-clamp-1 mt-0.5">
                  Recipe: {getRecipeTitle(img.recipeId)}
                </div>
                <div className="text-[10px] text-editorial-lightMuted mt-1">
                  {img.width} × {img.height} • {img.format.toUpperCase()} • {img.sourceType}
                </div>
              </div>

              <div className="pt-2 border-t border-editorial-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => copyUrl(img.url, img.id)}
                  className="px-2.5 py-1 rounded-lg bg-editorial-surface hover:bg-editorial-surfaceAlt text-editorial-text font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedId === img.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-editorial-muted" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
