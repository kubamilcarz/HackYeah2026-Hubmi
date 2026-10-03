import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HubShell } from "@/components/hub/HubShell";
import { SolutionDetailContent } from "@/components/solutions/SolutionDetailContent";
import { SolutionDetailHero } from "@/components/ui/SolutionDetail";
import { getSolution } from "@/lib/solutions";

type SolutionDetailPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: SolutionDetailPageProps): Promise<Metadata> {
  const solution = getSolution((await params).slug);
  return solution ? { title: `${solution.title} | Splot`, description: solution.summary } : {};
}

export default async function SolutionDetailPage({ params }: SolutionDetailPageProps) {
  const solution = getSolution((await params).slug);
  if (!solution) notFound();

  return (
    <HubShell activeItem="solutions">
      <nav aria-label="Okruszki" className="hub-breadcrumbs"><Link href="/">Strona główna</Link><span aria-hidden="true">›</span><Link href="/solutions">Rozwiązania</Link><span aria-hidden="true">›</span><span aria-current="page">{solution.title}</span></nav>
      <article className="solution-detail">
        <SolutionDetailHero image={solution.image} matchLabel={`${solution.matchScore}% dopasowania`} summary={solution.summary} title={solution.title} />
        <SolutionDetailContent solution={solution} />
      </article>
    </HubShell>
  );
}
