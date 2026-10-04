"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Code, Eye, TreeStructure } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Tag";

export type DiagramStep = {
  title: string;
  description: string;
};

type ConceptDiagramViewProps = {
  title: string;
  categoryName: string;
  countyName: string;
  recipients: string;
  steps?: DiagramStep[];
  mermaidCode?: string;
};

export function ConceptDiagramView({
  title,
  categoryName,
  countyName,
  recipients,
  steps,
  mermaidCode,
}: ConceptDiagramViewProps) {
  const [showCode, setShowCode] = useState(false);

  const defaultSteps: DiagramStep[] = steps && steps.length > 0 ? steps : [
    {
      title: "1. Diagnoza regionalna",
      description: `Wyzwania w obszarze ${countyName || "Małopolski"}. Grupa docelowa: ${recipients || "Osoby zagrożone wykluczeniem"}.`,
    },
    {
      title: "2. Innowacja społeczna",
      description: `«${title || "Nowa innowacja"}» w kategorii ${categoryName || "Włączenie społeczne"}. Nowa metoda lub usługa.`,
    },
    {
      title: "3. Okres przygotowawczy (maks. 3 m-ce)",
      description: "Opracowanie standardu usługi, procedur bezpieczeństwa oraz przeszkolenie zespołu.",
    },
    {
      title: "4. Faza testowania (maks. 9 m-cy)",
      description: "Pilotażowe wdrożenie u min. 25 beneficjentów z ewaluacją dostępności WCAG 2.2.",
    },
    {
      title: "5. Deinstytucjonalizacja & Skalowanie",
      description: "Wdrożenie stałe jako usługa społeczna w Centrum Usług Społecznych (CUS) lub OPS.",
    },
  ];

  const defaultMermaid =
    mermaidCode ||
    `graph TD
  A["1. Diagnoza: ${countyName || "Małopolska"}<br/>${recipients || "Grupa docelowa"}"] --> B["2. Innowacja: ${title || "Nowy projekt"}<br/>(${categoryName || "ROPS"})"]
  B --> C["3. Faza Przygotowawcza (3 m-ce)<br/>Standard i szkolenia"]
  C --> D["4. Faza Testowa (9 m-cy)<br/>Pilotaż u 25 testerów"]
  D --> E["5. Rezultat: Deinstytucjonalizacja<br/>Trwałe włączenie & replikacja w CUS"]`;

  return (
    <div className="creator-diagram-container" role="region" aria-label="Wizualizacja koncepcji innowacji">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <TreeStructure className="text-emerald-700" size={20} weight="bold" aria-hidden="true" />
          <h4 className="type-h3 text-slate-900">Schemat koncepcji i logiki innowacji</h4>
        </div>
        <div className="flex items-center gap-2">
          <Badge label="Model FERS Działanie 5.1" variant="info" />
          <Button
            type="button"
            variant="tertiary"
            size="sm"
            leadingIcon={showCode ? Eye : Code}
            onClick={() => setShowCode(!showCode)}
          >
            {showCode ? "Pokaż widok blokowy" : "Pokaż strukturę tekstową"}
          </Button>
        </div>
      </div>

      {showCode ? (
        <pre className="creator-diagram-code">
          {defaultMermaid}
        </pre>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
          {defaultSteps.map((s, idx) => (
            <div key={idx} className="creator-diagram-step">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="type-caption font-semibold text-emerald-800">
                    Etap {idx + 1}
                  </span>
                  {idx === defaultSteps.length - 1 ? (
                    <CheckCircle className="text-emerald-600" size={16} weight="fill" aria-hidden="true" />
                  ) : (
                    <ArrowRight className="text-slate-400 hidden sm:block -mr-1" size={14} aria-hidden="true" />
                  )}
                </div>
                <h5 className="type-body font-semibold text-slate-900 text-sm mb-1">{s.title}</h5>
                <p className="type-caption text-slate-600 text-xs leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
