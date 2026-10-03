import { ButtonLink } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";

export type ConnectionListEntry = {
  action: { href: string; label: string };
  avatar?: { initials: string; src?: string };
  id: string;
  name: string;
  organization: string;
  tags: string[];
};

export type ConnectionListProps = {
  ariaLabel: string;
  className?: string;
  entries: ConnectionListEntry[];
};

/**
 * A headerless directory of people and organisations with a clear contact
 * action. Use it when each row has the same compact profile structure.
 */
export function ConnectionList({ ariaLabel, className, entries }: ConnectionListProps) {
  return (
    <ul aria-label={ariaLabel} className={`connection-list${className ? ` ${className}` : ""}`}>
      {entries.map((entry) => (
        <li className="connection-list__row" key={entry.id}>
          <div className="connection-list__profile">
            {entry.avatar?.src ? (
              // The adjacent text already names the person or organisation.
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="connection-list__avatar" src={entry.avatar.src} />
            ) : (
              <span aria-hidden="true" className="connection-list__avatar connection-list__avatar--initials">{entry.avatar?.initials ?? entry.name.slice(0, 1)}</span>
            )}
            <div>
              <h3 className="connection-list__name">{entry.name}</h3>
              <p className="connection-list__organization">{entry.organization}</p>
            </div>
          </div>
          <ul aria-label={`Obszary działania: ${entry.name}`} className="connection-list__tags">
            {entry.tags.map((tag) => <li key={tag}><Tag label={tag} variant="neutral" /></li>)}
          </ul>
          <ButtonLink className="connection-list__action" href={entry.action.href} variant="secondary">{entry.action.label}</ButtonLink>
        </li>
      ))}
    </ul>
  );
}
