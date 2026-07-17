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

function renderMarkdown(raw: string): string {
  return marked.parse(raw, { gfm: true }) as string;
}

export function renderLegalHtml(raw: string): string {
  const html = renderMarkdown(raw);
  // marked emits bare <table> elements — wrap each so wide tables (the
  // cancellation table, the replacement-cost schedule) scroll horizontally
  // instead of breaking the phone layout. See .legal-table-wrap in globals.css.
  return html.replace(/<table>/g, '<div class="legal-table-wrap"><table>').replace(
    /<\/table>/g,
    "</table></div>"
  );
}

// Email clients don't respect external stylesheets or CSS classes — every
// tag needs its style attribute inlined, and layout has to stay table-safe
// (no flex/grid). This walks the same marked output and inlines a fixed
// style per tag, preserving any existing attributes (e.g. GFM column
// alignment on <td align="right">).
const EMAIL_TAG_STYLES: Record<string, string> = {
  h1: "font-size:20px;font-weight:700;margin:20px 0 10px;color:#1a1a1a;",
  h2: "font-size:17px;font-weight:700;margin:20px 0 8px;padding-top:8px;border-top:1px solid #e5e5e5;color:#1a1a1a;",
  h3: "font-size:15px;font-weight:600;margin:14px 0 6px;color:#1a1a1a;",
  p: "margin:0 0 12px;line-height:1.6;color:#333333;",
  ul: "margin:0 0 12px;padding-left:20px;",
  ol: "margin:0 0 12px;padding-left:20px;",
  li: "margin-bottom:5px;line-height:1.5;color:#333333;",
  blockquote:
    "margin:12px 0;padding:10px 14px;border-left:3px solid #209d50;background:#f2f8f4;color:#555555;",
  hr: "margin:20px 0;border:none;border-top:1px solid #dddddd;",
  table: "width:100%;border-collapse:collapse;margin:14px 0;font-size:13px;",
  th: "background:#209d50;color:#ffffff;padding:8px 10px;text-align:left;border:1px solid #dddddd;",
  td: "padding:8px 10px;border:1px solid #dddddd;vertical-align:top;color:#333333;",
  strong: "font-weight:700;",
  a: "color:#209d50;",
};

function styleTag(html: string, tag: string, style: string): string {
  const re = new RegExp(`<${tag}(\\s[^>]*)?>`, "g");
  return html.replace(re, (_match, attrs: string | undefined) => `<${tag}${attrs ?? ""} style="${style}">`);
}

export function renderLegalEmailHtml(raw: string): string {
  let html = renderMarkdown(raw);
  for (const [tag, style] of Object.entries(EMAIL_TAG_STYLES)) {
    html = styleTag(html, tag, style);
  }
  return html;
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

export function getLegalDocForEmail(slug: string): { raw: string; html: string } {
  const raw = readLegalDocRaw(slug);
  return { raw, html: renderLegalEmailHtml(raw) };
}

export function isKnownLegalSlug(slug: string): boolean {
  return KNOWN_SLUGS.has(slug);
}
