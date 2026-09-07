'use client';
import { useEffect, useState } from 'react';
import { getLandingInviteCode } from '@/lib/referrals';

export default function InviteCodeCard() {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getLandingInviteCode()
      .then(setInviteCode)
      .catch((error) => console.error('Error loading landing invitation:', error))
      .finally(() => setLoading(false));
  }, []);

  const handleCopyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !inviteCode) {
    return (
      <div className="bg-surface/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md mx-auto space-y-3 w-full text-center">
        <span className="font-label-sm text-xs uppercase tracking-widest text-secondary block font-bold">
          Official Reader Invite
        </span>
        <p className="text-sm text-on-primary/80">
          {loading ? 'Checking invitation availability…' : 'Reader invitations are currently unavailable. Please use a member-supplied link.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md mx-auto space-y-4 w-full">
      <span className="font-label-sm text-xs uppercase tracking-widest text-secondary block font-bold">
        Official Reader Invite Code
      </span>
      <div className="flex items-center justify-center gap-3">
        <span className="font-mono text-2xl sm:text-3xl font-bold tracking-widest text-on-primary bg-black/30 px-6 py-2 rounded-xl border border-white/10 select-all">
          {inviteCode}
        </span>
        <button
          type="button"
          onClick={handleCopyCode}
          className="px-4 py-2.5 bg-secondary text-primary font-label-sm text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <a
        href={`/invite/${inviteCode}`}
        className="block w-full px-8 py-4 bg-secondary text-primary font-label-sm text-label-sm uppercase tracking-widest font-bold rounded-full text-center hover:opacity-90 active:scale-[0.98] transition-all"
      >
        Apply for Member Access
      </a>
      <p className="text-xs text-on-primary/70 text-center">
        Submit your Instagram handle and phone number for verification.
      </p>
    </div>
  );
}
