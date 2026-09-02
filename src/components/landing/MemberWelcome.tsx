'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isApproved, accessState } from '@/store/access';
import { EDIBLES_IMAGE, OILS_IMAGE } from '@/data/landing';

/**
 * Member home portal. Renders nothing for guests; once the access store
 * hydrates as approved, it takes over the page and hides the public landing.
 */
export default function MemberWelcome() {
  const approved = useStore(isApproved);
  const access = useStore(accessState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const publicLanding = document.getElementById('public-landing');
    if (publicLanding) {
      publicLanding.toggleAttribute('hidden', hydrated && approved);
    }
  }, [hydrated, approved]);

  if (!hydrated || !approved) return null;

  const handle = access.instagramHandle || '@member';
  const myShareCode = access.referralCode || 'botanica1';

  return (
    <main className="w-full pt-20 md:pt-28 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      {/* Member Welcome Hero */}
      <div className="relative w-full rounded-2xl overflow-hidden botanical-shadow bg-surface-container-low p-6 sm:p-10 md:p-14 mb-stack-lg border border-secondary/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container/40 rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-label-sm text-xs font-bold uppercase tracking-widest text-secondary">
              Verified Apothecary Access
            </span>
          </div>
          <h1 className="font-display-md md:font-display-lg text-display-md md:text-display-lg text-primary mb-3">
            Welcome back, {handle}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 leading-relaxed">
            Your private member access is unlocked. Explore our pure botanical extractions, active tinctures, and small-batch edibles.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/oils"
              className="px-7 py-3.5 bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-widest rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Shop Botanical Oils &rarr;
            </a>
            <a
              href="/edibles"
              className="px-7 py-3.5 bg-surface border border-outline text-primary font-label-sm text-label-sm uppercase tracking-widest rounded-full hover:bg-surface-container active:scale-[0.98] transition-colors"
            >
              Shop Edibles &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* Member Quick Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-stack-lg">
        <a
          href="/oils"
          className="group relative block aspect-[16/10] rounded-xl overflow-hidden bg-surface-container-high transition-transform duration-300 hover:scale-[1.01] botanical-shadow"
        >
          <div className="absolute inset-0 p-stack-lg flex flex-col justify-end z-10 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent">
            <span className="font-display-lg-mobile text-display-lg-mobile text-on-primary">
              Botanical Oils
            </span>
            <span className="font-body-sm text-body-sm text-on-primary/90 mt-1">
              Full-spectrum organic tinctures &amp; elixirs &rarr;
            </span>
          </div>
          <img
            src={OILS_IMAGE}
            alt="Botanical Oils"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </a>

        <a
          href="/edibles"
          className="group relative block aspect-[16/10] rounded-xl overflow-hidden bg-secondary-container transition-transform duration-300 hover:scale-[1.01] botanical-shadow"
        >
          <div className="absolute inset-0 p-stack-lg flex flex-col justify-end z-10 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent">
            <span className="font-display-lg-mobile text-display-lg-mobile text-on-primary">
              Artisanal Edibles
            </span>
            <span className="font-body-sm text-body-sm text-on-primary/90 mt-1">
              Pastilles, herbal chews &amp; calming cacao bites &rarr;
            </span>
          </div>
          <img
            src={EDIBLES_IMAGE}
            alt="Botanical Edibles"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </a>
      </div>

      {/* Member Invite Code Utility Card */}
      <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold block mb-1">
            Your Member Invitation Code
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Invite friends and fellow wellness seekers to join the Botanica Circle.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="px-4 py-2 bg-surface border border-outline rounded-lg font-mono font-bold text-primary text-base">
            {myShareCode}
          </span>
          <a
            href="/invite"
            className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-label-sm text-xs uppercase tracking-widest hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Manage Invites
          </a>
        </div>
      </div>
    </main>
  );
}
