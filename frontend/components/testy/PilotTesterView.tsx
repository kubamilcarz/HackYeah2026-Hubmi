"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Flask,
  HandHeart,
  Star,
  MapPin,
  Users,
  Calendar,
  Info,
  ChatText,
  PlusCircle,
  Sparkle,
  ShieldCheck,
  Check,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import {
  TextField,
  TextAreaField,
  SelectField,
  Slider,
  SegmentedControl,
  RadioGroup,
} from "@/components/ui/FormControls";
import { Badge } from "@/components/ui/Tag";
import { LinearProgress } from "@/components/ui/Progress";
import { Alert } from "@/components/ui/Alert";
import { Dialog } from "@/components/ui/Dialog";
import { usePersona } from "@/contexts/PersonaContext";
import {
  getPilots,
  applyToPilot,
  submitEvaluation,
  createPilot,
  getInnovations,
  type PilotProjectItem,
  type PilotEvaluationItem,
  type SocialInnovation,
  FALLBACK_PILOTS,
} from "@/lib/api";

const ROLE_OPTIONS = [
  { label: "Mieszkaniec / Użytkownik końcowy", value: "mieszkaniec" },
  { label: "Opiekun osoby zależnej / Seniora", value: "opiekun" },
  { label: "Pracownik CUS / OPS / DPS / ŚDS", value: "pracownik_instytucji" },
  { label: "Przedstawiciel NGO / Wolontariusz", value: "przedstawiciel_ngo" },
  { label: "Ekspert merytoryczny / Animator", value: "ekspert" },
];

const COUNTY_OPTIONS = [
  { label: "Wszystkie powiaty", value: "all" },
  { label: "Powiat nowosądecki", value: "nowosadecki" },
  { label: "Powiat myślenicki", value: "myslenicki" },
  { label: "Powiat tarnowski", value: "tarnowski" },
  { label: "Powiat gorlicki", value: "gorlicki" },
  { label: "Kraków i krakowski", value: "krakowski" },
];

