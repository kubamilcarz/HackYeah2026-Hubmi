"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Sparkle,
  Buildings,
  Flask,
  ChatCircleText,
} from "@phosphor-icons/react";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  RadioGroup,
  SelectField,
  StepProgress,
  TextAreaField,
  TextField,
} from "@/components/ui/FormControls";
import { Badge } from "@/components/ui/Tag";
import { CircularProgress } from "@/components/ui/Progress";
import { MatchmakingGap } from "@/components/ui/MatchmakingGap";
import { usePersona } from "@/contexts/PersonaContext";
import {
  getCategories,
  getCounties,
  analyzeMatchmaking,
  type InnovationCategory,
  type County,
  type MatchmakingAnalyzeResponse,
  FALLBACK_CATEGORIES,
  FALLBACK_COUNTIES,
} from "@/lib/api";

type NeedDraft = {
  title: string;
  description: string;
  categoryCode: string;
  affectedGroup: string;
  countyId: string;
  municipalityName: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  contactPreference: "email" | "phone" | "";
};

type DraftErrors = Partial<Record<keyof NeedDraft, string>>;

const steps = [
  { label: "Opis potrzeby" },
  { label: "Dane zgłaszającego" },
  { label: "Podsumowanie" },
  { label: "Dopasowanie ROPS" },
];

