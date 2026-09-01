import React from 'react';
import { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'Privacy Policy — FlavorNest',
  description: 'Privacy policy for FlavorNest.xyz explaining how data and cookies are handled.',
  canonicalPath: '/privacy',
});

export default function PrivacyPolicyPage() {
  return (
    <div className="pb-24">
      <div className="bg-editorial-surfaceAlt/60 border-b border-editorial-border py-10">
        <Container size="md">
          <Breadcrumbs items={[{ name: 'Privacy Policy', url: '/privacy' }]} />
          <div className="mt-4 space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-editorial-text">
              Privacy Policy
            </h1>
            <p className="text-xs text-editorial-muted">Last updated: August 2026</p>
          </div>
        </Container>
      </div>

      <Container size="md" className="mt-10">
        <div className="bg-white rounded-2xl border border-editorial-border p-6 sm:p-10 prose prose-stone max-w-none text-editorial-muted space-y-6">
          <p>
            At FlavorNest (accessible from https://flavornest.xyz), one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by FlavorNest and how we use it.
          </p>

          <h2 className="font-serif text-xl font-bold text-editorial-text">1. Log Files & Analytics</h2>
          <p>
            FlavorNest follows standard procedures of using log files and privacy-friendly web analytics. These files log visitors when they visit websites. The information collected includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and number of clicks.
          </p>

          <h2 className="font-serif text-xl font-bold text-editorial-text">2. Cookies and Web Beacons</h2>
          <p>
            Like any other website, FlavorNest uses &ldquo;cookies&rdquo;. These cookies are used to store information including visitors&rsquo; preferences and the pages on the website that the visitor accessed or visited to optimize user experience.
          </p>

          <h2 className="font-serif text-xl font-bold text-editorial-text">3. Third Party Advertising & Partners</h2>
          <p>
            Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on FlavorNest. You may choose to disable cookies through your individual browser options.
          </p>

          <h2 className="font-serif text-xl font-bold text-editorial-text">4. Consent</h2>
          <p>
            By using our website, you hereby consent to our Privacy Policy and agree to its terms.
          </p>
        </div>
      </Container>
    </div>
  );
}
