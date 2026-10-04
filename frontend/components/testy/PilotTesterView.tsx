"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  CheckCircle,
  Flask,
  MapPin,
  PlusCircle,
  Star,
  UsersThree,
} from "@phosphor-icons/react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import {
  RadioGroup,
  SearchField,
  SelectField,
  Slider,
  TextAreaField,
  TextField,
} from "@/components/ui/FormControls";
import { LinearProgress } from "@/components/ui/Progress";
import { Badge, type TagVariant } from "@/components/ui/Tag";
import { usePersona } from "@/contexts/PersonaContext";
import {
  applyToPilot,
  createPilot,
  FALLBACK_PILOTS,
  getCounties,
  getInnovations,
  getPilots,
  submitEvaluation,
  type PilotEvaluationItem,
  type PilotProjectItem,
  type SocialInnovation,
} from "@/lib/api";

const ROLE_OPTIONS = [
  { label: "Mieszkaniec / użytkownik końcowy", value: "mieszkaniec" },
  { label: "Opiekun osoby zależnej", value: "opiekun" },
  { label: "Pracownik CUS / OPS / DPS", value: "pracownik_instytucji" },
  { label: "Przedstawiciel NGO", value: "przedstawiciel_ngo" },
  { label: "Ekspert branżowy", value: "ekspert" },
];

const DEFAULT_COUNTIES = [
  { label: "Wszystkie powiaty", value: "all" },
  { label: "Powiat nowosądecki", value: "nowosadecki" },
  { label: "Powiat myślenicki", value: "myslenicki" },
  { label: "Powiat tarnowski", value: "tarnowski" },
  { label: "Powiat gorlicki", value: "gorlicki" },
  { label: "Kraków i powiat krakowski", value: "krakowski" },
];

type DialogName = "details" | "apply" | "evaluate" | "create" | null;

function isRecruiting(pilot: PilotProjectItem): boolean {
  return pilot.status === "recruiting" || pilot.status === "rekrutacja";
}

function getStatusBadge(pilot: PilotProjectItem): { label: string; variant: TagVariant } {
  if (isRecruiting(pilot)) {
    return { label: "Nabór otwarty", variant: "success" };
  }
  if (pilot.status === "in_progress" || pilot.status === "w_trakcie") {
    return { label: "Pilotaż w toku", variant: "warning" };
  }
  return { label: "Pilotaż zakończony", variant: "info" };
}

function getPersonaDefaultRole(roleType: string): string {
  switch (roleType) {
    case "ngo":
      return "przedstawiciel_ngo";
    case "jst":
      return "pracownik_instytucji";
    case "ekspert":
      return "ekspert";
    default:
      return "opiekun";
  }
}

function formatDate(value?: string | null): string {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value + "T12:00:00"));
  } catch {
    return value;
  }
}

