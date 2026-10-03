import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HubShell } from "@/components/hub/HubShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminDashboardView } from "@/components/admin/AdminDashboardView";

export const metadata: Metadata = {
  title: "Panel Administratora ROPS Kraków | Splot",
  description:
    "Kokpit koordynatora Małopolskiego Hubu Innowacji Społecznych: analityka trendów regionalnych, moderacja potrzeb, wykrywanie Białych plam, ocena wniosków grantowych FERS i zarządzanie dojrzałością innowacji.",
};

export default function AdminPage() {
  return (
    <HubShell activeItem="admin">
      <nav aria-label="Okruszki" className="hub-breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Panel Administratora ROPS</span>
      </nav>

      <PageHeader
        title="Panel Koordynatora ROPS Kraków"
        description="Zarządzaj zgłoszeniami mieszkańców i samorządów, moderuj luki regionalne (Białe plamy), oceniaj wnioski grantowe FERS Działanie 5.1 i monitoruj trendy innowacji społecznych w 22 powiatach Małopolski."
      />

      <Suspense fallback={<div className="p-8 text-center type-body">Ładowanie panelu administratora ROPS...</div>}>
        <AdminDashboardView />
      </Suspense>
    </HubShell>
  );
}
