"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Bell,
  Check,
  CheckCircle,
  Eye,
  Flask,
  HandHeart,
  MapPin,
  NotePencil,
  Printer,
  ShieldCheck,
  Sparkle,
  WarningCircle,
} from "@phosphor-icons/react";

import { Button, ButtonLink } from "@/components/ui/Button";
import {
  TextField,
  TextAreaField,
  SelectField,
  Slider,
} from "@/components/ui/FormControls";
import { Badge, Tag, type TagVariant } from "@/components/ui/Tag";
import { LinearProgress } from "@/components/ui/Progress";
import { Banner } from "@/components/ui/Alert";
import { Dialog } from "@/components/ui/Dialog";
import { TabSwitcher } from "@/components/ui/TabSwitcher";
import { Toast, ToastViewport } from "@/components/ui/Toast";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { usePersona } from "@/contexts/PersonaContext";
import {
  getAdminTrends,
  getProblemSubmissions,
  moderateProblemSubmission,
  getIdeaSubmissions,
  evaluateIdeaSubmission,
  updateInnovationStage,
  getInnovations,
  getInquiries,
  answerInquiry,
  type AdminTrendsResponse,
  type ProblemSubmissionItem,
  type IdeaSubmissionItem,
  type SocialInnovation,
  type InquiryItem,
  FALLBACK_ADMIN_TRENDS,
  FALLBACK_PROBLEM_SUBMISSIONS,
  FALLBACK_IDEA_SUBMISSIONS,
  FALLBACK_INNOVATIONS,
  FALLBACK_INQUIRIES,
} from "@/lib/api";

const STATUS_LABELS: Record<string, { label: string; variant: TagVariant }> = {
  pending: { label: "Nowe / Oczekujące", variant: "warning" },
  matched: { label: "Dopasowano innowację", variant: "info" },
  gap_identified: { label: "Biała plama (Luka)", variant: "danger" },
  in_progress: { label: "W realizacji", variant: "neutral" },
  resolved: { label: "Rozwiązane", variant: "success" },
};

const IDEA_STATUS_LABELS: Record<string, { label: string; variant: TagVariant }> = {
  roboczy: { label: "Szkic", variant: "neutral" },
  zlozony: { label: "Złożony", variant: "info" },
  w_ocenie: { label: "W ocenie ROPS", variant: "warning" },
  zaakceptowany: { label: "Zaakceptowany do grantu", variant: "success" },
  odrzucony: { label: "Odrzucony", variant: "danger" },
};

const STAGE_LABELS: Record<string, { label: string; variant: TagVariant }> = {
  koncepcja: { label: "Koncepcja", variant: "neutral" },
  prototyp: { label: "Prototyp", variant: "info" },
  testy: { label: "W fazie testów", variant: "warning" },
  sprawdzona: { label: "Sprawdzona / Gotowa do skalowania", variant: "success" },
};

type CountyTableRow = {
  county_name: string;
  population: string;
  senior_ratio: string;
  submissions_count: number;
  priority: string;
};

const COUNTY_COLUMNS: DataTableColumn<CountyTableRow>[] = [
  { key: "county_name", label: "Powiat", sortable: true },
  { key: "population", label: "Liczba mieszkańców", sortable: true },
  { key: "senior_ratio", label: "Wskaźnik starości", sortable: true },
  { key: "submissions_count", label: "Zgłoszone potrzeby", sortable: true },
  {
    key: "priority",
    label: "Priorytet wsparcia",
    sortable: true,
    cellKind: "status",
    statusVariants: {
      "Wysoki priorytet": "warning",
      Standardowy: "neutral",
    },
  },
];

