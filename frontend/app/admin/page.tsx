import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminDashboardView } from "@/components/admin/AdminDashboardView";

export const metadata: Metadata = {
  title: "Panel koordynatora ROPS Kraków | Splot",
  description:
    "Zarządzanie zgłoszeniami mieszkańców, moderacja luk regionalnych (Białe plamy), ocena wniosków grantowych FERS i monitorowanie dojrzałości innowacji w Małopolsce.",
};

export default function AdminPage() {
  return (
    <HubShell activeItem="admin">
      <nav aria-label="Okruszki" className="hub-breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Panel ROPS</span>
      </nav>

      <PageHeader
        title="Panel koordynatora ROPS Kraków"
        description="Moderacja zgłoszeń mieszkańców i samorządów, zarządzanie lukami regionalnymi (Białe plamy), ocena wniosków grantowych FERS oraz monitorowanie dojrzałości innowacji społecznych w 22 powiatach Małopolski."
      />

      <Suspense fallback={<div className="p-8 text-center type-body text-[var(--content-secondary)]">Ładowanie panelu koordynatora...</div>}>
        <AdminDashboardView />
      </Suspense>
    </HubShell>
  );
}
