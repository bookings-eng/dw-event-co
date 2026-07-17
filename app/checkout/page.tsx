"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Header from "../components/Header";
import CartSummary from "./CartSummary";
import { useCart } from "@/hooks/useCart";
import { useGoogleMapsScript } from "@/hooks/useGoogleMapsScript";
import { cartDays, cartSubtotal, removeFromCart, updateCartQuantity, type Cart } from "@/lib/cart";
import { DELIVERY_FEE, DEPOSIT_RATE } from "@/lib/constants";

type AddressResult = { lat: number; lng: number; distanceMiles: number };

const EMPTY_CART: Cart = { startDate: null, endDate: null, items: [] };

export default function CheckoutPage() {
  const liveCart = useCart();

  // Cart reads from localStorage, which is unavailable during SSR — the
  // server always sees an empty cart. Every render below (this page, plus
  // CartSummary) branches its output shape on cart contents, so keeping
  // `cart` pinned to the same empty value the server used, until mounted,
  // keeps the first client render's shape identical to the server's.
  // Otherwise hydration has to discard and regenerate the whole page (which
  // was tearing down and re-attaching the Google Places Autocomplete
  // mid-flight, silently dropping the parsed address on selection).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const cart = mounted ? liveCart : EMPTY_CART;
  const days = cartDays(cart);
  const subtotal = cartSubtotal(cart);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const [addressResult, setAddressResult] = useState<AddressResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [payingType, setPayingType] = useState<"deposit" | "full" | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [agreementError, setAgreementError] = useState<string | null>(null);

  const [availabilityById, setAvailabilityById] = useState<Map<string, number> | null>(null);

  const address1Ref = useRef<HTMLInputElement>(null);
  const autocompleteAttachedRef = useRef(false);
  const mapsLoaded = useGoogleMapsScript(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  const validateAddress = useCallback(
    async (addr: { address1: string; city: string; state: string; zip: string }) => {
      setValidating(true);
      setValidationError(null);
      try {
        const res = await fetch("/api/checkout/validate-address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addr),
        });
        const data = await res.json();
        if (!res.ok) {
          setValidationError(data.error ?? "Something went wrong.");
          return;
        }
        setAddressResult({ lat: data.lat, lng: data.lng, distanceMiles: data.distanceMiles });
      } catch {
        setValidationError("Something went wrong. Please try again.");
      } finally {
        setValidating(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!mapsLoaded || !address1Ref.current || !window.google) return;
    if (autocompleteAttachedRef.current) return;
    autocompleteAttachedRef.current = true;

    const autocomplete = new window.google.maps.places.Autocomplete(address1Ref.current, {
      componentRestrictions: { country: "us" },
      fields: ["address_components"],
      types: ["address"],
    });

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const components = place.address_components ?? [];
      const get = (type: string) => components.find((c) => c.types.includes(type));

      const streetNumber = get("street_number")?.long_name ?? "";
      const route = get("route")?.long_name ?? "";
      const cityName =
        get("locality")?.long_name ?? get("sublocality")?.long_name ?? "";
      const stateName = get("administrative_area_level_1")?.short_name ?? "";
      const zipName = get("postal_code")?.long_name ?? "";
      const streetAddress = [streetNumber, route].filter(Boolean).join(" ");

      setAddress1(streetAddress);
      setCity(cityName);
      setState(stateName);
      setZip(zipName);
      setAddressResult(null);
      setValidationError(null);

      // Autocomplete gives us a complete, structured address in one shot —
      // validate immediately instead of waiting for the user to notice and
      // click "Continue to Payment", so an out-of-range address surfaces
      // right away instead of after they've moved on to other fields.
      if (streetAddress && cityName && stateName && zipName) {
        validateAddress({ address1: streetAddress, city: cityName, state: stateName, zip: zipName });
      }
    });

    return () => {
      listener.remove();
      autocompleteAttachedRef.current = false;
    };
  }, [mapsLoaded, validateAddress]);

  useEffect(() => {
    if (!cart.startDate || !cart.endDate || cart.items.length === 0) return;
    fetch(`/api/availability?start=${cart.startDate}&end=${cart.endDate}`)
      .then((res) => res.json())
      .then((data) => {
        const map = new Map<string, number>();
        for (const tag of ["packages", "individual", "kids"] as const) {
          for (const p of data.groups?.[tag] ?? []) {
            map.set(p.id, p.available);
          }
        }
        setAvailabilityById(map);
      })
      .catch(() => {});
  }, [cart.startDate, cart.endDate, cart.items.length]);

  const hasAvailabilityIssues = useMemo(
    () =>
      cart.items.some((item) => {
        const available = availabilityById?.get(item.productId);
        return available !== undefined && item.quantity > available;
      }),
    [cart.items, availabilityById]
  );

  const customerFilled = name.trim() && email.trim() && phone.trim();
  const addressFilled = address1.trim() && city.trim() && state.trim() && zip.trim();

  function handleAddressFieldChange(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setAddressResult(null);
      setValidationError(null);
    };
  }

  function handleValidateAddress() {
    validateAddress({ address1, city, state, zip });
  }

  async function handlePay(paymentType: "deposit" | "full") {
    if (!cart.startDate || !cart.endDate) return;
    if (!agreementAccepted) {
      setAgreementError("You must agree to the Rental Agreement before booking.");
      return;
    }
    setAgreementError(null);
    setPayingType(paymentType);
    setPayError(null);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          startDate: cart.startDate,
          endDate: cart.endDate,
          customer: { name, email, phone },
          address: { address1, city, state, zip },
          paymentType,
          agreementAccepted,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPayError(data.error ?? "Something went wrong.");
        setPayingType(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setPayError("Something went wrong. Please try again.");
      setPayingType(null);
    }
  }

  const total = subtotal + DELIVERY_FEE;
  const depositAmount = Math.round(total * DEPOSIT_RATE * 100) / 100;
  const readyToPay =
    addressResult && customerFilled && cart.items.length > 0 && !hasAvailabilityIssues;

  if (cart.items.length === 0) {
    return (
      <div className="flex min-h-full flex-1 flex-col">
        <Header />
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Your cart is empty</h1>
          <p className="text-foreground/60">Browse our rentals to start building your order.</p>
          <Link
            href="/products"
            className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Browse Rentals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Checkout</h1>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-8">
            <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-foreground">Event Address</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                  Address Line 1
                  <input
                    ref={address1Ref}
                    type="text"
                    autoComplete="off"
                    placeholder="Start typing your address…"
                    value={address1}
                    onChange={handleAddressFieldChange(setAddress1)}
                    className="rounded-lg border border-black/10 px-3 py-2 text-foreground focus:border-brand focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  City
                  <input
                    type="text"
                    value={city}
                    onChange={handleAddressFieldChange(setCity)}
                    className="rounded-lg border border-black/10 px-3 py-2 text-foreground focus:border-brand focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  State
                  <input
                    type="text"
                    value={state}
                    onChange={handleAddressFieldChange(setState)}
                    className="rounded-lg border border-black/10 px-3 py-2 text-foreground focus:border-brand focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Zip
                  <input
                    type="text"
                    value={zip}
                    onChange={handleAddressFieldChange(setZip)}
                    className="rounded-lg border border-black/10 px-3 py-2 text-foreground focus:border-brand focus:outline-none"
                  />
                </label>
              </div>

              {validationError && (
                <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {validationError}
                </p>
              )}
              {addressResult && (
                <p className="mt-4 rounded-lg bg-brand/10 px-3 py-2 text-sm text-brand">
                  You&rsquo;re within our delivery area (about{" "}
                  {addressResult.distanceMiles.toFixed(1)} miles away). $25 delivery fee added
                  below.
                </p>
              )}
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-foreground">Your Information</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                  Full Name
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-lg border border-black/10 px-3 py-2 text-foreground focus:border-brand focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-lg border border-black/10 px-3 py-2 text-foreground focus:border-brand focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Phone
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-lg border border-black/10 px-3 py-2 text-foreground focus:border-brand focus:outline-none"
                  />
                </label>
              </div>

              {!addressResult && (
                <button
                  type="button"
                  disabled={!addressFilled || validating}
                  onClick={handleValidateAddress}
                  className="mt-5 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {validating ? "Checking address…" : "Continue to Payment"}
                </button>
              )}
            </section>

            {hasAvailabilityIssues && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                Some items in your cart are no longer available in the quantity you selected.
                Please update your cart before continuing.{" "}
                <Link href="/products" className="underline">
                  Go to cart
                </Link>
              </p>
            )}

            {readyToPay && (
              <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                <h2 className="mb-4 text-lg font-bold text-foreground">Payment</h2>
                <div className="mb-5 flex flex-col gap-2 text-sm">
                  <div className="flex justify-between text-foreground/70">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-foreground/70">
                    <span>Delivery</span>
                    <span>${DELIVERY_FEE.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-foreground">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {payError && (
                  <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {payError}
                  </p>
                )}

                <div className="mb-5">
                  <label htmlFor="agreement-checkbox" className="flex items-start gap-3 text-sm text-foreground">
                    <input
                      id="agreement-checkbox"
                      type="checkbox"
                      checked={agreementAccepted}
                      onChange={(e) => {
                        setAgreementAccepted(e.target.checked);
                        if (e.target.checked) setAgreementError(null);
                      }}
                      aria-describedby={agreementError ? "agreement-error" : undefined}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/20 text-brand focus:ring-2 focus:ring-brand focus:ring-offset-2"
                    />
                    <span>
                      I have read and agree to the DW Event Co{" "}
                      <Link
                        href="/rental-agreement"
                        target="_blank"
                        rel="noopener"
                        className="font-semibold text-brand underline hover:text-brand-dark"
                      >
                        Rental Agreement
                      </Link>
                    </span>
                  </label>
                  {agreementError && (
                    <p id="agreement-error" className="mt-2 text-sm text-red-700">
                      {agreementError}
                    </p>
                  )}
                  <p className="mt-3 text-xs leading-relaxed text-foreground/60">
                    Your card will be securely saved by our payment processor. By booking, you
                    authorize DW Event Co to charge it for damage, loss, late return, cleaning, or
                    re-trip fees as described in the Rental Agreement. We will always email you
                    photographs and an itemized statement first, and you have 5 days to dispute
                    before any charge is processed.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    disabled={payingType !== null || !agreementAccepted}
                    onClick={() => handlePay("deposit")}
                    className="flex-1 rounded-full border-2 border-brand px-5 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {payingType === "deposit"
                      ? "Redirecting…"
                      : `Pay 30% Deposit ($${depositAmount.toFixed(2)})`}
                  </button>
                  <button
                    type="button"
                    disabled={payingType !== null || !agreementAccepted}
                    onClick={() => handlePay("full")}
                    className="flex-1 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {payingType === "full" ? "Redirecting…" : `Pay in Full ($${total.toFixed(2)})`}
                  </button>
                </div>
              </section>
            )}
          </div>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <CartSummary
              cart={cart}
              days={days}
              subtotal={subtotal}
              deliveryConfirmed={!!addressResult}
              availabilityById={availabilityById}
              onRemove={removeFromCart}
              onUpdateQuantity={updateCartQuantity}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
