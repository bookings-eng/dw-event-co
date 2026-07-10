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
  /** Number available for a date range; null when no date range has been
   * chosen yet (catalog/browse-only mode — see getProductsCatalog). */
  available: number | null;
  /** Tables per unit of this product (0 for non-table items). Drives the
   * table-linen add-on in the product detail modal. */
  tableCount: number;
};

export type ProductGroups = Record<ProductTag, ProductAvailability[]>;

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  type: string;
  tag: string;
  image_url: string | null;
  stock: number;
  table_count?: number | null;
};

function mapProduct(p: ProductRow, available: number | null): ProductAvailability {
  return {
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
}

function groupProducts(mapped: ProductAvailability[]): ProductGroups {
  const groups: ProductGroups = { packages: [], individual: [], kids: [] };

  for (const product of mapped) {
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

/** Full catalog with no availability computed — used for browsing the
 * products page before a date has been chosen. */
export async function getProductsCatalog(): Promise<ProductGroups> {
  const supabase = getSupabaseAdmin();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("name");

  if (error) {
    throw new Error(`Failed to load products: ${error.message}`);
  }

  const mapped = (products ?? []).map((p) => mapProduct(p, null));
  return groupProducts(mapped);
}

/**
 * Availability for a date range: a product is only as available as its
 * tightest single day within the range, so a booking never oversells
 * inventory on any one day even if other days in the range are wide open.
 *
 * Bundles physically consume their component items' inventory (see
 * `bundle_components`), so a bundle's availability is capped by whatever
 * component stock remains after direct bookings AND other bundle bookings,
 * and booking a bundle directly reduces what's shown available for its
 * components too.
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
  // the range ends and its pickup happens after the range starts. Only
  // bookings that have actually been paid (deposit or in full) hold
  // inventory — an unpaid "pending" booking (mid-checkout, or abandoned)
  // must never permanently block availability.
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("id, event_date, pickup_date")
    .lte("event_date", endDate)
    .gt("pickup_date", startDate)
    .neq("status", "cancelled")
    .in("payment_status", ["deposit_paid", "paid_in_full"]);

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

  // Bundle -> component breakdown. Table doesn't exist until the migration
  // is run — degrade gracefully to "no linkage" rather than erroring, so
  // the products page still works before that migration lands.
  let bundleComponents: {
    bundle_product_id: string;
    component_product_id: string;
    quantity: number;
  }[] = [];
  const { data: bcRows, error: bcError } = await supabase
    .from("bundle_components")
    .select("bundle_product_id, component_product_id, quantity");
  if (bcError) {
    console.warn(
      `bundle_components table unavailable (${bcError.message}) — bundle/component availability linkage disabled until that migration is run.`
    );
  } else {
    bundleComponents = bcRows ?? [];
  }

  const componentsByBundle = new Map<string, { componentId: string; quantity: number }[]>();
  for (const row of bundleComponents) {
    const list = componentsByBundle.get(row.bundle_product_id) ?? [];
    list.push({ componentId: row.component_product_id, quantity: row.quantity });
    componentsByBundle.set(row.bundle_product_id, list);
  }

  const days = rangeDayKeys(startDate, endDate);

  // Direct bookings per day per product.
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

  // Total consumption per day per product: direct bookings, PLUS — for any
  // product that's a component of a bundle — the quantity pulled in by
  // bundle bookings that day. A bundle's own row here stays equal to its
  // direct bookings (nothing "contains" a bundle).
  const perDayTotalConsumed = new Map<string, Map<string, number>>();
  for (const day of days) {
    const directMap = perDayBooked.get(day)!;
    const totalMap = new Map(directMap);
    for (const [bundleId, bundleQty] of directMap) {
      const components = componentsByBundle.get(bundleId);
      if (!components) continue;
      for (const { componentId, quantity } of components) {
        totalMap.set(componentId, (totalMap.get(componentId) ?? 0) + bundleQty * quantity);
      }
    }
    perDayTotalConsumed.set(day, totalMap);
  }

  const maxTotalConsumed = new Map<string, number>();
  for (const day of days) {
    for (const [productId, qty] of perDayTotalConsumed.get(day)!) {
      maxTotalConsumed.set(
        productId,
        Math.max(maxTotalConsumed.get(productId) ?? 0, qty)
      );
    }
  }

  // Direct availability: this product's own stock minus everything that
  // consumes it (its own direct bookings, plus bundle bookings if it's a
  // component of one).
  const directAvailable = new Map<string, number>();
  for (const p of products ?? []) {
    directAvailable.set(
      p.id,
      Math.max(0, p.stock - (maxTotalConsumed.get(p.id) ?? 0))
    );
  }

  // Final availability: a bundle is additionally capped by how many more
  // bundles its remaining component stock could still assemble.
  const finalAvailable = new Map<string, number>();
  for (const p of products ?? []) {
    let avail = directAvailable.get(p.id) ?? 0;
    const components = componentsByBundle.get(p.id);
    if (components && components.length > 0) {
      for (const { componentId, quantity } of components) {
        const componentAvail = directAvailable.get(componentId) ?? 0;
        avail = Math.min(avail, Math.floor(componentAvail / quantity));
      }
    }
    finalAvailable.set(p.id, Math.max(0, avail));
  }

  const mapped = (products ?? []).map((p) => mapProduct(p, finalAvailable.get(p.id) ?? 0));
  return groupProducts(mapped);
}
