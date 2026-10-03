"use client";

import { Check } from "@phosphor-icons/react";
import { Dialog } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Tag";
import { usePersona, type PersonaProfile, type PersonaKey } from "@/contexts/PersonaContext";

type PersonaSwitcherModalProps = {
  onPersonaChanged?: (persona: PersonaProfile) => void;
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
      className="persona-modal"
      description="Wybierz rolę, aby przetestować platformę bez konieczności logowania."
      onOpenChange={(open) => {
        if (!open) closePersonaModal();
      }}
      open={isPersonaModalOpen}
      title="Profile demonstracyjne"
    >
      <div className="persona-switcher-grid">
        {personas.map((persona) => {
          const isActive = persona.key === activePersonaKey;
          const locationOrOrg = persona.organization
            ? persona.organization
            : persona.municipality
              ? persona.countyName && persona.countyName !== persona.municipality
                ? `${persona.municipality}, pow. ${persona.countyName}`
                : persona.municipality
              : null;

          return (
            <button
              aria-pressed={isActive}
              className={`persona-card${isActive ? " persona-card--active" : ""}`}
              key={persona.key}
              onClick={() => handleSelect(persona.key)}
              type="button"
            >
              <div className="persona-card__header">
                <div className="persona-card__avatar" aria-hidden="true">
                  <span>{persona.initials}</span>
                </div>
                <div className="persona-card__titles">
                  <div className="persona-card__title-row">
                    <span className="persona-card__name">{persona.name}</span>
                    {isActive ? (
                      <span className="persona-card__status-pill persona-card__status-pill--active">
                        <Check aria-hidden="true" size={13} weight="bold" />
                        Aktywny
                      </span>
                    ) : (
                      <span className="persona-card__status-pill persona-card__status-pill--idle">
                        Wybierz
                      </span>
                    )}
                  </div>
                  <div className="persona-card__meta">
                    <Badge label={persona.role} variant={persona.roleBadge} />
                    {locationOrOrg && (
                      <span className="persona-card__location">{locationOrOrg}</span>
                    )}
                  </div>
                </div>
              </div>

              <p className="persona-card__desc">{persona.description}</p>
            </button>
          );
        })}
      </div>

      <p className="persona-switcher__hint">
        Wybór profilu automatycznie uzupełnia formularze przykładowymi danymi testowymi.
      </p>
    </Dialog>
  );
}
