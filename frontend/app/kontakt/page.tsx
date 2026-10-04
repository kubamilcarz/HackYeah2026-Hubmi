import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactPartnershipsView } from "@/components/kontakt/ContactPartnershipsView";

export const metadata: Metadata = {
  title: "Kontakt i partnerstwa | Splot",
  description:
    "Bezpośredni kontakt z koordynatorami i mentorami ROPS Kraków oraz międzysektorowa giełda partnerstw w Małopolsce.",
};

export default function KontaktPage() {
  return (
    <HubShell activeItem="kontakt">
      <nav aria-label="Okruszki" className="hub-breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Kontakt i partnerstwa</span>
      </nav>

      <PageHeader
        title="Współpraca i kontakt z ekspertami"
        description="Nawiąż partnerstwo międzysektorowe, skonsultuj rozwiązanie z koordynatorami ROPS Kraków lub skorzystaj z bazy wiedzy."
      />

      <Suspense fallback={<div className="p-8 text-center type-body">Ładowanie informacji...</div>}>
        <ContactPartnershipsView />
      </Suspense>
    </HubShell>
  );
}
