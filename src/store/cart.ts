import { atom, computed } from 'nanostores';
import { accessState } from './access';

export type CartItem = {
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
};

const CART_STORAGE_KEY = 'botanica_cart_items';

function getInitialCart(): CartItem[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore storage parse errors
    }
  }
  return [];
}

export const cartItems = atom<CartItem[]>(getInitialCart());

if (typeof window !== 'undefined') {
  cartItems.subscribe((items) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write errors
    }
  });
}

export const addItem = (item: CartItem): boolean => {
  const access = accessState.get();
  if (access.status !== 'approved') {
    return false;
  }

  const current = cartItems.get();
  const existing = current.find((i) => i.id === item.id);
  if (existing) {
    cartItems.set(
      current.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
      )
    );
  } else {
    cartItems.set([...current, item]);
  }
  return true;
};

export const removeItem = (id: string) => {
  cartItems.set(cartItems.get().filter((i) => i.id !== id));
};

export const updateQuantity = (id: string, delta: number) => {
  cartItems.set(
    cartItems.get().map((i) => {
      if (i.id === id) {
        const newQ = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQ };
      }
      return i;
    })
  );
};

export const clearCart = () => cartItems.set([]);

export const cartCount = computed(cartItems, (items) =>
  items.reduce((acc, item) => acc + item.quantity, 0)
);

export const cartTotal = computed(cartItems, (items) =>
  items.reduce((acc, item) => acc + item.price * item.quantity, 0)
);
