"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowsLeftRight,
  HandHeart,
  Heart,
  Lightbulb,
  UsersThree,
} from "@phosphor-icons/react";
import type { InnovationCategory, SocialInnovation } from "@/lib/api";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { CheckboxChipGroup } from "@/components/ui/FormControls";
import { SearchFilterBar } from "@/components/ui/SearchFilterBar";
import { Badge, Tag, type TagVariant } from "@/components/ui/Tag";
import { LinearProgress } from "@/components/ui/Progress";

type InnovationLibraryViewProps = {
  initialInnovations: SocialInnovation[];
  categories: InnovationCategory[];
};

const maturityStageOptions = [
  { value: "sprawdzona", label: "Sprawdzona / Gotowa do skalowania" },
  { value: "testy", label: "Pilotaż / Ewaluacja" },
  { value: "prototyp", label: "Prototyp w fazie testów" },
  { value: "koncepcja", label: "Koncepcja" },
];

const innovationTypeOptions = [
  { value: "usluga", label: "Usługa społeczna" },
  { value: "produkt", label: "Przedmiot / Produkt fizyczny" },
  { value: "metoda", label: "Metoda / Model pracy" },
  { value: "technologia", label: "Technologia / Narzędzie cyfrowe" },
];

function stageBadge(stage: string): { label: string; variant: TagVariant } {
  switch (stage) {
    case "sprawdzona":
      return { label: "Sprawdzona", variant: "success" };
    case "testy":
      return { label: "Pilotaż", variant: "warning" };
    case "prototyp":
      return { label: "Prototyp", variant: "info" };
    case "koncepcja":
      return { label: "Koncepcja", variant: "neutral" };
    default:
      return { label: stage, variant: "neutral" };
  }
}

function typeLabel(type: string): string {
  switch (type) {
    case "usluga":
      return "Usługa społeczna";
    case "produkt":
      return "Produkt fizyczny";
    case "metoda":
      return "Metoda pracy";
    case "technologia":
    case "narzedzie_cyfrowe":
      return "Narzędzie cyfrowe";
    default:
      return type;
  }
}

