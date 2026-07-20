import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { formatDateLong } from "@/lib/date";
import Header from "../../../components/Header";
import AdminLoginForm from "../../AdminLoginForm";
import CopyAcceptanceRecord from "./CopyAcceptanceRecord";

export const metadata: Metadata = {
  title: "Booking",
  robots: { index: false, follow: false },
};

function formatAcceptedAt(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Chicago",
    timeZoneName: "short",
  });
}

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: booking } = await supabase.from("bookings").select("*").eq("id", id).single();
  if (!booking) notFound();

  const { data: items } = await supabase
    .from("booking_items")
    .select("quantity, unit_price, total_price, product:products(name)")
    .eq("booking_id", id);

  const itemRows = (items ?? []).map((item) => {
    const product = Array.isArray(item.product) ? item.product[0] : item.product;
    return { ...item, productName: product?.name ?? "Item" };
  });

  const acceptanceRecordText = booking.agreement_accepted_at
    ? [
        `Booking: ${booking.id}`,
        `Agreement version: ${booking.agreement_version ?? "—"}`,
        `Accepted at: ${formatAcceptedAt(booking.agreement_accepted_at)}`,
        `IP address: ${booking.agreement_accepted_ip ?? "—"}`,
      ].join("\n")
    : null;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <Link href="/admin" className="text-sm text-foreground/60 hover:text-foreground">
          ← Back to bookings
        </Link>

        <h1 className="mt-4 mb-1 text-2xl font-bold text-foreground">
          {booking.customer_name}
        </h1>
        <p className="mb-6 text-sm text-foreground/60">{formatDateLong(booking.event_date)}</p>

        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground/50">
            Booking
          </h2>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-foreground/50">Email</dt>
              <dd className="text-foreground">{booking.customer_email}</dd>
            </div>
            <div>
              <dt className="text-foreground/50">Phone</dt>
              <dd className="text-foreground">{booking.customer_phone}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-foreground/50">Delivery address</dt>
              <dd className="text-foreground">
                {booking.delivery_address}, {booking.delivery_city}, {booking.delivery_state}{" "}
                {booking.delivery_zip}
              </dd>
            </div>
            <div>
              <dt className="text-foreground/50">Total paid</dt>
              <dd className="text-foreground">${Number(booking.amount_paid ?? 0).toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-foreground/50">Payment status</dt>
              <dd className="text-foreground">{booking.payment_status}</dd>
            </div>
          </dl>

          <h3 className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">
            Items
          </h3>
          <ul className="text-sm text-foreground/80">
            {itemRows.map((item, i) => (
              <li key={i}>
                {item.quantity}x {item.productName} — ${Number(item.total_price).toFixed(2)}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
              Acceptance Record
            </h2>
            {acceptanceRecordText && <CopyAcceptanceRecord text={acceptanceRecordText} />}
          </div>

          {acceptanceRecordText ? (
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-foreground/50">Version</dt>
                <dd className="font-mono text-foreground">{booking.agreement_version}</dd>
              </div>
              <div>
                <dt className="text-foreground/50">Accepted at</dt>
                <dd className="font-mono text-foreground">
                  {formatAcceptedAt(booking.agreement_accepted_at)}
                </dd>
              </div>
              <div>
                <dt className="text-foreground/50">IP address</dt>
                <dd className="font-mono text-foreground">
                  {booking.agreement_accepted_ip ?? "—"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-foreground/60">
              No acceptance record on this booking (created before the agreement checkbox shipped).
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
