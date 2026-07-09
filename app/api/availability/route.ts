import { NextRequest, NextResponse } from "next/server";
import { dayCount } from "@/lib/date";
import { MAX_RENTAL_DAYS } from "@/lib/constants";
import { getProductsForRange } from "@/lib/products";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const start = request.nextUrl.searchParams.get("start");
  const end = request.nextUrl.searchParams.get("end");

  if (!start || !end || !DATE_RE.test(start) || !DATE_RE.test(end)) {
    return NextResponse.json(
      { error: "Valid start and end query parameters (YYYY-MM-DD) are required." },
      { status: 400 }
    );
  }

  if (end < start) {
    return NextResponse.json(
      { error: "end date must not be before start date." },
      { status: 400 }
    );
  }

  if (dayCount(start, end) > MAX_RENTAL_DAYS) {
    return NextResponse.json(
      { error: `Date range cannot exceed ${MAX_RENTAL_DAYS} days.` },
      { status: 400 }
    );
  }

  try {
    const groups = await getProductsForRange(start, end);
    return NextResponse.json({ start, end, groups });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
