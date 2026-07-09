"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { lineTotal, rentalDays } from "@/lib/pricing";
import type { ProductAvailability } from "@/lib/products";
import ProductDetailModal from "./ProductDetailModal";
import ProductIcon from "./ProductIcon";

function formatPrice(price: number): string {
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
}

export default function ProductCard({
  product,
  startDate,
  endDate,
  linenProduct,
}: {
  product: ProductAvailability;
  startDate: string;
  endDate: string;
  linenProduct: ProductAvailability | null;
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const unavailable = product.available <= 0;
  const days = rentalDays(startDate, endDate);
  const unitTotal = lineTotal(product.price, 1, days);

  function handleAdd() {
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        tag: product.tag,
      },
      qty,
      startDate,
      endDate
    );
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 1500);
  }

  function openDetail() {
    setDetailOpen(true);
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={openDetail}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDetail();
          }
        }}
        className={`flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md ${
          unavailable ? "opacity-60" : ""
        }`}
      >
        <div className="flex aspect-[4/3] items-center justify-center bg-brand/10">
          <ProductIcon name={product.name} />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground">{product.name}</h3>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                unavailable ? "bg-black/5 text-foreground/50" : "bg-brand/10 text-brand"
              }`}
            >
              {unavailable ? "Unavailable" : `${product.available} available`}
            </span>
          </div>
          {product.description && (
            <p className="line-clamp-2 text-sm text-foreground/60">
              {product.description}
            </p>
          )}
          <div className="mt-auto pt-2">
            <span className="text-lg font-bold text-foreground">
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

          {unavailable ? (
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-full bg-black/5 px-4 py-2 text-sm font-semibold text-foreground/40"
            >
              Unavailable
            </button>
          ) : (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center rounded-full border border-black/10">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="px-3 py-1.5 text-foreground/70 transition-colors hover:text-foreground"
                >
                  &minus;
                </button>
                <span className="w-6 text-center text-sm font-medium">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.available, q + 1))}
                  aria-label="Increase quantity"
                  className="px-3 py-1.5 text-foreground/70 transition-colors hover:text-foreground"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                {added ? "Added ✓" : "Add to Cart"}
              </button>
            </div>
          )}
        </div>
      </div>
      <ProductDetailModal
        product={product}
        linenProduct={linenProduct}
        startDate={startDate}
        endDate={endDate}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}
