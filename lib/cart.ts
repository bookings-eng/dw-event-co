import { lineTotal, rentalDays } from "./pricing";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  tag: string;
};

export type Cart = {
  startDate: string | null;
  endDate: string | null;
  items: CartItem[];
};

const CART_KEY = "dw-event-co-cart";
export const CART_EVENT = "dw-cart-change";

const EMPTY_CART: Cart = { startDate: null, endDate: null, items: [] };

// Cached by raw string so repeated calls return the same reference when
// localStorage hasn't changed — required by useSyncExternalStore, which
// treats any new reference as a store change and would otherwise loop.
let cachedRaw: string | null = null;
let cachedCart: Cart = EMPTY_CART;

export function getCart(): Cart {
  if (typeof window === "undefined") return EMPTY_CART;
  const raw = window.localStorage.getItem(CART_KEY);
  if (raw === cachedRaw) return cachedCart;
  cachedRaw = raw;
  if (!raw) return (cachedCart = EMPTY_CART);
  try {
    const parsed = JSON.parse(raw);
    cachedCart = !parsed || !Array.isArray(parsed.items) ? EMPTY_CART : (parsed as Cart);
  } catch {
    cachedCart = EMPTY_CART;
  }
  return cachedCart;
}

function saveCart(cart: Cart) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function addToCart(
  product: { id: string; name: string; price: number; tag: string },
  quantity: number,
  startDate: string,
  endDate: string
) {
  const cart = getCart();
  const items = cart.items.map((item) => ({ ...item }));
  const existing = items.find((item) => item.productId === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      tag: product.tag,
    });
  }

  saveCart({ startDate, endDate, items });
}

export function updateCartQuantity(productId: string, quantity: number) {
  const cart = getCart();
  const clamped = Math.max(1, quantity);
  saveCart({
    ...cart,
    items: cart.items.map((item) =>
      item.productId === productId ? { ...item, quantity: clamped } : item
    ),
  });
}

export function removeFromCart(productId: string) {
  const cart = getCart();
  saveCart({
    ...cart,
    items: cart.items.filter((item) => item.productId !== productId),
  });
}

export function cartCount(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartDays(cart: Cart): number {
  if (!cart.startDate || !cart.endDate) return 1;
  return rentalDays(cart.startDate, cart.endDate);
}

export function cartSubtotal(cart: Cart): number {
  const days = cartDays(cart);
  return cart.items.reduce(
    (sum, item) => sum + lineTotal(item.price, item.quantity, days),
    0
  );
}
