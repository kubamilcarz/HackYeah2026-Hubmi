"use client";

import { useState, type ReactNode } from "react";
import { Bell, Briefcase, Compass, HandHeart, House, Lightbulb } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { AppNavigation, type NavigationItem } from "@/components/ui/AppNavigation";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import { Toast, ToastViewport } from "@/components/ui/Toast";

const navigationItems: NavigationItem[] = [
  { id: "home", label: "Strona główna", href: "/", icon: House },
  { id: "report-need", label: "Zgłoś potrzebę", href: "/needs/new", icon: HandHeart },
  { id: "solutions", label: "Rozwiązania", href: "/solutions", icon: Lightbulb },
];

type HubShellProps = {
  activeItem: string;
  children: ReactNode;
};

/** Shared application framing for public resident tasks. */
export function HubShell({ activeItem, children }: HubShellProps) {
  const router = useRouter();
  const [toast, setToast] = useState<{ description: string; title: string } | null>(null);

  return (
    <div className="hub-shell">
      <AppNavigation activeItem={activeItem} items={navigationItems} />
      <div className="hub-shell__content">
        <PageNavigationBar
          actions={[
            { icon: Compass, label: "Odkrywaj rozwiązania", onClick: () => router.push("/solutions") },
            { icon: Bell, label: "Powiadomienia", onClick: () => setToast({ title: "Powiadomienia", description: "Nie masz nowych powiadomień." }) },
            { icon: Briefcase, label: "Moje działania", onClick: () => setToast({ title: "Moje działania", description: "Ten widok jest jeszcze w przygotowaniu." }) },
          ]}
          profile={{ initials: "AK", label: "Profil Anny Kowalskiej", onClick: () => setToast({ title: "Profil Anny Kowalskiej", description: "Profil użytkowniczki jest jeszcze w przygotowaniu." }) }}
          search={{ action: "/solutions", placeholder: "Szukaj rozwiązań, tematów, osób..." }}
        />
        <main className="hub-shell__main">{children}</main>
      </div>
      <ToastViewport>{toast && <Toast description={toast.description} onDismiss={() => setToast(null)} title={toast.title} />}</ToastViewport>
    </div>
  );
}
