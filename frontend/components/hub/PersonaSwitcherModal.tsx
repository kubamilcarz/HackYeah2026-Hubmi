"use client";

import { Check, User, UsersThree, Buildings, GraduationCap, ShieldCheck } from "@phosphor-icons/react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Tag";
import { usePersona, type PersonaProfile, type PersonaKey } from "@/contexts/PersonaContext";

type PersonaSwitcherModalProps = {
  onPersonaChanged?: (persona: PersonaProfile) => void;
};

const ROLE_ICONS: Record<string, typeof User> = {
  mieszkaniec: User,
  jst: Buildings,
  ngo: UsersThree,
  ekspert: GraduationCap,
  admin: ShieldCheck,
  anonymous: User,
};

export function PersonaSwitcherModal({ onPersonaChanged }: PersonaSwitcherModalProps) {
  const { activePersonaKey, closePersonaModal, isPersonaModalOpen, personas, setActivePersonaKey } = usePersona();

  function handleSelect(key: PersonaKey) {
    setActivePersonaKey(key);
    closePersonaModal();
    const selected = personas.find((p) => p.key === key);
    if (selected && onPersonaChanged) {
      onPersonaChanged(selected);
    }
  }

  return (
    <Dialog
      description="Wybierz profil demonstracyjny, aby przetestować działanie platformy z perspektywy mieszkańca, samorządu (JST), organizacji pozarządowej (NGO), eksperta lub koordynatora ROPS Kraków bez konieczności logowania."
      onOpenChange={(open) => {
        if (!open) closePersonaModal();
      }}
      open={isPersonaModalOpen}
      title="Szybkie profile demonstracyjne (Persony ROPS)"
    >
      <div className="persona-switcher-grid">
        {personas.map((persona) => {
          const isActive = persona.key === activePersonaKey;
          const RoleIcon = ROLE_ICONS[persona.roleType] || User;

          return (
            <div
              className={`persona-card${isActive ? " persona-card--active" : ""}`}
              key={persona.key}
              role="region"
              aria-label={`Profil: ${persona.name}`}
            >
              <div className="persona-card__header">
                <div className="persona-card__avatar" aria-hidden="true">
                  <span>{persona.initials}</span>
                </div>
                <div className="persona-card__titles">
                  <div className="persona-card__title-row">
                    <h3 className="persona-card__name">{persona.name}</h3>
                    {isActive && (
                      <span className="persona-card__current-pill">
                        <Check size={14} weight="bold" /> Aktywny
                      </span>
                    )}
                  </div>
                  <div className="persona-card__meta">
                    <span className="persona-card__role-with-icon">
                      <RoleIcon aria-hidden="true" size={16} />
                      <Badge label={persona.role} variant={persona.roleBadge} />
                    </span>
                    {persona.organization && (
                      <span className="persona-card__org">{persona.organization}</span>
                    )}
                    {persona.municipality && persona.countyName && (
                      <span className="persona-card__location">
                        {persona.municipality} (pow. {persona.countyName})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="persona-card__desc">{persona.description}</p>

              <div className="persona-card__path">
                <strong className="persona-card__path-label">Kluczowe ścieżki w demo:</strong>
                <span>{persona.keyPaths}</span>
              </div>

              <div className="persona-card__footer">
                <Button
                  disabled={isActive}
                  onClick={() => handleSelect(persona.key)}
                  size="sm"
                  variant={isActive ? "secondary" : "primary"}
                >
                  {isActive ? "Wybrany profil" : "Przełącz na ten profil"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="persona-switcher__hint">
        <p className="type-caption">
          Wskazówka: Zmiana persony natychmiast uzupełnia formularze (Zgłoszenie potrzeby, Kreator pomysłów, Ankiety ewaluacyjne) odpowiednimi danymi kontaktowymi i geograficznymi.
        </p>
      </div>
    </Dialog>
  );
}
