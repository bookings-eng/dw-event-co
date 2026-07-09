import { NextRequest, NextResponse } from "next/server";
import {
  DELIVERY_FEE,
  MAX_DELIVERY_MILES,
  drivingDistanceMiles,
  geocodeAddress,
} from "@/lib/geocoding";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const address1 = body?.address1?.trim();
  const city = body?.city?.trim();
  const state = body?.state?.trim();
  const zip = body?.zip?.trim();

  if (!address1 || !city || !state || !zip) {
    return NextResponse.json(
      { error: "Please fill out the full delivery address." },
      { status: 400 }
    );
  }

  const fullAddress = `${address1}, ${city}, ${state} ${zip}`;

  try {
    const { lat, lng } = await geocodeAddress(fullAddress);
    const distanceMiles = await drivingDistanceMiles(lat, lng);

    if (distanceMiles > MAX_DELIVERY_MILES) {
      return NextResponse.json(
        {
          error:
            "Sorry, your event address is outside our 15-mile delivery area. We currently serve Keller, Southlake, Colleyville, Fort Worth (north/northwest), and surrounding areas.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ lat, lng, distanceMiles, deliveryFee: DELIVERY_FEE });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong." },
      { status: 500 }
    );
  }
}
