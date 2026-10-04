import type { Metadata } from "next";
import Link from "next/link";
import { HubShell } from "@/components/hub/HubShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { InnovationLibraryView } from "@/components/innovations/InnovationLibraryView";
import { getCategories, getInnovations } from "@/lib/api";

export const metadata: Metadata = {
  title: "Biblioteka Innowacji Społecznych | Splot",
  description:
    "Katalog sprawdzonych innowacji społecznych ROPS Kraków: usługi, technologie, narzędzia i modele pracy dla Małopolski.",
};

export default async function InnowacjePage() {
  const [categories, innovations] = await Promise.all([
    getCategories(),
    getInnovations(),
  ]);

  return (
    <HubShell activeItem="innowacje">
      <nav aria-label="Okruszki" className="hub-breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Biblioteka Innowacji</span>
      </nav>

      <PageHeader
        description="Sprawdzone rozwiązania społeczne opracowane i przetestowane w Małopolsce. Poznaj produkty, usługi i modele pracy gotowe do adaptacji w Twojej gminie lub organizacji."
        title="Biblioteka Innowacji Społecznych ROPS"
      />

      <InnovationLibraryView
        categories={categories}
        initialInnovations={innovations}
      />
    </HubShell>
  );
}
