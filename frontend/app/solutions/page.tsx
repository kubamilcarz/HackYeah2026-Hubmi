import type { Metadata } from "next";
import Link from "next/link";
import { HubShell } from "@/components/hub/HubShell";
import { SolutionMatcher } from "@/components/solutions/SolutionMatcher";
import { PageHeader } from "@/components/ui/PageHeader";
import { solutions } from "@/lib/solutions";

export const metadata: Metadata = {
  title: "Dopasuj pomoc | Splot",
  description: "Opisz potrzebę, aby zobaczyć dopasowane rozwiązania społeczne ROPS Kraków.",
};

type SolutionsPageProps = { searchParams: Promise<{ q?: string | string[] }> };

export default async function SolutionsPage({ searchParams }: SolutionsPageProps) {
  const query = (await searchParams).q;
  const initialDescription = Array.isArray(query) ? query[0] : query;

  return (
    <HubShell activeItem="solutions">
      <nav aria-label="Okruszki" className="hub-breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Dopasuj pomoc</span>
      </nav>
      <PageHeader
        description="Opisz swoją sytuację własnymi słowami. Pomożemy Ci odkryć sprawdzone innowacje i działania wspierające."
        title="Dopasuj pomoc"
      />
      <SolutionMatcher initialDescription={initialDescription} key={initialDescription ?? "empty"} solutions={solutions} />
    </HubShell>
  );
}
