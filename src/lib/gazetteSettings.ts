import { fetchLiveSiteSettings, saveSiteSettings } from './siteSettings';

export interface GazetteSettings {
  publicationName: string;
  volume: string;
  edition: string;
  circulation: string;
  harvestLabel: string;
  qualityBadge: string;
  archiveLinkText: string;
}

export const DEFAULT_GAZETTE_SETTINGS: GazetteSettings = {
  publicationName: 'The Botanical Gazette & Journal',
  volume: 'Vol. I',
  edition: 'Issue 01',
  circulation: 'Private Circulation',
  harvestLabel: 'Botanical Harvest BT-2481',
  qualityBadge: 'Small-Batch Botanical Edition',
  archiveLinkText: 'Browse Archive →',
};

const LOCAL_GAZETTE_SETTINGS_KEY = 'botanica_gazette_settings';

export function getGazetteSettings(): GazetteSettings {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_GAZETTE_SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_GAZETTE_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {}
  }
  return DEFAULT_GAZETTE_SETTINGS;
}

function fromSiteSettings(settings: Awaited<ReturnType<typeof fetchLiveSiteSettings>>): GazetteSettings {
  return {
    publicationName: settings.publicationName || DEFAULT_GAZETTE_SETTINGS.publicationName,
    volume: settings.volume || DEFAULT_GAZETTE_SETTINGS.volume,
    edition: settings.edition || DEFAULT_GAZETTE_SETTINGS.edition,
    circulation: settings.circulation || DEFAULT_GAZETTE_SETTINGS.circulation,
    harvestLabel: settings.harvestLabel || DEFAULT_GAZETTE_SETTINGS.harvestLabel,
    qualityBadge: settings.qualityBadge || DEFAULT_GAZETTE_SETTINGS.qualityBadge,
    archiveLinkText: settings.archiveLinkText || DEFAULT_GAZETTE_SETTINGS.archiveLinkText,
  };
}

function cacheGazetteSettings(settings: GazetteSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_GAZETTE_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // A cache failure must never change the persistence result.
  }
}

export async function fetchLiveGazetteSettings(): Promise<GazetteSettings> {
  const settings = fromSiteSettings(await fetchLiveSiteSettings());
  cacheGazetteSettings(settings);
  return settings;
}

export async function saveGazetteSettings(settings: Partial<GazetteSettings>): Promise<GazetteSettings> {
  const savedSiteSettings = await saveSiteSettings(settings);
  const updated = fromSiteSettings(savedSiteSettings);
  cacheGazetteSettings(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('botanica-gazette-settings-updated', { detail: updated }));
  }
  return updated;
}
