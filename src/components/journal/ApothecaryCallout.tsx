'use client';
import { useState, useEffect } from 'react';
import { getSiteSettings, fetchLiveSiteSettings, SITE_SETTINGS_EVENT, type SiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/siteSettings';

export default function ApothecaryCallout() {
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
    <div className="rounded-2xl bg-surface-container-low p-8 sm:p-12 border border-outline-variant/50 text-center space-y-4 max-w-2xl mx-auto">
      <span className="font-label-sm text-xs font-bold uppercase tracking-widest text-secondary">
        Private Membership
      </span>
      <h2 className="font-display-sm text-display-sm text-primary">
        {settings.apothecaryCalloutTitle}
      </h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
        {settings.apothecaryCalloutSubtitle}
      </p>
      <div className="pt-2">
        <a
          href="/invite"
          className="inline-block px-8 py-3 bg-primary text-on-primary font-label-sm text-xs uppercase tracking-widest font-bold rounded-full hover:opacity-90 transition-opacity"
        >
          Apply for Member Access &rarr;
        </a>
      </div>
    </div>
  );
}
