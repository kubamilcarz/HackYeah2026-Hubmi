import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { MiddlemanView } from "@/components/middleman/MiddlemanView";

export const metadata: Metadata = {
  title: "Asystent wdrożeniowy dla samorządów | Splot",
  description:
    "Generator pakietu wdrożeniowego usług społecznych dla samorządów (CUS i OPS) na bazie innowacji ROPS Kraków: standard usługi, kadra, koszty i montaż finansowy 70/15/15.",
};

export default function MiddlemanPage() {
  return (
    <HubShell activeItem="middleman">
      <nav aria-label="Okruszki" className="hub-breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Middleman JST</span>
      </nav>

      <PageHeader
        title="Middleman JST: Pakiet wdrożeniowy dla gmin"
        description="Adaptuj przetestowane innowacje społeczne do realiów swojej gminy lub CUS. Wygeneruj standard usługi, kalkulację kosztów i montaż finansowy FERS / PFRON."
      />

      <Suspense fallback={<div className="p-8 text-center type-body text-[var(--content-secondary)]">Ładowanie asystenta wdrożeniowego...</div>}>
        <MiddlemanView />
      </Suspense>
    </HubShell>
  );
}
