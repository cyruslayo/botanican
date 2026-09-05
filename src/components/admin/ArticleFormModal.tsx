'use client';
import { useState } from 'react';
import type { Article } from '@/lib/types';
import { X, Sparkles, AlertCircle } from 'lucide-react';

interface ArticleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (articleData: Partial<Article>) => Promise<void>;
  articleToEdit?: Article | null;
  existingProducts?: Array<{ slug: string; name: string }>;
}

export default function ArticleFormModal({
  isOpen,
  onClose,
  onSave,
  articleToEdit,
  existingProducts = [],
}: ArticleFormModalProps) {
  const isEditing = Boolean(articleToEdit);

  const [title, setTitle] = useState(articleToEdit?.title || '');
  const [slug, setSlug] = useState(articleToEdit?.slug || '');
  const [subtitle, setSubtitle] = useState(articleToEdit?.subtitle || '');
  const [category, setCategory] = useState<Article['category']>(
    articleToEdit?.category || 'Monograph'
  );
  const [volume, setVolume] = useState(articleToEdit?.volume || 'Vol. IV');
  const [issue, setIssue] = useState(articleToEdit?.issue || 'Issue 04');
  const [date, setDate] = useState(articleToEdit?.date || 'Autumn 2026');
  const [readTime, setReadTime] = useState(articleToEdit?.readTime || '5 min read');
  const [authorName, setAuthorName] = useState(articleToEdit?.author.name || 'Botanica Research');
  const [authorRole, setAuthorRole] = useState(
    articleToEdit?.author.role || 'Apothecary Science Contributor'
  );
  const [image, setImage] = useState(
    articleToEdit?.image ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD1Yy6GMbIqi-iQxCvqjcLUfqwsZwkrt1RwcRWsq9LWTMGM2sWHofVCipqrnFTdmiNqF0BxZgRzurPlmSZ0H1_qHIX2EgXTqNjfQcjcuK2s4Xx3yAuJ-_QBo1i06XVliNJMJBxYP_gbqKVPVCFSA6bkTv1oLOQxIQM0Zh-klcrUdkcId8u87rBkqu2lUURTMk0qQO_X5KlbGWgQSN8rdjfBuXHAz2pzalmlqS1j13ztnc0aRaHdnK8OxA'
  );
  const [thesis, setThesis] = useState(articleToEdit?.thesis || '');
  const [excerpt, setExcerpt] = useState(articleToEdit?.excerpt || '');
  const [contentString, setContentString] = useState(
    articleToEdit?.content ? articleToEdit.content.join('\n\n') : ''
  );
  const [takeawaysString, setTakeawaysString] = useState(
    articleToEdit?.keyTakeaways ? articleToEdit.keyTakeaways.join('\n') : ''
  );
  const [featured, setFeatured] = useState(articleToEdit?.featured || false);
  const [status, setStatus] = useState<'draft' | 'published'>(
    articleToEdit?.status || 'published'
  );
  const [relatedProductSlug, setRelatedProductSlug] = useState(
    articleToEdit?.relatedProductSlug || ''
  );

  // Callout, Offer, and Product reference configuration
  const initialCallout = articleToEdit?.callout;
  const [calloutEnabled, setCalloutEnabled] = useState(
    initialCallout ? initialCallout.enabled !== false : Boolean(articleToEdit?.relatedProductSlug)
  );
  const [calloutType, setCalloutType] = useState<'product' | 'deal' | 'announcement'>(
    initialCallout?.type || 'product'
  );
  const [calloutBadge, setCalloutBadge] = useState(
    initialCallout?.badge || 'Mentioned Apothecary Formulation'
  );
  const [calloutTitle, setCalloutTitle] = useState(
    initialCallout?.title || articleToEdit?.relatedProductName || ''
  );
  const [calloutDescription, setCalloutDescription] = useState(
    initialCallout?.description || ''
  );
  const [calloutProductSlug, setCalloutProductSlug] = useState(
    initialCallout?.productSlug || articleToEdit?.relatedProductSlug || ''
  );
  const [calloutDiscountCode, setCalloutDiscountCode] = useState(
    initialCallout?.discountCode || ''
  );
  const [calloutCtaText, setCalloutCtaText] = useState(
    initialCallout?.ctaText || ''
  );
  const [calloutCtaUrl, setCalloutCtaUrl] = useState(
    initialCallout?.ctaUrl || ''
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  };

  const handleContentChange = (val: string) => {
    setContentString(val);
    const words = val.trim().split(/\s+/).filter(Boolean).length;
    const est = Math.max(1, Math.ceil(words / 200));
    setReadTime(`${est} min read`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!slug.trim()) {
      setError('Slug is required');
      return;
    }

    setSaving(true);
    setError(null);

    const chosenProductSlug = calloutProductSlug || relatedProductSlug;
    const relatedProduct = existingProducts.find((p) => p.slug === chosenProductSlug);

    const calloutPayload = calloutEnabled
      ? {
          enabled: true,
          type: calloutType,
          badge: calloutBadge || undefined,
          title: calloutTitle || (calloutType === 'product' && relatedProduct ? relatedProduct.name : 'Botanica Announcement'),
          description: calloutDescription || '',
          productSlug: calloutType === 'product' ? chosenProductSlug || undefined : undefined,
          discountCode: calloutType === 'deal' ? calloutDiscountCode || undefined : undefined,
          ctaText: calloutCtaText || (calloutType === 'product' ? 'View Apothecary Batch' : calloutType === 'deal' ? 'Redeem Offer' : 'Learn More'),
          ctaUrl: calloutCtaUrl || (calloutType === 'product' && chosenProductSlug ? `/product/${chosenProductSlug}` : '/oils'),
        }
      : { enabled: false, type: 'product' as const, title: '', description: '' };

    const articlePayload: Partial<Article> = {
      title,
      slug,
      subtitle,
      category,
      volume,
      issue,
      date,
      readTime,
      author: {
        name: authorName,
        role: authorRole,
      },
      image,
      thesis,
      excerpt,
      content: contentString
        .split('\n\n')
        .map((p) => p.trim())
        .filter(Boolean),
      keyTakeaways: takeawaysString
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean),
      featured,
      status,
      relatedProductSlug: chosenProductSlug || undefined,
      relatedProductName: relatedProduct?.name || undefined,
      callout: calloutPayload,
    };

    try {
      await onSave(articlePayload);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-surface border border-outline-variant/60 rounded-t-3xl sm:rounded-2xl max-w-3xl w-full p-4 sm:p-6 md:p-8 botanical-shadow max-h-[92dvh] overflow-y-auto overscroll-contain flex flex-col my-0 sm:my-8">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-outline-variant/40 mb-4 sm:mb-6 shrink-0">
          <div>
            <span className="font-label-sm text-[10px] sm:text-xs font-bold uppercase tracking-widest text-secondary block">
              Editorial Studio
            </span>
            <h2 className="font-headline-md text-base sm:text-headline-md text-primary mt-0.5 sm:mt-1">
              {isEditing ? 'Edit Monograph' : 'Author New Publication Article'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors touch-target flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 p-3.5 sm:p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3 text-error text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                Article Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. The Circadian Tincture: Why Chronobiology Outranks Potency"
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-md text-primary focus:border-secondary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="circadian-tincture-chronobiology"
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-mono text-sm text-primary focus:border-secondary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                Editorial Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
              >
                <option value="Monograph">Monograph</option>
                <option value="Circadian Science">Circadian Science</option>
                <option value="Extraction & Lab">Extraction & Lab</option>
                <option value="Protocol & Ritual">Protocol & Ritual</option>
                <option value="Format & Method">Format & Method</option>
                <option value="Culture & Routine">Culture & Routine</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                Volume / Issue
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="e.g. Vol. IV"
                  className="w-full px-3 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                />
                <input
                  type="text"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="e.g. Issue 01"
                  className="w-full px-3 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                Publication Season / Date
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. Autumn 2026"
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
              Subtitle / Lead Hook
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Matching botanical delivery to the biphasic rhythm of the nervous system."
              className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-md text-primary focus:border-secondary focus:outline-none"
            />
          </div>

          <div className="p-4 rounded-xl bg-secondary-container/20 border border-secondary/20 space-y-2">
            <label className="font-label-sm text-xs uppercase tracking-wider text-secondary font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Central Monograph Thesis (Pull Quote)
            </label>
            <textarea
              rows={2}
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              placeholder="e.g. The therapeutic window of lipid-soluble phytocannabinoids is governed primarily by circadian receptor density, not raw milligram volume."
              className="w-full px-4 py-2.5 bg-surface border border-outline-variant/60 rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none italic"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
              Excerpt (Search, Cards & Social Previews)
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Concise 2-3 sentence overview..."
              className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                Article Body (Paragraphs separated by double line-breaks)
              </label>
              <span className="font-mono text-xs text-on-surface-variant">{readTime}</span>
            </div>
            <textarea
              rows={7}
              value={contentString}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Paste article text. Paragraphs will be automatically styled with publication drop-caps and reading margins..."
              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline rounded-xl font-body-md text-primary focus:border-secondary focus:outline-none leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
              Core Scientific Takeaways (One per line)
            </label>
            <textarea
              rows={3}
              value={takeawaysString}
              onChange={(e) => setTakeawaysString(e.target.value)}
              placeholder="CB1 receptor tone peaks during early evening...&#10;Sublingual delivery avoids erratic first-pass metabolites..."
              className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                Author Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                Author Role / Credentials
              </label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
              Featured Image URL
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-mono text-xs text-primary focus:border-secondary focus:outline-none"
            />
          </div>

          {/* Rich Store Reference, Offer & Announcement Callout Panel */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-secondary/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-secondary block">
                  Interactive Story Element
                </span>
                <h4 className="font-headline-sm text-sm text-primary font-bold">
                  Article Callout, Deal or Product Reference
                </h4>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={calloutEnabled}
                  onChange={(e) => setCalloutEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-secondary focus:ring-secondary"
                />
                <span className="font-label-sm text-xs text-primary font-bold">
                  Enable Callout Box
                </span>
              </label>
            </div>

            {calloutEnabled && (
              <div className="pt-2 space-y-4 border-t border-outline-variant/40">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setCalloutType('product')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      calloutType === 'product'
                        ? 'bg-secondary-container/60 border-secondary text-primary font-bold'
                        : 'bg-surface border-outline/60 text-on-surface-variant hover:border-secondary/40'
                    }`}
                  >
                    <span className="block font-mono text-[10px] uppercase tracking-wider">🛍️ Store Reference</span>
                    <span className="text-xs font-semibold">Live Product Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCalloutType('deal')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      calloutType === 'deal'
                        ? 'bg-secondary-container/60 border-secondary text-primary font-bold'
                        : 'bg-surface border-outline/60 text-on-surface-variant hover:border-secondary/40'
                    }`}
                  >
                    <span className="block font-mono text-[10px] uppercase tracking-wider">🏷️ Special Deal</span>
                    <span className="text-xs font-semibold">Member Discount Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCalloutType('announcement')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      calloutType === 'announcement'
                        ? 'bg-secondary-container/60 border-secondary text-primary font-bold'
                        : 'bg-surface border-outline/60 text-on-surface-variant hover:border-secondary/40'
                    }`}
                  >
                    <span className="block font-mono text-[10px] uppercase tracking-wider">📢 Announcement</span>
                    <span className="text-xs font-semibold">Botanical Advisory</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {calloutType === 'product' && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                        Select Catalog Product
                      </label>
                      <select
                        value={calloutProductSlug}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCalloutProductSlug(val);
                          setRelatedProductSlug(val);
                          const matched = existingProducts.find((p) => p.slug === val);
                          if (matched && !calloutTitle) setCalloutTitle(matched.name);
                        }}
                        className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                      >
                        <option value="">Select a Product from Store...</option>
                        {existingProducts.map((p) => (
                          <option key={p.slug} value={p.slug}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                      Badge Label
                    </label>
                    <input
                      type="text"
                      value={calloutBadge}
                      onChange={(e) => setCalloutBadge(e.target.value)}
                      placeholder="e.g. Mentioned Formulation, Member Drop"
                      className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                      Callout Title
                    </label>
                    <input
                      type="text"
                      value={calloutTitle}
                      onChange={(e) => setCalloutTitle(e.target.value)}
                      placeholder="Title or highlighted feature..."
                      className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                    />
                  </div>

                  {calloutType === 'deal' && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                        Discount / Invite Code (One-Click Copy)
                      </label>
                      <input
                        type="text"
                        value={calloutDiscountCode}
                        onChange={(e) => setCalloutDiscountCode(e.target.value)}
                        placeholder="e.g. HARVEST20 or BOTANICA-VIP"
                        className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-mono text-sm uppercase text-primary focus:border-secondary focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                      Description / Editorial Note
                    </label>
                    <textarea
                      rows={2}
                      value={calloutDescription}
                      onChange={(e) => setCalloutDescription(e.target.value)}
                      placeholder="Tell readers why this formulation or announcement matters..."
                      className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={calloutCtaText}
                      onChange={(e) => setCalloutCtaText(e.target.value)}
                      placeholder={calloutType === 'product' ? 'View Apothecary Batch' : 'Redeem Offer'}
                      className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                      Button URL Target
                    </label>
                    <input
                      type="text"
                      value={calloutCtaUrl}
                      onChange={(e) => setCalloutCtaUrl(e.target.value)}
                      placeholder={calloutProductSlug ? `/product/${calloutProductSlug}` : '/oils'}
                      className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-mono text-xs text-primary focus:border-secondary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline rounded-xl font-body-sm text-primary focus:border-secondary focus:outline-none"
              >
                <option value="published">Published &bull; Live in Gazette</option>
                <option value="draft">Draft &bull; Internal Review</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-outline-variant/40">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-secondary focus:ring-secondary"
              />
              <span className="font-label-sm text-xs uppercase tracking-wider text-primary font-bold">
                Promote to Homepage Lead Cover Story
              </span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-6 py-2.5 border border-outline text-primary font-label-sm text-xs uppercase tracking-wider rounded-xl hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2.5 bg-primary text-on-primary font-label-sm text-xs uppercase tracking-wider font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
              >
                {saving ? 'Saving...' : isEditing ? 'Update Monograph' : 'Publish to Gazette'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
