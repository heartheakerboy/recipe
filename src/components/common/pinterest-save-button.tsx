'use client';

import React from 'react';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PinterestSaveButtonProps {
  url: string;
  media: string;
  description: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function PinterestSaveButton({
  url,
  media,
  description,
  className,
  size = 'md',
}: PinterestSaveButtonProps) {
  const handlePin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const pinUrl = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(
      url
    )}&media=${encodeURIComponent(media)}&description=${encodeURIComponent(description)}`;

    window.open(pinUrl, 'pinterest_pin', 'width=750,height=550,toolbar=0,menubar=0,location=0');
  };

  const isSmall = size === 'sm';

  return (
    <button
      onClick={handlePin}
      aria-label="Save recipe to Pinterest"
      className={cn(
        'inline-flex items-center justify-center font-semibold text-white bg-[#E60023] hover:bg-[#ad081b] active:scale-95 transition-all shadow-md hover:shadow-lg rounded-full cursor-pointer z-10',
        isSmall ? 'px-2.5 py-1 text-xs gap-1' : 'px-3.5 py-1.5 text-xs font-bold gap-1.5',
        className
      )}
    >
      <Bookmark className={cn(isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5', 'fill-white')} />
      <span>Save</span>
    </button>
  );
}
