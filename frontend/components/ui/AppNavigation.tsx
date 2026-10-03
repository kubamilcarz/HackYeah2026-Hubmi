import Image from "next/image";
import Link from "next/link";
import type { Icon } from "@phosphor-icons/react/lib";

export type NavigationItem = {
  href: string;
  icon: Icon;
  id: string;
  label: string;
};

export type AppNavigationProps = {
  activeItem?: string;
  brandHref?: string;
  brandLabel?: string;
  items: NavigationItem[];
};

function NavigationLinks({
  activeItem,
  items,
}: {
  activeItem?: string;
  items: NavigationItem[];
}) {
  return (
    <ul className="app-navigation__list">
      {items.map(({ href, icon: Icon, id, label }) => {
        const isActive = id === activeItem;

        return (
          <li key={id}>
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`app-navigation__link${isActive ? " app-navigation__link--active" : ""}`}
              data-navigation-item={id}
              href={href}
            >
              <Icon
                aria-hidden="true"
                className="app-navigation__icon"
                size={24}
                weight={isActive ? "fill" : "regular"}
              />
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AppNavigation({
  activeItem,
  brandHref = "/",
  brandLabel = "Strona główna Splot",
  items,
}: AppNavigationProps) {
  return (
    <aside className="app-navigation">
      <Link aria-label={brandLabel} className="app-navigation__brand" href={brandHref}>
        <Image alt="" className="app-navigation__brand-logo" height={80} src="/logo-color.svg" width={80} />
      </Link>
      <nav aria-label="Główna nawigacja">
        <NavigationLinks activeItem={activeItem} items={items} />
      </nav>
    </aside>
  );
}
