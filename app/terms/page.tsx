import type { Metadata } from "next";
import LegalDoc from "../components/LegalDoc";
import { currentVersionSlug, getLegalDoc } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing use of the DW Event Co website and booking service.",
};

export default function TermsOfServicePage() {
  const { html } = getLegalDoc(currentVersionSlug("terms-of-service"));
  return <LegalDoc html={html} />;
}
