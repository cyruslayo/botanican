import { atom, computed } from "nanostores";
import { accessState } from "./access";
import type { PromotionItemSummary } from "@/lib/types";
import { multiplyMoney, fromMinorUnits, toMinorUnits } from "@/lib/money";

export interface ProductCartLine {
  line_type: "product";
  id: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
  strength_mg?: number | null;
  bottle_size_ml?: number | null;
  strain_name?: string | null;
  batch_code?: string | null;
}

export interface PromotionCartLine {
  line_type: "promotion";
  promotionId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  components: PromotionItemSummary[];
}

export type CartLine = ProductCartLine | PromotionCartLine;
export type LegacyProductCartLine = Omit<ProductCartLine, "line_type"> & {
  line_type?: "product";
};

const CART_STORAGE_KEY = "botanica_cart_items";
const MAX_LINE_QUANTITY = 99;

function isPositiveInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= MAX_LINE_QUANTITY
  );
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function normalizeProductItem(item: unknown): ProductCartLine | null {
  if (!item || typeof item !== "object") return null;
  const candidate = item as Partial<LegacyProductCartLine>;
  if (
    !isNonEmptyString(candidate.id) ||
    !isNonEmptyString(candidate.name) ||
    !isNonEmptyString(candidate.variant) ||
    typeof candidate.price !== "number" ||
    !Number.isFinite(candidate.price) ||
    !isPositiveInteger(candidate.quantity) ||
    typeof candidate.image !== "string"
  )
    return null;

  return {
    line_type: "product",
    id: candidate.id,
    name: candidate.name,
    variant: candidate.variant,
    price: fromMinorUnits(toMinorUnits(candidate.price)),
    quantity: candidate.quantity,
    image: candidate.image,
    strength_mg: candidate.strength_mg ?? null,
    bottle_size_ml: candidate.bottle_size_ml ?? null,
    strain_name: candidate.strain_name ?? null,
    batch_code: candidate.batch_code ?? null,
  };
}

function normalizePromotionItem(item: unknown): PromotionCartLine | null {
  if (!item || typeof item !== "object") return null;
  const candidate = item as Partial<PromotionCartLine>;
  if (
    candidate.line_type !== "promotion" ||
    typeof candidate.promotionId !== "string" ||
    !UUID_PATTERN.test(candidate.promotionId) ||
    !isNonEmptyString(candidate.slug) ||
    !isNonEmptyString(candidate.name) ||
    typeof candidate.price !== "number" ||
    !Number.isFinite(candidate.price) ||
    candidate.price <= 0 ||
    toMinorUnits(candidate.price) <= 0 ||
    !isPositiveInteger(candidate.quantity) ||
    typeof candidate.image !== "string" ||
    !Array.isArray(candidate.components) ||
    candidate.components.length === 0 ||
    candidate.components.some(
      (component) =>
        !component ||
        !isNonEmptyString(component.product_id) ||
        !UUID_PATTERN.test(component.product_id) ||
        !isNonEmptyString(component.slug) ||
        !isNonEmptyString(component.name) ||
        !isPositiveInteger(component.quantity) ||
        (component.strength_mg != null &&
          !isFiniteNonNegative(component.strength_mg)) ||
        (component.bottle_size_ml != null &&
          !isFiniteNonNegative(component.bottle_size_ml)),
    )
  )
    return null;

  return {
    line_type: "promotion",
    promotionId: candidate.promotionId,
    slug: candidate.slug.trim(),
    name: candidate.name.trim(),
    price: fromMinorUnits(toMinorUnits(candidate.price)),
    quantity: candidate.quantity,
    image: candidate.image,
    components: candidate.components,
  };
}

function normalizeCartItem(item: unknown): CartLine | null {
  if (
    item &&
    typeof item === "object" &&
    (item as { line_type?: string }).line_type === "promotion"
  ) {
    return normalizePromotionItem(item);
  }
  return normalizeProductItem(item);
}

function getInitialCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed
          .map(normalizeCartItem)
          .filter((item): item is CartLine => item !== null)
      : [];
  } catch {
    return [];
  }
}

export const cartItems = atom<CartLine[]>(getInitialCart());

if (typeof window !== "undefined") {
  cartItems.subscribe((items) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write errors.
    }
  });
}

export function getCartLineKey(item: CartLine): string {
  if (item.line_type === "promotion")
    return JSON.stringify(["promotion", item.promotionId]);
  return JSON.stringify([
    "product",
    item.id,
    item.variant ?? "",
    item.strength_mg ?? "",
    item.bottle_size_ml ?? "",
    item.strain_name ?? "",
    item.batch_code ?? "",
    item.price ?? "",
  ]);
}

export const addItem = (item: LegacyProductCartLine): boolean => {
  const access = accessState.get();
  if (access.status !== "approved") return false;
  const normalized = normalizeProductItem(item);
  if (!normalized) return false;
  addLine(normalized);
  return true;
};

export const addPromotion = (
  item: Omit<PromotionCartLine, "line_type">,
): boolean => {
  const access = accessState.get();
  if (access.status !== "approved") return false;
  const normalized = normalizePromotionItem({
    ...item,
    line_type: "promotion",
  });
  if (!normalized) return false;
  addLine(normalized);
  return true;
};

function addLine(item: CartLine): void {
  const current = cartItems.get();
  const itemKey = getCartLineKey(item);
  const existing = current.find((line) => getCartLineKey(line) === itemKey);
  if (existing) {
    cartItems.set(
      current.map((line) =>
        getCartLineKey(line) === itemKey
          ? {
              ...line,
              quantity: Math.min(
                MAX_LINE_QUANTITY,
                line.quantity + item.quantity,
              ),
            }
          : line,
      ),
    );
  } else {
    cartItems.set([...current, item]);
  }
}

export const removeItem = (lineKey: string) => {
  cartItems.set(
    cartItems.get().filter((item) => getCartLineKey(item) !== lineKey),
  );
};

export const updateQuantity = (lineKey: string, delta: number) => {
  if (!Number.isInteger(delta)) return;
  cartItems.set(
    cartItems.get().map((item) => {
      if (getCartLineKey(item) !== lineKey) return item;
      return {
        ...item,
        quantity: Math.min(
          MAX_LINE_QUANTITY,
          Math.max(1, item.quantity + delta),
        ),
      };
    }),
  );
};

export const clearCart = () => cartItems.set([]);

export const cartCount = computed(cartItems, (items) =>
  items.reduce((total, item) => total + item.quantity, 0),
);

export const cartTotal = computed(cartItems, (items) =>
  fromMinorUnits(
    items.reduce(
      (total, item) =>
        total + toMinorUnits(multiplyMoney(item.price, item.quantity)),
      0,
    ),
  ),
);
