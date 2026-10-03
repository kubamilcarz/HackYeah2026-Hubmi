export type Solution = {
  availability: string;
  categories: string[];
  description: string;
  image: { alt: string; src: string };
  locality: string;
  matchScore: number;
  organization: string;
  slug: string;
  summary: string;
  title: string;
};

export const solutions: Solution[] = [
  {
    slug: "cyfrowy-opiekun",
    title: "Cyfrowy Opiekun",
    organization: "Fundacja Sąsiedzi",
    locality: "Kraków i okolice",
    categories: ["Seniorzy", "Cyfryzacja"],
    availability: "Zapisy są otwarte",
    matchScore: 98,
    summary: "Program wsparcia seniorów w korzystaniu z usług online.",
    description: "Cyfrowy Opiekun łączy seniorów z cierpliwymi wolontariuszami. Podczas spotkań można bezpiecznie przećwiczyć korzystanie z e-recept, bankowości, komunikatorów i usług urzędowych — w indywidualnym tempie.",
    image: { src: "/discovery/recommendation-digital-skills.jpg", alt: "Seniorka rozmawiająca z osobą wspierającą przy komputerze" },
  },
  {
    slug: "razem-w-gminie",
    title: "Razem w Gminie",
    organization: "Stowarzyszenie Razem",
    locality: "Małopolska",
    categories: ["Współpraca", "Usługi społeczne"],
    availability: "Dostępne w Małopolsce",
    matchScore: 97,
    summary: "Model współpracy między organizacjami i samorządem.",
    description: "Program pomaga mieszkańcom, organizacjom i samorządom wspólnie rozpoznać lokalne wyzwania oraz zaplanować praktyczne działania. Obejmuje moderowane spotkania, konsultacje i narzędzia do współpracy.",
    image: { src: "/discovery/challenge-social-services.jpg", alt: "Grupa osób rozmawiających przy wspólnym stole" },
  },
  {
    slug: "punkty-aktywnosci-lokalnej",
    title: "Punkty Aktywności Lokalnej",
    organization: "Centrum Blisko",
    locality: "Kraków",
    categories: ["Integracja społeczna", "Społeczność"],
    availability: "Trwają zapisy",
    matchScore: 95,
    summary: "Tworzenie przestrzeni spotkań dla mieszkańców.",
    description: "Punkty Aktywności Lokalnej są otwartymi miejscami spotkań, w których mieszkańcy mogą poznać sąsiadów, uzyskać informację o wsparciu oraz wspólnie realizować lokalne inicjatywy.",
    image: { src: "/discovery/recommendation-community-garden.jpg", alt: "Mieszkańcy wspólnie rozmawiający podczas lokalnego spotkania" },
  },
  {
    slug: "spokojna-rozmowa",
    title: "Spokojna rozmowa",
    organization: "Pracownia Dobrostanu",
    locality: "Małopolska",
    categories: ["Zdrowie psychiczne", "Wsparcie"],
    availability: "Wolne terminy w tym tygodniu",
    matchScore: 93,
    summary: "Bezpłatne konsultacje i grupy wsparcia dla dorosłych.",
    description: "Program oferuje pierwszą rozmowę wspierającą, krótkoterminowe konsultacje oraz kameralne grupy dla osób mierzących się z przeciążeniem, samotnością lub trudnym okresem życia.",
    image: { src: "/discovery/challenge-mental-health.jpg", alt: "Osoba odpoczywająca na świeżym powietrzu" },
  },
  {
    slug: "sasiedzka-pomoc",
    title: "Sąsiedzka pomoc",
    organization: "Fundacja Dobra Okolica",
    locality: "Kraków i okolice",
    categories: ["Usługi społeczne", "Sąsiedztwo"],
    availability: "Można dołączyć",
    matchScore: 91,
    summary: "Praktyczne wsparcie w codziennych sprawach blisko domu.",
    description: "Sąsiedzka pomoc łączy osoby potrzebujące drobnego wsparcia z przeszkolonymi wolontariuszami. Pomoc może dotyczyć zakupów, towarzyszenia w drodze lub wspólnego załatwienia codziennych spraw.",
    image: { src: "/discovery/recommendation-peer-support.jpg", alt: "Dwie osoby rozmawiające przy stole" },
  },
  {
    slug: "otwarta-edukacja",
    title: "Otwarta edukacja",
    organization: "Akademia Wspólna",
    locality: "Małopolska",
    categories: ["Edukacja", "Dostępność"],
    availability: "Nowa grupa od przyszłego miesiąca",
    matchScore: 89,
    summary: "Warsztaty rozwijające umiejętności w dostępnej formule.",
    description: "Otwarta edukacja prowadzi bezpłatne warsztaty dla osób, które chcą rozwijać praktyczne umiejętności. Zajęcia odbywają się w małych grupach i są dostosowywane do różnych potrzeb uczestników.",
    image: { src: "/discovery/challenge-digital-inclusion.jpg", alt: "Osoby wspólnie uczące się podczas warsztatu" },
  },
];

export function getSolution(slug: string) {
  return solutions.find((solution) => solution.slug === slug);
}
