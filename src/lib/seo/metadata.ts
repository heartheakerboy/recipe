import { Metadata } from 'next';
import { siteConfig } from '../config/site.config';

interface GenerateMetadataProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}

export function constructMetadata({
  title,
  description = siteConfig.description,
  canonicalPath = '',
  image = 'https://flavornest.xyz/images/og-default.jpg',
  imageAlt = 'FlavorNest - Simple Recipes. Big Flavor.',
  noIndex = false,
  type = 'website',
  publishedTime,
  modifiedTime,
}: GenerateMetadataProps = {}): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : `${siteConfig.name} - ${siteConfig.tagline}`;
  const canonicalUrl = `${siteConfig.url}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
      locale: 'en_US',
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      other: process.env.BING_WEBMASTER_VERIFICATION
        ? { 'msvalidate.01': process.env.BING_WEBMASTER_VERIFICATION }
        : undefined,
    },
  };
}
