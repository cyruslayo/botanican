'use client';
import { useState } from 'react';
import { Instagram, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';

interface LinkOption {
  title: string;
  category: 'Landing Section' | 'Journal Monograph' | 'Apothecary Shop';
  path: string;
  anchor?: string;
  stickerText: string;
  description: string;
}

const PRESET_LINKS: LinkOption[] = [
  // Landing sections
  {
    title: 'Onset Timeline (15-30m vs 60-90m)',
    category: 'Landing Section',
    path: '/',
    anchor: 'onset',
    stickerText: 'ONSET TIMELINE ⏱️',
    description: 'Direct comparison of sublingual absorption speed vs swallowed edibles.'
  },
  {
    title: 'The Mechanism (Sublingual Absorption)',
    category: 'Landing Section',
    path: '/',
    anchor: 'mechanism',
    stickerText: 'HOW IT WORKS 💧',
    description: 'Under the tongue vs swallowed liver metabolism science.'
  },
  {
    title: 'Interactive Dropper Math',
    category: 'Landing Section',
    path: '/',
    anchor: 'dose',
    stickerText: 'CALCULATE DOSE 🧮',
    description: 'Apothecary pipette graduated milligram calculator.'
  },
  {
    title: 'The Golden Hour (Wait Before Redosing)',
    category: 'Landing Section',
    path: '/',
    anchor: 'golden-hour',
    stickerText: 'WAIT 90 MIN ⏳',
    description: 'The impatient redose warning & titration golden rules.'
  },
  {
    title: 'Biological Variables Bento',
    category: 'Landing Section',
    path: '/',
    anchor: 'variables',
    stickerText: 'WHY IT VARIES 🧬',
    description: 'Enzyme metabolism, meal timing, and absorption differences.'
  },
  {
    title: 'The Evening Ritual (Step-by-Step)',
    category: 'Landing Section',
    path: '/',
    anchor: 'ritual',
    stickerText: 'EVENING RITUAL 🌙',
    description: '7:30pm to 9:30pm habit stacking and sensory wind-down protocol.'
  },
  {
    title: 'Botanica Library / Field Notes',
    category: 'Landing Section',
    path: '/',
    anchor: 'dispatches',
    stickerText: 'READ LIBRARY 📚',
    description: 'Grid of published monographs and extraction logs.'
  },
  {
    title: 'Member Verification / Apply',
    category: 'Landing Section',
    path: '/',
    anchor: 'invite',
    stickerText: 'APPLY FOR ACCESS 🗝️',
    description: 'Member access application form with invite code.'
  },

  // Journal Monograph Links
  {
    title: 'Circadian Tincture Monograph (Thesis)',
    category: 'Journal Monograph',
    path: '/journal/circadian-tincture-chronobiology',
    anchor: 'thesis',
    stickerText: 'CIRCADIAN THESIS 🔬',
    description: 'Central thesis: Chronobiology outranks raw milligram potency.'
  },
  {
    title: 'Circadian Tincture (Takeaways)',
    category: 'Journal Monograph',
    path: '/journal/circadian-tincture-chronobiology',
    anchor: 'takeaways',
    stickerText: 'KEY TAKEAWAYS 🌿',
    description: 'Key takeaways on CB1 receptor tone and sleep architecture.'
  },
  {
    title: 'Supercritical CO2 Extraction (Thesis)',
    category: 'Journal Monograph',
    path: '/journal/supercritical-co2-terpene-integrity',
    anchor: 'thesis',
    stickerText: 'LAB EXTRACTION 🧪',
    description: 'Supercritical fluid chromatography and terpene preservation.'
  },
  {
    title: 'Sublingual Titration Protocol (Takeaways)',
    category: 'Journal Monograph',
    path: '/journal/sublingual-bioavailability-mechanics',
    anchor: 'takeaways',
    stickerText: 'TITRATION PROTOCOL 📝',
    description: 'Step-by-step sublingual absorption mechanics and rules.'
  },

  // Shop & Apothecary
  {
    title: 'Private Apothecary Drops',
    category: 'Apothecary Shop',
    path: '/oils',
    stickerText: 'APOTHECARY DROP 🏷️',
    description: 'Small-batch botanical tinctures available to verified members.'
  },
  {
    title: 'Invite Application Portal',
    category: 'Apothecary Shop',
    path: '/invite',
    stickerText: 'CLAIM MEMBERSHIP ✨',
    description: 'Direct code redemption and onboarding.'
  }
];

export default function InstagramLinkBuilder() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [campaign, setCampaign] = useState('story_drop');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedStickerText, setCopiedStickerText] = useState(false);

  const selected = PRESET_LINKS[selectedIdx];

  const buildUrl = (opt: LinkOption) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://botanica.essence';
    const params = new URLSearchParams();
    params.set('utm_source', 'instagram');
    params.set('utm_medium', 'story');
    if (campaign.trim()) {
      params.set('utm_campaign', campaign.trim().toLowerCase().replace(/\s+/g, '_'));
    }

    const hash = opt.anchor ? `#${opt.anchor}` : '';
    return `${origin}${opt.path}?${params.toString()}${hash}`;
  };

  const finalUrl = buildUrl(selected);

  const copyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(finalUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {}
  };

  const copyStickerText = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(selected.stickerText);
        setCopiedStickerText(true);
        setTimeout(() => setCopiedStickerText(false), 2000);
      }
    } catch {}
  };

  return (
    <div className="bg-surface rounded-2xl border border-outline-variant botanical-shadow p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-secondary-container/60 rounded-xl text-secondary shrink-0">
            <Instagram size={22} />
          </div>
          <div>
            <h3 className="font-headline-sm text-base sm:text-headline-sm text-primary font-bold">
              Instagram Story Link Generator
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Generate native sticker links to specific sections and journal points with zero header clipping.
            </p>
          </div>
        </div>

        <span className="font-mono text-[11px] px-3 py-1 bg-surface-container-high rounded-full text-secondary font-bold self-start sm:self-auto shrink-0">
          Deep-Linking Ready
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Column: Preset Selector */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-4">
          <label className="block font-mono text-xs uppercase tracking-wider text-on-surface-variant font-bold">
            Select Destination
          </label>
          <div className="space-y-2 max-h-60 sm:max-h-72 overflow-y-auto pr-1 overscroll-contain">
            {PRESET_LINKS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                  selectedIdx === idx
                    ? 'border-secondary bg-secondary-container/30 text-primary font-bold shadow-xs'
                    : 'border-outline-variant/40 bg-surface-container-low hover:bg-surface-container text-on-surface'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{item.title}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface border text-secondary shrink-0">
                    {item.category.split(' ')[0]}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-on-surface-variant/70 mt-1 truncate">
                  {item.path}{item.anchor ? `#${item.anchor}` : ''}
                </div>
              </button>
            ))}
          </div>

          <div className="pt-1 sm:pt-2">
            <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">
              Campaign Tag (optional)
            </label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="e.g. story_drop, evening_ritual"
              className="w-full text-xs font-mono px-3 py-2 rounded-lg bg-surface border border-outline-variant/60 focus:outline-none focus:border-secondary"
            />
          </div>
        </div>

        {/* Right Column: Output & Actionable Instagram Link Card */}
        <div className="lg:col-span-7 flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-surface-container-low border border-outline-variant/60 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-secondary font-bold">
                Story Link Output
              </span>
              <span className="text-[11px] font-mono text-on-surface-variant truncate">
                Target: <span className="font-bold text-primary">{selected.anchor ? `#${selected.anchor}` : 'Top of page'}</span>
              </span>
            </div>

            <p className="font-body-md text-sm text-primary font-medium">
              {selected.description}
            </p>

            {/* URL Output box */}
            <div className="p-3 bg-surface rounded-lg border border-outline-variant/60 font-mono text-xs text-primary break-all select-all">
              {finalUrl}
            </div>

            {/* Recommended Sticker Text */}
            <div className="p-3 rounded-lg bg-secondary-container/20 border border-secondary/30 flex items-center justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] uppercase text-secondary font-bold block">
                  Suggested Sticker Text
                </span>
                <span className="font-label-sm text-xs font-bold text-primary">
                  {selected.stickerText}
                </span>
              </div>
              <button
                type="button"
                onClick={copyStickerText}
                className="px-2.5 py-1 text-[11px] font-mono rounded bg-surface border border-secondary/40 text-secondary hover:bg-secondary-container/40 transition-colors cursor-pointer"
              >
                {copiedStickerText ? 'Copied!' : 'Copy Text'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={copyLink}
              className="flex-1 py-3 px-4 bg-primary text-on-primary rounded-xl font-label-sm text-xs uppercase tracking-widest font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedLink ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Sticker Link'}</span>
            </button>

            <a
              href={finalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-surface border border-outline-variant/60 rounded-xl text-primary hover:text-secondary hover:border-secondary transition-colors"
              title="Preview landing point in new tab"
            >
              <ExternalLink size={16} />
            </a>
          </div>

          {copiedLink && (
            <p className="text-[11px] font-mono text-secondary flex items-center gap-1">
              <Sparkles size={12} />
              <span>Ready! Open Instagram → Add Story → Tap Sticker Icon (🔗 Link) → Paste!</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
