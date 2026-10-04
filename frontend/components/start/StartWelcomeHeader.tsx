"use client";

import { usePersona } from "@/contexts/PersonaContext";

const vocativeMap: Record<string, string> = {
  "Anna Nowak": "Anno",
  "Marek Wiśniewski": "Marku",
  "Katarzyna Zielińska": "Katarzyno",
  "dr Piotr Adamski": "Piotrze",
  "Magdalena Kaczmarczyk": "Magdaleno",
};

export function StartWelcomeHeader() {
  const { activePersona } = usePersona();
  const greetingName =
    vocativeMap[activePersona.name] ||
    activePersona.name.split(" ")[0] ||
    "";

  return (
    <header className="start-page__welcome">
      <h1 className="type-h1">
        {greetingName ? `Witaj, ${greetingName}!` : "Witaj w Splocie!"}{" "}
        <span aria-hidden="true">👋</span>
      </h1>
      <p className="type-body">Razem możemy więcej. Co chcesz dziś zrobić?</p>
    </header>
  );
}