export function AdminDashboardView() {
  const { activePersona, setActivePersonaKey } = usePersona();

  // API Data
  const [trends, setTrends] = useState<AdminTrendsResponse>(FALLBACK_ADMIN_TRENDS);
  const [submissions, setSubmissions] = useState<ProblemSubmissionItem[]>(FALLBACK_PROBLEM_SUBMISSIONS);
  const [ideas, setIdeas] = useState<IdeaSubmissionItem[]>(FALLBACK_IDEA_SUBMISSIONS);
  const [innovations, setInnovations] = useState<SocialInnovation[]>(FALLBACK_INNOVATIONS);
  const [inquiries, setInquiries] = useState<InquiryItem[]>(FALLBACK_INQUIRIES);

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>("moderacja");

  // Toast feedback
  const [toast, setToast] = useState<{ title: string; description: string } | null>(null);

  // Filters for submissions
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<string>("all");
  const [submissionCountyFilter, setSubmissionCountyFilter] = useState<string>("all");
  const [submissionQuery, setSubmissionQuery] = useState<string>("");

  // Modals & Drawers
  const [selectedSubmission, setSelectedSubmission] = useState<ProblemSubmissionItem | null>(null);
  const [moderationStatus, setModerationStatus] = useState<string>("pending");
  const [moderationNotes, setModerationNotes] = useState<string>("");
  const [isSubmittingModeration, setIsSubmittingModeration] = useState(false);

  // Idea Evaluation Modal
  const [selectedIdea, setSelectedIdea] = useState<IdeaSubmissionItem | null>(null);
  const [evalScore, setEvalScore] = useState<number>(90);
  const [evalFeedback, setEvalFeedback] = useState<string>("");
  const [isSubmittingEvaluation, setIsSubmittingEvaluation] = useState(false);

  // Innovation Stage Promotion Modal
  const [selectedInnovation, setSelectedInnovation] = useState<SocialInnovation | null>(null);
  const [promotionStage, setPromotionStage] = useState<string>("sprawdzona");
  const [promotionReadiness, setPromotionReadiness] = useState<number>(95);
  const [isSubmittingPromotion, setIsSubmittingPromotion] = useState(false);

  // Inquiry Answer Modal
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [inquiryResponse, setInquiryResponse] = useState<string>("");
  const [isPublicFaq, setIsPublicFaq] = useState<boolean>(true);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  // Official Report Print Modal
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Load backend data
  useEffect(() => {
    async function loadAllData() {
      try {
        const [trendsData, subsData, ideasData, innsData, inqData] = await Promise.all([
          getAdminTrends(),
          getProblemSubmissions(),
          getIdeaSubmissions(),
          getInnovations(),
          getInquiries(),
        ]);
        if (trendsData) setTrends(trendsData);
        if (subsData && subsData.length > 0) setSubmissions(subsData);
        if (ideasData && ideasData.length > 0) setIdeas(ideasData);
        if (innsData && innsData.length > 0) setInnovations(innsData);
        if (inqData && inqData.length > 0) setInquiries(inqData);
      } catch {
        // Fallbacks already in state
      }
    }
    loadAllData();
  }, []);

  // Dynamic county options for filter
  const countyOptions = useMemo(() => {
    const options = [{ label: "Wszystkie powiaty", value: "all" }];
    const uniqueCounties = Array.from(
      new Set(
        trends.by_county
          .map((c) => c.county_name)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, "pl"));

    for (const county of uniqueCounties) {
      options.push({ label: county, value: county });
    }
    return options;
  }, [trends.by_county]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      if (submissionStatusFilter !== "all" && item.status !== submissionStatusFilter) {
        return false;
      }
      if (
        submissionCountyFilter !== "all" &&
        item.county_name &&
        !item.county_name.toLowerCase().includes(submissionCountyFilter.toLowerCase())
      ) {
        return false;
      }
      if (submissionQuery.trim()) {
        const q = submissionQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesReporter = item.reporter_name.toLowerCase().includes(q);
        const matchesGroup = item.affected_group.toLowerCase().includes(q);
        if (!matchesTitle && !matchesReporter && !matchesGroup) return false;
      }
      return true;
    });
  }, [submissions, submissionStatusFilter, submissionCountyFilter, submissionQuery]);

  // Handle open submission moderation
  function handleOpenModeration(submission: ProblemSubmissionItem) {
    setSelectedSubmission(submission);
    setModerationStatus(submission.status);
    setModerationNotes(submission.admin_notes || "");
  }

  // Submit moderation
  async function handleSaveModeration() {
    if (!selectedSubmission) return;
    setIsSubmittingModeration(true);
    try {
      const updated = await moderateProblemSubmission(selectedSubmission.id, {
        status: moderationStatus,
        admin_notes: moderationNotes,
      });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === selectedSubmission.id ? { ...s, ...updated } : s))
      );
      setSelectedSubmission(null);
      setToast({
        title: "Zaktualizowano status zgłoszenia",
        description: `Decyzja dla zgłoszenia #${selectedSubmission.id} została pomyślnie zapisana.`,
      });
    } catch {
      setToast({
        title: "Błąd zapisu",
        description: "Nie udało się zapisać decyzji moderacyjnej.",
      });
    } finally {
      setIsSubmittingModeration(false);
    }
  }

  // Handle open idea evaluation
  function handleOpenEvaluation(idea: IdeaSubmissionItem) {
    setSelectedIdea(idea);
    setEvalScore(idea.admin_score || 92);
    setEvalFeedback(
      idea.admin_feedback ||
        "Wniosek spełnia wymogi deinstytucjonalizacji i kryteria formalno-merytoryczne ROPS Kraków."
    );
  }

  // Submit idea evaluation
  async function handleSaveEvaluation(decisionStatus: "zaakceptowany" | "odrzucony" | "w_ocenie") {
    if (!selectedIdea) return;
    setIsSubmittingEvaluation(true);
    try {
      const updated = await evaluateIdeaSubmission(selectedIdea.id, {
        score: evalScore,
        feedback: evalFeedback,
        status: decisionStatus,
      });
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === selectedIdea.id ? { ...i, ...updated, status: decisionStatus } : i
        )
      );
      setSelectedIdea(null);
      setToast({
        title:
          decisionStatus === "zaakceptowany"
            ? "Wniosek zaakceptowany do grantu!"
            : "Zapisano ocenę wniosku",
        description: `Wniosek „${selectedIdea.title}” otrzymał status: ${
          IDEA_STATUS_LABELS[decisionStatus]?.label || decisionStatus
        }.`,
      });
    } catch {
      setToast({
        title: "Błąd zapisu oceny",
        description: "Nie udało się zaktualizować oceny wniosku.",
      });
    } finally {
      setIsSubmittingEvaluation(false);
    }
  }

  // Handle open promotion
  function handleOpenPromotion(inn: SocialInnovation) {
    setSelectedInnovation(inn);
    setPromotionStage("sprawdzona");
    setPromotionReadiness(
      inn.replication_readiness_score < 90 ? 95 : inn.replication_readiness_score
    );
  }

  // Submit stage promotion
  async function handleSavePromotion() {
    if (!selectedInnovation) return;
    setIsSubmittingPromotion(true);
    try {
      const updated = await updateInnovationStage(selectedInnovation.slug, {
        maturity_stage: promotionStage,
        replication_readiness_score: promotionReadiness,
      });
      setInnovations((prev) =>
        prev.map((i) => (i.slug === selectedInnovation.slug ? { ...i, ...updated } : i))
      );
      setSelectedInnovation(null);
      setToast({
        title: "Innowacja awansowana pomyślnie!",
        description: `Innowacja „${selectedInnovation.title}” ma teraz status: ${STAGE_LABELS[promotionStage]?.label}. Jest gotowa do replikacji w gminach.`,
      });
    } catch {
      setToast({
        title: "Błąd aktualizacji",
        description: "Nie udało się zaktualizować statusu innowacji.",
      });
    } finally {
      setIsSubmittingPromotion(false);
    }
  }

  // Handle open inquiry
  function handleOpenInquiry(inq: InquiryItem) {
    setSelectedInquiry(inq);
    setInquiryResponse(inq.response || "");
    setIsPublicFaq(inq.is_public_faq ?? true);
  }

  // Submit inquiry response
  async function handleSaveInquiry() {
    if (!selectedInquiry) return;
    setIsSubmittingInquiry(true);
    try {
      const responderName = `${activePersona.name} (${activePersona.role})`;
      const updated = await answerInquiry(selectedInquiry.id, {
        response: inquiryResponse,
        responder_name: responderName,
        is_answered: true,
        is_public_faq: isPublicFaq,
      });
      setInquiries((prev) =>
        prev.map((i) => (i.id === selectedInquiry.id ? { ...i, ...updated, is_answered: true } : i))
      );
      setSelectedInquiry(null);
      setToast({
        title: "Wysłano odpowiedź na zapytanie",
        description: isPublicFaq
          ? "Odpowiedź została opublikowana w publicznej Bazie Wiedzy FAQ."
          : "Odpowiedź wysłana do zgłaszającego.",
      });
    } catch {
      setToast({
        title: "Błąd odpowiedzi",
        description: "Nie udało się zapisać odpowiedzi.",
      });
    } finally {
      setIsSubmittingInquiry(false);
    }
  }

  // Quick stats calculations
  const pendingSubmissionsCount = submissions.filter((s) => s.status === "pending").length;
  const whiteSpotsCount = submissions.filter((s) => s.status === "gap_identified").length;
  const pendingIdeasCount = ideas.filter(
    (i) => i.status === "w_ocenie" || i.status === "zlozony"
  ).length;
  const testingInnovations = innovations.filter(
    (i) => i.maturity_stage === "testy" || i.maturity_stage === "prototyp"
  );
  const unansweredInquiriesCount = inquiries.filter((i) => !i.is_answered).length;

  // County table data for DataTable
  const countyTableRows: CountyTableRow[] = useMemo(() => {
    return trends.by_county.map((c) => ({
      county_name: c.county_name,
      population: c.population ? c.population.toLocaleString("pl-PL") : "—",
      senior_ratio: `${c.senior_ratio}%`,
      submissions_count: c.submissions_count,
      priority: c.senior_ratio >= 24 ? "Wysoki priorytet" : "Standardowy",
    }));
  }, [trends.by_county]);

  return (
    <div className="space-y-6">
      {/* Persona Context Banner */}
      {activePersona.roleType !== "admin" ? (
        <div className="space-y-3">
          <Banner
            variant="info"
            title="Tryb podglądu koordynatora ROPS"
            description={`Przeglądasz panel koordynatora jako ${activePersona.name} (${activePersona.role}). Aby wykonywać akcje zarządcze, przełącz profil na Magdalenę Kaczmarczyk.`}
          />
          <div className="flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActivePersonaKey("magdalena_kaczmarczyk")}
            >
              Przełącz na profil Magdaleny Kaczmarczyk (ROPS)
            </Button>
          </div>
        </div>
      ) : (
        <div className="admin-coordinator-bar">
          <div className="admin-coordinator-bar__profile">
            <div className="admin-coordinator-bar__avatar" aria-hidden="true">
              <ShieldCheck size={28} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="admin-coordinator-bar__name">{activePersona.name}</h2>
                <Badge label="Koordynator ROPS" variant="info" />
              </div>
              <p className="admin-coordinator-bar__role">
                Regionalny Ośrodek Polityki Społecznej w Krakowie • Koordynacja Małopolskiego Hubu Innowacji
              </p>
            </div>
          </div>

          <div className="admin-coordinator-bar__actions">
            <Button variant="secondary" size="sm" onClick={() => setIsReportOpen(true)}>
              <Printer aria-hidden="true" size={18} />
              <span>Raport Wojewódzki (Drukuj)</span>
            </Button>
          </div>
        </div>
      )}

      {/* KPI Overview Cards */}
      <section aria-label="Wskaźniki kluczowe hubu" className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-card__header">
            <span className="admin-kpi-card__label">Zgłoszenia potrzeb</span>
            <HandHeart size={20} aria-hidden="true" className="text-[var(--action-primary)]" />
          </div>
          <div className="admin-kpi-card__value">{submissions.length}</div>
          <p className="admin-kpi-card__meta">
            <span className="admin-kpi-card__meta-highlight admin-kpi-card__meta-highlight--warning">
              {pendingSubmissionsCount}
            </span>{" "}
            do moderacji
          </p>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-card__header">
            <span className="admin-kpi-card__label">Białe plamy</span>
            <WarningCircle
              size={20}
              aria-hidden="true"
              className="text-[var(--feedback-danger-foreground)]"
            />
          </div>
          <div className="admin-kpi-card__value text-[var(--feedback-danger-foreground)]">
            {whiteSpotsCount}
          </div>
          <p className="admin-kpi-card__meta">Tereny bez innowacji</p>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-card__header">
            <span className="admin-kpi-card__label">Wnioski FERS</span>
            <Sparkle size={20} aria-hidden="true" className="text-[var(--action-primary)]" />
          </div>
          <div className="admin-kpi-card__value">{ideas.length}</div>
          <p className="admin-kpi-card__meta">
            <span className="admin-kpi-card__meta-highlight admin-kpi-card__meta-highlight--warning">
              {pendingIdeasCount}
            </span>{" "}
            w ocenie ROPS
          </p>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-card__header">
            <span className="admin-kpi-card__label">Pilotaże w toku</span>
            <Flask size={20} aria-hidden="true" className="text-[var(--feedback-info-foreground)]" />
          </div>
          <div className="admin-kpi-card__value">{trends.total_pilots || 3}</div>
          <p className="admin-kpi-card__meta">
            <span className="admin-kpi-card__meta-highlight admin-kpi-card__meta-highlight--success">
              {testingInnovations.length}
            </span>{" "}
            gotowe do awansu
          </p>
        </div>

        <div className="admin-kpi-card admin-kpi-card--span2">
          <div className="admin-kpi-card__header">
            <span className="admin-kpi-card__label">Pytania do ROPS</span>
            <Bell size={20} aria-hidden="true" className="text-[var(--action-primary)]" />
          </div>
          <div className="admin-kpi-card__value">{inquiries.length}</div>
          <p className="admin-kpi-card__meta">
            <span className="admin-kpi-card__meta-highlight admin-kpi-card__meta-highlight--warning">
              {unansweredInquiriesCount}
            </span>{" "}
            bez odpowiedzi
          </p>
        </div>
      </section>

      {/* Main Tabs Navigation */}
      <TabSwitcher
        label="Sekcje panelu administratora ROPS"
        value={activeTab}
        onValueChange={setActiveTab}
        items={[
          {
            id: "moderacja",
            label: `Moderacja potrzeb (${submissions.length})`,
            panel: (
              <section aria-labelledby="heading-moderacja" className="space-y-4 pt-4">
                <div className="admin-toolbar">
                  <div className="admin-toolbar__content">
                    <h3 id="heading-moderacja" className="admin-toolbar__title">
                      Moderacja zgłoszeń mieszkańców i samorządów
                    </h3>
                    <p className="admin-toolbar__description">
                      Weryfikuj dopasowania algorytmiczne, zatwierdzaj ścieżki wdrożenia lub oznaczaj zgłoszenia jako oficjalne Białe plamy ROPS.
                    </p>
                  </div>

                  <div className="admin-filters-grid">
                    <SelectField
                      label="Status zgłoszenia"
                      hideLabel
                      value={submissionStatusFilter}
                      onChange={(e) => setSubmissionStatusFilter(e.target.value)}
                      options={[
                        { label: "Wszystkie statusy", value: "all" },
                        { label: "Nowe / Oczekujące", value: "pending" },
                        { label: "Dopasowano innowację", value: "matched" },
                        { label: "Biała plama (Luka)", value: "gap_identified" },
                        { label: "W realizacji", value: "in_progress" },
                        { label: "Rozwiązane", value: "resolved" },
                      ]}
                    />

                    <SelectField
                      label="Powiat"
                      hideLabel
                      value={submissionCountyFilter}
                      onChange={(e) => setSubmissionCountyFilter(e.target.value)}
                      options={countyOptions}
                    />

                    <TextField
                      label="Szukaj zgłoszenia"
                      hideLabel
                      placeholder="Szukaj po tytule, osobie..."
                      value={submissionQuery}
                      onChange={(e) => setSubmissionQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Submissions List */}
                <div className="space-y-3">
                  {filteredSubmissions.length === 0 ? (
                    <div className="admin-empty-state">
                      <p className="type-body font-semibold">Brak zgłoszeń spełniających wybrane kryteria.</p>
                      <p className="type-caption">Zmień filtry lub zresetuj zapytanie wyszukiwania.</p>
                    </div>
                  ) : (
                    filteredSubmissions.map((sub) => {
                      const statusMeta = STATUS_LABELS[sub.status] || {
                        label: sub.status,
                        variant: "neutral",
                      };
                      const hasMatches = sub.matches && sub.matches.length > 0;
                      const isGap = sub.status === "gap_identified";

                      return (
                        <article
                          key={sub.id}
                          className={`admin-card ${isGap ? "admin-card--gap" : ""}`}
                        >
                          <div className="admin-card__top">
                            <div className="admin-card__body">
                              <div className="admin-card__meta-row">
                                <span className="admin-card__id">#{sub.id}</span>
                                <Badge label={statusMeta.label} variant={statusMeta.variant} />
                                {sub.category_name && <Tag label={sub.category_name} />}
                                {sub.county_name && (
                                  <span className="type-caption text-[var(--content-secondary)] flex items-center gap-1">
                                    <MapPin size={14} aria-hidden="true" />
                                    {sub.municipality_name
                                      ? `${sub.municipality_name}, ${sub.county_name}`
                                      : sub.county_name}
                                  </span>
                                )}
                              </div>

                              <h4 className="admin-card__title">{sub.title}</h4>

                              <p className="admin-card__description">{sub.description}</p>

                              <div className="admin-card__details">
                                <div>
                                  <strong className="text-[var(--content-primary)]">Grupa docelowa:</strong>{" "}
                                  {sub.affected_group}
                                </div>
                                <div>
                                  <strong className="text-[var(--content-primary)]">Zgłaszający:</strong>{" "}
                                  {sub.reporter_name} ({sub.reporter_role})
                                  {sub.reporter_institution && ` • ${sub.reporter_institution}`}
                                </div>
                              </div>

                              {/* Algorithmic Match */}
                              {hasMatches && (
                                <div className="admin-callout admin-callout--info">
                                  <span className="admin-callout__title">
                                    <Sparkle size={15} aria-hidden="true" />
                                    Dopasowanie algorytmiczne: {sub.matches![0].innovation.title} (Trafność: {sub.matches![0].similarity_score}%)
                                  </span>
                                  <p className="admin-callout__text">{sub.matches![0].justification}</p>
                                </div>
                              )}

                              {/* Gap Diagnosis */}
                              {isGap && (
                                <div className="admin-callout admin-callout--gap">
                                  <span className="admin-callout__title">
                                    <WarningCircle size={15} aria-hidden="true" />
                                    Zidentyfikowano Białą Plamę w Małopolsce: Brak gotowej innowacji o trafności &ge; 45%
                                  </span>
                                  <p className="admin-callout__text">
                                    Zgłoszenie kwalifikuje się do zaadresowania w najbliższym naborze mikrograntów FERS.
                                  </p>
                                </div>
                              )}

                              {/* Notes */}
                              {sub.admin_notes && (
                                <div className="admin-callout admin-callout--subtle">
                                  <strong className="text-[var(--content-primary)]">Notatki koordynatora ROPS:</strong>
                                  <p className="admin-callout__text">{sub.admin_notes}</p>
                                </div>
                              )}
                            </div>

                            <div className="admin-card__actions">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleOpenModeration(sub)}
                                aria-label={`Moderuj zgłoszenie #${sub.id}: ${sub.title}`}
                              >
                                <NotePencil aria-hidden="true" size={16} />
                                <span>Moderuj zgłoszenie</span>
                              </Button>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            ),
          },
          {
            id: "wnioski-fers",
            label: `Ocena wniosków FERS (${ideas.length})`,
            panel: (
              <section aria-labelledby="heading-fers" className="space-y-4 pt-4">
                <div className="admin-toolbar">
                  <div className="admin-toolbar__content">
                    <h3 id="heading-fers" className="admin-toolbar__title">
                      Weryfikacja i ocena wniosków grantowych FERS (12 pkt)
                    </h3>
                    <p className="admin-toolbar__description">
                      Oceniaj wnioski z Kreatora Pomysłów pod kątem deinstytucjonalizacji i kryteriów FERS Działanie 5.1 (do 50 000 zł).
                    </p>
                  </div>

                  <div className="admin-toolbar__actions">
                    <ButtonLink variant="secondary" size="sm" href="/kreator">
                      <span>Przejdź do Kreatora FERS</span>
                    </ButtonLink>
                  </div>
                </div>

                <div className="space-y-4">
                  {ideas.map((idea) => {
                    const statusMeta = IDEA_STATUS_LABELS[idea.status] || {
                      label: idea.status,
                      variant: "neutral",
                    };
                    const isGrant = idea.submission_type === "grant_fers";

                    return (
                      <article key={idea.id} className="admin-card">
                        <div className="admin-card__top">
                          <div className="admin-card__body">
                            <div className="admin-card__meta-row">
                              <span className="admin-card__id">#{idea.id}</span>
                              <Badge
                                label={isGrant ? "Wniosek Grantowy FERS (50k zł)" : "Fiszka Pomysłu"}
                                variant="info"
                              />
                              <Badge label={statusMeta.label} variant={statusMeta.variant} />
                              {idea.category_name && <Tag label={idea.category_name} />}
                              {idea.county_name && <Tag label={`Powiat ${idea.county_name}`} />}
                            </div>

                            <h4 className="admin-card__title">{idea.title}</h4>

                            <div className="admin-card__details">
                              <div>
                                <strong>Wnioskodawca:</strong> {idea.applicant_name}
                              </div>
                              {idea.organization_representative && (
                                <div>
                                  <strong>Reprezentant:</strong> {idea.organization_representative}
                                </div>
                              )}
                              {idea.organization_krs && (
                                <div>
                                  <strong>KRS:</strong> {idea.organization_krs}
                                </div>
                              )}
                              {idea.organization_nip && (
                                <div>
                                  <strong>NIP:</strong> {idea.organization_nip}
                                </div>
                              )}
                            </div>

                            <p className="admin-card__description">
                              {idea.innovation_description || idea.solution_concept}
                            </p>

                            {idea.uniqueness_rationale && (
                              <div className="admin-callout admin-callout--warning">
                                <span className="admin-callout__title">Wyróżniki innowacji:</span>
                                <p className="admin-callout__text">{idea.uniqueness_rationale}</p>
                              </div>
                            )}

                            {/* Financial & Testing summary */}
                            {isGrant && (
                              <div className="admin-stat-summary">
                                <div className="admin-stat-summary__item">
                                  <span className="admin-stat-summary__label">Wnioskowana kwota</span>
                                  <span className="admin-stat-summary__value text-[var(--action-primary)]">
                                    {(idea.requested_grant_amount || 50000).toLocaleString("pl-PL")} PLN
                                  </span>
                                  <span className="admin-stat-summary__hint">100% dofinansowania FERS</span>
                                </div>

                                <div className="admin-stat-summary__item">
                                  <span className="admin-stat-summary__label">Harmonogram realizacji</span>
                                  <span className="admin-stat-summary__value">12 miesięcy</span>
                                  <span className="admin-stat-summary__hint">3 m-ce przygotowanie + 9 m-cy testy</span>
                                </div>

                                <div className="admin-stat-summary__item">
                                  <span className="admin-stat-summary__label">Ocena ROPS</span>
                                  <span className="admin-stat-summary__value">
                                    {idea.admin_score !== null && idea.admin_score !== undefined
                                      ? `${idea.admin_score} / 100 pkt`
                                      : "Oczekuje na ocenę"}
                                  </span>
                                  <span className="admin-stat-summary__hint">
                                    {idea.admin_feedback ? "Uzasadnienie zarejestrowane" : "Brak uzasadnienia"}
                                  </span>
                                </div>
                              </div>
                            )}

                            {idea.admin_feedback && (
                              <div className="admin-callout admin-callout--success">
                                <span className="admin-callout__title">Opinia i decyzja ROPS:</span>
                                <p className="admin-callout__text">{idea.admin_feedback}</p>
                              </div>
                            )}
                          </div>

                          <div className="admin-card__actions">
                            <Button
                              variant={idea.status === "zaakceptowany" ? "secondary" : "primary"}
                              size="sm"
                              onClick={() => handleOpenEvaluation(idea)}
                              aria-label={`Oceń wniosek FERS #${idea.id}: ${idea.title}`}
                            >
                              <Sparkle aria-hidden="true" size={16} />
                              <span>
                                {idea.status === "zaakceptowany" ? "Zmień ocenę" : "Oceń wniosek FERS"}
                              </span>
                            </Button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ),
          },
          {
            id: "awans-innowacji",
            label: `Awans innowacji (${testingInnovations.length})`,
            panel: (
              <section aria-labelledby="heading-awans" className="space-y-4 pt-4">
                <div className="admin-toolbar">
                  <div className="admin-toolbar__content">
                    <h3 id="heading-awans" className="admin-toolbar__title">
                      Zarządzanie dojrzałością innowacji (Pilotaże → Wdrożenia)
                    </h3>
                    <p className="admin-toolbar__description">
                      Przeglądaj wyniki pilotaży społecznych i awansuj przetestowane prototypy do statusu «Sprawdzona / Gotowa do skalowania», udostępniając je w generatorze wdrożeń dla 182 gmin Małopolski.
                    </p>
                  </div>

                  <div className="admin-toolbar__actions">
                    <ButtonLink variant="secondary" size="sm" href="/testy">
                      <Flask aria-hidden="true" size={16} />
                      <span>Otwórz pilotaże społeczne</span>
                    </ButtonLink>
                  </div>
                </div>

                <div className="admin-innovation-grid">
                  {innovations.map((inn) => {
                    const isTested = inn.maturity_stage === "testy" || inn.maturity_stage === "prototyp";
                    const stageMeta = STAGE_LABELS[inn.maturity_stage] || {
                      label: inn.maturity_stage,
                      variant: "neutral",
                    };

                    return (
                      <div
                        key={inn.id}
                        className={`admin-innovation-card ${
                          isTested ? "admin-innovation-card--tested" : ""
                        }`}
                      >
                        <div className="admin-innovation-card__header">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge label={stageMeta.label} variant={stageMeta.variant} />
                              <span className="admin-card__id">#{inn.id}</span>
                            </div>
                            <h4 className="admin-card__title">{inn.title}</h4>
                          </div>

                          <div className="text-right">
                            <span className="type-caption text-[var(--content-muted)] block">
                              Gotowość wdrożenia
                            </span>
                            <strong className="text-[var(--action-primary)] type-body font-bold">
                              {inn.replication_readiness_score}%
                            </strong>
                          </div>
                        </div>

                        <p className="type-caption text-[var(--content-secondary)] line-clamp-2">
                          {inn.short_summary}
                        </p>

                        {/* Test metrics */}
                        <div className="admin-innovation-card__metrics">
                          <div>
                            <span className="text-[var(--content-muted)] block">Użyteczność</span>
                            <strong className="text-[var(--content-primary)]">4.9 / 5.0</strong>
                          </div>
                          <div>
                            <span className="text-[var(--content-muted)] block">Dostępność</span>
                            <strong className="text-[var(--content-primary)]">4.8 / 5.0</strong>
                          </div>
                          <div>
                            <span className="text-[var(--content-muted)] block">Rekomendacja</span>
                            <strong className="text-[var(--action-primary)]">100% gmin</strong>
                          </div>
                        </div>

                        <div className="admin-innovation-card__actions">
                          <ButtonLink variant="tertiary" size="sm" href={`/innowacje/${inn.slug}`}>
                            <Eye aria-hidden="true" size={16} />
                            <span>Karta wiedzy</span>
                          </ButtonLink>

                          <Button
                            variant={isTested ? "primary" : "secondary"}
                            size="sm"
                            onClick={() => handleOpenPromotion(inn)}
                            aria-label={`Zmień status innowacji: ${inn.title}`}
                          >
                            <Sparkle aria-hidden="true" size={16} />
                            <span>{isTested ? "Awansuj do sprawdzonych" : "Zmień dojrzałość"}</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ),
          },
          {
            id: "trendy-raport",
            label: "Trendy regionalne & Raport",
            panel: (
              <section aria-labelledby="heading-trends" className="space-y-6 pt-4">
                <div className="admin-toolbar">
                  <div className="admin-toolbar__content">
                    <h3 id="heading-trends" className="admin-toolbar__title">
                      Regionalna analityka trendów i Białych Plam (22 powiaty)
                    </h3>
                    <p className="admin-toolbar__description">
                      Agregacja potrzeb społecznych według 9 oficjalnych kategorii ROPS Kraków i mapy demograficznej Małopolski.
                    </p>
                  </div>

                  <div className="admin-toolbar__actions">
                    <Button variant="primary" size="sm" onClick={() => setIsReportOpen(true)}>
                      <Printer aria-hidden="true" size={18} />
                      <span>Generuj Raport Wojewódzki (PDF)</span>
                    </Button>
                  </div>
                </div>

                {/* White spots alert box */}
                {trends.white_spots && trends.white_spots.length > 0 && (
                  <div className="admin-white-spots-banner">
                    <div className="admin-white-spots-banner__header">
                      <WarningCircle size={22} weight="fill" aria-hidden="true" />
                      <h4>
                        Wykryte Białe Plamy Innowacji Społecznych ({trends.white_spots.length})
                      </h4>
                    </div>
                    <p className="admin-white-spots-banner__description">
                      Poniższe obszary wykazują wysokie zapotrzebowanie mieszkańców przy jednoczesnym braku gotowej innowacji w katalogu ROPS (trafność dopasowania &lt; 45%).
                    </p>

                    <div className="admin-white-spots-grid">
                      {trends.white_spots.map((ws, i) => (
                        <div key={i} className="admin-white-spot-item">
                          <div className="flex items-center justify-between text-[var(--feedback-danger-foreground)] font-bold">
                            <span>{ws.category_name}</span>
                            <span>{ws.county_name}</span>
                          </div>
                          <strong className="text-[var(--content-primary)] text-sm block">
                            {ws.title}
                          </strong>
                          <span className="text-[var(--content-secondary)] block">
                            Grupa: {ws.affected_group}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories Grid */}
                <div className="space-y-3">
                  <h4 className="type-h3 font-bold text-[var(--content-primary)]">
                    Rozkład zgłoszeń wg 9 kategorii ROPS Kraków
                  </h4>
                  <div className="admin-categories-grid">
                    {trends.by_category.map((cat) => {
                      const ratio = Math.min(100, Math.round((cat.submissions_count / 10) * 100));
                      return (
                        <div key={cat.category_id} className="admin-category-card">
                          <div className="admin-category-card__header">
                            <strong className="admin-category-card__title">{cat.category_name}</strong>
                            <span className="admin-category-card__count">
                              {cat.submissions_count} zgłoszeń
                            </span>
                          </div>
                          <LinearProgress
                            value={ratio}
                            label={`Udział zgłoszeń kategorii ${cat.category_name}`}
                          />
                          <div className="admin-category-card__footer">
                            <span>Gotowe innowacje: {cat.innovations_count}</span>
                            <span>{cat.innovations_count === 0 ? "Brak innowacji" : "Pokryte"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Counties Table with Splot DataTable */}
                <div className="space-y-3">
                  <DataTable<CountyTableRow>
                    heading="Aktywność i wskaźniki senioralne w powiatach"
                    caption="Zestawienie demograficzne 22 powiatów Małopolski, wskaźnik starości i zgłoszone potrzeby"
                    columns={COUNTY_COLUMNS}
                    rows={countyTableRows}
                    rowKey="county_name"
                    searchLabel="Szukaj powiatu"
                  />
                </div>
              </section>
            ),
          },
          {
            id: "zapytania-dialog",
            label: `Dialog z koordynatorem (${inquiries.length})`,
            panel: (
              <section aria-labelledby="heading-inquiries" className="space-y-4 pt-4">
                <div className="admin-toolbar">
                  <div className="admin-toolbar__content">
                    <h3 id="heading-inquiries" className="admin-toolbar__title">
                      Bezpośredni dialog z koordynatorem ROPS
                    </h3>
                    <p className="admin-toolbar__description">
                      Odpowiadaj na pytania mieszkańców, stowarzyszeń i gmin. Publikuj wartościowe odpowiedzi w publicznej Bazie Wiedzy FAQ.
                    </p>
                  </div>

                  <div className="admin-toolbar__actions">
                    <ButtonLink variant="secondary" size="sm" href="/kontakt">
                      <span>Otwórz kontakt i partnerstwa</span>
                    </ButtonLink>
                  </div>
                </div>

                <div className="space-y-3">
                  {inquiries.map((inq) => {
                    const isAnswered = inq.is_answered;

                    return (
                      <article key={inq.id} className="admin-card">
                        <div className="admin-card__top">
                          <div className="admin-card__body">
                            <div className="admin-card__meta-row">
                              <Badge
                                label={
                                  isAnswered
                                    ? "Udzielono odpowiedzi"
                                    : "Oczekuje na odpowiedź ROPS"
                                }
                                variant={isAnswered ? "success" : "warning"}
                              />
                              {inq.is_public_faq && <Badge label="Baza FAQ" variant="info" />}
                              <span className="admin-card__id">#{inq.id}</span>
                            </div>
                            <h4 className="admin-card__title">{inq.subject || "Zapytanie ogólne"}</h4>
                            <div className="type-caption text-[var(--content-secondary)]">
                              Zgłaszający: <strong>{inq.author_name}</strong> ({inq.author_email})
                            </div>
                          </div>

                          <div className="admin-card__actions">
                            <Button
                              variant={isAnswered ? "secondary" : "primary"}
                              size="sm"
                              onClick={() => handleOpenInquiry(inq)}
                              aria-label={`${isAnswered ? "Edytuj odpowiedź" : "Odpowiedz"} na zapytanie #${inq.id}`}
                            >
                              <NotePencil aria-hidden="true" size={16} />
                              <span>{isAnswered ? "Edytuj odpowiedź" : "Odpowiedz"}</span>
                            </Button>
                          </div>
                        </div>

                        <div className="p-3.5 bg-[var(--surface-subtle)] rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--content-primary)]">
                          {inq.message}
                        </div>

                        {isAnswered && inq.response && (
                          <div className="admin-callout admin-callout--success">
                            <span className="admin-callout__title">
                              <CheckCircle size={15} aria-hidden="true" />
                              Odpowiedź ({inq.responder_name || "Koordynator ROPS Kraków"}):
                            </span>
                            <p className="admin-callout__text">{inq.response}</p>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ),
          },
        ]}
      />

      {/* MODAL 1: MODERACJA ZGŁOSZENIA */}
      {selectedSubmission && (
        <Dialog
          title={`Moderacja zgłoszenia #${selectedSubmission.id}`}
          description="Zmień status zgłoszenia i wprowadź oficjalne wytyczne koordynatora ROPS."
          open={Boolean(selectedSubmission)}
          onOpenChange={(open) => {
            if (!open) setSelectedSubmission(null);
          }}
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-[var(--surface-subtle)] rounded-xl border border-[var(--border-subtle)] space-y-2 text-xs">
              <strong className="text-sm font-bold text-[var(--content-primary)] block">
                {selectedSubmission.title}
              </strong>
              <p className="text-[var(--content-secondary)]">{selectedSubmission.description}</p>
              <div className="grid grid-cols-2 gap-2 text-[var(--content-muted)] pt-1">
                <span>Zgłaszający: {selectedSubmission.reporter_name}</span>
                <span>Powiat: {selectedSubmission.county_name || "Brak"}</span>
              </div>
            </div>

            <SelectField
              label="Decyzja o statusie"
              value={moderationStatus}
              onChange={(e) => setModerationStatus(e.target.value)}
              options={[
                { label: "Oczekujące na analizę (pending)", value: "pending" },
                { label: "Dopasowano innowację ROPS (matched)", value: "matched" },
                {
                  label: "Biała plama – brak gotowej innowacji (gap_identified)",
                  value: "gap_identified",
                },
                { label: "W trakcie wdrażania w samorządzie (in_progress)", value: "in_progress" },
                { label: "Rozwiązane / Zakończone sukcesem (resolved)", value: "resolved" },
              ]}
              helperText="Wybór «Biała plama» włącza to zgłoszenie do wojewódzkiego rejestru luk społecznych."
            />

            <TextAreaField
              label="Notatki i zalecenia koordynatora ROPS"
              rows={4}
              value={moderationNotes}
              onChange={(e) => setModerationNotes(e.target.value)}
              placeholder="Wprowadź uzasadnienie decyzji, kontakt do zespołu ds. wdrożeń lub zalecenia dla wnioskodawcy..."
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <Button variant="tertiary" onClick={() => setSelectedSubmission(null)}>
                Anuluj
              </Button>
              <Button
                variant="primary"
                disabled={isSubmittingModeration}
                onClick={handleSaveModeration}
              >
                <Check aria-hidden="true" size={16} />
                <span>
                  {isSubmittingModeration ? "Zapisywanie..." : "Zapisz decyzję moderacyjną"}
                </span>
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* MODAL 2: OCENA WNIOSKU GRANTOWEGO FERS */}
      {selectedIdea && (
        <Dialog
          title={`Ocena formalno-merytoryczna wniosku #${selectedIdea.id}`}
          description={`Wniosek: „${selectedIdea.title}” (${(
            selectedIdea.requested_grant_amount || 50000
          ).toLocaleString("pl-PL")} PLN)`}
          open={Boolean(selectedIdea)}
          onOpenChange={(open) => {
            if (!open) setSelectedIdea(null);
          }}
        >
          <div className="space-y-4">
            <div className="p-3 bg-[var(--surface-subtle)] rounded-xl border border-[var(--border-subtle)] text-xs space-y-1.5">
              <div>
                <strong>Wnioskodawca:</strong> {selectedIdea.applicant_name} (
                {selectedIdea.applicant_email})
              </div>
              <div>
                <strong>Koncepcja:</strong>{" "}
                {selectedIdea.innovation_description || selectedIdea.solution_concept}
              </div>
              <div>
                <strong>Kwota grantu FERS:</strong>{" "}
                {(selectedIdea.requested_grant_amount || 50000).toLocaleString("pl-PL")} PLN (Maks. 50 000 zł)
              </div>
            </div>

            <div className="space-y-2">
              <label className="type-caption font-semibold text-[var(--content-primary)] block">
                Wynik oceny merytorycznej: {evalScore} / 100 pkt
              </label>
              <Slider
                min={0}
                max={100}
                step={1}
                value={evalScore}
                onValueChange={setEvalScore}
                label="Punktacja kryteriów FERS"
              />
              <span className="type-caption text-[var(--content-muted)] text-[11px] block">
                Próg kwalifikacji do grantu inkubatora wynosi min. 70 punktów.
              </span>
            </div>

            <TextAreaField
              label="Opinia i rekomendacja komisji ROPS Kraków"
              rows={4}
              value={evalFeedback}
              onChange={(e) => setEvalFeedback(e.target.value)}
              placeholder="Wprowadź uzasadnienie zgodności z deinstytucjonalizacją i wytycznymi FERS Działanie 5.1..."
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[var(--border-subtle)]">
              <Button
                variant="destructive"
                size="sm"
                disabled={isSubmittingEvaluation}
                onClick={() => handleSaveEvaluation("odrzucony")}
              >
                Odrzuć wniosek
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isSubmittingEvaluation}
                  onClick={() => handleSaveEvaluation("w_ocenie")}
                >
                  Do poprawy
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingEvaluation}
                  onClick={() => handleSaveEvaluation("zaakceptowany")}
                >
                  <Check aria-hidden="true" size={16} />
                  <span>Zaakceptuj do inkubacji i grantu</span>
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* MODAL 3: AWANS ETAPU INNOWACJI */}
      {selectedInnovation && (
        <Dialog
          title={`Awans etapu dojrzałości: ${selectedInnovation.title}`}
          description="Zmień etap innowacji po zakończeniu testów społecznych z mieszkańcami."
          open={Boolean(selectedInnovation)}
          onOpenChange={(open) => {
            if (!open) setSelectedInnovation(null);
          }}
        >
          <div className="space-y-4">
            <SelectField
              label="Etap dojrzałości innowacji"
              value={promotionStage}
              onChange={(e) => setPromotionStage(e.target.value)}
              options={[
                { label: "Koncepcja (koncepcja)", value: "koncepcja" },
                { label: "Prototyp (prototyp)", value: "prototyp" },
                { label: "W fazie testów społecznych (testy)", value: "testy" },
                {
                  label: "Sprawdzona / Gotowa do skalowania (sprawdzona)",
                  value: "sprawdzona",
                },
              ]}
              helperText="Status «Sprawdzona» udostępnia innowację w generatorze Middleman AI dla wszystkich gmin."
            />

            <div className="space-y-2">
              <label className="type-caption font-semibold text-[var(--content-primary)] block">
                Wskaźnik łatwości replikacji w gminach: {promotionReadiness}%
              </label>
              <Slider
                min={0}
                max={100}
                step={1}
                value={promotionReadiness}
                onValueChange={setPromotionReadiness}
                label="Wskaźnik łatwości replikacji"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
              <Button variant="tertiary" onClick={() => setSelectedInnovation(null)}>
                Anuluj
              </Button>
              <Button
                variant="primary"
                disabled={isSubmittingPromotion}
                onClick={handleSavePromotion}
              >
                <Check aria-hidden="true" size={16} />
                <span>
                  {isSubmittingPromotion ? "Aktualizowanie..." : "Zatwierdź awans innowacji"}
                </span>
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* MODAL 4: ODPOWIEDŹ NA ZAPYTANIE */}
      {selectedInquiry && (
        <Dialog
          title={`Odpowiedź na zapytanie #${selectedInquiry.id}`}
          description={`Od: ${selectedInquiry.author_name} (${selectedInquiry.author_email})`}
          open={Boolean(selectedInquiry)}
          onOpenChange={(open) => {
            if (!open) setSelectedInquiry(null);
          }}
        >
          <div className="space-y-4">
            <div className="p-3 bg-[var(--surface-subtle)] rounded-xl border border-[var(--border-subtle)] text-xs space-y-1">
              <strong>Treść pytania:</strong>
              <p className="text-[var(--content-secondary)]">{selectedInquiry.message}</p>
            </div>

            <TextAreaField
              label="Treść odpowiedzi koordynatora ROPS"
              rows={4}
              value={inquiryResponse}
              onChange={(e) => setInquiryResponse(e.target.value)}
              placeholder="Wyjaśnij procedurę, podaj podstawę prawną lub skieruj do odpowiedniego programu..."
            />

            <label className="flex items-center gap-2.5 text-xs text-[var(--content-primary)] cursor-pointer">
              <input
                type="checkbox"
                checked={isPublicFaq}
                onChange={(e) => setIsPublicFaq(e.target.checked)}
                className="h-4 w-4 rounded accent-[var(--action-primary)]"
              />
              <span>Opublikuj odpowiedź w ogólnodostępnej Bazie Wiedzy FAQ</span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
              <Button variant="tertiary" onClick={() => setSelectedInquiry(null)}>
                Anuluj
              </Button>
              <Button
                variant="primary"
                disabled={isSubmittingInquiry}
                onClick={handleSaveInquiry}
              >
                <Check aria-hidden="true" size={16} />
                <span>{isSubmittingInquiry ? "Wysyłanie..." : "Wyślij odpowiedź"}</span>
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* MODAL 5: OFICJALNY RAPORT WOJEWÓDZKI (PRINT / EXPORT) */}
      {isReportOpen && (
        <Dialog
          title="Oficjalny Raport Trendów Społecznych Województwa Małopolskiego"
          description="Oficjalne zestawienie analityczne ROPS Kraków przygotowane do druku i prezentacji przed Zarządem Województwa."
          open={isReportOpen}
          onOpenChange={setIsReportOpen}
        >
          <div className="space-y-6">
            <div id="print-report-container" className="admin-report-sheet">
              {/* Header */}
              <div className="admin-report-sheet__header">
                <div>
                  <span className="type-caption font-bold text-[var(--action-primary)] tracking-wider uppercase block">
                    Regionalny Ośrodek Polityki Społecznej w Krakowie
                  </span>
                  <h2 className="type-h2 font-bold text-[var(--content-primary)] mt-1">
                    Raport Trendów Społecznych & Białych Plam
                  </h2>
                  <span className="type-caption text-[var(--content-muted)] block mt-0.5">
                    Sygnatura: ROPS/MHIS/2026/Q3 • Data wygenerowania:{" "}
                    {new Date().toLocaleDateString("pl-PL")}
                  </span>
                </div>
                <div className="text-right">
                  <Badge label="Województwo Małopolskie" variant="info" />
                  <span className="type-caption text-[var(--content-muted)] block mt-1">
                    22 powiaty objęte monitoringiem
                  </span>
                </div>
              </div>

              {/* KPI Summary */}
              <div className="admin-report-sheet__kpis">
                <div className="admin-report-sheet__kpi-box">
                  <span className="text-[11px] text-[var(--content-muted)] block">
                    Zgłoszone potrzeby
                  </span>
                  <strong className="text-lg font-bold text-[var(--content-primary)]">
                    {submissions.length}
                  </strong>
                </div>
                <div className="admin-report-sheet__kpi-box">
                  <span className="text-[11px] text-[var(--feedback-danger-foreground)] block">
                    Zidentyfikowane luki
                  </span>
                  <strong className="text-lg font-bold text-[var(--feedback-danger-foreground)]">
                    {whiteSpotsCount}
                  </strong>
                </div>
                <div className="admin-report-sheet__kpi-box">
                  <span className="text-[11px] text-[var(--action-primary)] block">
                    Wnioski grantowe
                  </span>
                  <strong className="text-lg font-bold text-[var(--action-primary)]">
                    {ideas.length}
                  </strong>
                </div>
                <div className="admin-report-sheet__kpi-box">
                  <span className="text-[11px] text-[var(--feedback-info-foreground)] block">
                    Sprawdzone innowacje
                  </span>
                  <strong className="text-lg font-bold text-[var(--feedback-info-foreground)]">
                    {innovations.filter((i) => i.maturity_stage === "sprawdzona").length}
                  </strong>
                </div>
              </div>

              {/* White Spots section */}
              <div>
                <h3 className="type-h3 font-bold text-[var(--feedback-danger-foreground)] mb-2">
                  1. Wykaz Białych Plam Innowacji Społecznych (Brak pokrycia &lt; 45%)
                </h3>
                <div className="space-y-2 text-xs">
                  {trends.white_spots.map((ws, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[var(--feedback-danger-background)] border border-[var(--feedback-danger-foreground)] rounded-lg"
                    >
                      <strong className="text-[var(--content-primary)] font-bold block">
                        {ws.title}
                      </strong>
                      <div className="flex justify-between text-[var(--content-secondary)] mt-1">
                        <span>Kategoria: {ws.category_name}</span>
                        <span>Lokalizacja: {ws.county_name}</span>
                        <span>Grupa: {ws.affected_group}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories breakdown */}
              <div>
                <h3 className="type-h3 font-bold text-[var(--content-primary)] mb-2">
                  2. Zapotrzebowanie według kategorii ROPS
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {trends.by_category.slice(0, 6).map((c) => (
                    <div
                      key={c.category_id}
                      className="p-2 border border-[var(--border-subtle)] rounded-lg flex justify-between"
                    >
                      <span>{c.category_name}:</span>
                      <strong className="font-bold text-[var(--action-primary)]">
                        {c.submissions_count} potrzeb ({c.innovations_count} innowacji)
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="admin-report-sheet__footer">
                <span>Sporządziła: Magdalena Kaczmarczyk, Koordynator ROPS Kraków</span>
                <span>Dokument wygenerowany w ramach platformy Splot</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <Button variant="secondary" onClick={() => setIsReportOpen(false)}>
                Zamknij
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer aria-hidden="true" size={18} />
                <span>Drukuj / Pobierz PDF</span>
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Global Toast */}
      {toast && (
        <ToastViewport>
          <Toast
            title={toast.title}
            description={toast.description}
            onDismiss={() => setToast(null)}
          />
        </ToastViewport>
      )}
    </div>
  );
}
