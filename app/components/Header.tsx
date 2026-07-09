import Image from "next/image";
import Link from "next/link";
import CartIndicator from "./CartIndicator";

type HeaderProps = {
  overlay?: boolean;
  showCart?: boolean;
};

export default function Header({ overlay = false, showCart = false }: HeaderProps) {
  return (
    <header
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-20 w-full"
          : "sticky top-0 z-40 w-full border-b border-black/5 bg-white/95 backdrop-blur"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src={overlay ? "/logo-white.png" : "/logo-black.png"}
            alt="DW Event Co"
            width={228}
            height={113}
            priority={overlay}
            className="h-8 w-auto sm:h-10"
          />
        </Link>

        {showCart ? (
          <CartIndicator overlay={overlay} />
        ) : (
          <a
            href="tel:6824786430"
            className={`flex items-center gap-2 text-sm font-medium transition-colors sm:text-base ${
              overlay
                ? "text-white hover:text-white/80"
                : "text-foreground hover:text-brand"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`h-4 w-4 sm:h-5 sm:w-5 ${overlay ? "text-white" : "text-brand"}`}
              aria-hidden="true"
            >
              <path d="M6.62 10.79a15.09 15.09 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.57.57 1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.49a1 1 0 011 1 11.36 11.36 0 00.57 3.57 1 1 0 01-.25 1.02l-2.2 2.2z" />
            </svg>
            <span className="hidden sm:inline">682-478-6430</span>
          </a>
        )}
      </div>
    </header>
  );
}
