/**
 * Helpers for store and publication settings (Masthead volume/edition, quality claim, harvest label, etc.)
 */

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

export function saveGazetteSettings(settings: Partial<GazetteSettings>): GazetteSettings {
  const current = getGazetteSettings();
  const updated = { ...current, ...settings };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_GAZETTE_SETTINGS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('botanica-gazette-settings-updated', { detail: updated }));
    } catch {}
  }
  return updated;
}
