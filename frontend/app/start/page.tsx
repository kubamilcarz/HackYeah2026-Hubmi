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
import {
  getAdminTrends,
  getChallenges,
  getInnovations,
  getCounties,
  type RegionalChallenge,
  type SocialInnovation,
} from "@/lib/api";

export const metadata: Metadata = {
  title: "Strona główna | Splot",
  description: "Twój punkt startowy do odkrywania wsparcia i lokalnych inicjatyw w Małopolsce.",
};

function getChallengeImage(challenge: RegionalChallenge) {
  const cat = (challenge.category_code || "").toLowerCase();
  const title = challenge.title.toLowerCase();
  if (cat.includes("senior") || title.includes("senior") || title.includes("starzenie")) {
    return {
      src: "/discovery/challenge-aging.jpg",
      alt: `Wyzwanie: ${challenge.title}`,
    };
  }
  if (cat.includes("health") || title.includes("psychiczn") || title.includes("zdrowi")) {
    return {
      src: "/discovery/challenge-mental-health.jpg",
      alt: `Wyzwanie: ${challenge.title}`,
    };
  }
  if (cat.includes("cyfrow") || title.includes("cyfrow") || cat.includes("sensory")) {
    return {
      src: "/discovery/challenge-digital-inclusion.jpg",
      alt: `Wyzwanie: ${challenge.title}`,
    };
  }
  return {
    src: "/discovery/challenge-social-services.jpg",
    alt: `Wyzwanie: ${challenge.title}`,
  };
}

function getInnovationImage(innovation: SocialInnovation) {
  const cat = (innovation.category_code || "").toLowerCase();
  const slug = innovation.slug.toLowerCase();
  if (slug.includes("bawita") || cat.includes("senior")) {
    return {
      src: "/discovery/recommendation-digital-skills.jpg",
      alt: innovation.title,
    };
  }
  if (slug.includes("cuder") || cat.includes("health") || slug.includes("kawiarenka")) {
    return {
      src: "/discovery/recommendation-community-garden.jpg",
      alt: innovation.title,
    };
  }
  return {
    src: "/discovery/recommendation-peer-support.jpg",
    alt: innovation.title,
  };
}

export default async function StartPage() {
  const [trends, challengesData, innovationsData, countiesData] = await Promise.all([
    getAdminTrends(),
    getChallenges(),
    getInnovations(),
    getCounties(),
  ]);

  // Dynamiczne wyzwania: wybierz do 4 wyzwań
  const displayChallenges = challengesData.slice(0, 4).map((ch) => {
    // Oblicz liczbę rozwiązań powiązanych z kategorią wyzwania
    const matchingCount = innovationsData.filter((inv) => {
      if (ch.category) {
        const catId = typeof ch.category === "object" ? ch.category.id : ch.category;
        const invCatId = typeof inv.category === "object" ? inv.category.id : inv.category;
        if (catId && invCatId && catId === invCatId) return true;
      }
      if (ch.category_code && inv.category_code) {
        return ch.category_code === inv.category_code;
      }
      return false;
    }).length;

    const solutionCount =
      ch.related_innovations && ch.related_innovations.length > 0
        ? ch.related_innovations.length
        : matchingCount > 0
        ? matchingCount
        : 1;

    return {
      href: `/solutions?q=${encodeURIComponent(ch.title)}`,
      image: getChallengeImage(ch),
      solutionCount,
      title: ch.title,
    };
  });

  // Dynamiczne rekomendacje: wybierz 3 sprawdzone lub najwyżej ocenione innowacje
  const sortedInnovations = [...innovationsData].sort((a, b) => {
    if (a.maturity_stage === "sprawdzona" && b.maturity_stage !== "sprawdzona") return -1;
    if (b.maturity_stage === "sprawdzona" && a.maturity_stage !== "sprawdzona") return 1;
    return (b.replication_readiness_score || 0) - (a.replication_readiness_score || 0);
  });

  const displayRecommendations = sortedInnovations.slice(0, 3).map((inv) => ({
    category: inv.category_name || "Innowacja ROPS",
    href: `/innowacje/${inv.slug}`,
    image: getInnovationImage(inv),
    organization: inv.author_organization || "ROPS Kraków",
    title: inv.title,
  }));

  // Dynamiczne statystyki
  const totalMunicipalities = countiesData.reduce(
    (acc, county) => acc + (county.municipalities?.length || 0),
    0
  );

  const stats = [
    {
      icon: LockKey,
      label: "innowacji społecznych",
      value: String(innovationsData.length),
    },
    {
      icon: Users,
      label: "aktywnych partnerów",
      value: String(trends.total_partnerships || countiesData.length * 2 || 24),
    },
    {
      icon: Heart,
      label: "zgłoszonych potrzeb",
      value: String(trends.total_submissions + (trends.total_ideas || 0) || 12),
    },
    {
      icon: House,
      label: "gmin w Małopolsce",
      value: String(totalMunicipalities > 0 ? totalMunicipalities : 73),
    },
  ];

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
            {displayChallenges.map((challenge) => <ChallengeCard key={challenge.title} {...challenge} />)}
          </ContentSection>

          <ContentSection action={{ href: "/innowacje", label: "Zobacz całą bibliotekę" }} className="start-page__section" title="Polecane innowacje ROPS">
            {displayRecommendations.map((recommendation) => <RecommendationCard key={recommendation.title} {...recommendation} />)}
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
