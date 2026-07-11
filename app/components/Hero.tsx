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
        <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-5xl md:text-6xl">
          Get a Quote Instantly!
        </h1>
        <p className="max-w-xl text-base text-white/90 sm:text-lg">
          Party and event equipment, delivered right to your door in Keller,
          Southlake, Colleyville, Fort Worth, and the surrounding DFW area.
        </p>
        <BookNowButton />
        <Link
          href="/products"
          className="text-sm font-medium text-white/80 underline underline-offset-4 transition-colors hover:text-white"
        >
          or Browse Our Rentals
        </Link>
      </div>
    </section>
  );
}
