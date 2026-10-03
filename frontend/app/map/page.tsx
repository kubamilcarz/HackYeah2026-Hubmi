import type { Metadata } from "next";
import Link from "next/link";
import { HubShell } from "@/components/hub/HubShell";
import { Map, type MapMarker } from "@/components/ui/Map";

export const metadata: Metadata = {
  title: "Mapa inicjatyw i partnerów | Splot",
  description: "Odkrywaj lokalne rozwiązania, partnerów i wydarzenia w Małopolsce.",
};

const markers: MapMarker[] = [
  {
    id: "centrum-uslug-spolecznych-wieliczka",
    title: "Centrum Usług Społecznych Wieliczka",
    description: "Wsparcie dla mieszkańców i lokalnych organizacji.",
    categories: ["Partner", "Usługi społeczne"],
    position: { lat: 49.987, lng: 20.064 },
    tone: "success",
    type: "partner",
  },
  {
    id: "fundacja-sasiedzi",
    title: "Fundacja Sąsiedzi",
    description: "Sąsiedzka pomoc dla osób starszych i opiekunów.",
    categories: ["Seniorzy", "Sąsiedztwo"],
    position: { lat: 50.047, lng: 19.944 },
    tone: "success",
    type: "partner",
  },
  {
    id: "cyfrowy-klub-seniora",
    title: "Cyfrowy klub seniora",
    description: "Bezpłatne spotkania z pomocą w korzystaniu z internetu.",
    categories: ["Seniorzy", "Edukacja cyfrowa"],
    position: { lat: 50.061, lng: 19.937 },
    tone: "warning",
    type: "event",
  },
  {
    id: "centrum-integracji",
    title: "Centrum Integracji",
    description: "Doradztwo i kursy języka polskiego dla nowych mieszkańców.",
    categories: ["Integracja", "Edukacja"],
    position: { lat: 50.055, lng: 19.958 },
    tone: "info",
    type: "solution",
  },
  {
    id: "mobilne-wsparcie-opiekunow",
    title: "Mobilne wsparcie opiekunów",
    description: "Konsultacje i pomoc w codziennych sprawach opiekuńczych.",
    categories: ["Opieka", "Zdrowie"],
    position: { lat: 50.075, lng: 19.912 },
    tone: "danger",
    type: "solution",
  },
];

export default function MapPage() {
  return (
    <HubShell activeItem="map">
      <nav aria-label="Okruszki" className="hub-breadcrumbs">
        <Link href="/">Strona główna</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Mapa inicjatyw</span>
      </nav>
      <Map
        center={{ lat: 50.049, lng: 19.944 }}
        description="Znajdź lokalne rozwiązania, partnerów i wydarzenia blisko Ciebie. Wybierz punkt na mapie lub z listy poniżej."
        headingLevel="h1"
        markers={markers}
        title="Mapa inicjatyw i partnerów"
        zoom={10.5}
      />
    </HubShell>
  );
}
