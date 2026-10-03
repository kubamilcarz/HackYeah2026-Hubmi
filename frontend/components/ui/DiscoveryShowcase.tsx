import { BookOpen, MagnifyingGlass, Plus, UsersThree } from "@phosphor-icons/react/ssr";
import { ChallengeCard, ContentSection, QuickAction, RecommendationCard } from "@/components/ui/Discovery";

const challengeCards = [
  { href: "#splot", image: { alt: "Starsza osoba uczy się obsługi laptopa z pomocą wolontariusza", src: "/discovery/challenge-aging.jpg" }, solutionCount: 32, title: "Starzenie się społeczeństwa" },
  { href: "#splot", image: { alt: "Nastolatka rozmawia z zaufaną dorosłą osobą w spokojnym pokoju", src: "/discovery/challenge-mental-health.jpg" }, solutionCount: 28, title: "Zdrowie psychiczne dzieci i młodzieży" },
  { href: "#splot", image: { alt: "Sąsiedzi pomagają seniorowi korzystać z tabletu w bibliotece", src: "/discovery/challenge-digital-inclusion.jpg" }, solutionCount: 19, title: "Wykluczenie cyfrowe" },
  { href: "#splot", image: { alt: "Mieszkanka rozmawia z pracownicą socjalną w punkcie wsparcia", src: "/discovery/challenge-social-services.jpg" }, solutionCount: 24, title: "Dostęp do usług społecznych" },
];

const recommendationCards = [
  { category: "Edukacja i rozwój", href: "#splot", image: { alt: "Uczestnicy uczą się wspólnie cyfrowych umiejętności", src: "/discovery/recommendation-digital-skills.jpg" }, organization: "Fundacja Sąsiedzi", title: "Cyfrowe wsparcie dla seniorów" },
  { category: "Integracja lokalna", href: "#splot", image: { alt: "Mieszkańcy wspólnie pielęgnują ogród społeczny", src: "/discovery/recommendation-community-garden.jpg" }, organization: "Stowarzyszenie Razem", title: "Ogród, który łączy sąsiadów" },
  { category: "Zdrowie i dobrostan", href: "#splot", image: { alt: "Dwie osoby rozmawiają przy herbacie w centrum wsparcia", src: "/discovery/recommendation-peer-support.jpg" }, organization: "Centrum Integracji", title: "Grupa wsparcia blisko Ciebie" },
];

export function DiscoveryShowcase() {
  return <section aria-labelledby="discovery-showcase-heading" className="discovery-showcase"><div className="discovery-showcase__welcome"><h3 className="type-h2" id="discovery-showcase-heading">Witaj, Kamila! <span aria-hidden="true">👋</span></h3><p>Razem możemy więcej. Co chcesz dziś zrobić?</p></div><div className="quick-actions"><QuickAction href="#splot" icon={Plus} label="Zgłoś potrzebę" variant="primary" /><QuickAction href="#splot" icon={MagnifyingGlass} label="Znajdź rozwiązanie" variant="search" /><QuickAction href="#splot" icon={UsersThree} label="Poznaj partnerów" variant="partners" /><QuickAction href="#splot" icon={BookOpen} label="Przeglądaj wiedzę" variant="knowledge" /></div><ContentSection action={{ href: "#splot", label: "Zobacz wszystkie" }} className="mt-10" title="Aktualne wyzwania w Małopolsce">{challengeCards.map((card) => <ChallengeCard key={card.title} {...card} />)}</ContentSection><ContentSection action={{ href: "#splot", label: "Zobacz wszystkie" }} className="mt-10" title="Polecane rozwiązania">{recommendationCards.map((card) => <RecommendationCard key={card.title} {...card} />)}</ContentSection></section>;
}
