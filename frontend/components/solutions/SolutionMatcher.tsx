"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  MagicWand,
  PencilSimple,
  Sparkle,
  WarningCircle,
} from "@phosphor-icons/react";
import type { Solution } from "@/lib/solutions";
import { Dialog } from "@/components/ui/Dialog";
import { Button, ButtonLink, IconButton } from "@/components/ui/Button";
import { FavoriteButton } from "@/components/ui/SolutionInterestActions";
import { LinearProgress } from "@/components/ui/Progress";
import { SolutionCard } from "@/components/ui/Cards";
import { TextAreaField } from "@/components/ui/FormControls";
import { Alert } from "@/components/ui/Alert";
import { analyzeMatchmaking, type MatchmakingAnalyzeResponse } from "@/lib/api";

type MatcherPhase = "prompt" | "processing" | "results";

type SolutionMatcherProps = {
  initialDescription?: string;
  solutions: Solution[];
};

const processingStages = [
  { label: "Czytamy opis potrzeby", threshold: 0 },
  { label: "Szukamy lokalnych innowacji ROPS", threshold: 34 },
  { label: "Porównujemy kategorie i wyzwania regionalne", threshold: 67 },
  { label: "Weryfikujemy obecność Białych Plam w Małopolsce", threshold: 94 },
];

function currentStage(progress: number) {
  return [...processingStages].reverse().find((stage) => progress >= stage.threshold) ?? processingStages[0];
}

