"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowsClockwise,
  Buildings,
  ChartLineUp,
  CheckCircle,
  FileText,
  Lightbulb,
  Plus,
  Printer,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import {
  SelectField,
  StepProgress,
  TextAreaField,
  TextField,
} from "@/components/ui/FormControls";
import { Alert } from "@/components/ui/Alert";
import { Badge, Tag } from "@/components/ui/Tag";
import { ConceptDiagramView, type DiagramStep } from "@/components/kreator/ConceptDiagramView";
import { FersPrintView } from "@/components/kreator/FersPrintView";
import type {
  InnovationCategory,
  County,
  IdeaSubmissionPayload,
  ActionPlanItem,
  GroupMember,
} from "@/lib/api";
import { aiAssistIdea } from "@/lib/api";

const STEPS = [
  { label: "1. Wnioskodawca" },
  { label: "2. Innowacja & Cel" },
  { label: "3. Diagnoza & Odbiorcy" },
  { label: "4. Budżet & Harmonogram" },
  { label: "5. Zespół & Złożenie" },
];

type FersGrantWizardProps = {
  categories: InnovationCategory[];
  counties: County[];
  initialTitle: string;
  initialDesc: string;
  initialCategory: string;
  initialCounty: string;
  initialRecipients?: string;
  activePersona: {
    key: string;
    name: string;
    roleType: string;
    organization?: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    postalCode?: string;
    krs?: string;
    nip?: string;
    regon?: string;
    representative?: string;
  };
  isSubmitting: boolean;
  onSubmit: (payload: IdeaSubmissionPayload) => void;
  onCancel: () => void;
};

