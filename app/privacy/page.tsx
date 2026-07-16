import type { Metadata } from "next";
import LegalDoc from "../components/LegalDoc";
import { currentVersionSlug, getLegalDoc } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How DW Event Co collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
  const { html } = getLegalDoc(currentVersionSlug("privacy-policy"));
  return <LegalDoc html={html} />;
}
