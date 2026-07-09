export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateLong(key: string): string {
  return parseDateKey(key).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(key: string): string {
  return parseDateKey(key).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function addDaysToKey(key: string, days: number): string {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + days);
  return formatDateKey(d);
}

export function dayCount(startKey: string, endKey: string): number {
  const s = parseDateKey(startKey).getTime();
  const e = parseDateKey(endKey).getTime();
  return Math.round((e - s) / 86400000) + 1;
}

export function rangeDayKeys(startKey: string, endKey: string): string[] {
  const days: string[] = [];
  let cur = startKey;
  while (cur <= endKey) {
    days.push(cur);
    cur = addDaysToKey(cur, 1);
  }
  return days;
}

export function formatRangeLabel(startKey: string, endKey: string): string {
  if (startKey === endKey) return formatDateLong(startKey);
  const days = dayCount(startKey, endKey);
  return `${formatDateShort(startKey)} – ${formatDateLong(endKey)} (${days} days)`;
}

export function todayKey(): string {
  return formatDateKey(new Date());
}
