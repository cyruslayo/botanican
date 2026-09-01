'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isApproved, isPending, accessState } from '@/store/access';

interface MemberGateProps {
  children: React.ReactNode;
}

export default function MemberGate({ children }: MemberGateProps) {
  const approved = useStore(isApproved);
  const pending = useStore(isPending);
  const access = useStore(accessState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-[70dvh] flex items-center justify-center pt-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
            Verifying Member Access...
          </span>
        </div>
      </div>
    );
  }

  // 1. Approved Member: Allow access to store
  if (approved) {
    return <>{children}</>;
  }

  // 2. Pending Member: Dedicated Application Under Review Screen
  if (pending) {
    const handle = access.instagramHandle || 'your account';
    return (
      <main className="min-h-[75dvh] flex items-center justify-center px-margin-mobile md:px-margin-desktop py-stack-lg md:py-section-gap pt-24 md:pt-32">
        <div className="max-w-xl w-full bg-surface-container-low rounded-2xl p-6 sm:p-10 border border-secondary/30 botanical-shadow text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-secondary animate-pulse"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container/40 rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
            <span className="font-label-sm text-xs font-bold uppercase tracking-widest text-secondary">
              Application In Review
            </span>
          </div>

          <h1 className="font-display-sm md:font-display-md text-display-sm md:text-display-md text-primary mb-3">
            Membership Pending Review
          </h1>

          <p className="font-body-md md:font-body-lg text-body-md md:text-body-lg text-on-surface-variant mb-6 max-w-md mx-auto leading-relaxed">
            Your membership application for <strong className="text-primary font-mono">{handle}</strong> is currently being reviewed by our private apothecary team.
          </p>

          <div className="bg-surface rounded-xl p-5 border border-outline-variant/60 text-left mb-8 max-w-md mx-auto font-body-sm text-body-sm text-on-surface-variant space-y-2.5">
            <div className="flex items-start gap-2.5">
              <span className="text-secondary font-bold">•</span>
              <span>Our apothecary catalog and purchasing are strictly reserved for verified members.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-secondary font-bold">•</span>
              <span>You will receive an automatic live alert and store unlocking as soon as your access is approved.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3.5">
            <a
              href="/invite"
              className="px-6 py-3.5 bg-primary text-on-primary rounded-full font-label-sm text-label-sm uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-sm"
            >
              Check Review Status &rarr;
            </a>
            <a
              href="/"
              className="px-6 py-3.5 border border-outline text-primary rounded-full font-label-sm text-label-sm uppercase tracking-widest hover:bg-surface-container transition-colors flex items-center justify-center"
            >
              Back to Botanica Story
            </a>
          </div>
        </div>
      </main>
    );
  }

  // 3. Guest / Rejected / Unverified: Gate screen
  return (
    <main className="min-h-[75dvh] flex items-center justify-center px-margin-mobile md:px-margin-desktop py-stack-lg md:py-section-gap pt-24 md:pt-32">
      <div className="max-w-xl w-full bg-surface-container-low rounded-2xl p-6 sm:p-10 border border-outline-variant botanical-shadow text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full mb-4">
          <span className="font-label-sm text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Private Apothecary
          </span>
        </div>

        <h1 className="font-display-sm md:font-display-md text-display-sm md:text-display-md text-primary mb-3">
          Members-Only Store
        </h1>

        <p className="font-body-md md:font-body-lg text-body-md md:text-body-lg text-on-surface-variant mb-8 max-w-md mx-auto leading-relaxed">
          Botanica operates as an exclusive, invite-only apothecary. Store inventory and checkout are accessible only to approved members.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3.5">
          <a
            href="/"
            className="px-6 py-3.5 bg-primary text-on-primary rounded-full font-label-sm text-label-sm uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-sm"
          >
            Discover Botanica & Get Invite
          </a>
          <a
            href="/invite"
            className="px-6 py-3.5 border border-outline text-primary rounded-full font-label-sm text-label-sm uppercase tracking-widest hover:bg-surface-container transition-colors flex items-center justify-center"
          >
            Enter Invitation Code
          </a>
        </div>
      </div>
    </main>
  );
}
