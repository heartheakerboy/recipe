'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils/cn';

export interface OptimizedImageProps extends Omit<ImageProps, 'alt'> {
  alt: string;
  pinMedia?: string;
  pinDescription?: string;
  pinUrl?: string;
  aspectRatioClass?: string;
  containerClassName?: string;
  fallbackSrc?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  containerClassName,
  aspectRatioClass,
  pinMedia,
  pinDescription,
  pinUrl,
  priority = false,
  fallbackSrc = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&h=800&q=80',
  ...props
}: OptimizedImageProps) {
  const initialSrc = src || fallbackSrc;
  const [imgSrc, setImgSrc] = useState<any>(initialSrc);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  // If fill is true, wrap in relative container
  if (fill || aspectRatioClass) {
    return (
      <div
        className={cn(
          'relative overflow-hidden bg-editorial-surfaceAlt',
          aspectRatioClass || 'aspect-recipe-card',
          containerClassName
        )}
      >
        <Image
          src={imgSrc || fallbackSrc}
          alt={alt}
          fill
          unoptimized
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={cn('object-cover transition-transform duration-500', className)}
          data-pin-media={pinMedia || (typeof imgSrc === 'string' ? imgSrc : undefined)}
          data-pin-description={pinDescription || alt}
          data-pin-url={pinUrl}
          onError={handleError}
          {...props}
        />
      </div>
    );
  }

  return (
    <Image
      src={imgSrc || fallbackSrc}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      priority={priority}
      className={cn('object-cover', className)}
      data-pin-media={pinMedia || (typeof imgSrc === 'string' ? imgSrc : undefined)}
      data-pin-description={pinDescription || alt}
      data-pin-url={pinUrl}
      onError={handleError}
      {...props}
    />
  );
}
