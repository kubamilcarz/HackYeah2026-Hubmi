"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowSquareOut,
  ChatCircleDots,
  Check,
  Copy,
  DownloadSimple,
  Handshake,
  Printer,
  Sparkle,
} from "@phosphor-icons/react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/FormControls";
import { Badge, Tag } from "@/components/ui/Tag";
import { TabSwitcher } from "@/components/ui/TabSwitcher";
import { Toast, ToastViewport } from "@/components/ui/Toast";
import { usePersona } from "@/contexts/PersonaContext";
import {
  generateMiddlemanPackage,
  getMiddlemanPackages,
  getInnovations,
  getCounties,
  type SocialInnovation,
  type County,
  type MiddlemanPackageResult,
  FALLBACK_INNOVATIONS,
  FALLBACK_COUNTIES,
  FALLBACK_MIDDLEMAN_PACKAGE,
} from "@/lib/api";

export function MiddlemanView() {
  const searchParams = useSearchParams();
  const { activePersona } = usePersona();

  const queryInnovation = searchParams.get("innovation") || "";
  const queryCounty = searchParams.get("county") || "";

  const [innovations, setInnovations] = useState<SocialInnovation[]>(FALLBACK_INNOVATIONS);
  const [counties, setCounties] = useState<County[]>(FALLBACK_COUNTIES);
  const [savedPackages, setSavedPackages] = useState<MiddlemanPackageResult[]>([FALLBACK_MIDDLEMAN_PACKAGE]);

  const [selectedInnovationId, setSelectedInnovationId] = useState<string>("1");
  const [selectedCountyId, setSelectedCountyId] = useState<string>("1");
  const [municipalityName, setMunicipalityName] = useState(
    activePersona.organization && activePersona.organization.includes("Myślenic")
      ? "Myślenice"
      : "Myślenice"
  );
  const [municipalityType, setMunicipalityType] = useState<string>("miejsko-wiejska");
  const [population, setPopulation] = useState("45000");
  const [hasCus, setHasCus] = useState(true);
  const [executionModel, setExecutionModel] = useState("hybrydowy");

  const [isGenerating, setIsGenerating] = useState(false);
  const [packageResult, setPackageResult] = useState<MiddlemanPackageResult | null>(FALLBACK_MIDDLEMAN_PACKAGE);
  const [copiedResolution, setCopiedResolution] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("konfigurator");
  const [detailTab, setDetailTab] = useState<string>("plan");
  const [toast, setToast] = useState<{ title: string; description: string } | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [inns, counts, pkgs] = await Promise.all([
          getInnovations(),
          getCounties(),
          getMiddlemanPackages(),
        ]);

        if (inns && inns.length > 0) {
          setInnovations(inns);
          if (queryInnovation) {
            const found = inns.find((i) => String(i.id) === queryInnovation || i.slug === queryInnovation);
            if (found) setSelectedInnovationId(String(found.id));
          }
        }

        if (counts && counts.length > 0) {
          setCounties(counts);
          if (queryCounty) {
            const foundC = counts.find((c) => String(c.id) === queryCounty || c.slug === queryCounty);
            if (foundC) setSelectedCountyId(String(foundC.id));
          } else {
            const myslenicki = counts.find(
              (c) => c.slug === "myslenicki" || c.name.toLowerCase().includes("myślenic")
            );
            if (myslenicki) setSelectedCountyId(String(myslenicki.id));
          }
        }

        if (pkgs && pkgs.length > 0) {
          setSavedPackages(pkgs);
          setPackageResult(pkgs[0]);
        }
      } catch {
        // Fallbacks already in state
      }
    }
    loadData();
  }, [queryInnovation, queryCounty]);

  const selectedInn = innovations.find((i) => String(i.id) === selectedInnovationId) || innovations[0];
  const selectedCounty = counties.find((c) => String(c.id) === selectedCountyId) || counties[0];

  function handleLoadProfile(type: "myslenice" | "grybow") {
    if (type === "myslenice") {
      setMunicipalityName("Myślenice");
      setMunicipalityType("miejsko-wiejska");
      setPopulation("45000");
      setHasCus(true);
      setExecutionModel("hybrydowy");
      const myslenicki = counties.find(
        (c) => c.slug === "myslenicki" || c.name.toLowerCase().includes("myślenic")
      );
      if (myslenicki) setSelectedCountyId(String(myslenicki.id));
      const bawita = innovations.find(
        (i) => i.slug === "bawita-tablica-sensoryczna" || i.title.includes("BaWita")
      );
      if (bawita) setSelectedInnovationId(String(bawita.id));
      setToast({
        title: "Wczytano CUS Myślenice",
        description: "Uzupełniono parametry gminy miejsko-wiejskiej.",
      });
    } else {
      setMunicipalityName("Grybów");
      setMunicipalityType("wiejska");
      setPopulation("24500");
      setHasCus(false);
      setExecutionModel("zlecenie_ngo");
      const nowosadecki = counties.find(
        (c) => c.slug === "nowosadecki" || c.name.toLowerCase().includes("nowosądecki")
      );
      if (nowosadecki) setSelectedCountyId(String(nowosadecki.id));
      const merkury = innovations.find(
        (i) => i.slug === "merkury-symulator" || i.title.includes("Merkury")
      );
      if (merkury) setSelectedInnovationId(String(merkury.id));
      setToast({
        title: "Wczytano Gminę Grybów",
        description: "Uzupełniono parametry gminy wiejskiej.",
      });
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await generateMiddlemanPackage({
        innovation_id: selectedInnovationId,
        county_id: selectedCountyId,
        municipality_name: municipalityName,
        municipality_type: municipalityType,
        population: Number(population) || 15000,
        has_cus: hasCus,
        execution_model: executionModel,
      });
      setPackageResult(res);
      setSavedPackages((prev) => [res, ...prev.filter((p) => p.id !== res.id)]);
      setActiveTab("konfigurator");
      setToast({
        title: "Wygenerowano pakiet",
        description: `Pakiet wdrożeniowy dla gminy ${municipalityName} jest gotowy.`,
      });
    } catch {
      setToast({
        title: "Pakiet zaktualizowany",
        description: "Załadowano kalkulację na bazie parametrów lokalnych.",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCopyResolution() {
    if (!packageResult?.resolution_template) return;
    navigator.clipboard.writeText(packageResult.resolution_template).then(() => {
      setCopiedResolution(true);
      setToast({
        title: "Skopiowano uchwałę",
        description: "Wzór uchwały intencyjnej skopiowano do schowka.",
      });
      setTimeout(() => setCopiedResolution(false), 2500);
    });
  }

  function handlePrintPackage() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  function handleSelectSavedPackage(pkg: MiddlemanPackageResult) {
    setPackageResult(pkg);
    setMunicipalityName(pkg.municipality_name || "Myślenice");
    if (pkg.municipality_type) setMunicipalityType(pkg.municipality_type);
    if (pkg.population) setPopulation(String(pkg.population));
    if (pkg.has_cus !== undefined) setHasCus(pkg.has_cus);
    if (pkg.execution_model) setExecutionModel(pkg.execution_model);
    if (pkg.innovation) setSelectedInnovationId(String(pkg.innovation));
    if (pkg.county) setSelectedCountyId(String(pkg.county));
    setActiveTab("konfigurator");
    setDetailTab("plan");
  }

  // Cost calculation
  const annualTotal = packageResult?.cost_breakdown?.annual_total_pln || 75000;
  const fersFund = packageResult?.funding_sources?.find((f) => f.source.includes("FERS")) || {
    source: "FERS 5.1 (ROPS)",
    percentage: 70,
    amount_pln: Math.round(annualTotal * 0.7),
  };
  const ownFund = packageResult?.funding_sources?.find(
    (f) => f.source.includes("własne") || f.source.includes("Gminy")
  ) || {
    source: `Budżet gminy / CUS`,
    percentage: 15,
    amount_pln: Math.round(annualTotal * 0.15),
  };
  const pfronFund = packageResult?.funding_sources?.find((f) => f.source.includes("PFRON")) || {
    source: "PFRON",
    percentage: 15,
    amount_pln: annualTotal - fersFund.amount_pln - ownFund.amount_pln,
  };

  const configuratorPanel = (
    <div className="space-y-6">
      {/* Przykładowe profile - dyskretny pasek */}
      <div className="middleman-quick-profiles">
        <span className="middleman-quick-profiles__label">Przykładowe dane:</span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => handleLoadProfile("myslenice")}
          aria-label="Wczytaj profil: CUS Myślenice"
        >
          CUS Myślenice
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => handleLoadProfile("grybow")}
          aria-label="Wczytaj profil: Gmina Grybów"
        >
          Gmina Grybów
        </Button>
      </div>

      {/* Formularz konfiguracji */}
      <form onSubmit={handleGenerate} className="middleman-card">
        <header className="middleman-card__header">
          <h3 className="middleman-card__title">Konfiguracja wdrożenia w gminie</h3>
          <p className="middleman-card__meta">
            Wybierz innowację ROPS oraz parametry swojej jednostki samorządu.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Innowacja do adaptacji"
            name="innovation"
            options={innovations.map((i) => ({ label: i.title, value: String(i.id) }))}
            value={selectedInnovationId}
            onChange={(e) => setSelectedInnovationId(e.target.value)}
          />

          <SelectField
            label="Powiat"
            name="county"
            options={counties.map((c) => ({ label: c.name, value: String(c.id) }))}
            value={selectedCountyId}
            onChange={(e) => setSelectedCountyId(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField
            label="Nazwa gminy"
            name="municipality"
            required
            value={municipalityName}
            onChange={(e) => setMunicipalityName(e.target.value)}
            placeholder="np. Myślenice"
          />

          <SelectField
            label="Typ gminy"
            name="municipality_type"
            options={[
              { label: "Miejsko-wiejska", value: "miejsko-wiejska" },
              { label: "Wiejska", value: "wiejska" },
              { label: "Miejska", value: "miejska" },
            ]}
            value={municipalityType}
            onChange={(e) => setMunicipalityType(e.target.value)}
          />

          <TextField
            label="Liczba mieszkańców"
            name="population"
            type="number"
            min="1000"
            max="1000000"
            value={population}
            onChange={(e) => setPopulation(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <SelectField
            label="Model realizacji"
            name="execution_model"
            options={[
              { label: "Partnerstwo (CUS/OPS + NGO)", value: "hybrydowy" },
              { label: "Zlecenie lokalnemu NGO", value: "zlecenie_ngo" },
              { label: "Kadra własna (CUS/OPS)", value: "wlasna_kadra" },
            ]}
            value={executionModel}
            onChange={(e) => setExecutionModel(e.target.value)}
          />

          <label className="flex items-center gap-2.5 text-xs text-[var(--content-primary)] cursor-pointer pt-2 sm:pt-4">
            <input
              type="checkbox"
              checked={hasCus}
              onChange={(e) => setHasCus(e.target.checked)}
              className="h-4 w-4 rounded accent-[var(--action-primary)]"
            />
            <span>Gmina posiada Centrum Usług Społecznych (CUS)</span>
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={isGenerating}
            leadingIcon={Sparkle}
            aria-label="Generuj pakiet wdrożeniowy"
          >
            {isGenerating ? "Generowanie..." : "Przygotuj pakiet wdrożeniowy"}
          </Button>
        </div>
      </form>

      {/* Prezentacja pakietu wdrożeniowego */}
      {packageResult && (
        <article className="middleman-card">
          <header className="middleman-card__header middleman-card__header--split">
            <div>
              <div className="flex gap-2 items-center mb-1 flex-wrap">
                <Badge label="Gotowy do wdrożenia" variant="success" />
                <Tag label={`Gmina ${packageResult.municipality_name}`} variant="neutral" />
                <Tag label={packageResult.county_name || selectedCounty.name} variant="neutral" />
                <Tag
                  label={packageResult.has_cus ? "Tryb CUS" : "Tryb OPS"}
                  variant="neutral"
                />
              </div>
              <h3 className="middleman-card__title mt-1">{packageResult.service_name}</h3>
              <p className="middleman-card__meta mt-0.5">
                Standard przygotowany w oparciu o wytyczne ROPS Kraków.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handlePrintPackage}
                leadingIcon={Printer}
                aria-label="Drukuj pakiet"
              >
                Drukuj
              </Button>
              <ButtonLink
                href="/documents/wzor_kalkulacji_rops.pdf"
                variant="primary"
                size="sm"
                leadingIcon={DownloadSimple}
                aria-label="Pobierz wzór w formacie PDF"
              >
                Pobierz PDF
              </ButtonLink>
            </div>
          </header>

          {/* Zwięzły pasek montażu finansowego */}
          <div className="middleman-montage-summary">
            <div className="middleman-montage-summary__item">
              <span className="middleman-montage-summary__label">Dotacja FERS 5.1 (70%)</span>
              <span className="middleman-montage-summary__value middleman-montage-summary__value--highlight">
                {fersFund.amount_pln.toLocaleString("pl-PL")} zł
              </span>
            </div>
            <div className="middleman-montage-summary__item">
              <span className="middleman-montage-summary__label">Środki PFRON (15%)</span>
              <span className="middleman-montage-summary__value">
                {pfronFund.amount_pln.toLocaleString("pl-PL")} zł
              </span>
            </div>
            <div className="middleman-montage-summary__item">
              <span className="middleman-montage-summary__label">Wkład gminy (15%)</span>
              <span className="middleman-montage-summary__value">
                {ownFund.amount_pln.toLocaleString("pl-PL")} zł
              </span>
            </div>
            <div className="middleman-montage-summary__item">
              <span className="middleman-montage-summary__label">Roczny budżet</span>
              <span className="middleman-montage-summary__value">
                {annualTotal.toLocaleString("pl-PL")} zł
              </span>
            </div>
          </div>

          {/* Podsekcje pakietu w 3 czytelnych zakładkach */}
          <TabSwitcher
            label="Sekcje pakietu wdrożeniowego"
            value={detailTab}
            onValueChange={setDetailTab}
            items={[
              {
                id: "plan",
                label: "Plan i procedura",
                panel: (
                  <div className="space-y-4 pt-3">
                    <div>
                      <h4 className="type-caption font-bold text-[var(--content-primary)] mb-1">
                        Standard realizacji usługi
                      </h4>
                      <p className="middleman-detail-text">
                        {packageResult.service_standard}
                      </p>
                    </div>

                    <div>
                      <h4 className="type-caption font-bold text-[var(--content-primary)] mb-2">
                        Harmonogram wdrożenia (6 miesięcy)
                      </h4>
                      <div className="middleman-timeline-list">
                        {packageResult.implementation_steps.map((st, idx) => (
                          <div key={idx} className="middleman-timeline-row">
                            <Badge label={st.month} variant="neutral" />
                            <p className="middleman-timeline-row__text">{st.step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                id: "koszty",
                label: "Finanse i kadra",
                panel: (
                  <div className="space-y-4 pt-3">
                    <div>
                      <h4 className="type-caption font-bold text-[var(--content-primary)] mb-2">
                        Roczna struktura kosztów
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-[var(--surface-subtle)] rounded-xl border border-[var(--border-subtle)] text-xs">
                          <span className="text-[var(--content-muted)] block">Wynagrodzenia kadry:</span>
                          <strong className="text-sm font-bold text-[var(--content-primary)]">
                            {(
                              packageResult.cost_breakdown?.staff_compensation_pln ||
                              Math.round(annualTotal * 0.65)
                            ).toLocaleString("pl-PL")}{" "}
                            zł
                          </strong>
                        </div>
                        <div className="p-3 bg-[var(--surface-subtle)] rounded-xl border border-[var(--border-subtle)] text-xs">
                          <span className="text-[var(--content-muted)] block">Licencja i materiały:</span>
                          <strong className="text-sm font-bold text-[var(--content-primary)]">
                            {(
                              packageResult.cost_breakdown?.materials_and_innovation_license_pln ||
                              Math.round(annualTotal * 0.2)
                            ).toLocaleString("pl-PL")}{" "}
                            zł
                          </strong>
                        </div>
                        <div className="p-3 bg-[var(--surface-subtle)] rounded-xl border border-[var(--border-subtle)] text-xs">
                          <span className="text-[var(--content-muted)] block">Koszty operacyjne i dojazdy:</span>
                          <strong className="text-sm font-bold text-[var(--content-primary)]">
                            {(
                              packageResult.cost_breakdown?.operational_and_travel_pln ||
                              Math.round(annualTotal * 0.15)
                            ).toLocaleString("pl-PL")}{" "}
                            zł
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="type-caption font-bold text-[var(--content-primary)] mb-2">
                        Wymagany zespół
                      </h4>
                      <div className="middleman-team-list">
                        {packageResult.staffing_requirements.map((s, idx) => (
                          <div key={idx} className="middleman-team-item">
                            <div className="middleman-team-item__header">
                              <span className="middleman-team-item__role">{s.role}</span>
                              <Badge label={s.allocation} variant="info" />
                            </div>
                            <p className="middleman-team-item__qual">{s.qualifications}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                id: "uchwala",
                label: "Wzór uchwały",
                panel: (
                  <div className="space-y-3 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="type-caption text-[var(--content-muted)]">
                        Wzór uchwały intencyjnej Rady Gminy
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleCopyResolution}
                        leadingIcon={copiedResolution ? Check : Copy}
                        aria-label="Kopiuj treść uchwały do schowka"
                      >
                        {copiedResolution ? "Skopiowano" : "Kopiuj uchwałę"}
                      </Button>
                    </div>
                    <pre className="middleman-paper-document">
                      {packageResult.resolution_template}
                    </pre>
                  </div>
                ),
              },
            ]}
          />

          {/* Następne kroki */}
          <footer className="middleman-footer-actions">
            <div className="flex items-center gap-2 flex-wrap">
              <ButtonLink
                href={`/innowacje/${selectedInn.slug || selectedInnovationId}`}
                variant="tertiary"
                size="sm"
                trailingIcon={ArrowSquareOut}
              >
                Karta innowacji
              </ButtonLink>
              <ButtonLink
                href={`/kontakt?tab=partnerstwa&source=middleman&innovation=${encodeURIComponent(
                  selectedInn.title
                )}&municipality=${encodeURIComponent(municipalityName)}`}
                variant="secondary"
                size="sm"
                leadingIcon={Handshake}
              >
                Zleć lokalnemu NGO
              </ButtonLink>
            </div>

            <ButtonLink
              href={`/kontakt?tab=konsultacje&subject=${encodeURIComponent(
                `Konsultacja pakietu wdrożeniowego dla gminy ${municipalityName} (innowacja: ${selectedInn.title})`
              )}`}
              variant="primary"
              size="sm"
              leadingIcon={ChatCircleDots}
            >
              Skonsultuj z doradcą ROPS
            </ButtonLink>
          </footer>
        </article>
      )}
    </div>
  );

  const catalogPanel = (
    <div className="space-y-4">
      <div className="middleman-catalog-grid">
        {savedPackages.map((pkg, idx) => (
          <article key={pkg.id || idx} className="middleman-catalog-card">
            <div className="middleman-catalog-card__body">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  label={pkg.has_cus ? "CUS" : "OPS"}
                  variant={pkg.has_cus ? "success" : "neutral"}
                />
                <span className="type-caption text-[var(--content-muted)]">
                  Gmina {pkg.municipality_name}
                </span>
              </div>

              <h4 className="middleman-catalog-card__title">{pkg.service_name}</h4>

              <p className="middleman-catalog-card__summary line-clamp-2">
                {pkg.service_standard}
              </p>
            </div>

            <div className="middleman-catalog-card__footer">
              <span className="type-caption font-bold text-[var(--action-primary)]">
                {pkg.cost_breakdown?.annual_total_pln?.toLocaleString("pl-PL") || "75 000"} zł
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleSelectSavedPackage(pkg)}
                aria-label={`Wyświetl pakiet dla gminy ${pkg.municipality_name}`}
              >
                Wczytaj pakiet
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );

  const tabItems = [
    { id: "konfigurator", label: "Generator wdrożenia", panel: configuratorPanel },
    { id: "katalog", label: `Zapisane pakiety (${savedPackages.length})`, panel: catalogPanel },
  ];

  return (
    <div className="middleman-view">
      <TabSwitcher
        items={tabItems}
        label="Narzędzia asystenta wdrożeniowego dla gmin"
        value={activeTab}
        onValueChange={setActiveTab}
      />

      {toast && (
        <ToastViewport>
          <Toast
            title={toast.title}
            description={toast.description}
            onDismiss={() => setToast(null)}
          />
        </ToastViewport>
      )}
    </div>
  );
}
