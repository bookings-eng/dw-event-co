import fs from "fs";
import path from "path";
import { marked } from "marked";

export const CURRENT_AGREEMENT_VERSION = "1.0";

export type LegalDocType = "rental-agreement" | "privacy-policy" | "terms-of-service";

// Current published version per doc. Bumping a version means: add the new
// file to content/legal/, update the entry here, never touch the old file.
const CURRENT_VERSION_SLUG: Record<LegalDocType, string> = {
  "rental-agreement": `rental-agreement-v${CURRENT_AGREEMENT_VERSION}`,
  "privacy-policy": "privacy-policy-v1.0",
  "terms-of-service": "terms-of-service-v1.0",
};

// Every version file that has ever been published. A version stored on an
// old booking must keep resolving even after CURRENT_VERSION_SLUG moves on.
const KNOWN_SLUGS = new Set([
  "rental-agreement-v1.0",
  "privacy-policy-v1.0",
  "terms-of-service-v1.0",
]);

const LEGAL_DIR = path.join(process.cwd(), "content", "legal");

// The rental agreement source file has a trailing section for Dylan's eyes
// only — implementation notes, open items. It must never reach a customer.
const IMPLEMENTATION_NOTES_MARKER = "\n# IMPLEMENTATION NOTES";

function readLegalDocRaw(slug: string): string {
  if (!KNOWN_SLUGS.has(slug)) {
    throw new Error(`Unknown legal document version: ${slug}`);
  }
  const raw = fs.readFileSync(path.join(LEGAL_DIR, `${slug}.md`), "utf8");
  const notesIndex = raw.indexOf(IMPLEMENTATION_NOTES_MARKER);
  return notesIndex === -1 ? raw : raw.slice(0, notesIndex);
}

export function renderLegalHtml(raw: string): string {
  const html = marked.parse(raw, { gfm: true }) as string;
  // marked emits bare <table> elements — wrap each so wide tables (the
  // cancellation table, the replacement-cost schedule) scroll horizontally
  // instead of breaking the phone layout. See .legal-table-wrap in globals.css.
  return html.replace(/<table>/g, '<div class="legal-table-wrap"><table>').replace(
    /<\/table>/g,
    "</table></div>"
  );
}

export function currentVersionSlug(docType: LegalDocType): string {
  return CURRENT_VERSION_SLUG[docType];
}

export function agreementVersionSlug(version: string): string {
  const slug = `rental-agreement-v${version}`;
  if (!KNOWN_SLUGS.has(slug)) {
    // Booking references a version whose file no longer exists — fall back
    // to current rather than 500ing the confirmation email.
    return CURRENT_VERSION_SLUG["rental-agreement"];
  }
  return slug;
}

export function getLegalDoc(slug: string): { raw: string; html: string } {
  const raw = readLegalDocRaw(slug);
  return { raw, html: renderLegalHtml(raw) };
}

export function isKnownLegalSlug(slug: string): boolean {
  return KNOWN_SLUGS.has(slug);
}
