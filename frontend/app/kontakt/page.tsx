import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactPartnershipsView } from "@/components/kontakt/ContactPartnershipsView";

export const metadata: Metadata = {
  title: "Kontakt i Giełda Partnerstw | Splot",
  description:
    "Bezpośredni kontakt z koordynatorami i mentorami ROPS Kraków oraz międzysektorowa Giełda Partnerstw JST-NGO w Małopolsce.",
};

export default function KontaktPage() {
  return (
    <HubShell activeItem="kontakt">
      <nav aria-label="Okruszki" className="hub-breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Kontakt & Partnerstwa</span>
      </nav>

      <PageHeader
        title="Platforma Aktywnej Komunikacji i Partnerstw"
        description="Zadaj pytanie koordynatorom merytorycznym ROPS Kraków, uzyskaj mentoring wdrożeniowy lub nawiąż partnerstwo międzysektorowe (JST-NGO)."
      />

      <Suspense fallback={<div className="p-8 text-center type-body">Ładowanie platformy komunikacji...</div>}>
        <ContactPartnershipsView />
      </Suspense>
    </HubShell>
  );
}
