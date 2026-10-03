import Image from "next/image";
import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react/lib";
import { ArrowRight } from "@phosphor-icons/react/ssr";

export type DiscoveryAction = { href: string; label: string };
export type QuickActionVariant = "primary" | "search" | "partners" | "knowledge";

export type QuickActionProps = DiscoveryAction & {
  icon: Icon;
  variant: QuickActionVariant;
};

export function QuickAction({ href, icon: Icon, label, variant }: QuickActionProps) {
  return <a className={`quick-action quick-action--${variant}`} href={href}><span aria-hidden="true" className="quick-action__icon"><Icon size={36} weight="bold" /></span><span>{label}</span></a>;
}

export type ContentSectionProps = {
  action: DiscoveryAction;
  children: ReactNode;
  className?: string;
  description?: string;
  title: string;
};

export function ContentSection({ action, children, className, description, title }: ContentSectionProps) {
  return <section className={`content-section${className ? ` ${className}` : ""}`}>
    <div className="content-section__header"><div><h3 className="type-h3">{title}</h3>{description && <p>{description}</p>}</div><a className="content-section__action" href={action.href}>{action.label}<ArrowRight aria-hidden="true" size={18} weight="bold" /></a></div>
    <div aria-label={title} className="content-section__scroll">{children}</div>
  </section>;
}

type DiscoveryCardImage = { alt: string; src: string };

function solutionCountLabel(solutionCount: number) {
  if (solutionCount === 1) return "rozwiązanie";

  const lastDigit = solutionCount % 10;
  const lastTwoDigits = solutionCount % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) return "rozwiązania";

  return "rozwiązań";
}

export type ChallengeCardProps = {
  href: string;
  image: DiscoveryCardImage;
  solutionCount: number;
  title: string;
};

export function ChallengeCard({ href, image, solutionCount, title }: ChallengeCardProps) {
  return <article className="discovery-card discovery-card--challenge"><a href={href}><div className="discovery-card__media"><Image alt={image.alt} fill sizes="(min-width: 64rem) 17rem, 76vw" src={image.src} /></div><h4>{title}</h4><p>{solutionCount} {solutionCountLabel(solutionCount)}</p></a></article>;
}

export type RecommendationCardProps = {
  category?: string;
  href: string;
  image: DiscoveryCardImage;
  organization: string;
  title: string;
};

export function RecommendationCard({ category, href, image, organization, title }: RecommendationCardProps) {
  return <article className="discovery-card discovery-card--recommendation"><a href={href}><div className="discovery-card__media"><Image alt={image.alt} fill sizes="(min-width: 64rem) 22rem, 82vw" src={image.src} /></div>{category && <p className="discovery-card__category">{category}</p>}<h4>{title}</h4><p>{organization}</p></a></article>;
}
