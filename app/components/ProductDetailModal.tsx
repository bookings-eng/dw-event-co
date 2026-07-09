"use client";

import { useEffect, useState } from "react";
import { addToCart } from "@/lib/cart";
import { lineTotal, rentalDays } from "@/lib/pricing";
import type { ProductAvailability } from "@/lib/products";
import ProductIcon from "./ProductIcon";

function formatPrice(price: number): string {
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
}

export default function ProductDetailModal({
  product,
  linenProduct,
  startDate,
  endDate,
  open,
  onClose,
}: {
  product: ProductAvailability;
  linenProduct: ProductAvailability | null;
  startDate: string;
  endDate: string;
  open: boolean;
  onClose: () => void;
}) {
  const [qty, setQty] = useState(1);
  const [linenChecked, setLinenChecked] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const unavailable = product.available <= 0;
  const days = rentalDays(startDate, endDate);
  const unitTotal = lineTotal(product.price, 1, days);
  const showLinenOption = product.tableCount > 0 && !!linenProduct;

  function handleAdd() {
    addToCart(
      { id: product.id, name: product.name, price: product.price, tag: product.tag },
      qty,
      startDate,
      endDate
    );
    if (linenChecked && linenProduct && product.tableCount > 0) {
      addToCart(
        {
          id: linenProduct.id,
          name: linenProduct.name,
          price: linenProduct.price,
          tag: linenProduct.tag,
        },
        product.tableCount * qty,
        startDate,
        endDate
      );
    }
    setAdded(true);
    setQty(1);
    setLinenChecked(false);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex aspect-[16/9] items-center justify-center bg-brand/10">
          <ProductIcon name={product.name} className="h-24 w-24 text-brand/60" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-foreground/60 shadow-sm transition-colors hover:bg-white hover:text-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
            >
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                unavailable ? "bg-black/5 text-foreground/50" : "bg-brand/10 text-brand"
              }`}
            >
              {unavailable ? "Unavailable" : `${product.available} available`}
            </span>
          </div>

          {product.description && (
            <p className="mt-3 text-sm leading-relaxed text-foreground/70">
              {product.description}
            </p>
          )}

          <div className="mt-4">
            <span className="text-2xl font-bold text-foreground">
              {formatPrice(unitTotal)}
            </span>
            <span className="text-sm font-normal text-foreground/50">
              {days > 1 ? ` for ${days} days` : " / day"}
            </span>
            {days > 1 && (
              <p className="text-xs text-foreground/40">
                {formatPrice(product.price)} day 1, 50% off each extra day
              </p>
            )}
          </div>

          {showLinenOption && (
            <label className="mt-4 flex items-center gap-3 rounded-lg border border-black/10 p-3 text-sm text-foreground">
              <input
                type="checkbox"
                checked={linenChecked}
                onChange={(e) => setLinenChecked(e.target.checked)}
                className="h-4 w-4 accent-brand"
              />
              Add table linen (+$3 per table)
            </label>
          )}

          {unavailable ? (
            <button
              type="button"
              disabled
              className="mt-5 w-full cursor-not-allowed rounded-full bg-black/5 px-4 py-3 text-sm font-semibold text-foreground/40"
            >
              Unavailable
            </button>
          ) : (
            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center rounded-full border border-black/10">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="px-3 py-2 text-foreground/70 transition-colors hover:text-foreground"
                >
                  &minus;
                </button>
                <span className="w-6 text-center text-sm font-medium">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.available, q + 1))}
                  aria-label="Increase quantity"
                  className="px-3 py-2 text-foreground/70 transition-colors hover:text-foreground"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                {added ? "Added ✓" : "Add to Cart"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
