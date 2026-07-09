"use client";

import { useState } from "react";
import Header from "../components/Header";
import DatePickerModal from "../components/DatePickerModal";
import { formatRangeLabel } from "@/lib/date";

export default function ProductsBanner({
  start,
  end,
  onChangeRange,
}: {
  start: string;
  end: string;
  onChangeRange: (start: string, end: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section
      className="relative flex min-h-[320px] flex-col items-center justify-center bg-[#14311d] bg-cover bg-center px-4 py-16 text-center sm:min-h-[380px]"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(8,16,10,0.75) 0%, rgba(8,16,10,0.4) 30%, rgba(8,16,10,0.6) 100%), url('/images/pexels-michael-morse-1376649.jpg')",
      }}
    >
      <Header overlay />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Browse Our Rentals
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-2 text-white/90">
          <span>Showing availability for {formatRangeLabel(start, end)}</span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium transition-colors hover:bg-white/25"
          >
            Change dates
          </button>
        </div>
      </div>
      <DatePickerModal
        open={open}
        onClose={() => setOpen(false)}
        initialStart={start}
        initialEnd={end}
        onApply={(newStart, newEnd) => {
          setOpen(false);
          onChangeRange(newStart, newEnd);
        }}
      />
    </section>
  );
}
