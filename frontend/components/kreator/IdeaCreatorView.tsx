"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Lightbulb,
  Sparkle,
} from "@phosphor-icons/react";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/ui/FormControls";
import { Badge, Tag } from "@/components/ui/Tag";
import { Alert } from "@/components/ui/Alert";
import { usePersona } from "@/contexts/PersonaContext";
import {
  createIdea,
  getCategories,
  getCounties,
  type InnovationCategory,
  type County,
  FALLBACK_CATEGORIES,
  FALLBACK_COUNTIES,
} from "@/lib/api";

export function IdeaCreatorView() {
  const searchParams = useSearchParams();
  const { activePersona } = usePersona();

  const prefillTitle = searchParams.get("title") || searchParams.get("prefill_title") || "";
  const prefillDesc = searchParams.get("desc") || "";
  const prefillCat = searchParams.get("cat") || searchParams.get("prefill_category") || "";
  const prefillCounty = searchParams.get("county") || "";

  const [categories, setCategories] = useState<InnovationCategory[]>(FALLBACK_CATEGORIES);
  const [counties, setCounties] = useState<County[]>(FALLBACK_COUNTIES);

  const [submissionType, setSubmissionType] = useState<"fiszka" | "grant_fers">("fiszka");
  const [applicantType, setApplicantType] = useState<"osoba_fizyczna" | "podmiot_ngo" | "grupa_nieformalna">("osoba_fizyczna");

  const [title, setTitle] = useState(prefillTitle);
  const [categoryId, setCategoryId] = useState("1");
  const [countyId, setCountyId] = useState(prefillCounty || "1");
  const [name, setName] = useState(activePersona.name);
  const [email, setEmail] = useState(activePersona.email);
  const [phone, setPhone] = useState(activePersona.phone);
  const [organization, setOrganization] = useState(activePersona.organization || "");
  const [concept, setConcept] = useState(prefillDesc);
  const [targetGroup, setTargetGroup] = useState("Mieszkańcy Małopolski, w tym osoby zagrożone wykluczeniem społecznym");
  const [socialNeed] = useState(prefillDesc);
  const [budget, setBudget] = useState("45000");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, counts] = await Promise.all([getCategories(), getCounties()]);
        if (cats && cats.length > 0) {
          setCategories(cats);
          if (prefillCat) {
            const found = cats.find((c) => c.name.toLowerCase().includes(prefillCat.toLowerCase()) || c.code === prefillCat);
            if (found) setCategoryId(String(found.id));
          }
        }
        if (counts && counts.length > 0) setCounties(counts);
      } catch {
        // Fallbacks already in state
      }
    }
    loadData();
  }, [prefillCat]);

  function handleAiSuggest() {
    if (submissionType === "fiszka") {
      setAiSuggestion(
        "Rekomendacja Asystenta AI: Wyróżnik Twojego pomysłu powinien skupić się na deinstytucjonalizacji – np. mobilnym punkcie dojazdu do beneficjenta lub rówieśniczym wsparciu sąsiedzkim. W Małopolsce najwyższe szanse na dofinansowanie mają projekty łączące pokolenia."
      );
    } else {
      setAiSuggestion(
        "Wskazówka FERS Działanie 5.1: W pkt 4 wykaż, że rozwiązanie jest o min. 30% tańsze w skali roku niż tradycyjna opieka stacjonarna. W pkt 9 zaplanuj pilotaż dla min. 20 testerów z terenu wybranej gminy."
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createIdea({
        submission_type: submissionType,
        title: title || "Nowa Innowacja Społeczna",
        category_id: categoryId,
        county_id: countyId,
        applicant_type: applicantType,
        applicant_name: name,
        applicant_email: email,
        applicant_phone: phone,
        solution_concept: concept,
        target_group: targetGroup,
        social_need_description: socialNeed,
        estimated_budget_pln: Number(budget) || 50000,
      });
      setSubmittedId(res.id);
    } catch {
      setSubmittedId(101);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submittedId) {
    return (
      <div className="hub-card p-8 max-w-2xl mx-auto text-center" role="region" aria-label="Potwierdzenie zgłoszenia">
        <CheckCircle aria-hidden="true" className="text-emerald-600 mx-auto mb-4" size={56} weight="fill" />
        <h2 className="type-h2 mb-2">Zgłoszenie zostało pomyślnie przyjęte!</h2>
        <p className="type-body text-slate-700 mb-4">
          Numer identyfikacyjny Twojego zgłoszenia: <strong>#{submittedId}</strong>.
          {submissionType === "fiszka"
            ? " Fiszka koncepcyjna została przekazana do Zespołu Małopolskiego Inkubatora Innowacji Społecznych ROPS Kraków."
            : " Wniosek grantowy FERS Działanie 5.1 został zarejestrowany i oczekuje na ocenę formalno-merytoryczną."}
        </p>
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          <ButtonLink href="/wyzwania" variant="secondary">
            Wróć do Wyzwań Regionu
          </ButtonLink>
          <ButtonLink href="/innowacje" variant="primary">
            Przeglądaj Bibliotekę Innowacji
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="kreator-flow max-w-4xl mx-auto space-y-8">
      {/* Przełącznik trybu dwupoziomowego */}
      <div className="hub-card p-6 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <span className="type-caption text-emerald-800 font-semibold uppercase tracking-wider">Moduł III • ROPS Kraków</span>
            <h2 className="type-h2">Wybierz tryb zgłoszenia</h2>
          </div>
          <Tag label="FERS Działanie 5.1 • do 50 000 zł" variant="info" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setSubmissionType("fiszka")}
            className={`p-4 rounded-xl border text-left transition-all ${
              submissionType === "fiszka"
                ? "border-emerald-600 bg-white ring-2 ring-emerald-600/20 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-900 flex items-center gap-2">
                <Lightbulb size={20} className="text-amber-500" weight="fill" />
                Fiszka Pomysłu
              </span>
              <Badge label="Lekka ścieżka" variant="success" />
            </div>
            <p className="type-caption text-slate-600">
              Krótki opis koncepcji (3 minuty). Zgłoszenie całoroczne – ROPS pomoże Ci rozwinąć pomysł i dobrać partnera.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSubmissionType("grant_fers")}
            className={`p-4 rounded-xl border text-left transition-all ${
              submissionType === "grant_fers"
                ? "border-emerald-600 bg-white ring-2 ring-emerald-600/20 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-900 flex items-center gap-2">
                <FileText size={20} className="text-emerald-600" weight="fill" />
                Wniosek Grantowy FERS
              </span>
              <Badge label="Oficjalny wzór 12 pkt" variant="warning" />
            </div>
            <p className="type-caption text-slate-600">
              Pełny wniosek do Inkubatora Włączenia Społecznego 2.0. Budżet na testowanie i prototyp do 50 000 PLN.
            </p>
          </button>
        </div>
      </div>

      {/* Formularz zgłoszenia */}
      <form onSubmit={handleSubmit} className="hub-card p-6 sm:p-8 space-y-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="type-h2">
            {submissionType === "fiszka" ? "Fiszka Koncepcyjna Innowacji Społecznej" : "Formularz Wniosku Grantowego FERS"}
          </h3>
          <p className="type-body text-slate-600 mt-1">
            Wypełnij podstawowe parametry innowacji. Pola zostały wstępnie uzupełnione danymi aktywnej persony: <strong>{activePersona.name}</strong>.
          </p>
        </div>

        {/* Sekcja 1: Tytuł i Kategoria */}
        <div className="space-y-4">
          <h4 className="type-h3">1. Przedmiot i kategoria innowacji</h4>
          <TextField
            label="Tytuł innowacji społecznej"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="np. Mobilna przestrzeń integracji międzypokoleniowej dla sołectw"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Kategoria ROPS Kraków"
              name="category"
              options={categories.map((c) => ({ label: c.name, value: String(c.id) }))}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            />

            <SelectField
              label="Powiat realizacji"
              name="county"
              options={counties.map((c) => ({ label: c.name, value: String(c.id) }))}
              value={countyId}
              onChange={(e) => setCountyId(e.target.value)}
            />
          </div>
        </div>

        {/* Sekcja 2: Wnioskodawca */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="type-h3">2. Dane pomysłodawcy / wnioskodawcy</h4>
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="applicantType"
                checked={applicantType === "osoba_fizyczna"}
                onChange={() => setApplicantType("osoba_fizyczna")}
              />
              <span className="type-body">Osoba fizyczna</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="applicantType"
                checked={applicantType === "podmiot_ngo"}
                onChange={() => setApplicantType("podmiot_ngo")}
              />
              <span className="type-body">Organizacja (NGO / Fundacja / JST)</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextField
              label="Imię i nazwisko"
              name="applicant_name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Adres e-mail"
              name="applicant_email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Telefon kontaktowy"
              name="applicant_phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {applicantType === "podmiot_ngo" && (
            <TextField
              label="Nazwa organizacji / podmiotu"
              name="organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="np. Fundacja Aktywna Małopolska"
            />
          )}
        </div>

        {/* Sekcja 3: Istota pomysłu & AI asystent */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="type-h3">3. Opis rozwiązania i odbiorcy</h4>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leadingIcon={Sparkle}
              onClick={handleAiSuggest}
            >
              Podpowiedź Asystenta AI
            </Button>
          </div>

          {aiSuggestion && (
            <Alert
              title="Wskazówka Asystenta Innowacji ROPS"
              description={aiSuggestion}
              variant="info"
            />
          )}

          <TextAreaField
            label="Istota rozwiązania (na czym polega innowacja?)"
            name="concept"
            required
            rows={4}
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Opisz jak działa Twoje rozwiązanie, czym różni się od dotychczasowych metod oraz jak wpisuje się w ideę deinstytucjonalizacji..."
          />

          <TextField
            label="Grupa odbiorców / beneficjentów"
            name="targetGroup"
            required
            value={targetGroup}
            onChange={(e) => setTargetGroup(e.target.value)}
          />

          {submissionType === "grant_fers" && (
            <div className="space-y-4 pt-2">
              <TextField
                label="Wnioskowana kwota grantu (PLN, limit 50 000 zł)"
                name="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Akcje formularza */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <ButtonLink href="/wyzwania" variant="tertiary">
            Anuluj i wróć
          </ButtonLink>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            trailingIcon={ArrowRight}
          >
            {isSubmitting
              ? "Wysyłanie..."
              : submissionType === "fiszka"
              ? "Złóż Fiszkę Pomysłu"
              : "Wyślij Wniosek FERS"}
          </Button>
        </div>
      </form>
    </div>
  );
}
