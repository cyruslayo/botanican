'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface Props {
  anchor: string;
  title: string;
  text: string;
  className?: string;
}

export default function SectionShare({ anchor, title, text, className = '' }: Props) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    return `${origin}/#${anchor}`;
  };

  const handleShare = async () => {
    const url = getShareUrl();

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        // Fallback to clipboard if share failed for any other reason
      }
    }

    // Clipboard fallback
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Quiet failure
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-label-sm font-medium text-secondary bg-secondary-container/40 border border-secondary/25 hover:bg-secondary-container/70 hover:border-secondary/40 active:scale-95 transition-all cursor-pointer touch-target shrink-0 ${className}`}
      title={copied ? 'Link copied' : 'Share this guide'}
      aria-label={copied ? 'Link copied to clipboard' : `Share this guide: ${title}`}
    >
      {copied ? (
        <Check size={14} className="text-secondary shrink-0" aria-hidden="true" />
      ) : (
        <Share2 size={14} className="text-secondary shrink-0" aria-hidden="true" />
      )}
      <span className="tracking-wide">{copied ? 'Link copied' : 'Share this guide'}</span>
    </button>
  );
}