import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { PilotTesterView } from "@/components/testy/PilotTesterView";

export const metadata: Metadata = {
  title: "Pilotaże społeczne | Splot",
  description:
    "Lokalne pilotaże w Małopolsce: dołącz do testów, podziel się doświadczeniem i pomóż udoskonalać usługi społeczne.",
};

export default function TestyPage() {
  return (
    <HubShell activeItem="testy">
      <nav aria-label="Okruszki" className="hub-breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Pilotaże społeczne</span>
      </nav>

      <PageHeader
        title="Testuj lokalne rozwiązania"
        description="Dołącz do pilotażu w swojej okolicy. Podziel się doświadczeniem i pomóż dopracować usługi, zanim trafią do większej liczby osób."
      />

      <Suspense fallback={<div className="p-8 text-center type-body">Ładowanie pilotaży...</div>}>
        <PilotTesterView />
      </Suspense>
    </HubShell>
  );
}
