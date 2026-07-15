const MARQUEE_IMAGES = [
  {
    file: "jose-leon-aAe0I5DG2Yk-unsplash.jpg",
    alt: "White folding chairs set up near an outdoor patio bar for an event",
  },
  {
    file: "jose-marroquin-_4rTolL0qjs-unsplash.jpg",
    alt: "White folding chairs lined up on the lawn for an outdoor wedding ceremony",
  },
  {
    file: "micheile-henderson-KWHoxdn1IUE-unsplash.jpg",
    alt: "White flowers tied to a white folding chair at an outdoor ceremony",
  },
  {
    file: "nate-johnston-xX6cPwIzgto-unsplash.jpg",
    alt: "White folding chairs arranged under a pergola with string lights at dusk",
  },
  {
    file: "pexels-calvin-mwanza-2955218-12868833.jpg",
    alt: "Chairs set up under string lights for an evening event",
  },
  {
    file: "pexels-daniel-richard-8570713-6292987.jpg",
    alt: "White folding chairs set up inside a rustic barn event venue",
  },
  {
    file: "pexels-luis-erives-1457235-36301531.jpg",
    alt: "Patio string lights strung above an outdoor event space",
  },
  {
    file: "pexels-michael-morse-1376649.jpg",
    alt: "White folding chairs glowing under string lights at an evening outdoor event",
  },
  {
    file: "pexels-taylor-thompson-865581658-35870516.jpg",
    alt: "Guests gathering near a barn venue at sunset for an outdoor event",
  },
  {
    file: "pexels-wolfart-36807077.jpg",
    alt: "White folding chairs set up in a landscaped outdoor courtyard",
  },
  {
    file: "troy-olson-Gw2ODMZDeK4-unsplash.jpg",
    alt: "White chairs and a wedding arch set up in a field at sunset",
  },
  {
    file: "victoria-priessnitz-nT7RTgQ3cu8-unsplash.jpg",
    alt: "Round reception tables with white linens and floral centerpieces set for a wedding reception",
  },
];

export default function ImageMarquee() {
  const track = [...MARQUEE_IMAGES, ...MARQUEE_IMAGES];

  return (
    <section className="overflow-hidden bg-background py-12">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-32" />
        <div className="marquee-track flex w-max animate-marquee gap-4 sm:gap-6">
          {track.map((image, i) => (
            <div
              key={`${image.file}-${i}`}
              className="h-52 w-80 shrink-0 overflow-hidden rounded-xl shadow-sm sm:h-64 sm:w-96"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/${image.file}`}
                alt={image.alt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
