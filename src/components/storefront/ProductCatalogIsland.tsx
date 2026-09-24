"use client";
import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { accessState, isApproved } from "@/store/access";
import {
  getMemberCatalog,
  isMemberCatalogAuthorizationError,
} from "@/lib/products";
import { useHydrated } from "@/lib/useHydrated";
import { refreshMemberAccess } from "@/lib/memberAccess";
import { formatNaira } from "@/lib/utils";
import type { MemberCatalogProduct } from "@/lib/types";

interface ProductCatalogIslandProps {
  category: string;
}

type CatalogState = "idle" | "loading" | "loaded" | "empty" | "error";

export default function ProductCatalogIsland({
  category,
}: ProductCatalogIslandProps) {
  const isHydrated = useHydrated();
  const approved = useStore(isApproved);
  const access = useStore(accessState);
  const [products, setProducts] = useState<MemberCatalogProduct[]>([]);
  const [catalogState, setCatalogState] = useState<CatalogState>("idle");

  useEffect(() => {
    if (!isHydrated || !approved) {
      setProducts([]);
      setCatalogState("idle");
      return;
    }

    const handle = access.instagramHandle;
    const phone = access.phone;
    if (!handle || !phone) {
      setProducts([]);
      setCatalogState("idle");
      return;
    }

    let active = true;
    setProducts([]);
    setCatalogState("loading");

    getMemberCatalog(handle, phone, category)
      .then((result) => {
        if (!active) return;
        setProducts(result);
        setCatalogState(result.length > 0 ? "loaded" : "empty");
      })
      .catch(async (error: unknown) => {
        if (!active) return;

        setProducts([]);
        if (isMemberCatalogAuthorizationError(error)) {
          const refreshedStatus = await refreshMemberAccess(handle, phone);
          if (!active) return;
          setCatalogState(
            refreshedStatus === "pending" ||
              refreshedStatus === "rejected" ||
              refreshedStatus === "guest"
              ? "idle"
              : "error",
          );
          return;
        }

        setCatalogState("error");
      });

    return () => {
      active = false;
    };
  }, [access.instagramHandle, access.phone, approved, category, isHydrated]);

  if (!isHydrated || catalogState === "loading" || catalogState === "idle") {
    return (
      <div
        className="py-stack-lg text-center font-body-md text-body-md text-on-surface-variant"
        role="status"
        aria-live="polite"
      >
        Loading store…
      </div>
    );
  }

  if (catalogState === "error") {
    return (
      <div className="col-span-full py-20 text-center" role="status">
        <h2 className="font-headline-sm text-headline-sm text-primary mb-unit">
          Store unavailable
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          We could not load the store right now. Please try again later.
        </p>
      </div>
    );
  }

  if (catalogState === "empty") {
    return (
      <div className="col-span-full py-20 text-center">
        <h2 className="font-headline-sm text-headline-sm text-primary mb-unit">
          No tinctures available right now
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="font-body-md text-body-md text-on-surface-variant mb-8">
        {products.length} Tinctures
      </p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-gutter items-start">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}

function ProductCard({ product }: { product: MemberCatalogProduct }) {
  const productUrl = `/product/${product.slug}`;
  const availability =
    product.stock_status === "available"
      ? "Available"
      : product.stock_status === "low_stock"
        ? "Only a few left"
        : "Currently unavailable";
  const productDetails = [
    product.strength_mg == null ? null : `${product.strength_mg} mg`,
    product.bottle_size_ml == null ? null : `${product.bottle_size_ml} ml`,
  ]
    .filter(Boolean)
    .join(" / ");

  return (
    <a href={productUrl} className="group cursor-pointer block">
      <div className="relative bg-surface-container-low rounded-xl overflow-hidden mb-stack-md aspect-[3/4] flex items-center justify-center transition-transform duration-500 group-hover:-translate-y-2 botanical-shadow">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container-highest text-on-surface-variant">
            No Image
          </div>
        )}
      </div>
      <div className="text-center px-4">
        <h3 className="font-headline-sm text-headline-sm text-primary mb-unit">
          {product.name}
        </h3>
        <p className="font-body-lg text-body-lg text-primary">
          {formatNaira(product.price)}
        </p>
        {productDetails && (
          <p className="font-label-sm text-label-sm text-secondary mt-1">
            {productDetails}
          </p>
        )}
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
          {availability}
        </p>
        <span className="font-label-sm text-label-sm text-primary mt-stack-sm inline-block underline underline-offset-4">
          View product details
        </span>
      </div>
    </a>
  );
}
