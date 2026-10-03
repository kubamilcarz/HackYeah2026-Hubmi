"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Bell,
  Check,
  CheckCircle,
  DownloadSimple,
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
  const [submissionCountyFilter] = useState<string>("all");
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

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      if (submissionStatusFilter !== "all" && item.status !== submissionStatusFilter) {
        return false;
      }
      if (submissionCountyFilter !== "all" && item.county_name && !item.county_name.toLowerCase().includes(submissionCountyFilter.toLowerCase())) {
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
    setEvalFeedback(idea.admin_feedback || "Wniosek spełnia wymogi deinstytucjonalizacji i kryteria formalno-merytoryczne ROPS Kraków.");
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
        prev.map((i) => (i.id === selectedIdea.id ? { ...i, ...updated, status: decisionStatus } : i))
      );
      setSelectedIdea(null);
      setToast({
        title: decisionStatus === "zaakceptowany" ? "Wniosek zaakceptowany do grantu!" : "Zapisano ocenę wniosku",
        description: `Wniosek „${selectedIdea.title}” otrzymał status: ${IDEA_STATUS_LABELS[decisionStatus]?.label || decisionStatus}.`,
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
    setPromotionReadiness(inn.replication_readiness_score < 90 ? 95 : inn.replication_readiness_score);
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
        description: `Innowacja „${selectedInnovation.title}” ma teraz status: ${STAGE_LABELS[promotionStage]?.label}. Jest dostępna dla samorządów w Middlemanie AI.`,
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
        description: isPublicFaq ? "Odpowiedź została opublikowana w publicznej Bazie Wiedzy FAQ." : "Odpowiedź wysłana do zgłaszającego.",
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
  const pendingIdeasCount = ideas.filter((i) => i.status === "w_ocenie" || i.status === "zlozony").length;
  const testingInnovations = innovations.filter((i) => i.maturity_stage === "testy" || i.maturity_stage === "prototyp");
  const unansweredInquiriesCount = inquiries.filter((i) => !i.is_answered).length;

  return (
    <div className="space-y-6">
      {/* Persona Context Banner */}
      {activePersona.roleType !== "admin" ? (
        <div className="space-y-2">
          <Banner
            variant="info"
            title="Tryb podglądu koordynatora ROPS"
            description={`Przeglądasz panel administracyjny jako ${activePersona.name} (${activePersona.role}). W celu pełnej symulacji pracy koordynatora ROPS zalecamy przełączenie profilu na Magdalenę Kaczmarczyk.`}
          />
          <div className="flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActivePersonaKey("magdalena_kaczmarczyk")}
            >
              Przełącz profil na Magdalenę Kaczmarczyk (ROPS)
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--action-primary)] text-white shadow-xs">
                <ShieldCheck aria-hidden="true" size={28} weight="fill" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="type-h3 text-[var(--content-primary)] font-bold">
                    {activePersona.name}
                  </h2>
                  <Badge label="Administrator ROPS" variant="info" />
                </div>
                <p className="type-caption text-[var(--content-secondary)]">
                  Regionalny Ośrodek Polityki Społecznej w Krakowie • Koordynator Małopolskiego Hubu Innowacji Społecznych
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsReportOpen(true)}
              >
                <Printer aria-hidden="true" size={18} />
                <span>Raport Wojewódzki (Drukuj)</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Overview Cards */}
      <section aria-label="Wskaźniki kluczowe hubu" className="grid grid-cols-2 md:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-[var(--content-muted)] mb-2">
            <span className="type-caption font-semibold">Zgłoszenia potrzeb</span>
            <HandHeart size={20} aria-hidden="true" className="text-[var(--action-primary)]" />
          </div>
          <div className="type-h2 font-bold text-[var(--content-primary)]">
            {submissions.length}
          </div>
          <div className="mt-1 text-xs text-[var(--content-secondary)] flex items-center gap-1">
            <span className="font-semibold text-amber-600">{pendingSubmissionsCount}</span> do moderacji
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-[var(--content-muted)] mb-2">
            <span className="type-caption font-semibold">Białe Plamy (Luki)</span>
            <WarningCircle size={20} aria-hidden="true" className="text-red-500" />
          </div>
          <div className="type-h2 font-bold text-red-600">
            {whiteSpotsCount}
          </div>
          <div className="mt-1 text-xs text-[var(--content-secondary)]">
            Tereny bez innowacji
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-[var(--content-muted)] mb-2">
            <span className="type-caption font-semibold">Wnioski FERS</span>
            <Sparkle size={20} aria-hidden="true" className="text-[var(--action-primary)]" />
          </div>
          <div className="type-h2 font-bold text-[var(--content-primary)]">
            {ideas.length}
          </div>
          <div className="mt-1 text-xs text-[var(--content-secondary)] flex items-center gap-1">
            <span className="font-semibold text-amber-600">{pendingIdeasCount}</span> w ocenie ROPS
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-[var(--content-muted)] mb-2">
            <span className="type-caption font-semibold">Pilotaże w toku</span>
            <Flask size={20} aria-hidden="true" className="text-blue-600" />
          </div>
          <div className="type-h2 font-bold text-[var(--content-primary)]">
            {trends.total_pilots || 3}
          </div>
          <div className="mt-1 text-xs text-[var(--content-secondary)] flex items-center gap-1">
            <span className="font-semibold text-emerald-600">{testingInnovations.length}</span> gotowe do awansu
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 sm:p-5 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-[var(--content-muted)] mb-2">
            <span className="type-caption font-semibold">Pytania do ROPS</span>
            <Bell size={20} aria-hidden="true" className="text-purple-600" />
          </div>
          <div className="type-h2 font-bold text-[var(--content-primary)]">
            {inquiries.length}
          </div>
          <div className="mt-1 text-xs text-[var(--content-secondary)] flex items-center gap-1">
            <span className="font-semibold text-amber-600">{unansweredInquiriesCount}</span> bez odpowiedzi
          </div>
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[var(--surface-subtle)] p-4 rounded-xl border border-[var(--border-subtle)]">
                  <div>
                    <h3 id="heading-moderacja" className="type-h3 font-bold text-[var(--content-primary)]">
                      Moderacja zgłoszeń mieszkańców i samorządów (Matchmaking)
                    </h3>
                    <p className="type-caption text-[var(--content-secondary)]">
                      Weryfikuj dopasowania generowane przez algorytm, zatwierdzaj ścieżki wdrożenia lub oznaczaj zgłoszenia jako oficjalne „Białe plamy” ROPS.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <SelectField
                      label="Filtruj status"
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
                    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-8 text-center type-body text-[var(--content-secondary)]">
                      Brak zgłoszeń spełniających wybrane kryteria filtrów.
                    </div>
                  ) : (
                    filteredSubmissions.map((sub) => {
                      const statusMeta = STATUS_LABELS[sub.status] || { label: sub.status, variant: "neutral" };
                      const hasMatches = sub.matches && sub.matches.length > 0;
                      const isGap = sub.status === "gap_identified";

                      return (
                        <article
                          key={sub.id}
                          className={`rounded-2xl border bg-[var(--surface-raised)] p-5 sm:p-6 transition-all shadow-xs ${
                            isGap ? "border-red-200 bg-red-50/20" : "border-[var(--border-subtle)]"
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="type-caption font-mono text-[var(--content-muted)]">
                                  #{sub.id}
                                </span>
                                <Badge label={statusMeta.label} variant={statusMeta.variant} />
                                {sub.category_name && <Tag label={sub.category_name} />}
                                {sub.county_name && (
                                  <span className="type-caption text-[var(--content-secondary)] flex items-center gap-1">
                                    <MapPin size={14} aria-hidden="true" />
                                    {sub.municipality_name ? `${sub.municipality_name}, ${sub.county_name}` : sub.county_name}
                                  </span>
                                )}
                              </div>

                              <h4 className="type-h3 text-[var(--content-primary)] font-bold">
                                {sub.title}
                              </h4>

                              <p className="type-body text-[var(--content-secondary)]">
                                {sub.description}
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-[var(--content-secondary)]">
                                <div>
                                  <strong className="text-[var(--content-primary)]">Grupa dotknięta:</strong> {sub.affected_group}
                                </div>
                                <div>
                                  <strong className="text-[var(--content-primary)]">Zgłaszający:</strong> {sub.reporter_name} ({sub.reporter_role})
                                  {sub.reporter_institution && ` • ${sub.reporter_institution}`}
                                </div>
                              </div>

                              {/* Matches or Gap diagnosis */}
                              {hasMatches && (
                                <div className="mt-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs">
                                  <span className="font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                                    <Sparkle size={14} className="text-blue-600" />
                                    Dopasowanie algorytmiczne: {sub.matches![0].innovation.title} (Trafność: {sub.matches![0].similarity_score}%)
                                  </span>
                                  <p className="text-blue-800">{sub.matches![0].justification}</p>
                                </div>
                              )}

                              {isGap && (
                                <div className="mt-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs">
                                  <span className="font-bold text-red-900 flex items-center gap-1.5 mb-1">
                                    <WarningCircle size={14} className="text-red-600" />
                                    Zidentyfikowano Białą Plamę w Małopolsce: Brak gotowej innowacji o trafności &ge; 45%
                                  </span>
                                  <p className="text-red-800">
                                    Zgłoszenie wymaga uruchomienia Kreatora Pomysłów i zaadresowania w najbliższym naborze mikrograntów FERS.
                                  </p>
                                </div>
                              )}

                              {sub.admin_notes && (
                                <div className="mt-2 text-xs text-[var(--content-secondary)] bg-[var(--surface-subtle)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                                  <strong className="text-[var(--content-primary)]">Notatki ROPS:</strong> {sub.admin_notes}
                                </div>
                              )}
                            </div>

                            <div className="flex lg:flex-col items-center gap-2 self-end lg:self-start shrink-0">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleOpenModeration(sub)}
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
                <div className="bg-[var(--surface-subtle)] p-4 rounded-xl border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 id="heading-fers" className="type-h3 font-bold text-[var(--content-primary)]">
                      Weryfikacja i ocena Wniosków Grantowych FERS (12 pkt)
                    </h3>
                    <p className="type-caption text-[var(--content-secondary)]">
                      Oceniaj wnioski z Modułu III (Kreator Pomysłów) pod kątem deinstytucjonalizacji i budżetu do 50 000 zł.
                      Zatwierdzaj wnioski na żywo do inkubacji.
                    </p>
                  </div>

                  <ButtonLink
                    variant="secondary"
                    size="sm"
                    href="/kreator"
                  >
                    <span>Przejdź do Kreatora FERS</span>
                  </ButtonLink>
                </div>

                <div className="space-y-4">
                  {ideas.map((idea) => {
                    const statusMeta = IDEA_STATUS_LABELS[idea.status] || { label: idea.status, variant: "neutral" };
                    const isGrant = idea.submission_type === "grant_fers";

                    return (
                      <article
                        key={idea.id}
                        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-5 sm:p-6 shadow-xs space-y-4"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="type-caption font-mono text-[var(--content-muted)]">
                                #{idea.id}
                              </span>
                              <Badge label={isGrant ? "Wniosek Grantowy FERS (50k zł)" : "Fiszka Pomysłu"} variant="info" />
                              <Badge label={statusMeta.label} variant={statusMeta.variant} />
                              {idea.category_name && <Tag label={idea.category_name} />}
                              {idea.county_name && <Tag label={`Powiat ${idea.county_name}`} />}
                            </div>

                            <h4 className="type-h3 text-[var(--content-primary)] font-bold">
                              {idea.title}
                            </h4>

                            <div className="text-xs text-[var(--content-secondary)] flex flex-wrap gap-x-4 gap-y-1">
                              <span><strong>Wnioskodawca:</strong> {idea.applicant_name}</span>
                              {idea.organization_representative && <span><strong>Reprezentant:</strong> {idea.organization_representative}</span>}
                              {idea.organization_krs && <span><strong>KRS:</strong> {idea.organization_krs}</span>}
                              {idea.organization_nip && <span><strong>NIP:</strong> {idea.organization_nip}</span>}
                            </div>

                            <p className="type-body text-[var(--content-secondary)]">
                              {idea.innovation_description || idea.solution_concept}
                            </p>

                            {idea.uniqueness_rationale && (
                              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl text-xs text-amber-900">
                                <strong>Wyróżniki innowacji:</strong> {idea.uniqueness_rationale}
                              </div>
                            )}

                            {/* Financial & Testing summary */}
                            {isGrant && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                <div className="bg-[var(--surface-subtle)] p-3 rounded-xl border border-[var(--border-subtle)]">
                                  <span className="type-caption text-[var(--content-muted)] block">Wnioskowana kwota</span>
                                  <span className="type-body font-bold text-emerald-600">
                                    {(idea.requested_grant_amount || 50000).toLocaleString("pl-PL")} PLN
                                  </span>
                                  <span className="type-caption text-[var(--content-secondary)] block text-[11px]">100% dofinansowania FERS</span>
                                </div>

                                <div className="bg-[var(--surface-subtle)] p-3 rounded-xl border border-[var(--border-subtle)]">
                                  <span className="type-caption text-[var(--content-muted)] block">Harmonogram realizacji</span>
                                  <span className="type-body font-bold text-[var(--content-primary)]">12 miesięcy</span>
                                  <span className="type-caption text-[var(--content-secondary)] block text-[11px]">3 m-ce przygotowanie + 9 m-cy testy</span>
                                </div>

                                <div className="bg-[var(--surface-subtle)] p-3 rounded-xl border border-[var(--border-subtle)]">
                                  <span className="type-caption text-[var(--content-muted)] block">Ocena ROPS</span>
                                  <span className="type-body font-bold text-[var(--content-primary)]">
                                    {idea.admin_score !== null && idea.admin_score !== undefined ? `${idea.admin_score} / 100 pkt` : "Oczekuje na ocenę"}
                                  </span>
                                  <span className="type-caption text-[var(--content-secondary)] block text-[11px]">
                                    {idea.admin_feedback ? "Uzasadnienie zarejestrowane" : "Brak uzasadnienia"}
                                  </span>
                                </div>
                              </div>
                            )}

                            {idea.admin_feedback && (
                              <div className="text-xs p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                                <strong>Opinia i decyzja ROPS:</strong> {idea.admin_feedback}
                              </div>
                            )}
                          </div>

                          <div className="shrink-0 flex lg:flex-col gap-2 self-end lg:self-start">
                            <Button
                              variant={idea.status === "zaakceptowany" ? "secondary" : "primary"}
                              size="sm"
                              onClick={() => handleOpenEvaluation(idea)}
                            >
                              <Sparkle aria-hidden="true" size={16} />
                              <span>{idea.status === "zaakceptowany" ? "Zmień ocenę" : "Oceń wniosek FERS"}</span>
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
                <div className="bg-[var(--surface-subtle)] p-4 rounded-xl border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 id="heading-awans" className="type-h3 font-bold text-[var(--content-primary)]">
                      Zarządzanie dojrzałością innowacji (Tester &rarr; Middleman)
                    </h3>
                    <p className="type-caption text-[var(--content-secondary)]">
                      Przeglądaj wyniki testów społecznych (Moduł IV) i awansuj przetestowane prototypy do statusu „Sprawdzona / Gotowa do skalowania”,
                      czyniąc je natychmiast dostępnymi w generatorze wdrożeń dla 182 gmin Małopolski.
                    </p>
                  </div>

                  <ButtonLink
                    variant="secondary"
                    size="sm"
                    href="/testy"
                  >
                    <Flask aria-hidden="true" size={16} />
                    <span>Otwórz Tester Innowacji</span>
                  </ButtonLink>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {innovations.map((inn) => {
                    const isTested = inn.maturity_stage === "testy" || inn.maturity_stage === "prototyp";
                    const stageMeta = STAGE_LABELS[inn.maturity_stage] || { label: inn.maturity_stage, variant: "neutral" };

                    return (
                      <div
                        key={inn.id}
                        className={`rounded-2xl border p-5 bg-[var(--surface-raised)] space-y-3.5 transition-all shadow-xs ${
                          isTested ? "border-amber-300 ring-2 ring-amber-100" : "border-[var(--border-subtle)]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge label={stageMeta.label} variant={stageMeta.variant} />
                              <span className="type-caption text-[var(--content-muted)] font-mono">#{inn.id}</span>
                            </div>
                            <h4 className="type-h3 font-bold text-[var(--content-primary)]">
                              {inn.title}
                            </h4>
                          </div>

                          <div className="text-right">
                            <span className="type-caption text-[var(--content-muted)] block">Gotowość wdrożenia</span>
                            <strong className="text-emerald-600 type-body font-bold">
                              {inn.replication_readiness_score}%
                            </strong>
                          </div>
                        </div>

                        <p className="type-caption text-[var(--content-secondary)] line-clamp-2">
                          {inn.short_summary}
                        </p>

                        {/* Test metrics if available */}
                        <div className="p-3 bg-[var(--surface-subtle)] rounded-xl border border-[var(--border-subtle)] grid grid-cols-3 gap-2 text-center text-xs">
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
                            <strong className="text-emerald-600">100% gmin</strong>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <ButtonLink
                            variant="tertiary"
                            size="sm"
                            href={`/innowacje/${inn.slug}`}
                          >
                            <Eye aria-hidden="true" size={16} />
                            <span>Karta wiedzy</span>
                          </ButtonLink>

                          <Button
                            variant={isTested ? "primary" : "secondary"}
                            size="sm"
                            onClick={() => handleOpenPromotion(inn)}
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
                <div className="bg-[var(--surface-subtle)] p-4 rounded-xl border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 id="heading-trends" className="type-h3 font-bold text-[var(--content-primary)]">
                      Regionalna analityka trendów i Białych Plam (22 powiaty)
                    </h3>
                    <p className="type-caption text-[var(--content-secondary)]">
                      Agregacja potrzeb społecznych według 9 oficjalnych kategorii ROPS Kraków i mapy demograficznej Małopolski.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsReportOpen(true)}
                  >
                    <DownloadSimple aria-hidden="true" size={18} />
                    <span>Generuj Raport Wojewódzki (PDF)</span>
                  </Button>
                </div>

                {/* White spots alert box */}
                {trends.white_spots && trends.white_spots.length > 0 && (
                  <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <WarningCircle size={22} className="text-red-600" weight="fill" />
                      <h4 className="type-h3 font-bold text-red-900">
                        Wykryte Białe Plamy Innowacji Społecznych ({trends.white_spots.length})
                      </h4>
                    </div>
                    <p className="type-caption text-red-800">
                      Poniższe obszary wykazują wysokie zapotrzebowanie mieszkańców przy jednoczesnym braku gotowej innowacji w katalogu ROPS (trafność dopasowania &lt; 45%).
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {trends.white_spots.map((ws, i) => (
                        <div key={i} className="bg-white p-3.5 rounded-xl border border-red-100 shadow-xs text-xs space-y-1">
                          <div className="flex items-center justify-between text-red-600 font-bold">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {trends.by_category.map((cat) => {
                      const ratio = Math.min(100, Math.round((cat.submissions_count / 10) * 100));
                      return (
                        <div
                          key={cat.category_id}
                          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 space-y-2 shadow-xs"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <strong className="text-[var(--content-primary)] font-semibold truncate">
                              {cat.category_name}
                            </strong>
                            <span className="font-bold text-emerald-600 shrink-0">
                              {cat.submissions_count} zgłoszeń
                            </span>
                          </div>
                          <LinearProgress value={ratio} label={`Udział zgłoszeń kategorii ${cat.category_name}`} />
                          <div className="flex items-center justify-between text-[11px] text-[var(--content-muted)]">
                            <span>Gotowe innowacje: {cat.innovations_count}</span>
                            <span>{cat.innovations_count === 0 ? "Brak innowacji" : "Pokryte"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Counties Table */}
                <div className="space-y-3">
                  <h4 className="type-h3 font-bold text-[var(--content-primary)]">
                    Aktywność i wskaźniki senioralne w powiatach
                  </h4>
                  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[var(--surface-subtle)] border-b border-[var(--border-subtle)] text-[var(--content-muted)] font-semibold">
                            <th className="p-3.5">Powiat</th>
                            <th className="p-3.5">Liczba mieszkańców</th>
                            <th className="p-3.5">Wskaźnik starości (senior ratio)</th>
                            <th className="p-3.5">Liczba zgłoszonych potrzeb</th>
                            <th className="p-3.5 text-right">Priorytet wsparcia</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                          {trends.by_county.map((c) => {
                            const isHighSenior = c.senior_ratio >= 24;
                            return (
                              <tr key={c.county_id} className="hover:bg-[var(--surface-subtle)] transition-colors">
                                <td className="p-3.5 font-bold text-[var(--content-primary)]">{c.county_name}</td>
                                <td className="p-3.5 text-[var(--content-secondary)]">{c.population?.toLocaleString("pl-PL") || "—"}</td>
                                <td className="p-3.5 font-semibold text-[var(--content-primary)]">
                                  <span className={isHighSenior ? "text-amber-600 font-bold" : ""}>
                                    {c.senior_ratio}%
                                  </span>
                                </td>
                                <td className="p-3.5 font-bold text-[var(--action-primary)]">{c.submissions_count}</td>
                                <td className="p-3.5 text-right">
                                  <Badge
                                    label={isHighSenior ? "Wysoki priorytet" : "Standardowy"}
                                    variant={isHighSenior ? "warning" : "neutral"}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            ),
          },
          {
            id: "zapytania-dialog",
            label: `Dialog z koordynatorem (${inquiries.length})`,
            panel: (
              <section aria-labelledby="heading-inquiries" className="space-y-4 pt-4">
                <div className="bg-[var(--surface-subtle)] p-4 rounded-xl border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 id="heading-inquiries" className="type-h3 font-bold text-[var(--content-primary)]">
                      Bezpośredni dialog z koordynatorem ROPS (Moduł V)
                    </h3>
                    <p className="type-caption text-[var(--content-secondary)]">
                      Odpowiadaj na pytania mieszkańców, stowarzyszeń i gmin. Publikuj wartościowe odpowiedzi w publicznej Bazie Wiedzy FAQ.
                    </p>
                  </div>

                  <ButtonLink
                    variant="secondary"
                    size="sm"
                    href="/kontakt"
                  >
                    <span>Otwórz Platformę Komunikacji</span>
                  </ButtonLink>
                </div>

                <div className="space-y-3">
                  {inquiries.map((inq) => {
                    const isAnswered = inq.is_answered;

                    return (
                      <article
                        key={inq.id}
                        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-5 sm:p-6 shadow-xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                label={isAnswered ? "Udzielono odpowiedzi" : "Oczekuje na odpowiedź ROPS"}
                                variant={isAnswered ? "success" : "warning"}
                              />
                              {inq.is_public_faq && <Badge label="Baza FAQ" variant="info" />}
                              <span className="type-caption text-[var(--content-muted)] font-mono">#{inq.id}</span>
                            </div>
                            <h4 className="type-h3 font-bold text-[var(--content-primary)]">
                              {inq.subject || "Zapytanie ogólne"}
                            </h4>
                            <div className="type-caption text-[var(--content-secondary)]">
                              Zgłaszający: <strong>{inq.author_name}</strong> ({inq.author_email})
                            </div>
                          </div>

                          <Button
                            variant={isAnswered ? "secondary" : "primary"}
                            size="sm"
                            onClick={() => handleOpenInquiry(inq)}
                          >
                            <NotePencil aria-hidden="true" size={16} />
                            <span>{isAnswered ? "Edytuj odpowiedź" : "Odpowiedz"}</span>
                          </Button>
                        </div>

                        <div className="p-3 bg-[var(--surface-subtle)] rounded-xl border border-[var(--border-subtle)] text-xs text-[var(--content-primary)]">
                          {inq.message}
                        </div>

                        {isAnswered && inq.response && (
                          <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs space-y-1">
                            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                              <CheckCircle size={15} className="text-emerald-600" />
                              Odpowiedź ({inq.responder_name || "Koordynator ROPS Kraków"}):
                            </div>
                            <p className="text-emerald-800">{inq.response}</p>
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
              <p className="text-[var(--content-secondary)]">
                {selectedSubmission.description}
              </p>
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
                { label: "Biała plama – brak gotowej innowacji (gap_identified)", value: "gap_identified" },
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
              <Button
                variant="tertiary"
                onClick={() => setSelectedSubmission(null)}
              >
                Anuluj
              </Button>
              <Button
                variant="primary"
                disabled={isSubmittingModeration}
                onClick={handleSaveModeration}
              >
                <Check aria-hidden="true" size={16} />
                <span>{isSubmittingModeration ? "Zapisywanie..." : "Zapisz decyzję moderacyjną"}</span>
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* MODAL 2: OCENA WNIOSKU GRANTOWEGO FERS */}
      {selectedIdea && (
        <Dialog
          title={`Ocena formalno-merytoryczna wniosku #${selectedIdea.id}`}
          description={`Wniosek: „${selectedIdea.title}” (${(selectedIdea.requested_grant_amount || 50000).toLocaleString("pl-PL")} PLN)`}
          open={Boolean(selectedIdea)}
          onOpenChange={(open) => {
            if (!open) setSelectedIdea(null);
          }}
        >
          <div className="space-y-4">
            <div className="p-3 bg-[var(--surface-subtle)] rounded-xl border border-[var(--border-subtle)] text-xs space-y-1.5">
              <div>
                <strong>Wnioskodawca:</strong> {selectedIdea.applicant_name} ({selectedIdea.applicant_email})
              </div>
              <div>
                <strong>Koncepcja:</strong> {selectedIdea.innovation_description || selectedIdea.solution_concept}
              </div>
              <div>
                <strong>Kwota grantu FERS:</strong> {(selectedIdea.requested_grant_amount || 50000).toLocaleString("pl-PL")} PLN (Maks. 50 000 zł)
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
                { label: "Sprawdzona / Gotowa do skalowania (sprawdzona)", value: "sprawdzona" },
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
              <Button
                variant="tertiary"
                onClick={() => setSelectedInnovation(null)}
              >
                Anuluj
              </Button>
              <Button
                variant="primary"
                disabled={isSubmittingPromotion}
                onClick={handleSavePromotion}
              >
                <Check aria-hidden="true" size={16} />
                <span>{isSubmittingPromotion ? "Aktualizowanie..." : "Zatwierdź awans innowacji"}</span>
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
              <p className="text-[var(--content-secondary)]">
                {selectedInquiry.message}
              </p>
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
              <Button
                variant="tertiary"
                onClick={() => setSelectedInquiry(null)}
              >
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
            <div id="print-report-container" className="p-6 bg-white rounded-xl border border-[var(--border-subtle)] space-y-5 text-[var(--content-primary)]">
              {/* Header */}
              <div className="border-b pb-4 flex items-center justify-between">
                <div>
                  <span className="type-caption font-bold text-emerald-800 tracking-wider uppercase block">
                    Regionalny Ośrodek Polityki Społecznej w Krakowie
                  </span>
                  <h2 className="type-h2 font-bold text-navy-950 mt-1">
                    Raport Trendów Społecznych & Białych Plam
                  </h2>
                  <span className="type-caption text-[var(--content-muted)] block mt-0.5">
                    Sygnatura: ROPS/MHIS/2026/Q3 • Data wygenerowania: {new Date().toLocaleDateString("pl-PL")}
                  </span>
                </div>
                <div className="text-right">
                  <Badge label="Województwo Małopolskie" variant="info" />
                  <span className="type-caption text-[var(--content-muted)] block mt-1">22 powiaty objęte monitoringiem</span>
                </div>
              </div>

              {/* KPI Summary */}
              <div className="grid grid-cols-4 gap-3 text-center border-b pb-4">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[11px] text-slate-500 block">Zgłoszone potrzeby</span>
                  <strong className="text-lg font-bold text-slate-900">{submissions.length}</strong>
                </div>
                <div className="p-2.5 bg-red-50 rounded-lg">
                  <span className="text-[11px] text-red-600 block">Zidentyfikowane luki</span>
                  <strong className="text-lg font-bold text-red-700">{whiteSpotsCount}</strong>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-lg">
                  <span className="text-[11px] text-emerald-600 block">Wnioski grantowe</span>
                  <strong className="text-lg font-bold text-emerald-700">{ideas.length}</strong>
                </div>
                <div className="p-2.5 bg-blue-50 rounded-lg">
                  <span className="text-[11px] text-blue-600 block">Sprawdzone innowacje</span>
                  <strong className="text-lg font-bold text-blue-700">{innovations.filter(i => i.maturity_stage === "sprawdzona").length}</strong>
                </div>
              </div>

              {/* White Spots section */}
              <div>
                <h3 className="type-h3 font-bold text-red-900 mb-2">
                  1. Wykaz Białych Plam Innowacji Społecznych (Brak pokrycia &lt; 45%)
                </h3>
                <div className="space-y-2 text-xs">
                  {trends.white_spots.map((ws, idx) => (
                    <div key={idx} className="p-2.5 bg-red-50/70 border border-red-100 rounded-lg">
                      <strong className="text-red-950 font-bold block">{ws.title}</strong>
                      <div className="flex justify-between text-red-800 mt-1">
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
                <h3 className="type-h3 font-bold text-navy-950 mb-2">
                  2. Zapotrzebowanie według kategorii ROPS
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {trends.by_category.slice(0, 6).map((c) => (
                    <div key={c.category_id} className="p-2 border rounded-lg flex justify-between">
                      <span>{c.category_name}:</span>
                      <strong className="font-bold text-emerald-700">{c.submissions_count} potrzeb ({c.innovations_count} innowacji)</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-4 flex justify-between text-xs text-slate-500">
                <span>Sporządziła: Magdalena Kaczmarczyk, Koordynator ROPS Kraków</span>
                <span>Dokument wygenerowany w ramach platformy Splot</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <Button
                variant="secondary"
                onClick={() => setIsReportOpen(false)}
              >
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

