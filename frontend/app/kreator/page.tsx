import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { IdeaCreatorView } from "@/components/kreator/IdeaCreatorView";

export const metadata: Metadata = {
  title: "Kreator Innowacji Społecznych i Wniosków FERS | Splot",
  description: "Zgłoś szybką fiszkę pomysłu lub przygotuj pełny wniosek grantowy FERS do 50 000 zł.",
};

export default function KreatorPage() {
  return (
    <HubShell activeItem="kreator">
      <nav aria-label="Okruszki" className="hub-breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Kreator innowacji</span>
      </nav>

      <PageHeader
        title="Kreator innowacji społecznych"
        description="Zgłoś pomysł w formie 3-minutowej fiszki lub przygotuj 12-punktowy wniosek grantowy FERS (do 50 000 zł)."
      />

      <Suspense fallback={<div className="p-8 text-center type-body">Ładowanie kreatora...</div>}>
        <IdeaCreatorView />
      </Suspense>
    </HubShell>
  );
}
