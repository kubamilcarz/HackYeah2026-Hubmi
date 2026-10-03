"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react/lib";
import type { MouseEventHandler } from "react";
import { IconButton } from "@/components/ui/Button";
import { SearchField } from "@/components/ui/FormControls";

export type PageNavigationAction = {
  disabled?: boolean;
  icon: Icon;
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export type PageNavigationSearch = {
  action?: string;
  defaultValue?: string;
  label?: string;
  placeholder?: string;
  queryName?: string;
};

export type PageNavigationProfile = {
  href?: string;
  imageSrc?: string;
  initials: string;
  label: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export type PageNavigationBarProps = {
  actions?: PageNavigationAction[];
  backDisabled?: boolean;
  backLabel?: string;
  className?: string;
  onBack?: MouseEventHandler<HTMLButtonElement>;
  profile?: PageNavigationProfile;
  search?: PageNavigationSearch;
  title?: string;
};

export function PageNavigationBar({
  actions = [],
  backDisabled = false,
  backLabel = "Wróć",
  className,
  onBack,
  profile,
  search,
  title,
}: PageNavigationBarProps) {
  const searchLabel = search?.label ?? "Szukaj w Splot";

  return (
    <header className={`page-navigation-bar${className ? ` ${className}` : ""}`}>
      <div className="page-navigation-bar__main">
        {onBack && (
          <IconButton
            className="page-navigation-bar__button"
            disabled={backDisabled}
            icon={ArrowLeft}
            label={backLabel}
            onClick={onBack}
            variant="tertiary"
          />
        )}
        {search ? (
          <form action={search.action ?? "/search"} className="page-navigation-bar__search" method="get" role="search">
            <SearchField
              defaultValue={search.defaultValue}
              hideLabel
              label={searchLabel}
              name={search.queryName ?? "q"}
              placeholder={search.placeholder ?? "Szukaj rozwiązań, tematów, osób..."}
            />
            <button className="sr-only" type="submit">Szukaj</button>
          </form>
        ) : title ? <p className="page-navigation-bar__title">{title}</p> : null}
      </div>

      {(actions.length > 0 || profile) && (
        <div className="page-navigation-bar__actions">
          {actions.map((action) => (
          <IconButton
            className="page-navigation-bar__button"
            disabled={action.disabled}
            icon={action.icon}
            key={action.label}
            label={action.label}
            onClick={action.onClick}
            variant="tertiary"
          />
          ))}
          {profile && (
            profile.href ? (
              <Link aria-label={profile.label} className="page-navigation-bar__profile" href={profile.href}>
                {profile.imageSrc ? (
                  // The profile link itself supplies the accessible name.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" src={profile.imageSrc} />
                ) : <span aria-hidden="true">{profile.initials}</span>}
              </Link>
            ) : (
              <button aria-label={profile.label} className="page-navigation-bar__profile" onClick={profile.onClick} type="button">
                {profile.imageSrc ? (
                  // The button itself supplies the accessible name.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" src={profile.imageSrc} />
                ) : <span aria-hidden="true">{profile.initials}</span>}
              </button>
            )
          )}
        </div>
      )}
    </header>
  );
}
