import type { Metadata } from "next";
import Link from "next/link";
import { HubShell } from "@/components/hub/HubShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChallengesRegionalView } from "@/components/challenges/ChallengesRegionalView";
import { getAdminTrends, getChallenges, getCounties, getInnovations } from "@/lib/api";

export const metadata: Metadata = {
  title: "Kondycja Małopolski & Wyzwania Regionalne | Splot",
  description:
    "Diagnoza wyzwań społecznych regionu Małopolski, profile 22 powiatów, raporty ROPS oraz analityka trendów i Białych Plam.",
};

export default async function WyzwaniaPage() {
  const [counties, challenges, trends, innovations] = await Promise.all([
    getCounties(),
    getChallenges(),
    getAdminTrends(),
    getInnovations(),
  ]);

  return (
    <HubShell activeItem="wyzwania">
      <nav aria-label="Okruszki" className="hub-breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Kondycja Małopolski & Wyzwania</span>
      </nav>

      <PageHeader
        description="Poznaj kluczowe wyzwania społeczne Małopolski na podstawie raportów ROPS Kraków, wskaźniki demograficzne 22 powiatów oraz analitykę Białych Plam."
        title="Kondycja Małopolski & Mapa Wyzwań"
      />

      <ChallengesRegionalView
        allInnovations={innovations}
        challenges={challenges}
        counties={counties}
        trends={trends}
      />
    </HubShell>
  );
}
