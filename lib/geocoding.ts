export const HOME_LAT = Number(process.env.HOME_LAT ?? "32.906900");
export const HOME_LNG = Number(process.env.HOME_LNG ?? "-97.265971");
export { MAX_DELIVERY_MILES, DELIVERY_FEE } from "./constants";

export type GeocodeResult = { lat: number; lng: number };

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API key is not configured.");
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK" || !data.results?.[0]) {
    throw new Error("We couldn't find that address. Please check it and try again.");
  }

  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}

export async function drivingDistanceMiles(
  destLat: number,
  destLng: number
): Promise<number> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API key is not configured.");
  }

  const origin = `${HOME_LAT},${HOME_LNG}`;
  const destination = `${destLat},${destLng}`;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&units=imperial&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  const element = data.rows?.[0]?.elements?.[0];

  if (data.status !== "OK" || !element || element.status !== "OK") {
    throw new Error(
      "We couldn't calculate the delivery distance for that address."
    );
  }

  return element.distance.value / 1609.344;
}
