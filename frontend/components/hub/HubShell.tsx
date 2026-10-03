"use client";

import { useState, type ReactNode } from "react";
import {
  Bell,
  BookOpen,
  Briefcase,
  Buildings,
  ChartLineUp,
  ChatTeardropText,
  Compass,
  Flask,
  HandHeart,
  House,
  Lightbulb,
  MapTrifold,
  Sparkle,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { AppNavigation, type NavigationItem } from "@/components/ui/AppNavigation";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import { Toast, ToastViewport } from "@/components/ui/Toast";
import { usePersona } from "@/contexts/PersonaContext";
import { PersonaSwitcherModal } from "@/components/hub/PersonaSwitcherModal";
import { Badge } from "@/components/ui/Tag";

const navigationItems: NavigationItem[] = [
  { id: "start", label: "Strona główna", href: "/start", icon: House },
  { id: "report-need", label: "Zgłoś potrzebę", href: "/needs/new", icon: HandHeart },
  { id: "innowacje", label: "Biblioteka Innowacji", href: "/innowacje", icon: BookOpen },
  { id: "wyzwania", label: "Wyzwania Regionu", href: "/wyzwania", icon: ChartLineUp },
  { id: "solutions", label: "Dopasuj pomoc", href: "/solutions", icon: Lightbulb },
  { id: "kreator", label: "Kreator Pomysłów", href: "/kreator", icon: Sparkle },
  { id: "testy", label: "Tester Innowacji", href: "/testy", icon: Flask },
  { id: "middleman", label: "Middleman JST", href: "/middleman", icon: Buildings },
  { id: "kontakt", label: "Kontakt & Partnerstwa", href: "/kontakt", icon: ChatTeardropText },
  { id: "map", label: "Mapa inicjatyw", href: "/map", icon: MapTrifold },
];

type HubShellProps = {
  activeItem: string;
  children: ReactNode;
};

/** Shared application framing for public resident tasks. */
export function HubShell({ activeItem, children }: HubShellProps) {
  const router = useRouter();
  const { activePersona, openPersonaModal } = usePersona();
  const [toast, setToast] = useState<{ description: string; title: string } | null>(null);

  return (
    <div className="hub-shell">
      <AppNavigation activeItem={activeItem} items={navigationItems} />
      <div className="hub-shell__content">
        <PageNavigationBar
          actions={[
            { icon: Compass, label: "Odkrywaj rozwiązania", onClick: () => router.push("/solutions") },
            {
              icon: Bell,
              label: "Powiadomienia",
              onClick: () =>
                setToast({
                  title: "Powiadomienia",
                  description: `Brak oczekujących powiadomień dla profilu ${activePersona.name}.`,
                }),
            },
            {
              icon: Briefcase,
              label: "Moje działania",
              onClick: () =>
                setToast({
                  title: "Moje działania",
                  description: `Zalogowano jako: ${activePersona.name} (${activePersona.role}).`,
                }),
            },
          ]}
          profile={{
            initials: activePersona.initials,
            label: `Aktywny profil demonstracyjny: ${activePersona.name} (${activePersona.role}). Kliknij, aby zmienić.`,
            onClick: openPersonaModal,
          }}
          search={{ action: "/solutions", placeholder: "Szukaj rozwiązań, tematów, osób..." }}
        />

        <div className="hub-shell__persona-bar" role="region" aria-label="Aktywny profil demonstracyjny">
          <div className="hub-shell__persona-info">
            <span className="hub-shell__persona-label">Profil demo:</span>
            <strong className="hub-shell__persona-name">{activePersona.name}</strong>
            <Badge label={activePersona.role} variant={activePersona.roleBadge} />
            {activePersona.organization && (
              <span className="hub-shell__persona-sub">{activePersona.organization}</span>
            )}
          </div>
          <button
            className="hub-shell__persona-switch-btn"
            onClick={openPersonaModal}
            type="button"
            aria-label="Zmień profil demonstracyjny persony"
          >
            <ArrowsClockwise aria-hidden="true" size={14} />
            <span>Zmień profil</span>
          </button>
        </div>

        <main className="hub-shell__main">{children}</main>
      </div>
      <PersonaSwitcherModal
        onPersonaChanged={(p) =>
          setToast({
            title: "Przełączono profil demonstracyjny",
            description: `Aktywna persona: ${p.name} (${p.role})`,
          })
        }
      />
      <ToastViewport>{toast && <Toast description={toast.description} onDismiss={() => setToast(null)} title={toast.title} />}</ToastViewport>
    </div>
  );
}
