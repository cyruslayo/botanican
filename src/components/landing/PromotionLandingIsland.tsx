"use client";
import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { accessState } from "@/store/access";
import { useHydrated } from "@/lib/useHydrated";
import { getPublicPromotions } from "@/lib/promotions";
import { formatNaira } from "@/lib/utils";
import { toMinorUnits } from "@/lib/money";
import type { PromotionMerchandising } from "@/lib/types";

export default function PromotionLandingIsland() {
  const hydrated = useHydrated();
  const access = useStore(accessState);
  const [promotion, setPromotion] = useState<PromotionMerchandising | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    getPublicPromotions()
      .then((promotions) => {
        if (active) setPromotion(promotions[0] ?? null);
      })
      .catch(() => {
        if (active) setPromotion(null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!promotion) return null;
  const status =
    hydrated && access.status !== "unknown" ? access.status : "guest";
  const action =
    status === "approved"
      ? "View offer"
      : status === "pending"
        ? "Check access status"
        : "Use your invite";

  return (
    <section
      className="w-full bg-primary text-on-primary"
      aria-labelledby="landing-promotion-heading"
    >
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 md:py-24">
        <div className="max-w-3xl">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary-container font-bold">
            {promotion.badge || "MEMBER OFFER"}
          </span>
          <h2
            id="landing-promotion-heading"
            className="font-display-sm md:font-display-md text-display-sm md:text-display-md mt-3"
          >
            {promotion.headline || promotion.name}
          </h2>
          {promotion.description && (
            <p className="font-body-lg text-body-lg text-on-primary/80 mt-4 max-w-2xl">
              {promotion.description}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {promotion.items.map((item) => (
              <span
                key={item.slug}
                className="rounded-full border border-white/25 px-4 py-2 font-label-sm text-label-sm"
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
          <div className="mt-8 flex flex-wrap items-end gap-5">
            <div>
              <span className="block font-label-sm text-label-sm text-on-primary/70 uppercase tracking-wider">
                Member bundle
              </span>
              <strong className="font-headline-md text-headline-md">
                {formatNaira(promotion.fixed_price)}
              </strong>
            </div>
            {toMinorUnits(promotion.regular_total) >
              toMinorUnits(promotion.fixed_price) && (
              <p className="font-body-sm text-on-primary/70">
                Regular total: {formatNaira(promotion.regular_total)}
              </p>
            )}
            <span className="font-body-sm text-on-primary/70">
              {promotion.is_available
                ? "Available while active."
                : "Currently unavailable."}
            </span>
          </div>
          <a
            href={status === "approved" ? "/oils" : "/invite"}
            className="inline-flex mt-8 min-h-11 items-center justify-center rounded-full bg-secondary px-6 py-3 font-label-sm text-label-sm uppercase tracking-widest font-bold text-primary"
          >
            {action}
          </a>
        </div>
      </div>
    </section>
  );
}
