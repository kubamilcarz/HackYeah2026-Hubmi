"use client";

import { useState } from "react";
import { ChartLineUp, DownloadSimple, HandHeart, MapPin, UsersThree } from "@phosphor-icons/react";
import type { Solution } from "@/lib/solutions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ExpandableDescription } from "@/components/ui/ExpandableDescription";
import { DetailMetadataSection, SolutionDetailSidebar } from "@/components/ui/SolutionDetail";
import { FavoriteButton } from "@/components/ui/SolutionInterestActions";
import { Badge, Tag } from "@/components/ui/Tag";
import { TabSwitcher } from "@/components/ui/TabSwitcher";

export function SolutionDetailContent({ solution }: { solution: Solution }) {
  const [contacted, setContacted] = useState(false);

  return <div className="solution-detail__layout">
    <div className="solution-detail__main">
      <TabSwitcher label="Informacje o rozwiązaniu" items={[
        { id: "opis", label: "Opis", panel: <section className="solution-detail__tab-content"><div className="solution-detail__overview"><div><h2 className="type-h2">O rozwiązaniu</h2><ExpandableDescription description={solution.description} previewLength={210} /></div><div className="solution-detail__actions"><Button aria-pressed={contacted} leadingIcon={HandHeart} onClick={() => setContacted((value) => !value)}>{contacted ? "Zainteresowanie zapisane" : "Skontaktuj się"}</Button><FavoriteButton /></div></div>{contacted && <Alert description="To demonstracja — kontakt nie został jeszcze przekazany organizacji." title="Zainteresowanie zapisane lokalnie" variant="info" />}</section> },
        { id: "jak-dziala", label: "Jak działa", panel: <section className="solution-detail__tab-content"><h2 className="type-h2">Jak działa program</h2><ol className="solution-detail__steps"><li><strong>Rozmowa wstępna</strong><span>Wspólnie ustalacie, jakiego wsparcia potrzebujesz.</span></li><li><strong>Dobór formy pomocy</strong><span>Organizacja proponuje spotkania lub działania dopasowane do sytuacji.</span></li><li><strong>Wsparcie w działaniu</strong><span>Otrzymujesz pomoc w bezpiecznym, własnym tempie.</span></li></ol></section> },
        { id: "efekty", label: "Efekty", panel: <section className="solution-detail__tab-content"><h2 className="type-h2">Co może się zmienić</h2><div className="solution-detail__outcomes"><div><ChartLineUp aria-hidden="true" size={28} weight="duotone" /><strong>Więcej samodzielności</strong><span>Praktyczne umiejętności przydatne na co dzień.</span></div><div><UsersThree aria-hidden="true" size={28} weight="duotone" /><strong>Wsparcie blisko ludzi</strong><span>Kontakt z osobami, które rozumieją sytuację.</span></div></div></section> },
        { id: "do-pobrania", label: "Do pobrania", panel: <section className="solution-detail__tab-content"><h2 className="type-h2">Materiały</h2><Alert description="Materiały informacyjne do tego rozwiązania są jeszcze przygotowywane." title="Brak plików do pobrania" variant="info" /><Button disabled leadingIcon={DownloadSimple}>Pobierz materiały</Button></section> },
      ]} />
    </div>
    <SolutionDetailSidebar label="Kluczowe informacje o rozwiązaniu">
      <DetailMetadataSection items={[{ label: "Obszary", value: <span className="detail-metadata-section__tags">{solution.categories.map((category) => <Tag key={category} label={category} variant="success" />)}</span> }]} title="Kluczowe obszary" />
      <DetailMetadataSection items={[{ label: "Typ rozwiązania", value: "Program społeczny" }, { icon: UsersThree, label: "Autorzy", value: solution.organization }, { icon: MapPin, label: "Lokalizacja", value: solution.locality }]} title="Informacje" />
      <DetailMetadataSection items={[{ label: "Status", value: <Badge label={solution.availability} variant="success" /> }, { label: "Możliwość skalowania", value: <Badge label="Tak" variant="success" /> }]} title="Dostępność" />
    </SolutionDetailSidebar>
  </div>;
}
