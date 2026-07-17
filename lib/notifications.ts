import { Resend } from "resend";
import { formatDateLong } from "./date";
import { agreementVersionSlug, getLegalDocForEmail } from "./legal";

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
  agreement_version: string | null;
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

function googleMapsLink(booking: BookingRow): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliveryAddress(booking))}`;
}

const LOGO_BLOCK_HTML = `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
    <tr>
      <td style="background-color: #14171a; border-radius: 10px; width: 40px; height: 40px; text-align: center; vertical-align: middle;">
        <img src="${SITE_URL}/icon-white.png" alt="" width="23" height="20" style="display: block; margin: 10px auto;" />
      </td>
      <td style="padding-left: 12px; vertical-align: middle;">
        <div style="font-size: 18px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #1a1a1a; line-height: 1.2;">DW Event Co</div>
        <div style="font-size: 10px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: #8a8a8a; line-height: 1.4;">Party &amp; Event Rentals</div>
      </td>
    </tr>
  </table>
`;

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
  const address = deliveryAddress(booking);
  const items_ = itemsSummary(items);
  const amountLabel = booking.payment_type === "deposit" ? "30% deposit" : "paid in full";

  // Legal requirement, not a nicety: a customer who booked under an older
  // agreement version must keep seeing the version they actually accepted,
  // even after a newer version is published.
  const version = booking.agreement_version ?? "1.0";
  const versionSlug = agreementVersionSlug(version);
  const { raw: agreementRaw, html: agreementHtml } = getLegalDocForEmail(versionSlug);
  const agreementPermalink = `${SITE_URL}/legal/${versionSlug}`;

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      ${LOGO_BLOCK_HTML}
      <p style="margin: 0 0 12px; line-height: 1.6;">Hi ${booking.customer_name},</p>
      <p style="margin: 0 0 16px; line-height: 1.6;">Your booking is confirmed! Here are the details:</p>

      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 0 0 20px; background: #f2f8f4; border-radius: 8px;">
        <tr><td style="padding: 8px 14px; color: #555555;">Event date</td><td style="padding: 8px 14px;"><strong>${eventDate}</strong></td></tr>
        <tr><td style="padding: 8px 14px; color: #555555;">Delivery address</td><td style="padding: 8px 14px;">${address}</td></tr>
        <tr><td style="padding: 8px 14px; color: #555555;">Items</td><td style="padding: 8px 14px;">${items_}</td></tr>
        <tr><td style="padding: 8px 14px; color: #555555;">Total paid</td><td style="padding: 8px 14px;">$${Number(booking.amount_paid).toFixed(2)} (${amountLabel})</td></tr>
        <tr><td style="padding: 8px 14px; color: #555555;">Booking reference</td><td style="padding: 8px 14px; font-family: monospace; font-size: 13px;">${booking.id}</td></tr>
      </table>

      <h2 style="font-size: 16px; font-weight: 700; margin: 0 0 8px; color: #1a1a1a;">What to expect</h2>
      <ul style="margin: 0 0 20px; padding-left: 20px; line-height: 1.6; color: #333333;">
        <li>We deliver the morning of your event and retrieve it the following morning.</li>
        <li>We set everything up — you don't need to place or unfold anything.</li>
        <li>You don't need to stack or move anything for pickup.</li>
        <li>Nothing is due at delivery.</li>
      </ul>

      <h2 style="font-size: 16px; font-weight: 700; margin: 0 0 8px; color: #1a1a1a;">Key terms at a glance</h2>
      <ul style="margin: 0 0 20px; padding-left: 20px; line-height: 1.6; color: #333333;">
        <li>Cancel more than 24 hours out: <strong>70% refund</strong></li>
        <li>Cancel within 24 hours: <strong>no refund</strong></li>
        <li>Reschedule once free, up to 24 hours before</li>
        <li>Severe weather (NWS warning): <strong>100% refund</strong>, any time</li>
        <li>You're responsible for the equipment from delivery until retrieval</li>
      </ul>

      <hr style="margin: 24px 0; border: none; border-top: 1px solid #dddddd;" />

      <h2 style="font-size: 18px; font-weight: 700; margin: 0 0 12px; color: #1a1a1a;">Your Rental Agreement</h2>
      ${agreementHtml}

      <hr style="margin: 24px 0; border: none; border-top: 1px solid #dddddd;" />

      <p style="color: #555555; font-size: 13px; line-height: 1.6;">
        Permanent link to this agreement: <a href="${agreementPermalink}" style="color: #209d50;">${agreementPermalink}</a>
      </p>
      <p style="color: #555555; font-size: 14px; line-height: 1.6;">
        Questions? Reach us at <a href="mailto:bookings@dweventco.com" style="color: #209d50;">bookings@dweventco.com</a> or 682-478-6430.
      </p>
    </div>
  `;

  const text = [
    `DW Event Co — Booking Confirmed`,
    ``,
    `Hi ${booking.customer_name},`,
    ``,
    `Event date: ${eventDate}`,
    `Delivery address: ${address}`,
    `Items: ${items_}`,
    `Total paid: $${Number(booking.amount_paid).toFixed(2)} (${amountLabel})`,
    `Booking reference: ${booking.id}`,
    ``,
    `WHAT TO EXPECT`,
    `- We deliver the morning of your event and retrieve it the following morning.`,
    `- We set everything up — you don't need to place or unfold anything.`,
    `- You don't need to stack or move anything for pickup.`,
    `- Nothing is due at delivery.`,
    ``,
    `KEY TERMS AT A GLANCE`,
    `- Cancel more than 24 hours out: 70% refund`,
    `- Cancel within 24 hours: no refund`,
    `- Reschedule once free, up to 24 hours before`,
    `- Severe weather (NWS warning): 100% refund, any time`,
    `- You're responsible for the equipment from delivery until retrieval`,
    ``,
    `------------------------------------------------------------`,
    `YOUR RENTAL AGREEMENT`,
    `------------------------------------------------------------`,
    ``,
    agreementRaw,
    ``,
    `------------------------------------------------------------`,
    `Permanent link to this agreement: ${agreementPermalink}`,
    `Questions? bookings@dweventco.com · 682-478-6430`,
  ].join("\n");

  await resend.emails.send({
    from: "DW Event Co <bookings@dweventco.com>",
    to: booking.customer_email,
    subject: "Your DW Event Co booking is confirmed!",
    html,
    text,
  });
}

