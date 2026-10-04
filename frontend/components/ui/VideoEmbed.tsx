"use client";

import { useState } from "react";
import {
  ArrowSquareOut,
  Check,
  Copy,
  VideoCamera,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/Tag";

export type VideoEmbedProps = {
  url?: string;
  title: string;
  caption?: string;
  className?: string;
  showTranscriptBadge?: boolean;
};

/**
 * Extracts YouTube Video ID and start time from various formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 */
export function getYouTubeEmbedInfo(url?: string): {
  embedUrl: string | null;
  videoId: string | null;
} {
  if (!url) return { embedUrl: null, videoId: null };

  const trimmed = url.trim();

  // Try parsing with URL object
  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    let videoId: string | null = null;
    let startTime: string | null = null;

    if (parsed.hostname.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v");
      if (!videoId && parsed.pathname.startsWith("/embed/")) {
        videoId = parsed.pathname.replace("/embed/", "").split("/")[0];
      }
      startTime = parsed.searchParams.get("t") || parsed.searchParams.get("start");
    } else if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1).split("/")[0];
      startTime = parsed.searchParams.get("t") || parsed.searchParams.get("start");
    }

    if (videoId && /^[a-zA-Z0-9_-]{6,}$/.test(videoId)) {
      const startParam = startTime ? `&start=${parseInt(startTime, 10)}` : "";
      return {
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1${startParam}`,
        videoId,
      };
    }
  } catch {
    // If not standard URL, fallback to regex
  }

  // Regex fallback
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{6,})/);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      videoId,
    };
  }

  return { embedUrl: null, videoId: null };
}

export function VideoEmbed({
  url,
  title,
  caption,
  className = "",
  showTranscriptBadge = true,
}: VideoEmbedProps) {
  const [copied, setCopied] = useState(false);
  const { embedUrl } = getYouTubeEmbedInfo(url);

  async function handleCopy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback if clipboard API restricted
    }
  }

  if (!url || !embedUrl) {
    return (
      <div className={`video-embed ${className}`}>
        <div className="p-8 text-center flex flex-col items-center justify-center gap-3 bg-[var(--surface-subtle)]">
          <VideoCamera aria-hidden="true" className="text-[var(--content-muted)]" size={48} weight="duotone" />
          <p className="type-body font-semibold">{title}</p>
          <p className="type-caption text-[var(--content-secondary)]">
            {url
              ? "Wideo demonstracyjne jest w trakcie aktualizacji przez zespół ROPS."
              : "Brak udostępnionego nagrania wideo dla tego rozwiązania."}
          </p>
          {url && (
            <a
              className="button button--secondary button--sm mt-2"
              href={url}
              rel="noreferrer"
              target="_blank"
            >
              <ArrowSquareOut aria-hidden="true" size={16} />
              <span>Otwórz link zewnętrzny</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <figure aria-label={title} className={`video-embed ${className}`}>
      <div className="video-embed__player-container">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="video-embed__iframe"
          loading="lazy"
          src={embedUrl}
          title={`Odtwarzacz wideo: ${title}`}
        />
      </div>

      <figcaption className="video-embed__footer">
        <div className="video-embed__info">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="type-body font-semibold">{title}</span>
            {showTranscriptBadge && (
              <Badge label="WCAG 2.2 AA (PJM / Napisy)" variant="success" />
            )}
          </div>
          {caption && <p className="type-caption text-[var(--content-secondary)]">{caption}</p>}
        </div>

        <div className="video-embed__actions">
          <button
            aria-label="Kopiuj bezpośredni odnośnik do filmu"
            className="button button--secondary button--sm"
            onClick={handleCopy}
            type="button"
          >
            {copied ? (
              <>
                <Check aria-hidden="true" size={16} />
                <span>Skopiowano</span>
              </>
            ) : (
              <>
                <Copy aria-hidden="true" size={16} />
                <span>Kopiuj link</span>
              </>
            )}
          </button>

          <a
            aria-label={`Otwórz film "${title}" w serwisie YouTube w nowym oknie`}
            className="button button--secondary button--sm"
            href={url}
            rel="noreferrer"
            target="_blank"
          >
            <ArrowSquareOut aria-hidden="true" size={16} />
            <span>YouTube</span>
          </a>
        </div>
      </figcaption>
    </figure>
  );
}
