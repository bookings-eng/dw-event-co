"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDateLong } from "@/lib/date";

export type AdminBooking = {
  id: string;
  eventDate: string;
  customerName: string;
  customerPhone: string;
  itemsSummary: string;
  deliveryAddress: string;
  distanceMiles: number | null;
  amountPaid: number;
  paymentStatus: string;
  status: string;
};

const STATUS_OPTIONS = ["confirmed", "delivered", "returned", "cancelled"];

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  paid_in_full: "bg-brand/10 text-brand",
  deposit_paid: "bg-brand/10 text-brand",
  pending: "bg-yellow-100 text-yellow-800",
};

function PaymentBadge({ value }: { value: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        PAYMENT_STATUS_STYLES[value] ?? "bg-black/5 text-foreground/60"
      }`}
    >
      {value}
    </span>
  );
}

function BookingRow({ booking }: { booking: AdminBooking }) {
  const [status, setStatus] = useState(booking.status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    const previous = status;
    setStatus(newStatus);
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        setStatus(previous);
        setError("Failed to save");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      setStatus(previous);
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-b border-black/5 text-sm">
      <td className="whitespace-nowrap px-3 py-3 font-medium text-foreground">
        <Link href={`/admin/bookings/${booking.id}`} className="hover:text-brand hover:underline">
          {formatDateLong(booking.eventDate)}
        </Link>
      </td>
      <td className="px-3 py-3 text-foreground">
        <Link href={`/admin/bookings/${booking.id}`} className="hover:text-brand hover:underline">
          {booking.customerName}
        </Link>
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-foreground/70">{booking.customerPhone}</td>
      <td className="px-3 py-3 text-foreground/70">{booking.itemsSummary}</td>
      <td className="px-3 py-3 text-foreground/70">{booking.deliveryAddress}</td>
      <td className="whitespace-nowrap px-3 py-3 text-foreground/70">
        {booking.distanceMiles != null ? `${booking.distanceMiles.toFixed(1)} mi` : "—"}
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-foreground">
        ${booking.amountPaid.toFixed(2)}
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <PaymentBadge value={booking.paymentStatus} />
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={handleStatusChange}
            className="rounded-lg border border-black/10 px-2 py-1 text-sm text-foreground focus:border-brand focus:outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {saving && <span className="text-xs text-foreground/40">Saving…</span>}
          {saved && <span className="text-xs text-brand">Saved</span>}
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </td>
    </tr>
  );
}

export default function AdminBookingsTable({ bookings }: { bookings: AdminBooking[] }) {
  if (bookings.length === 0) {
    return (
      <p className="rounded-2xl bg-white p-8 text-center text-foreground/60 shadow-sm">
        No bookings yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          <tr className="border-b border-black/10 text-left text-xs font-semibold uppercase tracking-wide text-foreground/50">
            <th className="px-3 py-3">Date</th>
            <th className="px-3 py-3">Customer</th>
            <th className="px-3 py-3">Phone</th>
            <th className="px-3 py-3">Items</th>
            <th className="px-3 py-3">Delivery Address</th>
            <th className="px-3 py-3">Distance</th>
            <th className="px-3 py-3">Paid</th>
            <th className="px-3 py-3">Payment</th>
            <th className="px-3 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <BookingRow key={b.id} booking={b} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
