import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalDoc from "../../components/LegalDoc";
import { getLegalDoc, isKnownLegalSlug } from "@/lib/legal";

// Permanent, version-pinned permalinks (e.g. /legal/rental-agreement-v1.0).
// This is the link the confirmation email points to — it must keep
// resolving to that exact version even after a newer one is published.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: isKnownLegalSlug(slug) ? slug : "Not found" };
}

export default async function LegalVersionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isKnownLegalSlug(slug)) notFound();

  const { html } = getLegalDoc(slug);
  return <LegalDoc html={html} />;
}
