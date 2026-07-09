import { Resend } from "resend";
import twilio from "twilio";
import { formatDateLong } from "./date";

// Email clients fetch images from an absolute, publicly reachable URL — a
// local/relative path won't render. Points at the live production domain.
const SITE_URL = "https://dw-event-co.vercel.app";

export type BookingRow = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_date: string;
  pickup_date: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_zip: string;
  amount_paid: number;
  payment_type: string;
  total_amount: number;
};

export type BookingItemRow = {
  quantity: number;
  unit_price: number;
  total_price: number;
  product: { name: string } | { name: string }[] | null;
};

function productName(item: BookingItemRow): string {
  const product = Array.isArray(item.product) ? item.product[0] : item.product;
  return product?.name ?? "Item";
}

function itemsSummary(items: BookingItemRow[]): string {
  return items.map((item) => `${item.quantity}x ${productName(item)}`).join(", ");
}

function deliveryAddress(booking: BookingRow): string {
  return `${booking.delivery_address}, ${booking.delivery_city}, ${booking.delivery_state} ${booking.delivery_zip}`;
}

export async function sendBookingConfirmationEmail(
  booking: BookingRow,
  items: BookingItemRow[]
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping confirmation email.");
    return;
  }

  const resend = new Resend(apiKey);
  const eventDate = formatDateLong(booking.event_date);
  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <img src="${SITE_URL}/logo-black.png" alt="DW Event Co" width="200" height="99" style="display: block; margin-bottom: 16px;" />
      <p>Hi ${booking.customer_name},</p>
      <p>Your booking is confirmed! Here are the details:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 4px 12px 4px 0; color: #555;">Event date</td><td><strong>${eventDate}</strong></td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #555;">Items</td><td>${itemsSummary(items)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #555;">Delivery address</td><td>${deliveryAddress(booking)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #555;">Amount paid</td><td>$${Number(booking.amount_paid).toFixed(2)} (${booking.payment_type === "deposit" ? "30% deposit" : "paid in full"})</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #555;">Total booking value</td><td>$${Number(booking.total_amount).toFixed(2)}</td></tr>
      </table>
      <p style="font-size: 16px;">We'll see you on ${eventDate}!</p>
      <p style="color: #555; font-size: 14px;">Questions? Reach us at <a href="mailto:bookings@dweventco.com" style="color: #209d50;">bookings@dweventco.com</a> or 682-478-6430.</p>
    </div>
  `;

  await resend.emails.send({
    from: "DW Event Co <bookings@dweventco.com>",
    to: booking.customer_email,
    subject: "Your DW Event Co booking is confirmed!",
    html,
  });
}

export async function sendBookingSms(booking: BookingRow, items: BookingItemRow[]) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, YOUR_PHONE_NUMBER } =
    process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER || !YOUR_PHONE_NUMBER) {
    console.warn("Twilio environment variables not set — skipping booking SMS.");
    return;
  }

  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  const body = `New booking! ${booking.customer_name} — ${formatDateLong(booking.event_date)} — ${itemsSummary(items)} — $${Number(booking.amount_paid).toFixed(2)} paid. ${deliveryAddress(booking)}`;

  await client.messages.create({
    body,
    from: TWILIO_PHONE_NUMBER,
    to: YOUR_PHONE_NUMBER,
  });
}
