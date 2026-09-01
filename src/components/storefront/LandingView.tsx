'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { isApproved, accessState } from '@/store/access';
import { getLandingInviteCode } from '@/lib/referrals';

const HERO_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6KYoMlMURvm17nCxK41HXzRuKdBcC2Det8Yax_tc9aRW1bptic26i0aK8O7LE6jCZd13SHZ_BvCDU2kfS8waEloqtdu_1I1JEPY5AtaezQ6XTubWtsVUw0FTDJbPArCFcFyE5HuRXQe6sLcm9LHlhwMo6fLE_U1D10f_L_ZaPw6K5T69KAcFGL_Y_cxu0gPcJuhwR_cmZkeFNAIdse_MnJ_g5MdFRv6dbOjxvwyxiL3E3E9b1n3zthQ';
const EDIBLES_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoSHUT8V8JvKKelG1Oc-mBK735DZvZGftkufgqbRYa9UpVmIu-DeKkjpp_B5C_VtWTTySsW3JxbPKsk0TR7l-kLLYVpOsUIsFkn-s317dsJ-j3zoqHsz3Imi0n_ArtGx_6T_J7bB6wKw-TqEAHtxnKbutmCXJHf02jvaRPX-CSlJkCW_c6plXN7OEj5zEOy7cuEXL8fUoElj-6UmS9sV762gaxVnq1Ar4RNov77DwrwD9XY-tqsj3-Yg';
const OILS_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1Yy6GMbIqi-iQxCvqjcLUfqwsZwkrt1RwcRWsq9LWTMGM2sWHofVCipqrnFTdmiNqF0BxZgRzurPlmSZ0H1_qHIX2EgXTqNjfQcjcuK2s4Xx3yAuJ-_QBo1i06XVliNJMJBxYP_gbqKVPVCFSA6bkTv1oLOQxIQM0Zh-klcrUdkcId8u87rBkqu2lUURTMk0qQO_X5KlbGWgQSN8rdjfBuXHAz2pzalmlqS1j13ztnc0aRaHdnK8OxA';

