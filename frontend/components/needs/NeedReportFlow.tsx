"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, Heart, Users } from "@phosphor-icons/react";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CheckboxChipGroup, RadioGroup, StepProgress, TextAreaField, TextField } from "@/components/ui/FormControls";

type NeedDraft = {
  areas: string[];
  contactPreference: "email" | "phone" | "";
  description: string;
  email: string;
  name: string;
  phone: string;
};

type DraftErrors = Partial<Record<keyof NeedDraft, string>>;

const initialDraft: NeedDraft = {
  areas: [],
  contactPreference: "",
  description: "",
  email: "",
  name: "",
  phone: "",
};

const needAreas = [
  { icon: Heart, label: "Zdrowie psychiczne", value: "zdrowie-psychiczne" },
  { icon: Users, label: "Seniorzy", value: "seniorzy" },
  { label: "Dostępność", value: "dostepnosc" },
  { label: "Integracja społeczna", value: "integracja-spoleczna" },
  { label: "Usługi społeczne", value: "uslugi-spoleczne" },
  { label: "Edukacja", value: "edukacja" },
  { label: "Cyfryzacja", value: "cyfryzacja" },
  { label: "Inne", value: "inne" },
];

const steps = [{ label: "Opis potrzeby" }, { label: "Kontakt" }, { label: "Potwierdzenie" }];

function areaLabels(values: string[]) {
  return values.map((value) => needAreas.find((area) => area.value === value)?.label ?? value);
}

