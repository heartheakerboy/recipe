import React from 'react';
import Link from 'next/link';
import { Layers, ArrowRight } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { collectionRepository } from '@/lib/repositories/collection.repository';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata = constructMetadata({
  title: 'Recipe Collections | FlavorNest',
  description: 'Explore curated recipe collections, from fast 30-minute weeknight dinners to comforting one-pan meals.',
  canonicalPath: '/collections/',
});

export default async function CollectionsPage() {
  const collections = await collectionRepository.list({ status: 'published' });

  return (
    <div className="py-12 sm:py-16 space-y-12 font-sans">
      <Container size="xl">
        {/* Header */}
        <div className="max-w-2xl space-y-3 border-b border-editorial-border pb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600">
            <Layers className="w-4 h-4" />
            <span>Curated Menus</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-editorial-text">
            Recipe Collections
          </h1>
          <p className="text-sm sm:text-base text-editorial-muted leading-relaxed">
            Themed meal plans and recipe roundups organized around time, cooking methods, and occasion.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collection/${col.slug}/`}
              className="group flex flex-col bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs hover:shadow-card hover:border-editorial-borderStrong transition-all"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                <img
                  src={col.imageUrl}
                  alt={col.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h2 className="font-serif text-xl font-bold text-editorial-text group-hover:text-brand-600 transition-colors">
                    {col.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-editorial-muted leading-relaxed line-clamp-2">
                    {col.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-editorial-border/60 flex items-center justify-between text-xs font-bold text-brand-600">
                  <span>Browse Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