export default function LandingView() {
  const approved = useStore(isApproved);
  const access = useStore(accessState);
  const [inviteCode, setInviteCode] = useState('botanica1');
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    try {
      const code = getLandingInviteCode();
      if (code) setInviteCode(code);
    } catch {}
  }, []);

  const handleCopyCode = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Option C: When the visitor is an approved member, render the Member Home Portal
  if (hydrated && approved) {
    const handle = access.instagramHandle || '@member';
    const myShareCode = access.referralCode || 'botanica1';

    return (
      <main className="w-full pt-20 md:pt-28 pb-20">
        <section className="w-full px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto">
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
                  className="px-7 py-3.5 bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-md"
                >
                  Shop Botanical Oils &rarr;
                </a>
                <a
                  href="/edibles"
                  className="px-7 py-3.5 bg-surface border border-outline text-primary font-label-sm text-label-sm uppercase tracking-widest rounded-full hover:bg-surface-container transition-colors shadow-sm"
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
                <span className="font-body-sm text-on-primary/90 mt-1 flex items-center gap-2">
                  Full-spectrum organic tinctures & elixirs &rarr;
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
                <span className="font-body-sm text-on-primary/90 mt-1 flex items-center gap-2">
                  Pastilles, herbal chews & calming cacao bites &rarr;
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
              <p className="font-body-sm text-on-surface-variant">
                Invite friends and fellow wellness seekers to join the Botanica Circle.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="px-4 py-2 bg-surface border border-outline rounded-lg font-mono font-bold text-primary text-base">
                {myShareCode}
              </span>
              <a
                href="/invite"
                className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-label-sm text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Manage Invites
              </a>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Public Landing Page: Editorial, Educational, and Scroll-to-Invite
  return (
    <main className="w-full pt-16 md:pt-20">
      {/* 1. Atmospheric Hero Section */}
      <section className="relative w-full min-h-[85dvh] md:min-h-[90dvh] flex items-center justify-center overflow-hidden bg-primary">
        <img
          src={HERO_IMAGE}
          alt="Botanica Natural Essence"
          referrerPolicy="no-referrer"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-1000 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
        <div className="relative z-10 text-center px-margin-mobile md:px-margin-desktop py-stack-lg max-w-2xl mx-auto text-on-primary">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface/20 backdrop-blur-md rounded-full mb-stack-md border border-white/20">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-label-sm text-xs uppercase tracking-widest text-on-primary font-bold">
              Private Botanical Apothecary
            </span>
          </div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-primary mb-stack-sm tracking-tight">
            Pure Natural Harmony
          </h1>
          <p className="font-body-lg text-body-lg text-on-primary/90 mb-stack-lg leading-relaxed max-w-xl mx-auto">
            Meticulously extracted botanical elixirs and artisanal organic edibles crafted for profound restorative balance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#story"
              className="w-full sm:w-auto px-8 py-3.5 bg-surface text-primary font-label-sm text-label-sm uppercase tracking-widest rounded-full hover:bg-surface/90 hover:scale-105 transition-all shadow-lg font-bold"
            >
              Discover Our Story &darr;
            </a>
            <a
              href="/invite"
              className="w-full sm:w-auto px-8 py-3.5 border border-white/40 text-on-primary font-label-sm text-label-sm uppercase tracking-widest rounded-full hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Have a Code? Apply
            </a>
          </div>
        </div>
      </section>

      {/* 2. Brand Story / Philosophy */}
      <section id="story" className="w-full px-margin-mobile md:px-margin-desktop py-20 md:py-32 max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
          <div className="md:col-span-6 space-y-6">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold block">
              Our Philosophy
            </span>
            <h2 className="font-display-sm md:font-display-md text-display-sm md:text-display-md text-primary leading-tight">
              Rooted in Nature, Refined by Science
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Botanica was conceived as a sanctum of holistic wellness. We source only the purest organic botanicals, extracting full-spectrum phytocompounds using clean CO2 techniques that leave zero residual solvents.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              To maintain the integrity of our micro-batches and ensure personalized care for every customer in Abuja, our store operates exclusively through a verified member network.
            </p>
          </div>
          <div className="md:col-span-6">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden botanical-shadow bg-surface-container-low relative">
              <img
                src={OILS_IMAGE}
                alt="Botanical Extraction"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Drops & Formulations Showcase (Editorial, no direct buy) */}
      <section className="w-full bg-surface-container-low py-20 md:py-28 border-y border-outline-variant/30">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop space-y-16">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
              Small-Batch Drops
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary">
              Crafted Formulations
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Every drop is numbered and micro-batched to preserve potency, terpene synergy, and aromatic vitality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Oils Showcase Card */}
            <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-outline-variant botanical-shadow flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-surface-container relative">
                  <img
                    src={OILS_IMAGE}
                    alt="Botanical Oils Collection"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-primary/80 backdrop-blur-md text-on-primary px-3 py-1 rounded-full font-label-sm text-[11px] uppercase tracking-wider">
                    Full Spectrum Tinctures
                  </div>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary">
                  Botanical Oils & Restorative Elixirs
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Infused with French lavender, blue eucalyptus, and wild-harvested rosemary. Formulated with organic cold-pressed MCT carrier oils to deliver optimal bioavailability and calming clarity.
                </p>
              </div>
              <div className="pt-4 border-t border-outline-variant/40 flex items-center justify-between text-xs text-on-surface-variant font-mono">
                <span>CO2 Extracted</span>
                <span>•</span>
                <span>Zero Pesticides</span>
                <span>•</span>
                <span>Lab Certified</span>
              </div>
            </div>

            {/* Edibles Showcase Card */}
            <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-outline-variant botanical-shadow flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-surface-container relative">
                  <img
                    src={EDIBLES_IMAGE}
                    alt="Botanical Edibles Collection"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-primary/80 backdrop-blur-md text-on-primary px-3 py-1 rounded-full font-label-sm text-[11px] uppercase tracking-wider">
                    Artisanal Edibles
                  </div>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary">
                  Organic Pastilles & Calming Bites
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Crafted with single-origin 72% Ecuadorian dark cacao, wild blackberry fruit puree, and adaptogenic lion’s mane mushrooms. A mindful, sensory ritual for body and mind.
                </p>
              </div>
              <div className="pt-4 border-t border-outline-variant/40 flex items-center justify-between text-xs text-on-surface-variant font-mono">
                <span>Vegan Recipe</span>
                <span>•</span>
                <span>Micro-Dosed</span>
                <span>•</span>
                <span>Naturally Flavored</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Standards / Pillars */}
      <section className="w-full px-margin-mobile md:px-margin-desktop py-20 max-w-container-max mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="space-y-3 p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto text-lg font-bold">
              01
            </div>
            <h4 className="font-headline-sm text-headline-sm text-primary">Pure Sourcing</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Every crop is certified pesticide-free and grown in regenerative coastal soil.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto text-lg font-bold">
              02
            </div>
            <h4 className="font-headline-sm text-headline-sm text-primary">Invite Only</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Controlled production ensures every batch arrives fresh directly to members.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto text-lg font-bold">
              03
            </div>
            <h4 className="font-headline-sm text-headline-sm text-primary">Discreet Delivery</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Dedicated private dispatch across Maitama, Asokoro, Wuse, and Guzape.
            </p>
          </div>
        </div>
      </section>

      {/* 5. The Invitation (Bottom CTA with Admin-Configured Invite Code) */}
      <section id="invite" className="w-full px-margin-mobile md:px-margin-desktop py-20 pb-28 max-w-container-max mx-auto">
        <div className="relative w-full bg-primary text-on-primary rounded-3xl p-8 sm:p-12 md:p-16 text-center overflow-hidden botanical-shadow">
          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-secondary/20 rounded-full border border-secondary/40">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-bold">
                Exclusive Reader Invitation
              </span>
            </div>

            <h2 className="font-display-sm md:font-display-md text-display-sm md:text-display-md text-on-primary leading-tight">
              Join the Botanica Circle
            </h2>

            <p className="font-body-lg text-body-lg text-on-primary/80 leading-relaxed">
              Thank you for exploring our story. Use the official reader invitation code below to request member verification and unlock store access.
            </p>

            {/* Admin-Configured Invitation Code Box */}
            <div className="bg-surface/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md mx-auto space-y-4">
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
                  className="px-4 py-2.5 bg-secondary text-primary font-label-sm text-xs font-bold uppercase tracking-wider rounded-xl hover:scale-105 transition-transform"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-on-primary/70">
                Tap below to submit your Instagram handle and phone number for verification.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
              <a
                href={`/invite/${inviteCode}`}
                className="px-8 py-4 bg-secondary text-primary font-label-sm text-label-sm uppercase tracking-widest font-bold rounded-full hover:scale-105 transition-transform shadow-lg"
              >
                Apply for Member Access &rarr;
              </a>
              <a
                href="/invite"
                className="px-8 py-4 border border-white/30 text-on-primary font-label-sm text-label-sm uppercase tracking-widest rounded-full hover:bg-white/10 transition-colors"
              >
                Check Existing Application
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
