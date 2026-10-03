"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { CheckboxChipGroup } from "@/components/ui/FormControls";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchFilterBar } from "@/components/ui/SearchFilterBar";
import { TabSwitcher } from "@/components/ui/TabSwitcher";
import { Tag } from "@/components/ui/Tag";

type ResourceCategory = "raporty" | "poradniki" | "dobre-praktyki" | "prawo-i-finansowanie";
type ResourceFormat = "Artykuł" | "PDF" | "Wideo";

type KnowledgeResource = {
  category: ResourceCategory;
  description: string;
  format: ResourceFormat;
  id: string;
  title: string;
  topics: string[];
};

const topics = ["Opieka i zdrowie", "Integracja społeczna", "Edukacja i rozwój", "Usługi społeczne"];
const formats: ResourceFormat[] = ["PDF", "Artykuł", "Wideo"];

const resources: KnowledgeResource[] = [
  { id: "raport-potrzeby", title: "Raport o potrzebach społecznych w Małopolsce", description: "Najważniejsze dane o potrzebach mieszkańców i lokalnych usługach wsparcia.", category: "raporty", topics: ["Usługi społeczne", "Opieka i zdrowie"], format: "PDF" },
  { id: "raport-integracja", title: "Integracja społeczna w małych gminach", description: "Wnioski z rozmów z mieszkańcami, organizacjami i samorządami.", category: "raporty", topics: ["Integracja społeczna"], format: "PDF" },
  { id: "poradnik-partnerstwo", title: "Jak przygotować lokalne partnerstwo", description: "Prosty przewodnik dla osób, które chcą połączyć siły wokół wspólnej potrzeby.", category: "poradniki", topics: ["Integracja społeczna", "Usługi społeczne"], format: "Artykuł" },
  { id: "poradnik-cyfrowy", title: "Dostępne wsparcie cyfrowe dla seniorów", description: "Kroki do zaplanowania spotkań i materiałów bez barier.", category: "poradniki", topics: ["Edukacja i rozwój", "Opieka i zdrowie"], format: "PDF" },
  { id: "praktyka-klub", title: "Klub sąsiedzki dla seniorów", description: "Dobra praktyka budowania regularnego, międzypokoleniowego wsparcia.", category: "dobre-praktyki", topics: ["Opieka i zdrowie", "Integracja społeczna"], format: "Wideo" },
  { id: "prawo-dotacje", title: "Finansowanie działań społecznych", description: "Przegląd bezpiecznych źródeł finansowania i obowiązków organizacji.", category: "prawo-i-finansowanie", topics: ["Usługi społeczne", "Edukacja i rozwój"], format: "Artykuł" },
];

const tabs: { id: "wszystkie" | ResourceCategory; label: string }[] = [
  { id: "wszystkie", label: "Wszystkie" },
  { id: "raporty", label: "Raporty" },
  { id: "poradniki", label: "Poradniki" },
  { id: "dobre-praktyki", label: "Dobre praktyki" },
  { id: "prawo-i-finansowanie", label: "Prawo i finansowanie" },
];

function normalized(value: string) {
  return value.toLocaleLowerCase("pl-PL").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l");
}

function ResourceResults({ resources: matchingResources }: { resources: KnowledgeResource[] }) {
  if (!matchingResources.length) {
    return <p className="knowledge-browser__empty" role="status">Nie znaleźliśmy materiałów pasujących do wybranych kryteriów.</p>;
  }

  return (
    <div className="knowledge-browser__results">
      {matchingResources.map((resource) => (
        <article className="knowledge-resource" key={resource.id}>
          <p className="type-label knowledge-resource__meta">{resource.format}</p>
          <h4 className="type-h3 knowledge-resource__title">{resource.title}</h4>
          <p className="type-body knowledge-resource__description">{resource.description}</p>
          <div className="knowledge-resource__topics">{resource.topics.map((topic) => <Tag key={topic} label={topic} variant="neutral" />)}</div>
        </article>
      ))}
    </div>
  );
}

export function KnowledgeResourceBrowser() {
  const [query, setQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<ResourceFormat[]>([]);
  const [draftTopics, setDraftTopics] = useState<string[]>([]);
  const [draftFormats, setDraftFormats] = useState<ResourceFormat[]>([]);

  const matchingResources = useMemo(() => resources.filter((resource) => {
    const searchable = normalized([resource.title, resource.description, resource.format, ...resource.topics].join(" "));
    return (!query || searchable.includes(normalized(query)))
      && (!selectedTopics.length || resource.topics.some((topic) => selectedTopics.includes(topic)))
      && (!selectedFormats.length || selectedFormats.includes(resource.format));
  }), [query, selectedFormats, selectedTopics]);

  function openFilters() {
    setDraftTopics(selectedTopics);
    setDraftFormats(selectedFormats);
    setIsFiltersOpen(true);
  }

  function applyFilters() {
    setSelectedTopics(draftTopics);
    setSelectedFormats(draftFormats);
    setIsFiltersOpen(false);
  }

  function clearFilters() {
    setDraftTopics([]);
    setDraftFormats([]);
  }

  return (
    <section aria-labelledby="knowledge-browser-heading" className="knowledge-browser">
      <PageHeader description="Materiały, które wspierają rozwiązywanie problemów społecznych w Małopolsce." headingLevel="h3" id="knowledge-browser-heading" title="Zasobnik wiedzy" />
      <SearchFilterBar onFiltersClick={openFilters} onQueryChange={(event) => setQuery(event.target.value)} query={query} />
      <TabSwitcher
        items={tabs.map((tab) => ({
          ...tab,
          panel: <ResourceResults resources={matchingResources.filter((resource) => tab.id === "wszystkie" || resource.category === tab.id)} />,
        }))}
        label="Kategorie materiałów"
      />
      <Dialog description="Wybierz kryteria, które pomogą zawęzić listę materiałów." onOpenChange={setIsFiltersOpen} open={isFiltersOpen} title="Filtry zasobów">
        <div className="knowledge-browser__filter-groups">
          <CheckboxChipGroup label="Temat" name="knowledge-topics" onValueChange={setDraftTopics} options={topics.map((topic) => ({ label: topic, value: topic }))} value={draftTopics} />
          <CheckboxChipGroup label="Format materiału" name="knowledge-formats" onValueChange={(value) => setDraftFormats(value as ResourceFormat[])} options={formats.map((format) => ({ label: format, value: format }))} value={draftFormats} />
        </div>
        <div className="dialog__actions knowledge-browser__filter-actions">
          <Button onClick={clearFilters} variant="tertiary">Wyczyść filtry</Button>
          <Button onClick={applyFilters}>Zastosuj filtry</Button>
        </div>
      </Dialog>
    </section>
  );
}
