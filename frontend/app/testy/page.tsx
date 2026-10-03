import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { PilotTesterView } from "@/components/testy/PilotTesterView";

export const metadata: Metadata = {
  title: "Tester Innowacji Społecznych | Splot",
  description:
    "Pilotaże innowacji w Małopolsce: rekrutacja testerów (mieszkańcy, NGO, eksperci) oraz ankiety ewaluacji dostępności i użyteczności WCAG 2.2 AA.",
};

export default function TestyPage() {
  return (
    <HubShell activeItem="testy">
      <nav aria-label="Okruszki" className="hub-breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Tester Innowacji</span>
      </nav>

      <PageHeader
        title="Tester Innowacji Społecznych ROPS Kraków"
        description="Weź udział w pilotażach nowych rozwiązań w Małopolsce. Testuj prototypy, oceniaj dostępność i pomagaj twórcom udoskonalać usługi społeczne."
      />

      <Suspense fallback={<div className="p-8 text-center type-body">Ładowanie pilotaży...</div>}>
        <PilotTesterView />
      </Suspense>
    </HubShell>
  );
}
