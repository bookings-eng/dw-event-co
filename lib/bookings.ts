import type Stripe from "stripe";
import { getSupabaseAdmin } from "./supabase/admin";
import {
  sendBookingConfirmationEmail,
  sendOwnerNotificationEmail,
  type BookingItemRow,
} from "./notifications";

/**
 * Marks a booking paid and fires off customer/owner notifications. Safe to
 * call more than once for the same booking (e.g. once from the Stripe
 * webhook and once from the confirmation page as a fallback) — it's a
 * no-op if the booking is already marked paid.
 */
export async function finalizeBookingPayment(
  bookingId: string,
  session: Stripe.Checkout.Session
) {
  const supabase = getSupabaseAdmin();

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) return null;
  if (booking.payment_status !== "pending") return booking;

  const amountPaid = (session.amount_total ?? 0) / 100;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);
  const paymentStatus = booking.payment_type === "deposit" ? "deposit_paid" : "paid_in_full";

  const { data: updated, error: updateError } = await supabase
    .from("bookings")
    .update({
      payment_status: paymentStatus,
      amount_paid: amountPaid,
      stripe_payment_intent_id: paymentIntentId,
      stripe_session_id: session.id,
    })
    .eq("id", bookingId)
    .select()
    .single();

  if (updateError || !updated) {
    console.error("Failed to finalize booking payment", updateError);
    return null;
  }

  const { data: items } = await supabase
    .from("booking_items")
    .select("quantity, unit_price, total_price, product:products(name)")
    .eq("booking_id", bookingId);

  const bookingItems = (items ?? []) as BookingItemRow[];

  try {
    await sendBookingConfirmationEmail(updated, bookingItems);
  } catch (error) {
    console.error("Failed to send booking confirmation email", error);
  }

  // Own try/catch, sent after the customer email: a failure here must never
  // cost the customer their confirmation.
  try {
    await sendOwnerNotificationEmail(updated, bookingItems);
  } catch (error) {
    console.error("Failed to send owner notification email", error);
  }

  return updated;
}

/** Releases inventory held by a booking whose Stripe Checkout session expired unpaid. */
export async function cancelPendingBooking(bookingId: string) {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("payment_status", "pending");
}
