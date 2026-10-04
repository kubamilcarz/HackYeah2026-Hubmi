"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  FileText,
  HandHeart,
  House,
  Lightbulb,
  TrendUp,
  UsersThree,
  Warning,
} from "@phosphor-icons/react";
import type { AdminTrendsResponse, County, RegionalChallenge, SocialInnovation } from "@/lib/api";
import { Badge, Tag } from "@/components/ui/Tag";
import { TabSwitcher } from "@/components/ui/TabSwitcher";
import { ButtonLink } from "@/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { SearchField } from "@/components/ui/FormControls";
import { MatchmakingGap } from "@/components/ui/MatchmakingGap";

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
  const [countySearchQuery, setCountySearchQuery] = useState<string>("");

  const [selectedChallengeSlug, setSelectedChallengeSlug] = useState<string>(
    challenges[0]?.slug || ""
  );
  const [challengeSearchQuery, setChallengeSearchQuery] = useState<string>("");

  // Filtrowanie powiatów
  const filteredCounties = useMemo(() => {
    const q = countySearchQuery.trim().toLowerCase();
    if (!q) return counties;
    return counties.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.summary && c.summary.toLowerCase().includes(q))
    );
  }, [counties, countySearchQuery]);

  const selectedCounty = useMemo(() => {
    const found = counties.find((c) => c.slug === selectedCountySlug);
    return found || filteredCounties[0] || counties[0];
  }, [counties, filteredCounties, selectedCountySlug]);

  // Filtrowanie wyzwań
  const filteredChallenges = useMemo(() => {
    const q = challengeSearchQuery.trim().toLowerCase();
    if (!q) return challenges;
    return challenges.filter(
      (ch) =>
        ch.title.toLowerCase().includes(q) ||
        ch.summary.toLowerCase().includes(q) ||
        (ch.county_name && ch.county_name.toLowerCase().includes(q)) ||
        (ch.category_name && ch.category_name.toLowerCase().includes(q))
    );
  }, [challenges, challengeSearchQuery]);

  const selectedChallenge = useMemo(() => {
    const found = challenges.find((c) => c.slug === selectedChallengeSlug);
    return found || filteredChallenges[0] || challenges[0];
  }, [challenges, filteredChallenges, selectedChallengeSlug]);

  // Demo data has no county-to-innovation relation. These are suggestions for
  // exploration, not a claim that a solution already covers the county need.
  const countyInnovations = useMemo(() => {
    if (!selectedCounty) return [];
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
    { key: "category_name", label: "Kategoria", sortable: true },
    { key: "submissions_count", label: "Zgłoszone potrzeby", sortable: true },
    { key: "innovations_count", label: "Dostępne innowacje", sortable: true },
    {
      key: "status",
      label: "Pokrycie",
      cellKind: "status",
      statusVariants: {
        "Wysokie": "success",
        "Średnie": "warning",
        "Biała Plama": "danger",
      },
    },
  ];

  const categoryRows = trends.by_category.map((c) => {
    let status = "Średnie";
    if (c.innovations_count >= 2) status = "Wysokie";
    if (c.innovations_count === 0 && c.submissions_count > 0) status = "Biała Plama";
    return {
      category_name: c.category_name,
      category_code: c.category_code,
      submissions_count: c.submissions_count,
      innovations_count: c.innovations_count,
      status,
    };
  });

  // ==========================================
  // PANEL 1: Diagnoza Powiatów
  // ==========================================
  const countiesPanel = (
    <div className="challenges-view__panel">
      <div className="challenges-view__split">
        {/* Lewa kolumna: wyszukiwarka + lista powiatów */}
        <div className="challenges-view__sidebar">
          <div className="challenges-view__sidebar-filter">
            <SearchField
              label="Wyszukaj powiat"
              onChange={(e) => setCountySearchQuery(e.target.value)}
              placeholder="np. nowosądecki, tarnowski..."
              value={countySearchQuery}
            />
          </div>

          <div
            aria-label="Lista powiatów"
            className="challenges-view__selector-list"
            role="group"
          >
            {filteredCounties.length === 0 ? (
              <p className="type-caption text-slate-500 p-3">Brak powiatów dla tego zapytania.</p>
            ) : (
              filteredCounties.map((c) => {
                const isSelected = c.slug === selectedCounty?.slug;
                const seniorVal = Number(c.senior_ratio);
                return (
                  <button
                    aria-pressed={isSelected}
                    className={`challenges-view__selector-item${isSelected ? " is-selected" : ""}`}
                    key={c.slug}
                    onClick={() => setSelectedCountySlug(c.slug)}
                    type="button"
                  >
                    <div className="challenges-view__selector-item-header">
                      <strong className="challenges-view__selector-item-name">{c.name}</strong>
                      <Badge
                        label={`Seniorzy: ${c.senior_ratio}%`}
                        variant={seniorVal >= 24 ? "warning" : seniorVal >= 22 ? "info" : "neutral"}
                      />
                    </div>
                    <p className="challenges-view__selector-item-meta">
                      {c.population ? `${c.population.toLocaleString("pl-PL")} mieszkańców` : "Brak danych o ludności"}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Prawa kolumna: Karta wybranego powiatu */}
        {selectedCounty && (
          <article className="challenges-view__detail-card">
            <header className="challenges-view__detail-header">
              <div className="challenges-view__detail-header-tags">
                <Tag label="Województwo Małopolskie" variant="neutral" />
                {selectedCounty.teryt && (
                  <span className="type-caption text-slate-500">TERYT: {selectedCounty.teryt}</span>
                )}
              </div>
              <h2 className="challenges-view__detail-title">{selectedCounty.name}</h2>
              {selectedCounty.summary && (
                <p className="challenges-view__detail-lead">{selectedCounty.summary}</p>
              )}
            </header>

            {/* Metryki */}
            <div className="challenges-view__stats-grid">
              <div className="challenges-view__stat-card">
                <span className="challenges-view__stat-label">Seniorzy (60+)</span>
                <strong className="challenges-view__stat-value challenges-view__stat-value--accent">
                  {selectedCounty.senior_ratio}%
                </strong>
                <span className="challenges-view__stat-hint">Średnia w regionie: 22.4%</span>
              </div>
              <div className="challenges-view__stat-card">
                <span className="challenges-view__stat-label">Liczba mieszkańców</span>
                <strong className="challenges-view__stat-value">
                  {selectedCounty.population ? selectedCounty.population.toLocaleString("pl-PL") : "217 000"}
                </strong>
                <span className="challenges-view__stat-hint">GUS</span>
              </div>
              <div className="challenges-view__stat-card">
                <span className="challenges-view__stat-label">Stopa bezrobocia</span>
                <strong className="challenges-view__stat-value">
                  {selectedCounty.unemployment_rate || "7.8"}%
                </strong>
                <span className="challenges-view__stat-hint">Rejestrowane WUP</span>
              </div>
            </div>

            {/* Zdiagnozowane wyzwania */}
            {selectedCounty.main_challenges && selectedCounty.main_challenges.length > 0 && (
              <div className="challenges-view__section">
                <h3 className="challenges-view__section-title">Główne zdiagnozowane wyzwania</h3>
                <ul className="challenges-view__needs-list">
                  {selectedCounty.main_challenges.map((challengeItem, idx) => (
                    <li className="challenges-view__need-item" key={idx}>
                      <Warning aria-hidden="true" size={18} weight="bold" />
                      <span>{challengeItem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gminy i Centra Usług Społecznych */}
            {selectedCounty.municipalities && selectedCounty.municipalities.length > 0 && (
              <div className="challenges-view__section">
                <h3 className="challenges-view__section-title">Centra Usług Społecznych w powiecie</h3>
                <div className="challenges-view__municipalities-grid">
                  {selectedCounty.municipalities.map((m) => (
                    <div className="challenges-view__municipality-item" key={m.name}>
                      <House aria-hidden="true" size={18} />
                      <div className="flex-1 min-w-0">
                        <span className="challenges-view__municipality-name block truncate">{m.name}</span>
                        <span className="challenges-view__municipality-kind">gmina {m.kind}</span>
                      </div>
                      {m.has_cus ? (
                        <Badge label="CUS aktywny" variant="success" />
                      ) : (
                        <Badge label="OPS tradycyjny" variant="neutral" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rozwiązania do sprawdzenia */}
            <div className="challenges-view__section">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="challenges-view__section-title">
                  Rozwiązania warte sprawdzenia w tym powiecie
                </h3>
                <ButtonLink href="/innowacje" trailingIcon={ArrowRight} variant="tertiary">
                  Wszystkie innowacje
                </ButtonLink>
              </div>

              <div className="challenges-view__innovations-list">
                {countyInnovations.map((inn) => (
                  <div className="challenges-view__inn-card" key={inn.id}>
                    <div className="challenges-view__inn-header">
                      <div className="flex items-center justify-between gap-2">
                        <Tag label={inn.category_name || "Innowacja"} variant="info" />
                        <Badge label="Sprawdzona" variant="success" />
                      </div>
                      <h4 className="challenges-view__inn-title">
                        <Link href={`/innowacje/${inn.slug}`}>{inn.title}</Link>
                      </h4>
                      <p className="challenges-view__inn-summary">{inn.short_summary}</p>
                    </div>

                    <div className="flex gap-2">
                      <ButtonLink
                        href={`/innowacje/${inn.slug}`}
                        trailingIcon={ArrowRight}
                        variant="primary"
                      >
                        Zobacz szczegóły
                      </ButtonLink>
                      <ButtonLink
                        href={`/kreator?prefill_title=${encodeURIComponent(`Wdrożenie ${inn.title} w: ${selectedCounty.name}`)}`}
                        variant="secondary"
                      >
                        Wdróż w powiecie
                      </ButtonLink>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );

  // ==========================================
  // PANEL 2: Katalog Wyzwań ROPS
  // ==========================================
  const challengesPanel = (
    <div className="challenges-view__panel">
      <div className="challenges-view__split">
        {/* Lewa kolumna: wyszukiwarka + lista wyzwań */}
        <div className="challenges-view__sidebar">
          <div className="challenges-view__sidebar-filter">
            <SearchField
              label="Szukaj wyzwania"
              onChange={(e) => setChallengeSearchQuery(e.target.value)}
              placeholder="np. seniorzy, bariery, samotność..."
              value={challengeSearchQuery}
            />
          </div>

          <div
            aria-label="Wybierz wyzwanie"
            className="challenges-view__selector-list"
            role="group"
          >
            {filteredChallenges.length === 0 ? (
              <p className="type-caption text-slate-500 p-3">Brak wyzwań dla podanych kryteriów.</p>
            ) : (
              filteredChallenges.map((ch) => {
                const isSelected = ch.slug === selectedChallenge?.slug;
                return (
                  <button
                    aria-pressed={isSelected}
                    className={`challenges-view__selector-item${isSelected ? " is-selected" : ""}`}
                    key={ch.slug}
                    onClick={() => setSelectedChallengeSlug(ch.slug)}
                    type="button"
                  >
                    <div className="challenges-view__selector-item-header">
                      <Tag label={ch.category_name || "Wyzwanie"} variant="info" />
                      <span className="challenges-view__selector-item-meta">{ch.county_name}</span>
                    </div>
                    <strong className="challenges-view__selector-item-name">{ch.title}</strong>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Prawa kolumna: Szczegóły wyzwania */}
        {selectedChallenge && (
          <article className="challenges-view__detail-card">
            <header className="challenges-view__detail-header">
              <div className="challenges-view__detail-header-tags">
                <Tag label={selectedChallenge.category_name || "Wyzwanie"} variant="info" />
                <Badge label={selectedChallenge.county_name || "Region Małopolski"} variant="neutral" />
              </div>
              <h2 className="challenges-view__detail-title">{selectedChallenge.title}</h2>
              <p className="challenges-view__detail-lead">{selectedChallenge.summary}</p>
            </header>

            {/* Diagnoza */}
            <div className="challenges-view__section">
              <h3 className="challenges-view__section-title">Diagnoza sytuacji</h3>
              <p className="challenges-view__section-body leading-relaxed">
                {selectedChallenge.full_analysis}
              </p>
            </div>

            {/* Dane liczbowe */}
            {selectedChallenge.statistical_data &&
              Object.keys(selectedChallenge.statistical_data).length > 0 && (
                <div className="challenges-view__section">
                  <h3 className="challenges-view__section-title">Podstawa analityczna</h3>
                  <div className="challenges-view__stats-grid">
                    {Object.entries(selectedChallenge.statistical_data).map(([key, val]) => (
                      <div className="challenges-view__stat-card" key={key}>
                        <span className="challenges-view__stat-label">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <strong className="challenges-view__stat-value challenges-view__stat-value--accent">
                          {String(val)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Kluczowe potrzeby */}
            {selectedChallenge.key_needs && selectedChallenge.key_needs.length > 0 && (
              <div className="challenges-view__section">
                <h3 className="challenges-view__section-title">Pilne potrzeby w terenie</h3>
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

            {/* Powiązane innowacje albo jawna luka */}
            <div className="challenges-view__section">
              <h3 className="challenges-view__section-title">Gotowe innowacje rozwiązujące ten problem</h3>
              {selectedChallenge.related_innovations && selectedChallenge.related_innovations.length > 0 ? (
                <div className="challenges-view__innovations-list">
                  {selectedChallenge.related_innovations.map((inn) => (
                  <div className="challenges-view__inn-card" key={inn.id}>
                    <div className="challenges-view__inn-header">
                      <div className="flex items-center justify-between gap-2">
                        <Tag label="Innowacja" variant="success" />
                        <Badge label="Przetestowana" variant="neutral" />
                      </div>
                      <h4 className="challenges-view__inn-title">
                        <Link href={`/innowacje/${inn.slug}`}>{inn.title}</Link>
                      </h4>
                      <p className="challenges-view__inn-summary">{inn.short_summary}</p>
                    </div>

                    <div className="flex gap-2">
                      <ButtonLink
                        href={`/innowacje/${inn.slug}`}
                        trailingIcon={ArrowRight}
                        variant="primary"
                      >
                        Karta innowacji
                      </ButtonLink>
                      <ButtonLink
                        href={`/middleman?innovation=${encodeURIComponent(inn.slug)}`}
                        leadingIcon={FileText}
                        variant="secondary"
                      >
                        Pakiet dla JST
                      </ButtonLink>
                    </div>
                  </div>
                  ))}
                </div>
              ) : (
                <MatchmakingGap
                  actions={
                    <>
                      <ButtonLink href="/kreator" leadingIcon={Lightbulb} variant="primary">
                        Zgłoś pomysł na rozwiązanie
                      </ButtonLink>
                      <ButtonLink href="/innowacje" variant="secondary">
                        Przeglądaj bibliotekę
                      </ButtonLink>
                    </>
                  }
                  description="W katalogu nie ma jeszcze rozwiązania powiązanego z tym wyzwaniem. Możesz pomóc je stworzyć albo sprawdzić całą bibliotekę."
                  heading="Brakuje powiązanego rozwiązania"
                  noticeTitle="Biała plama wymaga dalszego działania"
                >
                  <p className="type-body">ROPS oznaczył to wyzwanie do dalszego rozpoznania. Zgłoszenie pomysłu nie zobowiązuje do jego realizacji.</p>
                </MatchmakingGap>
              )}
            </div>
          </article>
        )}
      </div>
    </div>
  );

  // ==========================================
  // PANEL 3: Niezaspokojone potrzeby (Białe Plamy & Trendy)
  // ==========================================
  const trendsPanel = (
    <div className="challenges-view__panel">
      {/* 4 konkretne metryki regionalne */}
      <div className="challenges-view__kpi-grid">
        <div className="challenges-view__kpi-card">
          <div className="challenges-view__kpi-icon">
            <HandHeart aria-hidden="true" size={24} />
          </div>
          <div className="challenges-view__kpi-content">
            <strong className="challenges-view__kpi-number">{trends.total_submissions}</strong>
            <p className="challenges-view__kpi-label">Zgłoszonych potrzeb</p>
          </div>
        </div>
        <div className="challenges-view__kpi-card">
          <div className="challenges-view__kpi-icon">
            <Lightbulb aria-hidden="true" size={24} />
          </div>
          <div className="challenges-view__kpi-content">
            <strong className="challenges-view__kpi-number">{trends.total_ideas}</strong>
            <p className="challenges-view__kpi-label">Nowych pomysłów</p>
          </div>
        </div>
        <div className="challenges-view__kpi-card">
          <div className="challenges-view__kpi-icon">
            <TrendUp aria-hidden="true" size={24} />
          </div>
          <div className="challenges-view__kpi-content">
            <strong className="challenges-view__kpi-number">{trends.total_pilots}</strong>
            <p className="challenges-view__kpi-label">Aktywnych testów</p>
          </div>
        </div>
        <div className="challenges-view__kpi-card">
          <div className="challenges-view__kpi-icon">
            <UsersThree aria-hidden="true" size={24} />
          </div>
          <div className="challenges-view__kpi-content">
            <strong className="challenges-view__kpi-number">{trends.total_partnerships}</strong>
            <p className="challenges-view__kpi-label">Partnerstw JST-NGO</p>
          </div>
        </div>
      </div>

      {/* Wykryte Białe Plamy */}
      <div className="challenges-view__white-spots-container">
        <div className="challenges-view__white-spots-header">
          <div>
            <h3 className="challenges-view__section-title">
              Białe Plamy — potrzeby bez gotowych rozwiązań
            </h3>
            <p className="challenges-view__section-body text-sm mt-1">
              Obszary zgłoszone przez mieszkańców, dla których w regionie brakuje sprawdzonych innowacji.
            </p>
          </div>
          <ButtonLink href="/kreator" leadingIcon={Lightbulb} variant="primary">
            Zgłoś pomysł
          </ButtonLink>
        </div>

        {trends.white_spots.length > 0 ? (
          <div className="challenges-view__white-spots-list">
            {trends.white_spots.map((spot) => (
            <article className="challenges-view__white-spot-card" key={spot.submission_id}>
              <div className="flex flex-col gap-2">
                <div className="challenges-view__white-spot-meta">
                  <Tag label={spot.category_name} variant="neutral" />
                  <span className="type-caption text-slate-500">{spot.county_name}</span>
                </div>
                <h4 className="challenges-view__white-spot-title">{spot.title}</h4>
                <p className="challenges-view__white-spot-desc">
                  Grupa: {spot.affected_group}
                </p>
              </div>
              <div className="challenges-view__white-spot-action">
                <ButtonLink
                  href={`/kreator?prefill_title=${encodeURIComponent(spot.title)}&prefill_category=${encodeURIComponent(spot.category_name)}`}
                  trailingIcon={ArrowRight}
                  variant="secondary"
                >
                  Zaproponuj rozwiązanie
                </ButtonLink>
              </div>
            </article>
            ))}
          </div>
        ) : (
          <div className="challenges-view__empty-state" role="status">
            <CheckCircle aria-hidden="true" size={28} weight="fill" />
            <div>
              <h4 className="type-h3">Brak zgłoszonych białych plam</h4>
              <p className="type-body">W aktualnych danych nie ma potrzeb bez dopasowanego rozwiązania. To nie wyklucza zgłaszania nowych potrzeb.</p>
            </div>
          </div>
        )}
      </div>

      {/* Przejrzysta tabela kategorii */}
      <div className="challenges-view__section">
        <DataTable
          caption="Zestawienie liczby zgłoszeń i gotowych rozwiązań w kategoriach wsparcia"
          columns={categoryColumns}
          heading="Stan zaspokojenia potrzeb według kategorii"
          rowKey="category_code"
          rows={categoryRows}
        />
      </div>
    </div>
  );

  return (
    <div className="challenges-view">
      <TabSwitcher
        items={[
          { id: "powiaty", label: "Diagnoza powiatów", panel: countiesPanel },
          { id: "wyzwania", label: "Katalog wyzwań", panel: challengesPanel },
          { id: "trendy", label: "Białe plamy i luki", panel: trendsPanel },
        ]}
        label="Nawigacja po wyzwaniach regionu"
      />
    </div>
  );
}
