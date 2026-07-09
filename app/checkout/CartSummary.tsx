"use client";

import type { Cart } from "@/lib/cart";
import { DELIVERY_FEE } from "@/lib/constants";
import { formatRangeLabel } from "@/lib/date";
import { lineTotal } from "@/lib/pricing";

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
}: {
  cart: Cart;
  days: number;
  subtotal: number;
  deliveryConfirmed: boolean;
  availabilityById: Map<string, number> | null;
  onRemove: (productId: string) => void;
}) {
  const total = subtotal + (deliveryConfirmed ? DELIVERY_FEE : 0);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-1 text-lg font-bold text-foreground">Your Cart</h2>
      {cart.startDate && cart.endDate && (
        <p className="mb-4 text-sm text-foreground/60">
          {formatRangeLabel(cart.startDate, cart.endDate)}
        </p>
      )}
      <ul className="flex flex-col gap-4">
        {cart.items.map((item) => {
          const available = availabilityById?.get(item.productId);
          const insufficient = available !== undefined && item.quantity > available;
          return (
            <li key={item.productId} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <p className="font-medium text-foreground">
                  {item.quantity}x {item.name}
                </p>
                {insufficient && (
                  <p className="text-xs font-medium text-red-600">
                    Only {available} available for these dates
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(item.productId)}
                  className="text-xs text-foreground/40 underline transition-colors hover:text-foreground/70"
                >
                  Remove
                </button>
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
  );
}
