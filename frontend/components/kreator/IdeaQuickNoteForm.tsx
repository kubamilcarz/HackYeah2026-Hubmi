"use client";

import { useState } from "react";
import { ArrowRight, FileText, Lightbulb, ShieldCheck } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import {
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/ui/FormControls";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Tag";
import { AiValidationCard } from "@/components/kreator/AiValidationCard";
import type { InnovationCategory, County, IdeaSubmissionPayload, AiValidationResult } from "@/lib/api";
import { aiAssistIdea, aiValidateIdea } from "@/lib/api";

type IdeaQuickNoteFormProps = {
  categories: InnovationCategory[];
  counties: County[];
  initialTitle: string;
  initialDesc: string;
  initialCategory: string;
  initialCounty: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  isSubmitting: boolean;
  onSubmit: (payload: IdeaSubmissionPayload) => void;
  onUpgradeToFers: (data: {
    title: string;
    concept: string;
    categoryId: string;
    countyId: string;
    recipients: string;
  }) => void;
};

export function IdeaQuickNoteForm({
  categories,
  counties,
  initialTitle,
  initialDesc,
  initialCategory,
  initialCounty,
  applicantName,
  applicantEmail,
  applicantPhone,
  isSubmitting,
  onSubmit,
  onUpgradeToFers,
}: IdeaQuickNoteFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [categoryId, setCategoryId] = useState(initialCategory || "1");
  const [countyId, setCountyId] = useState(initialCounty || "1");
  const [name, setName] = useState(applicantName);
  const [email, setEmail] = useState(applicantEmail);
  const [phone, setPhone] = useState(applicantPhone);
  const [concept, setConcept] = useState(initialDesc);
  const [recipients, setRecipients] = useState("Mieszkańcy Małopolski, w tym osoby zależne i opiekunowie");
  const [stage, setStage] = useState("koncepcja");
  const [supportNeeded, setSupportNeeded] = useState("doradztwo");
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<AiValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  async function handleAiAssist() {
    setIsAiLoading(true);
    try {
      const res = await aiAssistIdea({
        field: "deinstitutionalization",
        title: title || "Innowacja Społeczna",
        category: categoryId,
        county: countyId,
      });
      setAiTip(res.suggestion || null);
    } catch {
      setAiTip(
        "Wskazówka ROPS: Zadbaj, aby Twój pomysł rozwijał usługi w lokalnym środowisku zamieszkania (np. kluby seniora, opieka wytchnieniowa, wsparcie sąsiedzkie), ograniczając konieczność kierowania osób do placówek całodobowych."
      );
    } finally {
      setIsAiLoading(false);
    }
  }

  async function handleValidateConcept() {
    setIsValidating(true);
    try {
      const res = await aiValidateIdea({
        field: "concept",
        content: concept || "",
        title: title || "Innowacja Społeczna",
        category: categoryId,
        county: countyId,
        target_recipients: recipients,
      });
      if (!("batch" in res)) {
        setValidationResult(res);
      }
    } catch {
      // Ignore
    } finally {
      setIsValidating(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      submission_type: "fiszka",
      title: title || "Nowa innowacja społeczna",
      category_id: categoryId,
      county_id: countyId,
      applicant_type: "osoba_fizyczna",
      applicant_name: name,
      applicant_email: email,
      applicant_phone: phone,
      solution_concept: concept,
      target_group: recipients,
      stage,
      support_needed: supportNeeded,
      estimated_budget_pln: 25000,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Baner możliwości awansu do wniosku grantowego */}
      <div className="creator-upgrade-banner">
        <div className="flex items-start gap-3">
          <FileText size={22} className="text-emerald-700 shrink-0 mt-0.5" weight="fill" aria-hidden="true" />
          <div>
            <h4 className="type-body font-semibold text-slate-900">Potrzebujesz dofinansowania do 50 000 zł?</h4>
            <p className="type-caption text-slate-600 mt-0.5">
              Możesz w każdej chwili przenieść wprowadzone dane do 12-punktowego wniosku grantowego FERS.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          trailingIcon={ArrowRight}
          onClick={() =>
            onUpgradeToFers({
              title,
              concept,
              categoryId,
              countyId,
              recipients,
            })
          }
        >
          Rozwiń do wniosku FERS
        </Button>
      </div>

      {/* Sekcja 1: Tytuł i kategoria */}
      <div className="creator-section">
        <div className="creator-section__header">
          <h3 className="type-h3">1. Temat i obszar innowacji</h3>
          <Badge label="Nabór ciągły" variant="success" />
        </div>

        <TextField
          label="Tytuł pomysłu na innowację"
          name="fiszka_title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="np. Sąsiedzki wolontariat wytchnieniowy dla rodzin osób niesamodzielnych"
          helperText="Krótka, czytelna nazwa Twojego pomysłu."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Kategoria ROPS Kraków"
            name="fiszka_category"
            options={categories.map((c) => ({ label: c.name, value: String(c.id) }))}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          />

          <SelectField
            label="Powiat realizacji"
            name="fiszka_county"
            options={counties.map((c) => ({ label: c.name, value: String(c.id) }))}
            value={countyId}
            onChange={(e) => setCountyId(e.target.value)}
          />
        </div>
      </div>

      {/* Sekcja 2: Dane zgłaszającego */}
      <div className="creator-section">
        <div className="creator-section__header">
          <h3 className="type-h3">2. Dane kontaktowe pomysłodawcy</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField
            label="Imię i nazwisko"
            name="fiszka_name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Adres e-mail"
            name="fiszka_email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Telefon kontaktowy"
            name="fiszka_phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      {/* Sekcja 3: Istota pomysłu */}
      <div className="creator-section">
        <div className="creator-section__header">
          <h3 className="type-h3">3. Istota innowacji i odbiorcy</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="tertiary"
              size="sm"
              leadingIcon={Lightbulb}
              disabled={isAiLoading}
              onClick={handleAiAssist}
            >
              {isAiLoading ? "Przygotowuję..." : "Wskazówka doradcy"}
            </Button>
            <Button
              type="button"
              variant="tertiary"
              size="sm"
              leadingIcon={ShieldCheck}
              disabled={isValidating}
              onClick={handleValidateConcept}
            >
              {isValidating ? "Sprawdzanie..." : "Sprawdź pomysł (AI)"}
            </Button>
          </div>
        </div>

        {aiTip && (
          <Alert
            title="Podpowiedź merytoryczna"
            description={aiTip}
            variant="info"
          />
        )}

        <TextAreaField
          label="Na czym polega Twój pomysł? (istota innowacji)"
          name="fiszka_concept"
          required
          rows={4}
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="Jaki problem rozwiązujesz, jak działa usługa i co wyróżnia to podejście?"
          helperText="Wystarczą 2–4 zdania opisujące sedno pomysłu."
        />

        {validationResult && (
          <div className="mt-3">
            <AiValidationCard
              result={validationResult}
              onDismiss={() => setValidationResult(null)}
              onApplyAiFix={async () => {
                await handleAiAssist();
                if (aiTip) {
                  setConcept((prev) => (prev ? `${prev.trim()}\n\n${aiTip}` : aiTip));
                }
              }}
              onRevalidate={handleValidateConcept}
              isFixing={isAiLoading}
              isValidating={isValidating}
            />
          </div>
        )}

        <TextField
          label="Do kogo skierowana jest innowacja? (grupa odbiorców)"
          name="fiszka_recipients"
          required
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          placeholder="np. Seniorzy 75+ mieszkający samotnie na terenach wiejskich"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <SelectField
            label="Aktualny etap pomysłu"
            name="fiszka_stage"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            options={[
              { label: "Koncepcja (wstępny pomysł)", value: "koncepcja" },
              { label: "Wczesny prototyp / zarys metody", value: "prototyp" },
              { label: "Pilotaż lokalny / testy na małej grupie", value: "testy" },
            ]}
          />

          <SelectField
            label="Jakiego wsparcia najbardziej potrzebujesz?"
            name="fiszka_support"
            value={supportNeeded}
            onChange={(e) => setSupportNeeded(e.target.value)}
            options={[
              { label: "Doradztwo merytoryczne i mentoring ROPS", value: "doradztwo" },
              { label: "Dobranie partnera samorządowego (JST / CUS)", value: "partner_jst" },
              { label: "Dobranie partnera pozarządowego (NGO)", value: "partner_ngo" },
              { label: "Dofinansowanie w ramach mikrograntu FERS", value: "grant" },
              { label: "Dostęp do grupy testerów innowacji", value: "testerzy" },
            ]}
          />
        </div>
      </div>

      {/* Akcja złożenia */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
        <span className="type-caption text-slate-500">
          Zespół ROPS Kraków odpowie w ciągu 3 dni roboczych.
        </span>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          trailingIcon={ArrowRight}
        >
          {isSubmitting ? "Wysyłanie..." : "Złóż fiszkę pomysłu"}
        </Button>
      </div>
    </form>
  );
}
