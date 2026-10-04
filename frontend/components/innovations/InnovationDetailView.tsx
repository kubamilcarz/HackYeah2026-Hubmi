"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowsLeftRight,
  Buildings,
  ChatCircleDots,
  DownloadSimple,
  FilePdf,
  FileText,
  HandHeart,
  Heart,
  UsersThree,
  Wrench,
} from "@phosphor-icons/react";
import type { SocialInnovation } from "@/lib/api";
import { likeInnovation } from "@/lib/api";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TabSwitcher } from "@/components/ui/TabSwitcher";
import { Badge, Tag, type TagVariant } from "@/components/ui/Tag";
import { LinearProgress } from "@/components/ui/Progress";
import { Alert } from "@/components/ui/Alert";
import { VideoEmbed } from "@/components/ui/VideoEmbed";
import { PdfEmbed } from "@/components/ui/PdfEmbed";

type InnovationDetailViewProps = {
  innovation: SocialInnovation;
};

function stageBadge(stage: string): { label: string; variant: TagVariant } {
  switch (stage) {
    case "sprawdzona":
      return { label: "Sprawdzona / Gotowa do skalowania", variant: "success" };
    case "testy":
      return { label: "Pilotaż / W fazie ewaluacji", variant: "warning" };
    case "prototyp":
      return { label: "Prototyp badawczy", variant: "info" };
    case "koncepcja":
      return { label: "Koncepcja innowacji", variant: "neutral" };
    default:
      return { label: stage, variant: "neutral" };
  }
}

function typeLabel(type: string): string {
  switch (type) {
    case "usluga":
      return "Usługa społeczna";
    case "produkt":
      return "Przedmiot / Produkt fizyczny";
    case "metoda":
      return "Metoda / Model pracy";
    case "technologia":
    case "narzedzie_cyfrowe":
      return "Technologia / Narzędzie cyfrowe";
    default:
      return type;
  }
}

