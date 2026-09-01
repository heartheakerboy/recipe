'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Lock,
  ExternalLink,
  Power,
  RefreshCw,
} from 'lucide-react';
import { PinterestConnectionPublic } from '@/lib/types/pinterest-connection';
import { disconnectPinterestAction } from '@/lib/actions/pinterest-publishing-actions';

interface PinterestConnectionCardProps {
  initialConnection: PinterestConnectionPublic | null;
  searchParams?: { connected?: string; error?: string };
}

export function PinterestConnectionCard({
  initialConnection,
  searchParams,
}: PinterestConnectionCardProps) {
  const router = useRouter();
  const [connection, setConnection] = useState<PinterestConnectionPublic | null>(initialConnection);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(
    searchParams?.connected === 'true'
      ? { type: 'success', text: 'Pinterest account connected successfully!' }
      : searchParams?.error
      ? { type: 'error', text: searchParams.error }
      : null
  );

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Pinterest? Active publishing will be paused.')) return;

    setIsDisconnecting(true);
    try {
      await disconnectPinterestAction();
      setConnection(null);
      setNotification({ type: 'success', text: 'Pinterest account disconnected.' });
      router.refresh();
    } finally {
      setIsDisconnecting(false);
    }
  };

  const isConnected = connection && connection.status === 'connected';
  const isExpired = connection && connection.status === 'expired';

  return (
    <div className="space-y-6 max-w-3xl font-sans">
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-editorial-border pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E60023] text-white flex items-center justify-center font-serif font-black text-xl shadow-xs">
              P
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-editorial-text">
                Pinterest API Connection
              </h2>
              <p className="text-xs text-editorial-muted">
                Official Pinterest API v5 OAuth connection for automated Pin publishing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Connected</span>
              </span>
            ) : isExpired ? (
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Reauthorization Required</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[11px] font-bold">
                Not Connected
              </span>
            )}
          </div>
        </div>

        {isConnected ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-editorial-surface border border-editorial-border space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
                  Account Name
                </span>
                <div className="font-bold text-editorial-text text-sm">
                  {connection.accountUsername}
                </div>
                <div className="text-[11px] text-editorial-muted font-mono">
                  @{connection.accountIdentifier}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-editorial-surface border border-editorial-border space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-editorial-muted">
                  Token Status
                </span>
                <div className="font-mono text-xs text-emerald-700 font-semibold">
                  Valid ({connection.maskedToken})
                </div>
                <div className="text-[10px] text-editorial-muted">
                  Scopes: {connection.scopes.join(', ')}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs text-brand-900 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-brand-600 shrink-0" />
              <span>
                Tokens are encrypted server-side and never returned to frontend JavaScript.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDisconnecting}
                onClick={handleDisconnect}
                className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isDisconnecting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Disconnecting...</span>
                  </>
                ) : (
                  <>
                    <Power className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Disconnect Pinterest</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-editorial-muted leading-relaxed">
              Connect your official Pinterest Business account to enable 1-click Pin publishing, category board mapping, and scheduled distribution.
            </p>

            <div className="pt-2">
              <a
                href="/api/admin/pinterest/auth"
                className="px-6 py-3 rounded-xl bg-[#E60023] hover:bg-[#c9021e] active:scale-95 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all"
              >
                <Flame className="w-4 h-4" />
                <span>Connect with Pinterest</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
