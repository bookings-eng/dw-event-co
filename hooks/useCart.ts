"use client";

import { useSyncExternalStore } from "react";
import { CART_EVENT, getCart, type Cart } from "@/lib/cart";

function subscribe(callback: () => void) {
  window.addEventListener(CART_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CART_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useCart(): Cart {
  return useSyncExternalStore(subscribe, getCart, getCart);
}
