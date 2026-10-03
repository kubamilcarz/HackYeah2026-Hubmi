"use client";

import mapboxgl from "mapbox-gl";
import { X } from "@phosphor-icons/react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { IconButton } from "@/components/ui/Button";
import { SearchField } from "@/components/ui/FormControls";
import { Tag } from "@/components/ui/Tag";

export type MapPosition = {
  lat: number;
  lng: number;
};

export type MapMarkerTone = "info" | "success" | "warning" | "danger";
export type MapMarkerType = "solution" | "partner" | "event";

export type MapMarker = {
  categories?: string[];
  description?: string;
  id: string;
  position: MapPosition;
  title: string;
  tone?: MapMarkerTone;
  type?: MapMarkerType;
};

export type MapProps = {
  ariaLabel?: string;
  center?: MapPosition;
  className?: string;
  description?: string;
  markers?: MapMarker[];
  onProfileClick?: (marker: MapMarker) => void;
  styleUrl?: string;
  title?: string;
  zoom?: number;
};

type MapFilter = "all" | MapMarkerType;

const TAURON_ARENA_KRAKOW: MapPosition = { lat: 50.0674, lng: 19.9915 };
const EMPTY_MARKERS: MapMarker[] = [];
const DEFAULT_STYLE_URL = "mapbox://styles/mapbox/standard";

const FILTERS: { label: string; value: MapFilter }[] = [
  { label: "Wszystkie", value: "all" },
  { label: "Rozwiązania", value: "solution" },
  { label: "Partnerzy", value: "partner" },
  { label: "Wydarzenia", value: "event" },
];

const TYPE_LABELS: Record<MapMarkerType, string> = {
  solution: "Rozwiązanie",
  partner: "Partner",
  event: "Wydarzenie",
};

function getMarkerType(marker: MapMarker): MapMarkerType {
  return marker.type ?? "partner";
}

function normalized(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pl-PL");
}

function SelectedMarkerCard({
  className,
  marker,
  onClose,
  onProfileClick,
}: {
  className?: string;
  marker: MapMarker;
  onClose: () => void;
  onProfileClick?: (marker: MapMarker) => void;
}) {
  const type = getMarkerType(marker);

  return (
    <section aria-live="polite" className={`map__selected-card${className ? ` ${className}` : ""}`}>
      <div className="map__selected-card-heading">
        <h3 className="type-h3">{marker.title}</h3>
        <IconButton icon={X} label={`Zamknij informacje o: ${marker.title}`} onClick={onClose} size="sm" variant="tertiary" />
      </div>
      <div className="map__selected-card-tags">
        <Tag label={TYPE_LABELS[type]} variant="success" />
        {marker.categories?.map((category) => <Tag key={category} label={category} variant="neutral" />)}
      </div>
      {marker.description && <p className="type-caption map__selected-card-description">{marker.description}</p>}
      {onProfileClick && <button className="map__profile-action" onClick={() => onProfileClick(marker)} type="button">Zobacz profil</button>}
    </section>
  );
}

