const items = [
  "$25 flat delivery",
  "Book online in minutes",
  "Setup made simple",
];

export default function InfoBar() {
  return (
    <div className="w-full bg-white border-b border-black/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 py-4 text-center text-sm font-medium text-foreground/80 sm:flex-row sm:gap-3 sm:text-base">
        {items.map((item, i) => (
          <span key={item} className="flex items-center gap-3">
            {i > 0 && <span className="hidden text-brand sm:inline">·</span>}
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
