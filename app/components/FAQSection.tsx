"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "How does delivery work?",
    a: "Typically we deliver the morning of your event and pick up the following morning. We're flexible, though — if you need a different schedule, just let us know and we'll do our best to work with you.",
  },
  {
    q: "Do you set everything up?",
    a: "Yes! We drop off and set up wherever works best for you. Setup goes most smoothly when someone's there to show us where you'd like everything placed, but we're happy to accommodate your needs.",
  },
  {
    q: "What's your cancellation policy?",
    a: "Need to cancel or make a change? Just reach out by phone at 682-478-6430 or email bookings@dweventco.com — both are monitored 24/7 and we'll take care of you.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">FAQ</h2>
          <p className="mt-2 text-3xl font-bold text-foreground">Frequently Asked Questions</p>
        </div>
        <div className="flex flex-col gap-3">
          {FAQS.map((item, i) => {
            const open = openIndex === i;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                >
                  <span className="font-semibold text-foreground">{item.q}</span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand transition-transform duration-300 ${
                      open ? "rotate-180" : ""
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-foreground/70 sm:px-6">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
