import React from 'react';
import Link from 'next/link';
import { Category } from '@/lib/types/category';
import { OptimizedImage } from '../common/optimized-image';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const fallbackImage =
    category.heroImage ||
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

  return (
    <Link
      href={`/category/${category.slug}`}
      className={cn(
        'group relative flex flex-col rounded-2xl bg-white border border-editorial-border overflow-hidden shadow-sm hover:shadow-card-hover hover:border-editorial-borderStrong transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      {/* Category Image Container */}
      <div className="relative aspect-recipe-card w-full overflow-hidden bg-editorial-surfaceAlt">
        <OptimizedImage
          src={fallbackImage}
          alt={`${category.name} recipes`}
          fill
          className="group-hover:scale-105 transition-transform duration-500 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="font-serif text-lg sm:text-xl font-bold leading-snug drop-shadow-sm">
            {category.name}
          </h3>
          {category.recipeCount && (
            <p className="text-[11px] font-semibold text-white/90 uppercase tracking-wider">
              {category.recipeCount} Recipes
            </p>
          )}
        </div>
      </div>

      {/* Description Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <p className="text-xs text-editorial-muted line-clamp-2 leading-relaxed mb-3">
          {category.shortDescription || category.description}
        </p>

        <div className="flex items-center justify-between text-xs font-bold text-brand-600 group-hover:text-brand-700">
          <span>Explore Category</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
