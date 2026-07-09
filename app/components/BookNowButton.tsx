"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DatePickerModal from "./DatePickerModal";

export default function BookNowButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-brand px-8 py-4 text-base font-semibold text-white shadow-lg transition-colors hover:bg-brand-dark sm:text-lg"
      >
        Book Now
      </button>
      <DatePickerModal
        open={open}
        onClose={() => setOpen(false)}
        onApply={(start, end) => {
          setOpen(false);
          router.push(`/products?start=${start}&end=${end}`);
        }}
      />
    </>
  );
}
