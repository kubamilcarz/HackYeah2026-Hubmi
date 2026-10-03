import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HubShell } from "@/components/hub/HubShell";
import { InnovationDetailView } from "@/components/innovations/InnovationDetailView";
import { getInnovationBySlug } from "@/lib/api";

type InnowacjeDetailPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: InnowacjeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const innovation = await getInnovationBySlug(slug);
  if (innovation) {
    return {
      title: `${innovation.title} | Biblioteka Innowacji | Splot`,
      description: innovation.short_summary,
    };
  }

  return {
    title: "Szczegóły innowacji | Splot",
  };
}

export default async function InnowacjeDetailPage({ params }: InnowacjeDetailPageProps) {
  const { slug } = await params;
  const innovation = await getInnovationBySlug(slug);

  if (!innovation) {
    notFound();
  }

  return (
    <HubShell activeItem="innowacje">
      <nav aria-label="Okruszki" className="hub-breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span aria-hidden="true">›</span>
        <Link href="/innowacje">Biblioteka Innowacji</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{innovation.title}</span>
      </nav>
      <InnovationDetailView innovation={innovation} />
    </HubShell>
  );
}
