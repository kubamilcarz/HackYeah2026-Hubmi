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
          <iframe
            className="pdf-embed__iframe"
            loading="lazy"
            src={`${url}#toolbar=1&navpanes=0`}
            title={`Wbudowany czytnik dokumentu: ${title}`}
          />
        </div>
      )}

      <footer className="pdf-embed__footer">
        <p className="type-caption text-[var(--content-secondary)] m-0">
          Wskazówka: Jeśli Twoje urządzenie lub przeglądarka nie wyświetla wbudowanego podglądu PDF, skorzystaj z przycisku „Pełne okno” lub „Pobierz PDF”.
        </p>
      </footer>
    </article>
  );
}
