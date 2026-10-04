"use client";

import { useState } from "react";
import {
  ArrowSquareOut,
  DownloadSimple,
  Eye,
  EyeSlash,
  FilePdf,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Tag";

export type PdfEmbedProps = {
  url: string;
  title: string;
  description?: string;
  fileSize?: string;
  className?: string;
  initialCollapsed?: boolean;
};

export function PdfEmbed({
  url,
  title,
  description,
  fileSize = "PDF",
  className = "",
  initialCollapsed = false,
}: PdfEmbedProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  return (
    <article aria-label={`Wbudowany dokument PDF: ${title}`} className={`pdf-embed ${className}`}>
      <header className="pdf-embed__header">
        <div className="pdf-embed__meta">
          <div className="pdf-embed__icon">
            <FilePdf aria-hidden="true" size={36} weight="duotone" />
          </div>
          <div className="pdf-embed__titles">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="type-h3 m-0">{title}</h4>
              <Badge label="Dokument dostępny cyfrowo" variant="info" />
            </div>
            <p className="type-caption text-[var(--content-secondary)] m-0">
              {description || `Oficjalny materiał ROPS Kraków • Format: PDF • Rozmiar: ${fileSize}`}
            </p>
          </div>
        </div>

        <div className="pdf-embed__actions">
          <button
            aria-expanded={!isCollapsed}
            className="button button--secondary button--sm"
            onClick={() => setIsCollapsed((prev) => !prev)}
            type="button"
          >
            {isCollapsed ? (
              <>
                <Eye aria-hidden="true" size={16} />
                <span>Pokaż podgląd</span>
              </>
            ) : (
              <>
                <EyeSlash aria-hidden="true" size={16} />
                <span>Zwiń podgląd</span>
              </>
            )}
          </button>

          <a
            aria-label={`Otwórz plik ${title} w nowym oknie`}
            className="button button--secondary button--sm"
            href={url}
            rel="noreferrer"
            target="_blank"
          >
            <ArrowSquareOut aria-hidden="true" size={16} />
            <span>Pełne okno</span>
          </a>

          <a
            aria-label={`Pobierz plik ${title} na dysk`}
            className="button button--primary button--sm"
            download
            href={url}
          >
            <DownloadSimple aria-hidden="true" size={16} />
            <span>Pobierz PDF</span>
          </a>
        </div>
      </header>

      {!isCollapsed && (
        <div className="pdf-embed__viewport">
          <object
            aria-label={`Podgląd dokumentu PDF: ${title}`}
            className="pdf-embed__object"
            data={`${url}#toolbar=1&navpanes=0&view=FitH`}
            type="application/pdf"
          >
            <iframe
              className="pdf-embed__iframe"
              src={`${url}#toolbar=1`}
              title={`Wbudowany czytnik dokumentu: ${title}`}
            >
              <div className="pdf-embed__fallback">
                <FilePdf aria-hidden="true" className="text-[var(--action-primary)]" size={48} weight="duotone" />
                <p className="type-body font-semibold">Podgląd dokumentu PDF</p>
                <p className="type-caption max-w-md text-[var(--content-secondary)]">
                  Twoja przeglądarka nie obsługuje bezpośredniego podglądu plików PDF na tym urządzeniu. Możesz pobrać dokument na dysk lub otworzyć go w osobnej karcie.
                </p>
                <div className="flex gap-2 mt-2">
                  <a className="button button--primary button--sm" download href={url}>
                    <DownloadSimple aria-hidden="true" size={16} />
                    <span>Pobierz dokument</span>
                  </a>
                  <a className="button button--secondary button--sm" href={url} rel="noreferrer" target="_blank">
                    <ArrowSquareOut aria-hidden="true" size={16} />
                    <span>Otwórz w przeglądarce</span>
                  </a>
                </div>
              </div>
            </iframe>
          </object>
        </div>
      )}
    </article>
  );
}
