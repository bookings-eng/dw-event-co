import Header from "./Header";

type LegalDocProps = {
  html: string;
};

// The source markdown already opens with its own H1 and a "Version X —
// Effective [date]" line, so this wrapper adds no heading of its own.
export default function LegalDoc({ html }: LegalDocProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <main className="mx-auto w-full max-w-[720px] flex-1 px-4 py-12 sm:px-6">
        <div className="legal-prose" dangerouslySetInnerHTML={{ __html: html }} />
      </main>
    </div>
  );
}
