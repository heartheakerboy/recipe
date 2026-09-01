'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, Sparkles } from 'lucide-react';
import { siteConfig } from '@/lib/config/site.config';
import { Container } from './container';
import { MobileNav } from './mobile-nav';

const PRIMARY_NAV_ITEMS = [
  { label: 'Recipes', href: '/recipes/' },
  { label: 'Collections', href: '/collections/' },
  { label: 'Quick & Easy', href: '/category/quick-and-easy/' },
  { label: 'Chicken', href: '/category/chicken/' },
  { label: 'Pasta', href: '/category/pasta/' },
  { label: 'Desserts', href: '/category/desserts/' },
];

const MORE_CATEGORIES = [
  { label: 'Dinner', href: '/category/dinner/' },
  { label: 'Beef Dinners', href: '/category/beef/' },
  { label: 'Breakfast & Brunch', href: '/category/breakfast/' },
  { label: 'Slow Cooker Meals', href: '/category/slow-cooker/' },
  { label: 'One-Pot Meals', href: '/category/one-pot-meals/' },
  { label: '30-Minute Meals', href: '/category/30-minute-meals/' },
];

export function Header() {
  const [moreOpen, setMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-editorial-border transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-editorial-surface border-b border-editorial-border/60 py-1 px-4 text-center text-[11px] sm:text-xs font-medium text-editorial-muted hidden sm:block">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>Simple, dependable recipes tested for big flavor and easy weeknight prep.</span>
        </span>
      </div>

      <Container size="xl">
        <div className="flex h-16 sm:h-18 items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center font-serif font-black text-xl shadow-sm group-hover:bg-brand-600 transition-colors">
              F
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-editorial-text group-hover:text-brand-500 transition-colors">
                {siteConfig.name}
                <span className="text-brand-500 font-sans text-base">.xyz</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-editorial-lightMuted -mt-1 hidden lg:block">
                {siteConfig.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-sm font-semibold text-editorial-muted">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-lg hover:text-brand-500 hover:bg-editorial-surfaceAlt/70 transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}

            {/* "More" Categories Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setMoreOpen(false);
                }}
                aria-expanded={moreOpen}
                aria-haspopup="true"
                className="px-3 py-1.5 rounded-lg hover:text-brand-500 hover:bg-editorial-surfaceAlt/70 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-editorial-border shadow-float py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-editorial-lightMuted px-4 py-1">
                    More Categories
                  </p>
                  {MORE_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={() => setMoreOpen(false)}
                      className="block px-4 py-2 text-xs font-semibold text-editorial-text hover:bg-editorial-surface hover:text-brand-500 transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/search"
              aria-label="Search recipes"
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border text-xs sm:text-sm font-medium text-editorial-muted hover:text-editorial-text transition-all"
            >
              <Search className="w-4 h-4 text-editorial-lightMuted" />
              <span className="hidden sm:inline">Search</span>
            </Link>

            {/* Mobile Nav Trigger */}
            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  );
}