export function PilotTesterView() {
  const searchParams = useSearchParams();
  const { activePersona } = usePersona();

  const queryInnovation = searchParams.get("innovation") || "";

  const [pilots, setPilots] = useState<PilotProjectItem[]>(FALLBACK_PILOTS);
  const [innovations, setInnovations] = useState<SocialInnovation[]>([]);

  // Filtrowanie i wyszukiwanie
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [countyFilter, setCountyFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Zaznaczony pilotaż i dialogi
  const [selectedPilot, setSelectedPilot] = useState<PilotProjectItem | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isEvalOpen, setIsEvalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  function getPersonaRole(): string {
    if (activePersona.key === "anna_nowak") return "opiekun";
    if (activePersona.roleType === "ngo") return "przedstawiciel_ngo";
    if (activePersona.roleType === "jst") return "pracownik_instytucji";
    if (activePersona.roleType === "ekspert") return "ekspert";
    return "mieszkaniec";
  }

  // Formularz zgłoszenia testera
  const [name, setName] = useState(activePersona.name || "");
  const [email, setEmail] = useState(activePersona.email || "");
  const [phone, setPhone] = useState(activePersona.phone || "");
  const [role, setRole] = useState<string>(getPersonaRole());
  const [institution, setInstitution] = useState(activePersona.organization || activePersona.municipality || "");
  const [motivation, setMotivation] = useState("");
  const [consent, setConsent] = useState(true);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyError, setApplyError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Formularz ewaluacji WCAG
  const [evalName, setEvalName] = useState(activePersona.name || "");
  const [evalRole, setEvalRole] = useState<string>(getPersonaRole());
  const [evalInstitution, setEvalInstitution] = useState(activePersona.organization || activePersona.municipality || "");
  const [usabilityScore, setUsabilityScore] = useState(5);
  const [effectivenessScore, setEffectivenessScore] = useState(5);
  const [accessibilityScore, setAccessibilityScore] = useState(5);
  const [barriersEncountered, setBarriersEncountered] = useState("");
  const [proposedImprovements, setProposedImprovements] = useState("");
  const [testEnvironmentNotes, setTestEnvironmentNotes] = useState("");
  const [recommendToScale, setRecommendToScale] = useState("true");
  const [evalSuccess, setEvalSuccess] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);

  // Formularz tworzenia pilotażu (ROPS / Koordynator)
  const [newInnId, setNewInnId] = useState<string>("");
  const [newTitle, setNewTitle] = useState("");
  const [newCounty, setNewCounty] = useState("nowosadecki");
  const [newMunicipality, setNewMunicipality] = useState("");
  const [newMaxTesters, setNewMaxTesters] = useState("10");
  const [newEligibleRoles, setNewEligibleRoles] = useState("Mieszkańcy, opiekunowie osób zależnych, kadra CUS/OPS");
  const [newSummary, setNewSummary] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const openApplyDialog = (pilot?: PilotProjectItem) => {
    if (pilot) setSelectedPilot(pilot);
    setName(activePersona.name || "");
    setEmail(activePersona.email || "");
    setPhone(activePersona.phone || "");
    setRole(getPersonaRole());
    setInstitution(activePersona.organization || activePersona.municipality || "");
    setApplyError(null);
    setIsApplyOpen(true);
  };

  const openEvalDialog = (pilot?: PilotProjectItem) => {
    if (pilot) setSelectedPilot(pilot);
    setEvalName(activePersona.name || "");
    setEvalRole(getPersonaRole());
    setEvalInstitution(activePersona.organization || activePersona.municipality || "");
    setEvalError(null);
    setIsEvalOpen(true);
  };

  // Pobieranie listy pilotaży i innowacji
  useEffect(() => {
    async function loadData() {
      try {
        const [pilotList, innList] = await Promise.all([
          getPilots(),
          getInnovations().catch(() => []),
        ]);
        if (pilotList && pilotList.length > 0) {
          setPilots(pilotList);
          if (queryInnovation) {
            const found = pilotList.find(
              (p) =>
                String(p.id) === queryInnovation ||
                p.innovation_slug === queryInnovation ||
                String(p.innovation) === queryInnovation
            );
            if (found) {
              setSelectedPilot(found);
            }
          }
        }
        if (innList && innList.length > 0) {
          setInnovations(innList);
          setNewInnId((prev) => prev || (innList[0] ? String(innList[0].id) : ""));
        }
      } catch {
        // Fallback already active
      }
    }
    loadData();
  }, [queryInnovation]);

  // Filtrowanie pilotaży w pamięci
  const filteredPilots = useMemo(() => {
    return pilots.filter((pilot) => {
      // Filtr statusu
      if (statusFilter !== "all") {
        const isRecruiting = pilot.status === "recruiting" || pilot.status === "rekrutacja";
        const isInProgress = pilot.status === "in_progress" || pilot.status === "w_trakcie";
        const isCompleted = pilot.status === "completed" || pilot.status === "zakonczony";

        if (statusFilter === "recruiting" && !isRecruiting) return false;
        if (statusFilter === "in_progress" && !isInProgress) return false;
        if (statusFilter === "completed" && !isCompleted) return false;
      }

      // Filtr powiatu
      if (countyFilter !== "all") {
        const countyMatch =
          pilot.county_name?.toLowerCase().includes(countyFilter.toLowerCase()) || false;
        if (!countyMatch) return false;
      }

      // Wyszukiwarka tekstowa
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          pilot.title.toLowerCase().includes(q) ||
          pilot.description.toLowerCase().includes(q) ||
          pilot.innovation_title.toLowerCase().includes(q) ||
          (pilot.municipality_name && pilot.municipality_name.toLowerCase().includes(q)) ||
          (pilot.county_name && pilot.county_name.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [pilots, statusFilter, countyFilter, searchQuery]);

  // Statystyki globalne
  const stats = useMemo(() => {
    const total = pilots.length;
    const recruiting = pilots.filter(
      (p) => p.status === "recruiting" || p.status === "rekrutacja"
    ).length;
    const completed = pilots.filter(
      (p) => p.status === "completed" || p.status === "zakonczony"
    ).length;
    const totalTesters = pilots.reduce((acc, p) => acc + (p.current_testers_count || 0), 0);
    const maxTestersTotal = pilots.reduce(
      (acc, p) => acc + (p.max_testers || p.target_testers_count || 0),
      0
    );

    const evaluatedPilots = pilots.filter(
      (p) => p.average_overall_score !== null && p.average_overall_score !== undefined
    );
    const avgScore = evaluatedPilots.length
      ? (
          evaluatedPilots.reduce((acc, p) => acc + (p.average_overall_score || 0), 0) /
          evaluatedPilots.length
        ).toFixed(1)
      : "4.8";

    return { total, recruiting, completed, totalTesters, maxTestersTotal, avgScore };
  }, [pilots]);

  // Obsługa zgłoszenia do pilotażu
  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPilot) return;
    setApplyError(null);
    setIsApplying(true);
    try {
      const res = await applyToPilot(selectedPilot.id, {
        applicant_name: name,
        applicant_email: email,
        applicant_phone: phone,
        applicant_role: role,
        motivation,
      });

      // Zaktualizuj licznik w lokalnym stanie
      setPilots((prev) =>
        prev.map((p) =>
          p.id === selectedPilot.id
            ? { ...p, current_testers_count: (p.current_testers_count || 0) + 1 }
            : p
        )
      );
      if (selectedPilot) {
        setSelectedPilot({
          ...selectedPilot,
          current_testers_count: (selectedPilot.current_testers_count || 0) + 1,
        });
      }

      setApplyMessage(res.message);
      setApplySuccess(true);
      setTimeout(() => {
        setIsApplyOpen(false);
        setApplySuccess(false);
      }, 3500);
    } catch (err) {
      setApplyError(
        err instanceof Error
          ? err.message
          : "Nie udało się przesłać zgłoszenia. Spróbuj ponownie za chwilę."
      );
    } finally {
      setIsApplying(false);
    }
  }

  // Obsługa ankiety ewaluacji WCAG
  async function handleEval(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPilot) return;
    setEvalError(null);
    setIsSubmittingEval(true);
    try {
      const newEval: PilotEvaluationItem = {
        pilot: selectedPilot.id,
        evaluator_persona_key: activePersona.key,
        evaluator_name: evalName,
        evaluator_role: evalRole,
        evaluator_role_display:
          ROLE_OPTIONS.find((r) => r.value === evalRole)?.label || "Tester",
        evaluator_institution: evalInstitution,
        usability_score: usabilityScore,
        effectiveness_score: effectivenessScore,
        accessibility_score: accessibilityScore,
        barriers_encountered: barriersEncountered,
        proposed_improvements: proposedImprovements,
        recommend_to_scale: recommendToScale === "true",
        test_environment_notes: testEnvironmentNotes,
        created_at: new Date().toISOString(),
      };

      await submitEvaluation({
        ...newEval,
        pilot: selectedPilot.id,
        comments: proposedImprovements,
      });

      // Zaktualizuj stan pilotażu w pamięci
      setPilots((prev) =>
        prev.map((p) => {
          if (p.id !== selectedPilot.id) return p;
          const currentEvals = p.evaluations || [];
          const updatedEvals = [newEval, ...currentEvals];
          const avgUsab =
            updatedEvals.reduce((acc, ev) => acc + ev.usability_score, 0) /
            updatedEvals.length;
          const avgEff =
            updatedEvals.reduce((acc, ev) => acc + ev.effectiveness_score, 0) /
            updatedEvals.length;
          const avgAcc =
            updatedEvals.reduce((acc, ev) => acc + ev.accessibility_score, 0) /
            updatedEvals.length;
          const avgOverall = (avgUsab + avgEff + avgAcc) / 3;
          const recCount = updatedEvals.filter((ev) => ev.recommend_to_scale).length;

          return {
            ...p,
            evaluations: updatedEvals,
            evaluations_count: updatedEvals.length,
            average_usability_score: Number(avgUsab.toFixed(1)),
            average_effectiveness_score: Number(avgEff.toFixed(1)),
            average_accessibility_score: Number(avgAcc.toFixed(1)),
            average_overall_score: Number(avgOverall.toFixed(1)),
            recommendation_rate: Math.round((recCount / updatedEvals.length) * 100),
          };
        })
      );

      setEvalSuccess(true);
      setTimeout(() => {
        setIsEvalOpen(false);
        setEvalSuccess(false);
        setBarriersEncountered("");
        setProposedImprovements("");
        setTestEnvironmentNotes("");
      }, 3500);
    } catch (err) {
      setEvalError(
        err instanceof Error ? err.message : "Błąd zapisu oceny. Sprawdź poprawność formularza."
      );
    } finally {
      setIsSubmittingEval(false);
    }
  }

  // Obsługa tworzenia nowego pilotażu (Koordynator ROPS)
  async function handleCreatePilot(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    try {
      const inn = innovations.find((i) => String(i.id) === newInnId);
      const created = await createPilot({
        innovation: Number(newInnId),
        title: newTitle,
        status: "recruiting",
        county: newCounty,
        municipality_name: newMunicipality,
        max_testers: parseInt(newMaxTesters, 10) || 10,
        eligible_roles_description: newEligibleRoles,
        summary: newSummary,
        instructions: newInstructions,
      });

      const pilotItem: PilotProjectItem = {
        ...created,
        innovation_title: inn?.title || "Innowacja ROPS",
        innovation_slug: inn?.slug || "innowacja",
        county_name: created.county_name || ("Powiat " + newCounty),
        municipality: newMunicipality,
        municipality_name: newMunicipality,
        status_display: "Trwa nabór testerów",
        target_testers_count: parseInt(newMaxTesters, 10) || 10,
        max_testers: parseInt(newMaxTesters, 10) || 10,
        current_testers_count: 0,
        description: newSummary,
        summary: newSummary,
        evaluations_count: 0,
        evaluations: [],
      };

      setPilots((prev) => [pilotItem, ...prev]);
      setCreateSuccess(true);
      setTimeout(() => {
        setIsCreateOpen(false);
        setCreateSuccess(false);
        setNewTitle("");
        setNewMunicipality("");
        setNewSummary("");
        setNewInstructions("");
      }, 2500);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Nie udało się utworzyć pilotażu. Spróbuj ponownie."
      );
    }
  }

  return (
    <div className="pilot-tester-view max-w-6xl mx-auto space-y-8">
      {/* 1. Header & Civic Ribbon */}
      <div className="hub-card p-6 sm:p-8 bg-slate-50 border border-slate-200 rounded-3xl relative overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/80 text-emerald-900 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Flask aria-hidden="true" size={16} weight="duotone" className="text-emerald-700" />
              <span>Moduł IV • Tester Innowacji ROPS Kraków</span>
            </div>
            <h2 className="type-h2 text-slate-900">
              Pilotaże Innowacji i Ewaluacja Dostępności WCAG 2.2 AA
            </h2>
            <p className="type-body text-slate-600 leading-relaxed">
              Przetestuj nowe usługi i technologie społeczne przed ich wdrożeniem w gminach Małopolski.
              Oceniamy intuicyjność, wpływ na deinstytucjonalizację oraz pełną dostępność cyfrową i architektoniczną.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Button
              variant="primary"
              leadingIcon={PlusCircle}
              onClick={() => setIsCreateOpen(true)}
            >
              Uruchom nowy pilotaż
            </Button>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 justify-center md:justify-start">
              <ShieldCheck size={16} className="text-emerald-600" weight="fill" />
              <span>Standard standardu jakości ROPS</span>
            </div>
          </div>
        </div>

        {/* Pasek wskaźników regionalnych */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200/80">
          <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="type-caption text-slate-600 font-medium">Pilotaże w Małopolsce</div>
          </div>
          <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-slate-200">
            <div className="text-2xl font-bold text-emerald-700">{stats.recruiting}</div>
            <div className="type-caption text-slate-600 font-medium">Otwarte nabory testerów</div>
          </div>
          <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">
              {stats.totalTesters} / {stats.maxTestersTotal}
            </div>
            <div className="type-caption text-slate-600 font-medium">Zrekrutowanych testerów</div>
          </div>
          <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-slate-200">
            <div className="text-2xl font-bold text-amber-600 flex items-center gap-1">
              <span>{stats.avgScore}</span>
              <Star size={20} weight="fill" className="text-amber-500" />
            </div>
            <div className="type-caption text-slate-600 font-medium">Średnia ocena WCAG / Użyteczność</div>
          </div>
        </div>
      </div>

      {/* 2. Filtry, Zakładki i Wyszukiwanie */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-full md:w-auto">
          <SegmentedControl
            label="Filtruj wg etapu pilotażu"
            hideLabel
            name="statusFilter"
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={[
              { label: `Wszystkie (${pilots.length})`, value: "all" },
              { label: `Nabór (${stats.recruiting})`, value: "recruiting" },
              { label: "W toku", value: "in_progress" },
              { label: `Zakończone (${stats.completed})`, value: "completed" },
            ]}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-56">
            <SelectField
              label="Wybierz powiat"
              hideLabel
              name="countyFilter"
              value={countyFilter}
              onChange={(e) => setCountyFilter(e.target.value)}
              options={COUNTY_OPTIONS}
            />
          </div>
          <div className="w-full sm:w-64">
            <TextField
              label="Szukaj pilotażu"
              hideLabel
              name="searchQuery"
              placeholder="Szukaj pilotażu lub innowacji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 3. Lista Pilotaży */}
      {filteredPilots.length === 0 ? (
        <div className="hub-card p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Flask size={48} className="text-slate-400 mx-auto mb-3" weight="duotone" />
          <h3 className="type-h3 text-slate-800">Brak pilotaży spełniających kryteria</h3>
          <p className="type-body text-slate-500 mt-1 max-w-md mx-auto">
            Zmień wybrane filtry lub wyczyść wyszukiwaną frazę, aby zobaczyć dostępne projekty testowe.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => {
              setStatusFilter("all");
              setCountyFilter("all");
              setSearchQuery("");
            }}
          >
            Zresetuj filtry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPilots.map((pilot) => {
            const isRecruiting = pilot.status === "recruiting" || pilot.status === "rekrutacja";
            const isInProgress = pilot.status === "in_progress" || pilot.status === "w_trakcie";
            const isCompleted = pilot.status === "completed" || pilot.status === "zakonczony";

            const maxTesters = pilot.max_testers || pilot.target_testers_count || 10;
            const currentTesters = pilot.current_testers_count || 0;
            const percent = Math.min(100, Math.round((currentTesters / maxTesters) * 100));
            const freeSlots = Math.max(0, maxTesters - currentTesters);

            return (
              <article
                key={pilot.id}
                className="hub-card p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm flex flex-col justify-between transition-all"
              >
                <div className="space-y-4">
                  {/* Status i lokalizacja */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge
                      label={
                        isRecruiting
                          ? "Nabór testerów otwarty"
                          : isInProgress
                          ? "Pilotaż w toku"
                          : "Pilotaż zakończony / Wyniki WCAG"
                      }
                      variant={isRecruiting ? "success" : isInProgress ? "warning" : "info"}
                    />
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <MapPin size={16} className="text-slate-400" />
                      <span>
                        {pilot.municipality_name || pilot.municipality || ""},{" "}
                        {pilot.county_name}
                      </span>
                    </div>
                  </div>

                  {/* Tytuł i powiązanie z innowacją */}
                  <div>
                    <h3 className="type-h3 text-slate-900 leading-snug">{pilot.title}</h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                      <Sparkle size={14} weight="fill" className="text-emerald-600" />
                      <span>Innowacja: </span>
                      <Link
                        href={`/solutions/${pilot.innovation_slug}`}
                        className="hover:underline font-semibold"
                      >
                        {pilot.innovation_title}
                      </Link>
                    </div>
                  </div>

                  {/* Opis */}
                  <p className="type-body text-slate-600 text-sm leading-relaxed">
                    {pilot.description || pilot.summary}
                  </p>

                  {/* Kwalifikowani testerzy */}
                  {pilot.eligible_roles_description && (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 flex items-start gap-2">
                      <Users size={16} className="text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold text-slate-900">Kogo zapraszamy:</strong>{" "}
                        {pilot.eligible_roles_description}
                      </div>
                    </div>
                  )}

                  {/* Postęp rekrutacji testerów */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">
                        Rekrutacja testerów: <strong>{currentTesters} z {maxTesters}</strong> ({percent}%)
                      </span>
                      {isRecruiting && (
                        <span className="text-emerald-700 font-semibold">
                          {freeSlots > 0 ? `${freeSlots} wolnych miejsc` : "Komplet zgłoszeń"}
                        </span>
                      )}
                    </div>
                    <LinearProgress
                      label="Postęp naboru testerów"
                      value={percent}
                      variant={isRecruiting ? "success" : "info"}
                    />
                  </div>

                  {/* Podsumowanie ocen WCAG jeśli istnieją */}
                  {pilot.evaluations_count && pilot.evaluations_count > 0 ? (
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="type-caption font-semibold text-emerald-950 flex items-center gap-1.5">
                          <Star size={16} weight="fill" className="text-amber-500" />
                          Średnia ocena ewaluacji: {pilot.average_overall_score ?? "4.8"} / 5.0
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPilot(pilot);
                            setIsDetailsOpen(true);
                          }}
                          className="text-xs text-emerald-800 font-semibold hover:underline"
                        >
                          Zobacz opinie ({pilot.evaluations?.length || pilot.evaluations_count}) ›
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-emerald-200/60">
                        <div>
                          <div className="text-slate-500">Użyteczność</div>
                          <div className="font-bold text-slate-800">{pilot.average_usability_score ?? "5.0"}/5</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Skuteczność</div>
                          <div className="font-bold text-slate-800">{pilot.average_effectiveness_score ?? "4.7"}/5</div>
                        </div>
                        <div>
                          <div className="text-slate-500">WCAG Dostępność</div>
                          <div className="font-bold text-slate-800">{pilot.average_accessibility_score ?? "4.7"}/5</div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Przyciski akcji */}
                <div className="flex flex-wrap items-center gap-2.5 pt-4 mt-4 border-t border-slate-100">
                  {isRecruiting && (
                    <Button
                      size="sm"
                      variant="primary"
                      leadingIcon={HandHeart}
                      onClick={() => openApplyDialog(pilot)}
                    >
                      Zgłoś się do testów
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant={isCompleted ? "primary" : "secondary"}
                    leadingIcon={Star}
                    onClick={() => openEvalDialog(pilot)}
                  >
                    Oceń innowację (Ankieta WCAG)
                  </Button>

                  <Button
                    size="sm"
                    variant="tertiary"
                    leadingIcon={ChatText}
                    onClick={() => {
                      setSelectedPilot(pilot);
                      setIsDetailsOpen(true);
                    }}
                  >
                    Raport i instrukcja
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 4. Dialog Zgłoszenia do Testów */}
      <Dialog
        open={isApplyOpen}
        onOpenChange={setIsApplyOpen}
        title={`Zgłoszenie do testów: ${selectedPilot?.title || ""}`}
        description="Dołącz do bezpłatnego pilotażu w Małopolsce. Testerzy otrzymują materiały prototypowe oraz wsparcie koordynatora ROPS Kraków."
      >
        {applySuccess ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle size={56} className="text-emerald-600 mx-auto" weight="fill" />
            <h4 className="type-h3 text-slate-900">Zgłoszenie zostało pomyślnie przyjęte!</h4>
            <p className="type-body text-slate-600 max-w-md mx-auto">
              {applyMessage || "Dziękujemy za chęć testowania innowacji. Koordynator ROPS skontaktuje się z Tobą."}
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 text-left space-y-1">
              <strong>Kolejne kroki:</strong>
              <div>1. Weryfikacja formalna zgłoszenia przez zespół ROPS (do 48h).</div>
              <div>2. Bezpłatne przekazanie pakietu prototypowego lub dostępów do platformy.</div>
              <div>3. Krótka 15-minutowa sesja wdrożeniowa online.</div>
            </div>
            <Button variant="primary" onClick={() => setIsApplyOpen(false)} className="mt-4">
              Wróć do listy pilotaży
            </Button>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-4">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 space-y-1">
              <strong>Co zyskujesz jako tester?</strong>
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-700" />
                <span>Bezpłatny dostęp do prototypu innowacji na czas pilotażu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-700" />
                <span>Bezpośredni wpływ na kształt usług społecznych w Małopolsce</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-700" />
                <span>Certyfikat Testera Innowacji Społecznych ROPS Kraków</span>
              </div>
            </div>

            <TextField
              label="Imię i nazwisko"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Adres e-mail"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Numer telefonu"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="np. 501 234 567"
              />
            </div>

            <SelectField
              label="Rola zgłaszającego testera"
              name="role"
              required
              options={ROLE_OPTIONS}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />

            <TextField
              label="Instytucja / Organizacja / Miejscowość"
              name="institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="np. DPS Grybów / Klub Seniora / osoba prywatna"
            />

            <TextAreaField
              label="Dlaczego chcesz wziąć udział w testach?"
              name="motivation"
              rows={3}
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Opisz krótko swoje doświadczenie lub sytuację podopiecznych, u których planujesz testy..."
            />

            <div className="flex items-start gap-2 pt-2">
              <input
                id="apply-consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                required
              />
              <label htmlFor="apply-consent" className="text-xs text-slate-600">
                Wyrażam zgodę na kontakt koordynatora ROPS Kraków w celach organizacji pilotażu oraz
                przetwarzanie danych zgodnie z regulaminem naboru testerów.
              </label>
            </div>

            {applyError && (
              <Alert title="Błąd zgłoszenia" description={applyError} variant="danger" />
            )}

            <div className="dialog__actions">
              <Button type="button" variant="tertiary" onClick={() => setIsApplyOpen(false)}>
                Anuluj
              </Button>
              <Button type="submit" variant="primary" disabled={isApplying || !consent}>
                {isApplying ? "Wysyłanie zgłoszenia..." : "Wyślij zgłoszenie na testera"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      {/* 5. Dialog Ankiety Ewaluacji Dostępności WCAG 2.2 AA */}
      <Dialog
        open={isEvalOpen}
        onOpenChange={setIsEvalOpen}
        title="Ankieta Ewaluacji Użyteczności i Dostępności WCAG 2.2 AA"
        description={`Oceń innowację: ${selectedPilot?.title || ""}. Twoja opinia zasila wskaźniki gotowości do replikacji w gminach Małopolski.`}
      >
        {evalSuccess ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle size={56} className="text-emerald-600 mx-auto" weight="fill" />
            <h4 className="type-h3 text-slate-900">Ewaluacja została pomyślnie zapisana!</h4>
            <p className="type-body text-slate-600 max-w-md mx-auto">
              Dziękujemy za rzetelną ocenę prototypu. Wyniki badania trafiają bezpośrednio do zespołu
              ROPS Kraków i autorów innowacji.
            </p>
            <Button variant="primary" onClick={() => setIsEvalOpen(false)} className="mt-4">
              Zamknij
            </Button>
          </div>
        ) : (
          <form onSubmit={handleEval} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Imię i nazwisko oceniającego"
                name="evalName"
                required
                value={evalName}
                onChange={(e) => setEvalName(e.target.value)}
              />
              <SelectField
                label="Rola w ewaluacji"
                name="evalRole"
                required
                options={ROLE_OPTIONS}
                value={evalRole}
                onChange={(e) => setEvalRole(e.target.value)}
              />
            </div>

            <TextField
              label="Środowisko testowe / Instytucja"
              name="evalInstitution"
              value={evalInstitution}
              onChange={(e) => setEvalInstitution(e.target.value)}
              placeholder="np. Dom podopiecznego w Grybowie, WTZ Myślenice, CUS"
            />

            {/* Trzy kryteria jakościowe WCAG */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="type-caption font-semibold text-slate-900 uppercase tracking-wider">
                Kryteria oceny jakościowej (Skala 1–5)
              </h4>

              <Slider
                label={`1. Użyteczność i łatwość wdrożenia: ${usabilityScore} / 5`}
                helperText="Czy instrukcja jest klarowna, a narzędzie nie wymaga specjalistycznej wiedzy?"
                min={1}
                max={5}
                step={1}
                value={usabilityScore}
                formatValue={(v) => `${v} z 5`}
                onValueChange={setUsabilityScore}
              />

              <Slider
                label={`2. Skuteczność i rozwiązanie problemu: ${effectivenessScore} / 5`}
                helperText="W jakim stopniu rozwiązanie poprawia jakość życia i samodzielność podopiecznych?"
                min={1}
                max={5}
                step={1}
                value={effectivenessScore}
                formatValue={(v) => `${v} z 5`}
                onValueChange={setEffectivenessScore}
              />

              <Slider
                label={`3. Dostępność sensoryczna i cyfrowa (WCAG 2.2 AA): ${accessibilityScore} / 5`}
                helperText="Brak barier dotykowych, architektonicznych, odpowiedni kontrast i czytelność dla osób z niepełnosprawnościami."
                min={1}
                max={5}
                step={1}
                value={accessibilityScore}
                formatValue={(v) => `${v} z 5`}
                onValueChange={setAccessibilityScore}
              />
            </div>

            <TextAreaField
              label="Napotkane bariery i trudności w trakcie testów"
              name="barriersEncountered"
              rows={2}
              value={barriersEncountered}
              onChange={(e) => setBarriersEncountered(e.target.value)}
              placeholder="np. Zapięcie walizki wymagało zbyt dużej siły / czcionka w instrukcji była zbyt mała dla osób słabowidzących..."
            />

            <TextAreaField
              label="Proponowane usprawnienia i rekomendacje zmian"
              name="proposedImprovements"
              rows={2}
              value={proposedImprovements}
              onChange={(e) => setProposedImprovements(e.target.value)}
              placeholder="Co warto udoskonalić przed wdrożeniem na stałe w innych gminach?"
            />

            <RadioGroup
              label="Czy rekomendujesz skalowanie tej innowacji do innych gmin Małopolski?"
              name="recommendToScale"
              value={recommendToScale}
              onValueChange={setRecommendToScale}
              options={[
                { label: "Tak, rekomenduję do upowszechnienia w CUS / samorządach", value: "true" },
                { label: "Wymaga gruntownych poprawek przed kolejnymi wdrożeniami", value: "false" },
              ]}
            />

            {evalError && (
              <Alert title="Błąd zapisu oceny" description={evalError} variant="danger" />
            )}

            <div className="dialog__actions">
              <Button type="button" variant="tertiary" onClick={() => setIsEvalOpen(false)}>
                Anuluj
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmittingEval}>
                {isSubmittingEval ? "Zapisywanie oceny..." : "Zapisz ewaluację WCAG"}
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      {/* 6. Dialog Szczegółów, Instrukcji i Raportu Ewaluacji */}
      <Dialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        title={selectedPilot?.title || "Szczegóły pilotażu"}
        description={`Innowacja: ${selectedPilot?.innovation_title || ""} • ${selectedPilot?.county_name || ""}`}
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          {/* Instrukcja dla testerów */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="type-caption font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Info size={16} className="text-emerald-700" />
              Wytyczne i instrukcja testowania
            </h4>
            <p className="type-body text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {selectedPilot?.instructions ||
                "Prosimy o systematyczne testowanie prototypu zgodnie z wytycznymi zespołu autorskiego. W przypadku wątpliwości skontaktuj się z koordynatorem ROPS Kraków."}
            </p>
            {selectedPilot?.start_date && (
              <div className="flex items-center gap-2 pt-2 text-xs text-slate-500 border-t border-slate-200/80">
                <Calendar size={14} />
                <span>
                  Okres testów: {selectedPilot.start_date} do {selectedPilot.end_date || "zakończenia naboru"}
                </span>
              </div>
            )}
          </div>

          {/* Oceny i opinie testerów */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="type-h3 text-slate-900 text-base">
                Opinie i ankiety ewaluacyjne ({selectedPilot?.evaluations?.length || selectedPilot?.evaluations_count || 0})
              </h4>
              <Button
                size="sm"
                variant="secondary"
                leadingIcon={Star}
                onClick={() => {
                  setIsDetailsOpen(false);
                  openEvalDialog();
                }}
              >
                Dodaj własną ocenę
              </Button>
            </div>

            {selectedPilot?.evaluations && selectedPilot.evaluations.length > 0 ? (
              <div className="space-y-3">
                {selectedPilot.evaluations.map((ev, index) => (
                  <div
                    key={ev.id || index}
                    className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-slate-900 text-sm">{ev.evaluator_name}</strong>
                        <div className="text-xs text-slate-500">
                          {ev.evaluator_role_display || ev.evaluator_role}
                          {ev.evaluator_institution ? ` • ${ev.evaluator_institution}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-600 font-bold text-sm bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        <Star size={14} weight="fill" />
                        <span>
                          {((ev.usability_score + ev.effectiveness_score + ev.accessibility_score) / 3).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs p-2 bg-slate-50 rounded-lg text-center">
                      <div>
                        <span className="text-slate-500">Użyteczność:</span>{" "}
                        <strong>{ev.usability_score}/5</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Skuteczność:</span>{" "}
                        <strong>{ev.effectiveness_score}/5</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">WCAG Dostępność:</span>{" "}
                        <strong>{ev.accessibility_score}/5</strong>
                      </div>
                    </div>

                    {ev.barriers_encountered && (
                      <div className="text-xs text-slate-700 bg-rose-50/70 p-2.5 rounded-lg border border-rose-200/60">
                        <strong className="text-rose-900">Zidentyfikowane bariery:</strong>{" "}
                        {ev.barriers_encountered}
                      </div>
                    )}

                    {ev.proposed_improvements && (
                      <div className="text-xs text-slate-700 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200/60">
                        <strong className="text-emerald-950">Rekomendowane ulepszenia:</strong>{" "}
                        {ev.proposed_improvements}
                      </div>
                    )}

                    {ev.test_environment_notes && (
                      <div className="text-xs text-slate-500 italic">
                        Warunki: {ev.test_environment_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-500 text-sm">
                Brak zarejestrowanych opinii dla tego pilotażu. Bądź pierwszym testerem, który oceni rozwiązanie!
              </div>
            )}
          </div>

          <div className="dialog__actions pt-2">
            <Button variant="secondary" onClick={() => setIsDetailsOpen(false)}>
              Zamknij
            </Button>
            <Button
              variant="primary"
              leadingIcon={HandHeart}
              onClick={() => {
                setIsDetailsOpen(false);
                openApplyDialog();
              }}
            >
              Zgłoś się do testów
            </Button>
          </div>
        </div>
      </Dialog>

      {/* 7. Dialog Tworzenia Nowego Pilotażu (Koordynator ROPS Kraków) */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Uruchomienie nowego pilotażu innowacji"
        description="Formularz koordynatora ROPS Kraków: otwórz nabór testerów lub zarejestruj testy terenowe w Małopolsce."
      >
        {createSuccess ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle size={56} className="text-emerald-600 mx-auto" weight="fill" />
            <h4 className="type-h3 text-slate-900">Pilotaż został pomyślnie uruchomiony!</h4>
            <p className="type-body text-slate-600">
              Nowy projekt testowy jest już widoczny na platformie i otwarty na zgłoszenia mieszkańców oraz kadry CUS.
            </p>
            <Button variant="primary" onClick={() => setIsCreateOpen(false)} className="mt-4">
              Przejdź do listy
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreatePilot} className="space-y-4">
            <SelectField
              label="Wybierz innowację społeczną ROPS"
              name="newInnId"
              required
              value={newInnId}
              onChange={(e) => setNewInnId(e.target.value)}
              options={innovations.map((inn) => ({
                label: inn.title,
                value: String(inn.id),
              }))}
            />

            <TextField
              label="Tytuł pilotażu"
              name="newTitle"
              required
              placeholder="np. Pilotażowe wdrożenie w środowisku wiejskim..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Powiat realizacji"
                name="newCounty"
                required
                value={newCounty}
                onChange={(e) => setNewCounty(e.target.value)}
                options={COUNTY_OPTIONS.filter((c) => c.value !== "all")}
              />
              <TextField
                label="Gmina / Miejscowość"
                name="newMunicipality"
                required
                placeholder="np. Grybów, Piwniczna-Zdrój, Myślenice"
                value={newMunicipality}
                onChange={(e) => setNewMunicipality(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Liczba testerów (limit miejsc)"
                name="newMaxTesters"
                type="number"
                min="1"
                required
                value={newMaxTesters}
                onChange={(e) => setNewMaxTesters(e.target.value)}
              />
              <TextField
                label="Grupa docelowa testerów"
                name="newEligibleRoles"
                required
                value={newEligibleRoles}
                onChange={(e) => setNewEligibleRoles(e.target.value)}
              />
            </div>

            <TextAreaField
              label="Krótki opis celu testów"
              name="newSummary"
              rows={2}
              required
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              placeholder="Jaki problem weryfikujemy w ramach tego pilotażu?"
            />

            <TextAreaField
              label="Instrukcja i zadania dla testerów"
              name="newInstructions"
              rows={2}
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              placeholder="Jak często testerzy mają używać innowacji i co odnotowywać?"
            />

            {createError && (
              <Alert title="Błąd tworzenia pilotażu" description={createError} variant="danger" />
            )}

            <div className="dialog__actions">
              <Button type="button" variant="tertiary" onClick={() => setIsCreateOpen(false)}>
                Anuluj
              </Button>
              <Button type="submit" variant="primary">
                Utwórz i ogłoś pilotaż
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
