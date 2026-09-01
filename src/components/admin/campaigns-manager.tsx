'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Send,
  PlusCircle,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Sparkles,
  Users,
} from 'lucide-react';
import { EmailCampaign } from '@/lib/types/newsletter';
import {
  createCampaignAction,
  sendTestEmailAction,
} from '@/lib/actions/newsletter-mgmt-actions';

interface CampaignsManagerProps {
  initialCampaigns: EmailCampaign[];
}

export function CampaignsManager({ initialCampaigns }: CampaignsManagerProps) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [isCreating, setIsCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [testEmailSending, setTestEmailSending] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    previewText: '',
    introText: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setNotification(null);

    try {
      const res = await createCampaignAction({
        ...formData,
        recipeIds: ['rec_creamy_garlic_chicken_01'],
      });

      if (res.success && res.campaign) {
        setCampaigns((prev) => [res.campaign!, ...prev]);
        setShowModal(false);
        setFormData({ name: '', subject: '', previewText: '', introText: '' });
        setNotification('Campaign draft created successfully!');
        router.refresh();
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendTest = async (campaignId: string) => {
    setTestEmailSending(campaignId);
    setNotification(null);

    try {
      const res = await sendTestEmailAction(campaignId, 'editor@flavornest.xyz');
      if (res.success) {
        setNotification('Test email sent to editor@flavornest.xyz!');
      }
    } finally {
      setTestEmailSending(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-28 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>Newsletter Studio</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-editorial-surface border border-editorial-border font-semibold text-editorial-muted">
              Digest Engine
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-editorial-text mt-0.5">
            Email Campaigns & Weekly Digests
          </h1>
          <p className="text-xs text-editorial-muted">
            Curate recipe digests, schedule weekly broadcasts, and send test copies to the editorial desk.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Campaigns List */}
      <div className="bg-white rounded-3xl border border-editorial-border overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-editorial-border flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-editorial-text">
            All Broadcast Campaigns
          </h3>
          <span className="text-xs text-editorial-muted">
            {campaigns.length} campaigns
          </span>
        </div>

        <div className="divide-y divide-editorial-border">
          {campaigns.map((camp) => (
            <div key={camp.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      camp.status === 'sent'
                        ? 'bg-emerald-100 text-emerald-800'
                        : camp.status === 'scheduled'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {camp.status}
                  </span>
                  <span className="text-[11px] text-editorial-lightMuted font-mono">
                    {camp.audienceSegment}
                  </span>
                </div>

                <h4 className="font-serif font-bold text-lg text-editorial-text">
                  {camp.subject}
                </h4>

                <p className="text-xs text-editorial-muted">
                  <strong>Preview:</strong> {camp.previewText}
                </p>
              </div>

              {camp.status === 'sent' ? (
                <div className="grid grid-cols-4 gap-4 text-right shrink-0 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">Sent</span>
                    <span className="font-bold text-sm text-editorial-text">{camp.sentCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">Delivered</span>
                    <span className="font-bold text-sm text-emerald-700">{camp.deliveredCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">Opens</span>
                    <span className="font-bold text-sm text-brand-700">{camp.openedCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-editorial-lightMuted block">Clicks</span>
                    <span className="font-bold text-sm text-purple-700">{camp.clickedCount}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={testEmailSending === camp.id}
                    onClick={() => handleSendTest(camp.id)}
                    className="px-3.5 py-2 rounded-xl bg-editorial-surface hover:bg-editorial-surfaceAlt border border-editorial-border font-bold text-xs text-editorial-text transition-colors cursor-pointer"
                  >
                    {testEmailSending === camp.id ? 'Sending...' : 'Send Test'}
                  </button>

                  <button
                    type="button"
                    className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Ready to Send
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <h3 className="font-serif text-xl font-bold text-editorial-text">
              Create New Recipe Digest Campaign
            </h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold uppercase tracking-wider text-editorial-text">
                  Internal Campaign Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Weekly Digest #5 — 30-Minute Dinners"
                  className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold uppercase tracking-wider text-editorial-text">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. 3 Quick Weeknight Dinners You'll Love 🍳"
                  className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold uppercase tracking-wider text-editorial-text">
                  Preview Text
                </label>
                <input
                  type="text"
                  required
                  value={formData.previewText}
                  onChange={(e) => setFormData((f) => ({ ...f, previewText: e.target.value }))}
                  placeholder="e.g. Easy Tuscan chicken, tomato gnocchi, and butter shrimp."
                  className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold uppercase tracking-wider text-editorial-text">
                  Opening Note to Readers
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.introText}
                  onChange={(e) => setFormData((f) => ({ ...f, introText: e.target.value }))}
                  placeholder="Welcome to this week's dinner inspiration! Here are 3 reader favorites..."
                  className="w-full px-4 py-2.5 rounded-xl bg-editorial-surface border border-editorial-border text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-editorial-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-editorial-border font-bold text-xs text-editorial-muted hover:text-editorial-text cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  {isCreating ? 'Creating...' : 'Save Draft Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
