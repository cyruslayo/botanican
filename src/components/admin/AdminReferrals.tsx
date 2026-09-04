'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  getAccessRequests,
  updateAccessRequest,
  getReferralCodes,
  createReferralCode,
  normalizeHandle,
  getLandingInviteCode,
  setLandingInviteCode,
} from '@/lib/referrals';
import type { AccessRequest, ReferralCode } from '@/lib/types';

export default function AdminReferrals() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Landing page invite code config
  const [landingCodeInput, setLandingCodeInput] = useState('');
  const [landingCodeSaved, setLandingCodeSaved] = useState(false);

  // New referral code modal
  const [isCreateCodeOpen, setIsCreateCodeOpen] = useState(false);
  const [newOwnerHandle, setNewOwnerHandle] = useState('');
  const [customCodeInput, setCustomCodeInput] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqData, codeData] = await Promise.all([
        getAccessRequests(statusFilter),
        getReferralCodes(),
      ]);
      setRequests(reqData);
      setCodes(codeData);
      setLandingCodeInput(getLandingInviteCode());
    } catch (err) {
      console.error('Error loading referral admin data:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      await updateAccessRequest(id, status, 'admin@botanica.com');
      await loadData();
    } catch (err) {
      console.error('Error updating access request:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerHandle.trim()) return;
    try {
      const clean = normalizeHandle(newOwnerHandle.trim());
      const custom = customCodeInput.trim() || undefined;
      await createReferralCode(clean, custom);
      setNewOwnerHandle('');
      setCustomCodeInput('');
      setIsCreateCodeOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error creating referral code:', err);
    }
  };

  const handleSaveLandingCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!landingCodeInput.trim()) return;
    setLandingInviteCode(landingCodeInput.trim());
    setLandingCodeSaved(true);
    setTimeout(() => setLandingCodeSaved(false), 2500);
  };

  const handleCopyLink = (codeStr: string) => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const url = `${origin}/invite/${codeStr}`;
      navigator.clipboard.writeText(url);
      setCopySuccess(codeStr);
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Referrals & Member Access
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Review applicant Instagram handles and phone numbers, approve member access, and manage invitation links.
          </p>
        </div>
        <button
          onClick={() => setIsCreateCodeOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm uppercase tracking-widest hover:bg-primary/90 transition-colors w-fit"
        >
          <PlusIcon />
          Generate Invitation Code
        </button>
      </div>

      {/* Featured Landing Page Reader Invite Code Setting */}
      <div className="bg-surface-container-low rounded-2xl p-6 border border-secondary/30 botanical-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <h3 className="font-headline-sm text-headline-sm text-primary">
                Landing Page Reader Invitation Code
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              This code is featured at the bottom of the public landing page for visitors who read through the story. You can set it to any code you prefer.
            </p>
          </div>

          <form onSubmit={handleSaveLandingCode} className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <input
                type="text"
                value={landingCodeInput}
                onChange={(e) => setLandingCodeInput(e.target.value)}
                placeholder="e.g. botanica1"
                aria-label="Landing page invite code"
                className="p-3 bg-surface border border-outline rounded-lg font-mono font-bold text-primary text-sm min-w-[180px] focus:border-primary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-secondary text-primary font-label-sm text-xs font-bold uppercase tracking-wider rounded-lg hover:scale-105 transition-transform"
            >
              {landingCodeSaved ? 'Saved!' : 'Save Code'}
            </button>
          </form>
        </div>
      </div>

      {/* Section 1: Access Requests Table & Cards */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-3">
          <h3 className="font-headline-sm text-base sm:text-headline-sm text-primary font-bold">
            Membership Applications
          </h3>
          <div className="flex bg-surface-container rounded-xl p-1 gap-1 overflow-x-auto hide-scrollbar">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-surface text-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Applications Card List (< md screens) */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="p-8 text-center text-on-surface-variant text-sm bg-surface rounded-2xl border border-outline-variant">
              Loading membership applications...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant text-sm bg-surface rounded-2xl border border-outline-variant">
              No applications found in this filter category.
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="bg-surface rounded-2xl border border-outline-variant/70 p-4 botanical-shadow space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-primary text-base">
                    {req.instagram_handle}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      req.status === 'approved'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : req.status === 'rejected'
                        ? 'bg-error/10 text-error'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span className="font-mono text-primary font-semibold">{req.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Referred By:</span>
                    <span className="font-mono text-primary">{req.referred_by || 'Organic'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Invite Code:</span>
                    <span className="px-2 py-0.5 bg-surface-container rounded font-mono text-[11px] font-bold text-secondary">
                      {req.referral_code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-mono">{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/40">
                  {req.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'approved')}
                      disabled={actionLoading === req.id}
                      className="px-4 py-2 bg-primary text-on-primary rounded-xl font-mono text-xs uppercase tracking-wider font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Approve
                    </button>
                  )}
                  {req.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'rejected')}
                      disabled={actionLoading === req.id}
                      className="px-4 py-2 border border-outline-variant/70 text-error hover:bg-error/10 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Applications Table (>= md screens) */}
        <div className="hidden md:block bg-surface rounded-2xl border border-outline-variant overflow-hidden botanical-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr className="border-b border-outline-variant">
                  <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
                    Instagram Handle
                  </th>
                  <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
                    Referred By
                  </th>
                  <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
                    Invite Code
                  </th>
                  <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
                    Date
                  </th>
                  <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
                    Status
                  </th>
                  <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="font-body-md text-sm text-on-surface divide-y divide-outline-variant/50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                      Loading membership applications...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                      No applications found in this filter category.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-primary text-sm">
                          {req.instagram_handle}
                        </div>
                      </td>
                      <td className="p-4 text-on-surface-variant font-mono text-xs">
                        {req.phone}
                      </td>
                      <td className="p-4 text-on-surface-variant font-mono text-xs">
                        {req.referred_by || 'Organic'}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-surface-container rounded-md font-mono text-xs text-primary font-bold">
                          {req.referral_code}
                        </span>
                      </td>
                      <td className="p-4 text-on-surface-variant text-xs font-mono">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                            req.status === 'approved'
                              ? 'bg-secondary-container text-on-secondary-container font-bold'
                              : req.status === 'rejected'
                              ? 'bg-error/10 text-error font-bold'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {req.status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'approved')}
                              disabled={actionLoading === req.id}
                              className="px-3 py-1.5 bg-primary text-on-primary rounded-lg font-mono text-xs uppercase tracking-wider font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {req.status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'rejected')}
                              disabled={actionLoading === req.id}
                              className="px-3 py-1.5 border border-outline-variant/80 text-error hover:bg-error/10 rounded-lg font-mono text-xs uppercase tracking-wider font-bold transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 2: Active Referral Codes Directory */}
      <section className="space-y-4">
        <h3 className="font-headline-sm text-base sm:text-headline-sm text-primary font-bold border-b border-outline-variant/30 pb-3">
          Active Invitation Codes
        </h3>

        {/* Mobile Codes Card List (< md screens) */}
        <div className="md:hidden space-y-3">
          {codes.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant text-sm bg-surface rounded-2xl border border-outline-variant">
              No referral codes created yet.
            </div>
          ) : (
            codes.map((c) => (
              <div
                key={c.id}
                className="bg-surface rounded-2xl border border-outline-variant/70 p-4 botanical-shadow space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-base text-primary">
                    {c.code}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      c.is_active
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-surface-variant text-on-surface-variant'
                    }`}
                  >
                    {c.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Member:</span>
                    <span className="font-mono text-primary font-bold">{c.owner_handle || c.owner_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span className="font-mono">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-outline-variant/40 flex justify-end">
                  <button
                    onClick={() => handleCopyLink(c.code)}
                    className="w-full sm:w-auto px-4 py-2 bg-primary text-on-primary rounded-xl font-mono text-xs uppercase tracking-wider font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copySuccess === c.code ? '✓ Link Copied!' : 'Copy Invite Link'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Codes Table (>= md screens) */}
        <div className="hidden md:block bg-surface rounded-2xl border border-outline-variant overflow-hidden botanical-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr className="border-b border-outline-variant">
                  <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
                    Code
                  </th>
                  <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
                    Member / Instagram Handle
                  </th>
                  <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
                    Status
                  </th>
                  <th className="p-4 font-label-sm text-xs text-on-surface-variant uppercase tracking-wider text-right">
                    Share Link
                  </th>
                </tr>
              </thead>
              <tbody className="font-body-md text-sm text-on-surface divide-y divide-outline-variant/50">
                {codes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                      No referral codes created yet.
                    </td>
                  </tr>
                ) : (
                  codes.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-primary">{c.code}</td>
                      <td className="p-4 text-on-surface-variant font-mono font-bold">
                        {c.owner_handle || c.owner_email}
                      </td>
                      <td className="p-4 text-on-surface-variant text-xs font-mono">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            c.is_active
                              ? 'bg-secondary-container text-on-secondary-container'
                              : 'bg-surface-variant text-on-surface-variant'
                          }`}
                        >
                          {c.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleCopyLink(c.code)}
                          className="px-3 py-1.5 border border-outline-variant/80 rounded-xl font-mono text-xs uppercase tracking-wider font-bold hover:bg-surface-container transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          {copySuccess === c.code ? 'Copied!' : 'Copy Invite Link'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal: Generate Invitation Code */}
      {isCreateCodeOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="bg-surface p-5 sm:p-6 rounded-t-3xl sm:rounded-2xl border border-outline-variant botanical-shadow max-w-md w-full">
            <h3 className="font-headline-sm text-base sm:text-headline-sm text-primary font-bold mb-1">
              Generate Member Invite Code
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Create an invitation code tied to a member's Instagram handle so they can invite new applicants.
            </p>
            <form onSubmit={handleCreateCode} className="space-y-4">
              <div>
                <label htmlFor="ownerHandle" className="font-label-sm text-on-surface-variant block mb-1">
                  Member Instagram Handle *
                </label>
                <input
                  id="ownerHandle"
                  type="text"
                  required
                  value={newOwnerHandle}
                  onChange={(e) => setNewOwnerHandle(e.target.value)}
                  placeholder="@member_handle"
                  className="w-full p-3 bg-surface-container-low border border-outline rounded-lg font-body-md text-primary font-mono"
                />
              </div>

              <div>
                <label htmlFor="customCode" className="font-label-sm text-on-surface-variant block mb-1">
                  Custom Code String (Optional)
                </label>
                <input
                  id="customCode"
                  type="text"
                  value={customCodeInput}
                  onChange={(e) => setCustomCodeInput(e.target.value)}
                  placeholder="e.g. VIP2026 (Leave blank to auto-generate)"
                  className="w-full p-3 bg-surface-container-low border border-outline rounded-lg font-body-md text-primary font-mono placeholder:font-sans placeholder:text-on-surface-variant/40"
                />
                <span className="text-[11px] text-on-surface-variant mt-1 block">
                  You can define a custom code name or let the system generate a clean 8-character random code.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsCreateCodeOpen(false)}
                  className="px-4 py-2 rounded-lg font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg font-label-sm text-label-sm bg-primary text-on-primary hover:bg-primary/90 transition-colors uppercase tracking-wider"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
