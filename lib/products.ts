import { rangeDayKeys } from "./date";
import { getSupabaseAdmin } from "./supabase/admin";

export type ProductTag = "packages" | "individual" | "kids";

export type ProductAvailability = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  type: string;
  tag: string;
  imageUrl: string | null;
  stock: number;
  available: number;
  /** Tables per unit of this product (0 for non-table items). Drives the
   * table-linen add-on in the product detail modal. */
  tableCount: number;
};

export type ProductGroups = Record<ProductTag, ProductAvailability[]>;

/**
 * Availability for a date range: a product is only as available as its
 * tightest single day within the range, so a booking never oversells
 * inventory on any one day even if other days in the range are wide open.
 */
export async function getProductsForRange(
  startDate: string,
  endDate: string
): Promise<ProductGroups> {
  const supabase = getSupabaseAdmin();

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("name");

  if (productsError) {
    throw new Error(`Failed to load products: ${productsError.message}`);
  }

  // A booking occupies inventory on [event_date, pickup_date). It overlaps
  // the requested [startDate, endDate] range when it starts on or before
  // the range ends and its pickup happens after the range starts.
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("id, event_date, pickup_date")
    .lte("event_date", endDate)
    .gt("pickup_date", startDate)
    .neq("status", "cancelled");

  if (bookingsError) {
    throw new Error(`Failed to load bookings: ${bookingsError.message}`);
  }

  const bookingIds = (bookings ?? []).map((b) => b.id);
  const bookingById = new Map((bookings ?? []).map((b) => [b.id, b]));

  let items: { product_id: string; quantity: number; booking_id: string }[] = [];
  if (bookingIds.length > 0) {
    const { data: itemRows, error: itemsError } = await supabase
      .from("booking_items")
      .select("product_id, quantity, booking_id")
      .in("booking_id", bookingIds);

    if (itemsError) {
      throw new Error(`Failed to load booking items: ${itemsError.message}`);
    }
    items = itemRows ?? [];
  }

  const days = rangeDayKeys(startDate, endDate);
  const perDayBooked = new Map<string, Map<string, number>>();
  for (const day of days) perDayBooked.set(day, new Map());

  for (const item of items) {
    const booking = bookingById.get(item.booking_id);
    if (!booking) continue;
    for (const day of days) {
      if (day >= booking.event_date && day < booking.pickup_date) {
        const dayMap = perDayBooked.get(day)!;
        dayMap.set(
          item.product_id,
          (dayMap.get(item.product_id) ?? 0) + item.quantity
        );
      }
    }
  }

  const maxBookedPerProduct = new Map<string, number>();
  for (const day of days) {
    for (const [productId, qty] of perDayBooked.get(day)!) {
      maxBookedPerProduct.set(
        productId,
        Math.max(maxBookedPerProduct.get(productId) ?? 0, qty)
      );
    }
  }

  const groups: ProductGroups = { packages: [], individual: [], kids: [] };

  for (const p of products ?? []) {
    const available = Math.max(
      0,
      p.stock - (maxBookedPerProduct.get(p.id) ?? 0)
    );
    const product: ProductAvailability = {
      id: p.id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      type: p.type,
      tag: p.tag,
      imageUrl: p.image_url,
      stock: p.stock,
      available,
      tableCount: Number(p.table_count ?? 0),
    };

    // The "Bundles" section is every bundle-type product regardless of its
    // tag, and the "Kids" section is every kids-tagged product regardless
    // of type — so a kids bundle (type=bundle, tag=kids) intentionally
    // appears in both sections at once.
    if (product.type === "bundle") {
      groups.packages.push(product);
    }
    if (product.tag === "individual") {
      groups.individual.push(product);
    }
    if (product.tag === "kids") {
      groups.kids.push(product);
    }
  }

  return groups;
}
