"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProductsBanner from "./ProductsBanner";
import ProductCard from "../components/ProductCard";
import { useCart } from "@/hooks/useCart";
import { cartCount, cartDays, cartSubtotal } from "@/lib/cart";
import type { ProductGroups, ProductTag } from "@/lib/products";

const SECTION_ORDER: ProductTag[] = ["packages", "individual", "kids"];
const SECTION_LABELS: Record<ProductTag, string> = {
  packages: "Bundles",
  individual: "Individual Items",
  kids: "Kids Collection",
};

export default function ProductsClient({
  initialStart,
  initialEnd,
  initialGroups,
}: {
  initialStart: string | null;
  initialEnd: string | null;
  initialGroups: ProductGroups;
}) {
  const [start, setStart] = useState<string | null>(initialStart);
  const [end, setEnd] = useState<string | null>(initialEnd);
  const [groups, setGroups] = useState(initialGroups);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const cart = useCart();

  const hasDate = start !== null && end !== null;

  const handleChangeRange = useCallback(
    async (newStart: string, newEnd: string) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/availability?start=${newStart}&end=${newEnd}`
        );
        if (!res.ok) throw new Error("Failed to load availability");
        const data = await res.json();
        setGroups(data.groups);
        setStart(newStart);
        setEnd(newEnd);
        router.replace(`/products?start=${newStart}&end=${newEnd}`, {
          scroll: false,
        });
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const linenProduct = useMemo(() => {
    const all = [...groups.packages, ...groups.individual, ...groups.kids];
    return all.find((p) => p.type === "addon") ?? null;
  }, [groups]);

  // Addon-type products (e.g. Table Linen) are purchasable only as an
  // add-on from a table's detail modal, not browsable as their own card —
  // but they must stay in `groups`/`linenProduct` above so that add-on
  // flow can still look them up and add them to the cart.
  const displayGroups = useMemo(
    () => ({
      ...groups,
      individual: groups.individual.filter((p) => p.type !== "addon"),
    }),
    [groups]
  );

  const count = cartCount(cart);
  const days = cartDays(cart);
  const subtotal = cartSubtotal(cart);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <ProductsBanner
        start={start}
        end={end}
        hasDate={hasDate}
        onChangeRange={handleChangeRange}
      />
      <div className="products-backdrop relative flex-1">
        <main
          className={`relative mx-auto w-full max-w-6xl px-4 py-10 transition-opacity sm:px-6 ${
            loading ? "opacity-50" : ""
          }`}
        >
          {SECTION_ORDER.map((tag) =>
            displayGroups[tag].length > 0 ? (
              <section key={tag} className="mb-12 last:mb-0">
                <h2 className="mb-5 text-2xl font-bold text-foreground">
                  {SECTION_LABELS[tag]}
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {displayGroups[tag].map((product) => (
                    <ProductCard
                      key={`${tag}-${product.id}`}
                      product={product}
                      startDate={start}
                      endDate={end}
                      hasDate={hasDate}
                      onDateChosen={handleChangeRange}
                      linenProduct={linenProduct}
                    />
                  ))}
                </div>
              </section>
            ) : null
          )}
        </main>
      </div>
      {count > 0 && (
        <div className="sticky bottom-0 z-30 border-t border-black/5 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <span className="text-sm font-medium text-foreground">
              {count} item{count === 1 ? "" : "s"} &middot; {days} day
              {days === 1 ? "" : "s"} &middot; ${subtotal.toFixed(2)}
            </span>
            <a
              href="/checkout"
              className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Checkout
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
