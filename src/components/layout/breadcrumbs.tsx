import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { buildBreadcrumbJsonLd } from '@/lib/seo/schema-builder';
import { JsonLd } from '@/lib/seo/json-ld';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const allItems = [{ name: 'Home', url: '/' }, ...items];
  const jsonLdData = buildBreadcrumbJsonLd(allItems);

  return (
    <>
      <JsonLd data={jsonLdData} />
      <nav aria-label="Breadcrumb" className={cn('py-3 text-xs sm:text-sm text-editorial-muted', className)}>
        <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            return (
              <li key={item.url} className="flex items-center gap-1.5 sm:gap-2">
                {index === 0 ? (
                  <Link
                    href={item.url}
                    className="hover:text-brand-500 transition-colors flex items-center gap-1"
                    title="Home"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span className="sr-only sm:not-sr-only">Home</span>
                  </Link>
                ) : isLast ? (
                  <span className="font-semibold text-editorial-text truncate max-w-[200px] sm:max-w-none" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.url} className="hover:text-brand-500 transition-colors">
                    {item.name}
                  </Link>
                )}
                {!isLast && <ChevronRight className="w-3.5 h-3.5 text-editorial-lightMuted shrink-0" />}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
