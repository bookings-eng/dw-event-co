"use client";

import { useState } from "react";
import Header from "../components/Header";
import DatePickerModal from "../components/DatePickerModal";
import { formatRangeLabel } from "@/lib/date";

export default function ProductsBanner({
  start,
  end,
  hasDate,
  onChangeRange,
}: {
  start: string | null;
  end: string | null;
  hasDate: boolean;
  onChangeRange: (start: string, end: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="relative flex min-h-[320px] flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[380px]">
      <Header overlay />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Party &amp; Event Rentals for the DFW Area
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-2 text-base text-white/90 sm:text-lg">
          <span>
            {hasDate
              ? `Showing availability for ${formatRangeLabel(start!, end!)}`
              : "Browsing all rentals — pick a date to check availability"}
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium transition-colors hover:bg-white/25"
          >
            {hasDate ? "Change dates" : "Choose Dates"}
          </button>
        </div>
      </div>
      <DatePickerModal
        open={open}
        onClose={() => setOpen(false)}
        initialStart={start ?? undefined}
        initialEnd={end ?? undefined}
        onApply={(newStart, newEnd) => {
          setOpen(false);
          onChangeRange(newStart, newEnd);
        }}
      />
    </section>
  );
}
