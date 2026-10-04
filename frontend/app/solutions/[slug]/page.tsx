import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HubShell } from "@/components/hub/HubShell";
import { SolutionDetailContent } from "@/components/solutions/SolutionDetailContent";
import { SolutionDetailHero } from "@/components/ui/SolutionDetail";
import { InnovationDetailView } from "@/components/innovations/InnovationDetailView";
import { getSolution } from "@/lib/solutions";
import { getInnovationBySlug } from "@/lib/api";

type SolutionDetailPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: SolutionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (solution) return { title: `${solution.title} | Splot`, description: solution.summary };

  const innovation = await getInnovationBySlug(slug);
  if (innovation) return { title: `${innovation.title} | Splot`, description: innovation.short_summary };

  return {};
}

export default async function SolutionDetailPage({ params }: SolutionDetailPageProps) {
  const { slug } = await params;
  const solution = getSolution(slug);

  if (!solution) {
    const innovation = await getInnovationBySlug(slug);
    if (!innovation) notFound();

    return (
      <HubShell activeItem="solutions">
        <nav aria-label="Okruszki" className="hub-breadcrumbs">
          <Link href="/">Strona główna</Link>
          <span aria-hidden="true">›</span>
          <Link href="/solutions">Dopasuj pomoc</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{innovation.title}</span>
        </nav>
        <InnovationDetailView innovation={innovation} />
      </HubShell>
    );
  }

  return (
    <HubShell activeItem="solutions">
      <nav aria-label="Okruszki" className="hub-breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span aria-hidden="true">›</span>
        <Link href="/solutions">Dopasuj pomoc</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{solution.title}</span>
      </nav>
      <article className="solution-detail">
        <SolutionDetailHero image={solution.image} matchLabel={`${solution.matchScore}% dopasowania`} summary={solution.summary} title={solution.title} />
        <SolutionDetailContent solution={solution} />
      </article>
    </HubShell>
  );
}