export function PilotTesterView() {
  const { activePersona } = usePersona();
  const searchParams = useSearchParams();

  const [pilots, setPilots] = useState<PilotProjectItem[]>(FALLBACK_PILOTS);
  const [innovations, setInnovations] = useState<SocialInnovation[]>([]);
  const [countyOptions, setCountyOptions] = useState(DEFAULT_COUNTIES);
  const [query, setQuery] = useState("");
  const [county, setCounty] = useState("all");
  const [stage, setStage] = useState("all");
  const [selected, setSelected] = useState<PilotProjectItem | null>(null);
  const [activeDialog, setActiveDialog] = useState<DialogName>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Application form state
  const [application, setApplication] = useState({
    name: "",
    email: "",
    phone: "",
    role: "opiekun",
    motivation: "",
    consent: false,
  });
  const [applyState, setApplyState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [applyMessage, setApplyMessage] = useState("");

  // Evaluation form state
  const [evaluation, setEvaluation] = useState({
    name: "",
    role: "opiekun",
    institution: "",
    usability: 5,
    effectiveness: 5,
    accessibility: 5,
    barriers: "",
    improvements: "",
    environment: "",
    recommend: "true",
  });
  const [evalState, setEvalState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [evalError, setEvalError] = useState("");

  // Create pilot form state (coordinator only)
  const [newPilot, setNewPilot] = useState({
    innovation: "",
    title: "",
    county: "nowosadecki",
    municipality: "",
    capacity: 10,
    roles: "Mieszkańcy, opiekunowie i kadra CUS/OPS",
    summary: "",
    instructions: "",
  });
  const [createState, setCreateState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [createError, setCreateError] = useState("");

  const isCoordinator = activePersona.roleType === "admin";

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [loadedPilots, loadedInnovations, loadedCounties] = await Promise.all([
          getPilots(),
          getInnovations(),
          getCounties().catch(() => []),
        ]);

        if (!mounted) return;

        setPilots(loadedPilots);
        setInnovations(loadedInnovations);

        if (loadedCounties.length > 0) {
          setCountyOptions([
            { label: "Wszystkie powiaty", value: "all" },
            ...loadedCounties.map((c) => ({
              label: c.name.startsWith("Powiat") ? c.name : `Powiat ${c.name}`,
              value: c.slug,
            })),
          ]);
        }

        setNewPilot((prev) => ({
          ...prev,
          innovation: prev.innovation || String(loadedInnovations[0]?.id ?? ""),
        }));

        const focus = searchParams.get("innovation");
        if (focus) {
          const match = loadedPilots.find(
            (p) =>
              String(p.id) === focus ||
              p.innovation_slug === focus ||
              String(p.innovation) === focus
          );
          if (match) {
            setSelected(match);
            setActiveDialog("details");
          }
        }
      } catch {
        if (mounted) {
          setNotice("Nie udało się pobrać aktualnych danych. Wyświetlamy dostępne dane demonstracyjne.");
        }
      }
    }

    void loadData();

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const visiblePilots = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("pl");

    return pilots.filter((pilot) => {
      const matchesText =
        !needle ||
        [
          pilot.title,
          pilot.summary,
          pilot.description,
          pilot.innovation_title,
          pilot.municipality_name,
          pilot.municipality,
          pilot.county_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("pl")
          .includes(needle);

      const matchesCounty =
        county === "all" ||
        pilot.county_name.toLocaleLowerCase("pl").includes(
          county === "nowosadecki"
            ? "nowosądecki"
            : county === "myslenicki"
            ? "myślenicki"
            : county
        );

      const matchesStage =
        stage === "all" ||
        (stage === "recruiting" && isRecruiting(pilot)) ||
        (stage === "in_progress" &&
          (pilot.status === "in_progress" || pilot.status === "w_trakcie")) ||
        (stage === "completed" &&
          (pilot.status === "completed" || pilot.status === "zakonczony"));

      return matchesText && matchesCounty && matchesStage;
    });
  }, [county, pilots, query, stage]);

  const closeDialog = () => {
    setActiveDialog(null);
    setApplyState("idle");
    setEvalState("idle");
    setCreateState("idle");
  };

  const handleOpenApply = (pilot: PilotProjectItem) => {
    setSelected(pilot);
    setApplication({
      name: activePersona.name,
      email: activePersona.email,
      phone: activePersona.phone,
      role: getPersonaDefaultRole(activePersona.roleType),
      motivation: "",
      consent: false,
    });
    setApplyState("idle");
    setActiveDialog("apply");
  };

  const handleOpenEvaluation = (pilot: PilotProjectItem) => {
    setSelected(pilot);
    setEvaluation({
      name: activePersona.name,
      role: getPersonaDefaultRole(activePersona.roleType),
      institution: activePersona.organization ?? activePersona.municipality ?? "",
      usability: 5,
      effectiveness: 5,
      accessibility: 5,
      barriers: "",
      improvements: "",
      environment: "",
      recommend: "true",
    });
    setEvalState("idle");
    setEvalError("");
    setActiveDialog("evaluate");
  };

  const handleOpenDetails = (pilot: PilotProjectItem) => {
    setSelected(pilot);
    setActiveDialog("details");
  };

  const handleResetFilters = () => {
    setQuery("");
    setCounty("all");
    setStage("all");
  };

  async function handleApplySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;

    setApplyState("sending");

    try {
      const response = await applyToPilot(selected.id, {
        applicant_name: application.name,
        applicant_email: application.email,
        applicant_phone: application.phone,
        applicant_role: application.role,
        motivation: application.motivation,
      });

      const updatedCount = response.current_testers_count ?? selected.current_testers_count + 1;

      setPilots((items) =>
        items.map((p) => (p.id === selected.id ? { ...p, current_testers_count: updatedCount } : p))
      );
      setSelected((prev) => (prev ? { ...prev, current_testers_count: updatedCount } : prev));
      setApplyMessage(response.message || "Zgłoszenie zostało pomyślnie zapisane.");
      setApplyState("success");
    } catch (error) {
      setApplyMessage(error instanceof Error ? error.message : "Nie udało się wysłać zgłoszenia.");
      setApplyState("error");
    }
  }

  async function handleEvaluationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;

    setEvalState("sending");

    try {
      const evaluationPayload: PilotEvaluationItem = {
        pilot: selected.id,
        evaluator_persona_key: activePersona.key,
        evaluator_name: evaluation.name,
        evaluator_role: evaluation.role,
        evaluator_role_display:
          ROLE_OPTIONS.find((r) => r.value === evaluation.role)?.label ?? "Tester",
        evaluator_institution: evaluation.institution,
        usability_score: evaluation.usability,
        effectiveness_score: evaluation.effectiveness,
        accessibility_score: evaluation.accessibility,
        barriers_encountered: evaluation.barriers,
        proposed_improvements: evaluation.improvements,
        recommend_to_scale: evaluation.recommend === "true",
        test_environment_notes: evaluation.environment,
        created_at: new Date().toISOString(),
      };

      await submitEvaluation({ ...evaluationPayload, pilot: selected.id });

      setPilots((items) =>
        items.map((pilot) => {
          if (pilot.id !== selected.id) return pilot;

          const updatedEvaluations = [evaluationPayload, ...(pilot.evaluations ?? [])];
          const calcAverage = (
            key: "usability_score" | "effectiveness_score" | "accessibility_score"
          ) =>
            Number(
              (
                updatedEvaluations.reduce((sum, item) => sum + item[key], 0) /
                updatedEvaluations.length
              ).toFixed(1)
            );

          const usability = calcAverage("usability_score");
          const effectiveness = calcAverage("effectiveness_score");
          const accessibility = calcAverage("accessibility_score");
          const overall = Number(((usability + effectiveness + accessibility) / 3).toFixed(1));
          const recommendRate = Math.round(
            (updatedEvaluations.filter((item) => item.recommend_to_scale).length /
              updatedEvaluations.length) *
              100
          );

          return {
            ...pilot,
            evaluations: updatedEvaluations,
            evaluations_count: updatedEvaluations.length,
            average_usability_score: usability,
            average_effectiveness_score: effectiveness,
            average_accessibility_score: accessibility,
            average_overall_score: overall,
            recommendation_rate: recommendRate,
          };
        })
      );

      setEvalState("success");
    } catch (error) {
      setEvalError(error instanceof Error ? error.message : "Nie udało się zapisać oceny.");
      setEvalState("error");
    }
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateState("sending");
    setCreateError("");

    try {
      const created = await createPilot({
        innovation: Number(newPilot.innovation),
        title: newPilot.title,
        county: newPilot.county,
        municipality_name: newPilot.municipality,
        max_testers: newPilot.capacity,
        eligible_roles_description: newPilot.roles,
        summary: newPilot.summary,
        instructions: newPilot.instructions,
      });

      const matchedInnovation = innovations.find((item) => String(item.id) === newPilot.innovation);
      const matchedCounty =
        countyOptions.find((item) => item.value === newPilot.county)?.label ?? "Małopolska";

      setPilots((items) => [
        {
          ...created,
          innovation_title:
            created.innovation_title || matchedInnovation?.title || "Rozwiązanie społeczne",
          innovation_slug: created.innovation_slug || matchedInnovation?.slug || "",
          county_name: created.county_name || matchedCounty,
          municipality_name: created.municipality_name || newPilot.municipality,
          municipality: created.municipality || newPilot.municipality,
          status: "recruiting",
          max_testers: created.max_testers || newPilot.capacity,
          target_testers_count: created.target_testers_count || newPilot.capacity,
          current_testers_count: 0,
          summary: created.summary || newPilot.summary,
          description: created.description || newPilot.summary,
          evaluations: [],
          evaluations_count: 0,
        },
        ...items,
      ]);

      setCreateState("success");
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Nie udało się uruchomić pilotażu.");
      setCreateState("error");
    }
  }

  return (
    <div className="pilot-tester">
      {isCoordinator && (
        <section aria-label="Narzędzia koordynatora" className="pilot-tester__coordinator-bar">
          <div>
            <p className="type-caption font-semibold text-[var(--content-primary)]">
              Panel koordynatora ROPS
            </p>
            <p className="type-caption text-[var(--content-secondary)]">
              Możesz zarejestrować nowy pilotaż i otworzyć nabór testerów dla wybranej innowacji.
            </p>
          </div>
          <Button
            leadingIcon={PlusCircle}
            onClick={() => setActiveDialog("create")}
            size="sm"
            variant="primary"
          >
            Dodaj pilotaż
          </Button>
        </section>
      )}

      {notice && <Alert description={notice} title="Dane pilotaży" variant="warning" />}

      <section aria-label="Wyszukiwanie pilotaży" className="pilot-tester__filters">
        <SearchField
          label="Szukaj pilotażu"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nazwa pilotażu, innowacja lub miejscowość"
          value={query}
        />
        <SelectField
          label="Powiat"
          onChange={(e) => setCounty(e.target.value)}
          options={countyOptions}
          value={county}
        />
        <RadioGroup
          className="pilot-tester__stages"
          label="Etap pilotażu"
          name="pilot-stage"
          onValueChange={setStage}
          options={[
            { label: `Wszystkie (${pilots.length})`, value: "all" },
            {
              label: `Nabór otwarty (${pilots.filter(isRecruiting).length})`,
              value: "recruiting",
            },
            { label: "W toku", value: "in_progress" },
            { label: "Zakończone", value: "completed" },
          ]}
          value={stage}
        />
      </section>

      <p className="pilot-tester__result-count" role="status">
        {visiblePilots.length === 1
          ? "Znaleziono 1 pilotaż."
          : `Znaleziono ${visiblePilots.length} pilotaży.`}
      </p>

      {visiblePilots.length > 0 ? (
        <div className="pilot-tester__grid">
          {visiblePilots.map((pilot) => {
            const capacity = pilot.max_testers || pilot.target_testers_count || 10;
            const enrolled = pilot.current_testers_count || 0;
            const placesLeft = Math.max(capacity - enrolled, 0);
            const statusMeta = getStatusBadge(pilot);
            const recruitingOpen = isRecruiting(pilot);

            return (
              <article className="pilot-card" key={pilot.id}>
                <header className="pilot-card__header">
                  <Badge label={statusMeta.label} variant={statusMeta.variant} />
                  <span className="pilot-card__location">
                    <MapPin aria-hidden="true" size={16} />
                    {pilot.municipality_name || pilot.municipality || "Małopolska"}
                    {pilot.county_name ? `, ${pilot.county_name}` : ""}
                  </span>
                </header>

                <div className="pilot-card__body">
                  <p className="pilot-card__innovation">
                    Rozwiązanie:{" "}
                    <Link href={`/innowacje/${pilot.innovation_slug}`}>
                      {pilot.innovation_title}
                    </Link>
                  </p>

                  <h3>{pilot.title}</h3>

                  <p>{pilot.summary || pilot.description}</p>

                  {pilot.eligible_roles_description && (
                    <div className="pilot-card__audience">
                      <UsersThree aria-hidden="true" size={18} />
                      <span>
                        <strong>Kogo zapraszamy:</strong> {pilot.eligible_roles_description}
                      </span>
                    </div>
                  )}

                  {recruitingOpen && (
                    <div className="pilot-card__capacity">
                      <div>
                        <span>Zaproszeni testerzy</span>
                        <strong>
                          {enrolled} z {capacity}
                        </strong>
                      </div>
                      <LinearProgress
                        label={`Zapełnienie naboru: ${enrolled} z ${capacity}`}
                        value={capacity ? Math.round((enrolled / capacity) * 100) : 0}
                        variant="success"
                      />
                      <p>
                        {placesLeft > 0
                          ? `Pozostało ${placesLeft} ${placesLeft === 1 ? "miejsce" : "miejsc"}.`
                          : "Lista testerów jest pełna."}
                      </p>
                    </div>
                  )}

                  {pilot.average_overall_score != null && (
                    <p className="pilot-card__rating">
                      <Star aria-hidden="true" size={18} weight="fill" />
                      Średnia z opinii: <strong>{pilot.average_overall_score.toFixed(1)} / 5</strong>
                      {pilot.evaluations_count ? ` · ${pilot.evaluations_count} opinii` : ""}
                    </p>
                  )}
                </div>

                <footer className="pilot-card__actions">
                  {recruitingOpen && placesLeft > 0 && (
                    <Button onClick={() => handleOpenApply(pilot)} size="sm" variant="primary">
                      Zgłoś się do testów
                    </Button>
                  )}

                  {!recruitingOpen && (
                    <Button
                      onClick={() => handleOpenEvaluation(pilot)}
                      size="sm"
                      variant="secondary"
                    >
                      Przekaż ocenę
                    </Button>
                  )}

                  <Button onClick={() => handleOpenDetails(pilot)} size="sm" variant="tertiary">
                    Szczegóły
                  </Button>
                </footer>
              </article>
            );
          })}
        </div>
      ) : (
        <section aria-labelledby="no-pilots" className="pilot-tester__empty">
          <Flask aria-hidden="true" size={32} />
          <h3 id="no-pilots">Nie znaleźliśmy pasującego pilotażu</h3>
          <p>Spróbuj zmienić wyszukiwaną frazę lub wybierz wszystkie powiaty i etapy.</p>
          <Button onClick={handleResetFilters} variant="secondary">
            Wyczyść filtry
          </Button>
        </section>
      )}

      {/* Szczegóły pilotażu */}
      <Dialog
        description={selected ? `Rozwiązanie: ${selected.innovation_title}` : undefined}
        onOpenChange={(open) => !open && closeDialog()}
        open={activeDialog === "details"}
        title={selected?.title || "Szczegóły pilotażu"}
      >
        {selected && (
          <div className="pilot-dialog">
            <div className="pilot-dialog__meta">
              <Badge
                label={getStatusBadge(selected).label}
                variant={getStatusBadge(selected).variant}
              />
              {selected.start_date && (
                <span>
                  <Calendar aria-hidden="true" size={18} />
                  {formatDate(selected.start_date)}
                  {selected.end_date ? ` – ${formatDate(selected.end_date)}` : ""}
                </span>
              )}
            </div>

            <div>
              <h3>Jak przebiegają testy</h3>
              <p>
                {selected.instructions ||
                  "Po zakwalifikowaniu otrzymasz harmonogram i materiały potrzebne do udziału w testach."}
              </p>
            </div>

            <div>
              <h3>Opinie i oceny uczestników</h3>
              {selected.evaluations && selected.evaluations.length > 0 ? (
                <ul className="pilot-dialog__evaluations">
                  {selected.evaluations.map((item) => (
                    <li key={item.id ?? item.evaluator_name}>
                      <strong>{item.evaluator_name}</strong>
                      <span>
                        {item.evaluator_role_display} · {item.usability_score}/5 użyteczność ·{" "}
                        {item.accessibility_score}/5 dostępność
                      </span>
                      {item.proposed_improvements && <p>{item.proposed_improvements}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nie ma jeszcze opublikowanych opinii. Po testach możesz przekazać swoją ocenę.</p>
              )}
            </div>

            <div className="dialog__actions">
              {isRecruiting(selected) &&
              (selected.current_testers_count || 0) <
                (selected.max_testers || selected.target_testers_count || 10) ? (
                <Button onClick={() => handleOpenApply(selected)} variant="primary">
                  Zgłoś się do testów
                </Button>
              ) : (
                <Button onClick={() => handleOpenEvaluation(selected)} variant="primary">
                  Przekaż ocenę
                </Button>
              )}
              <Button onClick={closeDialog} variant="tertiary">
                Zamknij
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Zgłoszenie do udziału */}
      <Dialog
        description={selected ? `Pilotaż: ${selected.title}` : undefined}
        onOpenChange={(open) => !open && closeDialog()}
        open={activeDialog === "apply"}
        title="Zgłoszenie do testów"
      >
        {applyState === "success" ? (
          <DialogSuccessState
            message={applyMessage}
            onClose={closeDialog}
            title="Zgłoszenie przyjęte"
          />
        ) : (
          <form className="pilot-dialog" onSubmit={handleApplySubmit}>
            <p>
              Podaj dane potrzebne do organizacji tego pilotażu. Udział w testach jest bezpłatny.
            </p>

            <TextField
              label="Imię i nazwisko"
              name="applicant-name"
              onChange={(e) => setApplication({ ...application, name: e.target.value })}
              required
              value={application.name}
            />

            <div className="pilot-dialog__two-columns">
              <TextField
                label="Adres e-mail"
                name="applicant-email"
                onChange={(e) => setApplication({ ...application, email: e.target.value })}
                required
                type="email"
                value={application.email}
              />
              <TextField
                label="Telefon"
                name="applicant-phone"
                onChange={(e) => setApplication({ ...application, phone: e.target.value })}
                value={application.phone}
              />
            </div>

            <SelectField
              label="Rola"
              onChange={(e) => setApplication({ ...application, role: e.target.value })}
              options={ROLE_OPTIONS}
              value={application.role}
            />

            <TextAreaField
              label="Dlaczego chcesz testować to rozwiązanie?"
              name="motivation"
              onChange={(e) => setApplication({ ...application, motivation: e.target.value })}
              optional
              value={application.motivation}
            />

            <label className="pilot-dialog__consent">
              <input
                checked={application.consent}
                onChange={(e) => setApplication({ ...application, consent: e.target.checked })}
                required
                type="checkbox"
              />
              <span>Wyrażam zgodę na kontakt w sprawie organizacji tego pilotażu.</span>
            </label>

            {applyState === "error" && (
              <Alert
                description={applyMessage}
                title="Nie udało się wysłać zgłoszenia"
                variant="danger"
              />
            )}

            <DialogActionButtons
              close={closeDialog}
              pending={applyState === "sending"}
              pendingLabel="Wysyłanie…"
              submitLabel="Wyślij zgłoszenie"
            />
          </form>
        )}
      </Dialog>

      {/* Ankieta ewaluacyjna */}
      <Dialog
        description="Krótka opinia pomoże twórcom dopracować rozwiązanie przed kolejnym etapem wdrożenia."
        onOpenChange={(open) => !open && closeDialog()}
        open={activeDialog === "evaluate"}
        title="Podziel się doświadczeniem z testów"
      >
        {evalState === "success" ? (
          <DialogSuccessState
            message="Ocena została zapisana i zasili podsumowanie pilotażu."
            onClose={closeDialog}
            title="Dziękujemy za opinię"
          />
        ) : (
          <form className="pilot-dialog" onSubmit={handleEvaluationSubmit}>
            <TextField
              label="Imię i nazwisko"
              name="evaluator-name"
              onChange={(e) => setEvaluation({ ...evaluation, name: e.target.value })}
              required
              value={evaluation.name}
            />

            <div className="pilot-dialog__two-columns">
              <SelectField
                label="Rola w testach"
                onChange={(e) => setEvaluation({ ...evaluation, role: e.target.value })}
                options={ROLE_OPTIONS}
                value={evaluation.role}
              />
              <TextField
                label="Instytucja lub miejscowość"
                name="evaluator-institution"
                onChange={(e) => setEvaluation({ ...evaluation, institution: e.target.value })}
                optional
                value={evaluation.institution}
              />
            </div>

            <div className="pilot-dialog__scores">
              <Slider
                formatValue={(v) => `${v} / 5`}
                label="Użyteczność"
                max={5}
                min={1}
                onValueChange={(v) => setEvaluation({ ...evaluation, usability: v })}
                value={evaluation.usability}
              />
              <Slider
                formatValue={(v) => `${v} / 5`}
                label="Skuteczność"
                max={5}
                min={1}
                onValueChange={(v) => setEvaluation({ ...evaluation, effectiveness: v })}
                value={evaluation.effectiveness}
              />
              <Slider
                formatValue={(v) => `${v} / 5`}
                label="Dostępność (WCAG)"
                max={5}
                min={1}
                onValueChange={(v) => setEvaluation({ ...evaluation, accessibility: v })}
                value={evaluation.accessibility}
              />
            </div>

            <TextAreaField
              label="Napotkane trudności i bariery"
              name="barriers"
              onChange={(e) => setEvaluation({ ...evaluation, barriers: e.target.value })}
              optional
              value={evaluation.barriers}
            />

            <TextAreaField
              label="Co warto poprawić lub zmienić?"
              name="improvements"
              onChange={(e) => setEvaluation({ ...evaluation, improvements: e.target.value })}
              required
              value={evaluation.improvements}
            />

            <TextAreaField
              label="Warunki i okoliczności testowania"
              name="environment"
              onChange={(e) => setEvaluation({ ...evaluation, environment: e.target.value })}
              optional
              value={evaluation.environment}
            />

            <RadioGroup
              label="Czy rekomendujesz dalsze wdrożenie tego rozwiązania?"
              name="recommend"
              onValueChange={(recommend) => setEvaluation({ ...evaluation, recommend })}
              options={[
                { label: "Tak, warto rozwijać", value: "true" },
                { label: "Jeszcze nie", value: "false" },
              ]}
              value={evaluation.recommend}
            />

            {evalState === "error" && (
              <Alert
                description={evalError}
                title="Nie udało się zapisać oceny"
                variant="danger"
              />
            )}

            <DialogActionButtons
              close={closeDialog}
              pending={evalState === "sending"}
              pendingLabel="Zapisywanie…"
              submitLabel="Zapisz ocenę"
            />
          </form>
        )}
      </Dialog>

      {/* Dodawanie pilotażu (tylko koordynator) */}
      <Dialog
        description="Uzupełnij podstawowe informacje, aby rozpocząć nabór testerów w regionie."
        onOpenChange={(open) => !open && closeDialog()}
        open={activeDialog === "create"}
        title="Dodaj pilotaż"
      >
        {createState === "success" ? (
          <DialogSuccessState
            message="Nowy nabór jest już widoczny na liście pilotaży."
            onClose={closeDialog}
            title="Pilotaż został dodany"
          />
        ) : (
          <form className="pilot-dialog" onSubmit={handleCreateSubmit}>
            <SelectField
              label="Rozwiązanie społeczne"
              onChange={(e) => setNewPilot({ ...newPilot, innovation: e.target.value })}
              options={innovations.map((item) => ({
                label: item.title,
                value: String(item.id),
              }))}
              required
              value={newPilot.innovation}
            />

            <TextField
              label="Tytuł pilotażu"
              name="pilot-title"
              onChange={(e) => setNewPilot({ ...newPilot, title: e.target.value })}
              required
              value={newPilot.title}
            />

            <div className="pilot-dialog__two-columns">
              <SelectField
                label="Powiat"
                onChange={(e) => setNewPilot({ ...newPilot, county: e.target.value })}
                options={countyOptions.filter((c) => c.value !== "all")}
                value={newPilot.county}
              />
              <TextField
                label="Gmina lub miejscowość"
                name="pilot-municipality"
                onChange={(e) => setNewPilot({ ...newPilot, municipality: e.target.value })}
                required
                value={newPilot.municipality}
              />
            </div>

            <TextField
              label="Liczba testerów"
              min={1}
              name="pilot-capacity"
              onChange={(e) => setNewPilot({ ...newPilot, capacity: Number(e.target.value) })}
              required
              type="number"
              value={newPilot.capacity}
            />

            <TextField
              label="Kogo zapraszamy"
              name="pilot-roles"
              onChange={(e) => setNewPilot({ ...newPilot, roles: e.target.value })}
              required
              value={newPilot.roles}
            />

            <TextAreaField
              label="Cel i zakres pilotażu"
              name="pilot-summary"
              onChange={(e) => setNewPilot({ ...newPilot, summary: e.target.value })}
              required
              value={newPilot.summary}
            />

            <TextAreaField
              label="Instrukcja dla testerów"
              name="pilot-instructions"
              onChange={(e) => setNewPilot({ ...newPilot, instructions: e.target.value })}
              optional
              value={newPilot.instructions}
            />

            {createState === "error" && (
              <Alert
                description={createError}
                title="Nie udało się dodać pilotażu"
                variant="danger"
              />
            )}

            <DialogActionButtons
              close={closeDialog}
              pending={createState === "sending"}
              pendingLabel="Dodawanie…"
              submitLabel="Rozpocznij nabór"
            />
          </form>
        )}
      </Dialog>
    </div>
  );
}

function DialogActionButtons({
  close,
  pending,
  submitLabel,
  pendingLabel,
}: {
  close: () => void;
  pending: boolean;
  submitLabel: string;
  pendingLabel: string;
}) {
  return (
    <div className="dialog__actions">
      <Button onClick={close} variant="tertiary">
        Anuluj
      </Button>
      <Button disabled={pending} type="submit" variant="primary">
        {pending ? pendingLabel : submitLabel}
      </Button>
    </div>
  );
}

function DialogSuccessState({
  title,
  message,
  onClose,
}: {
  title: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="pilot-dialog__success">
      <CheckCircle aria-hidden="true" size={44} weight="fill" />
      <h3>{title}</h3>
      <p>{message}</p>
      <Button onClick={onClose} variant="primary">
        Wróć do pilotaży
      </Button>
    </div>
  );
}
