import Link from "next/link";
import { finalizeBookingPayment } from "@/lib/bookings";
import { formatDateLong } from "@/lib/date";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import Header from "../components/Header";
import ClearCartOnLoad from "./ClearCartOnLoad";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ booking_id?: string; session_id?: string }>;
}) {
  const params = await searchParams;
  const bookingId = params.booking_id;

  if (!bookingId) {
    return (
      <NotFoundShell message="We couldn't find that booking. If you just paid, check your email for a confirmation." />
    );
  }

  const supabase = getSupabaseAdmin();
  let { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return (
      <NotFoundShell message="We couldn't find that booking. If you just paid, check your email for a confirmation." />
    );
  }

  // Self-healing fallback: if the Stripe webhook hasn't landed yet (or
  // isn't configured), check the session directly so the customer still
  // sees a paid confirmation instead of "pending".
  if (booking.payment_status === "pending" && params.session_id) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(params.session_id);
      if (session.payment_status === "paid") {
        const updated = await finalizeBookingPayment(bookingId, session);
        if (updated) booking = updated;
      }
    } catch {
      // Stripe not configured or session lookup failed — fall through and
      // show whatever we have.
    }
  }

  const { data: items } = await supabase
    .from("booking_items")
    .select("quantity, unit_price, total_price, product:products(name)")
    .eq("booking_id", bookingId);

  const stillPending = booking.payment_status === "pending";

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-4 py-16 text-center">
        {stillPending ? (
          <>
            <h1 className="text-3xl font-bold text-foreground">Confirming your payment…</h1>
            <p className="mt-3 text-foreground/60">
              This can take a few moments. Refresh this page shortly, or check your email — we&rsquo;ll
              send a confirmation as soon as your payment is processed.
            </p>
          </>
        ) : (
          <>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-8 w-8"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              We&rsquo;ll see you on {formatDateLong(booking.event_date)}!
            </h1>
            <p className="mt-2 text-foreground/60">Your DW Event Co booking is confirmed.</p>
            <ClearCartOnLoad />

            <div className="mt-8 w-full rounded-2xl bg-white p-6 text-left shadow-sm">
              <dl className="flex flex-col gap-3 text-sm">
                <Row label="Booking ID" value={booking.id} />
                <Row label="Event date" value={formatDateLong(booking.event_date)} />
                <Row
                  label="Items"
                  value={(items ?? [])
                    .map((item) => {
                      const product = Array.isArray(item.product)
                        ? item.product[0]
                        : item.product;
                      return `${item.quantity}x ${product?.name ?? "Item"}`;
                    })
                    .join(", ")}
                />
                <Row
                  label="Delivery address"
                  value={`${booking.delivery_address}, ${booking.delivery_city}, ${booking.delivery_state} ${booking.delivery_zip}`}
                />
                <Row
                  label="Amount paid"
                  value={`$${Number(booking.amount_paid).toFixed(2)} (${
                    booking.payment_type === "deposit" ? "30% deposit" : "paid in full"
                  })`}
                />
                <Row label="Total booking value" value={`$${Number(booking.total_amount).toFixed(2)}`} />
              </dl>
            </div>
          </>
        )}

        <p className="mt-8 text-sm text-foreground/60">
          Questions? Reach us at{" "}
          <a href="mailto:bookings@dweventco.com" className="text-brand underline">
            bookings@dweventco.com
          </a>{" "}
          or{" "}
          <a href="tel:6824786430" className="text-brand underline">
            682-478-6430
          </a>
          .
        </p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Back to Home
        </Link>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-black/5 pb-3 last:border-0 last:pb-0 sm:flex-row sm:justify-between">
      <dt className="text-foreground/50">{label}</dt>
      <dd className="font-medium text-foreground sm:text-right">{value}</dd>
    </div>
  );
}

function NotFoundShell({ message }: { message: string }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Booking not found</h1>
        <p className="text-foreground/60">{message}</p>
        <Link
          href="/"
          className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Back to Home
        </Link>
      </main>
    </div>
  );
}
