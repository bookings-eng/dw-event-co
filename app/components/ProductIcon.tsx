export default function ProductIcon({
  name,
  className = "h-12 w-12 text-brand/60",
}: {
  name: string;
  className?: string;
}) {
  const lower = name.toLowerCase();

  if (lower.includes("chair")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className={className}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 3v9h12V3M6 12v9M18 12v5a2 2 0 01-2 2H8a2 2 0 01-2-2M6 16h12"
        />
      </svg>
    );
  }

  if (lower.includes("table")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className={className}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 8h18M5 8v11M19 8v11M9 8V5a1 1 0 011-1h4a1 1 0 011 1v3"
        />
      </svg>
    );
  }

  if (lower.includes("linen")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className={className}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6h16v3a4 4 0 01-4 4H8a4 4 0 01-4-4V6zM8 13v7M16 13v7M6 20h12"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10"
      />
    </svg>
  );
}
