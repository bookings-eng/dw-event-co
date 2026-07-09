import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { addDaysToKey, dayCount } from "@/lib/date";
import { MAX_RENTAL_DAYS } from "@/lib/constants";
import {
  DELIVERY_FEE,
  MAX_DELIVERY_MILES,
  drivingDistanceMiles,
  geocodeAddress,
} from "@/lib/geocoding";
import { unitPriceForDays, rentalDays } from "@/lib/pricing";
import { getProductsForRange, type ProductAvailability } from "@/lib/products";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CheckoutRequestBody = {
  items?: { productId: string; quantity: number }[];
  startDate?: string;
  endDate?: string;
  customer?: { name: string; email: string; phone: string };
  address?: { address1: string; city: string; state: string; zip: string };
  paymentType?: "deposit" | "full";
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as CheckoutRequestBody | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { items, startDate, endDate, customer, address, paymentType } = body;

  if (
    !startDate ||
    !endDate ||
    !DATE_RE.test(startDate) ||
    !DATE_RE.test(endDate) ||
    endDate < startDate
  ) {
    return NextResponse.json({ error: "Invalid rental dates." }, { status: 400 });
  }
  if (dayCount(startDate, endDate) > MAX_RENTAL_DAYS) {
    return NextResponse.json(
      { error: `Rentals cannot exceed ${MAX_RENTAL_DAYS} days.` },
      { status: 400 }
    );
  }
  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }
  if (!customer?.name || !customer?.email || !customer?.phone) {
    return NextResponse.json(
      { error: "Please provide your name, email, and phone number." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(customer.email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }
  if (!address?.address1 || !address?.city || !address?.state || !address?.zip) {
    return NextResponse.json(
      { error: "Please provide your full delivery address." },
      { status: 400 }
    );
  }
  if (paymentType !== "deposit" && paymentType !== "full") {
    return NextResponse.json({ error: "Invalid payment type." }, { status: 400 });
  }

  const fullAddress = `${address.address1}, ${address.city}, ${address.state} ${address.zip}`;

  let lat: number;
  let lng: number;
  let distanceMiles: number;
  try {
    ({ lat, lng } = await geocodeAddress(fullAddress));
    distanceMiles = await drivingDistanceMiles(lat, lng);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not validate delivery address." },
      { status: 500 }
    );
  }

  if (distanceMiles > MAX_DELIVERY_MILES) {
    return NextResponse.json(
      {
        error:
          "Sorry, your event address is outside our 15-mile delivery area. We currently serve Keller, Southlake, Colleyville, Fort Worth (north/northwest), and surrounding areas.",
      },
      { status: 422 }
    );
  }

  const groups = await getProductsForRange(startDate, endDate);
  const allProducts: ProductAvailability[] = [
    ...groups.packages,
    ...groups.individual,
    ...groups.kids,
  ];
  const days = rentalDays(startDate, endDate);

  const lineItemsData: {
    product: ProductAvailability;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[] = [];

  for (const item of items) {
    const product = allProducts.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json({ error: "One of your cart items no longer exists." }, { status: 400 });
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return NextResponse.json({ error: `Invalid quantity for ${product.name}.` }, { status: 400 });
    }
    if (item.quantity > product.available) {
      return NextResponse.json(
        {
          error: `Sorry, only ${product.available} of "${product.name}" ${
            product.available === 1 ? "is" : "are"
          } available for these dates. Please update your cart.`,
        },
        { status: 422 }
      );
    }
    const unitPrice = unitPriceForDays(product.price, days);
    lineItemsData.push({
      product,
      quantity: item.quantity,
      unitPrice,
      totalPrice: unitPrice * item.quantity,
    });
  }

  const subtotal = lineItemsData.reduce((sum, i) => sum + i.totalPrice, 0);
  const totalAmount = subtotal + DELIVERY_FEE;
  const depositAmount = Math.round(totalAmount * 0.3 * 100) / 100;
  const pickupDate = addDaysToKey(endDate, 1);

  const supabase = getSupabaseAdmin();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      event_date: startDate,
      pickup_date: pickupDate,
      delivery_address: address.address1,
      delivery_city: address.city,
      delivery_state: address.state,
      delivery_zip: address.zip,
      delivery_lat: lat,
      delivery_lng: lng,
      distance_miles: distanceMiles,
      subtotal,
      deposit_amount: depositAmount,
      total_amount: totalAmount,
      amount_paid: 0,
      payment_type: paymentType,
      payment_status: "pending",
      // DB's status check constraint has no "pending" option (only
      // confirmed/delivered/returned/cancelled) — payment_status carries
      // the not-yet-paid state instead; this gets flipped to "cancelled"
      // if the Stripe session expires unpaid.
      status: "confirmed",
    })
    .select()
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: "Could not create booking." }, { status: 500 });
  }

  const { error: itemsError } = await supabase.from("booking_items").insert(
    lineItemsData.map((i) => ({
      booking_id: booking.id,
      product_id: i.product.id,
      quantity: i.quantity,
      unit_price: i.unitPrice,
      total_price: i.totalPrice,
    }))
  );

  if (itemsError) {
    await supabase.from("bookings").delete().eq("id", booking.id);
    return NextResponse.json({ error: "Could not save cart items." }, { status: 500 });
  }

  const origin = request.nextUrl.origin;
  const dayLabel = days > 1 ? `${days} days` : "1 day";

  const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
    paymentType === "full"
      ? [
          ...lineItemsData.map((i) => ({
            price_data: {
              currency: "usd",
              product_data: { name: `${i.product.name} (${dayLabel})` },
              unit_amount: Math.round(i.unitPrice * 100),
            },
            quantity: i.quantity,
          })),
          {
            price_data: {
              currency: "usd",
              product_data: { name: "Delivery" },
              unit_amount: Math.round(DELIVERY_FEE * 100),
            },
            quantity: 1,
          },
        ]
      : [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "30% Deposit — DW Event Co Booking",
                description: `Total booking value $${totalAmount.toFixed(2)}, balance due on delivery`,
              },
              unit_amount: Math.round(depositAmount * 100),
            },
            quantity: 1,
          },
        ];

  let session: Stripe.Checkout.Session;
  try {
    const stripe = getStripe();
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: stripeLineItems,
      customer_email: customer.email,
      success_url: `${origin}/confirmation?booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?cancelled=1`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      metadata: { booking_id: booking.id },
    });
  } catch (error) {
    await supabase.from("booking_items").delete().eq("booking_id", booking.id);
    await supabase.from("bookings").delete().eq("id", booking.id);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not start payment." },
      { status: 500 }
    );
  }

  await supabase.from("bookings").update({ stripe_session_id: session.id }).eq("id", booking.id);

  return NextResponse.json({ url: session.url });
}