export function SolutionMatcher({ initialDescription = "", solutions: initialSolutions }: SolutionMatcherProps) {
  const [description, setDescription] = useState(initialDescription);
  const [draftDescription, setDraftDescription] = useState(initialDescription);
  const [error, setError] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [phase, setPhase] = useState<MatcherPhase>("prompt");
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [apiResult, setApiResult] = useState<MatchmakingAnalyzeResponse | null>(null);

  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Rozpoczęcie analizy przy montowaniu jeśli przekazano opis
  useEffect(() => {
    if (initialDescription.trim() && phase === "prompt") {
      startMatching(initialDescription);
    }
  }, [initialDescription, phase]);

  // Efekt paska postępu dopasowywania
  useEffect(() => {
    if (phase !== "processing") return;

    let isCancelled = false;

    // Równolegle wywołaj API analizy dopasowania
    analyzeMatchmaking({
      title: description.slice(0, 60),
      description,
      save_submission: false,
    })
      .then((res) => {
        if (!isCancelled) setApiResult(res);
      })
      .catch(() => {
        // Fallback do danych domyślnych w razie braku połączenia
      });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      const completion = window.setTimeout(() => {
        setProgress(100);
        setPhase("results");
      }, 300);
      return () => {
        isCancelled = true;
        window.clearTimeout(completion);
      };
    }

    const duration = 2000;
    const startedAt = performance.now();
    let frame = 0;

    const advance = (now: number) => {
      const nextProgress = Math.min(100, Math.round(((now - startedAt) / duration) * 100));
      setProgress(nextProgress);
      if (nextProgress >= 100) {
        setPhase("results");
        return;
      }
      frame = window.requestAnimationFrame(advance);
    };

    frame = window.requestAnimationFrame(advance);
    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [phase, description]);

  useEffect(() => {
    if (phase === "results") resultsHeadingRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    if (phase !== "results") return;
    slideRefs.current[activeIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }, [activeIndex, phase]);

  function startMatching(nextDescription: string) {
    setDescription(nextDescription.trim());
    setProgress(0);
    setActiveIndex(0);
    setApiResult(null);
    setPhase("processing");
  }

  function handleInitialSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!description.trim()) {
      setError("Opisz proszę, czego potrzebujesz.");
      return;
    }
    setError("");
    startMatching(description);
  }

  function handleDescriptionUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draftDescription.trim()) {
      setDialogError("Opis nie może być pusty.");
      return;
    }
    setDialogError("");
    setIsDialogOpen(false);
    startMatching(draftDescription);
  }

  function openEditDialog() {
    setDraftDescription(description);
    setDialogError("");
    setIsDialogOpen(true);
  }

  // Przygotuj listę rozwiązań do wyświetlenia
  const displayedSolutions: Solution[] =
    apiResult && !apiResult.is_gap_identified && apiResult.matches.length > 0
      ? apiResult.matches.map((m) => ({
          slug: m.innovation.slug,
          title: m.innovation.title,
          organization: m.innovation.author_organization || "ROPS Kraków",
          locality: "Małopolska",
          categories: [m.innovation.category_name || "Innowacja społeczna"],
          availability: `Etap: ${m.innovation.maturity_stage}`,
          matchScore: Math.round(m.similarity_score),
          summary: m.innovation.short_summary,
          description: m.justification,
          image: {
            src: "/discovery/recommendation-digital-skills.jpg",
            alt: m.innovation.title,
          },
        }))
      : initialSolutions;

  if (phase === "prompt") {
    return (
      <section aria-labelledby="solution-prompt-heading" className="solution-matcher solution-matcher--prompt">
        <div className="solution-matcher__intro">
          <MagicWand aria-hidden="true" size={36} weight="duotone" />
          <div>
            <h2 className="type-h2" id="solution-prompt-heading">
              Czego teraz potrzebujesz?
            </h2>
            <p className="type-body">
              Opisz swoją sytuację własnymi słowami. Silnik Matchmakingu ROPS Kraków dopasuje innowacje społeczne lub wskaże lukę regionalną.
            </p>
          </div>
        </div>
        <form className="solution-matcher__form" noValidate onSubmit={handleInitialSubmit}>
          <TextAreaField
            error={error}
            label="Opis potrzeby"
            maxLength={500}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Na przykład: Szukam wsparcia dla opiekunów osób starszych z demencją w małej gminie…"
            required
            rows={6}
            showCharacterCount
            value={description}
          />
          <Button trailingIcon={ArrowRight} type="submit">
            Znajdź rozwiązania
          </Button>
        </form>
      </section>
    );
  }

  if (phase === "processing") {
    const stage = currentStage(progress);
    return (
      <section aria-labelledby="matching-progress-heading" className="solution-matcher solution-matcher--processing">
        <div aria-hidden="true" className="solution-matcher__magic">
          <Sparkle size={52} weight="fill" />
          <MagicWand size={42} weight="duotone" />
        </div>
        <h2 className="type-h2" id="matching-progress-heading">
          Dopasowujemy innowacje ROPS Kraków
        </h2>
        <p aria-live="polite" className="type-body solution-matcher__status">
          {stage.label}
        </p>
        <LinearProgress label="Postęp analizy" value={progress} variant="success" valueLabel={`${progress}%`} />
        <p className="type-caption solution-matcher__note">
          Sprawdzamy bazę 9 kategorii ROPS, słowa kluczowe i etapy dojrzałości innowacji.
        </p>
      </section>
    );
  }

  // Wariant: Wykryto Białą Plamę w wyszukiwarce
  if (apiResult?.is_gap_identified) {
    return (
      <section aria-labelledby="matching-gap-heading" className="solution-matcher solution-matcher--results">
        <div className="need-gap-card">
          <div className="need-gap-card__header">
            <span className="need-gap-card__icon" aria-hidden="true">
              <WarningCircle size={32} weight="fill" />
            </span>
            <div>
              <span className="need-gap-card__badge">Biała plama w innowacjach</span>
              <h2 className="type-h2" id="matching-gap-heading" ref={resultsHeadingRef} tabIndex={-1}>
                Wykryto lukę innowacyjną w bazie ROPS Kraków
              </h2>
            </div>
          </div>

          <Alert
            description={apiResult.gap_message || "Dla wskazanego zapytania nie odnaleziono jeszcze gotowej innowacji o zgodności powyżej 45%."}
            title="Brak gotowej innowacji"
            variant="warning"
          />

          <div className="need-gap-card__body">
            <p className="type-body">
              Twój opis: <em>„{description}”</em> nie ma jeszcze bezpośredniego odpowiednika w katalogu gotowych usług i produktów ROPS.
            </p>
            <p className="type-body">
              Możesz zgłosić ten problem jako formalną potrzebę (co zapisze lukę w Bazie Wyzwań Regionalnych) lub stworzyć nową koncepcję innowacji w Kreatorze Pomysłów.
            </p>
          </div>

          <div className="need-gap-card__actions">
            <ButtonLink
              href={`/kreator?desc=${encodeURIComponent(description)}`}
              leadingIcon={Lightbulb}
              trailingIcon={ArrowRight}
            >
              Stwórz rozwiązanie w Kreatorze Pomysłów
            </ButtonLink>
            <ButtonLink
              href={`/needs/new`}
              variant="secondary"
            >
              Zgłoś oficjalną potrzebę
            </ButtonLink>
            <Button leadingIcon={PencilSimple} onClick={openEditDialog} variant="tertiary">
              Zmień opis zapytania
            </Button>
          </div>
        </div>

        <Dialog
          description="Zmień opis, aby ponownie przeszukać bazę innowacji ROPS."
          onOpenChange={setIsDialogOpen}
          open={isDialogOpen}
          title="Zmodyfikuj zapytanie"
        >
          <form className="solution-matcher__dialog-form" noValidate onSubmit={handleDescriptionUpdate}>
            <TextAreaField
              error={dialogError}
              label="Opis potrzeby"
              maxLength={500}
              onChange={(event) => setDraftDescription(event.target.value)}
              required
              rows={6}
              showCharacterCount
              value={draftDescription}
            />
            <div className="dialog__actions">
              <Button onClick={() => setIsDialogOpen(false)} type="button" variant="tertiary">
                Anuluj
              </Button>
              <Button trailingIcon={MagicWand} type="submit">
                Dopasuj ponownie
              </Button>
            </div>
          </form>
        </Dialog>
      </section>
    );
  }

  // Wariant: Wyniki dopasowania
  return (
    <section aria-labelledby="matching-results-heading" className="solution-matcher solution-matcher--results">
      <div className="solution-matcher__results-header">
        <div>
          <h2 className="type-h2" id="matching-results-heading" ref={resultsHeadingRef} tabIndex={-1}>
            Dopasowane innowacje ROPS Kraków
          </h2>
          <p className="type-body">
            Na podstawie Twojego opisu znaleźliśmy {displayedSolutions.length} rozwiązań o wysokim wskaźniku zgodności.
          </p>
        </div>
        <Button leadingIcon={PencilSimple} onClick={openEditDialog} variant="tertiary">
          Zmodyfikuj opis
        </Button>
      </div>

      <div aria-label="Karuzela dopasowanych rozwiązań" className="solution-carousel">
        <div className="solution-carousel__viewport">
          <div className="solution-carousel__track">
            {displayedSolutions.map((solution, index) => (
              <div
                className="solution-carousel__slide"
                key={solution.slug}
                ref={(element) => {
                  slideRefs.current[index] = element;
                }}
              >
                <div className="solution-carousel__card">
                  <SolutionCard
                    action={{ href: `/solutions/${solution.slug}`, label: "Zobacz szczegóły" }}
                    availability={solution.availability}
                    category={solution.categories[0]}
                    image={solution.image}
                    match={{ label: `${solution.matchScore}% dopasowania`, score: solution.matchScore }}
                    organization={solution.organization}
                    summary={solution.summary}
                    title={solution.title}
                  />
                  <FavoriteButton />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="solution-carousel__controls">
          <IconButton
            disabled={activeIndex === 0}
            icon={ArrowLeft}
            label="Pokaż poprzednie rozwiązanie"
            onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}
            variant="tertiary"
          />
          <div aria-label="Wybór rozwiązania" className="solution-carousel__pages">
            {displayedSolutions.map((solution, index) => (
              <button
                aria-current={index === activeIndex ? "true" : undefined}
                aria-label={`Pokaż rozwiązanie ${index + 1}: ${solution.title}`}
                className="solution-carousel__page"
                key={solution.slug}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <span className="sr-only">{solution.title}</span>
              </button>
            ))}
          </div>
          <IconButton
            disabled={activeIndex === displayedSolutions.length - 1}
            icon={ArrowRight}
            label="Pokaż następne rozwiązanie"
            onClick={() => setActiveIndex((current) => Math.min(displayedSolutions.length - 1, current + 1))}
            variant="tertiary"
          />
        </div>
      </div>

      <Dialog
        description="Zmień opis, aby ponownie przygotować dopasowania innowacji ROPS."
        onOpenChange={setIsDialogOpen}
        open={isDialogOpen}
        title="Zmodyfikuj opis"
      >
        <form className="solution-matcher__dialog-form" noValidate onSubmit={handleDescriptionUpdate}>
          <TextAreaField
            error={dialogError}
            label="Opis potrzeby"
            maxLength={500}
            onChange={(event) => setDraftDescription(event.target.value)}
            required
            rows={6}
            showCharacterCount
            value={draftDescription}
          />
          <div className="dialog__actions">
            <Button onClick={() => setIsDialogOpen(false)} type="button" variant="tertiary">
              Anuluj
            </Button>
            <Button trailingIcon={MagicWand} type="submit">
              Dopasuj ponownie
            </Button>
          </div>
        </form>
      </Dialog>
    </section>
  );
}
