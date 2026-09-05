'use client';
import { useState, useEffect } from 'react';
import {
  getSiteSettings,
  saveSiteSettings,
  fetchLiveSiteSettings,
  type SiteSettings,
  DEFAULT_SITE_SETTINGS,
} from '@/lib/siteSettings';
import {
  getGazetteSettings,
  saveGazetteSettings,
  type GazetteSettings,
  DEFAULT_GAZETTE_SETTINGS,
} from '@/lib/gazetteSettings';
import {
  CreditCard,
  Megaphone,
  BookOpen,
  Check,
  Building,
  FileText,
  Sliders,
  Sparkles,
} from 'lucide-react';

export default function AdminSiteContent() {
  const [activeTab, setActiveTab] = useState<'bank' | 'announcement' | 'gazette' | 'banners'>('bank');

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [gazetteSettings, setGazetteSettings] = useState<GazetteSettings>(DEFAULT_GAZETTE_SETTINGS);

  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSiteSettings(getSiteSettings());
    setGazetteSettings(getGazetteSettings());

    fetchLiveSiteSettings().then((live) => {
      if (live) setSiteSettings(live);
    });
  }, []);

  const triggerSavedNotice = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleSaveBankSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSiteSettings({ bank: siteSettings.bank });
      triggerSavedNotice('Bank Transfer instructions updated live!');
    } catch {
      triggerSavedNotice('Saved locally.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSiteSettings({ announcement: siteSettings.announcement });
      triggerSavedNotice('Announcement banner settings updated live!');
    } catch {
      triggerSavedNotice('Saved locally.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBanners = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSiteSettings({
        heroTrustBadge: siteSettings.heroTrustBadge,
        apothecaryCalloutTitle: siteSettings.apothecaryCalloutTitle,
        apothecaryCalloutSubtitle: siteSettings.apothecaryCalloutSubtitle,
      });
      triggerSavedNotice('Storefront banners & copy updated live!');
    } catch {
      triggerSavedNotice('Saved locally.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGazette = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      saveGazetteSettings(gazetteSettings);
      triggerSavedNotice('Gazette & Masthead settings updated live!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-label-sm text-[10px] sm:text-xs font-bold uppercase tracking-widest text-secondary block">
            Centralized Storefront CMS
          </span>
          <h2 className="font-headline-md text-xl sm:text-headline-md text-primary mt-0.5">
            Site Content &amp; Global Sections
          </h2>
          <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Manage checkout payment details, announcements, callout banners, and publication masthead values across all pages.
          </p>
        </div>

        {savedNotice && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-secondary-container text-secondary text-xs font-mono font-bold animate-in fade-in shrink-0 self-start sm:self-auto">
            <Check className="w-4 h-4" />
            <span>{savedNotice}</span>
          </div>
        )}
      </div>

      {/* Horizontally scrollable tab bar */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar border-b border-outline-variant/40 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('bank')}
          className={`px-4 py-2.5 rounded-xl font-label-sm text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'bank'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'border border-outline-variant/60 text-primary bg-surface hover:bg-surface-container'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment &amp; Bank Transfer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('announcement')}
          className={`px-4 py-2.5 rounded-xl font-label-sm text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'announcement'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'border border-outline-variant/60 text-primary bg-surface hover:bg-surface-container'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Global Announcement Bar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('banners')}
          className={`px-4 py-2.5 rounded-xl font-label-sm text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'banners'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'border border-outline-variant/60 text-primary bg-surface hover:bg-surface-container'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Storefront Sections &amp; Banners</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gazette')}
          className={`px-4 py-2.5 rounded-xl font-label-sm text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'gazette'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'border border-outline-variant/60 text-primary bg-surface hover:bg-surface-container'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Gazette Masthead &amp; Volume</span>
        </button>
      </div>

      {/* Tab 1: Bank & Payment Instructions */}
      {activeTab === 'bank' && (
        <div className="bg-surface rounded-2xl border border-outline-variant/60 p-6 sm:p-8 botanical-shadow space-y-6 max-w-3xl">
          <div className="border-b border-outline-variant/40 pb-4">
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-secondary" />
              <span>Checkout Bank Transfer Details</span>
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Customers send their bank transfer to these details upon completing checkout. Any updates here take effect on the checkout page immediately.
            </p>
          </div>

          <form onSubmit={handleSaveBankSettings} className="space-y-5">
            <div className="space-y-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                Bank Name
              </label>
              <input
                type="text"
                required
                value={siteSettings.bank.bankName}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    bank: { ...siteSettings.bank, bankName: e.target.value },
                  })
                }
                placeholder="e.g. Guaranty Trust Bank (GTB)"
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                Account Holder / Beneficiary Name
              </label>
              <input
                type="text"
                required
                value={siteSettings.bank.accountName}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    bank: { ...siteSettings.bank, accountName: e.target.value },
                  })
                }
                placeholder="e.g. Botanical Wellness Ltd"
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                Account Number (NUBAN)
              </label>
              <input
                type="text"
                required
                value={siteSettings.bank.accountNumber}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    bank: { ...siteSettings.bank, accountNumber: e.target.value },
                  })
                }
                placeholder="e.g. 0123456789"
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-mono text-base font-bold text-primary focus:border-secondary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                Courier &amp; Dispatch Note
              </label>
              <textarea
                rows={2}
                value={siteSettings.bank.dispatchNote}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    bank: { ...siteSettings.bank, dispatchNote: e.target.value },
                  })
                }
                placeholder="Notice displayed beneath delivery details..."
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t border-outline-variant/40 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-primary text-on-primary font-label-sm text-xs uppercase tracking-wider font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
              >
                {saving ? 'Saving...' : 'Save Bank Details'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Global Announcement Bar */}
      {activeTab === 'announcement' && (
        <div className="bg-surface rounded-2xl border border-outline-variant/60 p-6 sm:p-8 botanical-shadow space-y-6 max-w-3xl">
          <div className="border-b border-outline-variant/40 pb-4">
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-secondary" />
              <span>Global Announcement Bar</span>
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Show an optional announcement bar at the top of the storefront for seasonal harvest drops, private member notices, or schedule updates.
            </p>
          </div>

          <form onSubmit={handleSaveAnnouncement} className="space-y-5">
            <label className="flex items-center gap-3 cursor-pointer select-none bg-surface-container-low p-4 rounded-xl border border-outline-variant/50">
              <input
                type="checkbox"
                checked={siteSettings.announcement.enabled}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    announcement: { ...siteSettings.announcement, enabled: e.target.checked },
                  })
                }
                className="w-5 h-5 rounded text-secondary focus:ring-secondary"
              />
              <div>
                <span className="font-label-sm text-sm text-primary font-bold block">
                  Enable Storefront Announcement Bar
                </span>
                <span className="text-xs text-on-surface-variant">
                  When turned on, this notification banner appears at the very top of the header.
                </span>
              </div>
            </label>

            <div className="space-y-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                Banner Message
              </label>
              <input
                type="text"
                value={siteSettings.announcement.message}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    announcement: { ...siteSettings.announcement, message: e.target.value },
                  })
                }
                placeholder="e.g. Autumn Harvest BT-2481 is now available for approved members."
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                  Action Link Label (Optional)
                </label>
                <input
                  type="text"
                  value={siteSettings.announcement.linkText || ''}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      announcement: { ...siteSettings.announcement, linkText: e.target.value },
                    })
                  }
                  placeholder="e.g. Explore Drop &rarr;"
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                  Action Link Destination URL
                </label>
                <input
                  type="text"
                  value={siteSettings.announcement.linkUrl || ''}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      announcement: { ...siteSettings.announcement, linkUrl: e.target.value },
                    })
                  }
                  placeholder="e.g. /oils or /journal"
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-mono text-xs text-primary focus:border-secondary focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/40 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-primary text-on-primary font-label-sm text-xs uppercase tracking-wider font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
              >
                {saving ? 'Saving...' : 'Save Announcement Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Storefront Banners & Copy */}
      {activeTab === 'banners' && (
        <div className="bg-surface rounded-2xl border border-outline-variant/60 p-6 sm:p-8 botanical-shadow space-y-6 max-w-3xl">
          <div className="border-b border-outline-variant/40 pb-4">
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold flex items-center gap-2">
              <Building className="w-5 h-5 text-secondary" />
              <span>Storefront Sections &amp; Callout Banners</span>
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Customize membership badges and invitation callouts across the landing page and journal index.
            </p>
          </div>

          <form onSubmit={handleSaveBanners} className="space-y-5">
            <div className="space-y-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                Homepage Hero Pill Badge
              </label>
              <input
                type="text"
                value={siteSettings.heroTrustBadge}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, heroTrustBadge: e.target.value })
                }
                placeholder="Members Only · Application Required"
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                Gazette Index Callout Title
              </label>
              <input
                type="text"
                value={siteSettings.apothecaryCalloutTitle}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, apothecaryCalloutTitle: e.target.value })
                }
                placeholder="Looking for the Apothecary Collection?"
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                Gazette Index Callout Subtitle
              </label>
              <textarea
                rows={2}
                value={siteSettings.apothecaryCalloutSubtitle}
                onChange={(e) =>
                  setSiteSettings({ ...siteSettings, apothecaryCalloutSubtitle: e.target.value })
                }
                placeholder="Our tinctures are batched in limited micro-volumes..."
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t border-outline-variant/40 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-primary text-on-primary font-label-sm text-xs uppercase tracking-wider font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
              >
                {saving ? 'Saving...' : 'Save Banner Copy'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Gazette Masthead & Volume */}
      {activeTab === 'gazette' && (
        <div className="bg-surface rounded-2xl border border-outline-variant/60 p-6 sm:p-8 botanical-shadow space-y-6 max-w-3xl">
          <div className="border-b border-outline-variant/40 pb-4">
            <h3 className="font-headline-sm text-headline-sm text-primary font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-secondary" />
              <span>Gazette Publication &amp; Masthead Settings</span>
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Sets the official publication season, volume index, circulation designation, and batch harvest label displayed across the masthead bar.
            </p>
          </div>

          <form onSubmit={handleSaveGazette} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                  Publication Name
                </label>
                <input
                  type="text"
                  value={gazetteSettings.publicationName}
                  onChange={(e) => setGazetteSettings({ ...gazetteSettings, publicationName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                  Volume Index
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vol. I"
                  value={gazetteSettings.volume}
                  onChange={(e) => setGazetteSettings({ ...gazetteSettings, volume: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                  Edition / Season
                </label>
                <input
                  type="text"
                  placeholder="e.g. Autumn Edition"
                  value={gazetteSettings.edition}
                  onChange={(e) => setGazetteSettings({ ...gazetteSettings, edition: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                  Harvest / Batch Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. Botanical Harvest BT-2481"
                  value={gazetteSettings.harvestLabel}
                  onChange={(e) => setGazetteSettings({ ...gazetteSettings, harvestLabel: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                  Quality &amp; Edition Badge
                </label>
                <input
                  type="text"
                  placeholder="e.g. Small-Batch Botanical Edition"
                  value={gazetteSettings.qualityBadge}
                  onChange={(e) => setGazetteSettings({ ...gazetteSettings, qualityBadge: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/40 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-primary text-on-primary font-label-sm text-xs uppercase tracking-wider font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
              >
                {saving ? 'Saving...' : 'Save Gazette Settings'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
