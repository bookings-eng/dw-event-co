import Link from "next/link";
import Header from "./Header";
import BookNowButton from "./BookNowButton";

export default function Hero() {
  return (
    <section
      className="relative flex min-h-[560px] items-center justify-center bg-[#14311d] bg-cover bg-center px-4 py-24 text-center sm:min-h-[680px]"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(8,16,10,0.75) 0%, rgba(8,16,10,0.35) 22%, rgba(8,16,10,0.45) 55%, rgba(8,16,10,0.65) 100%), url('/images/victoria-priessnitz-nT7RTgQ3cu8-unsplash.jpg')",
      }}
    >
      <Header overlay showCart />
      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6">
        <h1
          className="hero-reveal text-4xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl"
        >
          Get a Quote Instantly!
        </h1>
        <p
          className="hero-reveal max-w-xl text-base text-white/90 sm:text-lg"
          style={{ animationDelay: "120ms" }}
        >
          Premium tables and chairs, ready for your next event in Keller,
          Southlake, Colleyville, NRH, Trophy Club and the surrounding north
          Fort Worth area.
        </p>
        <div className="hero-reveal" style={{ animationDelay: "220ms" }}>
          <BookNowButton />
        </div>
        <Link
          href="/products"
          className="hero-reveal text-sm font-medium text-white/80 underline underline-offset-4 transition-colors hover:text-white"
          style={{ animationDelay: "300ms" }}
        >
          or Browse Our Rentals
        </Link>
      </div>
    </section>
  );
}
