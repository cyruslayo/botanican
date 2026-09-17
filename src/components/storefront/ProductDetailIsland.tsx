"use client";
import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { addItem } from "@/store/cart";
import { formatNaira } from "@/lib/utils";
import { accessState, clearAccess, isApproved } from "@/store/access";
import {
  getMemberProduct,
  isMemberCatalogAuthorizationError,
} from "@/lib/products";
import { useHydrated } from "@/lib/useHydrated";
import type { MemberProduct } from "@/lib/types";
import ProductDescription from "@/components/storefront/ProductDescription";

interface ProductDetailIslandProps {
  slug: string;
}

type DetailState = "idle" | "loading" | "loaded" | "empty" | "error";

export default function ProductDetailIsland({
  slug,
}: ProductDetailIslandProps) {
  const isHydrated = useHydrated();
  const approved = useStore(isApproved);
  const access = useStore(accessState);
  const [product, setProduct] = useState<MemberProduct | null>(null);
  const [detailState, setDetailState] = useState<DetailState>("idle");
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    if (!isHydrated || !approved) {
      setProduct(null);
      setDetailState("idle");
      return;
    }

    const handle = access.instagramHandle;
    const phone = access.phone;
    if (!handle || !phone) {
      setProduct(null);
      setDetailState("idle");
      return;
    }

    let active = true;
    setProduct(null);
    setDetailState("loading");

    getMemberProduct(handle, phone, slug)
      .then((result) => {
        if (!active) return;
        setProduct(result);
        setDetailState(result ? "loaded" : "empty");
      })
      .catch((error: unknown) => {
        if (!active) return;

        setProduct(null);
        if (isMemberCatalogAuthorizationError(error)) {
          clearAccess();
          setDetailState("idle");
          return;
        }

        setDetailState("error");
      });

    return () => {
      active = false;
    };
  }, [access.instagramHandle, access.phone, approved, isHydrated, slug]);

  if (!isHydrated || detailState === "loading" || detailState === "idle") {
    return <ProductStatusMessage message="Loading product…" />;
  }

  if (detailState === "empty") {
    return <ProductUnavailable />;
  }

  if (detailState === "error") {
    return <ProductStatusMessage message="Product details unavailable" />;
  }

  if (!product) {
    return <ProductStatusMessage message="Product details unavailable" />;
  }

  const bottleStrength =
    product.strength_mg == null ? null : `${product.strength_mg} mg`;
  const bottleSize =
    product.bottle_size_ml == null ? null : `${product.bottle_size_ml} ml`;
  const variantParts = [
    bottleStrength && bottleSize ? `${bottleStrength} / ${bottleSize}` : null,
    product.strain_name || null,
    product.batch_code ? `Batch ${product.batch_code}` : null,
  ].filter(Boolean);
  const isAvailable = product.is_available;

  const handleAddToCart = () => {
    if (!isAvailable) return;

    const success = addItem({
      line_type: "product",
      id: product.id,
      name: product.name,
      variant: variantParts.join(" • ") || product.category || "",
      price: product.price,
      quantity,
      image: product.image || "",
      strength_mg: product.strength_mg ?? null,
      bottle_size_ml: product.bottle_size_ml ?? null,
      strain_name: product.strain_name ?? null,
      batch_code: product.batch_code ?? null,
    });

    if (success) {
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2500);
    }
  };

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg md:py-section-gap pb-32 pt-24 md:pt-32">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter lg:gap-section-gap">
        <div className="md:col-span-7 space-y-stack-md">
          <div className="aspect-[4/5] bg-surface-container-low rounded-xl overflow-hidden relative group botanical-shadow">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-container-highest text-on-surface-variant">
                No Image
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-5 flex flex-col">
          <div className="mb-stack-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                Tinctures
              </span>
            </div>
            <h1 className="font-display-sm md:font-display-md text-display-sm md:text-display-md text-primary mb-stack-sm">
              {product.name}
            </h1>
            <p className="font-body-lg text-body-lg text-secondary mb-stack-md">
              {formatNaira(product.price)}
            </p>
            {(bottleStrength ||
              bottleSize ||
              product.strain_name ||
              product.batch_code) && (
              <div className="mb-stack-md space-y-1.5 font-label-sm text-label-sm text-on-surface-variant">
                {bottleStrength && <p>Strength: {bottleStrength}</p>}
                {bottleSize && <p>Bottle size: {bottleSize}</p>}
                {product.strain_name && <p>Strain: {product.strain_name}</p>}
                {product.batch_code && <p>Batch: {product.batch_code}</p>}
              </div>
            )}
            <ProductDescription description={product.description} />
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-stack-md">
              {isAvailable ? "Available" : "Currently unavailable"}
            </p>
            <a
              href="/how-to-use"
              className="inline-flex mt-stack-md font-label-sm text-label-sm text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              Read the visual dropper guide
            </a>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mt-stack-md">
              THC can impair judgment and coordination. Do not drive while
              impaired.
            </p>
          </div>

          <div className="space-y-3 mb-stack-lg">
            {isAvailable ? (
              <div className="flex gap-stack-sm">
                <fieldset className="flex items-center border border-outline-variant rounded-full p-1 bg-surface">
                  <legend className="visually-hidden">Quantity</legend>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                    className="touch-target w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container"
                  >
                    <MinusIcon />
                  </button>
                  <span
                    className="w-12 text-center font-label-lg text-label-lg text-on-surface"
                    aria-live="polite"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                    className="touch-target w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container"
                  >
                    <PlusIcon />
                  </button>
                </fieldset>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary text-on-primary rounded-full font-label-lg text-label-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/10 hover:shadow-xl hover:-translate-y-1 duration-300"
                >
                  <BagIcon /> Add to Bag
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled
                className="w-full bg-surface-container-highest text-on-surface-variant rounded-full font-label-lg text-label-lg flex items-center justify-center gap-2 py-3.5 cursor-not-allowed"
              >
                <BagIcon /> Currently unavailable
              </button>
            )}
            {addedNotice && (
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="font-body-sm text-body-sm text-secondary flex flex-wrap items-center gap-1.5 animate-in fade-in"
              >
                <span className="flex items-center gap-1.5">
                  <CheckIcon /> Added to your bag.
                </span>
                <a
                  href="/cart"
                  className="text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  View Bag
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function ProductStatusMessage({ message }: { message: string }) {
  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg md:py-section-gap pt-24 md:pt-32">
      <div
        className="max-w-xl mx-auto text-center"
        role="status"
        aria-live="polite"
      >
        <h1 className="font-display-sm md:font-display-md text-display-sm md:text-display-md text-primary mb-stack-sm">
          {message}
        </h1>
        {message !== "Loading product…" && (
          <a
            href="/oils"
            className="inline-flex items-center justify-center px-6 py-3.5 bg-primary text-on-primary rounded-full font-label-sm text-label-sm uppercase tracking-widest hover:bg-primary/90 transition-colors"
          >
            Back to Store
          </a>
        )}
      </div>
    </main>
  );
}

function ProductUnavailable() {
  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg md:py-section-gap pt-24 md:pt-32">
      <div className="max-w-xl mx-auto text-center">
        <h1 className="font-display-sm md:font-display-md text-display-sm md:text-display-md text-primary mb-stack-sm">
          Product unavailable
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-stack-lg">
          This product is not available right now.
        </p>
        <a
          href="/oils"
          className="inline-flex items-center justify-center px-6 py-3.5 bg-primary text-on-primary rounded-full font-label-sm text-label-sm uppercase tracking-widest hover:bg-primary/90 transition-colors"
        >
          Back to Store
        </a>
      </div>
    </main>
  );
}

function PlusIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
