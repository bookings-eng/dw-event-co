const SERVICE_CITIES = ["Keller", "Southlake", "Colleyville", "Trophy Club", "Fort Worth"];

const SITE_URL = "https://dw-event-co.vercel.app";

export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "DW Event Co",
    description:
      "DW Event Co delivers and sets up party and event equipment rentals — tables, chairs, and kids' furniture — throughout the Dallas-Fort Worth area, serving Keller, Southlake, Colleyville, Trophy Club, Fort Worth, and surrounding communities.",
    url: SITE_URL,
    image: `${SITE_URL}/og-image.png`,
    telephone: "+1-682-478-6430",
    email: "bookings@dweventco.com",
    priceRange: "$$",
    // Service-area business — no public storefront, so we list the city
    // we're based in rather than a street address (never expose the
    // owner's exact home address).
    address: {
      "@type": "PostalAddress",
      addressLocality: "Keller",
      addressRegion: "TX",
      addressCountry: "US",
    },
    areaServed: SERVICE_CITIES.map((name) => ({
      "@type": "City",
      name,
      containedInPlace: { "@type": "State", name: "Texas" },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