export function FersGrantWizard({
  categories,
  counties,
  initialTitle,
  initialDesc,
  initialCategory,
  initialCounty,
  initialRecipients,
  activePersona,
  isSubmitting,
  onSubmit,
  onCancel,
}: FersGrantWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Krok 1: Pkt 1 & Pkt 2
  const [title, setTitle] = useState(initialTitle);
  const [categoryId, setCategoryId] = useState(initialCategory || "1");
  const [countyId, setCountyId] = useState(initialCounty || "1");
  const [applicantType, setApplicantType] = useState<"osoba_fizyczna" | "podmiot_ngo" | "grupa_nieformalna">(
    activePersona.roleType === "ngo" ? "podmiot_ngo" : "osoba_fizyczna"
  );
  const [applicantName, setApplicantName] = useState(activePersona.organization || activePersona.name);
  const [applicantEmail, setApplicantEmail] = useState(activePersona.email);
  const [applicantPhone, setApplicantPhone] = useState(activePersona.phone);
  const [applicantAddress, setApplicantAddress] = useState(activePersona.address || "");
  const [applicantCity, setApplicantCity] = useState(activePersona.city || "Kraków");
  const [applicantPostalCode, setApplicantPostalCode] = useState(activePersona.postalCode || "31-000");

  const [orgKrs, setOrgKrs] = useState(activePersona.krs || "");
  const [orgNip, setOrgNip] = useState(activePersona.nip || "");
  const [orgRegon, setOrgRegon] = useState(activePersona.regon || "");
  const [orgRepresentative, setOrgRepresentative] = useState(activePersona.representative || activePersona.name);

  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([
    { name: activePersona.name, role: "Lider merytoryczny", city: activePersona.city || "Kraków" },
    { name: "Piotr Kowalski", role: "Koordynator partnerstw lokalnych", city: "Tarnów" },
  ]);

  // Krok 2: Pkt 3 & Pkt 4
  const [innovationDesc, setInnovationDesc] = useState(
    initialDesc ||
      "Innowacja polega na uruchomieniu lokalnego, mobilnego zespołu wsparcia środowiskowego dla osób niesamodzielnych. Rozwiązanie wpisuje się bezpośrednio w ideę deinstytucjonalizacji poprzez przeniesienie ciężaru opieki z placówek całodobowych (DPS) na rzecz usług w naturalnym miejscu zamieszkania beneficjenta."
  );
  const [uniquenessRationale, setUniquenessRationale] = useState(
    "Głównym wyróżnikiem jest model wsparcia sąsiedzkiego opartego na mikrostypendiach samopomocowych oraz mobilna aplikacja koordynująca zgłoszenia. W porównaniu z tradycyjnymi usługami opiekuńczymi czas reakcji skraca się z kilku dni do 4 godzin, a koszt jednostkowy godziny opieki jest o 35% niższy."
  );

  // Krok 3: Pkt 5, Pkt 6, Pkt 7
  const [problemDiagnosis, setProblemDiagnosis] = useState(
    "Diagnoza oparta na Raporcie Obserwatorium Polityki Społecznej ROPS Kraków. W analizowanym powiecie wskaźnik starości demograficznej przekracza 24%, a ponad 60% osób niesamodzielnych na obszarach wiejskich ma utrudniony dostęp do stacjonarnych placówek wsparcia dziennego."
  );
  const [targetRecipients, setTargetRecipients] = useState(
    initialRecipients || "30 osób starszych o ograniczonej sprawności i 20 opiekunów rodzinnych"
  );
  const [expectedChange, setExpectedChange] = useState(
    "Poprawa jakości życia i poczucia bezpieczeństwa podopiecznych, ograniczenie izolacji społecznej oraz zmniejszenie obciążenia psychofizycznego opiekunów rodzinnych o minimum 40% (mierzone testem ZARIT)."
  );

  // Krok 4: Pkt 8, Pkt 9, Pkt 10
  const [scalabilityModel, setScalabilityModel] = useState(
    "Rozwiązanie posiada gotowy standard procedur i może być bez przeszkód replikowane w dowolnym Centrum Usług Społecznych (CUS) lub gminnym OPS w Małopolsce w formie Programu Usług Społecznych."
  );
  const [actionPlanPrep, setActionPlanPrep] = useState<ActionPlanItem[]>([
    { dzialanie: "Opracowanie standardu usługi, regulaminu i procedur bezpieczeństwa", termin: "Miesiąc 1-2", koszt: 8000 },
    { dzialanie: "Szkolenie kadry i przygotowanie mobilnych pakietów asystenckich", termin: "Miesiąc 2-3", koszt: 6000 },
  ]);
  const [actionPlanTesting, setActionPlanTesting] = useState<ActionPlanItem[]>([
    { dzialanie: "Pilotażowe świadczenie usług u 30 beneficjentów w 3 gminach", termin: "Miesiące 4-9", koszt: 32000, liczba_testerow: 30 },
    { dzialanie: "Ewaluacja dostępności WCAG 2.2, badanie satysfakcji i raport końcowy", termin: "Miesiące 10-12", koszt: 4000, liczba_testerow: 30 },
  ]);

  // Krok 5: Pkt 11 & Pkt 12
  const [teamExperience, setTeamExperience] = useState(
    "Zespół posiada 8 lat udokumentowanego doświadczenia w realizacji projektów społecznych i aktywizacyjnych na terenie Małopolski, w tym programów FERS, ASOS i grantów ROPS Kraków. Koordynator projektu posiada certyfikat zarządzania usługami deinstytucjonalnymi."
  );
  const [formalAccepted, setFormalAccepted] = useState(false);

  // Diagram state
  const [diagramSteps, setDiagramSteps] = useState<DiagramStep[] | undefined>(undefined);
  const [diagramMermaid, setDiagramMermaid] = useState<string | undefined>(undefined);

  // AI loading and alert states
  const [aiLoadingField, setAiLoadingField] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<{ title: string; desc: string; variant?: "info" | "success" } | null>(null);

  const stepContainerRef = useRef<HTMLDivElement>(null);

  // Obliczenia budżetowe (Pkt 10)
  const prepTotal = actionPlanPrep.reduce((acc, item) => acc + (Number(item.koszt) || 0), 0);
  const testingTotal = actionPlanTesting.reduce((acc, item) => acc + (Number(item.koszt) || 0), 0);
  const requestedAmount = prepTotal + testingTotal;
  const isBudgetOverLimit = requestedAmount > 50000;

  // Znajdź nazwy kategorii i powiatu
  const currentCategory = categories.find((c) => String(c.id) === categoryId);
  const currentCounty = counties.find((c) => String(c.id) === countyId);

  useEffect(() => {
    // Keep a keyboard user oriented after changing the in-place step.
    stepContainerRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
    stepContainerRef.current?.focus({ preventScroll: true });
  }, [currentStep]);

  // Załaduj przykładowe dane wzorcowe
  function handleLoadSampleData() {
    setTitle("Sąsiedzki wolontariat wytchnieniowy dla rodzin osób niesamodzielnych");
    setInnovationDesc(
      "Innowacja polega na uruchomieniu lokalnego zespołu wsparcia środowiskowego dla opiekunów osób niesamodzielnych. Rozwiązanie przenosi ciężar opieki z placówek całodobowych na usługi świadczone w miejscu zamieszkania beneficjenta."
    );
    setUniquenessRationale(
      "Model wsparcia sąsiedzkiego oparty na mikrostypendiach samopomocowych oraz mobilnym koordynatorze. Zapewnia czas reakcji do 4 godzin oraz o 35% niższy koszt jednostkowy w porównaniu z opieką instytucjonalną."
    );
    setProblemDiagnosis(
      "Diagnoza oparta na Raporcie Obserwatorium Polityki Społecznej ROPS Kraków. W analizowanym powiecie wskaźnik starości demograficznej przekracza 24%, a ponad 60% osób niesamodzielnych ma utrudniony dostęp do placówek wsparcia dziennego."
    );
    setTargetRecipients("30 osób starszych o ograniczonej sprawności i 20 opiekunów rodzinnych");
    setExpectedChange(
      "Poprawa jakości życia i poczucia bezpieczeństwa podopiecznych, ograniczenie izolacji oraz zmniejszenie obciążenia psychofizycznego opiekunów rodzinnych o min. 40%."
    );
    setScalabilityModel(
      "Rozwiązanie posiada gotowy standard procedur i może być replikowane w małopolskich CUS lub OPS w formie Programu Usług Społecznych."
    );
    setTeamExperience(
      "Zespół posiada 8 lat doświadczenia w realizacji projektów społecznych na terenie Małopolski, w tym programów FERS i grantów ROPS Kraków."
    );
    setFormalAccepted(true);
    setAiMessage({
      title: "Wczytano wzorcowy wniosek FERS",
      desc: "Wszystkie punkty wniosku zostały uzupełnione danymi demonstracyjnymi. Możesz przejść przez kolejne etapy.",
      variant: "success",
    });
  }

  // Asystent AI
  async function triggerAiAssist(field: "deinstitutionalization" | "innovation_uniqueness" | "county_diagnosis" | "scalability" | "budget_action_plan" | "concept_diagram") {
    setAiLoadingField(field);
    setAiMessage(null);
    try {
      const res = await aiAssistIdea({
        field,
        title: title || "Innowacja Społeczna",
        category: categoryId,
        county: countyId,
        target_recipients: targetRecipients,
        concept: innovationDesc,
      });

      if (field === "deinstitutionalization") {
        setInnovationDesc(
          (prev) => prev ? `${prev.trim()}\n\n${res.suggestion || ""}` : (res.suggestion || "")
        );
        setAiMessage({
          title: "Uzupełniono opis o wymiar deinstytucjonalizacji",
          desc: "Włączono do opisu zasady wsparcia środowiskowego i redukcji opieki stacjonarnej.",
          variant: "success",
        });
      } else if (field === "innovation_uniqueness") {
        setUniquenessRationale(res.suggestion || "");
        setAiMessage({
          title: "Zaproponowano wyróżniki innowacji",
          desc: "Treść została zaktualizowana w oparciu o analizę podobnych projektów w regionie.",
          variant: "success",
        });
      } else if (field === "county_diagnosis") {
        setProblemDiagnosis(res.suggestion || "");
        setAiMessage({
          title: `Zaciągnięto dane Obserwatorium ROPS dla: ${res.county || currentCounty?.name}`,
          desc: "Do pola diagnozy wstawiono realne wskaźniki demograficzne i wyzwania strategiczne powiatu.",
          variant: "success",
        });
      } else if (field === "scalability") {
        setScalabilityModel(res.suggestion || "");
        setAiMessage({
          title: "Wygenerowano model replikacji w samorządach",
          desc: "Uwzględniono adaptację w strukturach Centrum Usług Społecznych (CUS) i OPS.",
          variant: "success",
        });
      } else if (field === "budget_action_plan" && res.action_plan_prep && res.action_plan_testing) {
        setActionPlanPrep(res.action_plan_prep);
        setActionPlanTesting(res.action_plan_testing);
        setAiMessage({
          title: "Wygenerowano budżet i harmonogram FERS",
          desc: res.suggestion || "Harmonogram i budżet zbalansowany do 50 000 zł.",
          variant: "success",
        });
      } else if (field === "concept_diagram") {
        if (res.steps) setDiagramSteps(res.steps);
        if (res.mermaid_code) setDiagramMermaid(res.mermaid_code);
        setAiMessage({
          title: "Zaktualizowano schemat koncepcji innowacji",
          desc: "Wizualizacja odzwierciedla teraz zaktualizowaną logikę projektu i fazy testów.",
          variant: "success",
        });
      }
    } catch {
      setAiMessage({
        title: "Błąd usługi doradczej",
        desc: "Nie udało się połączyć z usługą doradczą ROPS. Spróbuj ponownie za chwilę.",
        variant: "info",
      });
    } finally {
      setAiLoadingField(null);
    }
  }

  // Akcje dodawania/usuwania działań w harmonogramie
  function addPrepItem() {
    setActionPlanPrep([
      ...actionPlanPrep,
      { dzialanie: "Nowe działanie przygotowawcze", termin: "Miesiąc 3", koszt: 2000 },
    ]);
  }

  function removePrepItem(idx: number) {
    setActionPlanPrep(actionPlanPrep.filter((_, i) => i !== idx));
  }

  function addTestingItem() {
    setActionPlanTesting([
      ...actionPlanTesting,
      { dzialanie: "Dodatkowe warsztaty pilotażowe dla testerów", termin: "Miesiące 6-8", koszt: 5000, liczba_testerow: 15 },
    ]);
  }

  function removeTestingItem(idx: number) {
    setActionPlanTesting(actionPlanTesting.filter((_, i) => i !== idx));
  }

  // Grupa nieformalna: dodawanie członka
  function addGroupMember() {
    setGroupMembers([
      ...groupMembers,
      { name: "Nowy Członek Grupy", role: "Ekspert / Animator", city: applicantCity || "Kraków" },
    ]);
  }

  function removeGroupMember(idx: number) {
    setGroupMembers(groupMembers.filter((_, i) => i !== idx));
  }

  // Złożenie ostateczne wniosku
  function handleFinalSubmit() {
    if (isSubmitting || isBudgetOverLimit || !formalAccepted) return;

    onSubmit({
      submission_type: "grant_fers",
      persona_key: activePersona.key,
      title: title || "Nowy wniosek grantowy FERS",
      category_id: categoryId,
      county_id: countyId,
      applicant_type: applicantType,
      applicant_name: applicantName,
      applicant_email: applicantEmail,
      applicant_phone: applicantPhone,
      applicant_address: applicantAddress,
      applicant_city: applicantCity,
      applicant_postal_code: applicantPostalCode,
      organization_krs: orgKrs,
      organization_nip: orgNip,
      organization_regon: orgRegon,
      organization_representative: orgRepresentative,
      group_members: applicantType === "grupa_nieformalna" ? groupMembers : [],
      innovation_description: innovationDesc,
      uniqueness_rationale: uniquenessRationale,
      problem_diagnosis: problemDiagnosis,
      target_recipients: targetRecipients,
      expected_change: expectedChange,
      scalability_model: scalabilityModel,
      action_plan_prep: actionPlanPrep,
      action_plan_testing: actionPlanTesting,
      requested_grant_amount: requestedAmount,
      team_experience: teamExperience,
      formal_declarations_accepted: formalAccepted,
    });
  }

  if (showPrintPreview) {
    return (
      <FersPrintView
        data={{
          title,
          categoryName: currentCategory?.name || "Włączenie społeczne",
          countyName: currentCounty?.name || "powiat małopolski",
          applicantType,
          applicantName,
          applicantEmail,
          applicantPhone,
          applicantAddress,
          applicantCity,
          applicantPostalCode,
          organizationKrs: orgKrs,
          organizationNip: orgNip,
          organizationRegon: orgRegon,
          organizationRepresentative: orgRepresentative,
          groupMembers,
          innovationDescription: innovationDesc,
          uniquenessRationale,
          problemDiagnosis,
          targetRecipients,
          expectedChange,
          scalabilityModel,
          actionPlanPrep,
          actionPlanTesting,
          requestedGrantAmount: requestedAmount,
          teamExperience,
          formalDeclarationsAccepted: formalAccepted,
        }}
        onBack={() => setShowPrintPreview(false)}
      />
    );
  }

  return (
    <div ref={stepContainerRef} className="space-y-6" tabIndex={-1}>
      {/* Pasek postępu 5 etapów */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="type-h2">Generator wniosku grantowego FERS (12 punktów)</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="tertiary"
              size="sm"
              leadingIcon={FileText}
              onClick={handleLoadSampleData}
            >
              Wczytaj wzorzec
            </Button>
            <Tag label="Maks. mikrogrant: 50 000 PLN" variant="info" />
          </div>
        </div>

        <StepProgress
          label="Etapy wniosku grantowego"
          currentStep={currentStep}
          steps={STEPS}
        />
      </div>

      {/* Komunikat asystenta AI */}
      {aiMessage && (
        <Alert
          title={aiMessage.title}
          description={aiMessage.desc}
          variant={aiMessage.variant || "info"}
        />
      )}

      {/* KROK 1: Metryka & Wnioskodawca */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="type-h2">1. Przedmiot innowacji i dane wnioskodawcy</h3>
          </div>

          <div className="space-y-4">
            <TextField
              label="Pkt 1: Tytuł innowacji społecznej"
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="np. Mobilny Punkt Integracji i Terapii Sensorycznej dla Dzieci ze Wsi"
              helperText="Zwięzły tytuł jednoznacznie wskazujący na istotę proponowanej innowacji."
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
                label="Główny powiat realizacji"
                name="county"
                options={counties.map((c) => ({ label: c.name, value: String(c.id) }))}
                value={countyId}
                onChange={(e) => setCountyId(e.target.value)}
              />
            </div>
          </div>

          <div className="creator-section">
            <div className="creator-section__header">
              <h4 className="type-h3">Pkt 2: Forma prawna i dane wnioskodawcy</h4>
              <Badge label={`Autouzupełnienie: ${activePersona.name}`} variant="neutral" />
            </div>

            <div className="creator-applicant-type-group">
              <label className="creator-applicant-radio-label">
                <input
                  type="radio"
                  name="applicant_type"
                  checked={applicantType === "osoba_fizyczna"}
                  onChange={() => setApplicantType("osoba_fizyczna")}
                />
                <span>Osoba fizyczna (mieszkaniec)</span>
              </label>

              <label className="creator-applicant-radio-label">
                <input
                  type="radio"
                  name="applicant_type"
                  checked={applicantType === "podmiot_ngo"}
                  onChange={() => setApplicantType("podmiot_ngo")}
                />
                <span>Podmiot / NGO / Fundacja / JST</span>
              </label>

              <label className="creator-applicant-radio-label">
                <input
                  type="radio"
                  name="applicant_type"
                  checked={applicantType === "grupa_nieformalna"}
                  onChange={() => setApplicantType("grupa_nieformalna")}
                />
                <span>Grupa nieformalna (min. 2 osoby)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TextField
                label={applicantType === "podmiot_ngo" ? "Nazwa podmiotu / organizacji" : "Imię i nazwisko wnioskodawcy"}
                name="applicant_name"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
              />
              <TextField
                label="Adres e-mail"
                name="applicant_email"
                type="email"
                required
                value={applicantEmail}
                onChange={(e) => setApplicantEmail(e.target.value)}
              />
              <TextField
                label="Telefon kontaktowy"
                name="applicant_phone"
                value={applicantPhone}
                onChange={(e) => setApplicantPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TextField
                label="Adres (ulica i numer)"
                name="applicant_address"
                value={applicantAddress}
                onChange={(e) => setApplicantAddress(e.target.value)}
                placeholder="np. ul. Krakowska 12"
              />
              <TextField
                label="Kod pocztowy"
                name="applicant_postal_code"
                value={applicantPostalCode}
                onChange={(e) => setApplicantPostalCode(e.target.value)}
                placeholder="np. 33-100"
              />
              <TextField
                label="Miejscowość"
                name="applicant_city"
                value={applicantCity}
                onChange={(e) => setApplicantCity(e.target.value)}
                placeholder="np. Tarnów"
              />
            </div>

            {/* Pola dla NGO */}
            {applicantType === "podmiot_ngo" && (
              <div className="creator-subpanel">
                <h5 className="type-body font-semibold text-slate-900">Dane rejestrowe podmiotu</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <TextField
                    label="Numer KRS"
                    name="org_krs"
                    value={orgKrs}
                    onChange={(e) => setOrgKrs(e.target.value)}
                  />
                  <TextField
                    label="Numer NIP"
                    name="org_nip"
                    value={orgNip}
                    onChange={(e) => setOrgNip(e.target.value)}
                  />
                  <TextField
                    label="Numer REGON"
                    name="org_regon"
                    value={orgRegon}
                    onChange={(e) => setOrgRegon(e.target.value)}
                  />
                </div>
                <TextField
                  label="Osoba uprawniona do reprezentacji formalnej"
                  name="org_representative"
                  value={orgRepresentative}
                  onChange={(e) => setOrgRepresentative(e.target.value)}
                  placeholder="np. Katarzyna Zielińska - Prezes Zarządu"
                />
              </div>
            )}

            {/* Pola dla Grupy Nieformalnej */}
            {applicantType === "grupa_nieformalna" && (
              <div className="creator-subpanel">
                <div className="flex items-center justify-between">
                  <h5 className="type-body font-semibold text-slate-900">Członkowie grupy nieformalnej</h5>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leadingIcon={Plus}
                    onClick={addGroupMember}
                  >
                    Dodaj członka grupy
                  </Button>
                </div>

                <div className="space-y-3">
                  {groupMembers.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-3 border border-slate-200 rounded-xl">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                        <TextField
                          label={`Członek ${idx + 1}: Imię i nazwisko`}
                          name={`group_name_${idx}`}
                          value={m.name}
                          onChange={(e) => {
                            const updated = [...groupMembers];
                            updated[idx].name = e.target.value;
                            setGroupMembers(updated);
                          }}
                        />
                        <TextField
                          label="Rola w innowacji"
                          name={`group_role_${idx}`}
                          value={m.role}
                          onChange={(e) => {
                            const updated = [...groupMembers];
                            updated[idx].role = e.target.value;
                            setGroupMembers(updated);
                          }}
                        />
                        <TextField
                          label="Miejscowość"
                          name={`group_city_${idx}`}
                          value={m.city}
                          onChange={(e) => {
                            const updated = [...groupMembers];
                            updated[idx].city = e.target.value;
                            setGroupMembers(updated);
                          }}
                        />
                      </div>
                      {groupMembers.length > 2 && (
                        <Button
                          type="button"
                          variant="tertiary"
                          size="sm"
                          onClick={() => removeGroupMember(idx)}
                          aria-label={`Usuń członka ${idx + 1}`}
                        >
                          <Trash size={18} className="text-red-600" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KROK 2: Koncepcja & Innowacyjność */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="type-h2">2. Koncepcja rozwiązania i innowacyjność</h3>
          </div>

          <div className="creator-section">
            <div className="creator-section__header">
              <h4 className="type-h3">Pkt 3: Opis innowacji & deinstytucjonalizacja</h4>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leadingIcon={Lightbulb}
                disabled={aiLoadingField === "deinstitutionalization"}
                onClick={() => triggerAiAssist("deinstitutionalization")}
              >
                {aiLoadingField === "deinstitutionalization"
                  ? "Generowanie..."
                  : "Wskazówka: Deinstytucjonalizacja"}
              </Button>
            </div>

            <TextAreaField
              label="Charakter innowacji i wpisanie się w deinstytucjonalizację"
              name="innovation_desc"
              required
              rows={4}
              value={innovationDesc}
              onChange={(e) => setInnovationDesc(e.target.value)}
              helperText="Pokaż, w jaki sposób usługa wspiera podopiecznego w jego naturalnym środowisku lokalnym."
            />
          </div>

          <div className="creator-section">
            <div className="creator-section__header">
              <h4 className="type-h3">Pkt 4: Innowacyjność i unikalne wyróżniki</h4>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leadingIcon={Lightbulb}
                disabled={aiLoadingField === "innovation_uniqueness"}
                onClick={() => triggerAiAssist("innovation_uniqueness")}
              >
                {aiLoadingField === "innovation_uniqueness"
                  ? "Generowanie..."
                  : "Wskazówka: Wyróżniki innowacji"}
              </Button>
            </div>

            <TextAreaField
              label="Czym innowacja różni się od rozwiązań stosowanych dotychczas?"
              name="uniqueness_rationale"
              required
              rows={4}
              value={uniquenessRationale}
              onChange={(e) => setUniquenessRationale(e.target.value)}
              helperText="Wskaż konkretną nową wartość (np. niższy koszt jednostkowy, lepsza dostępność, technologia asystująca)."
            />
          </div>
        </div>
      )}

      {/* KROK 3: Diagnoza & Odbiorcy */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="type-h2">3. Diagnoza problemu i grupa docelowa</h3>
          </div>

          <div className="creator-section">
            <div className="creator-section__header">
              <h4 className="type-h3">Pkt 5: Diagnoza problemu & raporty ROPS Kraków</h4>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leadingIcon={ChartLineUp}
                disabled={aiLoadingField === "county_diagnosis"}
                onClick={() => triggerAiAssist("county_diagnosis")}
              >
                {aiLoadingField === "county_diagnosis"
                  ? "Pobieranie..."
                  : `Dane ROPS: ${currentCounty?.name || "powiat"}`}
              </Button>
            </div>

            <TextAreaField
              label="Diagnoza problemu społecznego (podstawa w raportach ROPS)"
              name="problem_diagnosis"
              required
              rows={4}
              value={problemDiagnosis}
              onChange={(e) => setProblemDiagnosis(e.target.value)}
              helperText="Podaj dane statystyczne wybranego powiatu lub powołaj się na regionalną diagnozę ROPS Kraków."
            />
          </div>

          <div className="creator-section">
            <h4 className="type-h3">Pkt 6: Opis odbiorców i przyczyny wykluczenia</h4>
            <TextAreaField
              label="Grupa docelowa innowacji i bariery, z którymi się mierzy"
              name="target_recipients"
              required
              rows={3}
              value={targetRecipients}
              onChange={(e) => setTargetRecipients(e.target.value)}
              helperText="Kto konkretnie skorzysta z rozwiązania? Ile osób zostanie objętych wsparciem w fazie testów?"
            />
          </div>

          <div className="creator-section">
            <h4 className="type-h3">Pkt 7: Zmiana wprowadzana przez innowację</h4>
            <TextAreaField
              label="Oczekiwane rezultaty społeczne i trwała zmiana w życiu beneficjentów"
              name="expected_change"
              required
              rows={3}
              value={expectedChange}
              onChange={(e) => setExpectedChange(e.target.value)}
              helperText="Jakie mierzalne efekty przyniesie wdrożenie innowacji (np. samodzielność, ograniczenie izolacji)?"
            />
          </div>
        </div>
      )}

      {/* KROK 4: Skalowalność & Budżet */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="creator-section__header border-b border-slate-100 pb-3">
            <div>
              <h3 className="type-h2">4. Skalowalność, harmonogram i budżet mikrograntu</h3>
              <p className="type-body text-slate-600 mt-1">
                Zaplanuj etapy przygotowania (maks. 3 msc) i testowania (maks. 9 msc). Limit mikrograntu FERS to 50 000 zł.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leadingIcon={FileText}
              disabled={aiLoadingField === "budget_action_plan"}
              onClick={() => triggerAiAssist("budget_action_plan")}
            >
              {aiLoadingField === "budget_action_plan"
                ? "Kalkulowanie..."
                : "Szablon budżetu (do 50 000 zł)"}
            </Button>
          </div>

          {/* Pkt 8: Skalowalność */}
          <div className="creator-section">
            <div className="creator-section__header">
              <h4 className="type-h3">Pkt 8: Wizja przyszłości i replikowalność w JST</h4>
              <Button
                type="button"
                variant="tertiary"
                size="sm"
                leadingIcon={Buildings}
                disabled={aiLoadingField === "scalability"}
                onClick={() => triggerAiAssist("scalability")}
              >
                Wskazówka: Model CUS
              </Button>
            </div>
            <TextAreaField
              label="Jak innowacja będzie rozwijana po zakończeniu mikrograntu?"
              name="scalability_model"
              required
              rows={3}
              value={scalabilityModel}
              onChange={(e) => setScalabilityModel(e.target.value)}
              helperText="Wskaż potencjał wdrożenia rozwiązania jako Program Usług Społecznych (PUS) w małopolskich CUS lub OPS."
            />
          </div>

          {/* Pkt 9: Harmonogram i budżet */}
          <div className="creator-section">
            <h4 className="type-h3">Pkt 9: Plan działania i koszty (harmonogram)</h4>

            {/* Część I: Przygotowanie */}
            <div className="creator-budget-card">
              <div className="creator-budget-card__header">
                <div>
                  <h5 className="type-body font-semibold text-slate-900">
                    Część I: Okres przygotowawczy (maks. 3 miesiące)
                  </h5>
                  <p className="type-caption text-slate-600">
                    Opracowanie metody, standardu usługi, regulaminów i szkolenia kadry.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leadingIcon={Plus}
                  onClick={addPrepItem}
                >
                  Dodaj działanie
                </Button>
              </div>

              <div className="space-y-2">
                {actionPlanPrep.map((item, idx) => (
                  <div key={idx} className="creator-budget-item">
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 flex-1">
                      <div className="sm:col-span-3">
                        <TextField
                          label="Planowane działanie"
                          name={`prep_act_${idx}`}
                          value={item.dzialanie}
                          onChange={(e) => {
                            const updated = [...actionPlanPrep];
                            updated[idx].dzialanie = e.target.value;
                            setActionPlanPrep(updated);
                          }}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <TextField
                          label="Termin realizacji"
                          name={`prep_term_${idx}`}
                          value={item.termin}
                          onChange={(e) => {
                            const updated = [...actionPlanPrep];
                            updated[idx].termin = e.target.value;
                            setActionPlanPrep(updated);
                          }}
                        />
                      </div>
                      <div>
                        <TextField
                          label="Koszt (PLN)"
                          name={`prep_cost_${idx}`}
                          type="number"
                          value={String(item.koszt)}
                          onChange={(e) => {
                            const updated = [...actionPlanPrep];
                            updated[idx].koszt = Number(e.target.value) || 0;
                            setActionPlanPrep(updated);
                          }}
                        />
                      </div>
                    </div>
                    {actionPlanPrep.length > 1 && (
                      <Button
                        type="button"
                        variant="tertiary"
                        size="sm"
                        onClick={() => removePrepItem(idx)}
                        aria-label="Usuń działanie"
                      >
                        <Trash size={18} className="text-red-600" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-right font-semibold text-sm text-slate-700 pt-1">
                Podsuma etapu przygotowawczego: {prepTotal.toLocaleString("pl-PL")} PLN
              </div>
            </div>

            {/* Część II: Testowanie */}
            <div className="creator-budget-card">
              <div className="creator-budget-card__header">
                <div>
                  <h5 className="type-body font-semibold text-slate-900">
                    Część II: Okres testowania (maks. 9 miesięcy)
                  </h5>
                  <p className="type-caption text-slate-600">
                    Realizacja pilotażu z udziałem testerów oraz badanie ewaluacyjne.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leadingIcon={Plus}
                  onClick={addTestingItem}
                >
                  Dodaj działanie testowe
                </Button>
              </div>

              <div className="space-y-2">
                {actionPlanTesting.map((item, idx) => (
                  <div key={idx} className="creator-budget-item">
                    <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 flex-1">
                      <div className="sm:col-span-3">
                        <TextField
                          label="Działanie pilotażowe"
                          name={`test_act_${idx}`}
                          value={item.dzialanie}
                          onChange={(e) => {
                            const updated = [...actionPlanTesting];
                            updated[idx].dzialanie = e.target.value;
                            setActionPlanTesting(updated);
                          }}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <TextField
                          label="Termin realizacji"
                          name={`test_term_${idx}`}
                          value={item.termin}
                          onChange={(e) => {
                            const updated = [...actionPlanTesting];
                            updated[idx].termin = e.target.value;
                            setActionPlanTesting(updated);
                          }}
                        />
                      </div>
                      <div>
                        <TextField
                          label="Testerzy"
                          name={`test_testers_${idx}`}
                          type="number"
                          value={String(item.liczba_testerow || "")}
                          onChange={(e) => {
                            const updated = [...actionPlanTesting];
                            updated[idx].liczba_testerow = Number(e.target.value) || 0;
                            setActionPlanTesting(updated);
                          }}
                        />
                      </div>
                      <div>
                        <TextField
                          label="Koszt (PLN)"
                          name={`test_cost_${idx}`}
                          type="number"
                          value={String(item.koszt)}
                          onChange={(e) => {
                            const updated = [...actionPlanTesting];
                            updated[idx].koszt = Number(e.target.value) || 0;
                            setActionPlanTesting(updated);
                          }}
                        />
                      </div>
                    </div>
                    {actionPlanTesting.length > 1 && (
                      <Button
                        type="button"
                        variant="tertiary"
                        size="sm"
                        onClick={() => removeTestingItem(idx)}
                        aria-label="Usuń działanie"
                      >
                        <Trash size={18} className="text-red-600" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-right font-semibold text-sm text-slate-700 pt-1">
                Podsuma etapu testowania: {testingTotal.toLocaleString("pl-PL")} PLN
              </div>
            </div>

            {/* Pkt 10: Podsumowanie kwoty */}
            <div className={`creator-budget-summary ${isBudgetOverLimit ? "creator-budget-summary--overlimit" : ""}`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <span className="type-caption font-semibold uppercase tracking-wider block text-slate-700">
                    Pkt 10: Wnioskowana kwota mikrograntu FERS (suma całkowita)
                  </span>
                  <div className="text-3xl font-bold mt-1 text-slate-900">
                    {requestedAmount.toLocaleString("pl-PL")} PLN
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    label={isBudgetOverLimit ? "Przekroczono limit 50 000 zł!" : "W ramach limitu 50 000 zł"}
                    variant={isBudgetOverLimit ? "danger" : "success"}
                  />
                  <p className="type-caption text-slate-600 mt-1">
                    Okres przygotowawczy: {prepTotal.toLocaleString("pl-PL")} zł • Testy: {testingTotal.toLocaleString("pl-PL")} zł
                  </p>
                </div>
              </div>

              {isBudgetOverLimit && (
                <div className="flex items-center gap-2 mt-3 text-sm text-red-800 font-medium">
                  <WarningCircle size={20} weight="fill" />
                  <span>
                    Maksymalna kwota dofinansowania w naborze wynosi 50 000,00 zł. Zmniejsz koszty poszczególnych działań, aby móc złożyć wniosek.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KROK 5: Zespół & Złożenie */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="type-h2">5. Zespół projektowy, wizualizacja i oświadczenia</h3>
          </div>

          <div className="creator-section">
            <h4 className="type-h3">Pkt 11: Zespół projektowy i doświadczenie</h4>
            <TextAreaField
              label="Kluczowe osoby zaangażowane w innowację i ich kompetencje"
              name="team_experience"
              required
              rows={4}
              value={teamExperience}
              onChange={(e) => setTeamExperience(e.target.value)}
              helperText="Wymień kompetencje członków zespołu w pracy z daną grupą odbiorców lub w realizacji innowacji."
            />
          </div>

          {/* Wizualizacja koncepcji */}
          <div className="creator-section">
            <div className="creator-section__header">
              <h4 className="type-h3">Wizualizacja logiki innowacji</h4>
              <Button
                type="button"
                variant="tertiary"
                size="sm"
                leadingIcon={ArrowsClockwise}
                disabled={aiLoadingField === "concept_diagram"}
                onClick={() => triggerAiAssist("concept_diagram")}
              >
                Odśwież schemat logiki
              </Button>
            </div>

            <ConceptDiagramView
              title={title}
              categoryName={currentCategory?.name || "Włączenie społeczne"}
              countyName={currentCounty?.name || "powiat małopolski"}
              recipients={targetRecipients}
              steps={diagramSteps}
              mermaidCode={diagramMermaid}
            />
          </div>

          {/* Pkt 12: Oświadczenia */}
          <div className="creator-section">
            <h4 className="type-h3">Pkt 12: Oświadczenia formalne</h4>
            <div className="creator-subpanel">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formalAccepted}
                  onChange={(e) => setFormalAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-600 rounded"
                />
                <span className="type-body text-sm text-slate-800">
                  Oświadczam, że zapoznałem/-am się z Regulaminem Naboru Inkubatora Włączenia Społecznego 2.0
                  (Program FERS Działanie 5.1), wniosek spełnia wymogi formalne, wnioskowana kwota (
                  <strong>{requestedAmount.toLocaleString("pl-PL")} PLN</strong>) nie przekracza limitu 50 000 zł,
                  a podane dane są zgodne z prawdą.
                </span>
              </label>
            </div>
          </div>

          {/* Podgląd oficjalnego arkusza i Druk */}
          <div className="creator-print-callout">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-emerald-700 shrink-0" weight="fill" aria-hidden="true" />
              <div>
                <h5 className="type-h3 text-slate-900">Oficjalny arkusz wniosku do druku</h5>
                <p className="type-caption text-slate-600 mt-0.5">
                  Możesz przejrzeć gotowy do podpisu dokument lub pobrać go w formacie PDF.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              leadingIcon={Printer}
              onClick={() => setShowPrintPreview(true)}
            >
              Podgląd arkusza / Druk PDF
            </Button>
          </div>
        </div>
      )}

      {/* Pasek nawigacji między krokami */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
        {currentStep === 1 ? (
          <Button type="button" variant="tertiary" onClick={onCancel} leadingIcon={ArrowLeft}>
            Wróć do wyboru trybu
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            leadingIcon={ArrowLeft}
          >
            Poprzedni krok
          </Button>
        )}

        <div className="flex items-center gap-3">
          {currentStep < 5 ? (
            <Button
              type="button"
              variant="primary"
              trailingIcon={ArrowRight}
              onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
            >
              Kolejny krok: {STEPS[currentStep].label}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              disabled={isSubmitting || !formalAccepted || isBudgetOverLimit}
              leadingIcon={CheckCircle}
              onClick={handleFinalSubmit}
            >
              {isSubmitting ? "Wysyłanie wniosku..." : "Złóż wniosek FERS do ROPS"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