export function Map({
  ariaLabel = "Mapa inicjatyw i partnerów",
  center = TAURON_ARENA_KRAKOW,
  className,
  description = "Zobacz, co dzieje się w Twojej okolicy.",
  markers = EMPTY_MARKERS,
  onProfileClick,
  styleUrl = DEFAULT_STYLE_URL,
  title = "Mapa inicjatyw i partnerów",
  zoom = 16,
}: MapProps) {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(Boolean(accessToken));
  const [isMapReady, setIsMapReady] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<MapFilter>("all");
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>();
  const listId = useId();
  const filterId = useId();

  const filteredMarkers = useMemo(() => {
    const queryValue = normalized(query.trim());

    return markers.filter((marker) => {
      const matchesType = selectedFilter === "all" || getMarkerType(marker) === selectedFilter;
      const searchable = normalized([marker.title, marker.description, TYPE_LABELS[getMarkerType(marker)], ...(marker.categories ?? [])].filter(Boolean).join(" "));
      return matchesType && (!queryValue || searchable.includes(queryValue));
    });
  }, [markers, query, selectedFilter]);

  const selectedMarker = useMemo(
    () => filteredMarkers.find((marker) => marker.id === selectedMarkerId),
    [filteredMarkers, selectedMarkerId],
  );
  const configurationError = !accessToken
    ? "Mapa nie jest jeszcze skonfigurowana. Skorzystaj z listy inicjatyw i partnerów poniżej."
    : undefined;

  const selectMarker = useCallback((marker: MapMarker) => {
    setSelectedMarkerId(marker.id);
    mapRef.current?.flyTo({ center: [marker.position.lng, marker.position.lat] });
  }, []);

  function resetFilters() {
    setQuery("");
    setSelectedFilter("all");
    setSelectedMarkerId(undefined);
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
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const handleLoad = () => {
      setError(undefined);
      setIsLoading(false);
      setIsMapReady(true);
    };
    const handleError = (event: mapboxgl.ErrorEvent) => {
      setError(event.error.message || "Nie udało się wczytać mapy. Spróbuj ponownie później.");
      setIsLoading(false);
    };

    map.on("load", handleLoad);
    map.on("error", handleError);

    return () => {
      setIsMapReady(false);
      map.remove();
      mapRef.current = null;
    };
  }, [accessToken, center, styleUrl, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;

    const mapMarkers = filteredMarkers.map((marker) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className = `map__pin map__pin--${marker.tone ?? "info"}`;
      element.setAttribute("aria-label", `Pokaż: ${marker.title}, ${TYPE_LABELS[getMarkerType(marker)]}`);
      element.addEventListener("click", () => selectMarker(marker));

      return new mapboxgl.Marker({ element })
        .setLngLat([marker.position.lng, marker.position.lat])
        .addTo(map);
    });

    return () => mapMarkers.forEach((marker) => marker.remove());
  }, [filteredMarkers, isMapReady, selectMarker]);

  return (
    <section className={`map${className ? ` ${className}` : ""}`} aria-label={ariaLabel}>
      <header className="map__header">
        <div className="map__heading">
          <h2 className="type-h2">{title}</h2>
          <p className="type-body">{description}</p>
        </div>
        <div className="map__discovery-controls">
          <SearchField hideLabel label="Szukaj inicjatyw i partnerów" onChange={(event) => { setQuery(event.target.value); setSelectedMarkerId(undefined); }} placeholder="Szukaj inicjatyw…" value={query} />
          <fieldset className="map__filters">
            <legend className="sr-only" id={filterId}>Typ punktu na mapie</legend>
            <div aria-labelledby={filterId} className="map__filter-options">
              {FILTERS.map((filter) => (
                <label className="map__filter-option" key={filter.value}>
                  <input checked={selectedFilter === filter.value} name={`map-filter-${filterId}`} onChange={() => { setSelectedFilter(filter.value); setSelectedMarkerId(undefined); }} type="radio" value={filter.value} />
                  <span>{filter.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </header>

      <div className="map__canvas-wrap">
        <div aria-label={ariaLabel} className="map__canvas" ref={containerRef} role="region" tabIndex={0} />
        {isLoading && !configurationError && <p className="map__status" role="status">Wczytywanie mapy…</p>}
        {(configurationError ?? error) && <p className="map__status map__status--error" role="alert">{configurationError ?? error}</p>}
        {selectedMarker && <SelectedMarkerCard className="map__selected-card--desktop" marker={selectedMarker} onClose={() => setSelectedMarkerId(undefined)} onProfileClick={onProfileClick} />}
      </div>

      {selectedMarker && <SelectedMarkerCard className="map__selected-card--mobile" marker={selectedMarker} onClose={() => setSelectedMarkerId(undefined)} onProfileClick={onProfileClick} />}

      <div className="map__supporting-content">
        {filteredMarkers.length > 0 ? (
          <div>
            <h3 className="type-h3" id={listId}>Punkty na mapie</h3>
            <ul aria-labelledby={listId} className="map__marker-list">
              {filteredMarkers.map((marker) => (
                <li key={marker.id}>
                  <button
                    aria-pressed={selectedMarkerId === marker.id}
                    className="map__marker-button"
                    onClick={() => selectMarker(marker)}
                    type="button"
                  >
                    <span className={`map__marker-tone map__marker-tone--${marker.tone ?? "info"}`} aria-hidden="true" />
                    <span className="map__marker-button-copy"><span>{marker.title}</span><small>{TYPE_LABELS[getMarkerType(marker)]}</small></span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="map__empty" role="status">
            <p className="type-body">Nie znaleziono punktów spełniających te kryteria.</p>
            <button className="map__reset" onClick={resetFilters} type="button">Wyczyść wyszukiwanie i filtry</button>
          </div>
        )}
      </div>
    </section>
  );
}
