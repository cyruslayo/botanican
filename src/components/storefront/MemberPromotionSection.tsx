"use client";
import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { addPromotion } from "@/store/cart";
import { accessState, clearAccess, isApproved } from "@/store/access";
import { useHydrated } from "@/lib/useHydrated";
import {
  getMemberPromotions,
  isMemberPromotionAuthorizationError,
} from "@/lib/promotions";
import { formatNaira } from "@/lib/utils";
import { toMinorUnits } from "@/lib/money";
import type { PromotionMerchandising } from "@/lib/types";

export default function MemberPromotionSection() {
  const hydrated = useHydrated();
  const approved = useStore(isApproved);
  const access = useStore(accessState);
  const [promotions, setPromotions] = useState<PromotionMerchandising[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || !approved || !access.instagramHandle || !access.phone) {
      setPromotions([]);
      return;
    }
    let active = true;
    getMemberPromotions(access.instagramHandle, access.phone)
      .then((result) => {
        if (active) setPromotions(result);
      })
      .catch((error) => {
        if (!active) return;
        if (isMemberPromotionAuthorizationError(error)) clearAccess();
        setPromotions([]);
      });
    return () => {
      active = false;
    };
  }, [access.instagramHandle, access.phone, approved, hydrated]);

  if (!hydrated || !approved || promotions.length === 0) return null;
  const addBundle = (promotion: PromotionMerchandising) => {
    if (!promotion.is_available) return;
    if (
      addPromotion({
        promotionId: promotion.id,
        slug: promotion.slug,
        name: promotion.headline || promotion.name,
        price: promotion.fixed_price,
        quantity: 1,
        image: "",
        components: promotion.items,
      })
    ) {
      setAddedId(promotion.id);
      window.setTimeout(() => setAddedId(null), 2500);
    }
  };

  return (
    <section
      className="mb-section-gap rounded-2xl border border-secondary/30 bg-secondary-container/30 p-5 sm:p-8"
      aria-labelledby="member-promotions-heading"
    >
      <div className="mb-6">
        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
          Member offers
        </span>
        <h2
          id="member-promotions-heading"
          className="font-headline-md text-headline-md text-primary mt-2"
        >
          Current bundles
        </h2>
      </div>
      <div className="grid gap-4">
        {promotions.map((promotion) => (
          <article
            key={promotion.id}
            className="rounded-xl border border-outline-variant bg-surface p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">
                  {promotion.badge || "Member offer"}
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary mt-1">
                  {promotion.headline || promotion.name}
                </h3>
                {promotion.description && (
                  <p className="font-body-sm text-on-surface-variant mt-2 max-w-xl">
                    {promotion.description}
                  </p>
                )}
              </div>
              <div className="sm:text-right shrink-0">
                <strong className="font-headline-sm text-headline-sm text-primary">
                  {formatNaira(promotion.fixed_price)}
                </strong>
                {toMinorUnits(promotion.regular_total) >
                  toMinorUnits(promotion.fixed_price) && (
                  <p className="font-body-sm text-on-surface-variant">
                    Regular total: {formatNaira(promotion.regular_total)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-5">
              {promotion.items.map((item) => (
                <span
                  key={item.slug}
                  className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs text-on-surface"
                >
                  {item.quantity} ×{" "}
                  {item.strength_mg == null
                    ? item.name
                    : `${item.strength_mg} mg THC`}
                  {item.bottle_size_ml == null
                    ? ""
                    : ` / ${item.bottle_size_ml} ml`}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3 mt-5">
              <span className="font-body-sm text-on-surface-variant">
                {promotion.is_available ? "Available" : "Currently unavailable"}
              </span>
              <button
                type="button"
                disabled={!promotion.is_available}
                onClick={() => addBundle(promotion)}
                className="min-h-11 rounded-full bg-primary px-5 py-3 font-label-sm text-label-sm uppercase tracking-widest text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addedId === promotion.id
                  ? "Added to Bag"
                  : "Add bundle to Bag"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
