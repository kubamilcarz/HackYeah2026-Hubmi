import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Heart,
  House,
  LockKey,
  MagnifyingGlass,
  Plus,
  Users,
  UsersThree,
} from "@phosphor-icons/react/ssr";
import { HubShell } from "@/components/hub/HubShell";
import { ChallengeCard, ContentSection, QuickAction, RecommendationCard } from "@/components/ui/Discovery";
import { StartWelcomeHeader } from "@/components/start/StartWelcomeHeader";

export const metadata: Metadata = {
  title: "Strona główna | Splot",
  description: "Twój punkt startowy do odkrywania wsparcia i lokalnych inicjatyw w Małopolsce.",
};

const challenges = [
  {
    href: "/solutions?q=starzenie%20si%C4%99%20spo%C5%82ecze%C5%84stwa",
    image: { alt: "Starsza osoba uczy się obsługi laptopa z pomocą wolontariusza", src: "/discovery/challenge-aging.jpg" },
    solutionCount: 32,
    title: "Starzenie się społeczeństwa",
  },
  {
    href: "/solutions?q=zdrowie%20psychiczne",
    image: { alt: "Nastolatka rozmawia z zaufaną dorosłą osobą w spokojnym pokoju", src: "/discovery/challenge-mental-health.jpg" },
    solutionCount: 28,
    title: "Zdrowie psychiczne dzieci i młodzieży",
  },
  {
    href: "/solutions?q=wykluczenie%20cyfrowe",
    image: { alt: "Sąsiedzi pomagają seniorowi korzystać z tabletu w bibliotece", src: "/discovery/challenge-digital-inclusion.jpg" },
    solutionCount: 19,
    title: "Wykluczenie cyfrowe",
  },
  {
    href: "/solutions?q=us%C5%82ugi%20spo%C5%82eczne",
    image: { alt: "Mieszkanka rozmawia z pracownicą socjalną w punkcie wsparcia", src: "/discovery/challenge-social-services.jpg" },
    solutionCount: 24,
    title: "Dostęp do usług społecznych",
  },
];

const recommendations = [
  {
    category: "Edukacja i rozwój",
    href: "/solutions?q=cyfrowe%20wsparcie",
    image: { alt: "Uczestnicy uczą się wspólnie cyfrowych umiejętności", src: "/discovery/recommendation-digital-skills.jpg" },
    organization: "Fundacja Sąsiedzi",
    title: "Cyfrowe wsparcie dla seniorów",
  },
  {
    category: "Integracja lokalna",
    href: "/solutions?q=ogr%C3%B3d%20spo%C5%82eczny",
    image: { alt: "Mieszkańcy wspólnie pielęgnują ogród społeczny", src: "/discovery/recommendation-community-garden.jpg" },
    organization: "Stowarzyszenie Razem",
    title: "Ogród, który łączy sąsiadów",
  },
  {
    category: "Zdrowie i dobrostan",
    href: "/solutions?q=grupa%20wsparcia",
    image: { alt: "Dwie osoby rozmawiają przy herbacie w centrum wsparcia", src: "/discovery/recommendation-peer-support.jpg" },
    organization: "Centrum Integracji",
    title: "Grupa wsparcia blisko Ciebie",
  },
];

const stats = [
  { icon: LockKey, label: "innowacji społecznych", value: "198" },
  { icon: Users, label: "aktywnych partnerów", value: "320" },
  { icon: Heart, label: "zgłoszonych potrzeb", value: "560" },
  { icon: House, label: "gminy w Małopolsce", value: "73" },
];

export default function StartPage() {
  return (
    <HubShell activeItem="start">
      <div className="start-page">
        <div className="start-page__content">
          <StartWelcomeHeader />

          <section aria-label="Szybkie działania" className="quick-actions">
            <QuickAction href="/needs/new" icon={Plus} label="Zgłoś potrzebę" variant="primary" />
            <QuickAction href="/solutions" icon={MagnifyingGlass} label="Dopasuj pomoc" variant="search" />
            <QuickAction href="/map" icon={UsersThree} label="Poznaj partnerów" variant="partners" />
            <QuickAction href="/innowacje" icon={BookOpen} label="Przeglądaj innowacje" variant="knowledge" />
          </section>

          <ContentSection action={{ href: "/wyzwania", label: "Zobacz wszystkie wyzwania" }} className="start-page__section" title="Aktualne wyzwania w Małopolsce">
            {challenges.map((challenge) => <ChallengeCard key={challenge.title} {...challenge} />)}
          </ContentSection>

          <ContentSection action={{ href: "/innowacje", label: "Zobacz całą bibliotekę" }} className="start-page__section" title="Polecane innowacje ROPS">
            {recommendations.map((recommendation) => <RecommendationCard key={recommendation.title} {...recommendation} />)}
          </ContentSection>
        </div>

        <aside aria-labelledby="start-statistics-title" className="start-statistics">
          <h2 className="start-statistics__title" id="start-statistics-title">
            <span className="start-statistics__title-brand">SPLOT</span>
            <span className="start-statistics__title-sub">w liczbach</span>
          </h2>
          <ul className="start-statistics__list">
            {stats.map(({ icon: Icon, label, value }) => (
              <li key={label}>
                <span aria-hidden="true" className="start-statistics__icon"><Icon size={26} weight="duotone" /></span>
                <p><strong>{value}</strong><span>{label}</span></p>
              </li>
            ))}
          </ul>
          <div className="start-statistics__map-wrapper" aria-hidden="true">
            <Image
              alt=""
              className="start-statistics__map-image"
              height={217}
              priority
              src="/malopolska-map.png"
              width={242}
            />
          </div>
          <div className="start-statistics__footer">
            <p className="start-statistics__message">Działamy<br />w całej Małopolsce</p>
            <Link className="start-statistics__link" href="/map">Zobacz na mapie <span aria-hidden="true">→</span></Link>
          </div>
        </aside>
      </div>
    </HubShell>
  );
}
