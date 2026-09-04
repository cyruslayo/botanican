'use client';
import { useState, useEffect } from 'react';
import { getSiteSettings, fetchLiveSiteSettings, SITE_SETTINGS_EVENT, type SiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/siteSettings';

export default function HeroTrustBadge() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    setSettings(getSiteSettings());
    fetchLiveSiteSettings().then(setSettings);

    const onUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteSettings>;
      if (customEvent.detail) setSettings(customEvent.detail);
      else setSettings(getSiteSettings());
    };
    window.addEventListener(SITE_SETTINGS_EVENT, onUpdate);
    return () => window.removeEventListener(SITE_SETTINGS_EVENT, onUpdate);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary-container/40 rounded-full border border-outline-variant/40">
      <span className="w-1.5 h-1.5 rounded-full bg-secondary" aria-hidden="true" />
      <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
        {settings.heroTrustBadge}
      </span>
    </div>
  );
}