export function NeedReportFlow() {
  const [draft, setDraft] = useState<NeedDraft>(initialDraft);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const hasRendered = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!hasRendered.current) {
      hasRendered.current = true;
      return;
    }

    headingRef.current?.focus();
  }, [step, submitted]);

  function focusFirstInvalid(nextErrors: DraftErrors) {
    window.requestAnimationFrame(() => {
      const fieldId = nextErrors.description ? "need-description" : nextErrors.name ? "need-name" : nextErrors.email ? "need-email" : nextErrors.phone ? "need-phone" : undefined;
      const field = fieldId ? document.getElementById(fieldId) : document.querySelector<HTMLInputElement>('input[name="need-areas"]');
      field?.focus();
    });
  }

  function validateCurrentStep() {
    const nextErrors: DraftErrors = {};

    if (step === 1) {
      if (!draft.description.trim()) nextErrors.description = "Opisz proszę wyzwanie lub potrzebę.";
      if (draft.areas.length === 0) nextErrors.areas = "Wybierz co najmniej jeden obszar.";
    }

    if (step === 2) {
      if (!draft.name.trim()) nextErrors.name = "Podaj swoje imię.";
      if (!draft.email.trim()) nextErrors.email = "Podaj adres e-mail.";
      else if (!/^\S+@\S+\.\S+$/.test(draft.email)) nextErrors.email = "Podaj poprawny adres e-mail.";
      if (draft.contactPreference === "phone" && !draft.phone.trim()) nextErrors.phone = "Podaj numer telefonu, jeśli wolisz kontakt telefoniczny.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) focusFirstInvalid(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateCurrentStep()) return;

    if (step < 3) {
      setStep((currentStep) => currentStep + 1);
      setErrors({});
      return;
    }

    setSubmitted(true);
  }

  function editStep(targetStep: number) {
    setStep(targetStep);
    setErrors({});
  }

  function restart() {
    setDraft(initialDraft);
    setErrors({});
    setStep(1);
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <section aria-labelledby="need-success-heading" className="need-report need-report--success">
        <Alert description="Twoje zgłoszenie zostało przyjęte w tej demonstracji. Poszukaj rozwiązań, które mogą pomóc w podobnej sytuacji." title="Dziękujemy za zgłoszenie potrzeby" variant="success" />
        <h2 className="type-h2" id="need-success-heading" ref={headingRef} tabIndex={-1}>Co dalej?</h2>
        <p className="type-body">Twoje dane nie zostały zapisane ani przekazane do żadnej organizacji. W wersji produkcyjnej ten etap połączy zgłoszenie z bezpiecznym procesem dopasowania.</p>
        <div className="need-report__actions">
          <ButtonLink href="/solutions" trailingIcon={ArrowRight}>Zobacz rozwiązania</ButtonLink>
          <Button onClick={restart} variant="secondary">Zgłoś kolejną potrzebę</Button>
          <ButtonLink href="/" variant="tertiary">Wróć na stronę główną</ButtonLink>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="need-flow-heading" className="need-report">
      <StepProgress currentStep={step} label="Postęp zgłoszenia potrzeby" steps={steps} />
      <form className="need-report__form" noValidate onSubmit={handleSubmit}>
        {Object.keys(errors).length > 0 && <Alert description="Popraw wskazane pola, aby przejść dalej." title="Sprawdź formularz" variant="danger" />}
        {step === 1 && <>
          <h2 className="type-h2" id="need-flow-heading" ref={headingRef} tabIndex={-1}>Opisz potrzebę</h2>
          <TextAreaField error={errors.description} id="need-description" label="Z jakim wyzwaniem się mierzysz?" maxLength={500} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Opisz krótko problem lub potrzebę…" required rows={6} showCharacterCount value={draft.description} />
          <CheckboxChipGroup error={errors.areas} label="Wybierz obszar" name="need-areas" onValueChange={(areas) => setDraft((current) => ({ ...current, areas }))} options={needAreas} value={draft.areas} />
        </>}
        {step === 2 && <>
          <h2 className="type-h2" id="need-flow-heading" ref={headingRef} tabIndex={-1}>Jak możemy się z Tobą skontaktować?</h2>
          <p className="type-body need-report__hint">Dane kontaktowe wykorzystamy tylko po to, aby odpowiedzieć na Twoje zgłoszenie.</p>
          <TextField autoComplete="given-name" error={errors.name} id="need-name" label="Imię" onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} required value={draft.name} />
          <TextField autoComplete="email" error={errors.email} id="need-email" label="Adres e-mail" onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} required type="email" value={draft.email} />
          <TextField autoComplete="tel" error={errors.phone} id="need-phone" label="Numer telefonu" onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} optional type="tel" value={draft.phone} />
          <RadioGroup error={errors.contactPreference} label="Preferowany sposób kontaktu (opcjonalnie)" name="contact-preference" onValueChange={(contactPreference) => setDraft((current) => ({ ...current, contactPreference: contactPreference as NeedDraft["contactPreference"] }))} options={[{ label: "E-mail", value: "email" }, { label: "Telefon", value: "phone" }]} value={draft.contactPreference} />
        </>}
        {step === 3 && <>
          <h2 className="type-h2" id="need-flow-heading" ref={headingRef} tabIndex={-1}>Potwierdź zgłoszenie</h2>
          <p className="type-body need-report__hint">Sprawdź dane przed wysłaniem. Możesz wrócić do każdego kroku i je poprawić.</p>
          <dl className="need-summary">
            <div><dt>Opis potrzeby</dt><dd>{draft.description}</dd><Button onClick={() => editStep(1)} size="sm" type="button" variant="tertiary">Edytuj opis</Button></div>
            <div><dt>Obszary</dt><dd>{areaLabels(draft.areas).join(", ")}</dd><Button onClick={() => editStep(1)} size="sm" type="button" variant="tertiary">Edytuj obszary</Button></div>
            <div><dt>Kontakt</dt><dd>{draft.name}, {draft.email}{draft.phone ? `, ${draft.phone}` : ""}{draft.contactPreference ? ` (${draft.contactPreference === "email" ? "e-mail" : "telefon"})` : ""}</dd><Button onClick={() => editStep(2)} size="sm" type="button" variant="tertiary">Edytuj kontakt</Button></div>
          </dl>
        </>}
        <div className="need-report__actions need-report__actions--form">
          {step > 1 && <Button leadingIcon={ArrowLeft} onClick={() => editStep(step - 1)} type="button" variant="tertiary">Wstecz</Button>}
          <Button trailingIcon={step === 3 ? CheckCircle : ArrowRight} type="submit">{step === 3 ? "Potwierdź zgłoszenie" : "Dalej"}</Button>
        </div>
      </form>
    </section>
  );
}
