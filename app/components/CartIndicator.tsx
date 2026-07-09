"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { cartCount } from "@/lib/cart";

export default function CartIndicator({ overlay = false }: { overlay?: boolean }) {
  const cart = useCart();
  const count = cartCount(cart);

  return (
    <Link
      href="/checkout"
      aria-label={`View cart${count > 0 ? `, ${count} items` : ""}`}
      className={`relative flex items-center justify-center rounded-full p-2 transition-colors ${
        overlay ? "text-white hover:bg-white/10" : "text-foreground hover:bg-black/5"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h1.5l2.4 12.6a1.5 1.5 0 001.48 1.4h8.44a1.5 1.5 0 001.48-1.24L20 8H6"
        />
        <circle cx="9.5" cy="20" r="1.25" fill="currentColor" stroke="none" />
        <circle cx="17" cy="20" r="1.25" fill="currentColor" stroke="none" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
