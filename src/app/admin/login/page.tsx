'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck, ChefHat } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1613] text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white font-serif font-black text-2xl flex items-center justify-center mx-auto shadow-lg">
            F
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            FlavorNest CMS
          </h1>
          <p className="text-xs text-[#A89C94] uppercase tracking-wider font-semibold">
            Protected Admin Control Panel
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#241C18] border border-[#3A2E27] rounded-3xl p-8 shadow-2xl space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-pass" className="block text-xs font-bold uppercase tracking-wider text-[#A89C94] mb-2">
                Admin Secret / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7D7068] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-pass"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password..."
                  className="w-full rounded-xl bg-[#161210] border border-[#3A2E27] text-white pl-11 pr-4 py-3 text-sm placeholder:text-[#5E504A] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs font-semibold animate-in fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-98 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Access Admin CMS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="border-t border-[#3A2E27] pt-4 text-center">
            <Link
              href="/"
              className="text-xs text-[#7D7068] hover:text-brand-400 transition-colors"
            >
              ← Back to FlavorNest.xyz Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
