"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { formatDateKey, formatDateLong, formatDateShort, parseDateKey } from "@/lib/date";
import { MAX_RENTAL_DAYS } from "@/lib/constants";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

type DatePickerModalProps = {
  open: boolean;
  onClose: () => void;
  onApply: (startKey: string, endKey: string) => void;
  initialStart?: string;
  initialEnd?: string;
};

export default function DatePickerModal({
  open,
  onClose,
  onApply,
  initialStart,
  initialEnd,
}: DatePickerModalProps) {
  // Earliest bookable day is tomorrow — same-day booking isn't offered.
  const minDate = useMemo(() => {
    const d = startOfDay(new Date());
    d.setDate(d.getDate() + 1);
    return d;
  }, []);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  );
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  // Re-sync range/month from props each time the modal opens, discarding
  // any in-progress edits from a prior open/close cycle. Done during render
  // (not an effect) per React's guidance on adjusting state from props.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      if (initialStart) {
        const s = parseDateKey(initialStart);
        const e = initialEnd ? parseDateKey(initialEnd) : s;
        setRangeStart(s);
        setRangeEnd(e);
        setVisibleMonth(new Date(s.getFullYear(), s.getMonth(), 1));
      } else {
        setRangeStart(null);
        setRangeEnd(null);
      }
    }
  }

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const firstOfMonth = visibleMonth;
  const firstWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(
    firstOfMonth.getFullYear(),
    firstOfMonth.getMonth() + 1,
    0
  ).getDate();

  const cells: (Date | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), i + 1)
    ),
  ];

  const isPast = (date: Date) => date.getTime() < minDate.getTime();
  const isSameDay = (a: Date, b: Date | null) =>
    !!b && a.getTime() === b.getTime();

  const canGoToPrevMonth =
    firstOfMonth.getFullYear() > minDate.getFullYear() ||
    (firstOfMonth.getFullYear() === minDate.getFullYear() &&
      firstOfMonth.getMonth() > minDate.getMonth());

  const hasCompletedRange = !!(
    rangeStart &&
    rangeEnd &&
    !isSameDay(rangeStart, rangeEnd)
  );

  function handleDayClick(date: Date) {
    if (!rangeStart || hasCompletedRange) {
      setRangeStart(date);
      setRangeEnd(date);
      return;
    }
    if (isSameDay(date, rangeStart)) return;
    const spanDays = Math.round((date.getTime() - rangeStart.getTime()) / 86400000) + 1;
    if (date.getTime() > rangeStart.getTime() && spanDays <= MAX_RENTAL_DAYS) {
      setRangeEnd(date);
    } else {
      // Before the current start, or would exceed the max rental length —
      // either way, start a fresh single-day selection at the clicked date.
      setRangeStart(date);
      setRangeEnd(date);
    }
  }

  const days =
    rangeStart && rangeEnd
      ? Math.round((rangeEnd.getTime() - rangeStart.getTime()) / 86400000) + 1
      : 0;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose your event date"
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Choose your event date
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-foreground/50 transition-colors hover:bg-black/5 hover:text-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
            >
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <p className="mb-3 text-xs text-foreground/50">
          Click a day for a single-day rental, or click a start and end day for
          multiple days (up to {MAX_RENTAL_DAYS} days). Earliest booking is
          tomorrow.
        </p>

        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            disabled={!canGoToPrevMonth}
            onClick={() =>
              setVisibleMonth(
                (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1)
              )
            }
            aria-label="Previous month"
            className="rounded-full p-2 text-foreground transition-colors hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <span className="font-medium text-foreground">
            {MONTH_LABELS[firstOfMonth.getMonth()]} {firstOfMonth.getFullYear()}
          </span>
          <button
            type="button"
            onClick={() =>
              setVisibleMonth(
                (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1)
              )
            }
            aria-label="Next month"
            className="rounded-full p-2 text-foreground transition-colors hover:bg-black/5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-medium text-foreground/50">
          {WEEKDAY_LABELS.map((label, i) => (
            <div key={`${label}-${i}`} className="py-1">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />;
            const disabled = isPast(date);
            const isStart = isSameDay(date, rangeStart);
            const isEnd = isSameDay(date, rangeEnd);
            const inSpan = !!(
              rangeStart &&
              rangeEnd &&
              date.getTime() >= rangeStart.getTime() &&
              date.getTime() <= rangeEnd.getTime()
            );
            const roundLeft = isStart || date.getDay() === 0;
            const roundRight = isEnd || date.getDay() === 6;

            return (
              <div
                key={formatDateKey(date)}
                className={`px-0.5 ${inSpan ? "bg-brand/15" : ""} ${
                  inSpan && roundLeft ? "rounded-l-full" : ""
                } ${inSpan && roundRight ? "rounded-r-full" : ""}`}
              >
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDayClick(date)}
                  className={`aspect-square w-full rounded-full text-sm transition-colors ${
                    disabled
                      ? "cursor-not-allowed text-foreground/20"
                      : isStart || isEnd
                        ? "bg-brand text-white font-semibold"
                        : "text-foreground hover:bg-brand/10"
                  }`}
                >
                  {date.getDate()}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm text-foreground/60">
            {!rangeStart
              ? "No date selected"
              : !rangeEnd || isSameDay(rangeStart, rangeEnd)
                ? formatDateLong(formatDateKey(rangeStart))
                : `${formatDateShort(formatDateKey(rangeStart))} – ${formatDateLong(
                    formatDateKey(rangeEnd)
                  )} (${days} days)`}
          </p>
          <button
            type="button"
            disabled={!rangeStart}
            onClick={() =>
              rangeStart &&
              onApply(
                formatDateKey(rangeStart),
                formatDateKey(rangeEnd ?? rangeStart)
              )
            }
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