export async function sendOwnerNotificationEmail(booking: BookingRow, items: BookingItemRow[]) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping owner notification email.");
    return;
  }

  const resend = new Resend(apiKey);
  const eventDate = formatDateLong(booking.event_date);
  const address = deliveryAddress(booking);
  const mapsLink = googleMapsLink(booking);
  const adminLink = `${SITE_URL}/admin/bookings/${booking.id}`;

  const itemRows = items
    .map(
      (item) =>
        `<tr><td style="padding: 4px 10px 4px 0; color: #555555;">${item.quantity}x ${productName(item)}</td><td style="padding: 4px 0; text-align: right;">$${Number(item.total_price).toFixed(2)}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a; font-size: 14px;">
      <h1 style="font-size: 18px; margin: 0 0 16px;">New booking</h1>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 0 0 16px;">
        <tr><td style="padding: 4px 10px 4px 0; color: #555555;">Name</td><td style="padding: 4px 0;"><strong>${booking.customer_name}</strong></td></tr>
        <tr><td style="padding: 4px 10px 4px 0; color: #555555;">Phone</td><td style="padding: 4px 0;">${booking.customer_phone}</td></tr>
        <tr><td style="padding: 4px 10px 4px 0; color: #555555;">Email</td><td style="padding: 4px 0;">${booking.customer_email}</td></tr>
        <tr><td style="padding: 4px 10px 4px 0; color: #555555;">Event date</td><td style="padding: 4px 0;">${eventDate}</td></tr>
        <tr><td style="padding: 4px 10px 4px 0; color: #555555;">Address</td><td style="padding: 4px 0;"><a href="${mapsLink}" style="color: #209d50;">${address}</a></td></tr>
        <tr><td style="padding: 4px 10px 4px 0; color: #555555;">Total paid</td><td style="padding: 4px 0;"><strong>$${Number(booking.amount_paid).toFixed(2)}</strong></td></tr>
        <tr><td style="padding: 4px 10px 4px 0; color: #555555;">Reference</td><td style="padding: 4px 0; font-family: monospace; font-size: 12px;">${booking.id}</td></tr>
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 0 0 20px; border-top: 1px solid #ddd; padding-top: 8px;">
        ${itemRows}
      </table>
      <a href="${adminLink}" style="display: inline-block; background: #209d50; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 700;">View in admin</a>
    </div>
  `;

  await resend.emails.send({
    from: "DW Event Co <bookings@dweventco.com>",
    to: "bookings@dweventco.com",
    subject: `New booking — ${eventDate} — ${booking.customer_name}`,
    html,
  });
}
