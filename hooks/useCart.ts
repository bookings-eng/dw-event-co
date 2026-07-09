"use client";

import { useCallback, useEffect, useState } from "react";
import { CART_EVENT, getCart, type Cart } from "@/lib/cart";

export function useCart(): Cart {
  const [cart, setCart] = useState<Cart>({ startDate: null, endDate: null, items: [] });

  const refresh = useCallback(() => setCart(getCart()), []);

  useEffect(() => {
    refresh();
    window.addEventListener(CART_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CART_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return cart;
}
