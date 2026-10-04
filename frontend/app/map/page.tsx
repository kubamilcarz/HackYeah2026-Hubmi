import type { Metadata } from "next";
import Link from "next/link";
import { HubShell } from "@/components/hub/HubShell";
import { Map } from "@/components/ui/Map";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, mapMarkers } from "@/lib/map-data";

export const metadata: Metadata = {
  title: "Mapa inicjatyw i partnerów | Splot",
  description: "Odkrywaj lokalne rozwiązania, partnerów i wydarzenia w Małopolsce.",
};

export default function MapPage() {
  return (
    <HubShell activeItem="map">
      <nav aria-label="Okruszki" className="hub-breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Mapa inicjatyw</span>
      </nav>
      <Map
        center={DEFAULT_MAP_CENTER}
        description="Znajdź lokalne rozwiązania, partnerów i wydarzenia blisko Ciebie w Małopolsce. Wybierz punkt na mapie lub z listy poniżej."
        headingLevel="h1"
        markers={mapMarkers}
        title="Mapa inicjatyw i partnerów"
        zoom={DEFAULT_MAP_ZOOM}
      />
    </HubShell>
  );
}
