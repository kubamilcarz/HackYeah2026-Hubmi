"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, MagicWand, PencilSimple, Sparkle } from "@phosphor-icons/react";
import type { Solution } from "@/lib/solutions";
import { Dialog } from "@/components/ui/Dialog";
import { Button, IconButton } from "@/components/ui/Button";
import { FavoriteButton } from "@/components/ui/SolutionInterestActions";
import { LinearProgress } from "@/components/ui/Progress";
import { SolutionCard } from "@/components/ui/Cards";
import { TextAreaField } from "@/components/ui/FormControls";

type MatcherPhase = "prompt" | "processing" | "results";

type SolutionMatcherProps = {
  initialDescription?: string;
  solutions: Solution[];
};

const processingStages = [
  { label: "Czytamy opis potrzeby", threshold: 0 },
  { label: "Szukamy lokalnych działań", threshold: 34 },
  { label: "Porównujemy możliwości wsparcia", threshold: 67 },
  { label: "Przygotowujemy przykładowe dopasowania", threshold: 94 },
];

function currentStage(progress: number) {
  return [...processingStages].reverse().find((stage) => progress >= stage.threshold) ?? processingStages[0];
}

export function SolutionMatcher({ initialDescription = "", solutions }: SolutionMatcherProps) {
  const [description, setDescription] = useState(initialDescription);
  const [draftDescription, setDraftDescription] = useState(initialDescription);
  const [error, setError] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [phase, setPhase] = useState<MatcherPhase>("prompt");
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (phase !== "processing") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      const completion = window.setTimeout(() => {
        setProgress(100);
        setPhase("results");
      }, 250);
      return () => window.clearTimeout(completion);
    }

    const duration = 2600;
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
    return () => window.cancelAnimationFrame(frame);
  }, [phase]);

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

  if (phase === "prompt") {
    return <section aria-labelledby="solution-prompt-heading" className="solution-matcher solution-matcher--prompt">
      <div className="solution-matcher__intro"><MagicWand aria-hidden="true" size={36} weight="duotone" /><div><h2 className="type-h2" id="solution-prompt-heading">Czego teraz potrzebujesz?</h2><p className="type-body">Opisz swoją sytuację własnymi słowami. Pokażemy przykładowe rozwiązania, które mogą być pomocne.</p></div></div>
      <form className="solution-matcher__form" noValidate onSubmit={handleInitialSubmit}>
        <TextAreaField error={error} label="Opis potrzeby" maxLength={500} onChange={(event) => setDescription(event.target.value)} placeholder="Na przykład: Szukam wsparcia w codziennym korzystaniu z internetu dla starszej osoby…" required rows={6} showCharacterCount value={description} />
        <Button trailingIcon={ArrowRight} type="submit">Znajdź rozwiązania</Button>
      </form>
    </section>;
  }

  if (phase === "processing") {
    const stage = currentStage(progress);
    return <section aria-labelledby="matching-progress-heading" className="solution-matcher solution-matcher--processing">
      <div aria-hidden="true" className="solution-matcher__magic"><Sparkle size={52} weight="fill" /><MagicWand size={42} weight="duotone" /></div>
      <h2 className="type-h2" id="matching-progress-heading">Dopasowujemy rozwiązania</h2>
      <p aria-live="polite" className="type-body solution-matcher__status">{stage.label}</p>
      <LinearProgress label="Postęp dopasowywania" value={progress} variant="success" valueLabel={`${progress}%`} />
      <p className="type-caption solution-matcher__note">To lokalny podgląd przykładowych dopasowań — opis nie jest nigdzie wysyłany.</p>
    </section>;
  }

  return <section aria-labelledby="matching-results-heading" className="solution-matcher solution-matcher--results">
    <div className="solution-matcher__results-header"><div><h2 className="type-h2" id="matching-results-heading" ref={resultsHeadingRef} tabIndex={-1}>Dopasowane rozwiązania</h2><p className="type-body">Na podstawie Twojego opisu znaleźliśmy {solutions.length} przykładowych rozwiązań.</p></div><Button leadingIcon={PencilSimple} onClick={openEditDialog} variant="tertiary">Zmodyfikuj opis</Button></div>
    <div aria-label="Karuzela dopasowanych rozwiązań" className="solution-carousel">
      <div className="solution-carousel__viewport">
        <div className="solution-carousel__track">
          {solutions.map((solution, index) => <div className="solution-carousel__slide" key={solution.slug} ref={(element) => { slideRefs.current[index] = element; }}><div className="solution-carousel__card"><SolutionCard action={{ href: `/solutions/${solution.slug}`, label: "Zobacz szczegóły" }} availability={solution.availability} category={solution.categories[0]} image={solution.image} match={{ label: `${solution.matchScore}% dopasowania`, score: solution.matchScore }} organization={solution.organization} summary={solution.summary} title={solution.title} /><FavoriteButton /></div></div>)}
        </div>
      </div>
      <div className="solution-carousel__controls"><IconButton disabled={activeIndex === 0} icon={ArrowLeft} label="Pokaż poprzednie rozwiązanie" onClick={() => setActiveIndex((current) => Math.max(0, current - 1))} variant="tertiary" /><div aria-label="Wybór rozwiązania" className="solution-carousel__pages">{solutions.map((solution, index) => <button aria-current={index === activeIndex ? "true" : undefined} aria-label={`Pokaż rozwiązanie ${index + 1}: ${solution.title}`} className="solution-carousel__page" key={solution.slug} onClick={() => setActiveIndex(index)} type="button"><span className="sr-only">{solution.title}</span></button>)}</div><IconButton disabled={activeIndex === solutions.length - 1} icon={ArrowRight} label="Pokaż następne rozwiązanie" onClick={() => setActiveIndex((current) => Math.min(solutions.length - 1, current + 1))} variant="tertiary" /></div>
    </div>
    <Dialog description="Zmień opis, aby ponownie przygotować przykładowe dopasowania." onOpenChange={setIsDialogOpen} open={isDialogOpen} title="Zmodyfikuj opis">
      <form className="solution-matcher__dialog-form" noValidate onSubmit={handleDescriptionUpdate}><TextAreaField error={dialogError} label="Opis potrzeby" maxLength={500} onChange={(event) => setDraftDescription(event.target.value)} required rows={6} showCharacterCount value={draftDescription} /><div className="dialog__actions"><Button onClick={() => setIsDialogOpen(false)} type="button" variant="tertiary">Anuluj</Button><Button trailingIcon={MagicWand} type="submit">Dopasuj ponownie</Button></div></form>
    </Dialog>
  </section>;
}
