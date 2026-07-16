"use client";

import type { Cart } from "@/lib/cart";
import { DELIVERY_FEE } from "@/lib/constants";
import { formatRangeLabel } from "@/lib/date";
import { lineTotal } from "@/lib/pricing";
import ProductIcon from "../components/ProductIcon";

function formatPrice(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default function CartSummary({
  cart,
  days,
  subtotal,
  deliveryConfirmed,
  availabilityById,
  onRemove,
  onUpdateQuantity,
}: {
  cart: Cart;
  days: number;
  subtotal: number;
  deliveryConfirmed: boolean;
  availabilityById: Map<string, number> | null;
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}) {
  const total = subtotal + (deliveryConfirmed ? DELIVERY_FEE : 0);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-brand/15">
      <div className="border-b border-brand/10 bg-brand/5 px-5 py-4 sm:px-6">
        <h2 className="text-xl font-bold text-foreground">Your Cart</h2>
        {cart.startDate && cart.endDate && (
          <p className="mt-1 text-sm text-foreground/60">
            <span className="font-semibold text-brand">Event date:</span>{" "}
            {formatRangeLabel(cart.startDate, cart.endDate)}
          </p>
        )}
      </div>
      <div className="p-5 sm:p-6">
        <ul className="flex flex-col gap-4">
          {cart.items.map((item) => {
            const available = availabilityById?.get(item.productId);
            const insufficient = available !== undefined && item.quantity > available;
            return (
              <li key={item.productId} className="flex items-start gap-3 text-sm">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                  <ProductIcon name={item.name} className="h-8 w-8 text-brand/60" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.name}</p>
                  {insufficient && (
                    <p className="text-xs font-medium text-red-600">
                      Only {available} available for these dates
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center rounded-full border border-black/10">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                        className="px-2.5 py-1 text-foreground/70 transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        &minus;
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                        disabled={available !== undefined && item.quantity >= available}
                        aria-label="Increase quantity"
                        className="px-2.5 py-1 text-foreground/70 transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(item.productId)}
                      className="text-xs text-foreground/40 underline transition-colors hover:text-foreground/70"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <span className="whitespace-nowrap font-medium text-foreground">
                  {formatPrice(lineTotal(item.price, item.quantity, days))}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-5 flex flex-col gap-2 border-t border-black/5 pt-4 text-sm">
          <div className="flex justify-between text-foreground/70">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-foreground/70">
            <span>Delivery</span>
            <span>{deliveryConfirmed ? formatPrice(DELIVERY_FEE) : "Calculated at checkout"}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-foreground">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
