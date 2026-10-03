"use client";

import { useState, type MouseEvent } from "react";
import {
  Bell,
  DotsThree,
  House,
  MapTrifold,
  Buildings,
  HandHeart,
  UsersThree,
} from "@phosphor-icons/react";
import { AppNavigation, type NavigationItem } from "@/components/ui/AppNavigation";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";

const desktopItems: NavigationItem[] = [
  { id: "start", label: "Start", href: "#start", icon: House },
  { id: "needs", label: "Potrzeby", href: "#potrzeby", icon: UsersThree },
  { id: "solutions", label: "Rozwiązania", href: "#rozwiazania", icon: HandHeart },
  { id: "map", label: "Mapa", href: "#mapa", icon: MapTrifold },
  { id: "organizations", label: "Organizacje", href: "#organizacje", icon: Buildings },
  { id: "alerts", label: "Powiadomienia", href: "#powiadomienia", icon: Bell },
];

const mobileItems = desktopItems.filter(({ id }) => id !== "organizations" && id !== "alerts");

type PreviewProps = {
  mode: "desktop" | "mobile";
  title: string;
};

function NavigationPreview({ mode, title }: PreviewProps) {
  const [activeItem, setActiveItem] = useState("needs");

  function handleClick(event: MouseEvent<HTMLElement>) {
    const link = (event.target as Element).closest<HTMLAnchorElement>("a");
    if (!link) return;

    event.preventDefault();
    const itemId = link.dataset.navigationItem;
    if (itemId) setActiveItem(itemId);
  }

  return (
    <section className={`navigation-showcase__preview navigation-showcase__preview--${mode}`} onClick={handleClick}>
      <div className="navigation-showcase__heading">
        <h3 className="type-h3">{title}</h3>
        <code>{mode === "mobile" ? "&lt; 1024px" : "≥ 1024px"}</code>
      </div>
      <AppNavigation
        activeItem={activeItem}
        brandHref="#navigation"
        desktopItems={desktopItems}
        mobileItems={mobileItems}
        mode={mode}
      />
    </section>
  );
}

function PageNavigationPreview({ mode, title }: PreviewProps) {
  const [lastAction, setLastAction] = useState("Gotowe");

  return (
    <section className="page-navigation-showcase__preview">
      <div className="navigation-showcase__heading">
        <h3 className="type-h3">{title}</h3>
        <code>{mode === "mobile" ? "&lt; 1024px" : "≥ 1024px"}</code>
      </div>
      <PageNavigationBar
        action={{
          icon: DotsThree,
          label: "Więcej opcji",
          onClick: () => setLastAction("Wybrano więcej opcji"),
        }}
        className={`page-navigation-bar--preview-${mode}`}
        onBack={() => setLastAction("Wybrano powrót")}
        title="Szczegóły potrzeby"
      />
      <p aria-live="polite" className="page-navigation-showcase__status">{lastAction}</p>
    </section>
  );
}

export function NavigationShowcase() {
  return (
    <div className="navigation-showcase">
      <PageNavigationPreview mode="mobile" title="Pasek strony na telefonie" />
      <PageNavigationPreview mode="desktop" title="Pasek strony na komputerze" />
      <NavigationPreview mode="mobile" title="Dolna nawigacja na telefonie" />
      <NavigationPreview mode="desktop" title="Boczna nawigacja na komputerze" />
    </div>
  );
}
