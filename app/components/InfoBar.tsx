const items = [
  "$25 flat delivery",
  "Book online in minutes",
  "Setup made simple",
];

export default function InfoBar() {
  return (
    <div className="w-full bg-white border-b border-black/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 px-4 py-4 text-center text-sm font-medium text-foreground/80 sm:flex-row sm:gap-6 sm:text-base">
        {items.map((item) => (
          <span key={item} className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                className="h-3 w-3"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
