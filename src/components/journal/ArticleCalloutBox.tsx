'use client';
import { useState, useEffect } from 'react';
import type { ArticleCallout, Product } from '@/lib/types';
import { formatNaira } from '@/lib/utils';
import { ShoppingBag, Tag, Megaphone, ArrowRight, Check, Copy, Sparkles, ExternalLink } from 'lucide-react';

interface ArticleCalloutBoxProps {
  callout?: ArticleCallout;
  fallbackProductSlug?: string;
  fallbackProductName?: string;
}

export default function ArticleCalloutBox({
  callout,
  fallbackProductSlug,
  fallbackProductName,
}: ArticleCalloutBoxProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // If no structured callout is provided but legacy fallback exists, construct one
  const activeCallout: ArticleCallout | null = callout?.enabled !== false && callout?.title
    ? callout
    : fallbackProductSlug
    ? {
        enabled: true,
        type: 'product',
        badge: 'Featured Botanical Formulation',
        title: fallbackProductName || 'Botanica Tincture',
        description: 'A small-batch Botanica tincture carried in coconut MCT oil and featured alongside this journal entry.',
        productSlug: fallbackProductSlug,
        ctaText: 'View Apothecary Batch',
        ctaUrl: `/product/${fallbackProductSlug}`,
      }
    : null;

  const targetSlug = activeCallout?.productSlug || fallbackProductSlug;

  useEffect(() => {
    if (!targetSlug) return;
    let isMounted = true;
    setLoading(true);

    async function loadProduct() {
      try {
        const { getSupabase } = await import('@/lib/supabase');
        const supabase = getSupabase();
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('slug', targetSlug)
          .maybeSingle();

        if (isMounted && data) {
          setProduct(data as Product);
          return;
        }
      } catch {}

      // Fallback to mock catalog
      try {
        const { MOCK_PRODUCTS } = await import('@/lib/mockData');
        const found = MOCK_PRODUCTS.find((p) => p.slug === targetSlug);
        if (isMounted && found) {
          setProduct(found);
        }
      } catch {} finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [targetSlug]);

  if (!activeCallout || activeCallout.enabled === false) {
    return null;
  }

  const handleCopyCode = () => {
    if (!activeCallout.discountCode) return;
    navigator.clipboard.writeText(activeCallout.discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // 1. DEAL / SPECIAL OFFER CALLOUT
  if (activeCallout.type === 'deal') {
    return (
      <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-secondary-container/40 border border-secondary/40 botanical-shadow relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary text-on-secondary rounded-full font-mono text-[10px] uppercase tracking-widest font-bold">
              <Tag className="w-3 h-3" />
              <span>{activeCallout.badge || 'Exclusive Member Offer'}</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-primary font-bold">
              {activeCallout.title}
            </h4>
            <p className="font-body-md text-sm text-on-surface-variant max-w-xl leading-relaxed">
              {activeCallout.description}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-3 shrink-0 w-full sm:w-auto">
            {activeCallout.discountCode && (
              <div className="flex items-center gap-2 bg-surface p-1.5 px-3 rounded-xl border border-secondary/30">
                <span className="font-mono text-xs font-bold text-primary tracking-wider uppercase">
                  {activeCallout.discountCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 bg-secondary/20 hover:bg-secondary text-primary hover:text-on-secondary rounded-lg font-mono text-[11px] font-bold uppercase transition-colors flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}

            {activeCallout.ctaUrl && (
              <a
                href={activeCallout.ctaUrl}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary font-label-sm text-xs uppercase tracking-widest font-bold rounded-full hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <span>{activeCallout.ctaText || 'Redeem Offer'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. EDITORIAL ANNOUNCEMENT / ADVISORY CALLOUT
  if (activeCallout.type === 'announcement') {
    return (
      <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-surface-container-low border border-outline-variant/60 botanical-shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-highest text-primary rounded-full font-mono text-[10px] uppercase tracking-widest font-bold">
              <Megaphone className="w-3 h-3 text-secondary" />
              <span>{activeCallout.badge || 'Botanica Bulletin'}</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-primary font-bold">
              {activeCallout.title}
            </h4>
            <p className="font-body-md text-sm text-on-surface-variant max-w-xl leading-relaxed">
              {activeCallout.description}
            </p>
          </div>

          {activeCallout.ctaUrl && (
            <a
              href={activeCallout.ctaUrl}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-outline hover:bg-surface-container text-primary font-label-sm text-xs uppercase tracking-widest font-bold rounded-full transition-colors whitespace-nowrap shrink-0"
            >
              <span>{activeCallout.ctaText || 'Read Notice'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // 3. PRODUCT / APOTHECARY STORE REFERENCE
  const displayTitle = product ? product.name : activeCallout.title;
  const displayImage = product?.image;
  const displayPrice = product ? formatNaira(product.price) : null;
  const productUrl = activeCallout.ctaUrl || (targetSlug ? `/product/${targetSlug}` : '/oils');

  return (
    <div id="formulation" className="mt-12 p-6 sm:p-8 rounded-2xl bg-surface border border-secondary/30 botanical-shadow flex flex-col sm:flex-row items-center justify-between gap-6 target-glow-effect transition-shadow">
      <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
        {displayImage ? (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-surface-container shrink-0 border border-outline-variant/50">
            <img
              src={displayImage}
              alt={displayTitle}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl bg-secondary-container text-secondary flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
        )}

        <div className="space-y-1 text-left flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-secondary font-bold">
              {activeCallout.badge || 'Mentioned Apothecary Formulation'}
            </span>
            {displayPrice && (
              <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 bg-surface-container-high rounded-full">
                {displayPrice}
              </span>
            )}
          </div>
          <h4 className="font-headline-sm text-headline-sm text-primary">
            {displayTitle}
          </h4>
          <p className="font-body-sm text-xs text-on-surface-variant max-w-lg leading-relaxed">
            {activeCallout.description || (product?.description ? product.description.slice(0, 110) + '...' : 'A small-batch Botanica tincture carried in coconut MCT oil and featured alongside this journal entry.')}
          </p>
        </div>
      </div>

      <a
        href={productUrl}
        className="px-6 py-3 bg-primary text-on-primary font-label-sm text-xs uppercase tracking-widest font-bold rounded-full hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 w-full sm:w-auto text-center flex items-center justify-center gap-2"
      >
        <span>{activeCallout.ctaText || 'View Apothecary Batch'}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