export function InnovationDetailView({ innovation }: InnovationDetailViewProps) {
  const [likes, setLikes] = useState(innovation.likes_count);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<"handbook" | "kalkulacja">("handbook");

  const availableDocuments = [
    {
      id: "handbook" as const,
      title: `Podręcznik wdrożeniowy: ${innovation.title}`,
      description: "Kompleksowy opis metodologii, wytyczne BHP, standard pracy z podopiecznymi oraz formularze ewaluacyjne.",
      url: innovation.handbook_pdf_url || "/documents/podrecznik_bawita_rops.pdf",
      fileSize: "3.4 MB",
    },
    {
      id: "kalkulacja" as const,
      title: "Wzór kalkulacji kosztów i montażu finansowego",
      description: "Arkusz szacunkowy dla Centrum Usług Społecznych z montażem funduszy FERS, PFRON i środków własnych.",
      url: "/documents/wzor_kalkulacji_rops.pdf",
      fileSize: "850 KB",
    },
  ];

  const currentDoc = availableDocuments.find((d) => d.id === selectedDocId) || availableDocuments[0];

  const stage = stageBadge(innovation.maturity_stage);
  const categoryName =
    innovation.category_name ||
    (typeof innovation.category === "object" ? innovation.category.name : "Innowacja ROPS Kraków");

  async function handleLike() {
    if (isLiked || isLiking) return;
    setIsLiking(true);
    try {
      const res = await likeInnovation(innovation.slug);
      setLikes(res.likes_count);
      setIsLiked(true);
    } catch {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
    } finally {
      setIsLiking(false);
    }
  }

  async function handleCopyTranscript() {
    if (innovation.video_transcript) {
      try {
        await navigator.clipboard.writeText(innovation.video_transcript);
      } catch {
        // Fallback if clipboard API restricted
      }
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 4000);
    }
  }

  // Zakładka 1: Opis
  const descriptionPanel = (
    <div className="innovation-detail__panel">
      <div className="innovation-detail__section">
        <h3 className="type-h2">Istota i opis rozwiązania</h3>
        <p className="type-body leading-relaxed">{innovation.full_description || innovation.short_summary}</p>
      </div>

      <div className="innovation-detail__section">
        <h4 className="type-h3">Grupa docelowa i odbiorcy</h4>
        <div className="innovation-detail__audience-box">
          <UsersThree aria-hidden="true" size={24} weight="duotone" />
          <div>
            <p className="type-body font-semibold">Do kogo kierowana jest ta innowacja?</p>
            <p className="type-body">{innovation.target_audience}</p>
          </div>
        </div>
      </div>

      {innovation.tags && innovation.tags.length > 0 && (
        <div className="innovation-detail__section">
          <h4 className="type-h3">Obszary i słowa kluczowe</h4>
          <div className="innovation-detail__tags-list">
            {innovation.tags.map((tag) => (
              <Tag key={tag} label={`#${tag}`} variant="neutral" />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Zakładka 2: Instrukcja wdrożenia
  const implementationPanel = (
    <div className="innovation-detail__panel">
      <div className="innovation-detail__section">
        <h3 className="type-h2">Przewodnik wdrożeniowy dla gminy i NGO</h3>
        <p className="type-body">
          Innowacja została opracowana w ramach Małopolskiego Inkubatora Innowacji Społecznych ROPS Kraków. Poniżej znajduje się rekomendowana ścieżka adaptacji:
        </p>
      </div>

      {innovation.implementation_guide ? (
        <div className="innovation-detail__guide">
          {innovation.implementation_guide.split("\n").map((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) return null;
            return (
              <div className="innovation-detail__guide-step" key={idx}>
                <span className="innovation-detail__step-num">{idx + 1}</span>
                <p className="type-body">{trimmed}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <Alert
          description="Szczegółowa instrukcja wdrożeniowa jest dostępna w podręczniku PDF w zakładce 'Materiały do pobrania'."
          title="Instrukcja w podręczniku"
          variant="info"
        />
      )}

      <div className="innovation-detail__middleman-cta">
        <Buildings aria-hidden="true" size={32} weight="duotone" />
        <div>
          <h4 className="type-h3">Reprezentujesz samorząd (JST, CUS lub OPS)?</h4>
          <p className="type-body">
            Skorzystaj z Middlemana Innowacji, aby wygenerować dedykowany pakiet wdrożeniowy (standard usługi, wymogi kadrowe, montaż finansowy 70/15/15) dopasowany do parametrów Twojej gminy.
          </p>
        </div>
        <ButtonLink href={`/middleman?innovation=${innovation.id}`} leadingIcon={Wrench} variant="primary">
          Wygeneruj pakiet usługi
        </ButtonLink>
      </div>
    </div>
  );

  // Zakładka 3: Wideo & Transkrypcja WCAG 2.2 AA
  const videoPanel = (
    <div className="innovation-detail__panel">
      <div className="innovation-detail__section">
        <h3 className="type-h2">Prezentacja wideo innowacji</h3>
        <p className="type-body">
          Materiał audiowizualny prezentujący działanie rozwiązania w praktyce, przygotowany zgodnie ze standardami dostępności cyfrowej WCAG 2.2 AA.
        </p>
      </div>

      {/* Embedded YouTube video player */}
      <VideoEmbed
        caption={`Prezentacja rozwiązania "${innovation.title}" – lektor w PJM, audiodeskrypcja i napisy rozszerzone.`}
        title={`Wideo demonstracyjne: ${innovation.title}`}
        url={innovation.video_url}
      />

      {/* WCAG Video Transcript Section */}
      <div className="innovation-detail__transcript-box">
        <div className="innovation-detail__transcript-header">
          <div>
            <h4 className="type-h3">Pełna transkrypcja tekstowa (Standard WCAG 2.2 AA)</h4>
            <p className="type-caption">
              Alternatywa tekstowa dla osób niesłyszących, niedosłyszących oraz korzystających z czytników ekranu.
            </p>
          </div>
          <Button onClick={handleCopyTranscript} variant="secondary">
            Kopiuj transkrypcję
          </Button>
        </div>

        {showCopyAlert && (
          <Alert description="Treść transkrypcji została skopiowana do schowka." title="Skopiowano" variant="success" />
        )}

        <div
          aria-label={`Transkrypcja tekstowa wideo dla innowacji ${innovation.title}`}
          className="innovation-detail__transcript-content"
          role="region"
          tabIndex={0}
        >
          {innovation.video_transcript ? (
            innovation.video_transcript.split("\n").map((para, i) => (
              <p className="type-body leading-relaxed mb-3" key={i}>
                {para}
              </p>
            ))
          ) : (
            <p className="type-body text-slate-500 italic">
              Transkrypcja tekstowa dla tego materiału wideo jest przygotowywana przez zespół ROPS Kraków.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Zakładka 4: Materiały do pobrania i podgląd PDF
  const downloadsPanel = (
    <div className="innovation-detail__panel">
      <div className="innovation-detail__section">
        <h3 className="type-h2">Materiały do pobrania i dokumentacja</h3>
        <p className="type-body">
          Oficjalne przewodniki, karty technologiczne oraz wzory dokumentów przygotowane przez ROPS Kraków do bezpłatnego wykorzystania.
        </p>
      </div>

      {/* Interaktywny podgląd dokumentu PDF z możliwością wyboru */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="type-label font-semibold">Wybierz dokument do wyświetlenia na stronie:</span>
          <div className="flex gap-2">
            {availableDocuments.map((doc) => (
              <button
                key={doc.id}
                type="button"
                className={`button button--sm ${selectedDocId === doc.id ? "button--primary" : "button--secondary"}`}
                onClick={() => setSelectedDocId(doc.id)}
              >
                {doc.id === "handbook" ? "Podręcznik innowacji (PDF)" : "Wzór kalkulacji (PDF)"}
              </button>
            ))}
          </div>
        </div>

        <PdfEmbed
          url={currentDoc.url}
          title={currentDoc.title}
          description={currentDoc.description}
          fileSize={currentDoc.fileSize}
        />
      </div>

      <div className="innovation-detail__section mt-4">
        <h4 className="type-h3">Wszystkie pliki do pobrania</h4>
      </div>

      <div className="innovation-detail__downloads-list">
        <article className="innovation-detail__download-item">
          <div className="innovation-detail__download-icon">
            <FilePdf aria-hidden="true" size={36} weight="duotone" />
          </div>
          <div className="innovation-detail__download-details">
            <h4 className="type-h3">Podręcznik wdrożeniowy innowacji (PDF)</h4>
            <p className="type-body">
              Kompleksowy opis metodologii, wytyczne BHP, standard pracy z podopiecznymi oraz formularze ewaluacyjne.
            </p>
            <span className="type-caption text-slate-500">Format: PDF • Rozmiar: 3.4 MB • Wersja dostępna cyfrowo</span>
          </div>
          <a
            aria-label={`Pobierz Podręcznik wdrożeniowy innowacji ${innovation.title} (plik PDF)`}
            className="button button--primary"
            download
            href={innovation.handbook_pdf_url || "/documents/podrecznik_bawita_rops.pdf"}
          >
            <DownloadSimple aria-hidden="true" size={20} />
            <span>Pobierz PDF</span>
          </a>
        </article>

        <article className="innovation-detail__download-item">
          <div className="innovation-detail__download-icon">
            <FileText aria-hidden="true" size={36} weight="duotone" />
          </div>
          <div className="innovation-detail__download-details">
            <h4 className="type-h3">Wzór kalkulacji kosztów i montażu finansowego</h4>
            <p className="type-body">
              Arkusz szacunkowy dla Centrum Usług Społecznych z montażem funduszy FERS, PFRON i środków własnych.
            </p>
            <span className="type-caption text-slate-500">Format: XLSX / PDF • Rozmiar: 850 KB</span>
          </div>
          <a
            aria-label="Pobierz Wzór kalkulacji kosztów (plik PDF)"
            className="button button--secondary"
            download
            href="/documents/wzor_kalkulacji_rops.pdf"
          >
            <DownloadSimple aria-hidden="true" size={20} />
            <span>Pobierz wzór</span>
          </a>
        </article>
      </div>
    </div>
  );

  return (
    <article className="innovation-detail">
      {/* Powrót do biblioteki */}
      <nav aria-label="Nawigacja powrotu" className="innovation-detail__back-nav">
        <Link className="innovation-detail__back-link" href="/innowacje">
          <ArrowLeft aria-hidden="true" size={20} />
          <span>Powrót do Biblioteki Innowacji</span>
        </Link>
      </nav>

      {/* Nagłówek innowacji */}
      <header className="innovation-detail__hero">
        <div className="innovation-detail__hero-meta">
          <Tag label={categoryName} variant="info" />
          <Badge label={stage.label} variant={stage.variant} />
          <span className="type-caption innovation-detail__hero-type">{typeLabel(innovation.innovation_type)}</span>
        </div>

        <h1 className="type-h1 innovation-detail__hero-title">{innovation.title}</h1>
        <p className="type-body innovation-detail__hero-summary">{innovation.short_summary}</p>
      </header>

      {/* Układ dwukolumnowy: Zawartość z zakładkami + Pasek boczny */}
      <div className="innovation-detail__layout">
        <div className="innovation-detail__main">
          <TabSwitcher
            items={[
              { id: "opis", label: "O innowacji", panel: descriptionPanel },
              { id: "wdrozenie", label: "Instrukcja wdrożenia", panel: implementationPanel },
              { id: "wideo", label: "Wideo & Transkrypcja WCAG", panel: videoPanel },
              { id: "materialy", label: "Materiały do pobrania", panel: downloadsPanel },
            ]}
            label="Sekcje karty innowacji"
          />
        </div>

        {/* Pasek boczny metryki i szybkich akcji */}
        <aside aria-label="Metryka innowacji i działania" className="innovation-detail__sidebar">
          {/* Karta metryki */}
          <section className="innovation-sidebar-card">
            <h3 className="type-h3">Metryka innowacji</h3>

            <div className="innovation-sidebar-card__item">
              <span className="type-caption">Gotowość do replikacji:</span>
              <div className="flex items-center justify-between mt-1 mb-1">
                <strong className="text-emerald-700 text-lg">{innovation.replication_readiness_score}%</strong>
                <Badge label="Wysoka replikowalność" variant="success" />
              </div>
              <LinearProgress
                label={`Wskaźnik gotowości replikacji: ${innovation.replication_readiness_score}%`}
                value={innovation.replication_readiness_score}
              />
            </div>

            <div className="innovation-sidebar-card__item">
              <span className="type-caption">Autor i pomysłodawca:</span>
              <p className="type-body font-semibold">{innovation.author_name || "Zespół ROPS Kraków"}</p>
              {innovation.author_organization && (
                <p className="type-caption text-slate-600">{innovation.author_organization}</p>
              )}
            </div>

            <div className="innovation-sidebar-card__item">
              <span className="type-caption">Zainteresowanie i aktywność:</span>
              <div className="innovation-sidebar-card__stats">
                <button
                  aria-label={`Polub innowację. Obecnie ${likes} polubień`}
                  aria-pressed={isLiked}
                  className={`innovation-sidebar-card__like-btn${isLiked ? " is-liked" : ""}`}
                  disabled={isLiking}
                  onClick={handleLike}
                  type="button"
                >
                  <Heart aria-hidden="true" size={20} weight={isLiked ? "fill" : "regular"} />
                  <span>{likes} {likes === 1 ? "polubienie" : "polubień"}</span>
                </button>

                <span className="innovation-sidebar-card__matches-badge">
                  <ArrowsLeftRight aria-hidden="true" size={18} weight="bold" />
                  <span>{innovation.matches_count} dopasowań</span>
                </span>
              </div>
            </div>
          </section>

          {/* Szybkie akcje powiązane */}
          <section className="innovation-sidebar-card innovation-sidebar-card--actions">
            <h3 className="type-h3">Kolejne kroki</h3>

            <div className="innovation-sidebar-card__action-list">
              <ButtonLink
                href={`/middleman?innovation=${innovation.id}`}
                leadingIcon={Buildings}
                variant="primary"
              >
                Wdróż w gminie (pakiet JST)
              </ButtonLink>

              {innovation.maturity_stage === "testy" && (
                <ButtonLink
                  href={`/testy?innovation=${innovation.id}`}
                  leadingIcon={HandHeart}
                  variant="secondary"
                >
                  Zgłoś się do testowania
                </ButtonLink>
              )}

              <ButtonLink
                href={`/kontakt?subject=${encodeURIComponent(innovation.title)}`}
                leadingIcon={ChatCircleDots}
                variant="tertiary"
              >
                Zadaj pytanie koordynatorowi
              </ButtonLink>
            </div>
          </section>
        </aside>
      </div>
    </article>
  );
}
