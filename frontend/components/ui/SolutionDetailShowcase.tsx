import { CheckCircle, MapPin, UsersThree } from "@phosphor-icons/react";
import { ExpandableDescription } from "@/components/ui/ExpandableDescription";
import { SolutionInterestActions } from "@/components/ui/SolutionInterestActions";
import { DetailMetadataSection, SolutionDetailHero, SolutionDetailSidebar } from "@/components/ui/SolutionDetail";
import { TabSwitcher } from "@/components/ui/TabSwitcher";
import { Badge, Tag } from "@/components/ui/Tag";

const description = "Cyfrowy Opiekun to innowacyjny program, który łączy wolontariuszy z seniorami, pomagając im w bezpiecznym i samodzielnym korzystaniu z usług online — od e-recept po kontakt z urzędem. Spotkania odbywają się w małych grupach i indywidualnie, w tempie dopasowanym do potrzeb każdej osoby.";

export function SolutionDetailShowcase() {
  return <article className="solution-detail"><SolutionDetailHero headingLevel="h3" image={{ alt: "Seniorzy uczący się korzystania z usług cyfrowych", src: "/solution-digital-education.svg" }} matchLabel="50% dopasowania" summary="Program wsparcia seniorów w korzystaniu z usług online." title="Cyfrowy Opiekun" /><div className="solution-detail__layout"><div className="solution-detail__main"><TabSwitcher label="Informacje o rozwiązaniu" items={[
    { id: "opis", label: "Opis", panel: <div className="solution-detail__tab-content"><ExpandableDescription description={description} /><SolutionInterestActions /></div> },
    { id: "jak-dziala", label: "Jak działa", panel: <p className="type-body">Wolontariusz pomaga seniorowi podczas bezpłatnych spotkań stacjonarnych lub online.</p> },
    { id: "efekty", label: "Efekty", panel: <p className="type-body">Uczestnicy zyskują większą samodzielność w codziennych sprawach wymagających internetu.</p> },
    { id: "do-pobrania", label: "Do pobrania", panel: <p className="type-body">Materiały dla uczestników będą dostępne po rozpoczęciu zapisów.</p> },
  ]} /></div><SolutionDetailSidebar><DetailMetadataSection items={[{ label: "Obszary", value: <div className="detail-metadata-section__tags"><Tag label="Seniorzy" variant="neutral" /><Tag label="Cyfryzacja" variant="neutral" /><Tag label="Edukacja" variant="neutral" /></div> }]} title="Kluczowe obszary" /><DetailMetadataSection items={[{ label: "Rodzaj", value: "Program edukacyjny" }]} title="Typ rozwiązania" /><DetailMetadataSection items={[{ icon: UsersThree, label: "Organizacja", value: "Fundacja Aktywni Razem" }, { icon: MapPin, label: "Lokalizacja", value: "Małopolskie" }]} title="Autorzy" /><DetailMetadataSection items={[{ icon: CheckCircle, label: "Publikacja", value: <Badge label="Widoczne" variant="success" /> }]} title="Status" /><DetailMetadataSection items={[{ icon: MapPin, label: "Dostępność", value: <Badge label="Tak" variant="success" /> }]} title="Możliwość działania" /></SolutionDetailSidebar></div></article>;
}
