"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { multiplyMoney, sumMoney } from "@/lib/money";
import { getSupabase } from "@/lib/supabase";
import type { Product, Promotion } from "@/lib/types";

type PromotionDraft = Omit<
  Promotion,
  "id" | "created_at" | "updated_at" | "items"
> & {
  id?: string;
  starts_local: string;
  ends_local: string;
};

type PromotionRow = Promotion & {
  promotion_items: Array<{ product_id: string; quantity: number }>;
};

const emptyDraft: PromotionDraft = {
  name: "",
  slug: "",
  promotion_type: "fixed_bundle",
  fixed_price: 0,
  is_active: false,
  starts_at: null,
  ends_at: null,
  starts_local: "",
  ends_local: "",
  show_on_landing: false,
  show_in_store: true,
  public_badge: "MEMBER OFFER",
  public_headline: "",
  public_description: "",
  member_headline: "",
  member_description: "",
};

function localInputValue(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "The promotion could not be saved.";
}

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<PromotionRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<PromotionDraft | null>(null);
  const [draftItems, setDraftItems] = useState<
    Array<{ product_id: string; quantity: number }>
  >([]);
  const [saving, setSaving] = useState(false);
  const [togglingPromotionId, setTogglingPromotionId] = useState<string | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const [
        { data: promotionData, error: promotionError },
        { data: productData, error: productError },
      ] = await Promise.all([
        supabase
          .from("promotions")
          .select("*, promotion_items(product_id, quantity)")
          .order("created_at", { ascending: false }),
        supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);
      if (promotionError) throw promotionError;
      if (productError) throw productError;
      setPromotions((promotionData ?? []) as PromotionRow[]);
      setProducts((productData ?? []) as Product[]);
    } catch (loadError) {
      console.error("Error loading promotions:", loadError);
      setError("Promotions could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const openCreate = () => {
    setDraft({ ...emptyDraft });
    setDraftItems([{ product_id: "", quantity: 1 }]);
  };
  const openEdit = (promotion: PromotionRow) => {
    setDraft({
      ...promotion,
      starts_local: localInputValue(promotion.starts_at),
      ends_local: localInputValue(promotion.ends_at),
    });
    const configuredItems = promotion.promotion_items ?? [];
    setDraftItems(
      configuredItems.length
        ? configuredItems.map((item) => ({ ...item }))
        : [{ product_id: "", quantity: 1 }],
    );
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    setError(null);
    const validItems = draftItems.filter((item) => item.product_id);
    if (!draft.name.trim() || !draft.slug.trim())
      return setError("Name and slug are required.");
    if (
      !Number.isFinite(Number(draft.fixed_price)) ||
      Number(draft.fixed_price) <= 0
    )
      return setError("Enter a positive bundle price.");
    if (
      !validItems.length ||
      validItems.some(
        (item) =>
          !Number.isInteger(Number(item.quantity)) ||
          Number(item.quantity) < 1 ||
          Number(item.quantity) > 99,
      )
    )
      return setError(
        "Add at least one product with a whole quantity from 1 to 99.",
      );
    if (
      new Set(validItems.map((item) => item.product_id)).size !==
      validItems.length
    )
      return setError("Each product may appear only once.");
    if (
      draft.starts_local &&
      draft.ends_local &&
      new Date(draft.ends_local) <= new Date(draft.starts_local)
    )
      return setError("End time must be after start time.");

    setSaving(true);
    try {
      const { error: saveError } = await getSupabase().rpc("save_promotion", {
        p_id: draft.id ?? null,
        p_name: draft.name,
        p_slug: draft.slug,
        p_promotion_type: "fixed_bundle",
        p_fixed_price: Number(draft.fixed_price),
        p_is_active: draft.is_active,
        p_starts_at: draft.starts_local
          ? new Date(draft.starts_local).toISOString()
          : null,
        p_ends_at: draft.ends_local
          ? new Date(draft.ends_local).toISOString()
          : null,
        p_show_on_landing: draft.show_on_landing,
        p_show_in_store: draft.show_in_store,
        p_public_badge: draft.public_badge,
        p_public_headline: draft.public_headline,
        p_public_description: draft.public_description,
        p_member_headline: draft.member_headline,
        p_member_description: draft.member_description,
        p_items: validItems.map((item) => ({
          product_id: item.product_id,
          quantity: Number(item.quantity),
        })),
      });
      if (saveError) throw saveError;
      setDraft(null);
      await load();
    } catch (saveError) {
      console.error("Error saving promotion:", saveError);
      setError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (promotion: PromotionRow) => {
    setError(null);
    setTogglingPromotionId(promotion.id);
    try {
      const { error: toggleError } = await getSupabase().rpc(
        "set_promotion_active",
        {
          p_promotion_id: promotion.id,
          p_active: !promotion.is_active,
        },
      );
      if (toggleError) throw toggleError;
      await load();
    } catch (toggleError) {
      setError(errorMessage(toggleError));
    } finally {
      setTogglingPromotionId(null);
    }
  };

  const remove = async (promotion: PromotionRow) => {
    if (
      !window.confirm(
        `Delete ${promotion.name}? Used promotions must be deactivated instead.`,
      )
    )
      return;
    try {
      const { error: deleteError } = await getSupabase().rpc(
        "delete_promotion",
        { p_id: promotion.id },
      );
      if (deleteError) throw deleteError;
      await load();
    } catch (deleteError) {
      setError(errorMessage(deleteError));
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-label-sm text-[10px] uppercase tracking-widest text-secondary font-bold">
            Offer Management
          </span>
          <h2 className="font-headline-md text-xl sm:text-headline-md text-primary">
            Promotions
          </h2>
          <p className="font-body-sm text-on-surface-variant">
            Create fixed-price bundles for approved members.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-on-primary rounded-xl font-label-sm uppercase tracking-wider font-bold"
        >
          <Plus className="w-4 h-4" /> New Promotion
        </button>
      </div>
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-error/10 border border-error/20 text-error font-body-sm"
        >
          {error}
        </div>
      )}
      {loading ? (
        <div className="p-8 text-center bg-surface rounded-2xl border border-outline-variant text-on-surface-variant">
          Loading promotions…
        </div>
      ) : promotions.length === 0 ? (
        <div className="p-8 text-center bg-surface rounded-2xl border border-outline-variant text-on-surface-variant">
          No promotions created yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {promotions.map((promotion) => {
            const regularTotal = sumMoney(
              ...promotion.promotion_items.map((item) =>
                multiplyMoney(
                  Number(productById.get(item.product_id)?.price ?? 0),
                  item.quantity,
                ),
              ),
            );
            const schedule =
              promotion.starts_at || promotion.ends_at
                ? `${promotion.starts_at ? new Date(promotion.starts_at).toLocaleString() : "Now"} → ${promotion.ends_at ? new Date(promotion.ends_at).toLocaleString() : "No end"}`
                : "Always available while active";
            return (
              <article
                key={promotion.id}
                className="bg-surface rounded-2xl border border-outline-variant p-5 botanical-shadow space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-secondary" />
                      <h3 className="font-headline-sm text-primary">
                        {promotion.name}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-surface-container-high text-on-surface-variant">
                        {promotion.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-on-surface-variant mt-1">
                      /{promotion.slug} · {schedule}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(promotion)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-outline-variant text-primary text-xs font-bold"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(promotion)}
                      disabled={togglingPromotionId === promotion.id}
                      className="px-3 py-2 rounded-lg bg-secondary-container text-on-secondary-container text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {togglingPromotionId === promotion.id
                        ? "Saving..."
                        : promotion.is_active
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(promotion)}
                      className="p-2 rounded-lg bg-error/10 text-error"
                      aria-label={`Delete ${promotion.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="block text-xs text-on-surface-variant">
                      Bundle price
                    </span>
                    <strong className="font-mono text-primary">
                      {formatNaira(promotion.fixed_price)}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant">
                      Reference total
                    </span>
                    <strong className="font-mono text-primary">
                      {formatNaira(regularTotal)}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-xs text-on-surface-variant">
                      Visibility
                    </span>
                    <strong className="font-mono text-primary">
                      {promotion.show_on_landing ? "Landing" : ""}
                      {promotion.show_on_landing && promotion.show_in_store
                        ? " · "
                        : ""}
                      {promotion.show_in_store ? "Store" : "Hidden"}
                    </strong>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {promotion.promotion_items.map((item) => (
                    <span
                      key={item.product_id}
                      className="px-3 py-1.5 rounded-full bg-surface-container-low text-xs text-on-surface"
                    >
                      {item.quantity} ×{" "}
                      {productById.get(item.product_id)?.name ??
                        "Unknown product"}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
      {draft && (
        <PromotionForm
          draft={draft}
          items={draftItems}
          products={products}
          productById={productById}
          saving={saving}
          setDraft={setDraft}
          setItems={setDraftItems}
          onClose={() => setDraft(null)}
          onSubmit={save}
        />
      )}
    </div>
  );
}

function PromotionForm({
  draft,
  items,
  products,
  productById,
  saving,
  setDraft,
  setItems,
  onClose,
  onSubmit,
}: {
  draft: PromotionDraft;
  items: Array<{ product_id: string; quantity: number }>;
  products: Product[];
  productById: Map<string, Product>;
  saving: boolean;
  setDraft: React.Dispatch<React.SetStateAction<PromotionDraft | null>>;
  setItems: React.Dispatch<
    React.SetStateAction<Array<{ product_id: string; quantity: number }>>
  >;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  const regularTotal = sumMoney(
    ...items.map((item) =>
      multiplyMoney(
        Number(productById.get(item.product_id)?.price ?? 0),
        Number(item.quantity || 0),
      ),
    ),
  );
  const update = (
    field: keyof PromotionDraft,
    value: string | number | boolean,
  ) =>
    setDraft((current) => (current ? { ...current, [field]: value } : current));
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 overflow-y-auto">
      <div className="bg-surface rounded-t-3xl sm:rounded-2xl max-w-3xl w-full max-h-[94dvh] overflow-y-auto p-5 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-secondary font-bold">
              Promotion Management
            </span>
            <h3 className="font-headline-sm text-primary">
              {draft.id ? "Edit promotion" : "Create promotion"}
            </h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          <fieldset className="grid sm:grid-cols-2 gap-4">
            <legend className="col-span-full font-headline-sm text-primary mb-1">
              Basics
            </legend>
            <Field label="Promotion name">
              <input
                required
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </Field>
            <Field label="Slug">
              <input
                required
                pattern="[a-z0-9-]+"
                value={draft.slug}
                onChange={(e) => update("slug", e.target.value)}
              />
            </Field>
            <label className="sm:col-span-2 flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={draft.is_active}
                onChange={(e) => update("is_active", e.target.checked)}
              />{" "}
              Active now
            </label>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="font-headline-sm text-primary">
              Bundle products
            </legend>
            {items.map((item, index) => (
              <div
                key={`${index}-${item.product_id}`}
                className="grid grid-cols-[1fr_6rem_auto] gap-2 items-end"
              >
                <Field label={`Product ${index + 1}`}>
                  <select
                    required
                    value={item.product_id}
                    onChange={(e) =>
                      setItems((current) =>
                        current.map((entry, i) =>
                          i === index
                            ? { ...entry, product_id: e.target.value }
                            : entry,
                        ),
                      )
                    }
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                        disabled={items.some(
                          (entry, i) =>
                            i !== index && entry.product_id === product.id,
                        )}
                      >
                        {product.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Quantity">
                  <input
                    required
                    type="number"
                    min="1"
                    max="99"
                    step="1"
                    value={item.quantity}
                    onChange={(e) =>
                      setItems((current) =>
                        current.map((entry, i) =>
                          i === index
                            ? { ...entry, quantity: Number(e.target.value) }
                            : entry,
                        ),
                      )
                    }
                  />
                </Field>
                <button
                  type="button"
                  onClick={() =>
                    setItems((current) =>
                      current.length > 1
                        ? current.filter((_, i) => i !== index)
                        : current,
                    )
                  }
                  className="touch-target p-3 text-error"
                  aria-label="Remove product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setItems((current) => [
                  ...current,
                  { product_id: "", quantity: 1 },
                ])
              }
              className="text-sm font-bold text-primary underline"
            >
              + Add another product
            </button>
          </fieldset>
          <fieldset className="grid sm:grid-cols-2 gap-4">
            <legend className="col-span-full font-headline-sm text-primary mb-1">
              Pricing and schedule
            </legend>
            <Field label="Fixed bundle price (₦)">
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={draft.fixed_price}
                onChange={(e) => update("fixed_price", Number(e.target.value))}
              />
            </Field>
            <div className="space-y-1">
              <span className="block text-xs text-on-surface-variant">
                Regular combined product price
              </span>
              <strong className="font-mono text-primary">
                {formatNaira(regularTotal)}
              </strong>
              <p className="text-xs text-on-surface-variant">
                Preview only; the server reads current prices.
              </p>
            </div>
            <Field label="Starts at">
              <input
                type="datetime-local"
                value={draft.starts_local}
                onChange={(e) => update("starts_local", e.target.value)}
              />
            </Field>
            <Field label="Ends at">
              <input
                type="datetime-local"
                value={draft.ends_local}
                onChange={(e) => update("ends_local", e.target.value)}
              />
            </Field>
          </fieldset>
          <fieldset className="grid sm:grid-cols-2 gap-4">
            <legend className="col-span-full font-headline-sm text-primary mb-1">
              Visibility
            </legend>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={draft.show_on_landing}
                onChange={(e) => update("show_on_landing", e.target.checked)}
              />{" "}
              Show on landing page
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={draft.show_in_store}
                onChange={(e) => update("show_in_store", e.target.checked)}
              />{" "}
              Show in member Store
            </label>
          </fieldset>
          <fieldset className="grid gap-4">
            <legend className="font-headline-sm text-primary mb-1">
              Merchandising copy
            </legend>
            <Field label="Public badge">
              <input
                maxLength={40}
                value={draft.public_badge ?? ""}
                onChange={(e) => update("public_badge", e.target.value)}
              />
            </Field>
            <Field label="Public headline">
              <input
                maxLength={120}
                value={draft.public_headline ?? ""}
                onChange={(e) => update("public_headline", e.target.value)}
              />
            </Field>
            <Field label="Public description">
              <textarea
                maxLength={280}
                rows={3}
                value={draft.public_description ?? ""}
                onChange={(e) => update("public_description", e.target.value)}
              />
            </Field>
            <Field label="Member headline">
              <input
                maxLength={120}
                value={draft.member_headline ?? ""}
                onChange={(e) => update("member_headline", e.target.value)}
              />
            </Field>
            <Field label="Member description">
              <textarea
                maxLength={280}
                rows={3}
                value={draft.member_description ?? ""}
                onChange={(e) => update("member_description", e.target.value)}
              />
            </Field>
          </fieldset>
          <div className="flex justify-end gap-3 border-t border-outline-variant pt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl text-on-surface-variant"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-3 rounded-xl bg-primary text-on-primary font-bold disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save promotion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="block text-xs font-bold text-on-surface-variant">
        {label}
      </span>
      {
        <span className="block [&>input]:w-full [&>input]:min-h-11 [&>input]:p-3 [&>input]:rounded-lg [&>input]:border [&>input]:border-outline [&>input]:bg-surface [&>select]:w-full [&>select]:min-h-11 [&>select]:p-3 [&>select]:rounded-lg [&>select]:border [&>select]:border-outline [&>select]:bg-surface [&>textarea]:w-full [&>textarea]:p-3 [&>textarea]:rounded-lg [&>textarea]:border [&>textarea]:border-outline [&>textarea]:bg-surface">
          {children}
        </span>
      }
    </label>
  );
}
