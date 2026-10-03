"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  HandHeart,
  House,
  Lightbulb,
  Sparkle,
  TrendUp,
  UsersThree,
  Warning,
} from "@phosphor-icons/react";
import type { AdminTrendsResponse, County, RegionalChallenge, SocialInnovation } from "@/lib/api";
import { Badge, Tag } from "@/components/ui/Tag";
import { TabSwitcher } from "@/components/ui/TabSwitcher";
import { ButtonLink } from "@/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { KnowledgeResourceBrowser } from "@/components/ui/KnowledgeResourceBrowser";

type ChallengesRegionalViewProps = {
  counties: County[];
  challenges: RegionalChallenge[];
  trends: AdminTrendsResponse;
  allInnovations: SocialInnovation[];
};

export function ChallengesRegionalView({
  counties,
  challenges,
  trends,
  allInnovations,
}: ChallengesRegionalViewProps) {
  const [selectedCountySlug, setSelectedCountySlug] = useState<string>(
    counties[0]?.slug || "nowosadecki"
  );
  const [selectedChallengeSlug, setSelectedChallengeSlug] = useState<string>(
    challenges[0]?.slug || ""
  );

  const selectedCounty = useMemo(() => {
    return counties.find((c) => c.slug === selectedCountySlug) || counties[0];
  }, [counties, selectedCountySlug]);

  const selectedChallenge = useMemo(() => {
    return challenges.find((c) => c.slug === selectedChallengeSlug) || challenges[0];
  }, [challenges, selectedChallengeSlug]);

  // Powiązane innowacje dla wybranego powiatu
  const countyInnovations = useMemo(() => {
    if (!selectedCounty) return [];
    // Jeśli powiat ma bezpośrednie innowacje z seedu lub pasujące tematycznie
    if (selectedCounty.slug === "nowosadecki") {
      return allInnovations.filter((i) => i.slug.includes("bawita") || i.slug.includes("cuder"));
    }
    if (selectedCounty.slug === "myslenicki") {
      return allInnovations.filter((i) => i.slug.includes("osl"));
    }
    if (selectedCounty.slug === "tarnowski") {
      return allInnovations.filter((i) => i.slug.includes("lazienki") || i.slug.includes("kawiarenka"));
    }
    if (selectedCounty.slug === "gorlicki") {
      return allInnovations.filter((i) => i.slug.includes("merkury"));
    }
    return allInnovations.slice(0, 2);
  }, [selectedCounty, allInnovations]);

  // Kolumny dla tabeli trendów kategorii
  const categoryColumns: DataTableColumn<{
    category_name: string;
    category_code: string;
    submissions_count: number;
    innovations_count: number;
    status: string;
  }>[] = [
    { key: "category_name", label: "Kategoria ROPS Kraków", sortable: true },
    { key: "submissions_count", label: "Zgłoszone potrzeby", sortable: true },
    { key: "innovations_count", label: "Gotowe innowacje", sortable: true },
    {
      key: "status",
      label: "Kondycja wsparcia",
      cellKind: "status",
      statusVariants: {
        "Wysokie pokrycie": "success",
        "Średnie pokrycie": "warning",
        "Wykryta Biała Plama": "danger",
      },
    },
  ];

  const categoryRows = trends.by_category.map((c) => {
    let status = "Średnie pokrycie";
    if (c.innovations_count >= 2) status = "Wysokie pokrycie";
    if (c.innovations_count === 0 && c.submissions_count > 0) status = "Wykryta Biała Plama";
    return {
      category_name: c.category_name,
      category_code: c.category_code,
      submissions_count: c.submissions_count,
      innovations_count: c.innovations_count,
      status,
    };
  });

  // Kolumny dla tabeli powiatów
  const countyColumns: DataTableColumn<{
    county_name: string;
    population: number;
    senior_ratio: number;
    submissions_count: number;
  }>[] = [
    { key: "county_name", label: "Powiat", sortable: true },
    { key: "population", label: "Liczba mieszkańców", sortable: true },
    { key: "senior_ratio", label: "Odsetek seniorów 60+ (%)", sortable: true },
    { key: "submissions_count", label: "Aktywne zgłoszenia", sortable: true },
  ];

  const countyRows = trends.by_county.map((c) => ({
    county_name: c.county_name,
    population: c.population,
    senior_ratio: c.senior_ratio,
    submissions_count: c.submissions_count,
  }));

  // Zakładka 1: Kondycja Powiatów
  const countiesPanel = (
    <div className="challenges-view__panel">
      <div className="challenges-view__intro">
        <h3 className="type-h2">Diagnoza demograficzno-społeczna powiatów Małopolski</h3>
        <p className="type-body">
          Wybierz powiat, aby zapoznać się ze wskaźnikami demograficznymi, strukturą Centrów Usług Społecznych (CUS) oraz rozwiązaniami deinstytucjonalnymi.
        </p>
      </div>

      <div className="challenges-view__split">
        {/* Lista powiatów z klawiaturą */}
        <div aria-label="Wybierz powiat z listy" className="challenges-view__county-list" role="tablist">
          {counties.map((c) => {
            const isSelected = c.slug === selectedCounty?.slug;
            return (
              <button
                aria-selected={isSelected}
                className={`challenges-view__county-item${isSelected ? " is-selected" : ""}`}
                key={c.slug}
                onClick={() => setSelectedCountySlug(c.slug)}
                role="tab"
                type="button"
              >
                <div className="challenges-view__county-item-header">
                  <strong className="challenges-view__county-name">{c.name}</strong>
                  <Badge
                    label={`60+: ${c.senior_ratio}%`}
                    variant={Number(c.senior_ratio) > 23 ? "warning" : "info"}
                  />
                </div>
                <p className="challenges-view__county-sub">
                  Mieszkańcy: {c.population ? c.population.toLocaleString("pl-PL") : "b.d."}
                </p>
              </button>
            );
          })}
        </div>

        {/* Szczegółowa karta wybranego powiatu */}
        {selectedCounty && (
          <article className="challenges-view__county-card">
            <header className="challenges-view__county-card-header">
              <div>
                <span className="type-caption text-slate-500">Karta diagnozy regionalnej</span>
                <h3 className="type-h2">{selectedCounty.name}</h3>
              </div>
              <div className="flex gap-2">
                <Tag label="Województwo Małopolskie" variant="neutral" />
              </div>
            </header>

            <div className="challenges-view__stats-grid">
              <div className="challenges-view__stat-box">
                <span className="type-caption">Odsetek osób 60+:</span>
                <strong className="type-h2 text-emerald-700">{selectedCounty.senior_ratio}%</strong>
                <span className="type-caption text-slate-600">Średnia reg.: 22.4%</span>
              </div>
              <div className="challenges-view__stat-box">
                <span className="type-caption">Liczba ludności:</span>
                <strong className="type-h2 text-slate-800">
                  {selectedCounty.population ? selectedCounty.population.toLocaleString("pl-PL") : "217 000"}
                </strong>
                <span className="type-caption text-slate-600">Obszar podgórski / miejski</span>
              </div>
              <div className="challenges-view__stat-box">
                <span className="type-caption">Stopa bezrobocia:</span>
                <strong className="type-h2 text-slate-800">{selectedCounty.unemployment_rate || "7.8"}%</strong>
                <span className="type-caption text-slate-600">Rejestrowane GUS</span>
              </div>
            </div>

            {selectedCounty.summary && (
              <div className="challenges-view__section">
                <h4 className="type-h3">Profil społeczno-geograficzny</h4>
                <p className="type-body">{selectedCounty.summary}</p>
              </div>
            )}

            {/* Gminy i CUS */}
            {selectedCounty.municipalities && selectedCounty.municipalities.length > 0 && (
              <div className="challenges-view__section">
                <h4 className="type-h3">Gminy w powiecie i Centra Usług Społecznych (CUS)</h4>
                <div className="challenges-view__municipalities-grid">
                  {selectedCounty.municipalities.map((m) => (
                    <div className="challenges-view__municipality-item" key={m.name}>
                      <House aria-hidden="true" size={18} />
                      <span className="font-semibold">{m.name}</span>
                      <span className="text-xs text-slate-500 capitalize">({m.kind})</span>
                      {m.has_cus ? (
                        <Badge label="Aktywny CUS" variant="success" />
                      ) : (
                        <Badge label="OPS tradycyjny" variant="neutral" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rekomendowane innowacje ROPS dla powiatu */}
            <div className="challenges-view__section">
              <h4 className="type-h3">Innowacje społeczne odpowiadające na potrzeby {selectedCounty.name}</h4>
              <div className="challenges-view__innovations-list">
                {countyInnovations.map((inn) => (
                  <div className="challenges-view__inn-card" key={inn.id}>
                    <div className="flex-1">
                      <h5 className="type-h3 text-base">
                        <Link href={`/innowacje/${inn.slug}`}>{inn.title}</Link>
                      </h5>
                      <p className="type-body text-sm text-slate-600">{inn.short_summary}</p>
                    </div>
                    <ButtonLink
                      href={`/innowacje/${inn.slug}`}
                      trailingIcon={ArrowRight}
                      variant="secondary"
                    >
                      Szczegóły
                    </ButtonLink>
                  </div>
                ))}
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );

  // Zakładka 2: Katalog Wyzwań Regionalnych
  const challengesPanel = (
    <div className="challenges-view__panel">
      <div className="challenges-view__intro">
        <h3 className="type-h2">Katalog wyzwań regionalnych Małopolski</h3>
        <p className="type-body">
          Zidentyfikowane przez ROPS Kraków kluczowe bariery społeczne wymagające innowacji, deinstytucjonalizacji oraz współpracy międzysektorowej.
        </p>
      </div>

      <div className="challenges-view__split">
        {/* Lista wyzwań */}
        <div aria-label="Wybierz wyzwanie regionalne" className="challenges-view__challenge-selector" role="tablist">
          {challenges.map((ch) => {
            const isSelected = ch.slug === selectedChallenge?.slug;
            return (
              <button
                aria-selected={isSelected}
                className={`challenges-view__challenge-btn${isSelected ? " is-selected" : ""}`}
                key={ch.slug}
                onClick={() => setSelectedChallengeSlug(ch.slug)}
                role="tab"
                type="button"
              >
                <div className="flex items-center justify-between mb-1">
                  <Tag label={ch.category_name || "Wyzwanie ROPS"} variant="info" />
                  <span className="type-caption text-slate-500">{ch.county_name}</span>
                </div>
                <strong className="type-h3 text-sm text-slate-900 block text-left">{ch.title}</strong>
              </button>
            );
          })}
        </div>

        {/* Szczegóły wyzwania */}
        {selectedChallenge && (
          <article className="challenges-view__challenge-detail">
            <header className="challenges-view__challenge-header">
              <div className="flex gap-2 mb-2">
                <Tag label={selectedChallenge.category_name || "Wyzwanie ROPS"} variant="info" />
                <Badge label={selectedChallenge.county_name || "Region Małopolski"} variant="neutral" />
              </div>
              <h3 className="type-h2">{selectedChallenge.title}</h3>
              <p className="type-body text-slate-700 leading-relaxed">{selectedChallenge.summary}</p>
            </header>

            <div className="challenges-view__section">
              <h4 className="type-h3">Diagnoza i analiza ROPS Kraków</h4>
              <p className="type-body leading-relaxed">{selectedChallenge.full_analysis}</p>
            </div>

            {/* Wskaźniki statystyczne */}
            {selectedChallenge.statistical_data && Object.keys(selectedChallenge.statistical_data).length > 0 && (
              <div className="challenges-view__section">
                <h4 className="type-h3">Podstawa analityczna (Wskaźniki ROPS / GUS)</h4>
                <div className="challenges-view__stats-grid">
                  {Object.entries(selectedChallenge.statistical_data).map(([key, val]) => (
                    <div className="challenges-view__stat-box" key={key}>
                      <span className="type-caption">{key}:</span>
                      <strong className="type-h2 text-emerald-700">{String(val)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Zidentyfikowane kluczowe potrzeby */}
            {selectedChallenge.key_needs && selectedChallenge.key_needs.length > 0 && (
              <div className="challenges-view__section">
                <h4 className="type-h3">Kluczowe potrzeby wdrożeniowe</h4>
                <ul className="challenges-view__needs-list">
                  {selectedChallenge.key_needs.map((need, idx) => (
                    <li className="challenges-view__need-item" key={idx}>
                      <CheckCircle aria-hidden="true" size={20} weight="fill" />
                      <span>{need}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Innowacje odpowiadające na wyzwanie */}
            <div className="challenges-view__section">
              <h4 className="type-h3">Odpowiedź innowacyjna ROPS Kraków</h4>
              <div className="challenges-view__innovations-list">
                {(selectedChallenge.related_innovations && selectedChallenge.related_innovations.length > 0
                  ? selectedChallenge.related_innovations
                  : allInnovations.slice(0, 2)
                ).map((inn) => (
                  <div className="challenges-view__inn-card" key={inn.id}>
                    <div className="flex-1">
                      <h5 className="type-h3 text-base">
                        <Link href={`/innowacje/${inn.slug}`}>{inn.title}</Link>
                      </h5>
                      <p className="type-body text-sm text-slate-600">{inn.short_summary}</p>
                    </div>
                    <ButtonLink
                      href={`/innowacje/${inn.slug}`}
                      trailingIcon={ArrowRight}
                      variant="primary"
                    >
                      Karta innowacji
                    </ButtonLink>
                  </div>
                ))}
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );

  // Zakładka 3: Zasobnik Wiedzy
  const knowledgePanel = (
    <div className="challenges-view__panel">
      <KnowledgeResourceBrowser />
    </div>
  );

  // Zakładka 4: Trendy i Białe Plamy
  const trendsPanel = (
    <div className="challenges-view__panel">
      <div className="challenges-view__intro">
        <h3 className="type-h2">Analityka Trendów Regionalnych & „Białe Plamy” ROPS Kraków</h3>
        <p className="type-body">
          Zautomatyzowane monitorowanie potrzeb mieszkańców, NGO i samorządów. Moduł wykrywa obszary niezaspokojonych potrzeb (similarity &lt; 45%), stanowiące bazę do ogłaszania nowych naborów grantowych FERS.
        </p>
      </div>

      {/* Kafelki zagregowane KPI */}
      <div className="challenges-view__kpi-grid">
        <div className="challenges-view__kpi-card">
          <div className="challenges-view__kpi-icon"><HandHeart aria-hidden="true" size={28} /></div>
          <div>
            <strong className="type-h1">{trends.total_submissions}</strong>
            <p className="type-caption">Zgłoszonych potrzeb</p>
          </div>
        </div>
        <div className="challenges-view__kpi-card">
          <div className="challenges-view__kpi-icon"><Lightbulb aria-hidden="true" size={28} /></div>
          <div>
            <strong className="type-h1">{trends.total_ideas}</strong>
            <p className="type-caption">Nowych pomysłów (Fiszki / FERS)</p>
          </div>
        </div>
        <div className="challenges-view__kpi-card">
          <div className="challenges-view__kpi-icon"><TrendUp aria-hidden="true" size={28} /></div>
          <div>
            <strong className="type-h1">{trends.total_pilots}</strong>
            <p className="type-caption">Aktywnych pilotaży</p>
          </div>
        </div>
        <div className="challenges-view__kpi-card">
          <div className="challenges-view__kpi-icon"><UsersThree aria-hidden="true" size={28} /></div>
          <div>
            <strong className="type-h1">{trends.total_partnerships}</strong>
            <p className="type-caption">Ogłoszeń partnerstw JST-NGO</p>
          </div>
        </div>
      </div>

      {/* Sekcja Białych Plam (Innowacyjne luki) */}
      <div className="challenges-view__section">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="type-h3 flex items-center gap-2">
              <Warning aria-hidden="true" className="text-amber-600" size={24} weight="bold" />
              <span>Zidentyfikowane „Białe Plamy” (Luki w innowacjach)</span>
            </h4>
            <p className="type-body text-sm text-slate-600">
              Problemy zgłoszone przez mieszkańców i gminy, dla których nie ma jeszcze gotowych innowacji w bazie ROPS Kraków.
            </p>
          </div>
          <ButtonLink href="/kreator" leadingIcon={Sparkle} variant="primary">
            Uruchom nabór w Kreatorze FERS
          </ButtonLink>
        </div>

        <div className="challenges-view__white-spots-list">
          {trends.white_spots.map((spot) => (
            <article className="challenges-view__white-spot-item" key={spot.submission_id}>
              <div className="flex-1">
                <div className="flex gap-2 items-center mb-1">
                  <Badge label="Biała Plama" variant="danger" />
                  <Tag label={spot.category_name} variant="neutral" />
                  <span className="type-caption text-slate-500">Lokalizacja: {spot.county_name}</span>
                </div>
                <h5 className="type-h3 text-base text-slate-900">{spot.title}</h5>
                <p className="type-body text-sm text-slate-600">
                  Grupa dotknięta: <strong>{spot.affected_group}</strong>
                </p>
              </div>
              <div className="challenges-view__white-spot-action">
                <ButtonLink
                  href={`/kreator?prefill_title=${encodeURIComponent(spot.title)}&prefill_category=${encodeURIComponent(spot.category_name)}`}
                  trailingIcon={ArrowRight}
                  variant="secondary"
                >
                  Zgłoś rozwiązanie (Fiszka)
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Tabela kategorii i rozkładu potrzeb */}
      <div className="challenges-view__section">
        <DataTable
          caption="Zestawienie liczby zgłoszonych potrzeb oraz dostępnych innowacji w 9 oficjalnych kategoriach ROPS Kraków"
          columns={categoryColumns}
          heading="Rozkład potrzeb i innowacji według 9 kategorii ROPS"
          rowKey="category_code"
          rows={categoryRows}
        />
      </div>

      {/* Tabela powiatów */}
      <div className="challenges-view__section">
        <DataTable
          caption="Rozkład aktywności zgłoszeń w powiatach Małopolski z uwzględnieniem wskaźnika starzenia się społeczeństwa"
          columns={countyColumns}
          heading="Aktywność społeczna w powiatach Małopolski"
          rowKey="county_name"
          rows={countyRows}
        />
      </div>
    </div>
  );

  return (
    <div className="challenges-view">
      <TabSwitcher
        items={[
          { id: "powiaty", label: "Kondycja Powiatów", panel: countiesPanel },
          { id: "wyzwania", label: "Katalog Wyzwań ROPS", panel: challengesPanel },
          { id: "wiedza", label: "Zasobnik Wiedzy", panel: knowledgePanel },
          { id: "trendy", label: "Trendy i Białe Plamy", panel: trendsPanel },
        ]}
        label="Obszary wiedzy i wyzwań Małopolski"
      />
    </div>
  );
}
