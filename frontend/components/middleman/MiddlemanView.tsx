"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Buildings,
  Coins,
  DownloadSimple,
  FileText,
  Sparkle,
  UsersThree,
  Printer,
  Copy,
  Check,
  Handshake,
  CalendarCheck,
  ShieldCheck,
  ArrowSquareOut,
  ChatCircleDots,
} from "@phosphor-icons/react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/FormControls";
import { Badge, Tag } from "@/components/ui/Tag";
import { LinearProgress } from "@/components/ui/Progress";
import { TabSwitcher } from "@/components/ui/TabSwitcher";
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
            // Default to myślenicki if Myślenice
            const myslenicki = counts.find((c) => c.slug === "myslenicki" || c.name.toLowerCase().includes("myślenic"));
            if (myslenicki) setSelectedCountyId(String(myslenicki.id));
          }
        }

        if (pkgs && pkgs.length > 0) {
          setSavedPackages(pkgs);
          // Set initial package from seeded data if available
          setPackageResult(pkgs[0]);
        }
      } catch {
        // Fallbacks already in state
      }
    }
    loadData();
  }, [queryInnovation, queryCounty]);

  const [prevPersonaKey, setPrevPersonaKey] = useState(activePersona.key);
  if (activePersona.key !== prevPersonaKey) {
    setPrevPersonaKey(activePersona.key);
    if (activePersona.roleType === "jst") {
      setMunicipalityName("Myślenice");
      setMunicipalityType("miejsko-wiejska");
      setPopulation("45000");
      setHasCus(true);
      setExecutionModel("hybrydowy");
      const myslenicki = counties.find((c) => c.slug === "myslenicki" || c.name.toLowerCase().includes("myślenic"));
      if (myslenicki) setSelectedCountyId(String(myslenicki.id));
    }
  }

  const selectedInn = innovations.find((i) => String(i.id) === selectedInnovationId) || innovations[0];
  const selectedCounty = counties.find((c) => String(c.id) === selectedCountyId) || counties[0];

  function handleLoadProfile(type: "myslenice" | "grybow") {
    if (type === "myslenice") {
      setMunicipalityName("Myślenice");
      setMunicipalityType("miejsko-wiejska");
      setPopulation("45000");
      setHasCus(true);
      setExecutionModel("hybrydowy");
      const myslenicki = counties.find((c) => c.slug === "myslenicki" || c.name.toLowerCase().includes("myślenic"));
      if (myslenicki) setSelectedCountyId(String(myslenicki.id));
      const bawita = innovations.find((i) => i.slug === "bawita-tablica-sensoryczna" || i.title.includes("BaWita"));
      if (bawita) setSelectedInnovationId(String(bawita.id));
    } else {
      setMunicipalityName("Grybów");
      setMunicipalityType("wiejska");
      setPopulation("24500");
      setHasCus(false);
      setExecutionModel("zlecenie_ngo");
      const nowosadecki = counties.find((c) => c.slug === "nowosadecki" || c.name.toLowerCase().includes("nowosądecki"));
      if (nowosadecki) setSelectedCountyId(String(nowosadecki.id));
      const merkury = innovations.find((i) => i.slug === "merkury-symulator" || i.title.includes("Merkury"));
      if (merkury) setSelectedInnovationId(String(merkury.id));
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
      // Prepend to saved packages if not already there
      setSavedPackages((prev) => [res, ...prev.filter((p) => p.id !== res.id)]);
      setActiveTab("konfigurator");
    } catch {
      // Fallback handled by API client
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCopyResolution() {
    if (!packageResult?.resolution_template) return;
    navigator.clipboard.writeText(packageResult.resolution_template).then(() => {
      setCopiedResolution(true);
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
    window.scrollTo({ top: 400, behavior: "smooth" });
  }

  // Obliczenie kwot montażu finansowego dla wybranego pakietu
  const annualTotal = packageResult?.cost_breakdown?.annual_total_pln || 75000;
  const fersFund = packageResult?.funding_sources?.find((f) => f.source.includes("FERS")) || {
    source: "Program FERS Działanie 5.1 (Grant wdrożeniowy ROPS Kraków)",
    percentage: 70,
    amount_pln: Math.round(annualTotal * 0.70),
  };
  const ownFund = packageResult?.funding_sources?.find((f) => f.source.includes("własne") || f.source.includes("Gminy")) || {
    source: `Środki własne gminy ${municipalityName} / budżet CUS`,
    percentage: 15,
    amount_pln: Math.round(annualTotal * 0.15),
  };
  const pfronFund = packageResult?.funding_sources?.find((f) => f.source.includes("PFRON")) || {
    source: "PFRON / Programy wyrównywania różnic między regionami",
    percentage: 15,
    amount_pln: annualTotal - fersFund.amount_pln - ownFund.amount_pln,
  };

  const configuratorPanel = (
    <div className="space-y-8">
      {/* Baner szybkiego wyboru profili dla samorządów */}
      <div className="hub-card p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="text-emerald-700" size={20} weight="duotone" />
              <span className="type-caption font-semibold text-emerald-900 uppercase tracking-wider">
                Szybkie profile demonstracyjne JST
              </span>
            </div>
            <p className="type-body text-slate-700 text-sm">
              Wybierz gotowy profil małopolskiej jednostki samorządu, aby błyskawicznie wypełnić formularz wdrożeniowy:
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleLoadProfile("myslenice")}
              className="button button--secondary py-1.5 px-3 text-xs"
              aria-label="Wczytaj profil: CUS Myślenice (Marek Wiśniewski)"
            >
              CUS Myślenice (Marek Wiśniewski)
            </button>
            <button
              type="button"
              onClick={() => handleLoadProfile("grybow")}
              className="button button--secondary py-1.5 px-3 text-xs"
              aria-label="Wczytaj profil: Gmina wiejska Grybów"
            >
              Gmina Grybów (pow. nowosądecki)
            </button>
          </div>
        </div>
      </div>

      {/* Formularz konfiguracji */}
      <form onSubmit={handleGenerate} className="hub-card p-6 sm:p-8 space-y-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <header className="border-b border-slate-100 pb-4">
          <h3 className="type-h2">1. Konfiguracja jednostki samorządu i innowacji ROPS</h3>
          <p className="type-caption text-slate-600 mt-1">
            Wskaż innowację, którą gmina zamierza zaadaptować jako lokalną usługę społeczną, oraz lokalne uwarunkowania organizacyjno-demograficzne.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Innowacja ROPS Kraków do adaptacji"
            name="innovation"
            options={innovations.map((i) => ({ label: i.title, value: String(i.id) }))}
            value={selectedInnovationId}
            onChange={(e) => setSelectedInnovationId(e.target.value)}
          />

          <SelectField
            label="Powiat województwa małopolskiego"
            name="county"
            options={counties.map((c) => ({ label: c.name, value: String(c.id) }))}
            value={selectedCountyId}
            onChange={(e) => setSelectedCountyId(e.target.value)}
          />
        </div>

        {/* Karta informacyjna o wybranej innowacji */}
        {selectedInn && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">
                Wybrana innowacja: {selectedInn.title}
              </span>
              <ButtonLink
                href={`/innowacje/${selectedInn.slug || selectedInn.id}`}
                variant="tertiary"
                className="text-xs p-1"
                trailingIcon={ArrowSquareOut}
              >
                Szczegóły innowacji
              </ButtonLink>
            </div>
            <p className="text-slate-600 line-clamp-2">{selectedInn.short_summary}</p>
            <div className="flex gap-2 pt-1 flex-wrap">
              <Tag label={`Kategoria: ${selectedInn.category_name || "Usługi społeczne"}`} variant="info" />
              <Tag label={`Grupa docelowa: ${selectedInn.target_audience}`} variant="neutral" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField
            label="Nazwa gminy"
            name="municipality"
            required
            value={municipalityName}
            onChange={(e) => setMunicipalityName(e.target.value)}
            placeholder="np. Myślenice, Grybów, Czarny Dunajec"
          />

          <SelectField
            label="Typ gminy"
            name="municipality_type"
            options={[
              { label: "Gmina wiejska", value: "wiejska" },
              { label: "Gmina miejsko-wiejska", value: "miejsko-wiejska" },
              { label: "Gmina miejska", value: "miejska" },
            ]}
            value={municipalityType}
            onChange={(e) => setMunicipalityType(e.target.value)}
          />

          <TextField
            label="Szacowana liczba mieszkańców"
            name="population"
            type="number"
            min="1000"
            max="1000000"
            value={population}
            onChange={(e) => setPopulation(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Model realizacji usługi"
            name="execution_model"
            options={[
              { label: "Partnerstwo publiczno-społeczne (CUS/OPS + NGO)", value: "hybrydowy" },
              { label: "Zlecenie lokalnemu NGO/PES (Pożytek Publiczny)", value: "zlecenie_ngo" },
              { label: "Realizacja kadrą własną jednostki (CUS/OPS)", value: "wlasna_kadra" },
            ]}
            value={executionModel}
            onChange={(e) => setExecutionModel(e.target.value)}
            helperText="Formuła organizacyjna świadczenia usługi w gminie"
          />

          <div className="flex flex-col justify-center pt-2">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <input
                id="cus-check"
                type="checkbox"
                checked={hasCus}
                onChange={(e) => setHasCus(e.target.checked)}
                className="w-4 h-4 mt-1 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="cus-check" className="type-caption text-slate-800 cursor-pointer">
                <strong>W gminie funkcjonuje Centrum Usług Społecznych (CUS)</strong>
                <span className="block text-slate-500 text-xs mt-0.5">
                  Pakiet uwzględni procedurę Programu Usług Społecznych (art. 4 ustawy o CUS) oraz rolę Koordynatora Indywidualnych Planów Usług Społecznych.
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={isGenerating}
            leadingIcon={Sparkle}
          >
            {isGenerating ? "Generowanie pakietu AI..." : "Wygeneruj pakiet wdrożeniowy dla gminy"}
          </Button>
        </div>
      </form>

      {/* Prezentacja wygenerowanego pakietu */}
      {packageResult && (
        <article className="hub-card p-6 sm:p-8 space-y-6 bg-white rounded-2xl border border-emerald-200 shadow-md">
          <header className="border-b border-slate-100 pb-4 flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex gap-2 items-center mb-1 flex-wrap">
                <Badge label="Oficjalny pakiet wdrożeniowy ROPS" variant="success" />
                <Tag label={`Gmina: ${packageResult.municipality_name}`} variant="info" />
                <Tag label={`Powiat: ${packageResult.county_name || selectedCounty.name}`} variant="neutral" />
                <Tag
                  label={
                    packageResult.has_cus
                      ? "Procedura: CUS (Program Usług Społecznych)"
                      : "Procedura: OPS (Zadania własne gminy)"
                  }
                  variant="neutral"
                />
              </div>
              <h3 className="type-h2 text-slate-900 mt-2">{packageResult.service_name}</h3>
              <p className="type-caption text-slate-500 mt-1">
                Przygotowano w oparciu o standardy Regionalnego Ośrodka Polityki Społecznej w Krakowie.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrintPackage}
                leadingIcon={Printer}
              >
                Drukuj pakiet
              </Button>
              <a
                href="/documents/wzor_kalkulacji_rops.pdf"
                download
                className="button button--primary flex items-center gap-2"
              >
                <DownloadSimple size={20} />
                <span>Pobierz wzór (PDF)</span>
              </a>
            </div>
          </header>

          {/* Kafelki kluczowych wskaźników (KPI) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="type-caption text-slate-600 block">Roczny budżet usługi</span>
              <strong className="type-h2 text-slate-900 block mt-1">
                {annualTotal.toLocaleString("pl-PL")} zł
              </strong>
              <span className="text-xs text-slate-500">100% kosztów rocznych</span>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <span className="type-caption text-emerald-800 block">Dotacja FERS 5.1 (ROPS)</span>
              <strong className="type-h2 text-emerald-700 block mt-1">
                {fersFund.amount_pln.toLocaleString("pl-PL")} zł
              </strong>
              <span className="text-xs text-emerald-700 font-semibold">70% dofinansowania</span>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
              <span className="type-caption text-blue-800 block">Środki PFRON</span>
              <strong className="type-h2 text-blue-700 block mt-1">
                {pfronFund.amount_pln.toLocaleString("pl-PL")} zł
              </strong>
              <span className="text-xs text-blue-700 font-semibold">15% montażu</span>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <span className="type-caption text-amber-800 block">Wkład własny gminy</span>
              <strong className="type-h2 text-amber-700 block mt-1">
                {ownFund.amount_pln.toLocaleString("pl-PL")} zł
              </strong>
              <span className="text-xs text-amber-700 font-semibold">15% budżetu lokalnego</span>
            </div>
          </div>

          {/* Sekcja 1: Standard Usługi */}
          <section className="space-y-2">
            <h4 className="type-h3 flex items-center gap-2">
              <FileText className="text-emerald-700" size={20} />
              Standard i procedura realizacji usługi
            </h4>
            <div className="p-5 bg-slate-50 rounded-xl text-slate-800 type-body leading-relaxed border border-slate-200 whitespace-pre-line text-sm">
              {packageResult.service_standard}
            </div>
          </section>

          {/* Sekcja 2: Wymogi kadrowe */}
          <section className="space-y-3">
            <h4 className="type-h3 flex items-center gap-2">
              <UsersThree className="text-emerald-700" size={20} />
              Wymogi kadrowe i kompetencyjne
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {packageResult.staffing_requirements.map((s, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <strong className="type-h3 text-sm text-slate-900">{s.role}</strong>
                      <Badge label={s.allocation} variant="info" />
                    </div>
                    <p className="type-caption text-slate-600 mt-1">{s.qualifications}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-800">
                    <ShieldCheck size={16} />
                    <span>Certyfikacja ROPS Kraków</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sekcja 3: Montaż finansowy 70/15/15 i kalkulacja kosztów */}
          <section className="space-y-4">
            <h4 className="type-h3 flex items-center gap-2">
              <Coins className="text-emerald-700" size={20} />
              Montaż finansowy 70/15/15 i struktura kosztów
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 border border-emerald-200 rounded-xl bg-emerald-50/50">
                <span className="type-caption font-semibold text-emerald-900 block">{fersFund.source}</span>
                <div className="flex items-baseline justify-between mt-2 mb-1">
                  <strong className="type-h2 text-emerald-700">{fersFund.percentage}%</strong>
                  <span className="type-body font-medium">{fersFund.amount_pln.toLocaleString("pl-PL")} zł</span>
                </div>
                <LinearProgress label={fersFund.source} value={fersFund.percentage} variant="success" />
              </div>

              <div className="p-4 border border-blue-200 rounded-xl bg-blue-50/50">
                <span className="type-caption font-semibold text-blue-900 block">{pfronFund.source}</span>
                <div className="flex items-baseline justify-between mt-2 mb-1">
                  <strong className="type-h2 text-blue-700">{pfronFund.percentage}%</strong>
                  <span className="type-body font-medium">{pfronFund.amount_pln.toLocaleString("pl-PL")} zł</span>
                </div>
                <LinearProgress label={pfronFund.source} value={pfronFund.percentage} variant="info" />
              </div>

              <div className="p-4 border border-amber-200 rounded-xl bg-amber-50/50">
                <span className="type-caption font-semibold text-amber-900 block">{ownFund.source}</span>
                <div className="flex items-baseline justify-between mt-2 mb-1">
                  <strong className="type-h2 text-amber-700">{ownFund.percentage}%</strong>
                  <span className="type-body font-medium">{ownFund.amount_pln.toLocaleString("pl-PL")} zł</span>
                </div>
                <LinearProgress label={ownFund.source} value={ownFund.percentage} variant="warning" />
              </div>
            </div>

            {/* Zestawienie struktury budżetowej */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="type-caption font-semibold text-slate-800 block mb-2">Szczegółowa kalkulacja wydatków rocznych:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700">
                <div>
                  <span className="text-slate-500 block">1. Wynagrodzenia i narzuty kadry:</span>
                  <strong className="text-sm text-slate-900">
                    {(packageResult.cost_breakdown?.staff_compensation_pln || Math.round(annualTotal * 0.65)).toLocaleString("pl-PL")} zł
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">2. Pakiety innowacji i licencja ROPS:</span>
                  <strong className="text-sm text-slate-900">
                    {(packageResult.cost_breakdown?.materials_and_innovation_license_pln || Math.round(annualTotal * 0.20)).toLocaleString("pl-PL")} zł
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">3. Koszty operacyjne i dojazdy:</span>
                  <strong className="text-sm text-slate-900">
                    {(packageResult.cost_breakdown?.operational_and_travel_pln || Math.round(annualTotal * 0.15)).toLocaleString("pl-PL")} zł
                  </strong>
                </div>
              </div>
            </div>
          </section>

          {/* Sekcja 4: Harmonogram wdrożenia */}
          <section className="space-y-3">
            <h4 className="type-h3 flex items-center gap-2">
              <CalendarCheck className="text-emerald-700" size={20} />
              Harmonogram wdrożenia w CUS / OPS (Roadmapa 6-miesięczna)
            </h4>
            <div className="space-y-2">
              {packageResult.implementation_steps.map((st, idx) => (
                <div key={idx} className="flex gap-4 items-start p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Badge label={st.month} variant="neutral" />
                  <p className="type-body text-slate-800 flex-1 text-sm">{st.step}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Sekcja 5: Wzór uchwały Rady Gminy / Zarządzenia Wójta */}
          {packageResult.resolution_template && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="type-h3 flex items-center gap-2">
                  <FileText className="text-emerald-700" size={20} />
                  Wzór uchwały Rady Gminy w sprawie wdrożenia usługi
                </h4>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCopyResolution}
                  leadingIcon={copiedResolution ? Check : Copy}
                  className="text-xs"
                >
                  {copiedResolution ? "Skopiowano do schowka!" : "Kopiuj treść uchwały"}
                </Button>
              </div>
              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-line overflow-x-auto max-h-72">
                {packageResult.resolution_template}
              </div>
            </section>
          )}

          {/* Sekcja 6: Synergia i akcje samorządowe */}
          <footer className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <ButtonLink
                href={`/innowacje/${selectedInn.slug || selectedInnovationId}`}
                variant="tertiary"
              >
                Karta innowacji w Bibliotece
              </ButtonLink>
              <ButtonLink
                href={`/kontakt?tab=partnerstwa&source=middleman&innovation=${encodeURIComponent(selectedInn.title)}&municipality=${encodeURIComponent(municipalityName)}`}
                variant="secondary"
                leadingIcon={Handshake}
              >
                Zleć realizację lokalnemu NGO (Giełda Współpracy)
              </ButtonLink>
            </div>

            <ButtonLink
              href={`/kontakt?tab=konsultacje&subject=${encodeURIComponent(`Konsultacja pakietu wdrożeniowego dla gminy ${municipalityName} (innowacja: ${selectedInn.title})`)}`}
              variant="primary"
              leadingIcon={ChatCircleDots}
            >
              Skonsultuj pakiet z doradcą ROPS Kraków
            </ButtonLink>
          </footer>
        </article>
      )}
    </div>
  );

  const catalogPanel = (
    <div className="space-y-6">
      <div className="hub-card p-6 bg-slate-50 border border-slate-200 rounded-2xl">
        <h3 className="type-h2">Katalog wygenerowanych pakietów wdrożeniowych JST</h3>
        <p className="type-body text-slate-600 mt-1">
          Przeglądaj pakiety usług społecznych opracowane dla gmin Małopolski. Kliknij pakiet, aby załadować go do konfiguratora, wydrukować lub skopiować wzór uchwały.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedPackages.map((pkg, idx) => (
          <article
            key={pkg.id || idx}
            className="hub-card p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-300 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <Badge
                  label={pkg.has_cus ? "CUS" : "OPS"}
                  variant={pkg.has_cus ? "success" : "neutral"}
                />
                <span className="type-caption text-slate-500">
                  Gmina: <strong>{pkg.municipality_name}</strong> ({pkg.municipality_type || "gmina"})
                </span>
              </div>

              <h4 className="type-h3 text-slate-900">{pkg.service_name}</h4>

              <p className="type-caption text-slate-600 line-clamp-3">
                {pkg.service_standard}
              </p>

              <div className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between items-baseline">
                <span className="text-slate-600">Roczny budżet:</span>
                <strong className="text-sm text-emerald-800">
                  {pkg.cost_breakdown?.annual_total_pln?.toLocaleString("pl-PL") || "75 000"} zł
                </strong>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="type-caption text-slate-500 text-xs">
                Model: {pkg.execution_model === "wlasna_kadra" ? "Kadra własna" : pkg.execution_model === "hybrydowy" ? "Hybrydowy" : "Zlecenie NGO"}
              </span>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSelectSavedPackage(pkg)}
              >
                Wyświetl pakiet
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );

  const tabItems = [
    { id: "konfigurator", label: "Generator Pakietu (AI dla JST)", panel: configuratorPanel },
    { id: "katalog", label: `Katalog Pakietów JST (${savedPackages.length})`, panel: catalogPanel },
  ];

  return (
    <div className="middleman-view max-w-5xl mx-auto space-y-8">
      {/* Intro samorządowe */}
      <div className="hub-card p-6 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="flex items-center gap-3 mb-2">
          <Buildings aria-hidden="true" className="text-emerald-700" size={28} weight="duotone" />
          <span className="type-caption text-emerald-800 font-semibold uppercase tracking-wider">
            Moduł VII • Wsparcie Wdrożeniowe dla JST (CUS & OPS)
          </span>
        </div>
        <h2 className="type-h2">Middleman Innowacji – Asystent Wdrożeniowy dla Gmin</h2>
        <p className="type-body text-slate-600 mt-2">
          Samorządowy Middleman AI przekształca innowację społeczną ROPS Kraków w kompletny pakiet wdrożeniowy:
          ze standardem usługi, wymogami kadrowymi, 6-miesięcznym harmonogramem, optymalnym montażem finansowym (70% FERS / 15% PFRON / 15% wkład własny)
          oraz gotowym wzorem uchwały intencyjnej Rady Gminy.
        </p>
      </div>

      <TabSwitcher
        items={tabItems}
        label="Narzędzia modułu Middleman Innowacji"
        value={activeTab}
        onValueChange={setActiveTab}
      />
    </div>
  );
}
