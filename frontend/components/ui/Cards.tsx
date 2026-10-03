import Image from "next/image";
import { ArrowRight, CheckCircle, HandHeart, Heart, MapPin, ShieldCheck, Sparkle, UsersThree } from "@phosphor-icons/react/ssr";
import { Badge, Tag, type TagVariant } from "@/components/ui/Tag";

export type CardAction = { href: string; label: string };
export type CardStatus = { label: string; variant?: TagVariant };
type CardClassName = { className?: string };

function cardClassName(name: string, className?: string) {
  return `${name}${className ? ` ${className}` : ""}`;
}

function CardActionLink({ action, primary = false }: { action: CardAction; primary?: boolean }) {
  return <a className={`card__action${primary ? " card__action--primary" : ""}`} href={action.href}><span>{action.label}</span><ArrowRight aria-hidden="true" size={20} weight="bold" /></a>;
}

function Status({ status }: { status: CardStatus }) {
  return <Badge label={status.label} variant={status.variant ?? "neutral"} />;
}

export type NeedCardProps = CardClassName & {
  action: CardAction; category: string; locality: string; status: CardStatus; summary: string; title: string; updatedAt: string;
};

export function NeedCard({ action, category, className, locality, status, summary, title, updatedAt }: NeedCardProps) {
  return <article className={cardClassName("card card--need", className)}>
    <div className="card__meta"><Tag label={category} variant="info" /><Status status={status} /></div>
    <h3 className="card__title">{title}</h3><p className="card__summary">{summary}</p>
    <p className="card__location"><MapPin aria-hidden="true" size={18} weight="bold" />{locality}</p>
    <p className="card__updated">Aktualizacja: {updatedAt}</p><CardActionLink action={action} />
  </article>;
}

export type SolutionCardProps = CardClassName & {
  action: CardAction;
  availability: string;
  category: string;
  engagement?: { likes: number; matches: number };
  image?: { alt: string; src: string };
  organization: string;
  summary: string;
  title: string;
};

export function SolutionCard({ action, availability, category, className, engagement, image, organization, summary, title }: SolutionCardProps) {
  return <article className={cardClassName("card card--solution", className)}>
    <div className="card__media">{image ? <Image alt={image.alt} className="card__image" fill sizes="(min-width: 40rem) 50vw, 100vw" src={image.src} /> : <HandHeart aria-hidden="true" size={48} weight="duotone" />}
      <Badge className="card__kind" label="Rozwiązanie" variant="success" />
    </div>
    <div className="card__content"><span className="card__availability"><CheckCircle aria-hidden="true" size={16} weight="fill" />{availability}</span>
      <h3 className="card__title">{title}</h3><p className="card__organization">{organization}</p><p className="card__summary">{summary}</p><Tag label={category} variant="success" />
      {engagement && <div aria-label={`Reakcje: ${engagement.likes}; dopasowania: ${engagement.matches}`} className="card__engagement"><span><Heart aria-hidden="true" size={20} weight="bold" />{engagement.likes}</span><span><Sparkle aria-hidden="true" size={20} weight="bold" />{engagement.matches}</span></div>}
    </div><CardActionLink action={action} />
  </article>;
}

export type OrganizationCardProps = CardClassName & {
  action: CardAction; locality: string; name: string; organizationType: string; services: { label: string; variant?: TagVariant }[];
};

export function OrganizationCard({ action, className, locality, name, organizationType, services }: OrganizationCardProps) {
  return <article className={cardClassName("card card--organization", className)}>
    <div className="card__profile-heading"><span aria-hidden="true" className="card__avatar card__avatar--accent"><UsersThree size={24} weight="bold" /></span>
      <div><h3 className="card__title">{name}</h3><p className="card__organization">{organizationType}</p></div>
    </div><p className="card__location"><MapPin aria-hidden="true" size={18} weight="bold" />{locality}</p>
    <div className="card__tags">{services.map((service) => <Tag key={service.label} {...service} />)}</div><CardActionLink action={action} />
  </article>;
}

export type MatchSummaryProps = CardClassName & { action: CardAction; matchCount: number; needTitle: string; summary: string };

export function MatchSummary({ action, className, matchCount, needTitle, summary }: MatchSummaryProps) {
  return <article className={cardClassName("card card--match-summary", className)}>
    <p className="card__eyebrow">Dopasowane rozwiązania</p><h3 className="card__title">{needTitle}</h3>
    <p className="card__match-count">{matchCount} {matchCount === 1 ? "możliwość wsparcia" : "możliwości wsparcia"}</p><p className="card__summary">{summary}</p><CardActionLink action={action} primary />
  </article>;
}

export type ContactActionProps = CardClassName & { action: CardAction; contactMethod: string; organization: string; safetyNote: string };

export function ContactAction({ action, className, contactMethod, organization, safetyNote }: ContactActionProps) {
  return <aside className={cardClassName("contact-action", className)} aria-label={`Kontakt z organizacją ${organization}`}>
    <ShieldCheck aria-hidden="true" size={28} weight="fill" /><div><h3 className="type-h3">Skontaktuj się bezpośrednio</h3><p>{organization} odpowiada przez {contactMethod}. {safetyNote}</p></div><CardActionLink action={action} primary />
  </aside>;
}

export type ModerationStatusProps = CardClassName & CardStatus & { description: string };

export function ModerationStatus({ className, description, label, variant = "neutral" }: ModerationStatusProps) {
  return <div className={cardClassName("moderation-status", className)} role="status"><Status status={{ label, variant }} /><p>{description}</p></div>;
}
