/**
 * Global Site Settings Management
 * Supports Bank/Payment instructions, storewide announcements,
 * and storefront copy.
 */
import { getSupabase } from './supabase';

export interface BankSettings {
  bankName: string;
  accountName: string;
  accountNumber: string;
  dispatchNote: string;
}

export interface AnnouncementSettings {
  enabled: boolean;
  message: string;
  linkText?: string;
  linkUrl?: string;
}

export interface SiteSettings {
  bank: BankSettings;
  announcement: AnnouncementSettings;
  heroTrustBadge: string;
  apothecaryCalloutTitle: string;
  apothecaryCalloutSubtitle: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  bank: {
    bankName: 'Guaranty Trust Bank (GTB)',
    accountName: 'Botanical Wellness Ltd',
    accountNumber: '0123456789',
    dispatchNote: 'Orders are dispatched via private courier directly within Abuja (FCT).',
  },
  announcement: {
    enabled: false,
    message: 'Autumn Harvest BT-2481 is now available for approved members.',
    linkText: 'Explore Oils',
    linkUrl: '/oils',
  },
  heroTrustBadge: 'Members Only · Application Required',
  apothecaryCalloutTitle: 'Looking for the Apothecary Collection?',
  apothecaryCalloutSubtitle: 'Our tinctures are batched in limited micro-volumes. Enter your reader invite code to browse current bottle drops.',
};

const LOCAL_SITE_SETTINGS_KEY = 'botanica_site_settings';
export const SITE_SETTINGS_EVENT = 'botanica-site-settings-updated';

function isSupabaseConfigured(): boolean {
  try {
    const url = import.meta.env.PUBLIC_SUPABASE_URL;
    const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return false;
    if (url.includes('your-project') || url.includes('placeholder') || anonKey === 'your-anon-key') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function getSiteSettings(): SiteSettings {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_SITE_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_SITE_SETTINGS,
          ...parsed,
          bank: { ...DEFAULT_SITE_SETTINGS.bank, ...(parsed.bank || {}) },
          announcement: { ...DEFAULT_SITE_SETTINGS.announcement, ...(parsed.announcement || {}) },
        };
      }
    } catch {}
  }
  return DEFAULT_SITE_SETTINGS;
}

let tableMissingChecked = false;

export async function fetchLiveSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured() && !tableMissingChecked) {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'global')
        .maybeSingle();

      if (error) {
        // Table not created in Supabase yet (PGRST205 or 404)
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
          tableMissingChecked = true;
        }
      } else if (data?.value) {
        const parsed = data.value;
        const merged: SiteSettings = {
          ...DEFAULT_SITE_SETTINGS,
          ...parsed,
          bank: { ...DEFAULT_SITE_SETTINGS.bank, ...(parsed.bank || {}) },
          announcement: { ...DEFAULT_SITE_SETTINGS.announcement, ...(parsed.announcement || {}) },
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_SITE_SETTINGS_KEY, JSON.stringify(merged));
        }
        return merged;
      }
    } catch {
      tableMissingChecked = true;
    }
  }

  return getSiteSettings();
}

export async function saveSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = getSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...settings,
    bank: settings.bank ? { ...current.bank, ...settings.bank } : current.bank,
    announcement: settings.announcement ? { ...current.announcement, ...settings.announcement } : current.announcement,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_SITE_SETTINGS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(SITE_SETTINGS_EVENT, { detail: updated }));
    } catch {}
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      await supabase
        .from('site_settings')
        .upsert({ key: 'global', value: updated, updated_at: new Date().toISOString() });
    } catch {}
  }

  return updated;
}
