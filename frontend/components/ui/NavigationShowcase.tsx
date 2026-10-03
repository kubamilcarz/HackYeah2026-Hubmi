"use client";

import { useState, type MouseEvent } from "react";
import {
  Bell,
  BookOpen,
  Briefcase,
  CalendarDots,
  Compass,
  Flag,
  Lightbulb,
  House,
  HandHeart,
  UsersThree,
} from "@phosphor-icons/react";
import { AppNavigation, type NavigationItem } from "@/components/ui/AppNavigation";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";

const desktopItems: NavigationItem[] = [
  { id: "home", label: "Strona główna", href: "#strona-glowna", icon: House },
  { id: "report-need", label: "Zgłoś potrzebę", href: "#zglos-potrzebe", icon: HandHeart },
  { id: "solutions", label: "Rozwiązania", href: "#rozwiazania", icon: Lightbulb },
  { id: "challenges", label: "Wyzwania", href: "#wyzwania", icon: Flag },
  { id: "community", label: "Społeczność", href: "#spolecznosc", icon: UsersThree },
  { id: "knowledge", label: "Zasoby wiedzy", href: "#zasoby-wiedzy", icon: BookOpen },
  { id: "events", label: "Wydarzenia", href: "#wydarzenia", icon: CalendarDots },
];

type PreviewProps = { title: string };

function NavigationPreview({ title }: PreviewProps) {
  const [activeItem, setActiveItem] = useState("solutions");

  function handleClick(event: MouseEvent<HTMLElement>) {
    const link = (event.target as Element).closest<HTMLAnchorElement>("a");
    if (!link) return;

    event.preventDefault();
    const itemId = link.dataset.navigationItem;
    if (itemId) setActiveItem(itemId);
  }

  return (
    <section className="navigation-showcase__preview" onClick={handleClick}>
      <div className="navigation-showcase__heading">
        <h3 className="type-h3">{title}</h3>
        <code>desktop</code>
      </div>
      <AppNavigation
        activeItem={activeItem}
        brandHref="#navigation"
        items={desktopItems}
      />
    </section>
  );
}

function PageNavigationPreview({ title }: PreviewProps) {
  const [lastAction, setLastAction] = useState("Gotowe");

  return (
    <section className="page-navigation-showcase__preview">
      <div className="navigation-showcase__heading">
        <h3 className="type-h3">{title}</h3>
        <code>desktop</code>
      </div>
      <PageNavigationBar
        actions={[
          { icon: Compass, label: "Odkrywaj", onClick: () => setLastAction("Wybrano odkrywanie") },
          { icon: Bell, label: "Powiadomienia", onClick: () => setLastAction("Wybrano powiadomienia") },
          { icon: Briefcase, label: "Moje działania", onClick: () => setLastAction("Wybrano moje działania") },
        ]}
        className="page-navigation-bar--preview-desktop"
        onBack={() => setLastAction("Wybrano powrót")}
        profile={{ href: "#profil", initials: "AK", label: "Profil Anny Kowalskiej" }}
        search={{ action: "#wyszukaj" }}
      />
      <p aria-live="polite" className="page-navigation-showcase__status">{lastAction}</p>
    </section>
  );
}

export function NavigationShowcase() {
  return (
    <div className="navigation-showcase">
      <PageNavigationPreview title="Pasek strony" />
      <NavigationPreview title="Boczna nawigacja" />
    </div>
  );
}
