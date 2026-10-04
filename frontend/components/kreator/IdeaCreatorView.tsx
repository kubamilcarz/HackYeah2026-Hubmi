"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
} from "@phosphor-icons/react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge, Tag } from "@/components/ui/Tag";
import { Alert } from "@/components/ui/Alert";
import { RadioGroup } from "@/components/ui/FormControls";
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
      <div className="creator-confirmation-card" role="region" aria-label="Potwierdzenie przyjęcia zgłoszenia">
        <div className="creator-confirmation-icon">
          <CheckCircle aria-hidden="true" size={40} weight="fill" />
        </div>

        <div className="space-y-2">
          <span className="type-caption font-semibold text-emerald-800 uppercase tracking-wider">
            ROPS Kraków • Zgłoszenie zarejestrowane
          </span>
          <h2 className="type-h2">
            {isFers ? "Wniosek grantowy FERS został złożony" : "Fiszka pomysłu została przyjęta"}
          </h2>
          <p className="type-body text-slate-700">
            Numer ewidencyjny Twojego zgłoszenia: <strong>#{submittedData.id}</strong>.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-sm text-slate-700 w-full">
          {isFers
            ? "Twój wniosek trafił do zespołu ekspertów Inkubatora Włączenia Społecznego ROPS Kraków. O wyniku oceny formalno-merytorycznej powiadomimy Cię drogą e-mailową."
            : "Dziękujemy za podzielenie się pomysłem. Zespół ROPS Kraków skontaktuje się z Tobą w ciągu 3 dni roboczych, aby omówić dalsze kroki rozwoju innowacji."}
        </div>

        <div className="flex flex-wrap gap-3 justify-center pt-2">
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
    <div className="kreator-flow space-y-6">
      {submitError && (
        <Alert
          title="Błąd podczas składania wniosku"
          description={submitError}
          variant="danger"
        />
      )}
      {/* Przełącznik trybu dwupoziomowego */}
      <section aria-labelledby="creator-mode-heading" className="creator-mode-card">
        <div className="creator-mode-header">
          <div>
            <h2 className="type-h2" id="creator-mode-heading">Wybierz tryb zgłoszenia</h2>
            <p className="type-body text-slate-600 mt-1">
              W zależności od etapu pomysłu możesz złożyć szybką fiszkę lub pełny wniosek grantowy.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge label={`Profil: ${activePersona.name}`} variant="neutral" />
            <Tag label="FERS Działanie 5.1 • do 50 000 zł" variant="info" />
          </div>
        </div>

        <RadioGroup
          label="Tryb zgłoszenia"
          name="submission-type"
          onValueChange={(value) => setSubmissionType(value as "fiszka" | "grant_fers")}
          options={[
            {
              value: "fiszka",
              label: "Fiszka pomysłu (około 3 min)",
              description: "Krótki opis idei i potrzebnego wsparcia (doradztwo, partnerzy, testy). Odpowiedź ROPS w 3 dni robocze.",
            },
            {
              value: "grant_fers",
              label: "Wniosek grantowy FERS (12 punktów)",
              description: "Pełny wniosek z budżetem do 50 000 zł, harmonogramem i podglądem arkusza do druku PDF.",
            },
          ]}
          value={submissionType}
        />
      </section>

      {/* Widok wybranego trybu */}
      <section aria-label="Formularz zgłoszenia innowacji" className="hub-card p-6 sm:p-8">
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
      </section>
    </div>
  );
}
