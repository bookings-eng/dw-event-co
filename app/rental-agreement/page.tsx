import type { Metadata } from "next";
import LegalDoc from "../components/LegalDoc";
import { currentVersionSlug, getLegalDoc } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Rental Agreement",
  description: "The DW Event Co rental agreement — delivery, cancellation, damage, and liability terms for equipment rentals.",
};

export default function RentalAgreementPage() {
  const { html } = getLegalDoc(currentVersionSlug("rental-agreement"));
  return <LegalDoc html={html} />;
}
