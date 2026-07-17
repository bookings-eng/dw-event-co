"use client";

import { useState } from "react";

export default function CopyAcceptanceRecord({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-foreground/70 transition-colors hover:bg-black/5"
    >
      {copied ? "Copied" : "Copy record"}
    </button>
  );
}
