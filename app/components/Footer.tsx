import Image from "next/image";
import Link from "next/link";

const SERVICE_AREAS = ["Keller", "Southlake", "Colleyville", "Trophy Club", "Fort Worth"];

const LEGAL_LINKS = [
  { href: "/rental-agreement", label: "Rental Agreement" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div className="h-1 w-full bg-brand" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand opacity-20 blur-3xl"
      />
      <Image
        src="/icon-white.png"
        alt=""
        width={155}
        height={134}
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-auto opacity-[0.06] sm:h-80"
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <Image
            src="/logo-white.png"
            alt="DW Event Co"
            width={228}
            height={113}
            className="h-9 w-auto"
          />
          <p className="mt-3 max-w-xs text-sm text-white/60">
            Party and event equipment rentals, delivered and set up so you don&rsquo;t
            have to lift a finger.
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Contact
          </h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-white/80">
            <li>
              <a href="mailto:bookings@dweventco.com" className="transition-colors hover:text-white">
                bookings@dweventco.com
              </a>
            </li>
            <li>
              <a href="tel:6824786430" className="transition-colors hover:text-white">
                682-478-6430
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Service Area
          </h3>
          <p className="mt-3 text-sm text-white/80">
            {SERVICE_AREAS.join(", ")}, and surrounding areas
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Legal
          </h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-white/60">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10 px-4 py-5 text-center text-xs text-white/40 sm:px-6">
        <p>
          Serving Keller, Southlake, Colleyville, Trophy Club, and Fort Worth — 15 mile
          delivery radius
        </p>
        <p className="mt-1">&copy; {new Date().getFullYear()} DW Event Co LLC. All rights reserved.</p>
      </div>
    </footer>
  );
}
