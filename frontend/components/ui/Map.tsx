"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export type MapPosition = {
  lat: number;
  lng: number;
};

export type MapMarkerTone = "info" | "success" | "warning" | "danger";

export type MapMarker = {
  id: string;
  position: MapPosition;
  title: string;
  description?: string;
  tone?: MapMarkerTone;
};

export type MapProps = {
  ariaLabel?: string;
  center?: MapPosition;
  className?: string;
  markers?: MapMarker[];
  styleUrl?: string;
  zoom?: number;
};

const TAURON_ARENA_KRAKOW: MapPosition = { lat: 50.0674, lng: 19.9915 };
const EMPTY_MARKERS: MapMarker[] = [];
const DEFAULT_STYLE_URL = "mapbox://styles/mapbox/standard";

export function Map({
  ariaLabel = "Mapa wsparcia",
  center = TAURON_ARENA_KRAKOW,
  className,
  markers = EMPTY_MARKERS,
  styleUrl = DEFAULT_STYLE_URL,
  zoom = 16,
}: MapProps) {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(Boolean(accessToken));
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>();
  const listId = useId();

  const selectedMarker = useMemo(
    () => markers.find((marker) => marker.id === selectedMarkerId),
    [markers, selectedMarkerId],
  );
  const configurationError = !accessToken
    ? "Mapa nie jest jeszcze skonfigurowana. Skorzystaj z listy organizacji poniżej."
    : undefined;

  function selectMarker(marker: MapMarker) {
    setSelectedMarkerId(marker.id);
    mapRef.current?.flyTo({ center: [marker.position.lng, marker.position.lat] });
  }

  useEffect(() => {
    if (!accessToken) return;

    const container = containerRef.current;
    if (!container) return;

    const map = new mapboxgl.Map({
      accessToken,
      center: [center.lng, center.lat],
      container,
      style: styleUrl,
      zoom,
    });
    const mapMarkers: mapboxgl.Marker[] = [];
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    markers.forEach((marker) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className = `map__pin map__pin--${marker.tone ?? "info"}`;
      element.setAttribute("aria-label", `Pokaż: ${marker.title}`);
      element.addEventListener("click", () => selectMarker(marker));

      mapMarkers.push(
        new mapboxgl.Marker({ element })
          .setLngLat([marker.position.lng, marker.position.lat])
          .addTo(map),
      );
    });

    const handleLoad = () => {
      setError(undefined);
      setIsLoading(false);
    };
    const handleError = (event: mapboxgl.ErrorEvent) => {
      setError(event.error.message || "Nie udało się wczytać mapy. Spróbuj ponownie później.");
      setIsLoading(false);
    };

    map.on("load", handleLoad);
    map.on("error", handleError);

    return () => {
      mapMarkers.forEach((marker) => marker.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [accessToken, center, markers, styleUrl, zoom]);

  return (
    <section className={`map${className ? ` ${className}` : ""}`} aria-label={ariaLabel}>
      <div className="map__canvas-wrap">
        <div aria-label={ariaLabel} className="map__canvas" ref={containerRef} role="region" />
        {isLoading && !configurationError && <p className="map__status" role="status">Wczytywanie mapy…</p>}
        {(configurationError ?? error) && <p className="map__status map__status--error" role="alert">{configurationError ?? error}</p>}
      </div>

      <div className="map__supporting-content">
        <div className="map__detail" aria-live="polite">
          {selectedMarker ? (
            <>
              <p className="type-caption font-semibold">{selectedMarker.title}</p>
              {selectedMarker.description && <p className="type-caption mt-1 text-[var(--content-secondary)]">{selectedMarker.description}</p>}
            </>
          ) : <p className="type-caption text-[var(--content-muted)]">Wybierz organizację z mapy lub listy.</p>}
        </div>

        {markers.length > 0 && (
          <div>
            <h3 className="type-h3" id={listId}>Organizacje na mapie</h3>
            <ul aria-labelledby={listId} className="map__marker-list">
              {markers.map((marker) => (
                <li key={marker.id}>
                  <button
                    aria-pressed={selectedMarkerId === marker.id}
                    className="map__marker-button"
                    onClick={() => selectMarker(marker)}
                    type="button"
                  >
                    <span className={`map__marker-tone map__marker-tone--${marker.tone ?? "info"}`} aria-hidden="true" />
                    <span>{marker.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
