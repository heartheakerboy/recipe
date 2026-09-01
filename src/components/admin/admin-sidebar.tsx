'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  Tags,
  Image as ImageIcon,
  Settings,
  Sparkles,
  ExternalLink,
  Workflow,
  PlusCircle,
  Flame,
  Search,
  DollarSign,
  Users,
  Compass,
  Briefcase,
  Activity,
  Rocket,
  LineChart,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const NAV_LINKS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Pipeline', href: '/admin/pipeline', icon: Workflow },
  { label: 'Content Strategy', href: '/admin/content', icon: Compass },
  { label: 'SEO Intelligence', href: '/admin/seo', icon: Search },
  { label: 'Pinterest', href: '/admin/pinterest', icon: Flame },
  { label: 'Revenue', href: '/admin/revenue', icon: DollarSign },
  { label: 'Audience & Email', href: '/admin/audience', icon: Users },
  { label: 'Business & Flip', href: '/admin/business', icon: Briefcase },
  { label: 'System Health', href: '/admin/system/health', icon: Activity },
  { label: 'Launch Readiness', href: '/admin/launch', icon: Rocket },
  { label: 'Growth System', href: '/admin/growth', icon: LineChart },
  { label: 'Import Recipe', href: '/admin/recipes/import', icon: Sparkles },
  { label: 'Recipes', href: '/admin/recipes', icon: UtensilsCrossed },
  { label: 'Collections', href: '/admin/collections', icon: Layers },
  { label: 'Categories', href: '/admin/categories', icon: Layers },
  { label: 'Tags', href: '/admin/tags', icon: Tags },
  { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#1C1613] text-[#D4C8C0] flex flex-col h-full border-r border-[#2E2420] shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#2E2420]">
        <Link href="/admin" onClick={onClose} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 text-white font-serif font-black text-lg flex items-center justify-center shadow-sm">
            F
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-white tracking-tight leading-none text-base">
              FlavorNest
            </span>
            <span className="text-[10px] text-brand-400 font-semibold tracking-wider uppercase">
              Admin CMS
            </span>
          </div>
        </Link>
      </div>

      {/* Quick Action: New Recipe */}
      <div className="p-4 border-b border-[#2E2420]/60">
        <Link
          href="/admin/recipes/new"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Recipe</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#7D7068] px-3 mb-2">
          Content Management
        </p>

        {NAV_LINKS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
                isActive
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                  : 'text-[#A89C94] hover:text-white hover:bg-[#251E1A]'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-brand-400' : 'text-[#7D7068]')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Public Website Link */}
      <div className="p-4 border-t border-[#2E2420]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#251E1A] hover:bg-[#2E2420] text-xs font-semibold text-[#A89C94] hover:text-white transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </span>
          <span className="text-[10px] text-[#7D7068]">.xyz</span>
        </Link>
      </div>
    </aside>
  );
}