export function NeedReportFlow() {
  const { activePersona } = usePersona();

  const [categories, setCategories] = useState<InnovationCategory[]>(FALLBACK_CATEGORIES);
  const [counties, setCounties] = useState<County[]>(FALLBACK_COUNTIES);

  const [draft, setDraft] = useState<NeedDraft>({
    title: "",
    description: "",
    categoryCode: "seniors",
    affectedGroup: "Osoby starsze i opiekunowie rodzinni",
    countyId: "1",
    municipalityName: "Grybów",
    name: activePersona.name,
    email: activePersona.email,
    phone: activePersona.phone,
    role: activePersona.roleType,
    contactPreference: "email",
  });

  const [errors, setErrors] = useState<DraftErrors>({});
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchmakingAnalyzeResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const hasRendered = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const userModifiedRef = useRef(false);

  // Pobierz kategorie i powiaty z backendu
  useEffect(() => {
    async function loadData() {
      try {
        const [cats, counts] = await Promise.all([getCategories(), getCounties()]);
        if (cats && cats.length > 0) setCategories(cats);
        if (counts && counts.length > 0) setCounties(counts);
      } catch {
        // Użyj fallbacków w razie błędu
      }
    }
    loadData();
  }, []);

  // Autofill z aktywnej persony (jeśli użytkownik jeszcze nie modyfikował ręcznie danych)
  useEffect(() => {
    if (!userModifiedRef.current) {
      const matchingCounty = counties.find(
        (c) => c.slug === activePersona.countySlug || c.name === activePersona.countyName
      );
      setDraft((prev) => ({
        ...prev,
        name: activePersona.name || prev.name,
        email: activePersona.email || prev.email,
        phone: activePersona.phone || prev.phone,
        role: activePersona.roleType || prev.role,
        countyId: matchingCounty ? String(matchingCounty.id) : prev.countyId,
        municipalityName: activePersona.municipality || prev.municipalityName,
      }));
    }
  }, [activePersona, counties]);

  useEffect(() => {
    if (!hasRendered.current) {
      hasRendered.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  function focusFirstInvalid(nextErrors: DraftErrors) {
    window.requestAnimationFrame(() => {
      const fieldId = nextErrors.title
        ? "need-title"
        : nextErrors.description
        ? "need-description"
        : nextErrors.categoryCode
        ? "need-category"
        : nextErrors.countyId
        ? "need-county"
        : nextErrors.name
        ? "need-name"
        : nextErrors.email
        ? "need-email"
        : undefined;
      const field = fieldId ? document.getElementById(fieldId) : null;
      field?.focus();
    });
  }

  function validateCurrentStep() {
    const nextErrors: DraftErrors = {};

    if (step === 1) {
      if (!draft.title.trim()) nextErrors.title = "Podaj krótki tytuł potrzeby lub wyzwania.";
      if (!draft.description.trim()) nextErrors.description = "Opisz sytuację lub problem społeczny.";
      else if (draft.description.trim().length < 15)
        nextErrors.description = "Opis powinien zawierać co najmniej 15 znaków.";
      if (!draft.categoryCode) nextErrors.categoryCode = "Wybierz kategorię ROPS.";
      if (!draft.countyId) nextErrors.countyId = "Wybierz powiat Małopolski.";
    }

    if (step === 2) {
      if (!draft.name.trim()) nextErrors.name = "Podaj imię i nazwisko lub nazwę zgłaszającego.";
      if (!draft.email.trim()) nextErrors.email = "Podaj adres e-mail.";
      else if (!/^\S+@\S+\.\S+$/.test(draft.email))
        nextErrors.email = "Podaj poprawny adres e-mail.";
      if (draft.contactPreference === "phone" && !draft.phone.trim())
        nextErrors.phone = "Podaj numer telefonu, jeśli preferujesz kontakt telefoniczny.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) focusFirstInvalid(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateCurrentStep()) return;

    if (step < 3) {
      setStep((curr) => curr + 1);
      setErrors({});
      return;
    }

    // Krok 3 -> Wyślij do silnika kojarzenia (Matchmaking Engine)
    setIsSubmitting(true);
    setSubmitError(null);
    setStep(4);

    try {
      const selectedCounty = counties.find((c) => String(c.id) === draft.countyId);
      const selectedCategory = categories.find((c) => c.code === draft.categoryCode);

      const response = await analyzeMatchmaking({
        title: draft.title,
        description: draft.description,
        affected_group: draft.affectedGroup,
        category_id: selectedCategory?.id,
        category_code: draft.categoryCode,
        county_id: selectedCounty?.id,
        municipality_name: draft.municipalityName,
        persona_key: activePersona.key,
        reporter_role: draft.role,
        reporter_name: draft.name,
        reporter_email: draft.email,
        reporter_phone: draft.phone,
        save_submission: true,
      });

      setMatchResult(response);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Wystąpił błąd podczas analizy potrzeby.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function editStep(targetStep: number) {
    setStep(targetStep);
    setErrors({});
  }

  function restart() {
    setDraft({
      title: "",
      description: "",
      categoryCode: "seniors",
      affectedGroup: "",
      countyId: "1",
      municipalityName: "",
      name: activePersona.name,
      email: activePersona.email,
      phone: activePersona.phone,
      role: activePersona.roleType,
      contactPreference: "email",
    });
    setErrors({});
    setMatchResult(null);
    setSubmitError(null);
    setStep(1);
    userModifiedRef.current = false;
  }

  const selectedCounty = counties.find((c) => String(c.id) === draft.countyId);
  const availableMunicipalities = selectedCounty?.municipalities || [];
  const selectedCategoryObj = categories.find((c) => c.code === draft.categoryCode);

  return (
    <section aria-labelledby="need-flow-heading" className={`need-report${step === 4 ? " need-report--results" : ""}`}>
      {step < 4 && <StepProgress currentStep={step} label="Postęp zgłoszenia potrzeby" steps={steps} />}

      {step === 4 ? (
        <div className="need-results">
          {isSubmitting ? (
            <div className="need-results__loading" role="status" aria-live="polite">
              <CircularProgress label="Analizujemy zgłoszenie i dopasowujemy innowacje ROPS..." value={75} variant="success" />
              <h2 className="type-h2" id="need-flow-heading" ref={headingRef} tabIndex={-1}>
                Matchmaking Społeczny w toku...
              </h2>
              <p className="type-body">
                Porównujemy słowa kluczowe, 9 kategorii ROPS Kraków i specyfikę powiatu {selectedCounty?.name || "małopolskiego"}.
              </p>
            </div>
          ) : submitError ? (
            <div className="need-results__error">
              <Alert description={submitError} title="Błąd podczas analizy" variant="danger" />
              <Button onClick={() => setStep(3)} variant="secondary">Wróć i spróbuj ponownie</Button>
            </div>
          ) : matchResult ? (
            <div>
              {matchResult.is_gap_identified || matchResult.matches.length === 0 ? (
                /* Wariant: Biała Plama (Brak innowacji lub wynik < 45%) */
                <MatchmakingGap
                  actions={
                    <>
                      <ButtonLink
                        href={`/kreator?title=${encodeURIComponent(draft.title)}&desc=${encodeURIComponent(draft.description)}&cat=${draft.categoryCode}&county=${draft.countyId}`}
                        leadingIcon={Lightbulb}
                        trailingIcon={ArrowRight}
                      >
                        Przekształć w pomysł w Kreatorze Innowacji
                      </ButtonLink>
                      <Button onClick={restart} variant="secondary">Zgłoś kolejną potrzebę</Button>
                      <ButtonLink href="/start" variant="tertiary">Wróć do pulpitu</ButtonLink>
                    </>
                  }
                  description={
                    matchResult.gap_message ||
                    "W bazie innowacji ROPS Kraków nie odnaleziono jeszcze gotowego rozwiązania dla wskazanego problemu."
                  }
                  heading="Zidentyfikowano regionalną lukę innowacyjną"
                  headingRef={headingRef}
                  noticeTitle="Potrzeba została zarejestrowana"
                >
                    <p className="type-body">
                      Dobra wiadomość: Twoje zgłoszenie zostało pomyślnie zapisane w{" "}
                      <strong>Bazie Wyzwań Regionalnych ROPS Kraków</strong> (zgłoszenie nr{" "}
                      #{matchResult.submission_id || "REG-2026"}). ROPS wykorzystuje te dane do planowania nowych naborów grantowych w programie FERS.
                    </p>
                    <p className="type-body">
                      Możesz już teraz przekształcić ten problem w koncepcję innowacji lub wniosek grantowy (do 50 000 zł) w Kreatorze Pomysłów.
                    </p>
                </MatchmakingGap>
              ) : (
                /* Wariant: Znaleziono dopasowania (Scoring >= 45%) */
                <div className="need-matches">
                  <div className="need-matches__header">
                    <div className="need-matches__intro">
                      <div className="need-matches__status" role="status">
                        <Badge label="Dopasowanie gotowe" variant="success" />
                        <span>{matchResult.total_matches} {matchResult.total_matches === 1 ? "rekomendacja" : "rekomendacje"} · najwyższa zgodność {matchResult.top_score}%</span>
                      </div>
                      <h2 className="type-h2" id="need-flow-heading" ref={headingRef} tabIndex={-1}>
                        Rekomendowane innowacje ROPS
                      </h2>
                      <p className="type-body">
                        Rozwiązania przetestowane lub wdrożone w Małopolsce. Wybierz to, które najlepiej odpowiada Twojej sytuacji.
                      </p>
                    </div>
                  </div>

                  <div className="need-matches__grid">
                    {matchResult.matches.map((item, idx) => (
                      <div className="need-match-item" key={item.innovation.slug || idx}>
                        <div className="need-match-item__top">
                          <div className="need-match-item__score-row">
                            <span className="need-match-item__score-pill">
                              <Sparkle size={14} weight="fill" />
                              {item.similarity_score}% zgodności
                            </span>
                            <Badge label={`Etap: ${item.innovation.maturity_stage}`} variant="info" />
                          </div>
                          <h3 className="type-h3 need-match-item__title">
                            {item.innovation.title}
                          </h3>
                          <p className="need-match-item__category">
                            Kategoria: <strong>{item.innovation.category_name}</strong>
                          </p>
                          <p className="type-body need-match-item__summary">
                            {item.innovation.short_summary}
                          </p>
                        </div>

                        <div className="need-match-item__justification">
                          <strong className="need-match-item__justification-label">
                            Dlaczego pasuje:
                          </strong>
                          <p className="type-caption">{item.justification}</p>
                        </div>

                        <div className="need-match-item__actions">
                          {item.suggested_next_step === "middleman" && (
                            <ButtonLink
                              href={`/middleman?innovation=${item.innovation.slug}&county=${draft.countyId}`}
                              leadingIcon={Buildings}
                              size="sm"
                            >
                              Wdróż w gminie (Middleman JST)
                            </ButtonLink>
                          )}
                          {item.suggested_next_step === "tester" && (
                            <ButtonLink
                              href={`/testy?innovation=${item.innovation.slug}`}
                              leadingIcon={Flask}
                              size="sm"
                            >
                              Zgłoś się do testów innowacji
                            </ButtonLink>
                          )}
                          {item.suggested_next_step === "contact" && (
                            <ButtonLink
                              href={`/kontakt?subject=${encodeURIComponent(item.innovation.title)}`}
                              leadingIcon={ChatCircleText}
                              size="sm"
                              variant="secondary"
                            >
                              Skontaktuj się z autorem
                            </ButtonLink>
                          )}
                          <ButtonLink
                            href={`/solutions/${item.innovation.slug}`}
                            size="sm"
                            variant="tertiary"
                          >
                            Zobacz kartę innowacji
                          </ButtonLink>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="need-matches__footer">
                    <Button onClick={restart} variant="secondary">
                      Zgłoś kolejną potrzebę
                    </Button>
                    <ButtonLink href="/solutions" variant="tertiary">
                      Przeglądaj wszystkie rozwiązania
                    </ButtonLink>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : (
        <form className="need-report__form" noValidate onSubmit={handleFormSubmit}>
          {Object.keys(errors).length > 0 && (
            <Alert
              description="Popraw wskazane pola formularza, aby przejść do kolejnego kroku."
              title="Formularz wymaga uzupełnienia"
              variant="danger"
            />
          )}

          {step === 1 && (
            <>
              <h2 className="type-h2" id="need-flow-heading" ref={headingRef} tabIndex={-1}>
                Opis potrzeby lub problemu
              </h2>
              <p className="type-body need-report__hint">
                Wskaż wyzwanie społeczne w Twojej gminie. Silnik Matchmakingu ROPS Kraków przeanalizuje opis i zaproponuje innowacje lub zarejestruje nową potrzebę w regionie.
              </p>

              <TextField
                error={errors.title}
                id="need-title"
                label="Krótki tytuł zgłoszenia"
                maxLength={120}
                onChange={(e) => {
                  userModifiedRef.current = true;
                  setDraft((curr) => ({ ...curr, title: e.target.value }));
                }}
                placeholder="np. Brak opieki wytchnieniowej dla opiekunów seniorów"
                required
                value={draft.title}
              />

              <TextAreaField
                error={errors.description}
                helperText="Opisz specyfikę problemu, obecne trudności i oczekiwaną zmianę."
                id="need-description"
                label="Z jakim wyzwaniem się mierzysz?"
                maxLength={600}
                onChange={(e) => {
                  userModifiedRef.current = true;
                  setDraft((curr) => ({ ...curr, description: e.target.value }));
                }}
                placeholder="Opisz krótko sytuację mieszkańców, barierę w dostępie do usług lub potrzebę wsparcia..."
                required
                rows={5}
                showCharacterCount
                value={draft.description}
              />

              <SelectField
                error={errors.categoryCode}
                helperText="Wybierz jeden z 9 oficjalnych obszarów polityki społecznej ROPS Kraków."
                id="need-category"
                label="Oficjalna kategoria innowacji ROPS"
                onChange={(e) => {
                  userModifiedRef.current = true;
                  setDraft((curr) => ({ ...curr, categoryCode: e.target.value }));
                }}
                options={categories.map((c) => ({
                  label: `${c.name} (${c.description})`,
                  value: c.code,
                }))}
                required
                value={draft.categoryCode}
              />

              <TextField
                error={errors.affectedGroup}
                helperText="Wskaż grupę mieszkańców (np. samotni seniorzy 75+, młodzież, rodzice zastępczy)."
                id="need-affected-group"
                label="Kogo bezpośrednio dotyczy problem? (Grupa docelowa)"
                onChange={(e) => {
                  userModifiedRef.current = true;
                  setDraft((curr) => ({ ...curr, affectedGroup: e.target.value }));
                }}
                optional
                value={draft.affectedGroup}
              />

              <div className="need-form__grid-2">
                <SelectField
                  error={errors.countyId}
                  id="need-county"
                  label="Powiat Małopolski"
                  onChange={(e) => {
                    userModifiedRef.current = true;
                    setDraft((curr) => ({ ...curr, countyId: e.target.value, municipalityName: "" }));
                  }}
                  options={counties.map((c) => ({
                    label: `powiat ${c.name}`,
                    value: String(c.id),
                  }))}
                  required
                  value={draft.countyId}
                />

                {availableMunicipalities.length > 0 ? (
                  <SelectField
                    id="need-municipality"
                    label="Gmina (opcjonalnie)"
                    onChange={(e) => {
                      userModifiedRef.current = true;
                      setDraft((curr) => ({ ...curr, municipalityName: e.target.value }));
                    }}
                    optional
                    options={[
                      { label: "Cały powiat / Niezdefiniowana", value: "" },
                      ...availableMunicipalities.map((m) => ({
                        label: `${m.name} (${m.kind}${m.has_cus ? " - CUS" : ""})`,
                        value: m.name,
                      })),
                    ]}
                    value={draft.municipalityName}
                  />
                ) : (
                  <TextField
                    id="need-municipality-text"
                    label="Miejscowość lub gmina"
                    onChange={(e) => {
                      userModifiedRef.current = true;
                      setDraft((curr) => ({ ...curr, municipalityName: e.target.value }));
                    }}
                    optional
                    value={draft.municipalityName}
                  />
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="type-h2" id="need-flow-heading" ref={headingRef} tabIndex={-1}>
                Dane zgłaszającego i kontakt
              </h2>

              <div className="need-persona-autofill-notice">
                <span className="need-persona-autofill-notice__badge">
                  Autofill: {activePersona.name}
                </span>
                <p className="type-caption">
                  Dane kontaktowe zostały wstępnie uzupełnione z aktywnego profilu demonstracyjnego{" "}
                  <strong>{activePersona.name}</strong> ({activePersona.role}). Możesz je dowolnie zmodyfikować.
                </p>
              </div>

              <TextField
                autoComplete="name"
                error={errors.name}
                id="need-name"
                label="Imię i nazwisko lub nazwa instytucji/NGO"
                onChange={(e) => {
                  userModifiedRef.current = true;
                  setDraft((curr) => ({ ...curr, name: e.target.value }));
                }}
                required
                value={draft.name}
              />

              <div className="need-form__grid-2">
                <TextField
                  autoComplete="email"
                  error={errors.email}
                  id="need-email"
                  label="Adres e-mail"
                  onChange={(e) => {
                    userModifiedRef.current = true;
                    setDraft((curr) => ({ ...curr, email: e.target.value }));
                  }}
                  required
                  type="email"
                  value={draft.email}
                />

                <TextField
                  autoComplete="tel"
                  error={errors.phone}
                  id="need-phone"
                  label="Numer telefonu"
                  onChange={(e) => {
                    userModifiedRef.current = true;
                    setDraft((curr) => ({ ...curr, phone: e.target.value }));
                  }}
                  optional
                  type="tel"
                  value={draft.phone}
                />
              </div>

              <RadioGroup
                label="Preferowany sposób kontaktu"
                name="contact-preference"
                onValueChange={(val) =>
                  setDraft((curr) => ({ ...curr, contactPreference: val as NeedDraft["contactPreference"] }))
                }
                options={[
                  { label: "Wiadomość e-mail", value: "email" },
                  { label: "Kontakt telefoniczny", value: "phone" },
                ]}
                value={draft.contactPreference}
              />
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="type-h2" id="need-flow-heading" ref={headingRef} tabIndex={-1}>
                Podsumowanie i weryfikacja
              </h2>
              <p className="type-body need-report__hint">
                Sprawdź informacje przed uruchomieniem silnika dopasowania ROPS.
              </p>

              <dl className="need-summary">
                <div>
                  <dt>Tytuł zgłoszenia</dt>
                  <dd><strong>{draft.title}</strong></dd>
                  <Button onClick={() => editStep(1)} size="sm" type="button" variant="tertiary">
                    Edytuj
                  </Button>
                </div>
                <div>
                  <dt>Opis potrzeby</dt>
                  <dd>{draft.description}</dd>
                  <Button onClick={() => editStep(1)} size="sm" type="button" variant="tertiary">
                    Edytuj
                  </Button>
                </div>
                <div>
                  <dt>Kategoria i lokalizacja</dt>
                  <dd>
                    {selectedCategoryObj?.name || draft.categoryCode} • pow.{" "}
                    {selectedCounty?.name || "małopolski"}
                    {draft.municipalityName ? `, gmina ${draft.municipalityName}` : ""}
                  </dd>
                  <Button onClick={() => editStep(1)} size="sm" type="button" variant="tertiary">
                    Edytuj
                  </Button>
                </div>
                <div>
                  <dt>Dane zgłaszającego</dt>
                  <dd>
                    {draft.name} ({draft.email}
                    {draft.phone ? `, tel: ${draft.phone}` : ""})
                  </dd>
                  <Button onClick={() => editStep(2)} size="sm" type="button" variant="tertiary">
                    Edytuj
                  </Button>
                </div>
              </dl>
            </>
          )}

          <div className="need-report__actions need-report__actions--form">
            {step > 1 && (
              <Button leadingIcon={ArrowLeft} onClick={() => editStep(step - 1)} type="button" variant="tertiary">
                Wstecz
              </Button>
            )}
            <Button
              trailingIcon={step === 3 ? CheckCircle : ArrowRight}
              type="submit"
            >
              {step === 3 ? "Wyślij i dopasuj innowacje ROPS" : "Dalej"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
