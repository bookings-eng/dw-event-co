import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import Header from "../components/Header";
import AdminLoginForm from "./AdminLoginForm";
import AdminLogoutButton from "./AdminLogoutButton";
import AdminBookingsTable, { type AdminBooking } from "./AdminBookingsTable";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <div className="flex min-h-full flex-1 flex-col">
        <Header />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-20">
          <AdminLoginForm />
        </main>
      </div>
    );
  }

  const supabase = getSupabaseAdmin();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .order("event_date", { ascending: true });

  const bookingIds = (bookings ?? []).map((b) => b.id);
  const itemsByBooking = new Map<string, string[]>();

  if (bookingIds.length > 0) {
    const { data: items } = await supabase
      .from("booking_items")
      .select("booking_id, quantity, product:products(name)")
      .in("booking_id", bookingIds);

    for (const item of items ?? []) {
      const product = Array.isArray(item.product) ? item.product[0] : item.product;
      const label = `${item.quantity}x ${product?.name ?? "Item"}`;
      const list = itemsByBooking.get(item.booking_id) ?? [];
      list.push(label);
      itemsByBooking.set(item.booking_id, list);
    }
  }

  const rows: AdminBooking[] = (bookings ?? []).map((b) => ({
    id: b.id,
    eventDate: b.event_date,
    customerName: b.customer_name,
    customerPhone: b.customer_phone,
    itemsSummary: (itemsByBooking.get(b.id) ?? []).join(", ") || "—",
    deliveryAddress: `${b.delivery_address}, ${b.delivery_city}, ${b.delivery_state} ${b.delivery_zip}`,
    distanceMiles: b.distance_miles != null ? Number(b.distance_miles) : null,
    amountPaid: Number(b.amount_paid ?? 0),
    paymentStatus: b.payment_status,
    status: b.status,
  }));

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
          <AdminLogoutButton />
        </div>
        <AdminBookingsTable bookings={rows} />
      </main>
    </div>
  );
}
