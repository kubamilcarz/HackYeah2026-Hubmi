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
} from "@phosphor-icons/react";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  SelectField,
  TextField,
} from "@/components/ui/FormControls";
import { Badge, Tag } from "@/components/ui/Tag";
import { LinearProgress } from "@/components/ui/Progress";
import { usePersona } from "@/contexts/PersonaContext";
import {
  generateMiddlemanPackage,
  getInnovations,
  getCounties,
  type SocialInnovation,
  type County,
  type MiddlemanPackageResult,
  FALLBACK_INNOVATIONS,
  FALLBACK_COUNTIES,
} from "@/lib/api";

export function MiddlemanView() {
  const searchParams = useSearchParams();
  const { activePersona } = usePersona();

  const queryInnovation = searchParams.get("innovation") || "";
  const queryCounty = searchParams.get("county") || "";

  const [innovations, setInnovations] = useState<SocialInnovation[]>(FALLBACK_INNOVATIONS);
  const [counties, setCounties] = useState<County[]>(FALLBACK_COUNTIES);

  const [selectedInnovationId, setSelectedInnovationId] = useState<string>("1");
  const [selectedCountyId, setSelectedCountyId] = useState<string>("1");
  const defaultMuni = activePersona.organization && activePersona.organization.includes("Myślenic")
    ? "Myślenice"
    : activePersona.organization || "Myślenice";
  const [municipalityName, setMunicipalityName] = useState(defaultMuni);
  const [population, setPopulation] = useState("18500");
  const [hasCus, setHasCus] = useState(true);
  const [executionModel, setExecutionModel] = useState("wlasny_cus");

  const [isGenerating, setIsGenerating] = useState(false);
  const [packageResult, setPackageResult] = useState<MiddlemanPackageResult | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [inns, counts] = await Promise.all([getInnovations(), getCounties()]);
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
          }
        }
      } catch {
        // Fallbacks present
      }
    }
    loadData();
  }, [queryInnovation, queryCounty]);

  const selectedInn = innovations.find((i) => String(i.id) === selectedInnovationId) || innovations[0];

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await generateMiddlemanPackage({
        innovation_id: selectedInnovationId,
        county_id: selectedCountyId,
        municipality_name: municipalityName,
        population: Number(population) || 15000,
        has_cus: hasCus,
        execution_model: executionModel,
      });
      setPackageResult(res);
    } catch {
      // Fallback result will be handled by API helper
    } finally {
      setIsGenerating(false);
    }
  }

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
        <h2 className="type-h2">Generator Pakietu Usługi Społecznej dla Gminy</h2>
        <p className="type-body text-slate-600 mt-2">
          Samorządowy Middleman AI przekształca innowację społeczną ROPS w sformalizowany pakiet wdrożeniowy:
          ze standardem usługi, wymogami kadrowymi, harmonogramem oraz optymalnym montażem finansowym (70% FERS / 15% PFRON / 15% wkład własny).
        </p>
      </div>

      {/* Formularz konfiguracji */}
      <form onSubmit={handleGenerate} className="hub-card p-6 sm:p-8 space-y-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="type-h2">1. Parametry jednostki samorządu i innowacji</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Wybierz innowację ROPS do adaptacji"
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
            placeholder="np. Myślenice, Grybów"
          />

          <TextField
            label="Szacowana liczba mieszkańców"
            name="population"
            type="number"
            value={population}
            onChange={(e) => setPopulation(e.target.value)}
          />

          <SelectField
            label="Model realizacji"
            name="execution_model"
            options={[
              { label: "Własny CUS / OPS", value: "wlasny_cus" },
              { label: "Zlecenie lokalnemu NGO (Pożytek)", value: "zlecenie_ngo" },
              { label: "Porozumienie międzygminne", value: "porozumienie_miedzygminne" },
            ]}
            value={executionModel}
            onChange={(e) => setExecutionModel(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="cus-check"
            type="checkbox"
            checked={hasCus}
            onChange={(e) => setHasCus(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="cus-check" className="type-body cursor-pointer">
            W gminie funkcjonuje Centrum Usług Społecznych (CUS) – uwzględnij procedury Programu Usług Społecznych
          </label>
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
          <header className="border-b border-slate-100 pb-4 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex gap-2 items-center mb-1">
                <Badge label="Wygenerowano pomyślnie" variant="success" />
                <Tag label={`Gmina: ${municipalityName}`} variant="info" />
              </div>
              <h3 className="type-h2 text-slate-900">{packageResult.service_name}</h3>
            </div>
            <a
              href="/documents/wzor_kalkulacji_rops.pdf"
              download
              className="button button--secondary"
            >
              <DownloadSimple size={20} />
              <span>Pobierz kompletny pakiet (PDF)</span>
            </a>
          </header>

          {/* Sekcja: Standard Usługi */}
          <section className="space-y-2">
            <h4 className="type-h3 flex items-center gap-2">
              <FileText className="text-emerald-700" size={20} />
              Standard i procedura realizacji usługi
            </h4>
            <div className="p-4 bg-slate-50 rounded-xl text-slate-800 type-body leading-relaxed border border-slate-200">
              {packageResult.service_standard}
            </div>
          </section>

          {/* Sekcja: Wymogi kadrowe */}
          <section className="space-y-3">
            <h4 className="type-h3 flex items-center gap-2">
              <UsersThree className="text-emerald-700" size={20} />
              Wymogi kadrowe i kompetencyjne
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {packageResult.staffing_requirements.map((s, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="type-h3 text-base">{s.role}</strong>
                    <Badge label={s.allocation} variant="info" />
                  </div>
                  <p className="type-caption text-slate-600 mt-1">{s.qualifications}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Sekcja: Montaż finansowy 70/15/15 */}
          <section className="space-y-3">
            <h4 className="type-h3 flex items-center gap-2">
              <Coins className="text-emerald-700" size={20} />
              Montaż finansowy i kalkulacja kosztów (Roczny budżet usługi: {packageResult.cost_breakdown.annual_total_pln.toLocaleString("pl-PL")} PLN)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {packageResult.funding_sources.map((f, idx) => (
                <div key={idx} className="p-4 border border-emerald-100 rounded-xl bg-emerald-50/50">
                  <span className="type-caption font-semibold text-emerald-800">{f.source}</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <strong className="type-h2 text-emerald-700">{f.percentage}%</strong>
                    <span className="type-body font-medium">{f.amount_pln.toLocaleString("pl-PL")} zł</span>
                  </div>
                  <LinearProgress label={f.source} value={f.percentage} variant="success" />
                </div>
              ))}
            </div>
          </section>

          {/* Sekcja: Harmonogram wdrożenia */}
          <section className="space-y-3">
            <h4 className="type-h3">Rekomendowany harmonogram wdrożenia w CUS / OPS</h4>
            <div className="space-y-2">
              {packageResult.implementation_steps.map((st, idx) => (
                <div key={idx} className="flex gap-4 items-start p-3 bg-slate-50 rounded-lg">
                  <Badge label={st.month} variant="neutral" />
                  <p className="type-body text-slate-800 flex-1">{st.step}</p>
                </div>
              ))}
            </div>
          </section>

          <footer className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <ButtonLink href="/innowacje" variant="tertiary">
              Wróć do Biblioteki Innowacji
            </ButtonLink>
            <ButtonLink
              href={`/kontakt?subject=${encodeURIComponent(`Wdrożenie innowacji ${selectedInn.title} w gminie ${municipalityName}`)}`}
              variant="secondary"
            >
              Skonsultuj pakiet z doradcą ROPS
            </ButtonLink>
          </footer>
        </article>
      )}
    </div>
  );
}
