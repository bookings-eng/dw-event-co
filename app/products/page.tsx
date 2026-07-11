import type { Metadata } from "next";
import { getProductsCatalog, getProductsForRange } from "@/lib/products";
import ProductsClient from "./ProductsClient";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const metadata: Metadata = {
  title: "Table & Chair Rentals in Keller, Southlake & Fort Worth, TX",
  description:
    "Browse party and event rentals — tables, chairs, bundles, and kids' furniture — available for delivery to Keller, Southlake, Colleyville, Trophy Club, Fort Worth, and nearby DFW areas. Check live availability and book online.",
  alternates: {
    canonical: "/products",
  },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; date?: string }>;
}) {
  const params = await searchParams;

  const start =
    params.start && DATE_RE.test(params.start)
      ? params.start
      : params.date && DATE_RE.test(params.date)
        ? params.date
        : null;

  if (!start) {
    const groups = await getProductsCatalog();
    return <ProductsClient initialStart={null} initialEnd={null} initialGroups={groups} />;
  }

  const end = params.end && DATE_RE.test(params.end) ? params.end : start;
  const validEnd = end < start ? start : end;

  const groups = await getProductsForRange(start, validEnd);
  return <ProductsClient initialStart={start} initialEnd={validEnd} initialGroups={groups} />;
}
