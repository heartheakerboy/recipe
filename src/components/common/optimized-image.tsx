import React from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils/cn';

export interface OptimizedImageProps extends Omit<ImageProps, 'alt'> {
  alt: string;
  pinMedia?: string;
  pinDescription?: string;
  pinUrl?: string;
  aspectRatioClass?: string;
  containerClassName?: string;
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
  ...props
}: OptimizedImageProps) {
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
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={cn('object-cover transition-transform duration-500', className)}
          data-pin-media={pinMedia || (typeof src === 'string' ? src : undefined)}
          data-pin-description={pinDescription || alt}
          data-pin-url={pinUrl}
          {...props}
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn('object-cover', className)}
      data-pin-media={pinMedia || (typeof src === 'string' ? src : undefined)}
      data-pin-description={pinDescription || alt}
      data-pin-url={pinUrl}
      {...props}
    />
  );
}
