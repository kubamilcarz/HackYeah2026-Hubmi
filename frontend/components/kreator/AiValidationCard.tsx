"use client";

import {
  ArrowsClockwise,
  CheckCircle,
  Lightbulb,
  Sparkle,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Tag";
import type { AiValidationResult } from "@/lib/api";

type AiValidationCardProps = {
  result: AiValidationResult;
  onDismiss?: () => void;
  onApplyAiFix?: () => void;
  onRevalidate?: () => void;
  isFixing?: boolean;
  isValidating?: boolean;
  className?: string;
};

export function AiValidationCard({
  result,
  onDismiss,
  onApplyAiFix,
  onRevalidate,
  isFixing = false,
  isValidating = false,
  className = "",
}: AiValidationCardProps) {
  const isGood = result.status === "valid";
  const isWarning = result.status === "warning";

  const badgeVariant = isGood ? "success" : isWarning ? "warning" : "danger";
  const badgeLabel = isGood
    ? `Spełnia kryteria ROPS (${result.score}/100)`
    : isWarning
    ? `Wymaga doprecyzowania (${result.score}/100)`
    : `Wymaga głębszego opisu (${result.score}/100)`;

  const cardBorderClass = isGood
    ? "border-emerald-200 bg-emerald-50/70"
    : isWarning
    ? "border-amber-200 bg-amber-50/70"
    : "border-rose-200 bg-rose-50/70";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl border p-4 transition-all duration-200 ${cardBorderClass} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {isGood ? (
            <CheckCircle
              size={20}
              weight="fill"
              className="text-emerald-700 shrink-0 mt-0.5"
              aria-hidden="true"
            />
          ) : (
            <WarningCircle
              size={20}
              weight="fill"
              className={isWarning ? "text-amber-700 shrink-0 mt-0.5" : "text-rose-700 shrink-0 mt-0.5"}
              aria-hidden="true"
            />
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={badgeVariant} label={badgeLabel} />
              {result.source === "openai" && (
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  AI ROPS
                </span>
              )}
            </div>

            <h5 className="text-sm font-semibold text-slate-900 mt-1.5 leading-snug">
              {result.verdict}
            </h5>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              {result.summary}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Ukryj wynik walidacji AI"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0"
          >
            <X size={16} weight="bold" />
          </button>
        )}
      </div>

      {/* Mocne strony (gdy występują) */}
      {result.strengths && result.strengths.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-black/5 text-xs text-slate-700">
          <span className="font-semibold text-emerald-900">Mocne strony opisu:</span>
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-600">
            {result.strengths.map((str, idx) => (
              <li key={idx}>{str}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Punkty do poprawy i wskazówki */}
      {result.improvements && result.improvements.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-black/5 text-xs text-slate-700">
          <span className="font-semibold text-slate-900 flex items-center gap-1.5">
            <Lightbulb size={15} className="text-amber-600 shrink-0" weight="fill" />
            Wskazówki asystenta – co warto pogłębić:
          </span>
          <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-600">
            {result.improvements.map((imp, idx) => (
              <li key={idx} className="leading-normal">{imp}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Pytania ukierunkowujące */}
      {result.suggested_questions && result.suggested_questions.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-black/5 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">Pytania pomocnicze:</span>
          <ul className="mt-1 space-y-0.5 text-slate-600 italic">
            {result.suggested_questions.map((q, idx) => (
              <li key={idx}>„{q}”</li>
            ))}
          </ul>
        </div>
      )}

      {/* Akcje pod kartą */}
      {(onApplyAiFix || onRevalidate) && (
        <div className="mt-3.5 pt-2.5 border-t border-black/5 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {onApplyAiFix && !isGood && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leadingIcon={Sparkle}
                disabled={isFixing}
                onClick={onApplyAiFix}
              >
                {isFixing ? "Uzupełnianie z AI..." : "Uzupełnij za pomocą AI"}
              </Button>
            )}

            {onRevalidate && (
              <Button
                type="button"
                variant="tertiary"
                size="sm"
                leadingIcon={ArrowsClockwise}
                disabled={isValidating}
                onClick={onRevalidate}
              >
                {isValidating ? "Sprawdzanie..." : "Sprawdź ponownie"}
              </Button>
            )}
          </div>

          <span className="text-[11px] text-slate-500">
            Ocena wg kryteriów FERS 5.1
          </span>
        </div>
      )}
    </div>
  );
}
