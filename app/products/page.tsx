import { todayKey } from "@/lib/date";
import { getProductsForRange } from "@/lib/products";
import ProductsClient from "./ProductsClient";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; date?: string }>;
}) {
  const params = await searchParams;
  const today = todayKey();

  const start =
    params.start && DATE_RE.test(params.start)
      ? params.start
      : params.date && DATE_RE.test(params.date)
        ? params.date
        : today;
  let end = params.end && DATE_RE.test(params.end) ? params.end : start;
  if (end < start) end = start;

  const groups = await getProductsForRange(start, end);

  return <ProductsClient initialStart={start} initialEnd={end} initialGroups={groups} />;
}
