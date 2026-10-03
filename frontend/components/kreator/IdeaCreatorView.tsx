"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  FileText,
  Lightbulb,
} from "@phosphor-icons/react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge, Tag } from "@/components/ui/Tag";
import { Alert } from "@/components/ui/Alert";
import { usePersona } from "@/contexts/PersonaContext";
import {
  createIdea,
  getCategories,
  getCounties,
  type InnovationCategory,
  type County,
  type IdeaSubmissionPayload,
  FALLBACK_CATEGORIES,
  FALLBACK_COUNTIES,
} from "@/lib/api";
import { IdeaQuickNoteForm } from "@/components/kreator/IdeaQuickNoteForm";
import { FersGrantWizard } from "@/components/kreator/FersGrantWizard";

export function IdeaCreatorView() {
  const searchParams = useSearchParams();
  const { activePersona } = usePersona();

  const prefillTitle = searchParams.get("title") || searchParams.get("prefill_title") || "";
  const prefillDesc = searchParams.get("desc") || "";
  const prefillCat = searchParams.get("cat") || searchParams.get("prefill_category") || "";
  const prefillCounty = searchParams.get("county") || "";
  const requestedType = searchParams.get("type");

  const [categories, setCategories] = useState<InnovationCategory[]>(FALLBACK_CATEGORIES);
  const [counties, setCounties] = useState<County[]>(FALLBACK_COUNTIES);

  const [submissionType, setSubmissionType] = useState<"fiszka" | "grant_fers">(
    requestedType === "grant_fers" || activePersona.roleType === "ngo" ? "grant_fers" : "fiszka"
  );

  const [currentTitle, setCurrentTitle] = useState(prefillTitle);
  const [currentDesc, setCurrentDesc] = useState(prefillDesc);
  const [currentCategoryId, setCurrentCategoryId] = useState("1");
  const [currentCountyId, setCurrentCountyId] = useState(prefillCounty || "1");
  const [currentRecipients, setCurrentRecipients] = useState("Mieszkańcy Małopolski, w tym osoby zależne i opiekunowie");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    id: number;
    title: string;
    type: "fiszka" | "grant_fers";
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, counts] = await Promise.all([getCategories(), getCounties()]);
        if (cats && cats.length > 0) {
          setCategories(cats);
          if (prefillCat) {
            const found = cats.find(
              (c) => c.name.toLowerCase().includes(prefillCat.toLowerCase()) || c.code === prefillCat
            );
            if (found) setCurrentCategoryId(String(found.id));
          }
        }
        if (counts && counts.length > 0) {
          setCounties(counts);
          if (prefillCounty) {
            const found = counts.find((c) => String(c.id) === prefillCounty || c.slug === prefillCounty);
            if (found) setCurrentCountyId(String(found.id));
          }
        }
      } catch {
        // Fallbacks already in state
      }
    }
    loadData();
  }, [prefillCat, prefillCounty]);

  async function handleSubmit(payload: IdeaSubmissionPayload) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await createIdea({
        ...payload,
        persona_key: activePersona.key,
      });
      setSubmittedData({
        id: res.id,
        title: payload.title,
        type: payload.submission_type,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Nie udało się złożyć wniosku. Sprawdź połączenie i spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleUpgradeToFers(data: {
    title: string;
    concept: string;
    categoryId: string;
    countyId: string;
    recipients: string;
  }) {
    setCurrentTitle(data.title);
    setCurrentDesc(data.concept);
    setCurrentCategoryId(data.categoryId);
    setCurrentCountyId(data.countyId);
    setCurrentRecipients(data.recipients);
    setSubmissionType("grant_fers");
  }

  // Ekran potwierdzenia
  if (submittedData) {
    const isFers = submittedData.type === "grant_fers";
    return (
      <div className="hub-card p-8 sm:p-12 max-w-2xl mx-auto text-center bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6" role="region" aria-label="Potwierdzenie przyjęcia zgłoszenia">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle aria-hidden="true" size={44} weight="fill" />
        </div>

        <div className="space-y-2">
          <span className="type-caption font-semibold text-emerald-800 uppercase tracking-wider">
            ROPS Kraków • Status: Zgłoszenie zarejestrowane
          </span>
          <h2 className="type-h2">
            {isFers ? "Wniosek grantowy FERS został złożony!" : "Fiszka pomysłu została przyjęta!"}
          </h2>
          <p className="type-body text-slate-700">
            Numer ewidencyjny Twojego zgłoszenia: <strong>#{submittedData.id}</strong>.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-sm text-slate-700 space-y-2">
          <div className="font-semibold text-slate-900">Co dzieje się teraz?</div>
          {isFers ? (
            <ul className="list-disc pl-5 space-y-1">
              <li>Wniosek trafia do Zespołu Inkubatora Włączenia Społecznego 2.0 (FERS Działanie 5.1).</li>
              <li>Ocena formalno-merytoryczna trwa do 14 dni roboczych.</li>
              <li>W razie uwag mentor ROPS Kraków skontaktuje się pod adresem <strong>{activePersona.email}</strong>.</li>
              <li>Po akceptacji następuje podpisanie umowy mikrograntowej (do 50 000 PLN) i start fazy przygotowawczej.</li>
            </ul>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              <li>Fiszka trafiła do koordynatorów innowacji społecznych ROPS Kraków.</li>
              <li>W ciągu 3 dni roboczych otrzymasz wstępną opinię i propozycję terminu konsultacji.</li>
              <li>ROPS pomoże Ci dobrać partnera samorządowego (JST / CUS) lub rozwinąć wniosek do grantu FERS.</li>
            </ul>
          )}
        </div>

        <div className="flex flex-wrap gap-4 justify-center pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSubmittedData(null);
              setSubmissionType("fiszka");
            }}
          >
            Złóż kolejny pomysł
          </Button>
          <ButtonLink href="/wyzwania" variant="secondary">
            Przejdź do Wyzwań Regionu
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
      {submitError && (
        <Alert
          title="Błąd podczas składania wniosku"
          description={submitError}
          variant="danger"
        />
      )}
      {/* Przełącznik trybu dwupoziomowego */}
      <div className="hub-card p-6 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <span className="type-caption text-emerald-800 font-semibold uppercase tracking-wider">
              Moduł III • ROPS Kraków
            </span>
            <h2 className="type-h2">Wybierz tryb zgłoszenia innowacji</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge label={`Aktywna persona: ${activePersona.name}`} variant="neutral" />
            <Tag label="FERS Działanie 5.1 • do 50 000 zł" variant="info" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setSubmissionType("fiszka")}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
              submissionType === "fiszka"
                ? "border-emerald-600 bg-white ring-2 ring-emerald-600/20 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-900 flex items-center gap-2 text-base">
                <Lightbulb size={22} className="text-amber-500" weight="fill" />
                Poziom A: Fiszka Pomysłu
              </span>
              <Badge label="Lekka ścieżka (3 min)" variant="success" />
            </div>
            <p className="type-caption text-slate-600">
              Szybka notatka koncepcyjna. Zgłoszenie całoroczne dla mieszkańców i liderów lokalnych. ROPS pomoże Ci dobrać partnera i dopracować pomysł.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSubmissionType("grant_fers")}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
              submissionType === "grant_fers"
                ? "border-emerald-600 bg-white ring-2 ring-emerald-600/20 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-900 flex items-center gap-2 text-base">
                <FileText size={22} className="text-emerald-700" weight="fill" />
                Poziom B: Wniosek Grantowy FERS
              </span>
              <Badge label="Wzór 12 pkt (Wizard)" variant="warning" />
            </div>
            <p className="type-caption text-slate-600">
              Pełny wniosek do Inkubatora Włączenia Społecznego 2.0. Wsparcie AI przy deinstytucjonalizacji, zbalansowany budżet i eksport PDF.
            </p>
          </button>
        </div>
      </div>

      {/* Widok wybranego trybu */}
      <div className="hub-card p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
        {submissionType === "fiszka" ? (
          <IdeaQuickNoteForm
            categories={categories}
            counties={counties}
            initialTitle={currentTitle}
            initialDesc={currentDesc}
            initialCategory={currentCategoryId}
            initialCounty={currentCountyId}
            applicantName={activePersona.name}
            applicantEmail={activePersona.email}
            applicantPhone={activePersona.phone}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onUpgradeToFers={handleUpgradeToFers}
          />
        ) : (
          <FersGrantWizard
            categories={categories}
            counties={counties}
            initialTitle={currentTitle}
            initialDesc={currentDesc}
            initialCategory={currentCategoryId}
            initialCounty={currentCountyId}
            initialRecipients={currentRecipients}
            activePersona={activePersona}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => setSubmissionType("fiszka")}
          />
        )}
      </div>
    </div>
  );
}
