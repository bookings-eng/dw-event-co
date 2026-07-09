const MARQUEE_IMAGES = [
  "jose-leon-aAe0I5DG2Yk-unsplash.jpg",
  "jose-marroquin-_4rTolL0qjs-unsplash.jpg",
  "micheile-henderson-KWHoxdn1IUE-unsplash.jpg",
  "nate-johnston-xX6cPwIzgto-unsplash.jpg",
  "pexels-calvin-mwanza-2955218-12868833.jpg",
  "pexels-daniel-richard-8570713-6292987.jpg",
  "pexels-luis-erives-1457235-36301531.jpg",
  "pexels-michael-morse-1376649.jpg",
  "pexels-taylor-thompson-865581658-35870516.jpg",
  "pexels-wolfart-36807077.jpg",
  "troy-olson-Gw2ODMZDeK4-unsplash.jpg",
  "victoria-priessnitz-nT7RTgQ3cu8-unsplash.jpg",
];

export default function ImageMarquee() {
  const track = [...MARQUEE_IMAGES, ...MARQUEE_IMAGES];

  return (
    <section className="overflow-hidden bg-background py-12">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-32" />
        <div className="flex w-max animate-marquee gap-4 sm:gap-6">
          {track.map((file, i) => (
            <div
              key={`${file}-${i}`}
              className="h-52 w-80 shrink-0 overflow-hidden rounded-xl shadow-sm sm:h-64 sm:w-96"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/${file}`}
                alt=""
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
