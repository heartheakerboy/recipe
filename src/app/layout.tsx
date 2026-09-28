import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { constructMetadata } from '@/lib/seo/metadata';
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from '@/lib/seo/schema-builder';
import { JsonLd } from '@/lib/seo/json-ld';

const serifFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const sansFont = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = constructMetadata();

export const viewport: Viewport = {
  themeColor: '#C85A32',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgJsonLd = buildOrganizationJsonLd();
  const websiteJsonLd = buildWebSiteJsonLd();

  return (
    <html lang="en" className={`${serifFont.variable} ${sansFont.variable}`}>
      <head>
        <meta
          name="google-site-verification"
          content="Jk2jEwct17Ro10RUCEOrTtAL1cFNkCiJy3NwJVzNYWc"
        />
        <JsonLd data={[orgJsonLd, websiteJsonLd]} />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-H3MF7SYS6S"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-H3MF7SYS6S');
          `}
        </Script>

        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
