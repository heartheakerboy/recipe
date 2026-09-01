import React from 'react';
import Link from 'next/link';
import { Heart, ExternalLink } from 'lucide-react';
import { siteConfig } from '@/lib/config/site.config';
import { Container } from './container';

export function Footer() {
  return (
    <footer className="bg-[#1C1613] text-[#E0D7D0] pt-14 sm:pt-16 pb-12 border-t border-brand-900/30">
      <Container size="xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-[#2E2420]">
          {/* Brand Col */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center font-serif font-bold text-lg">
                F
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-tight">
                {siteConfig.name}
                <span className="text-brand-400 font-sans text-lg">.xyz</span>
              </span>
            </div>
            <p className="text-sm text-[#A89C94] leading-relaxed max-w-sm">
              {siteConfig.tagline} — Dependable, flavor-first home cooking recipes created for real kitchens, busy schedules, and everyday ingredients.
            </p>
            <div className="pt-1">
              <a
                href={siteConfig.social.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E60023] hover:bg-[#c9021e] text-white text-xs font-semibold tracking-wide transition-all shadow-sm"
              >
                <span>Follow on Pinterest</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Explore Col */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-white">
              Explore
            </p>
            <ul className="space-y-2 text-sm text-[#A89C94]">
              <li>
                <Link href="/recipes/" className="hover:text-brand-400 transition-colors">
                  All Recipes
                </Link>
              </li>
              <li>
                <Link href="/collections/" className="hover:text-brand-400 transition-colors">
                  Curated Collections
                </Link>
              </li>
              <li>
                <Link href="/category/quick-and-easy/" className="hover:text-brand-400 transition-colors">
                  Quick & Easy
                </Link>
              </li>
              <li>
                <Link href="/category/chicken/" className="hover:text-brand-400 transition-colors">
                  Chicken Recipes
                </Link>
              </li>
              <li>
                <Link href="/category/pasta" className="hover:text-brand-400 transition-colors">
                  Pasta Dishes
                </Link>
              </li>
              <li>
                <Link href="/category/air-fryer" className="hover:text-brand-400 transition-colors">
                  Air Fryer
                </Link>
              </li>
              <li>
                <Link href="/category/desserts" className="hover:text-brand-400 transition-colors">
                  Desserts & Sweets
                </Link>
              </li>
            </ul>
          </div>

          {/* About & Legal Col */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-white">
              About
            </p>
            <ul className="space-y-2 text-sm text-[#A89C94]">
              <li>
                <Link href="/about" className="hover:text-brand-400 transition-colors">
                  About FlavorNest
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-brand-400 transition-colors">
                  Recipe Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Col */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-white">
              Follow
            </p>
            <ul className="space-y-2 text-sm text-[#A89C94]">
              <li>
                <a
                  href={siteConfig.social.pinterest}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Pinterest</span>
                  <ExternalLink className="w-3 h-3 text-[#7D7068]" />
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Instagram</span>
                  <ExternalLink className="w-3 h-3 text-[#7D7068]" />
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Facebook</span>
                  <ExternalLink className="w-3 h-3 text-[#7D7068]" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Recipe Disclaimer */}
        <div className="py-6 text-xs text-[#7D7068] leading-relaxed border-b border-[#2E2420]">
          <p>
            <strong className="text-[#A89C94]">Recipe & Nutritional Disclaimer:</strong> Nutritional estimates provided on {siteConfig.name}.xyz are calculated automatically based on standardized USDA values and may vary depending on brands, cooking times, and portion sizes. Always verify safe minimum internal cooking temperatures.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A7D75]">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Crafted for passionate home cooks</span>
            <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
          </p>
        </div>
      </Container>
    </footer>
  );
}
