import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { IdeaCreatorView } from "@/components/kreator/IdeaCreatorView";

export const metadata: Metadata = {
  title: "Kreator Pomysłów i Wniosków FERS | Splot",
  description:
    "Przekształć problem społeczny w działającą innowację. Całoroczna Fiszka Pomysłu oraz Generator Wniosków Grantowych FERS Action 5.1 (do 50 000 zł) ROPS Kraków.",
};

export default function KreatorPage() {
  return (
    <HubShell activeItem="kreator">
      <nav aria-label="Okruszki" className="hub-breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Kreator Pomysłów & FERS</span>
      </nav>

      <PageHeader
        title="Kreator Pomysłów i Generator Wniosków FERS"
        description="Rozwiń nową ideę wspierającą włączenie społeczne i deinstytucjonalizację w Małopolsce. Złóż szybką fiszkę koncepcyjną lub przygotuj wniosek mikrograntowy do 50 000 PLN."
      />

      <Suspense fallback={<div className="p-8 text-center type-body">Ładowanie kreatora...</div>}>
        <IdeaCreatorView />
      </Suspense>
    </HubShell>
  );
}
