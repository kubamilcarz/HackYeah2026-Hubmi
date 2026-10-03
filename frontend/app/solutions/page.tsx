import type { Metadata } from "next";
import Link from "next/link";
import { HubShell } from "@/components/hub/HubShell";
import { SolutionCard } from "@/components/ui/Cards";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Rozwiązania | Splot",
  description: "Poznaj rozwiązania wspierające lokalne potrzeby społeczne.",
};

const solutions = [
  { title: "Edukacja cyfrowa bez barier", organization: "Fundacja Sąsiedzi", category: "Cyfryzacja", availability: "Zapisy są otwarte", summary: "Spotkania i materiały, które pomagają seniorom bezpiecznie korzystać z internetu.", image: { src: "/solution-digital-education.svg", alt: "Grupa osób ucząca się wspólnie korzystania z komputera" } },
  { title: "Sąsiedzkie wsparcie opiekunów", organization: "Stowarzyszenie Razem", category: "Usługi społeczne", availability: "Dostępne w Małopolsce", summary: "Grupy wsparcia i praktyczna pomoc dla osób opiekujących się bliskimi.", image: { src: "/discovery/recommendation-peer-support.jpg", alt: "Dwie osoby rozmawiające przy stole" } },
  { title: "Przestrzeń dla dobrego samopoczucia", organization: "Centrum Blisko", category: "Zdrowie psychiczne", availability: "Trwają zapisy", summary: "Bezpłatne konsultacje i warsztaty wzmacniające codzienny dobrostan.", image: { src: "/discovery/challenge-mental-health.jpg", alt: "Osoba odpoczywająca na świeżym powietrzu" } },
];

type SolutionsPageProps = { searchParams: Promise<{ q?: string | string[] }> };

export default async function SolutionsPage({ searchParams }: SolutionsPageProps) {
  const query = (await searchParams).q;
  const searchTerm = (Array.isArray(query) ? query[0] : query ?? "").trim().toLocaleLowerCase("pl");
  const matchingSolutions = solutions.filter((solution) => !searchTerm || `${solution.title} ${solution.organization} ${solution.category} ${solution.summary}`.toLocaleLowerCase("pl").includes(searchTerm));

  return (
    <HubShell activeItem="solutions">
      <PageHeader description="Zobacz działania organizacji, które mogą odpowiedzieć na lokalne potrzeby." title="Rozwiązania" />
      {searchTerm && <p className="solutions-page__result">Wyniki dla: <strong>{searchTerm}</strong></p>}
      {matchingSolutions.length > 0 ? <div className="solutions-page__grid">{matchingSolutions.map((solution) => <SolutionCard action={{ href: "/needs/new", label: "Zgłoś podobną potrzebę" }} key={solution.title} {...solution} />)}</div> : <section className="solutions-page__empty" aria-labelledby="solutions-empty-heading"><h2 className="type-h2" id="solutions-empty-heading">Nie znaleźliśmy rozwiązań</h2><p className="type-body">Spróbuj użyć innego słowa lub opisz własną potrzebę, abyśmy mogli lepiej pomóc.</p><Link className="button button--primary button--size-md" href="/needs/new">Zgłoś potrzebę</Link></section>}
    </HubShell>
  );
}
