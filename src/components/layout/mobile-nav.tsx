'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChefHat, Search, ArrowRight } from 'lucide-react';
import { siteConfig } from '@/lib/config/site.config';
import { PRIMARY_CATEGORIES } from '@/lib/config/categories.config';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const categories = Object.values(PRIMARY_CATEGORIES).slice(0, 8);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        className="p-2 text-editorial-text hover:text-brand-500 rounded-lg hover:bg-editorial-surfaceAlt transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-editorial-text/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white p-6 shadow-float overflow-y-auto z-10">
            <div className="flex items-center justify-between border-b border-editorial-border pb-4">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2"
              >
                <span className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-serif font-bold text-lg">
                  F
                </span>
                <span className="font-serif text-lg font-bold text-editorial-text">
                  {siteConfig.name}
                </span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 text-editorial-muted hover:text-editorial-text rounded-lg hover:bg-editorial-surfaceAlt"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Search */}
            <div className="my-5">
              <Link
                href="/recipes"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-editorial-surface border border-editorial-border text-sm text-editorial-muted hover:border-brand-500 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-editorial-lightMuted" />
                  Search recipes...
                </span>
                <ArrowRight className="w-4 h-4 text-editorial-lightMuted" />
              </Link>
            </div>

            {/* Primary Navigation */}
            <nav className="space-y-1 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-editorial-lightMuted px-3 mb-2">
                Explore
              </p>
              {siteConfig.navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-editorial-text hover:bg-editorial-surface hover:text-brand-500 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Popular Categories */}
            <div className="mt-4 border-t border-editorial-border pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-editorial-lightMuted px-3 mb-2">
                Top Categories
              </p>
              <div className="grid grid-cols-1 gap-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-1.5 rounded-md text-xs text-editorial-muted hover:text-brand-500 hover:bg-editorial-surface transition-colors"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-editorial-lightMuted">Explore</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer summary */}
            <div className="mt-auto border-t border-editorial-border pt-4 text-xs text-editorial-lightMuted text-center">
              <p className="italic font-serif">{siteConfig.tagline}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
