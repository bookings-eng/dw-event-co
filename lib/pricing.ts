import { dayCount } from "./date";

/** Each day after day 1 is charged at this fraction of the day-1 rate. */
export const EXTRA_DAY_RATE = 0.5;

export function unitPriceForDays(dayRate: number, days: number): number {
  return dayRate + dayRate * EXTRA_DAY_RATE * Math.max(0, days - 1);
}

export function lineTotal(dayRate: number, quantity: number, days: number): number {
  return unitPriceForDays(dayRate, days) * quantity;
}

export function rentalDays(startKey: string, endKey: string): number {
  return dayCount(startKey, endKey);
}