export function InnovationLibraryView({ initialInnovations, categories }: InnovationLibraryViewProps) {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  // Draft filters for modal
  const [draftCategories, setDraftCategories] = useState<string[]>([]);
  const [draftStages, setDraftStages] = useState<string[]>([]);
  const [draftTypes, setDraftTypes] = useState<string[]>([]);

  const filterId = useId();

  const filteredInnovations = useMemo(() => {
    return initialInnovations.filter((item) => {
      // Wyszukiwanie tekstowe
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesQuery =
          item.title.toLowerCase().includes(q) ||
          item.short_summary.toLowerCase().includes(q) ||
          item.target_audience.toLowerCase().includes(q) ||
          (item.author_organization && item.author_organization.toLowerCase().includes(q)) ||
          item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Kategoria
      if (selectedCategories.length > 0) {
        const code = item.category_code || (typeof item.category === "object" ? item.category.code : "");
        const catId = typeof item.category === "number" ? String(item.category) : String(item.category?.id);
        const matchesCat = selectedCategories.includes(code) || selectedCategories.includes(catId);
        if (!matchesCat) return false;
      }

      // Etap dojrzałości
      if (selectedStages.length > 0 && !selectedStages.includes(item.maturity_stage)) {
        return false;
      }

      // Typ innowacji
      if (selectedTypes.length > 0 && !selectedTypes.includes(item.innovation_type)) {
        return false;
      }

      return true;
    });
  }, [initialInnovations, query, selectedCategories, selectedStages, selectedTypes]);

  function handleOpenFilters() {
    setDraftCategories(selectedCategories);
    setDraftStages(selectedStages);
    setDraftTypes(selectedTypes);
    setIsFilterDialogOpen(true);
  }

  function handleApplyFilters() {
    setSelectedCategories(draftCategories);
    setSelectedStages(draftStages);
    setSelectedTypes(draftTypes);
    setIsFilterDialogOpen(false);
  }

  function handleClearFilters() {
    setDraftCategories([]);
    setDraftStages([]);
    setDraftTypes([]);
    setSelectedCategories([]);
    setSelectedStages([]);
    setSelectedTypes([]);
    setQuery("");
  }

  const activeFiltersCount = selectedCategories.length + selectedStages.length + selectedTypes.length;

  return (
    <div className="innovation-library">
      <SearchFilterBar
        filterLabel={activeFiltersCount > 0 ? `Filtry (${activeFiltersCount})` : "Filtry"}
        onFiltersClick={handleOpenFilters}
        onQueryChange={(event) => setQuery(event.target.value)}
        query={query}
        searchLabel="Szukaj innowacji po tytule, opisie, tagach lub autorze"
        searchPlaceholder="np. seniorzy, sensoryka, łazienki, CUS"
      />

      {/* Szybkie pigułki aktywnych filtrów */}
      {activeFiltersCount > 0 && (
        <div className="innovation-library__active-filters" role="region" aria-label="Aktywne filtry">
          <span className="type-caption">Aktywne filtry:</span>
          {selectedCategories.map((catCode) => {
            const cat = categories.find((c) => c.code === catCode || String(c.id) === catCode);
            return (
              <Tag
                key={catCode}
                label={cat ? cat.name : catCode}
                variant="info"
              />
            );
          })}
          {selectedStages.map((stage) => {
            const opt = maturityStageOptions.find((s) => s.value === stage);
            return <Tag key={stage} label={opt ? opt.label : stage} variant="warning" />;
          })}
          {selectedTypes.map((type) => {
            const opt = innovationTypeOptions.find((t) => t.value === type);
            return <Tag key={type} label={opt ? opt.label : type} variant="neutral" />;
          })}
          <button
            className="innovation-library__clear-btn"
            onClick={handleClearFilters}
            type="button"
          >
            Wyczyść wszystko
          </button>
        </div>
      )}

      {/* Nagłówek wyników i licznik */}
      <div className="innovation-library__status-bar">
        <p className="type-body" role="status">
          Znaleziono: <strong>{filteredInnovations.length}</strong> {filteredInnovations.length === 1 ? "innowację" : "innowacji"} ROPS Kraków
        </p>
      </div>

      {/* Siatka kart innowacji */}
      {filteredInnovations.length > 0 ? (
        <div className="innovation-library__grid">
          {filteredInnovations.map((item) => {
            const stage = stageBadge(item.maturity_stage);
            const categoryName = item.category_name || (typeof item.category === "object" ? item.category.name : "Innowacja ROPS");

            return (
              <article className="innovation-card" key={item.id}>
                <header className="innovation-card__header">
                  <div className="innovation-card__meta">
                    <Tag label={categoryName} variant="info" />
                    <Badge label={stage.label} variant={stage.variant} />
                  </div>
                  <span className="innovation-card__type">{typeLabel(item.innovation_type)}</span>
                </header>

                <div className="innovation-card__body">
                  <h3 className="innovation-card__title">
                    <Link href={`/innowacje/${item.slug}`}>{item.title}</Link>
                  </h3>
                  <p className="innovation-card__summary">{item.short_summary}</p>

                  <div className="innovation-card__audience">
                    <UsersThree aria-hidden="true" size={16} />
                    <span><strong>Odbiorcy:</strong> {item.target_audience}</span>
                  </div>

                  {item.author_organization && (
                    <p className="innovation-card__author">
                      Autor: <em>{item.author_organization}</em>
                    </p>
                  )}

                  {/* Wskaźnik replikowalności */}
                  <div className="innovation-card__readiness">
                    <div className="innovation-card__readiness-header">
                      <span className="type-caption">Gotowość do replikacji w gminie:</span>
                      <strong>{item.replication_readiness_score}%</strong>
                    </div>
                    <LinearProgress
                      label={`Stopień gotowości do replikacji: ${item.replication_readiness_score}%`}
                      value={item.replication_readiness_score}
                    />
                  </div>

                  {/* Tagi */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="innovation-card__tags">
                      {item.tags.slice(0, 4).map((tag) => (
                        <span className="innovation-card__tag" key={tag}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <footer className="innovation-card__footer">
                  <div className="innovation-card__engagement" aria-label={`Polubienia: ${item.likes_count}, dopasowania: ${item.matches_count}`}>
                    <span><Heart aria-hidden="true" size={16} weight="fill" /> {item.likes_count}</span>
                    <span><ArrowsLeftRight aria-hidden="true" size={16} weight="bold" /> {item.matches_count} dopasowań</span>
                  </div>

                  <div className="innovation-card__actions">
                    <ButtonLink
                      href={`/innowacje/${item.slug}`}
                      trailingIcon={ArrowRight}
                      variant="primary"
                    >
                      Szczegóły innowacji
                    </ButtonLink>
                  </div>
                </footer>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="innovation-library__empty" role="status">
          <Lightbulb aria-hidden="true" size={48} weight="duotone" />
          <h3 className="type-h3">Nie znaleziono innowacji spełniających podane kryteria</h3>
          <p className="type-body">
            Spróbuj zmienić parametry filtrów lub wyszukać inne słowo kluczowe. Jeśli w regionie brakuje takiego rozwiązania, możesz zgłosić nową potrzebę!
          </p>
          <div className="innovation-library__empty-actions">
            <Button onClick={handleClearFilters} variant="secondary">
              Wyczyść filtry
            </Button>
            <ButtonLink href="/needs/new" leadingIcon={HandHeart} variant="primary">
              Zgłoś brakującą potrzebę
            </ButtonLink>
          </div>
        </div>
      )}

      {/* Dialog zaawansowanych filtrów */}
      <Dialog
        description="Wybierz kategorie, etap dojrzałości i formę innowacji, aby zawęzić listę."
        onOpenChange={setIsFilterDialogOpen}
        open={isFilterDialogOpen}
        title="Filtrowanie Biblioteki Innowacji"
      >
        <div className="innovation-library__dialog-content" id={filterId}>
          <div className="innovation-library__filter-section">
            <h4 className="type-h3">9 Oficjalnych Kategorii ROPS Kraków</h4>
            <CheckboxChipGroup
              label="Kategorie innowacji"
              name="categories"
              onValueChange={setDraftCategories}
              options={categories.map((c) => ({ label: c.name, value: c.code }))}
              value={draftCategories}
            />
          </div>

          <div className="innovation-library__filter-section">
            <h4 className="type-h3">Etap dojrzałości rozwiązania</h4>
            <CheckboxChipGroup
              label="Etap dojrzałości"
              name="stages"
              onValueChange={setDraftStages}
              options={maturityStageOptions}
              value={draftStages}
            />
          </div>

          <div className="innovation-library__filter-section">
            <h4 className="type-h3">Forma innowacji</h4>
            <CheckboxChipGroup
              label="Forma innowacji"
              name="types"
              onValueChange={setDraftTypes}
              options={innovationTypeOptions}
              value={draftTypes}
            />
          </div>

          <div className="dialog__actions">
            <Button
              onClick={() => {
                setDraftCategories([]);
                setDraftStages([]);
                setDraftTypes([]);
              }}
              variant="tertiary"
            >
              Wyczyść filtry
            </Button>
            <Button onClick={handleApplyFilters} variant="primary">
              Zastosuj filtry
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
