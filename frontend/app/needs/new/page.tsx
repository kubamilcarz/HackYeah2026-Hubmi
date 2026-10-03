import type { Metadata } from "next";
import Link from "next/link";
import { HubShell } from "@/components/hub/HubShell";
import { NeedReportFlow } from "@/components/needs/NeedReportFlow";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Zgłoś potrzebę | Splot",
  description: "Opisz potrzebę społeczną, aby znaleźć odpowiednie wsparcie.",
};

export default function NewNeedPage() {
  return (
    <HubShell activeItem="report-need">
      <nav aria-label="Okruszki" className="hub-breadcrumbs"><Link href="/">Strona główna</Link><span aria-hidden="true">›</span><span aria-current="page">Zgłoś potrzebę</span></nav>
      <PageHeader description="Opisz wyzwanie, z którym się mierzysz. Pomożemy Ci znaleźć rozwiązania." title="Zgłoś potrzebę" />
      <NeedReportFlow />
    </HubShell>
  );
}
