'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, Sparkles } from 'lucide-react';
import { Container } from '../layout/container';

export function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
    }
  };

  return (
    <section className="py-12 sm:py-16">
      <Container size="xl">
        <div className="rounded-3xl bg-gradient-to-br from-[#291F1A] via-[#211A16] to-[#161210] text-white p-8 sm:p-12 lg:p-14 overflow-hidden relative shadow-float border border-brand-900/40">
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Weekly Recipe Drop</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Get Delicious Recipes in Your Inbox
            </h2>

            <p className="text-sm sm:text-base text-[#D4C8C0] leading-relaxed max-w-lg mx-auto">
              Easy ideas, seasonal favorites, and new recipes delivered occasionally. No spam, ever.
            </p>

            {isSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-sm font-semibold flex items-center justify-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Thank you! You&rsquo;re signed up for the FlavorNest weekly recipe letter.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="pt-2 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-[#A89C94] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    aria-label="Email address"
                    className="w-full rounded-xl bg-white/10 border border-white/20 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-[#A89C94] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-sm shadow-md transition-all whitespace-nowrap cursor-pointer"
                >
                  Sign Me Up
                </button>
              </form>
            )}

            <p className="text-[11px] text-[#8A7D75]">
              By signing up, you agree to receive editorial recipes from FlavorNest.xyz. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
