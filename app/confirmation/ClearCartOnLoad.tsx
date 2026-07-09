"use client";

import { useEffect } from "react";

const CART_KEY = "dw-event-co-cart";

export default function ClearCartOnLoad() {
  useEffect(() => {
    window.localStorage.removeItem(CART_KEY);
  }, []);
  return null;
}
