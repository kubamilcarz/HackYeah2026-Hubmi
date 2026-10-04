import Image from "next/image";
import Link from "next/link";
import {
  BookOpenText,
  ChartBar,
  Lightbulb,
  List,
  MagnifyingGlass,
  Plus,
  UsersThree,
} from "@phosphor-icons/react/ssr";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SearchField } from "@/components/ui/FormControls";

const navigationItems = [
  { href: "/start", label: "Pulpit" },
  { href: "/solutions", label: "Rozwiązania" },
  { href: "/innowacje", label: "Innowacje" },
  { href: "/wyzwania", label: "Wyzwania" },
  { href: "/map", label: "Mapa" },
];

const benefits = [
  { icon: Lightbulb, label: "Odkrywaj rozwiązania" },
  { icon: UsersThree, label: "Łącz się z partnerami" },
  { icon: ChartBar, label: "Wdrażaj i skaluj innowacje" },
  { icon: BookOpenText, label: "Korzystaj z wiedzy ekspertów" },
];

export default function Home() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <div className="landing-shell landing-header__inner">
          <Link aria-label="Splot — strona główna" className="landing-brand" href="/">
            <Image alt="" aria-hidden="true" className="landing-brand__mark" height={44} priority src="/logo-color.svg" width={44} />
          </Link>

          <nav aria-label="Główna nawigacja" className="landing-nav">
            {navigationItems.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
          </nav>

          <div className="landing-header__actions">
            <details className="landing-search">
              <summary><MagnifyingGlass aria-hidden="true" size={21} weight="bold" /><span className="sr-only">Otwórz wyszukiwanie</span></summary>
              <div className="landing-search__panel">
                <form action="/solutions" className="landing-search__form" method="get" role="search">
                  <SearchField className="landing-search__field" hideLabel label="Szukaj w Splot" name="q" placeholder="Czego szukasz?" />
                  <Button size="sm" type="submit">Szukaj</Button>
                </form>
              </div>
            </details>
            <ButtonLink href="/start" size="sm" variant="tertiary">Zaloguj się</ButtonLink>
            <ButtonLink href="/start" size="sm">Otwórz Hub</ButtonLink>
          </div>

          <details className="landing-mobile-menu">
            <summary><List aria-hidden="true" size={24} weight="bold" /><span>Menu</span></summary>
            <div className="landing-mobile-menu__panel">
              <nav aria-label="Główna nawigacja mobilna">
                {navigationItems.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
              </nav>
              <div className="landing-mobile-menu__actions">
                <form action="/solutions" className="landing-search__form landing-search__form--mobile" method="get" role="search">
                  <SearchField className="landing-search__field" hideLabel label="Szukaj w Splot" name="q" placeholder="Czego szukasz?" />
                  <Button size="sm" type="submit">Szukaj</Button>
                </form>
                <ButtonLink href="/start" variant="tertiary">Zaloguj się</ButtonLink>
                <ButtonLink href="/start">Otwórz Hub</ButtonLink>
              </div>
            </div>
          </details>
        </div>
      </header>

      <section aria-labelledby="landing-title" className="landing-hero landing-shell">
        <div className="landing-hero__content">
          <p className="landing-eyebrow"><span aria-hidden="true">✦</span> Małopolski Hub Innowacji Społecznych</p>
          <h1 className="type-display" id="landing-title">Łączymy ludzi, pomysły i <span>rozwiązania.</span></h1>
          <p className="landing-hero__description type-body">
            SPLOT to platforma, która łączy potrzeby społeczne z innowacyjnymi rozwiązaniami. Wspólnie budujemy silniejszą, bardziej zaangażowaną Małopolskę.
          </p>
          <div className="landing-hero__actions">
            <ButtonLink href="/needs/new" leadingIcon={Plus} size="lg">Zgłoś potrzebę</ButtonLink>
            <ButtonLink href="/solutions" size="lg" variant="tertiary">Poznaj rozwiązania</ButtonLink>
          </div>
        </div>

        <div aria-hidden="true" className="landing-hero__visual">
          <Image alt="" className="landing-hero__collage" height={1254} priority sizes="(min-width: 64rem) 43vw, 92vw" src="/landing/community-collage.png" width={1254} />
          <p className="landing-hero__message"><span aria-hidden="true">✦</span> Realne rozwiązania<br />dla realnych potrzeb</p>
        </div>
      </section>

      <section aria-label="Co umożliwia Splot" className="landing-benefits landing-shell">
        <ul>
          {benefits.map(({ icon: Icon, label }) => (
            <li key={label}><Icon aria-hidden="true" size={38} weight="duotone" /><span>{label}</span></li>
          ))}
        </ul>
      </section>

      <footer className="landing-footer">
        <div className="landing-shell">
          <p>© Splot. Made for Hack Yeah 2026.</p>
        </div>
      </footer>
    </main>
  );
}
