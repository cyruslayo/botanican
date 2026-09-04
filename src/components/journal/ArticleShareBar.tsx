'use client';
import { useState } from 'react';
import { Share2, Check, Copy, Sparkles, Instagram } from 'lucide-react';

interface Props {
  title: string;
  slug: string;
}

export default function ArticleShareBar({ title, slug }: Props) {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const getFullUrl = (hash?: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const base = `${origin}/journal/${slug}`;
    const utm = 'utm_source=instagram&utm_medium=story&utm_campaign=gazette';
    return hash ? `${base}?${utm}#${hash}` : `${base}?${utm}`;
  };

  const copyToClipboard = async (url: string, type: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopiedType(type);
        setTimeout(() => setCopiedType(null), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Read "${title}" in The Botanical Gazette:`,
          url: getFullUrl()
        });
      } catch {
        // Share cancelled or unpermitted
      }
    } else {
      copyToClipboard(getFullUrl(), 'main');
    }
  };

  return (
    <div className="rounded-xl p-4 bg-surface-container-low border border-outline-variant/40 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Instagram size={16} className="text-secondary" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-primary">
            Share to Instagram Story
          </span>
        </div>
        <span className="text-[11px] text-on-surface-variant font-mono">
          Direct Anchor Links
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => copyToClipboard(getFullUrl('thesis'), 'thesis')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-surface border border-outline-variant/50 hover:border-secondary transition-colors text-primary active:scale-95 cursor-pointer"
          title="Copy link straight to Thesis quote"
        >
          {copiedType === 'thesis' ? <Check size={13} className="text-secondary" /> : <Copy size={13} />}
          <span>#thesis link</span>
        </button>

        <button
          type="button"
          onClick={() => copyToClipboard(getFullUrl('takeaways'), 'takeaways')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-surface border border-outline-variant/50 hover:border-secondary transition-colors text-primary active:scale-95 cursor-pointer"
          title="Copy link straight to Core Takeaways"
        >
          {copiedType === 'takeaways' ? <Check size={13} className="text-secondary" /> : <Copy size={13} />}
          <span>#takeaways link</span>
        </button>

        <button
          type="button"
          onClick={() => copyToClipboard(getFullUrl('content'), 'content')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-surface border border-outline-variant/50 hover:border-secondary transition-colors text-primary active:scale-95 cursor-pointer"
          title="Copy link straight to Full Monograph Body"
        >
          {copiedType === 'content' ? <Check size={13} className="text-secondary" /> : <Copy size={13} />}
          <span>#read body</span>
        </button>

        <button
          type="button"
          onClick={handleNativeShare}
          className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-label-sm font-bold uppercase tracking-wider bg-primary text-on-primary hover:opacity-90 transition-opacity active:scale-95 cursor-pointer"
        >
          <Share2 size={13} />
          <span>{copiedType === 'main' ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      {copiedType && (
        <p className="text-[11px] font-mono text-secondary animate-pulse pt-1 flex items-center gap-1.5">
          <Sparkles size={12} />
          <span>Copied link with anchor &amp; UTM tags ready to paste into Instagram Story Link sticker!</span>
        </p>
      )}
    </div>
  );
}
