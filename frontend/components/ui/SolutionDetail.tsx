import Image from "next/image";
import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react/lib";

import { Badge } from "@/components/ui/Tag";

export type SolutionDetailImage = { alt: string; src: string };

export type SolutionDetailHeroProps = {
  image: SolutionDetailImage;
  headingLevel?: "h1" | "h2" | "h3";
  matchLabel?: string;
  summary: string;
  title: string;
};

/** The identifying image, title and plain-language introduction for a solution. */
export function SolutionDetailHero({ headingLevel = "h1", image, matchLabel, summary, title }: SolutionDetailHeroProps) {
  const Heading = headingLevel;

  return <header className="solution-detail-hero"><div className="solution-detail-hero__media"><Image alt={image.alt} className="solution-detail-hero__image" fill priority sizes="(min-width: 64rem) 34rem, 100vw" src={image.src} /></div><div className="solution-detail-hero__content">{matchLabel && <Badge label={matchLabel} variant="success" />}<Heading className="type-h1 solution-detail-hero__title">{title}</Heading><p className="type-body solution-detail-hero__summary">{summary}</p></div></header>;
}

export type DetailMetadataItem = { icon?: Icon; label: string; value: ReactNode };
export type DetailMetadataSectionProps = { items: DetailMetadataItem[]; title: string };

/** A labelled group of supplementary solution details. */
export function DetailMetadataSection({ items, title }: DetailMetadataSectionProps) {
  return <section className="detail-metadata-section"><h4 className="type-h3 detail-metadata-section__title">{title}</h4><dl className="detail-metadata-section__list">{items.map(({ icon: Icon, label, value }) => <div className="detail-metadata-section__item" key={label}><dt className="detail-metadata-section__label">{Icon && <Icon aria-hidden="true" size={20} weight="bold" />}{label}</dt><dd className="detail-metadata-section__value">{value}</dd></div>)}</dl></section>;
}

export type SolutionDetailSidebarProps = { children: ReactNode; label?: string };

export function SolutionDetailSidebar({ children, label = "Szczegóły rozwiązania" }: SolutionDetailSidebarProps) {
  return <aside aria-label={label} className="solution-detail-sidebar">{children}</aside>;
}
