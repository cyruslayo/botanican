'use client';
import { useState, useEffect } from 'react';
import { getGazetteSettings, DEFAULT_GAZETTE_SETTINGS, type GazetteSettings } from '@/lib/gazetteSettings';

export default function MastheadBar() {
  const [settings, setSettings] = useState<GazetteSettings>(DEFAULT_GAZETTE_SETTINGS);

  useEffect(() => {
    setSettings(getGazetteSettings());

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<GazetteSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        setSettings(getGazetteSettings());
      }
    };

    window.addEventListener('botanica-gazette-settings-updated', handleUpdate);
    return () => window.removeEventListener('botanica-gazette-settings-updated', handleUpdate);
  }, []);

  return (
    <div className="w-full border-b border-outline-variant/60 bg-surface">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-on-surface-variant font-mono text-[11px] uppercase tracking-widest">
          <div className="flex items-center gap-4 divide-x divide-outline-variant/40">
            <span className="font-bold text-primary">{settings.publicationName}</span>
            <span className="pl-4">
              {settings.volume} &bull; {settings.edition}
            </span>
            <span className="pl-4 hidden sm:inline">{settings.circulation}</span>
          </div>

          <div className="flex items-center gap-4 divide-x divide-outline-variant/40 text-[10px]">
            <span className="hidden lg:inline">{settings.harvestLabel}</span>
            <span className="pl-4">{settings.qualityBadge}</span>
            <a
              href="/journal"
              className="pl-4 text-secondary hover:text-primary font-bold underline underline-offset-4 transition-colors"
            >
              {settings.archiveLinkText}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
