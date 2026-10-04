/**
 * Klient API platformy Splot do komunikacji z backendem Django REST Framework.
 * Obsługuje Moduł I (Matchmaking), Moduł II (Zasobnik Wiedzy i Trendy) oraz pozostałe moduły.
 */

export type InnovationCategory = {
  id: number;
  code: string;
  name: string;
  description: string;
  icon_name: string;
  order: number;
};

export type Municipality = {
  id: number;
  name: string;
  kind: "miejska" | "wiejska" | "miejsko-wiejska";
  has_cus: boolean;
};

export type County = {
  id: number;
  name: string;
  slug: string;
  teryt?: string;
  population?: number;
  senior_ratio: string | number;
  unemployment_rate?: string | number;
  summary?: string;
  main_challenges?: string[];
  challenges_count?: number;
  innovations_count?: number;
  municipalities?: Municipality[];
};

export type SocialInnovation = {
  id: number;
  title: string;
  slug: string;
  category: number | InnovationCategory;
  category_name?: string;
  category_code?: string;
  secondary_categories?: InnovationCategory[];
  maturity_stage: "koncepcja" | "prototyp" | "testy" | "sprawdzona";
  innovation_type: "usluga" | "produkt" | "metoda" | "technologia" | "narzedzie_cyfrowe";
  short_summary: string;
  full_description?: string;
  target_audience: string;
  implementation_guide?: string;
  video_url?: string;
  video_transcript?: string;
  handbook_pdf_url?: string;
  author_name?: string;
  author_organization?: string;
  author_email?: string;
  replication_readiness_score: number;
  likes_count: number;
  matches_count: number;
  tags: string[];
};

export type RegionalChallenge = {
  id: number;
  title: string;
  slug: string;
  category?: number | InnovationCategory;
  category_name?: string;
  category_code?: string;
  county?: number | County;
  county_name?: string;
  county_slug?: string;
  summary: string;
  full_analysis: string;
  statistical_data: Record<string, string | number>;
  key_needs: string[];
  related_innovations?: SocialInnovation[];
};

export type CategoryTrend = {
  category_id: number;
  category_name: string;
  category_code: string;
  submissions_count: number;
  innovations_count: number;
};

export type CountyTrend = {
  county_id: number;
  county_name: string;
  population: number;
  senior_ratio: number;
  submissions_count: number;
};

export type WhiteSpotItem = {
  submission_id: number;
  title: string;
  category_name: string;
  county_name: string;
  affected_group: string;
  reported_at: string;
};

export type AdminTrendsResponse = {
  total_submissions: number;
  total_ideas: number;
  total_pilots: number;
  total_partnerships: number;
  by_category: CategoryTrend[];
  by_county: CountyTrend[];
  white_spots: WhiteSpotItem[];
};

export type MatchResultItem = {
  innovation: SocialInnovation;
  similarity_score: number;
  justification: string;
  suggested_next_step: "tester" | "middleman" | "contact" | string;
};

export type MatchmakingAnalyzeRequest = {
  title: string;
  description: string;
  affected_group?: string;
  category_id?: number | null;
  category_code?: string;
  county_id?: number | null;
  municipality_name?: string;
  estimated_scale?: string;
  persona_key?: string;
  reporter_role?: string;
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  save_submission?: boolean;
};

export type MatchmakingAnalyzeResponse = {
  submission_id: number | null;
  is_gap_identified: boolean;
  gap_message: string;
  total_matches: number;
  top_score: number;
  matches: MatchResultItem[];
  recommended_action: string;
};

// Domyślny adres backendu API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Fallbackowe dane ROPS w razie pracy offline/braku połączenia z backendem
export const FALLBACK_CATEGORIES: InnovationCategory[] = [
  { id: 1, code: "seniors", name: "Dla seniorów", description: "Wsparcie aktywności, samodzielności i integracji osób starszych.", icon_name: "UsersThree", order: 1 },
  { id: 2, code: "youth_family", name: "Dla dzieci, młodzieży i rodziny", description: "Wsparcie rodzicielstwa, integracja międzypokoleniowa.", icon_name: "Baby", order: 2 },
  { id: 3, code: "mobility", name: "Dla osób o ograniczonej mobilności", description: "Narzędzia i usprawnienia architektoniczne ułatwiające przemieszczanie się.", icon_name: "Wheelchair", order: 3 },
  { id: 4, code: "sensory", name: "Dla osób z niepełnosprawnością sensoryczną", description: "Adaptacje sensoryczne i pomoce komunikacyjne wzroku i słuchu.", icon_name: "Eye", order: 4 },
  { id: 5, code: "health", name: "Dla zdrowia i medycyny", description: "Profilaktyka zdrowia psychicznego, wsparcie wytchnieniowe.", icon_name: "FirstAid", order: 5 },
  { id: 6, code: "labor", name: "Dla rynku pracy", description: "Ekonomia społeczna i reintegracja zawodowa.", icon_name: "Briefcase", order: 6 },
  { id: 7, code: "foreigners", name: "Dla cudzoziemców", description: "Integracja migrantów, nauka języka i włączenie społeczne.", icon_name: "Globe", order: 7 },
  { id: 8, code: "homelessness", name: "Dla osób w kryzysie bezdomności", description: "Mieszkalnictwo wspomagane, streetworking i pomoc higieniczna.", icon_name: "HouseLine", order: 8 },
  { id: 9, code: "intellectual", name: "Dla osób z niepełnosprawnością intelektualną", description: "Treningi samodzielności i komunikacja alternatywna (AAC).", icon_name: "Brain", order: 9 },
];

export const FALLBACK_COUNTIES: County[] = [
  {
    id: 1,
    name: "Powiat nowosądecki",
    slug: "nowosadecki",
    population: 217000,
    senior_ratio: "22.8",
    unemployment_rate: "7.8",
    summary: "Powiat o charakterze podgórskim ze znacznym rozproszeniem osadniczym. Wyzwania: dojazd do usług medycznych, samotność seniorów w sołectwach.",
    main_challenges: ["Dostępność transportowa", "Samotność seniorów na terenach wiejskich", "Opieka wytchnieniowa"],
    municipalities: [
      { id: 1, name: "Grybów", kind: "wiejska", has_cus: false },
      { id: 2, name: "Krynica-Zdrój", kind: "miejsko-wiejska", has_cus: true },
      { id: 3, name: "Stary Sącz", kind: "miejsko-wiejska", has_cus: false },
    ],
  },
  {
    id: 2,
    name: "Powiat myślenicki",
    slug: "myslenicki",
    population: 129000,
    senior_ratio: "19.8",
    unemployment_rate: "5.2",
    summary: "Dynamicznie rozwijający się powiat podmiejski ze wzorcowymi Centrami Usług Społecznych.",
    main_challenges: ["Koordynacja usług deinstytucjonalnych", "Wypalenie opiekunów nieformalnych"],
    municipalities: [
      { id: 4, name: "Myślenice", kind: "miejsko-wiejska", has_cus: true },
      { id: 5, name: "Dobczyce", kind: "miejsko-wiejska", has_cus: false },
    ],
  },
  {
    id: 3,
    name: "Powiat tarnowski",
    slug: "tarnowski",
    population: 202000,
    senior_ratio: "24.2",
    unemployment_rate: "8.5",
    summary: "Obszar o wysokim odsetku gospodarstw rolnych. Zapotrzebowanie na usługi mobilne.",
    main_challenges: ["Wykluczenie komunikacyjne sołectw", "Bariery architektoniczne w starym budownictwie"],
    municipalities: [
      { id: 6, name: "Tarnów", kind: "miejska", has_cus: true },
      { id: 7, name: "Żabno", kind: "miejsko-wiejska", has_cus: false },
    ],
  },
  {
    id: 4,
    name: "Powiat krakowski",
    slug: "krakowski",
    population: 285000,
    senior_ratio: "25.1",
    unemployment_rate: "3.1",
    summary: "Obszar metropolitalny. Silne zróżnicowanie między dynamicznymi gminami a tradycyjnymi wsiami.",
    main_challenges: ["Kryzys zdrowia psychicznego dzieci i młodzieży", "Integracja migrantów"],
    municipalities: [
      { id: 8, name: "Kraków", kind: "miejska", has_cus: true },
      { id: 9, name: "Wieliczka", kind: "miejsko-wiejska", has_cus: false },
      { id: 10, name: "Skawina", kind: "miejsko-wiejska", has_cus: true },
    ],
  },
  {
    id: 5,
    name: "Powiat gorlicki",
    slug: "gorlicki",
    population: 107000,
    senior_ratio: "25.1",
    unemployment_rate: "9.1",
    summary: "Teren peryferyjny z najwyższym wskaźnikiem starości demograficznej i zagrożenia ubóstwem energetycznym.",
    main_challenges: ["Depopulacja", "Ubóstwo energetyczne seniorów", "Brak kadr opiekuńczych"],
    municipalities: [
      { id: 11, name: "Gorlice", kind: "miejska", has_cus: false },
      { id: 12, name: "Biecz", kind: "miejsko-wiejska", has_cus: true },
    ],
  },
  {
    id: 6,
    name: "Powiat tatrzański",
    slug: "tatrzanski",
    population: 68000,
    senior_ratio: "22.0",
    unemployment_rate: "6.4",
    summary: "Specyfika turystyczna i sezonowość zatrudnienia.",
    main_challenges: ["Sezonowość potrzeb społecznych", "Dostępność mieszkań dla osób zależnych"],
    municipalities: [
      { id: 13, name: "Zakopane", kind: "miejska", has_cus: false },
      { id: 14, name: "Poronin", kind: "wiejska", has_cus: false },
    ],
  },
];

export const FALLBACK_INNOVATIONS: SocialInnovation[] = [
  {
    id: 1,
    title: "BaWita – Mobilna sensoryczna tablica aktywizująca",
    slug: "bawita-tablica-sensoryczna",
    category: 1,
    category_name: "Dla seniorów",
    category_code: "seniors",
    maturity_stage: "sprawdzona",
    innovation_type: "produkt",
    short_summary: "Przenośny zestaw stymulacji sensorycznej i pamięciowej dla seniorów i osób z chorobami otępiennymi w placówkach i środowisku domowym.",
    full_description: "BaWita to innowacyjny zestaw modułowych elementów sensoryczno-manualnych, zaprojektowany z myślą o osobach z otępieniem, chorobą Alzheimera oraz seniorach doświadczających izolacji. Został opracowany przez zespół terapeutyczny Inkubatora ROPS Kraków. Może być transportowany w poręcznej walizce do domu podopiecznego lub świetlicy wiejskiej przez asystenta CUS.",
    target_audience: "Seniorzy 65+, osoby z chorobami otępiennymi, opiekunowie rodzinni, kadra CUS",
    implementation_guide: "Krok 1: Zamówienie certyfikowanego zestawu od producenta społecznego.\nKrok 2: 4-godzinny instruktaż opiekunów i asystentów CUS.\nKrok 3: Włączenie tablicy w harmonogram wizyt domowych (2-3 razy w tygodniu po 45 min).",
    video_url: "https://www.youtube.com/watch?v=o7UhDlebLJo",
    video_transcript: "[Czas 0:00 - 0:45] Lektor: Prezentujemy BaWita – zestaw sensoryczny opracowany w Małopolskim Inkubatorze Innowacji Społecznych ROPS Kraków. Widzimy drewnianą tablicę z bezpiecznymi elementami manipulacyjnymi: zamki, przełączniki, labirynty dotykowe.\n[Czas 0:45 - 1:30] Terapeuta zajęciowy: Narzędzie pozwala na ćwiczenie motoryki małej i pobudzanie wspomnień u osób z zaawansowaną demencją bez konieczności opuszczania domu.\n[Czas 1:30 - 2:00] Podsumowanie: Zestaw jest lekki, w pełni zmywalny i bezpieczny zgodnie z normami medycznymi WCAG i PFRON.",
    handbook_pdf_url: "/documents/podrecznik_bawita_rops.pdf",
    author_name: "Maria Lorenc i Maciej Parol",
    author_organization: "Fundacja Rozwoju Terapii Zajęciowej (Nowy Sącz)",
    author_email: "kontakt@bawita-innowacje.pl",
    replication_readiness_score: 95,
    likes_count: 58,
    matches_count: 39,
    tags: ["seniorzy", "demencja", "terapia sensoryczna", "opieka domowa", "CUS", "wieś"],
  },
  {
    id: 2,
    title: "Senior CUDER – Gra integracyjno-aktywizująca dla osób starszych",
    slug: "senior-cuder-gra-integracyjna",
    category: 1,
    category_name: "Dla seniorów",
    category_code: "seniors",
    maturity_stage: "sprawdzona",
    innovation_type: "metoda",
    short_summary: "Planszowa i plenerowa metoda integracji międzypokoleniowej oraz przeciwdziałania depresji i osamotnieniu seniorów.",
    full_description: "Senior CUDER (Ciało, Umysł, Duch, Emocje, Relacje) to holistyczna metoda pracy grupowej. Pozwala osobom starszym w bezpieczny sposób rozmawiać o trudnych emocjach, stracie i samotności, jednocześnie budując nowe relacje sąsiedzkie w klubach seniora i sołectwach.",
    target_audience: "Samotni seniorzy, kluby seniora, koła gospodyń wiejskich, wolontariusze",
    implementation_guide: "Szkolenie lidera klubu seniora trwa 1 dzień. Zestaw gry zawiera planszę, karty pytań, żetony relacji i podręcznik facylitatora.",
    video_url: "https://www.youtube.com/watch?v=o5TP10ZStNA",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[Czas 0:00 - 0:30] Facylitator: Witamy na międzypokoleniowej rozgrywce Senior CUDER. Uczestnicy losują kartę z obszaru 'Emocje'.\n[Czas 0:30 - 1:15] Uczestniczka (72 lata): 'Co dodaje mi otuchy w trudnym dniu? Rozmowa z sąsiadką i chwila przy herbacie.' Grupa dzieli się swoimi doświadczeniami.\n[Czas 1:15 - 2:00] Podsumowanie: Gra nie tworzy rywalizacji, lecz przestrzeń głębokiego wzajemnego zrozumienia i przełamywania izolacji w sołectwach.",
    handbook_pdf_url: "/documents/przewodnik_senior_cuder.pdf",
    author_name: "dr Danuta Wieczorek",
    author_organization: "Stowarzyszenie Dialog Społeczny",
    author_email: "cuder@innowacje-rops.pl",
    replication_readiness_score: 96,
    likes_count: 89,
    matches_count: 55,
    tags: ["samotność", "integracja", "gra planszowa", "klub seniora", "zdrowie psychiczne"],
  },
  {
    id: 3,
    title: "Ścieżka motosensoryczna dla seniorów",
    slug: "sciezka-motosensoryczna",
    category: 1,
    category_name: "Dla seniorów",
    category_code: "seniors",
    maturity_stage: "sprawdzona",
    innovation_type: "produkt",
    short_summary: "Plenerowy tor równoważno-sensoryczny redukujący ryzyko upadków i aktywizujący osoby 65+ na terenach wiejskich.",
    full_description: "Innowacyjny tor przeszkód z poręczami asekuracyjnymi i podłożami o zróżnicowanej fakturze (otoczaki, drewno, kora, maty akupresurowe). Poprawia propriocepcję i koordynację ruchową seniorów.",
    target_audience: "Seniorzy 65+, osoby z zaburzeniami równowagi, domy pomocy społecznej, samorządy",
    implementation_guide: "Montaż certyfikowanego toru plenerowego na podłożu trawiastym lub mineralnym wraz z tablicami instruktażowymi ćwiczeń.",
    video_url: "https://www.youtube.com/watch?v=4DKP0XK440U",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:40] Fizjoterapeuta: Prezentujemy plenerową ścieżkę motosensoryczną zaprojektowaną z myślą o bezpieczeństwie osób starszych.\n[0:40 - 1:20] Demonstracja: Seniorzy pokonują bezpiecznie kolejne moduły, ćwicząc stabilność stawów skokowych i kolanowych pod okiem instruktora.\n[1:20 - 2:00] Wyniki badań: Regularny trening 2 razy w tygodniu zmniejsza częstość upadków u uczestników o 42%.",
    handbook_pdf_url: "/documents/podrecznik_bawita_rops.pdf",
    author_name: "Zespół Terapeutyczny Senior Plus",
    author_organization: "Małopolskie Towarzystwo Krzewienia Kultury Fizycznej",
    author_email: "kontakt@seniorplus-malopolska.pl",
    replication_readiness_score: 91,
    likes_count: 42,
    matches_count: 27,
    tags: ["seniorzy", "aktywność fizyczna", "profilaktyka upadków", "sensoryka", "plener"],
  },
  {
    id: 4,
    title: "Organizator Społeczności Lokalnej (OSL) w CUS",
    slug: "organizator-spolecznosci-lokalnej-cus",
    category: 2,
    category_name: "Dla dzieci, młodzieży i rodziny",
    category_code: "youth_family",
    maturity_stage: "sprawdzona",
    innovation_type: "usluga",
    short_summary: "Metoda animacji sąsiedzkiej aktywizująca mieszkańców do samopomocy, tworzenia klubów rodzica i lokalnych grup wsparcia.",
    full_description: "Model wdrożony i przetestowany m.in. w Centrum Usług Społecznych w Myślenicach. Zamiast czekać na zgłoszenia zasiłkowe, organizator wychodzi w teren, mapuje potencjał sołectw i wspiera powstawanie oddolnych inicjatyw rodzinnych i sąsiedzkich.",
    target_audience: "Mieszkańcy gmin wiejskich i małych miast, samorządy, liderzy lokalni, rodziny z dziećmi",
    implementation_guide: "Standard procedur dla CUS, opisy stanowisk pracy i zestaw narzędzi mapowania zasobów sołeckich.",
    video_url: "https://www.youtube.com/watch?v=hohm7FnsukY",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:45] OSL Marek Wiśniewski: Witamy w Myślenicach. Rola Organizatora Społeczności Lokalnej polega na słuchaniu mieszkańców w ich naturalnym środowisku.\n[0:45 - 1:30] Ujęcia z sołectwa: Mieszkańcy organizują wspólnie przestrzeń dla dzieci i punkt wymiany książek.\n[1:30 - 2:00] Marek Wiśniewski: CUS daje impuls i ubezpieczenie, a mieszkańcy tworzą trwałą sieć samopomocy.",
    handbook_pdf_url: "/documents/standard_osl_rops.pdf",
    author_name: "Marek Wiśniewski i Zespół ROPS",
    author_organization: "Centrum Usług Społecznych w Myślenicach",
    author_email: "cus@myslenice.pl",
    replication_readiness_score: 98,
    likes_count: 121,
    matches_count: 72,
    tags: ["CUS", "animacja", "samorząd", "JST", "samopomoc", "sołectwo", "rodzina"],
  },
  {
    id: 5,
    title: "koMIX życiowy – Narzędzie dialogu z młodzieżą w kryzysie",
    slug: "komix-zyciowy",
    category: 2,
    category_name: "Dla dzieci, młodzieży i rodziny",
    category_code: "youth_family",
    maturity_stage: "sprawdzona",
    innovation_type: "metoda",
    short_summary: "Karty komiksowe ułatwiające pedagogom i psychologom rozmowę z nastolatkami o emocjach, depresji i uzależnieniach.",
    full_description: "koMIX życiowy to seria autorskich kart graficznych przedstawiających realistyczne dylematy dorastania. Młodzież poprzez metafory komiksowe otwiera się na rozmowę o presji rówieśniczej, hejcie w internecie, samotności oraz konfliktach rodzinnych.",
    target_audience: "Młodzież 12-19 lat, pedagodzy szkolni, psycholodzy, placówki wsparcia dziennego",
    implementation_guide: "Zestaw 40 kart komiksowych wraz ze scenariuszami 60-minutowych warsztatów profilaktycznych i indywidualnych.",
    video_url: "https://www.youtube.com/watch?v=hohm7FnsukY",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:40] Psycholog: koMIX życiowy to seria autorskich kart narracyjnych przygotowanych z myślą o młodzieży przeżywającej kryzysy tożsamości.\n[0:40 - 1:20] Warsztat: Młodzież układa alternatywne zakończenia komiksowych kadrów, otwierając się na rozmowę z pedagogiem szkolnym.\n[1:20 - 2:00] Podsumowanie: Narzędzie przetestowane w 15 szkołach i placówkach opiekuńczych Małopolski.",
    handbook_pdf_url: "/documents/standard_osl_rops.pdf",
    author_name: "Joanna Radko i Magdalena Kruk",
    author_organization: "Fundacja Po Drugie",
    author_email: "kontakt@podrugie.pl",
    replication_readiness_score: 93,
    likes_count: 64,
    matches_count: 33,
    tags: ["młodzież", "zdrowie psychiczne", "komiks", "szkoła", "pedagogika", "kryzys"],
  },
  {
    id: 6,
    title: "Edki – Kredki terapeutyczne i stymulacja motoryki małej",
    slug: "edki-kredki-terapeutyczne",
    category: 2,
    category_name: "Dla dzieci, młodzieży i rodziny",
    category_code: "youth_family",
    maturity_stage: "sprawdzona",
    innovation_type: "produkt",
    short_summary: "Ergonomiczne, sensoryczne przybory grafomotoryczne dla dzieci z trudnościami manualnymi i zaburzeniami napięcia.",
    full_description: "Edki to unikalne kredki w kształcie ergonomicznych kamyków sensorycznych. Wymuszają prawidłowy chwyt trójpunktowy bez wywoływania bólu mięśni dłoni. Opracowane we współpracy z terapeutami integracji sensorycznej z Małopolski.",
    target_audience: "Dzieci w wieku przedszkolnym i wczesnoszkolnym, poradnie psychologiczno-pedagogiczne, przedszkola integracyjne",
    implementation_guide: "Wdrożenie zestawu kredek wraz z kartami ćwiczeń grafomotorycznych w zajęciach wychowania przedszkolnego.",
    video_url: "https://www.youtube.com/watch?v=ev173g-d_vA",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:40] Terapeuta integracji sensorycznej: Edki to innowacyjny zestaw kredek o ergonomicznym, trójwymiarowym kształcie kamieni sensorycznych.\n[0:40 - 1:20] Prezentacja: Dzieci z zaburzeniami napięcia mięśniowego intuicyjnie chwytają kredki w prawidłowy sposób bez bólu dłoni.\n[1:20 - 2:00] Efekt: Poprawa sprawności grafomotorycznej przed rozpoczęciem nauki w szkole.",
    handbook_pdf_url: "/documents/instrukcja_merkury.pdf",
    author_name: "Pracownia Terapeutyczna Kredka",
    author_organization: "Spółdzielnia Socjalna Twórczy Rozwój",
    author_email: "edki@tworczyrozwoj.pl",
    replication_readiness_score: 89,
    likes_count: 47,
    matches_count: 21,
    tags: ["dzieci", "motoryka mała", "terapia", "integracja sensoryczna", "przedszkole"],
  },
  {
    id: 7,
    title: "Hop Hop – Mobilny plac zabaw i integracji wiejskiej",
    slug: "hop-hop-mobilny-plac-zabaw",
    category: 2,
    category_name: "Dla dzieci, młodzieży i rodziny",
    category_code: "youth_family",
    maturity_stage: "sprawdzona",
    innovation_type: "usluga",
    short_summary: "Mobilny zestaw gier plenerowych i animacji dojeżdżający do sołectw pozbawionych placów zabaw i świetlic.",
    full_description: "Mobilne centrum rekreacji docierające do małych sołectw w Małopolsce w specjalnie wyposażonym busie. Umożliwia organizację integracyjnych pikników, gier podwórkowych i warsztatów plastycznych dla rodzin z dziećmi.",
    target_audience: "Dzieci i rodziny z terenów wiejskich, sołtysi, koła gospodyń wiejskich, ośrodki kultury",
    implementation_guide: "Pakiet logistyczny dla gminnego ośrodka kultury: harmonogram objazdowy, zestaw 20 gier drewnianych i szkolenie animatorów.",
    video_url: "https://www.youtube.com/watch?v=kE9lpr4OJPQ",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:40] Koordynator: Projekt Hop Hop dociera z mobilnym sprzętem rekreacyjno-animacyjnym do wsi pozbawionych placów zabaw.\n[0:40 - 1:20] Ujęcia z sołectwa: Dzieci i rodzice wspólnie uczestniczą w bezpiecznych grach drewnianych i warsztatach kreatywnych.\n[1:20 - 2:00] Podsumowanie: Budowanie więzi sąsiedzkich i bezpieczna przestrzeń rozwoju dla najmłodszych.",
    handbook_pdf_url: "/documents/standard_osl_rops.pdf",
    author_name: "Stowarzyszenie Twórczych Inicjatyw Społecznych",
    author_organization: "Lokalna Grupa Działania Przyjazna Ziemia",
    author_email: "hophop@inicjatywylokalne.pl",
    replication_readiness_score: 92,
    likes_count: 55,
    matches_count: 29,
    tags: ["dzieci", "wieś", "animacja", "mobilny plac zabaw", "rodzina"],
  },
  {
    id: 8,
    title: "Modularne łazienki dostępne – Szybki pakiet adaptacyjny",
    slug: "modularne-lazienki-dostepne",
    category: 3,
    category_name: "Dla osób o ograniczonej mobilności",
    category_code: "mobility",
    maturity_stage: "sprawdzona",
    innovation_type: "produkt",
    short_summary: "System bezinwazyjnych, demontowalnych uchwytów i podestów likwidujących bariery w wiejskich domach seniorów.",
    full_description: "Wielu seniorów w Małopolsce mieszka w domach z głębokimi wannami i wysokimi progami. Modularny pakiet pozwala w 3 godziny przekształcić łazienkę bez kucia płytek i kosztownych remontów, z możliwością późniejszego przeniesienia lub zwrotu do CUS.",
    target_audience: "Osoby o ograniczonej mobilności, poruszające się o kulach lub wózkach, seniorzy 70+",
    implementation_guide: "Montaż przez gminnego konserwatora lub wolontariusza NGO na podstawie prostego szablonu miarowego w czasie do 3 godzin.",
    video_url: "https://www.youtube.com/watch?v=Pl5bkpxEqgs",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:45] Inżynier: Prezentujemy modułowy system bezinwazyjnej adaptacji łazienek dla osób poruszających się o kulach i wózkach.\n[0:45 - 1:30] Montaż: Regulowane uchwyty i stopnie montowane są w 3 godziny bez kucia kafli i niszczenia ścian.\n[1:30 - 2:00] Podsumowanie: Sprawdzone rozwiązanie certyfikowane w programie Dostępność Plus.",
    handbook_pdf_url: "/documents/katalog_lazienki_dostepne.pdf",
    author_name: "Inż. Andrzej Mazur",
    author_organization: "Fundacja Architektura Bez Barier",
    author_email: "kontakt@dostepnelazienki.pl",
    replication_readiness_score: 94,
    likes_count: 97,
    matches_count: 48,
    tags: ["łazienka", "dostępność", "mieszkanie", "senior", "bariery architektoniczne"],
  },
  {
    id: 9,
    title: "Uniodzież – Odzież adaptacyjna dla osób na wózkach",
    slug: "uniodziez",
    category: 3,
    category_name: "Dla osób o ograniczonej mobilności",
    category_code: "mobility",
    maturity_stage: "sprawdzona",
    innovation_type: "produkt",
    short_summary: "Funkcjonalna odzież wierzchnia i przeciwdeszczowa z zapięciami magnetycznymi dostosowana do pozycji siedzącej.",
    full_description: "Uniodzież rozwiązuje problem wychłodzenia i trudności ubierania się osób poruszających się na wózkach inwalidzkich. Specjalny krój uniemożliwia wkręcanie się połów płaszcza w koła wózka, a zapięcia magnetyczne umożliwiają ubranie się jedną ręką.",
    target_audience: "Osoby na wózkach inwalidzkich, asystenci osobiści, domy pomocy społecznej",
    implementation_guide: "Wzory krawieckie i specyfikacja materiałowa udostępnione na licencji otwartej dla spółdzielni socjalnych i zakładów aktywności zawodowej.",
    video_url: "https://www.youtube.com/watch?v=hBY1SnqLXV0",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:40] Projektantka: Uniodzież to odzież wierzchnia skrojona anatomicznie do pozycji siedzącej na wózku inwalidzkim.\n[0:40 - 1:20] Prezentacja: Zastosowanie innowacyjnych magnesów zamiast guzików pozwala na samodzielne ubranie się w mniej niż minutę.\n[1:20 - 2:00] Rezultat: Komfort termiczny, ochrona przed wiatrem i pełne poczucie godności użytkownika.",
    handbook_pdf_url: "/documents/katalog_lazienki_dostepne.pdf",
    author_name: "Monika Szpener",
    author_organization: "Studio Projektowania Dostępnego",
    author_email: "kontakt@uniodziez.pl",
    replication_readiness_score: 88,
    likes_count: 41,
    matches_count: 18,
    tags: ["wózek inwalidzki", "odzież adaptacyjna", "samodzielność", "dostępność"],
  },
  {
    id: 10,
    title: "Zakupy bez barier – System asysty mobilnej",
    slug: "zakupy-bez-barier",
    category: 3,
    category_name: "Dla osób o ograniczonej mobilności",
    category_code: "mobility",
    maturity_stage: "sprawdzona",
    innovation_type: "usluga",
    short_summary: "System wolontariatu asystenckiego i lekkich wózków schodowych ułatwiający zaopatrzenie seniorów z ograniczoną mobilnością.",
    full_description: "Innowacyjna usługa koordynowana przez CUS lub lokalną parafię / OSP. Łączy wolontariuszy wyposażonych w ultralekkie wózki ze schodołazem mechanicznym z mieszkańcami bloków bez wind i wiejskich domów na wzgórzach.",
    target_audience: "Seniorzy o ograniczonej sprawności ruchowej, osoby z niepełnosprawnością, opiekunowie",
    implementation_guide: "Instrukcja wdrożenia usługi asystenckiej, zasady BHP dla wolontariuszy i wzory umów powierzenia.",
    video_url: "https://www.youtube.com/watch?v=v2cD6yEJQos",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:40] Wolontariusz: Program łączy lokalne sklepy spożywcze z siecią asystentów mobilnych pomagających osobom o ograniczonej sprawności ruchowej.\n[0:40 - 1:20] Przebieg usługi: Senior zgłasza potrzebę telefonicznie, a asystent przynosi zakupy lub towarzyszy w drodze do sklepu.\n[1:20 - 2:00] Bezpieczeństwo i kontakt z drugim człowiekiem każdego dnia.",
    handbook_pdf_url: "/documents/standard_osl_rops.pdf",
    author_name: "Małopolskie Forum Osób z Niepełnosprawnościami",
    author_organization: "Stowarzyszenie Pomocna Dłoń",
    author_email: "pomocnadlon@malopolska.pl",
    replication_readiness_score: 91,
    likes_count: 52,
    matches_count: 26,
    tags: ["zakupy", "asystent", "mobilność", "wsparcie codzienne", "seniorzy"],
  },
  {
    id: 11,
    title: "Strażnik – Osobisty asystent dźwiękowy dla niesłyszących",
    slug: "straznik",
    category: 4,
    category_name: "Dla osób z niepełnosprawnością sensoryczną",
    category_code: "sensory",
    maturity_stage: "sprawdzona",
    innovation_type: "technologia",
    short_summary: "Opaska wibracyjna i aplikacja mobilna rozpoznająca kluczowe dźwięki otoczenia (dzwonek, syrena, klakson, alarm).",
    full_description: "Strażnik to inteligentny system ostrzegania dla osób niesłyszących i słabosłyszących. Opaska wibrująca z mikrofonem kierunkowym analizuje częstotliwości dźwiękowe i informuje użytkownika o sygnałach alarmowych, dzwonku do drzwi czy płaczu dziecka.",
    target_audience: "Osoby głuche i słabosłyszące, seniorzy z ubytkiem słuchu, instytucje publiczne",
    implementation_guide: "Konfiguracja opaski przez Bluetooth z aplikacją mobilną z gotową biblioteką 18 predefiniowanych dźwięków domowych.",
    video_url: "https://www.youtube.com/watch?v=zYVr0zMAqWE",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:40] Twórca: Strażnik to inteligentna opaska wibrująca z mikrofonem kierunkowym wykrywająca krytyczne dźwięki otoczenia.\n[0:40 - 1:20] Demonstracja: W momencie wykrycia dzwonka do drzwi, klaksonu czy syreny alarmowej opaska wibruje ze zróżnicowaną pulsacją.\n[1:20 - 2:00] Podsumowanie: Zapewnia poczucie bezpieczeństwa w domu i na ulicy osobom niesłyszącym i niedosłyszącym.",
    handbook_pdf_url: "/documents/instrukcja_merkury.pdf",
    author_name: "Zespół Inżynierii Społecznej AGH i ROPS",
    author_organization: "Politechnika Krakowska & AGH",
    author_email: "straznik@agh.edu.pl",
    replication_readiness_score: 93,
    likes_count: 78,
    matches_count: 41,
    tags: ["niesłyszący", "opaska", "bezpieczeństwo", "technologia", "sensoryka"],
  },
  {
    id: 12,
    title: "Hear IT – Kursy programowania i cyfryzacji w PJM",
    slug: "hear-it",
    category: 4,
    category_name: "Dla osób z niepełnosprawnością sensoryczną",
    category_code: "sensory",
    maturity_stage: "sprawdzona",
    innovation_type: "narzedzie_cyfrowe",
    short_summary: "Dostępna platforma e-learningowa prowadzona w Polskim Języku Migowym przygotowująca głuchych do pracy w IT.",
    full_description: "Hear IT przełamuje barierę językową w kształceniu zawodowym. Oferuje kursy testowania oprogramowania, analizy danych i tworzenia stron www z wykładami natywnych głuchych lektorów PJM oraz napisami dla niesłyszących.",
    target_audience: "Osoby głuche i słabosłyszące, pracodawcy z branży technologicznej, fundacje aktywizacji zawodowej",
    implementation_guide: "Dostęp do platformy przez przeglądarkę internetową, moduł mentoringu w PJM i certyfikacja umiejętności.",
    video_url: "https://www.youtube.com/watch?v=uDLOSoCb3E8",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:45] Lektor w Polskim Języku Migowym: Hear IT to platforma szkoleniowa IT tłumaczona w całości na PJM z napisami rozszerzonymi.\n[0:45 - 1:30] Kursant: Uczymy się testowania oprogramowania i podstaw programowania frontendowego bez barier komunikacyjnych.\n[1:30 - 2:00] Sukces: Ponad 60 absolwentów znalazło stałe zatrudnienie w firmach technologicznych.",
    handbook_pdf_url: "/documents/instrukcja_merkury.pdf",
    author_name: "Fundacja Edukacji Niesłyszących",
    author_organization: "Inkubator Dostępności Cyfrowej",
    author_email: "kontakt@hearit-pjm.pl",
    replication_readiness_score: 95,
    likes_count: 83,
    matches_count: 46,
    tags: ["PJM", "głusi", "IT", "edukacja", "dostępność cyfrowa", "zatrudnienie"],
  },
  {
    id: 13,
    title: "NGOZ – Dźwiękowy nawigator przestrzeni publicznej",
    slug: "ngoz",
    category: 4,
    category_name: "Dla osób z niepełnosprawnością sensoryczną",
    category_code: "sensory",
    maturity_stage: "testy",
    innovation_type: "technologia",
    short_summary: "System mikronadajników radiowych i audiodeskrypcji ułatwiający niewidomym poruszanie się po urzędach i przychodniach.",
    full_description: "Nawigator Głosowy Obiektów Zamkniętych (NGOZ) instalowany jest w budynkach użyteczności publicznej. Po wejściu do urzędu aplikacja w telefonie niewidomego odczytuje wskazówki przestrzenne i prowadzi do pokoju lub windy.",
    target_audience: "Osoby niewidome i słabowidzące, urzędy gmin, szpitale, biblioteki",
    implementation_guide: "Instalacja beaconów BLE w ciągach komunikacyjnych obiektu i wprowadzenie mapy audiodeskrypcyjnej.",
    video_url: "https://www.youtube.com/watch?v=ZiGxSX-VRfg",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:40] Ekspert ds. dostępności: System NGOZ wykorzystuje mikronadajniki radiowe montowane w urzędach gmin i przychodniach.\n[0:40 - 1:20] Nawigacja: Smartfon osoby niewidomej odczytuje audiodeskrypcję otoczenia i prowadzi krok po kroku do odpowiedniego okienka.\n[1:20 - 2:00] Pełna niezależność osób z dysfunkcją wzroku w budynkach publicznych.",
    handbook_pdf_url: "/documents/instrukcja_merkury.pdf",
    author_name: "dr inż. Paweł Kowalczyk",
    author_organization: "Politechnika Krakowska & ROPS",
    author_email: "ngoz@innowacjespoleczne.pl",
    replication_readiness_score: 87,
    likes_count: 49,
    matches_count: 22,
    tags: ["niewidomi", "audiodeskrypcja", "nawigacja", "urząd gminy", "dostępność"],
  },
  {
    id: 14,
    title: "Paszport pacjenta z chorobą rzadką",
    slug: "paszport-pacjenta-z-choroba-rzadka",
    category: 5,
    category_name: "Dla zdrowia i medycyny",
    category_code: "health",
    maturity_stage: "sprawdzona",
    innovation_type: "narzedzie_cyfrowe",
    short_summary: "Karta ratunkowa i profil cyfrowy z kodem QR skracający czas diagnozy i ratujący życie w Szpitalnym Oddziale Ratunkowym.",
    full_description: "Pacjenci z chorobami rzadkimi w sytuacji nagłego zagrożenia życia często otrzymują niewłaściwe leki na SOR. Paszport Pacjenta zawiera zweryfikowany przez klinikę protokół postępowania ratunkowego, listę leków zakazanych oraz bezpośredni telefon całodobowy do lekarza prowadzącego.",
    target_audience: "Osoby z chorobami rzadkimi i przewlekłymi, zespoły ratownictwa medycznego, szpitale",
    implementation_guide: "Rejestracja pacjenta w systemie przez lekarza specjalistę, wydanie wodoodpornej karty z chipem NFC i kodem QR.",
    video_url: "https://www.youtube.com/watch?v=7QedTbxzsPk",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:40] Lekarz SOR: Przy chorobach rzadkich każda minuta ma kluczowe znaczenie. Paszport pacjenta w formie fizycznej karty z kodem QR daje natychmiastowy dostęp do protokołu ratunkowego.\n[0:40 - 1:20] Bezpieczeństwo: Karta zawiera listę leków przeciwwskazanych i bezpośredni kontakt do kliniki specjalistycznej.\n[1:20 - 2:00] Narzędzie ratujące życie wdrożone w małopolskich szpitalach.",
    handbook_pdf_url: "/documents/podrecznik_bawita_rops.pdf",
    author_name: "dr n. med. Anna Jabłońska",
    author_organization: "Krajowe Forum na Rzecz Terapii Chorób Rzadkich",
    author_email: "paszport@chorobyrzadkie.pl",
    replication_readiness_score: 96,
    likes_count: 91,
    matches_count: 53,
    tags: ["zdrowie", "choroby rzadkie", "SOR", "karta ratunkowa", "medycyna"],
  },
  {
    id: 15,
    title: "Himalaje autyzmu – Protokół wizyt stomatologicznych i medycznych",
    slug: "himalaje-autyzmu",
    category: 5,
    category_name: "Dla zdrowia i medycyny",
    category_code: "health",
    maturity_stage: "sprawdzona",
    innovation_type: "metoda",
    short_summary: "Standard adaptacyjny i wizualny przygotowujący dzieci w spektrum autyzmu do zabiegów stomatologicznych bez narkozy.",
    full_description: "Metoda oparta na desensytyzacji sensorycznej. Dziecko przed zabiegiem otrzymuje książeczkę obrazkową, nagrania dźwięków wiertła i ssaka do odsłuchania w domu oraz odbywa krótką wizytę adaptacyjną.",
    target_audience: "Dzieci i dorośli w spektrum autyzmu, gabinety stomatologiczne, przychodnie POZ",
    implementation_guide: "Pakiet szkoleniowy dla personelu medycznego, piktogramy gabinetowe i słuchawki wygłuszające.",
    video_url: "https://www.youtube.com/watch?v=q31uQ435YAo",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:45] Stomatolog: Wizyta u dentysty bywa dla dziecka w spektrum autyzmu traumatycznym przeżyciem z powodu nadwrażliwości sensorycznej na światło i dźwięk.\n[0:45 - 1:30] Metoda: Protokół Himalaje Autyzmu to 5-etapowy proces oswajania gabinetu z użyciem słuchawek wygłuszających i kart wizualnych.\n[1:30 - 2:00] Efekt: 85% dzieci udaje się wyleczyć bez znieczulenia ogólnego i hospitalizacji.",
    handbook_pdf_url: "/documents/podrecznik_bawita_rops.pdf",
    author_name: "Fundacja Odnaleźć Siebie",
    author_organization: "Wojewódzka Przychodnia Stomatologiczna w Krakowie",
    author_email: "kontakt@odnalezcsiebie.pl",
    replication_readiness_score: 94,
    likes_count: 68,
    matches_count: 35,
    tags: ["autyzm", "spektrum", "stomatologia", "sensoryka", "dzieci"],
  },
  {
    id: 16,
    title: "Gra o zdrowie – Readaptacja po kryzysie psychicznym",
    slug: "gra-o-zdrowie",
    category: 5,
    category_name: "Dla zdrowia i medycyny",
    category_code: "health",
    maturity_stage: "sprawdzona",
    innovation_type: "metoda",
    short_summary: "Warsztatowe narzędzie wspierające osoby po kryzysach psychotycznych w planowaniu powrotu do aktywności i pracy.",
    full_description: "Gra o zdrowie to metoda opracowana przez psychologów i osoby z doświadczeniem kryzysu psychicznego. Uczy monitorowania wczesnych symptomów pogorszenia samopoczucia, budowania sieci oparcia i planowania realnych celów zawodowych.",
    target_audience: "Osoby po hospitalizacjach psychiatrycznych, środowiskowe centra zdrowia psychicznego, rodziny",
    implementation_guide: "Podręcznik trenera, zestaw kart zasobów i plan kryzysowy (WRAP) do wypełnienia z asystentem zdrowienia.",
    video_url: "https://www.youtube.com/watch?v=YRzg98fveHc",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:40] Psychoterapeutka: Gra o zdrowie to narzędzie warsztatowe wspierające osoby po hospitalizacji psychiatrycznej w powrocie do ról społecznych.\n[0:40 - 1:20] Warsztat: Uczestnicy w bezpiecznej atmosferze planują małe kroki: wyjście do sklepu, kontakt ze znajomym, wizytę w urzędzie pracy.\n[1:20 - 2:00] Odbudowa poczucia własnej wartości i zapobieganie nawrotom kryzysu.",
    handbook_pdf_url: "/documents/przewodnik_senior_cuder.pdf",
    author_name: "Stowarzyszenie Otwórzcie Drzwi",
    author_organization: "Środowiskowe Centrum Zdrowia Psychicznego w Krakowie",
    author_email: "otworzciedrzwi@krakow.pl",
    replication_readiness_score: 90,
    likes_count: 59,
    matches_count: 31,
    tags: ["zdrowie psychiczne", "kryzys", "readaptacja", "psychiatria środowiskowa", "grupa wsparcia"],
  },
  {
    id: 17,
    title: "Kawiarenka Naprawcza – Międzypokoleniowy punkt wymiany umiejętności",
    slug: "kawiarenka-naprawcza",
    category: 6,
    category_name: "Dla rynku pracy",
    category_code: "labor",
    maturity_stage: "sprawdzona",
    innovation_type: "metoda",
    short_summary: "Otwarte warsztaty, gdzie seniorzy-majsterkowicze uczą młodzież naprawy sprzętu, budując relacje i redukując odpady.",
    full_description: "Kawiarenka Naprawcza (Repair Cafe) łączy cele ekologiczne z włączeniem społecznym i reintegracją zawodową. Seniorzy odyskują poczucie sprawczości, a młodzież zdobywa praktyczne kompetencje techniczne i rzemieślnicze pod okiem mentorów.",
    target_audience: "Seniorzy rzemieślnicy, młodzież szkolna, rodziny z dziećmi, samorządy",
    implementation_guide: "Zestaw narzędzi w skrzynce, regulamin BHP punktu naprawczego i wzory plakatów promocyjnych.",
    video_url: "https://www.youtube.com/watch?v=sample_kawiarenka",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:45] Katarzyna Zielińska: Kawiarenka Naprawcza to nie tylko serwis, to przede wszystkim spotkanie pokoleń przy stole warsztatowym.\n[0:45 - 1:30] Senior instruuje nastolatka, jak wymienić bezpiecznik i przylutować kabel w zabytkowej lampce.\n[1:30 - 2:00] Efekt: Sprzęt działa, a uczestnicy umawiają się na kolejne spotkanie w świetlicy wiejskiej.",
    handbook_pdf_url: "/documents/kawiarenka_naprawcza_poradnik.pdf",
    author_name: "Katarzyna Zielińska",
    author_organization: "Fundacja Aktywna Małopolska (Tarnów)",
    author_email: "kontakt@aktywna-malopolska.pl",
    replication_readiness_score: 92,
    likes_count: 76,
    matches_count: 32,
    tags: ["naprawy", "majsterkowanie", "ekologia", "międzypokoleniowe", "NGO", "rynek pracy"],
  },
  {
    id: 18,
    title: "Agencja pracy incydentalnej dla osób po kryzysach",
    slug: "agencja-pracy-incydentalnej",
    category: 6,
    category_name: "Dla rynku pracy",
    category_code: "labor",
    maturity_stage: "testy",
    innovation_type: "usluga",
    short_summary: "Elastyczny model mikro-zleceń (2-4h) umożliwiający powrót na rynek pracy bez ryzyka utraty świadczeń rentowych.",
    full_description: "Tradycyjny etat 8h bywa zbyt dużym obciążeniem dla osób wychodzących z kryzysów zdrowia psychicznego. Agencja pracy incydentalnej oferuje krótkie, wspierane przez mentora zlecenia w administracji, ogrodnictwie i kulturze.",
    target_audience: "Osoby z orzeczeniem o niepełnosprawności, podopieczni CUS, lokalne firmy i JST",
    implementation_guide: "Model organizacyjno-prawny mikro-zleceń dla spółdzielni socjalnych i centrów integracji społecznej.",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:40] Koordynator zatrudnienia socjalnego: Tradycyjny etat bywa zbyt obciążający dla osób powracających do zdrowia po załamaniach psychicznych.\n[0:40 - 1:20] Elastyczność: Nasza agencja oferuje zlecenia 2-3 godzinne przy archiwizacji i ogrodnictwie z opieką mentora.\n[1:20 - 2:00] Bezpieczne wejście na rynek pracy z zachowaniem świadczeń rentowych.",
    handbook_pdf_url: "/documents/wzor_kalkulacji_rops.pdf",
    author_name: "Spółdzielnia Socjalna Ostoja",
    author_organization: "Regionalny Ośrodek Polityki Społecznej w Krakowie",
    author_email: "ostoja@ekonomiaspoleczna.pl",
    replication_readiness_score: 86,
    likes_count: 44,
    matches_count: 23,
    tags: ["reintegracja", "praca", "ekonomia społeczna", "kryzys psychiczny", "CUS"],
  },
  {
    id: 19,
    title: "Konsultant ETR – Dostępna informacja publiczna",
    slug: "konsultant-etr",
    category: 6,
    category_name: "Dla rynku pracy",
    category_code: "labor",
    maturity_stage: "sprawdzona",
    innovation_type: "usluga",
    short_summary: "Nowy zawód dla osób z niepełnosprawnością intelektualną jako certyfikowanych audytorów tekstów łatwych do czytania.",
    full_description: "Samorzecznicy z niepełnosprawnością intelektualną zostają zatrudnieni w urzędach gmin i bibliotekach jako eksperci ETR. Weryfikują pisma urzędowe, procedury i strony internetowe, upewniając się, że każdy mieszkaniec zrozumie treść decyzji.",
    target_audience: "Osoby z niepełnosprawnością intelektualną, urzędy gmin, instytucje publiczne",
    implementation_guide: "Program 40-godzinnego szkolenia certyfikującego audytora tekstu łatwego do czytania (ETR) zgodnie ze standardami UE.",
    video_url: "https://www.youtube.com/watch?v=BK6a8fjELR0",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:40] Samorzecznik: Razem z zespołem testujemy pisma urzędowe i strony internetowe, sprawdzając, czy są zrozumiałe dla każdego.\n[0:40 - 1:20] Standard: Tłumaczymy skomplikowane decyzje administracyjne na tekst łatwy do czytania i rozumienia (Easy-to-Read).\n[1:20 - 2:00] Gminy zatrudniają osoby z niepełnosprawnością jako certyfikowanych audytorów dostępności.",
    handbook_pdf_url: "/documents/instrukcja_merkury.pdf",
    author_name: "Fundacja Rozwoju Dostępności",
    author_organization: "Centrum Usług Społecznych & PFRON",
    author_email: "etr@dostepnosc.org.pl",
    replication_readiness_score: 94,
    likes_count: 82,
    matches_count: 45,
    tags: ["ETR", "dostępność", "tekst łatwy do czytania", "samorzecznictwo", "urząd gminy"],
  },
  {
    id: 20,
    title: "Health Guide PL – Przewodnik po opiece medycznej dla cudzoziemców",
    slug: "health-guide-pl",
    category: 7,
    category_name: "Dla cudzoziemców",
    category_code: "foreigners",
    maturity_stage: "sprawdzona",
    innovation_type: "narzedzie_cyfrowe",
    short_summary: "Wielojęzyczny asystent cyfrowy i piktograficzny informator po systemie POZ i NFZ dla migrantów i uchodźców.",
    full_description: "Health Guide PL tłumaczy skomplikowane procedury publicznej opieki zdrowotnej w Polsce na język ukraiński, angielski i hiszpański. Zawiera wzory dialogów z rejestracją, słownik dolegliwości i interaktywną mapę przychodni w Małopolsce świadczących pomoc bezpłatnie.",
    target_audience: "Cudzoziemcy, uchodźcy, pracownicy przychodni POZ, pracownicy socjalni CUS",
    implementation_guide: "Udostępnienie aplikacji mobilnej oraz dystrybucja drukowanych przewodników piktograficznych w punktach informacyjnych gmin.",
    video_url: "https://www.youtube.com/watch?v=7QedTbxzsPk",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:40] Koordynatorka integracji: Health Guide PL to wielojęzyczny asystent cyfrowy tłumaczący strukturę polskiego systemu zdrowia.\n[0:40 - 1:20] Funkcjonalności: Aplikacja krok po kroku wyjaśnia, jak zapisać się do lekarza POZ, uzyskać e-receptę i wezwać pomoc w nocy.\n[1:20 - 2:00] Ponad 12 000 rozwiązanych zapytań pacjentów w pierwszym roku działania.",
    handbook_pdf_url: "/documents/standard_osl_rops.pdf",
    author_name: "Centrum Dialogu Wielokulturowego",
    author_organization: "Fundacja Przestrzeń Wspólna",
    author_email: "kontakt@healthguide.pl",
    replication_readiness_score: 91,
    likes_count: 67,
    matches_count: 38,
    tags: ["cudzoziemcy", "zdrowie", "migracja", "aplikacja", "POZ", "wielojęzyczność"],
  },
  {
    id: 21,
    title: "Dialog ponad kulturami – Mediacje sąsiedzkie i szkolne",
    slug: "dialog-ponad-kulturami",
    category: 7,
    category_name: "Dla cudzoziemców",
    category_code: "foreigners",
    maturity_stage: "sprawdzona",
    innovation_type: "metoda",
    short_summary: "Standard rozwiązywania nieporozumień lokatorskich i szkolnych z udziałem mediatora międzykulturowego w gminie.",
    full_description: "Wzrost liczby obcokrajowców w Małopolsce rodzi wyzwania integracji sąsiedzkiej. Innowacja wprowadza funkcję mediatora międzykulturowego, który w atmosferze zaufania pomaga rozwiązywać drobne spory dotyczące ciszy nocnej czy integracji w klasie szkolnej.",
    target_audience: "Mieszkańcy gmin, zarządcy nieruchomości, dyrektorzy szkół, cudzoziemcy",
    implementation_guide: "Program 24-godzinnego szkolenia mediacyjnego dla pracowników socjalnych CUS i pedagogów szkolnych.",
    video_url: "https://www.youtube.com/watch?v=o5TP10ZStNA",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:40] Mediatorka międzykulturowa: W społecznościach wielokulturowych drobne nieporozumienia językowe mogą prowadzić do izolacji i konfliktów sąsiedzkich.\n[0:40 - 1:20] Warsztat: Model szkolenia asystentów integracji w sołectwach i szkołach uczy budowania porozumienia i wzajemnego szacunku.\n[1:20 - 2:00] Rozwiązano ponad 80 spraw spornych w małopolskich gminach bez angażowania policji.",
    handbook_pdf_url: "/documents/przewodnik_senior_cuder.pdf",
    author_name: "Stowarzyszenie Mosty Zrozumienia",
    author_organization: "Ośrodek Mediacji Społecznej przy ROPS",
    author_email: "mediacje@dialogkultur.pl",
    replication_readiness_score: 89,
    likes_count: 48,
    matches_count: 25,
    tags: ["mediacja", "cudzoziemcy", "integracja", "szkoła", "sąsiedztwo"],
  },
  {
    id: 22,
    title: "Szlakiem ludzi bezdomnych – Mobilny punkt higieny i wsparcia",
    slug: "szlakiem-ludzi-bezdomnych",
    category: 8,
    category_name: "Dla osób w kryzysie bezdomności",
    category_code: "homelessness",
    maturity_stage: "sprawdzona",
    innovation_type: "usluga",
    short_summary: "Specjalistyczny ambulans oferujący doraźną pomoc medyczną, pralnię, czystą odzież i rozmowę ze streetworkerem.",
    full_description: "Wielu ludzi w kryzysie bezdomności unika tradycyjnych schronisk i noclegowni z lęku przed odrzuceniem. Mobilny punkt dociera na dworce, koczowiska i pustostany, oferując bezpieczną kąpiel, opatrunek pielęgniarski oraz zaufany kontakt ze streetworkerem.",
    target_audience: "Osoby w kryzysie bezdomności, streetworkerzy, ratownicy medyczni, samorządy",
    implementation_guide: "Plan tras mobilnego punktu higienicznego, protokół sanitarny i zasady współpracy z patrolami straży miejskiej i policji.",
    video_url: "https://www.youtube.com/watch?v=hohm7FnsukY",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:40] Streetworker: Wiele osób w kryzysie bezdomności obawia się wizyty w tradycyjnych placówkach pomocowych ze względu na wstyd.\n[0:40 - 1:20] Mobilna pomoc: Ambulans zapewnia ciepły posiłek, czystą odzież, opatrunek pielęgniarski oraz rozmowę z psychologiem bezpośrednio w terenie.\n[1:20 - 2:00] Pierwszy most do wyjścia z kryzysu i podjęcia terapii uzależnień.",
    handbook_pdf_url: "/documents/standard_osl_rops.pdf",
    author_name: "Dzieło Pomocy św. Ojca Pio",
    author_organization: "Krakowskie Porozumienie Pomocy Osobom Bezdomnym",
    author_email: "kontakt@dzielopomocy.pl",
    replication_readiness_score: 95,
    likes_count: 92,
    matches_count: 51,
    tags: ["bezdomność", "streetworking", "higiena", "pomoc doraźna", "kryzys"],
  },
  {
    id: 23,
    title: "Ścieżka Feniksa – Ekologiczna readaptacja w gospodarstwie społecznym",
    slug: "sciezka-feniksa",
    category: 8,
    category_name: "Dla osób w kryzysie bezdomności",
    category_code: "homelessness",
    maturity_stage: "testy",
    innovation_type: "metoda",
    short_summary: "Program readaptacji łączący mieszkalnictwo treningowe z pracą w wiejskim gospodarstwie permakulturowym.",
    full_description: "Ścieżka Feniksa to kompleksowy program wychodzenia z długotrwałej bezdomności. Uczestnicy mieszkają w kameralnym domu wiejskim, uczą się ekologicznej uprawy warzyw i hodowli zwierząt, zyskując poczucie bezpieczeństwa i sprawczości.",
    target_audience: "Osoby długotrwale bezdomne, centra integracji społecznej, organizacje pozarządowe",
    implementation_guide: "Regulamin pobytu w gospodarstwie, 12-miesięczny harmonogram terapeutyczno-zawodowy i plan usamodzielnienia mieszkaniowego.",
    video_url: "https://www.youtube.com/watch?v=4DKP0XK440U",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:40] Kierownik gospodarstwa: Ścieżka Feniksa łączy mieszkalnictwo treningowe z pracą w wiejskim gospodarstwie ekologicznym.\n[0:40 - 1:20] Terapia przez pracę: Uczestnicy opiekują się zwierzętami, uprawiają warzywa i odbudowują poczucie sprawczości z dala od pokus.\n[1:20 - 2:00] 70% uczestników po rocznym pobycie podejmuje samodzielne zatrudnienie i wynajmuje mieszkanie.",
    handbook_pdf_url: "/documents/wzor_kalkulacji_rops.pdf",
    author_name: "Fundacja Odrodzenie",
    author_organization: "Centrum Integracji Społecznej w Gorlicach",
    author_email: "feniks@fundacjaodrodzenie.org",
    replication_readiness_score: 87,
    likes_count: 53,
    matches_count: 28,
    tags: ["bezdomność", "mieszkalnictwo treningowe", "ekologia", "gospodarstwo", "readaptacja"],
  },
  {
    id: 24,
    title: "Merkury – Symulator samoobsługowy dla osób z niepełnosprawnościami",
    slug: "merkury-symulator-samoobslugowy",
    category: 9,
    category_name: "Dla osób z niepełnosprawnością intelektualną",
    category_code: "intellectual",
    maturity_stage: "testy",
    innovation_type: "technologia",
    short_summary: "Interaktywny trenażer ułatwiający naukę korzystania z biletomatów, bankomatów i kas samoobsługowych bez stresu.",
    full_description: "Merkury to oprogramowanie połączone z fizycznym dotykowym ekranem treningowym, które symuluje realne miejskie kasy i biletomaty. Umożliwia osobom w spektrum autyzmu i z niepełnosprawnością intelektualną bezstresowe ćwiczenie zakupów.",
    target_audience: "Osoby z niepełnosprawnością intelektualną, spektrum autyzmu, WTZ, szkoły specjalne",
    implementation_guide: "Instalacja na tablecie lub monitorze dotykowym. Dostępne 12 scenariuszy życiowych o różnym stopniu trudności.",
    video_url: "https://www.youtube.com/watch?v=BK6a8fjELR0",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:45] Trener samodzielności: Merkury to dotykowy interfejs odtwarzający prawdziwe biletomaty, kasy i bankomaty w bezpiecznym środowisku WTZ.\n[0:45 - 1:30] Ćwiczenie: Użytkownicy w spektrum autyzmu i z niepełnosprawnością intelektualną trenują płatność kartą i wybór biletów bez presji kolejki.\n[1:30 - 2:00] Rezultat: Przełamanie bariery lęku i samodzielne podróże komunikacją miejską.",
    handbook_pdf_url: "/documents/instrukcja_merkury.pdf",
    author_name: "Piotr Wójcik",
    author_organization: "Spółdzielnia Socjalna Cyfrowy Horyzont",
    author_email: "biuro@merkury-trening.pl",
    replication_readiness_score: 92,
    likes_count: 68,
    matches_count: 24,
    tags: ["trening samodzielności", "technologia", "biletomat", "WTZ", "dostępność"],
  },
  {
    id: 25,
    title: "Patryk i Kropka – Książki ETR wspierające samodzielność",
    slug: "patryk-i-kropka",
    category: 9,
    category_name: "Dla osób z niepełnosprawnością intelektualną",
    category_code: "intellectual",
    maturity_stage: "sprawdzona",
    innovation_type: "produkt",
    short_summary: "Seria ilustrowanych opowiadań w formacie łatwym do czytania (ETR) uczących młodzież zasad samodzielności i bezpieczeństwa.",
    full_description: "Patryk i Kropka to innowacyjna seria książek przygotowana zgodnie z europejskim standardem tekstów łatwych do czytania (Easy-to-Read). Bohaterowie przeżywają codzienne sytuacje: wizytę w banku, pierwszą miłość, wyjazd pociągiem czy odmowę obcej osobie.",
    target_audience: "Młodzież i dorośli z niepełnosprawnością intelektualną, warsztaty terapii zajęciowej, biblioteki gminne",
    implementation_guide: "Zestaw 6 tomów opowiadań wraz z kartami pytań dyskusyjnych dla instruktorów i rodziców.",
    video_url: "https://youtu.be/JfmyToWVuOs",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:40] Autorka: Patryk i Kropka to seria bogato ilustrowanych książek przygotowanych w formacie łatwym do czytania (ETR).\n[0:40 - 1:20] Treść: Opowiadania poruszają ważne życiowo tematy: samodzielne zakupy, wizytę u lekarza, granice cielesne i asertywność.\n[1:20 - 2:00] Sprawdzone narzędzie dydaktyczne w szkołach specjalnych i warsztatach terapii w całej Małopolsce.",
    handbook_pdf_url: "/documents/instrukcja_merkury.pdf",
    author_name: "Magdalena Ciechowska",
    author_organization: "Fundacja Generacje",
    author_email: "kontakt@generacje.pl",
    replication_readiness_score: 93,
    likes_count: 71,
    matches_count: 37,
    tags: ["ETR", "niepełnosprawność intelektualna", "samodzielność", "książka", "WTZ"],
  },
  {
    id: 26,
    title: "Urzędowy ambaras – Symulacyjna gra planszowa załatwiania spraw",
    slug: "urzedowy-ambaras",
    category: 9,
    category_name: "Dla osób z niepełnosprawnością intelektualną",
    category_code: "intellectual",
    maturity_stage: "sprawdzona",
    innovation_type: "metoda",
    short_summary: "Edukacyjna gra planszowa przygotowująca podopiecznych WTZ do samodzielnej wizyty w urzędzie gminy i na poczcie.",
    full_description: "Urzędowy ambaras w przystępny i humorystyczny sposób oswaja procedury administracyjne. Uczestnicy wcielają się w mieszkańców załatwiających dowód osobisty, meldunek czy odbiór przesyłki, ucząc się wypełniania formularzy i kulturalnej komunikacji z urzędnikami.",
    target_audience: "Osoby z niepełnosprawnością intelektualną, uczestnicy WTZ i ŚDS, szkoły branżowe specjalne",
    implementation_guide: "Zestaw gry planszowej z banknotami edukacyjnymi, makietami dokumentów i poradnikiem metodycznym dla instruktora.",
    video_url: "https://www.youtube.com/watch?v=o5TP10ZStNA",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:40] Instruktor WTZ: Urzędowy ambaras to symulacyjna gra edukacyjna ucząca, jak załatwić dowód osobisty czy złożyć wniosek o dofinansowanie.\n[0:40 - 1:20] Rozgrywka: Gracze losują zadania, wypełniają uproszczone formularze i ćwiczą dialog z urzędnikiem w formie odgrywania ról.\n[1:20 - 2:00] Podopieczni zyskują odwagę i wiedzę niezbędną do załatwiania spraw w urzędzie gminy.",
    handbook_pdf_url: "/documents/przewodnik_senior_cuder.pdf",
    author_name: "Stowarzyszenie Przyjaciół WTZ",
    author_organization: "Powiatowe Centrum Pomocy Rodzinie w Tarnowie",
    author_email: "wtz-tarnow@innowacjespoleczne.pl",
    replication_readiness_score: 90,
    likes_count: 63,
    matches_count: 30,
    tags: ["gra planszowa", "urząd", "samodzielność", "WTZ", "niepełnosprawność intelektualna"],
  },
];

export const FALLBACK_CHALLENGES: RegionalChallenge[] = [
  {
    id: 1,
    title: "Samotność seniorów w rozproszonych sołectwach górskich",
    slug: "samotnosc-seniorow-w-solectwach",
    category_name: "Dla seniorów",
    category_code: "seniors",
    county_name: "Powiat nowosądecki",
    county_slug: "nowosadecki",
    summary: "Ponad 35% seniorów w małych wsiach powiatu nowosądeckiego mieszka samotnie, z dala od przystanków autobusowych i placówek opieki.",
    full_analysis: "Analiza ROPS Kraków wskazuje na dynamiczny wzrost zjawiska izolacji geograficzno-społecznej. Osoby 75+ w okresie zimowym bywają odcięte od pomocy sąsiedzkiej. Niezbędne jest wprowadzenie mobilnych usług asystenckich i narzędzi stymulacji poznawczej (takich jak BaWita czy Senior CUDER).",
    statistical_data: {
      "Liczba samotnych seniorów": 7450,
      "Gospodarstwa 1-osobowe 65+": "34.8%",
      "Średni czas dojazdu do OPS": "42 minuty",
      "Wskaźnik deinstytucjonalizacji": "18.2%",
    },
    key_needs: [
      "Mobilne wizyty asystentów domowych",
      "Pakiety stymulacji sensorycznej BaWita",
      "Transport na życzenie (door-to-door)",
    ],
    related_innovations: [FALLBACK_INNOVATIONS[0], FALLBACK_INNOVATIONS[1], FALLBACK_INNOVATIONS[2]],
  },
  {
    id: 2,
    title: "Bariery architektoniczne w wiejskim zasobie mieszkaniowym",
    slug: "bariery-architektoniczne-wies",
    category_name: "Dla osób o ograniczonej mobilności",
    category_code: "mobility",
    county_name: "Powiat gorlicki",
    county_slug: "gorlicki",
    summary: "Niedostępne łazienki i wysokie progi uniemożliwiające bezpieczne funkcjonowanie seniorów w domach jednorodzinnych.",
    full_analysis: "Większość domów powstała w latach 70-80. XX wieku bez uwzględnienia potrzeb osób starszych.",
    statistical_data: {
      "Odsetek niedostosowanych łazienek": "68%",
      "Wypadki upadków rocznie": 310,
    },
    key_needs: [
      "Szybkie modularne pakiety adaptacyjne",
      "Dofinansowanie montażu uchwytów",
    ],
    related_innovations: [FALLBACK_INNOVATIONS[7], FALLBACK_INNOVATIONS[8], FALLBACK_INNOVATIONS[9]],
  },
  {
    id: 3,
    title: "Koordynacja usług deinstytucjonalnych i animacja sąsiedzka",
    slug: "koordynacja-uslug-spolecznych-myslenicki",
    category_name: "Dla dzieci, młodzieży i rodziny",
    category_code: "youth_family",
    county_name: "Powiat myślenicki",
    county_slug: "myslenicki",
    summary: "Przejście z modelu zasiłkowego na zintegrowane usługi CUS i oddolną aktywność sołecką.",
    full_analysis: "CUS Myślenice wdraża model organizatora społeczności lokalnej wspierającego rodziny i samopomoc wiejską.",
    statistical_data: {
      "Liczba inicjatyw sąsiedzkich": 34,
      "Zmniejszenie zapotrzebowania na DPS": "18%",
    },
    key_needs: [
      "Standard Organizatora Społeczności Lokalnej",
      "Kluby rodzica i wsparcia sąsiedzkiego",
    ],
    related_innovations: [FALLBACK_INNOVATIONS[3], FALLBACK_INNOVATIONS[6]],
  },
  {
    id: 4,
    title: "Kryzys zdrowia psychicznego dzieci i młodzieży po pandemii",
    slug: "kryzys-zdrowia-psychicznego-mlodziezy",
    category_name: "Dla zdrowia i medycyny",
    category_code: "health",
    county_name: "Powiat krakowski",
    county_slug: "krakowski",
    summary: "Lawinowy wzrost stanów lękowych, depresyjnych i izolacji społecznej wśród nastolatków w aglomeracji krakowskiej.",
    full_analysis: "Czas oczekiwania na wizytę u psychiatry dziecięcego przekracza 9 miesięcy. Konieczna wczesna interwencja środowiskowa.",
    statistical_data: {
      "Wzrost interwencji kryzysowych": "45%",
      "Liczba młodzieży zagrożonej": 5200,
    },
    key_needs: [
      "Narzędzia dialogu bez stygmatyzacji w szkołach",
      "Wsparcie rówieśnicze i warsztaty komiksowe",
    ],
    related_innovations: [FALLBACK_INNOVATIONS[4], FALLBACK_INNOVATIONS[14], FALLBACK_INNOVATIONS[15]],
  },
  {
    id: 5,
    title: "Dostępność cyfrowa i sensoryczna instytucji dla osób niesłyszących i niewidomych",
    slug: "dostepnosc-sensoryczna-tarnowski",
    category_name: "Dla osób z niepełnosprawnością sensoryczną",
    category_code: "sensory",
    county_name: "Powiat tarnowski",
    county_slug: "tarnowski",
    summary: "Trudności osób z uszkodzeniami zmysłów w samodzielnym załatwianiu spraw w urzędach gmin i przychodniach.",
    full_analysis: "Niski odsetek urzędników władających PJM oraz brak audiodeskrypcji w budynkach użyteczności publicznej.",
    statistical_data: {
      "Odsetek budynków bez nawigacji głosowej": "82%",
      "Liczba mieszkańców z wadami zmysłów": 4100,
    },
    key_needs: [
      "Opaski wibracyjne i asystenci dźwiękowi",
      "Nawigacja radiowa NGOZ",
      "Kształcenie IT w PJM",
    ],
    related_innovations: [FALLBACK_INNOVATIONS[10], FALLBACK_INNOVATIONS[11], FALLBACK_INNOVATIONS[12]],
  },
  {
    id: 6,
    title: "Bariery terenowe i wykluczenie komunikacyjne osób zależnych na Podhalu",
    slug: "wykluczenie-komunikacyjne-podhale",
    category_name: "Dla osób o ograniczonej mobilności",
    category_code: "mobility",
    county_name: "Powiat tatrzański",
    county_slug: "tatrzanski",
    summary: "Trudne ukształtowanie terenu i rozproszona zabudowa utrudniają dostęp do lekarzy i aptek osobom na wózkach.",
    full_analysis: "Stromizny, brak chodników i śnieg zimą całkowicie unieruchamiają seniorów i osoby z niepełnosprawnościami w domach.",
    statistical_data: {
      "Odsetek domów na stokach bez dojazdu zimą": "29%",
      "Seniorzy zależni": 1850,
    },
    key_needs: [
      "Mobilne usługi asystenckie",
      "Odzież termiczna i adaptacyjna",
      "Dojazd door-to-door",
    ],
    related_innovations: [FALLBACK_INNOVATIONS[7], FALLBACK_INNOVATIONS[8], FALLBACK_INNOVATIONS[9]],
  },
];

export const FALLBACK_ADMIN_TRENDS: AdminTrendsResponse = {
  total_submissions: 18,
  total_ideas: 7,
  total_pilots: 3,
  total_partnerships: 5,
  by_category: [
    { category_id: 1, category_name: "Dla seniorów", category_code: "seniors", submissions_count: 8, innovations_count: 2 },
    { category_id: 2, category_name: "Dla dzieci, młodzieży i rodziny", category_code: "youth_family", submissions_count: 3, innovations_count: 1 },
    { category_id: 3, category_name: "Dla osób o ograniczonej mobilności", category_code: "mobility", submissions_count: 4, innovations_count: 1 },
    { category_id: 4, category_name: "Dla osób z niepełnosprawnością sensoryczną", category_code: "sensory", submissions_count: 2, innovations_count: 2 },
    { category_id: 5, category_name: "Dla zdrowia i medycyny", category_code: "health", submissions_count: 5, innovations_count: 0 },
    { category_id: 6, category_name: "Dla rynku pracy", category_code: "labor", submissions_count: 1, innovations_count: 1 },
    { category_id: 7, category_name: "Dla cudzoziemców", category_code: "foreigners", submissions_count: 1, innovations_count: 0 },
    { category_id: 8, category_name: "Dla osób w kryzysie bezdomności", category_code: "homelessness", submissions_count: 2, innovations_count: 0 },
    { category_id: 9, category_name: "Dla osób z niepełnosprawnością intelektualną", category_code: "intellectual", submissions_count: 2, innovations_count: 0 },
  ],
  by_county: [
    { county_id: 1, county_name: "Powiat nowosądecki", population: 217000, senior_ratio: 22.8, submissions_count: 6 },
    { county_id: 2, county_name: "Powiat myślenicki", population: 129000, senior_ratio: 19.8, submissions_count: 4 },
    { county_id: 3, county_name: "Powiat tarnowski", population: 202000, senior_ratio: 24.2, submissions_count: 3 },
    { county_id: 4, county_name: "Powiat krakowski", population: 285000, senior_ratio: 25.1, submissions_count: 3 },
    { county_id: 5, county_name: "Powiat gorlicki", population: 107000, senior_ratio: 25.1, submissions_count: 2 },
    { county_id: 6, county_name: "Powiat tatrzański", population: 68000, senior_ratio: 22.0, submissions_count: 1 },
  ],
  white_spots: [
    {
      submission_id: 101,
      title: "Brak całodobowej opieki wytchnieniowej w powiecie gorlickim",
      category_name: "Dla zdrowia i medycyny",
      county_name: "Powiat gorlicki",
      affected_group: "Rodzice i opiekunowie osób z niepełnosprawnościami sprzężonymi",
      reported_at: "2026-09-28T10:15:00Z",
    },
    {
      submission_id: 102,
      title: "Luka w asystencji mieszkaniowej dla usamodzielniających się osób w kryzysie",
      category_name: "Dla osób w kryzysie bezdomności",
      county_name: "Powiat tarnowski",
      affected_group: "Młodzi dorośli opuszczający pieczę zastępczą",
      reported_at: "2026-10-01T14:30:00Z",
    },
    {
      submission_id: 103,
      title: "Brak wsparcia logopedycznego AAC dla dorosłych po udarach na wsi",
      category_name: "Dla osób z niepełnosprawnością intelektualną",
      county_name: "Powiat nowosądecki",
      affected_group: "Pacjenci po udarach mózgu w podeszłym wieku",
      reported_at: "2026-10-02T09:00:00Z",
    },
  ],
};

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorDetail = `Błąd HTTP ${response.status}`;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.error || JSON.stringify(errorJson);
    } catch {
      // ignore json parse error
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

/** Pobiera listę 9 oficjalnych kategorii innowacji ROPS */
export async function getCategories(): Promise<InnovationCategory[]> {
  try {
    const data = await apiFetch<InnovationCategory[]>("/categories/");
    return data && data.length > 0 ? data : FALLBACK_CATEGORIES;
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

/** Pobiera listę powiatów Małopolski wraz z gminami */
export async function getCounties(): Promise<County[]> {
  try {
    const data = await apiFetch<County[]>("/counties/");
    return data && data.length > 0 ? data : FALLBACK_COUNTIES;
  } catch {
    return FALLBACK_COUNTIES;
  }
}

/** Pobiera listę innowacji społecznych z opcjonalnymi filtrami */
export async function getInnovations(params?: {
  category?: string;
  county?: string;
  stage?: string;
  type?: string;
  q?: string;
}): Promise<SocialInnovation[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.county) searchParams.set("county", params.county);
    if (params?.stage) searchParams.set("stage", params.stage);
    if (params?.type) searchParams.set("type", params.type);
    if (params?.q) searchParams.set("q", params.q);

    const query = searchParams.toString();
    const endpoint = `/innovations/${query ? `?${query}` : ""}`;
    const data = await apiFetch<SocialInnovation[]>(endpoint);
    return data && data.length > 0 ? data : filterFallbackInnovations(params);
  } catch {
    return filterFallbackInnovations(params);
  }
}

function filterFallbackInnovations(params?: {
  category?: string;
  stage?: string;
  type?: string;
  q?: string;
}): SocialInnovation[] {
  let list = [...FALLBACK_INNOVATIONS];
  if (params?.category) {
    list = list.filter((item) => item.category_code === params.category || String(item.category) === params.category);
  }
  if (params?.stage) {
    list = list.filter((item) => item.maturity_stage === params.stage);
  }
  if (params?.type) {
    list = list.filter((item) => item.innovation_type === params.type);
  }
  if (params?.q) {
    const query = params.q.toLowerCase();
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.short_summary.toLowerCase().includes(query) ||
        item.target_audience.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }
  return list;
}

/** Pobiera szczegóły innowacji po jej unikalnym slugu */
export async function getInnovationBySlug(slug: string): Promise<SocialInnovation | null> {
  try {
    const data = await apiFetch<SocialInnovation>(`/innovations/${slug}/`);
    return data ?? (FALLBACK_INNOVATIONS.find((item) => item.slug === slug) || null);
  } catch {
    return FALLBACK_INNOVATIONS.find((item) => item.slug === slug) || null;
  }
}

/** Rejestruje polubienie innowacji */
export async function likeInnovation(slug: string): Promise<{ likes_count: number }> {
  try {
    return await apiFetch<{ status: string; likes_count: number }>(`/innovations/${slug}/like/`, {
      method: "POST",
    });
  } catch {
    const found = FALLBACK_INNOVATIONS.find((item) => item.slug === slug);
    if (found) {
      found.likes_count += 1;
      return { likes_count: found.likes_count };
    }
    return { likes_count: 1 };
  }
}

/** Pobiera listę wyzwań regionalnych Małopolski */
export async function getChallenges(params?: {
  category?: string;
  county?: string;
}): Promise<RegionalChallenge[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.county) searchParams.set("county", params.county);
    const query = searchParams.toString();
    const endpoint = `/challenges/${query ? `?${query}` : ""}`;
    const data = await apiFetch<RegionalChallenge[]>(endpoint);
    return data && data.length > 0 ? data : FALLBACK_CHALLENGES;
  } catch {
    let list = [...FALLBACK_CHALLENGES];
    if (params?.category) {
      list = list.filter((item) => item.category_code === params.category);
    }
    if (params?.county) {
      list = list.filter((item) => item.county_slug === params.county);
    }
    return list;
  }
}

/** Pobiera wyzwanie regionalne po slugu */
export async function getChallengeBySlug(slug: string): Promise<RegionalChallenge | null> {
  try {
    const data = await apiFetch<RegionalChallenge>(`/challenges/${slug}/`);
    return data ?? (FALLBACK_CHALLENGES.find((item) => item.slug === slug) || null);
  } catch {
    return FALLBACK_CHALLENGES.find((item) => item.slug === slug) || null;
  }
}

/** Pobiera analitykę trendów i Białe Plamy (Moduł VI / Moduł II) */
export async function getAdminTrends(): Promise<AdminTrendsResponse> {
  try {
    const data = await apiFetch<AdminTrendsResponse>("/admin/trends/");
    return data && data.total_submissions !== undefined ? data : FALLBACK_ADMIN_TRENDS;
  } catch {
    return FALLBACK_ADMIN_TRENDS;
  }
}

/** Główny silnik kojarzenia (Matchmaking): analizuje potrzebę i wyszukuje innowacje ROPS */
export async function analyzeMatchmaking(
  payload: MatchmakingAnalyzeRequest
): Promise<MatchmakingAnalyzeResponse> {
  try {
    return await apiFetch<MatchmakingAnalyzeResponse>("/matchmaking/analyze/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    // Awaryjny algorytm scoringu w trybie offline/fallback
    const words = payload.description.toLowerCase();
    const isSenior = words.includes("senior") || words.includes("starsz") || words.includes("opiek") || payload.category_code === "seniors";
    const isSensory = words.includes("sensoryczn") || words.includes("wzrok") || words.includes("słuch") || payload.category_code === "sensory";

    if (isSenior || isSensory) {
      return {
        submission_id: Math.floor(Math.random() * 1000) + 1,
        is_gap_identified: false,
        gap_message: "",
        total_matches: 2,
        top_score: 92.0,
        recommended_action: "Skorzystaj z rekomendowanych innowacji społecznych ROPS Kraków.",
        matches: [
          {
            similarity_score: 92.0,
            justification: "Zbieżność w głównej kategorii ROPS oraz dopasowanie kluczowych zagadnień opieki i włączenia społecznego.",
            suggested_next_step: "middleman",
            innovation: FALLBACK_INNOVATIONS[1],
          },
          {
            similarity_score: 84.5,
            justification: "Zgodność w obszarze wsparcia osób z ograniczeniami sensorycznymi i ruchowymi.",
            suggested_next_step: "tester",
            innovation: FALLBACK_INNOVATIONS[0],
          },
        ],
      };
    }

    // Jeśli zapytanie jest nietypowe lub brak innowacji -> Biała Plama
    return {
      submission_id: Math.floor(Math.random() * 1000) + 1,
      is_gap_identified: true,
      gap_message: "Wykryto Białą Plamę: w bazie innowacji ROPS Kraków nie odnaleziono jeszcze gotowego rozwiązania dla wskazanego problemu.",
      total_matches: 0,
      top_score: 22.0,
      recommended_action: "Twoje zgłoszenie zostało zarejestrowane w Bazie Wyzwań Regionalnych ROPS Kraków. Przekształć je w koncepcję innowacji w Kreatorze Pomysłów!",
      matches: [],
    };
  }
}

// ==========================================
// MODUŁ III, IV, V, VII API HELPERS & TYPES
// ==========================================

export type ActionPlanItem = {
  dzialanie: string;
  termin: string;
  koszt: number;
  liczba_testerow?: number;
};

export type GroupMember = {
  name: string;
  role: string;
  city: string;
};

export type IdeaSubmissionPayload = {
  submission_type: "fiszka" | "grant_fers";
  persona_key?: string;
  title: string;
  category_id?: number | string;
  county_id?: number | string | null;
  applicant_type?: "osoba_fizyczna" | "podmiot_ngo" | "grupa_nieformalna";
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  applicant_address?: string;
  applicant_city?: string;
  applicant_postal_code?: string;
  organization_krs?: string;
  organization_nip?: string;
  organization_regon?: string;
  organization_representative?: string;
  group_members?: GroupMember[];
  innovation_description?: string;
  solution_concept?: string;
  uniqueness_rationale?: string;
  problem_diagnosis?: string;
  target_recipients?: string;
  target_group?: string;
  expected_change?: string;
  scalability_model?: string;
  action_plan_prep?: ActionPlanItem[];
  action_plan_testing?: ActionPlanItem[];
  requested_grant_amount?: number;
  estimated_budget_pln?: number;
  team_experience?: string;
  formal_declarations_accepted?: boolean;
  support_needed?: string;
  stage?: string;
};

export async function createIdea(payload: IdeaSubmissionPayload): Promise<{ id: number; title: string; status: string }> {
  try {
    const desc = payload.innovation_description || payload.solution_concept || "";
    const recipients = payload.target_recipients || payload.target_group || "";
    const budget = payload.requested_grant_amount ?? payload.estimated_budget_pln ?? 50000;

    const body: Record<string, unknown> = {
      submission_type: payload.submission_type,
      persona_key: payload.persona_key || "",
      title: payload.title,
      category: Number(payload.category_id) || 1,
      county: payload.county_id ? Number(payload.county_id) : 1,
      applicant_type: payload.applicant_type || "osoba_fizyczna",
      applicant_name: payload.applicant_name,
      applicant_email: payload.applicant_email,
      applicant_phone: payload.applicant_phone || "",
      applicant_address: payload.applicant_address || "",
      applicant_city: payload.applicant_city || "",
      applicant_postal_code: payload.applicant_postal_code || "",
      organization_krs: payload.organization_krs || "",
      organization_nip: payload.organization_nip || "",
      organization_regon: payload.organization_regon || "",
      organization_representative: payload.organization_representative || "",
      group_members: payload.group_members || [],
      innovation_description: desc,
      uniqueness_rationale: payload.uniqueness_rationale || "",
      problem_diagnosis: payload.problem_diagnosis || "",
      target_recipients: recipients,
      expected_change: payload.expected_change || "",
      scalability_model: payload.scalability_model || "",
      action_plan_prep: payload.action_plan_prep || [],
      action_plan_testing: payload.action_plan_testing || [],
      requested_grant_amount: budget,
      team_experience: payload.team_experience || "",
      formal_declarations_accepted: payload.formal_declarations_accepted ?? true,
    };
    return await apiFetch<{ id: number; title: string; status: string }>("/ideas/", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("[createIdea] Błąd podczas składania wniosku:", err);
    throw err;
  }
}

export type AiAssistFieldType =
  | "deinstitutionalization"
  | "innovation_uniqueness"
  | "county_diagnosis"
  | "scalability"
  | "budget_action_plan"
  | "concept_diagram";

export type AiAssistResponse = {
  field: AiAssistFieldType;
  suggestion?: string;
  county?: string;
  senior_ratio?: string;
  challenges?: string[];
  action_plan_prep?: ActionPlanItem[];
  action_plan_testing?: ActionPlanItem[];
  requested_grant_amount?: number;
  mermaid_code?: string;
  steps?: Array<{ title: string; description: string }>;
};

export async function aiAssistIdea(params: {
  field: AiAssistFieldType;
  title?: string;
  category?: number | string;
  county?: number | string;
  target_recipients?: string;
  concept?: string;
}): Promise<AiAssistResponse> {
  try {
    return await apiFetch<AiAssistResponse>("/ideas/ai-assist/", {
      method: "POST",
      body: JSON.stringify(params),
    });
  } catch {
    // Robust offline fallback
    const { field, title = "Innowacja Społeczna", county = 1 } = params;
    const countyName = Number(county) === 3 ? "powiat tarnowski" : Number(county) === 2 ? "powiat myślenicki" : "powiat nowosądecki";

    if (field === "deinstitutionalization") {
      return {
        field,
        suggestion: `Rekomendacja deinstytucjonalizacji (ROPS Kraków): Wpisz «${title}» w model usług świadczonych w środowisku lokalnym jako alternatywę dla opieki całodobowej w DPS. Zapewnij wsparcie sąsiedzkie i mobilne punkty dojazdu.`,
      };
    } else if (field === "innovation_uniqueness") {
      return {
        field,
        suggestion: `Wyróżniki innowacyjności: Projekt «${title}» wyróżnia się o 35% niższym kosztem jednostkowym w stosunku do form stacjonarnych oraz elastycznym modelem angażującym lokalną społeczność i wolontariuszy.`,
      };
    } else if (field === "county_diagnosis") {
      return {
        field,
        county: countyName,
        senior_ratio: "24.2",
        suggestion: `Na podstawie Raportu Obserwatorium Polityki Społecznej ROPS Kraków dla obszaru: ${countyName}.\n• Wskaźnik starości demograficznej: 24.2% mieszkańców w wieku senioralnym (60+).\n• Zdiagnozowane wyzwania strategiczne: Dostępność transportowa, Samotność na wsi, Opieka wytchnieniowa.\nDiagnoza wskazuje na pilną potrzebę wdrożenia «${title}».`,
      };
    } else if (field === "scalability") {
      return {
        field,
        suggestion: `Model replikacji w Małopolsce: Projekt zaprojektowany modularnie – po fazie mikrograntu może być łatwo wdrożony przez Centra Usług Społecznych (CUS) w formule zlecenia zadania publicznego dla NGO.`,
      };
    } else if (field === "budget_action_plan") {
      return {
        field,
        action_plan_prep: [
          { dzialanie: "Opracowanie standardu innowacji, regulaminu i procedur bezpieczeństwa", termin: "Miesiąc 1-2", koszt: 8000 },
          { dzialanie: "Szkolenie zespołu wdrożeniowego i adaptacja narzędzi testowych", termin: "Miesiąc 2-3", koszt: 6000 },
        ],
        action_plan_testing: [
          { dzialanie: "Pilotażowe wdrożenie u min. 25 beneficjentów w wybranym powiecie", termin: "Miesiące 4-9", koszt: 32000, liczba_testerow: 25 },
          { dzialanie: "Audyt dostępności WCAG 2.2, badanie ewaluacyjne i raport końcowy", termin: "Miesiące 10-12", koszt: 4000, liczba_testerow: 25 },
        ],
        requested_grant_amount: 50000,
        suggestion: "Wygenerowano optymalny harmonogram i budżet FERS: 14 000 PLN prep + 36 000 PLN test = 50 000 PLN (limit mikrograntu).",
      };
    } else if (field === "concept_diagram") {
      return {
        field,
        suggestion: "Wygenerowano schemat koncepcji innowacji.",
        mermaid_code: `graph TD\n  A["Diagnoza: ${countyName}"] --> B["Innowacja: ${title}"]\n  B --> C["Faza Przygotowawcza (3 m-ce)"]\n  C --> D["Faza Testowa (9 m-cy, 25 testerów)"]\n  D --> E["Trwała zmiana i skalowanie w CUS"]`,
        steps: [
          { title: "Diagnoza lokalna", description: `Wyzwania społeczne w ${countyName}` },
          { title: "Innowacyjne rozwiązanie", description: title },
          { title: "Okres przygotowawczy", description: "Standard, procedury, szkolenia kadry (maks. 3 m-ce)" },
          { title: "Okres testowania", description: "Pilotaż u min. 25 osób z ewaluacją WCAG (maks. 9 m-cy)" },
          { title: "Trwała zmiana i skalowanie", description: "Deinstytucjonalizacja i wdrożenie w CUS/JST" },
        ],
      };
    }

    return {
      field,
      suggestion: "Wskazówka asystenta innowacji ROPS Kraków.",
    };
  }
}

export type MiddlemanPackagePayload = {
  innovation_id: number | string;
  county_id: number | string;
  municipality_name: string;
  municipality_type?: string;
  population?: number;
  has_cus?: boolean;
  execution_model?: string;
};

export type MiddlemanPackageResult = {
  id?: number;
  innovation?: number;
  innovation_title?: string;
  county?: number;
  county_name?: string;
  municipality_name?: string;
  municipality_type?: string;
  population?: number;
  has_cus?: boolean;
  execution_model?: string;
  service_name: string;
  service_standard: string;
  staffing_requirements: Array<{
    role: string;
    allocation: string;
    qualifications: string;
  }>;
  cost_breakdown: {
    annual_total_pln: number;
    staff_compensation_pln: number;
    materials_and_innovation_license_pln: number;
    operational_and_travel_pln: number;
  };
  funding_sources: Array<{
    source: string;
    percentage: number;
    amount_pln: number;
  }>;
  implementation_steps: Array<{
    month: string;
    step: string;
  }>;
  resolution_template?: string;
  created_at?: string;
};

export const FALLBACK_MIDDLEMAN_PACKAGE: MiddlemanPackageResult = {
  id: 1,
  innovation_title: "BaWita – tablica sensoryczna dla seniorów",
  county_name: "myślenicki",
  municipality_name: "Myślenice",
  municipality_type: "miejsko-wiejska",
  population: 45000,
  has_cus: true,
  execution_model: "hybrydowy",
  service_name: "Gminny Program Aktywizacji Sensorycznej BaWita dla seniorów CUS Myślenice",
  service_standard: "Mobilne sesje sensoryczne u 40 seniorów z terenu miasta i 16 sołectw gminy Myślenice. Realizacja poprzez Centrum Usług Społecznych (CUS) w oparciu o Program Usług Społecznych (PUS). Zapewnienie pełnej dostępności cyfrowej materiałów (WCAG 2.2 AA).",
  staffing_requirements: [
    { role: "Koordynator Usług CUS", allocation: "0.5 etatu", qualifications: "Certyfikat koordynatora CUS i wykształcenie wyższe w zakresie polityki społecznej" },
    { role: "Mobilny Animator Terapii", allocation: "1.0 etat", qualifications: "Terapia zajęciowa / warsztat wdrożeniowy ROPS Kraków" },
    { role: "Kierowca transportu door-to-door", allocation: "0.5 etatu", qualifications: "Prawo jazdy kat. B, przeszkolenie asystenckie" },
  ],
  cost_breakdown: {
    annual_total_pln: 75000,
    staff_compensation_pln: 48750,
    materials_and_innovation_license_pln: 15000,
    operational_and_travel_pln: 11250,
  },
  funding_sources: [
    { source: "Program FERS Działanie 5.1 (Grant wdrożeniowy ROPS Kraków)", percentage: 70, amount_pln: 52500 },
    { source: "Budżet Gminy Myślenice (wkład CUS)", percentage: 15, amount_pln: 11250 },
    { source: "PFRON (Program wyrównywania różnic między regionami)", percentage: 15, amount_pln: 11250 },
  ],
  implementation_steps: [
    { month: "Miesiąc 1", step: "Zatwierdzenie zmiany w Programie Usług Społecznych CUS Myślenice przez Radę Miejską." },
    { month: "Miesiąc 2", step: "Dostawa 4 zestawów BaWita i certyfikacja kadry w ROPS Kraków." },
    { month: "Miesiąc 3", step: "Kampania informacyjna w sołectwach, rekrutacja 40 seniorów." },
    { month: "Miesiące 4-5", step: "Realizacja 240 sesji mobilnych u mieszkańców i bieżący monitoring jakości." },
    { month: "Miesiąc 6", step: "Badanie satysfakcji, raport wdrożeniowy do ROPS i decyzja o trwałym finansowaniu." },
  ],
  resolution_template: `UCHWAŁA NR XXII/184/2026 RADY MIEJSKIEJ W MYŚLENICACH
z dnia 25 marca 2026 r.

w sprawie przyjęcia Programu Wdrożenia Usługi Społecznej 'BaWita – tablica sensoryczna dla seniorów' w Centrum Usług Społecznych w Myślenicach.

Na podstawie art. 18 ust. 2 pkt 15 ustawy z dnia 8 marca 1990 r. o samorządzie gminnym oraz art. 4 ust. 1 ustawy z dnia 19 lipca 2019 r. o realizowaniu usług społecznych przez centrum usług społecznych, Rada Miejska w Myślenicach uchwala realizację programu ze wsparciem FERS Działanie 5.1 (70%) i PFRON (15%).`,
  created_at: new Date().toISOString(),
};

export async function getMiddlemanPackages(params?: {
  municipality?: string;
  innovation_id?: string | number;
  county_id?: string | number;
}): Promise<MiddlemanPackageResult[]> {
  try {
    const query = new URLSearchParams();
    if (params?.municipality) query.set("municipality", params.municipality);
    if (params?.innovation_id) query.set("innovation_id", String(params.innovation_id));
    if (params?.county_id) query.set("county_id", String(params.county_id));
    const qs = query.toString();
    const endpoint = `/middleman/package/${qs ? `?${qs}` : ""}`;
    const result = await apiFetch<MiddlemanPackageResult[]>(endpoint);
    return Array.isArray(result) && result.length > 0 ? result : [FALLBACK_MIDDLEMAN_PACKAGE];
  } catch (err) {
    console.warn("[getMiddlemanPackages] Backend niedostępny – używam danych lokalnych:", err);
    return [FALLBACK_MIDDLEMAN_PACKAGE];
  }
}

export async function generateMiddlemanPackage(payload: MiddlemanPackagePayload): Promise<MiddlemanPackageResult> {
  try {
    return await apiFetch<MiddlemanPackageResult>("/middleman/package/", {
      method: "POST",
      body: JSON.stringify({
        innovation_id: Number(payload.innovation_id) || 1,
        county_id: Number(payload.county_id) || 1,
        municipality_name: payload.municipality_name || "Gmina Małopolska",
        municipality_type: payload.municipality_type || "wiejska",
        population: payload.population || 15000,
        has_cus: payload.has_cus ?? true,
        execution_model: payload.execution_model || "zlecenie_ngo",
      }),
    });
  } catch (err) {
    console.warn("[generateMiddlemanPackage] Backend niedostępny – używam lokalnego fallbacku:", err);
    const pop = payload.population || 15000;
    const baseAnnual = pop < 10000 ? 50000 : pop < 30000 ? 80000 : 130000;
    const fersAmount = Math.round(baseAnnual * 0.70);
    const ownAmount = Math.round(baseAnnual * 0.15);
    const pfronAmount = baseAnnual - fersAmount - ownAmount;
    return {
      id: Date.now(),
      municipality_name: payload.municipality_name || "Gmina Małopolska",
      municipality_type: payload.municipality_type || "wiejska",
      population: pop,
      has_cus: payload.has_cus ?? true,
      execution_model: payload.execution_model || "zlecenie_ngo",
      service_name: `Lokalna Usługa Społeczna: Pakiet wdrożeniowy dla gminy ${payload.municipality_name || "małopolskiej"}`,
      service_standard: `Certyfikowany standard ROPS Kraków: świadczenie wsparcia z wykorzystaniem metodyki innowacji społecznej w gminie ${payload.municipality_name || "małopolskiej"} (${pop} mieszkańców). Model realizacji: ${payload.execution_model === "wlasna_kadra" ? "kadra własna CUS/OPS" : payload.execution_model === "hybrydowy" ? "partnerstwo publiczno-społeczne (CUS + NGO)" : "zlecenie zadania NGO w trybie Pożytku Publicznego"}. Dostępność architektoniczna i cyfrowa WCAG 2.2 AA.`,
      staffing_requirements: [
        {
          role: "Koordynator Usługi Społecznej (CUS/OPS)",
          allocation: pop > 25000 ? "1.0 etat" : "0.5 etatu",
          qualifications: "Wykształcenie wyższe (praca socjalna / pedagogika / organizacja pomocy społecznej)",
        },
        {
          role: "Specjalista / Animator wdrożeniowy",
          allocation: "1.0 etat (lub ekwiwalent umów)",
          qualifications: "Certyfikat warsztatowy ROPS Kraków z zakresu wdrażania innowacji",
        },
      ],
      cost_breakdown: {
        annual_total_pln: baseAnnual,
        staff_compensation_pln: Math.round(baseAnnual * 0.65),
        materials_and_innovation_license_pln: Math.round(baseAnnual * 0.20),
        operational_and_travel_pln: Math.round(baseAnnual * 0.15),
      },
      funding_sources: [
        { source: "Program FERS Działanie 5.1 (Grant Wdrożeniowy ROPS Kraków)", percentage: 70, amount_pln: fersAmount },
        { source: `Środki własne gminy ${payload.municipality_name || "JST"} / budżet CUS/OPS`, percentage: 15, amount_pln: ownAmount },
        { source: "PFRON / Programy wyrównywania różnic między regionami", percentage: 15, amount_pln: pfronAmount },
      ],
      implementation_steps: [
        { month: "Miesiąc 1", step: `Przyjęcie uchwały Rady Gminy ${payload.municipality_name || ""} w sprawie Programu Usług Społecznych (PUS) lub zarządzenia Wójta/Burmistrza.` },
        { month: "Miesiąc 2", step: "Przeszkolenie kadry w ROPS Kraków, odbiór bezpłatnych zestawów metodycznych i procedur." },
        { month: "Miesiąc 3", step: "Rekrutacja mieszkańców, kampania informacyjna i start bezpośrednich świadczeń opiekuńczo-włączających." },
        { month: "Miesiące 4-5", step: "Świadczenie usługi, mobilne sesje w sołectwach i bieżący monitoring satysfakcji." },
        { month: "Miesiąc 6", step: "Ewaluacja końcowa etapu pilotażowego i raport wdrożeniowy do ROPS Kraków." },
      ],
      resolution_template: `UCHWAŁA NR ....../2026 RADY GMINY ${(payload.municipality_name || "GMINY").toUpperCase()}
z dnia .................... 2026 r.

w sprawie przyjęcia Programu Wdrożenia Lokalnej Usługi Społecznej na terenie Gminy ${payload.municipality_name || ""} na bazie innowacji ROPS Kraków.

Na podstawie art. 18 ust. 2 pkt 15 ustawy z dnia 8 marca 1990 r. o samorządzie gminnym oraz art. 4 ust. 1 ustawy z dnia 19 lipca 2019 r. o realizowaniu usług społecznych przez centrum usług społecznych, Rada Gminy uchwala wdrożenie programu w montażu 70% FERS / 15% PFRON / 15% wkład własny.`,
    };
  }
}

export type PilotEvaluationItem = {
  id?: number;
  pilot?: number;
  pilot_title?: string;
  evaluator_persona_key?: string;
  evaluator_name: string;
  evaluator_role: string;
  evaluator_role_display?: string;
  evaluator_institution?: string;
  usability_score: number;
  effectiveness_score: number;
  accessibility_score: number;
  barriers_encountered?: string;
  proposed_improvements?: string;
  recommend_to_scale?: boolean;
  test_environment_notes?: string;
  created_at?: string;
};

export type PilotProjectItem = {
  id: number;
  innovation?: number;
  title: string;
  innovation_title: string;
  innovation_slug: string;
  municipality_name?: string;
  municipality?: string;
  county?: number;
  county_name: string;
  status: "recruiting" | "in_progress" | "completed" | "rekrutacja" | "w_trakcie" | "zakonczony";
  status_display?: string;
  max_testers: number;
  target_testers_count: number;
  current_testers_count: number;
  eligible_roles_description?: string;
  summary: string;
  description: string;
  instructions?: string;
  start_date?: string | null;
  end_date?: string | null;
  evaluations_count?: number;
  evaluations?: PilotEvaluationItem[];
  average_usability_score?: number | null;
  average_effectiveness_score?: number | null;
  average_accessibility_score?: number | null;
  average_overall_score?: number | null;
  recommendation_rate?: number | null;
};

export const FALLBACK_PILOTS: PilotProjectItem[] = [
  {
    id: 1,
    title: "Pilotaż BaWita w środowisku domowym – gmina Grybów",
    innovation_title: "BaWita – mobilna tablica sensoryczna",
    innovation_slug: "bawita-tablica-sensoryczna",
    municipality: "Grybów",
    municipality_name: "Grybów",
    county_name: "Powiat nowosądecki",
    status: "completed",
    status_display: "Pilotaż zakończony / Ewaluacja",
    max_testers: 5,
    target_testers_count: 5,
    current_testers_count: 5,
    eligible_roles_description: "Opiekunowie rodzinni, kadra CUS, pracownicy socjalni",
    summary: "3-miesięczny pilotaż mobilnej tablicy sensorycznej u 5 podopiecznych z wczesnym otępieniem.",
    description: "3-miesięczny pilotaż mobilnej tablicy sensorycznej u 5 podopiecznych z wczesnym otępieniem.",
    instructions: "Prosimy o sesje 3 razy w tygodniu po 30 minut oraz odnotowywanie czasu skupienia uwagi podopiecznego.",
    start_date: "2026-07-01",
    end_date: "2026-09-30",
    evaluations_count: 3,
    average_usability_score: 5.0,
    average_effectiveness_score: 4.7,
    average_accessibility_score: 4.7,
    average_overall_score: 4.8,
    recommendation_rate: 100,
    evaluations: [
      {
        id: 101,
        pilot: 1,
        evaluator_persona_key: "anna_nowak",
        evaluator_name: "Anna Nowak",
        evaluator_role: "opiekun",
        evaluator_role_display: "Opiekun osoby zależnej",
        evaluator_institution: "Opiekunka rodzinna (mama 78 lat)",
        usability_score: 5,
        effectiveness_score: 5,
        accessibility_score: 4,
        barriers_encountered: "Zapięcie walizki wymagało użycia większej siły przez osobę z artretyzmem dłoni.",
        proposed_improvements: "Zastąpienie metalowych zatrzasków walizki miękkimi pasami z rzepem magnetycznym.",
        recommend_to_scale: true,
        test_environment_notes: "Testowano w domu jednorodzinnym w Grybowie. Mama chętnie wracała do labiryntów dotykowych.",
        created_at: "2026-09-28T14:30:00Z",
      },
      {
        id: 102,
        pilot: 1,
        evaluator_persona_key: "piotr_adamski",
        evaluator_name: "dr Piotr Adamski",
        evaluator_role: "ekspert",
        evaluator_role_display: "Ekspert branżowy",
        evaluator_institution: "Uniwersytet Pedagogiczny / Ekspert ds. deinstytucjonalizacji",
        usability_score: 5,
        effectiveness_score: 5,
        accessibility_score: 5,
        barriers_encountered: "Brak uwag krytycznych. Znakomity poziom bezpieczeństwa materiałów naturalnych.",
        proposed_improvements: "Wydanie krótkiego wideo-przewodnika dla personelu CUS.",
        recommend_to_scale: true,
        test_environment_notes: "Ocena ekspercka w warunkach środowiskowych. Pełna zgodność z celami deinstytucjonalizacji.",
        created_at: "2026-09-29T10:15:00Z",
      },
      {
        id: 103,
        pilot: 1,
        evaluator_persona_key: "marek_wisniewski",
        evaluator_name: "Marek Wiśniewski",
        evaluator_role: "pracownik_instytucji",
        evaluator_role_display: "Pracownik CUS / OPS / DPS",
        evaluator_institution: "Dyrektor CUS Myślenice",
        usability_score: 5,
        effectiveness_score: 4,
        accessibility_score: 5,
        barriers_encountered: "Niewielkie trudności z transportem tablicy między odległymi sołectwami.",
        proposed_improvements: "Wdrożenie dedykowanego pokrowca transportowego ułatwiającego pracę mobilnego asystenta.",
        recommend_to_scale: true,
        test_environment_notes: "Pilotaż w ramach wizyt środowiskowych asystentów CUS. Bardzo wysoka ocena seniorów.",
        created_at: "2026-09-30T16:00:00Z",
      },
    ],
  },
  {
    id: 2,
    title: "Otwarty nabór testerów symulatora kas i biletomatów Merkury",
    innovation_title: "Merkury – dotykowy trenażer cyfrowy",
    innovation_slug: "merkury-symulator-samoobslugowy",
    municipality: "Myślenice",
    municipality_name: "Myślenice",
    county_name: "Powiat myślenicki",
    status: "recruiting",
    status_display: "Trwa nabór testerów",
    max_testers: 12,
    target_testers_count: 12,
    current_testers_count: 7,
    eligible_roles_description: "Uczestnicy WTZ, osoby w spektrum autyzmu, instruktorzy terapii zajęciowej",
    summary: "Zapraszamy instytucje i mieszkańców do testowania nowej wersji scenariuszy zakupowych w biletomatach miejskich.",
    description: "Zapraszamy instytucje i mieszkańców do testowania nowej wersji scenariuszy zakupowych w biletomatach miejskich.",
    instructions: "Tester otrzymuje tablet ze scenariuszami na 14 dni. Po testach wypełnia krótką 5-minutową ankietę.",
    start_date: "2026-10-01",
    end_date: "2026-11-15",
    evaluations_count: 0,
    evaluations: [],
  },
  {
    id: 3,
    title: "Wdrożenie testowe gry integracyjnej Senior CUDER w 3 klubach seniora",
    innovation_title: "Senior CUDER – gra planszowa integracji międzypokoleniowej",
    innovation_slug: "senior-cuder-gra-integracyjna",
    municipality: "Piwniczna-Zdrój",
    municipality_name: "Piwniczna-Zdrój",
    county_name: "Powiat nowosądecki",
    status: "in_progress",
    status_display: "Pilotaż w toku",
    max_testers: 30,
    target_testers_count: 30,
    current_testers_count: 22,
    eligible_roles_description: "Seniorzy 60+, animatorzy klubów seniora, pracownicy socjalni",
    summary: "Pilotaż w 3 klubach seniora i Dziennym Domu Pobytu. Ewaluacja przystępności zasad oraz wpływu na aktywizację społeczną.",
    description: "Pilotaż w 3 klubach seniora i Dziennym Domu Pobytu. Ewaluacja przystępności zasad oraz wpływu na aktywizację społeczną.",
    instructions: "Rozegranie minimum 4 partii gry w zespołach 4-6 osobowych, obserwacja zaangażowania i wypełnienie ankiety WCAG.",
    start_date: "2026-09-15",
    end_date: "2026-11-30",
    evaluations_count: 1,
    average_usability_score: 4.0,
    average_effectiveness_score: 5.0,
    average_accessibility_score: 5.0,
    average_overall_score: 4.7,
    recommendation_rate: 100,
    evaluations: [
      {
        id: 104,
        pilot: 3,
        evaluator_persona_key: "anna_nowak",
        evaluator_name: "Anna Nowak",
        evaluator_role: "opiekun",
        evaluator_role_display: "Opiekun osoby zależnej",
        evaluator_institution: "Klub Seniora Dolina Popradu",
        usability_score: 4,
        effectiveness_score: 5,
        accessibility_score: 5,
        barriers_encountered: "Karty z zadaniami mogłyby mieć jeszcze większy kontrast dla osób z jaskrą.",
        proposed_improvements: "Dołączenie lupy powiększającej do każdego pudełka z grą.",
        recommend_to_scale: true,
        test_environment_notes: "Testowano podczas cotygodniowych spotkań klubu. Uczestnicy byli zachwyceni dynamiką rozgrywki.",
        created_at: "2026-09-25T11:00:00Z",
      },
    ],
  },
  {
    id: 4,
    title: "Pilotaż adaptacji modułowych łazienek w domach seniorów na wsi",
    innovation_title: "Modularne łazienki dostępne w 48 godzin",
    innovation_slug: "modularne-lazienki-dostepne",
    municipality: "Żabno",
    municipality_name: "Żabno",
    county_name: "Powiat tarnowski",
    status: "recruiting",
    status_display: "Trwa nabór testerów",
    max_testers: 8,
    target_testers_count: 8,
    current_testers_count: 3,
    eligible_roles_description: "Osoby z niepełnosprawnością ruchową, seniorzy niesamodzielni, architekci dostępności",
    summary: "Montaż prototypowych modułów poręczy, bezprogowych brodzików i antypoślizgowych paneli ściennych w budynkach wiejskich.",
    description: "Montaż prototypowych modułów poręczy, bezprogowych brodzików i antypoślizgowych paneli ściennych w budynkach wiejskich.",
    instructions: "Bezpłatny montaż zestawu testowego na 6 miesięcy z comiesięcznym audytem bezpieczeństwa i ankietą satysfakcji.",
    start_date: "2026-10-15",
    end_date: "2027-04-15",
    evaluations_count: 0,
    evaluations: [],
  },
];

export async function getPilots(params?: {
  status?: string;
  county?: string;
  innovation?: string | number;
  q?: string;
}): Promise<PilotProjectItem[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== "all") searchParams.set("status", params.status);
    if (params?.county && params.county !== "all") searchParams.set("county", params.county);
    if (params?.innovation) searchParams.set("innovation", String(params.innovation));
    if (params?.q) searchParams.set("q", params.q);
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";

    const list = await apiFetch<PilotProjectItem[]>(`/pilots/${queryString}`);
    if (list && list.length > 0) {
      return list.map((p) => ({
        ...p,
        target_testers_count: p.target_testers_count ?? p.max_testers ?? 10,
        max_testers: p.max_testers ?? p.target_testers_count ?? 10,
        description: p.description || p.summary || "",
        summary: p.summary || p.description || "",
        municipality: p.municipality || p.municipality_name || "",
        municipality_name: p.municipality_name || p.municipality || "",
      }));
    }
    return FALLBACK_PILOTS;
  } catch {
    return FALLBACK_PILOTS;
  }
}

export type CreatePilotPayload = {
  innovation: number;
  title: string;
  status?: "recruiting" | "in_progress" | "completed";
  county?: number | string;
  municipality_name: string;
  max_testers: number;
  eligible_roles_description: string;
  summary: string;
  instructions?: string;
  start_date?: string;
  end_date?: string;
};

export async function createPilot(payload: CreatePilotPayload): Promise<PilotProjectItem> {
  return await apiFetch<PilotProjectItem>("/pilots/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function applyToPilot(pilotId: number | string, data: {
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  applicant_role?: string;
  motivation?: string;
}): Promise<{ status: string; message: string; current_testers_count?: number; max_testers?: number }> {
  try {
    return await apiFetch<{ status: string; message: string; current_testers_count?: number; max_testers?: number }>(`/pilots/${pilotId}/apply/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch {
    return {
      status: "applied",
      message: `Dziękujemy ${data.applicant_name}! Twoje zgłoszenie do udziału w testach zostało przyjęte. Koordynator ROPS skontaktuje się z Tobą.`,
    };
  }
}

export async function submitEvaluation(data: {
  pilot: number;
  evaluator_persona_key?: string;
  evaluator_name: string;
  evaluator_role: string;
  evaluator_institution?: string;
  usability_score: number;
  effectiveness_score: number;
  accessibility_score?: number;
  accessibility_wcag_score?: number;
  barriers_encountered?: string;
  proposed_improvements?: string;
  comments?: string;
  recommend_to_scale?: boolean;
  test_environment_notes?: string;
}): Promise<{ id: number; status?: string }> {
  try {
    return await apiFetch<{ id: number; status?: string }>("/evaluations/", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        accessibility_score: data.accessibility_score ?? data.accessibility_wcag_score ?? 5,
        proposed_improvements: data.proposed_improvements ?? data.comments ?? "",
      }),
    });
  } catch {
    return { id: 1, status: "zapisano" };
  }
}

export type InquiryItem = {
  id: number;
  author_persona_key?: string;
  author_name: string;
  author_email: string;
  recipient_type: "rops_coordinator" | "expert_mentor";
  recipient_type_display?: string;
  subject: string;
  message: string;
  response?: string;
  responder_name?: string;
  is_answered: boolean;
  is_public_faq: boolean;
  created_at?: string;
  answered_at?: string;
};

export type InquiryPayload = {
  author_name: string;
  author_email: string;
  author_persona_key?: string;
  recipient_type?: "rops_coordinator" | "expert_mentor";
  subject?: string;
  message?: string;
  // Aliases for compatibility
  topic?: string;
  content?: string;
  author_organization?: string;
  related_innovation_id?: number | string | null;
};

export const FALLBACK_INQUIRIES: InquiryItem[] = [
  {
    id: 1,
    author_name: "Anna Nowak",
    author_email: "anna.nowak@przyklad.pl",
    recipient_type: "rops_coordinator",
    recipient_type_display: "Koordynator Małopolskiego Hubu (ROPS Kraków)",
    subject: "Czy gmina wiejska może pozyskać dofinansowanie na adaptację łazienek dla seniorów?",
    message: "Dzień dobry, w naszej wsi wielu seniorów ma problem z korzystaniem z wysokich wanien. Czy ROPS posiada program wspierający takie instalacje?",
    response: "Tak, w ramach Inkubatora Włączenia Społecznego 2.0 (FERS) gminy i organizacje mogą ubiegać się o granty do 50 000 zł na testowanie i skalowanie modularnych łazienek dostępnych.",
    responder_name: "Magdalena Kaczmarczyk (ROPS Kraków)",
    is_answered: true,
    is_public_faq: true,
    created_at: "2026-09-15T10:00:00Z",
  },
  {
    id: 2,
    author_name: "Katarzyna Zielińska",
    author_email: "kontakt@aktywna-malopolska.pl",
    recipient_type: "expert_mentor",
    recipient_type_display: "Ekspert branżowy / Mentor",
    subject: "Jakie kryteria musi spełniać wniosek FERS w zakresie deinstytucjonalizacji?",
    message: "Przygotowujemy wniosek w Kreatorze i chcemy upewnić się, czy usługa świadczona w klubie seniora kwalifikuje się jako wsparcie środowiskowe.",
    response: "Jak najbardziej! Deinstytucjonalizacja to właśnie rozwój usług świadczonych na poziomie społeczności lokalnej (Kluby Seniora, CUS, opieka domowa) jako alternatywa dla opieki całodobowej w DPS.",
    responder_name: "dr Piotr Adamski (Ekspert ROPS)",
    is_answered: true,
    is_public_faq: true,
    created_at: "2026-09-20T14:30:00Z",
  },
];

export async function getInquiries(filters?: {
  faq?: boolean;
  recipient_type?: string;
  is_answered?: boolean;
  q?: string;
}): Promise<InquiryItem[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.faq) params.set("faq", "true");
    if (filters?.recipient_type && filters.recipient_type !== "all") params.set("recipient_type", filters.recipient_type);
    if (filters?.is_answered !== undefined) params.set("is_answered", filters.is_answered ? "true" : "false");
    if (filters?.q) params.set("q", filters.q);

    const query = params.toString() ? `?${params.toString()}` : "";
    const list = await apiFetch<InquiryItem[]>(`/inquiries/${query}`);
    return list && list.length > 0 ? list : FALLBACK_INQUIRIES;
  } catch {
    return FALLBACK_INQUIRIES;
  }
}

export async function createInquiry(payload: InquiryPayload): Promise<InquiryItem> {
  const body = {
    author_name: payload.author_name,
    author_email: payload.author_email,
    author_persona_key: payload.author_persona_key || "",
    recipient_type: payload.recipient_type || "rops_coordinator",
    subject: payload.subject || payload.topic || "Konsultacja z zespołem ROPS Kraków",
    message: payload.message || payload.content || "",
  };

  try {
    return await apiFetch<InquiryItem>("/inquiries/", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch {
    return {
      id: Math.floor(Math.random() * 8000) + 100,
      ...body,
      is_answered: false,
      is_public_faq: false,
      created_at: new Date().toISOString(),
    };
  }
}

export async function respondToInquiry(
  id: number,
  payload: { response: string; responder_name?: string; is_public_faq?: boolean }
): Promise<InquiryItem> {
  return await apiFetch<InquiryItem>(`/inquiries/${id}/respond/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type PartnershipItem = {
  id: number;
  author_persona_key?: string;
  title: string;
  organization_name: string;
  organization_type: "jst_cus" | "ngo" | "pes" | "nauka";
  organization_type_display?: string;
  county?: number;
  county_name?: string;
  county_slug?: string;
  municipality_name?: string;
  category?: number;
  category_name?: string;
  category_code?: string;
  looking_for: "ngo" | "jst" | "ekspert" | "technologiczny";
  looking_for_display?: string;
  description: string;
  contact_email: string;
  contact_phone?: string;
  is_active: boolean;
  created_at?: string;
  // Aliases for compatibility
  sector?: "ngo" | "jst" | "biznes" | "nauka";
  target_partner_type?: string;
};

export const FALLBACK_PARTNERSHIPS: PartnershipItem[] = [
  {
    id: 1,
    title: "CUS Myślenice szuka NGO do realizacji usługi mobilnej opieki wytchnieniowej",
    organization_name: "Centrum Usług Społecznych w Myślenicach",
    organization_type: "jst_cus",
    organization_type_display: "Jednostka Samorządu / CUS",
    sector: "jst",
    county_name: "Powiat myślenicki",
    county_slug: "myslenicki",
    municipality_name: "Myślenice",
    category_name: "Zdrowie i opieka",
    category_code: "health",
    looking_for: "ngo",
    looking_for_display: "Organizację pozarządową (NGO)",
    description: "Planujemy uruchomienie nowej usługi opieki wytchnieniowej dla 20 rodzin opiekujących się osobami leżącymi. Poszukujemy doświadczonego podmiotu ekonomii społecznej lub stowarzyszenia do realizacji wizyt domowych.",
    contact_email: "cus@myslenice.pl",
    contact_phone: "12 272 56 00",
    is_active: true,
    target_partner_type: "Organizację pozarządową (NGO)",
  },
  {
    id: 2,
    title: "Fundacja Aktywna Małopolska oferuje partnerstwo w tworzeniu Kawiarenki Naprawczej",
    organization_name: "Fundacja Aktywna Małopolska",
    organization_type: "ngo",
    organization_type_display: "Organizacja Pozarządowa (NGO)",
    sector: "ngo",
    county_name: "Powiat tarnowski",
    county_slug: "tarnowski",
    municipality_name: "Tarnów",
    category_name: "Praca i włączenie zawodowe",
    category_code: "labor",
    looking_for: "jst",
    looking_for_display: "Samorząd / Gminę (JST)",
    description: "Dysponujemy kadrą mistrzów rzemiosła i gotowym pakietem wyposażenia warsztatowego. Szukamy gminy lub domu kultury chętnego udostępnić salę raz w tygodniu.",
    contact_email: "kontakt@aktywna-malopolska.pl",
    contact_phone: "14 621 00 00",
    is_active: true,
    target_partner_type: "Samorząd / Gminę (JST)",
  },
  {
    id: 3,
    title: "Spółdzielnia Socjalna «Horyzonty» poszukuje partnera technologicznego do aplikacji asystenta",
    organization_name: "Spółdzielnia Socjalna Horyzonty",
    organization_type: "pes",
    organization_type_display: "Podmiot Ekonomii Społecznej",
    sector: "ngo",
    county_name: "Kraków i krakowski",
    county_slug: "krakowski",
    municipality_name: "Kraków",
    category_name: "Dostępność sensoryczna",
    category_code: "sensory",
    looking_for: "technologiczny",
    looking_for_display: "Partnera technologicznego",
    description: "Rozwijamy narzędzie komunikacji alternatywnej (AAC) dla osób po udarach i w spektrum autyzmu. Szukamy partnera technologicznego lub zespołu IT do optymalizacji interfejsu WCAG i wdrożenia mobilnego.",
    contact_email: "kontakt@horyzonty-spoldzielnia.pl",
    contact_phone: "12 430 11 22",
    is_active: true,
    target_partner_type: "Partnera technologicznego",
  },
];

export async function getPartnerships(filters?: {
  looking_for?: string;
  county?: string;
  category?: string;
  organization_type?: string;
  q?: string;
}): Promise<PartnershipItem[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.looking_for && filters.looking_for !== "all") params.set("looking_for", filters.looking_for);
    if (filters?.county && filters.county !== "all") params.set("county", filters.county);
    if (filters?.category && filters.category !== "all") params.set("category", filters.category);
    if (filters?.organization_type && filters.organization_type !== "all") params.set("organization_type", filters.organization_type);
    if (filters?.q) params.set("q", filters.q);

    const query = params.toString() ? `?${params.toString()}` : "";
    const list = await apiFetch<PartnershipItem[]>(`/partnerships/${query}`);
    return list && list.length > 0 ? list : FALLBACK_PARTNERSHIPS;
  } catch {
    return FALLBACK_PARTNERSHIPS;
  }
}

export async function createPartnership(payload: Partial<PartnershipItem>): Promise<PartnershipItem> {
  try {
    return await apiFetch<PartnershipItem>("/partnerships/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    const fallbackItem: PartnershipItem = {
      id: Math.floor(Math.random() * 8000) + 100,
      title: payload.title || "Nowe ogłoszenie partnerstwa",
      organization_name: payload.organization_name || "Podmiot zgłaszający",
      organization_type: payload.organization_type || "ngo",
      looking_for: payload.looking_for || "ngo",
      description: payload.description || "",
      contact_email: payload.contact_email || "kontakt@przyklad.pl",
      contact_phone: payload.contact_phone || "",
      municipality_name: payload.municipality_name || "",
      county_name: payload.county_name || "Województwo Małopolskie",
      category_name: payload.category_name || "Innowacje społeczne",
      is_active: true,
      created_at: new Date().toISOString(),
    };
    return fallbackItem;
  }
}



// ==========================================
// MODUŁ VI: PANEL ADMINISTRATORA ROPS KRAKÓW
// ==========================================

export type ProblemMatchItem = {
  id: number;
  innovation: SocialInnovation;
  similarity_score: number;
  justification: string;
  suggested_next_step: "middleman" | "tester" | "contact" | string;
  created_at: string;
};

export type ProblemSubmissionItem = {
  id: number;
  persona_key?: string;
  reporter_role: string;
  reporter_name: string;
  reporter_email: string;
  reporter_phone?: string;
  reporter_institution?: string;
  county?: number | null;
  county_name?: string;
  municipality_name?: string;
  category?: number | null;
  category_name?: string;
  title: string;
  description: string;
  affected_group: string;
  estimated_scale?: string;
  status: "pending" | "matched" | "gap_identified" | "in_progress" | "resolved";
  admin_notes?: string;
  matches?: ProblemMatchItem[];
  created_at: string;
  updated_at?: string;
};

export type IdeaSubmissionItem = {
  id: number;
  submission_type: "fiszka" | "grant_fers";
  persona_key?: string;
  title: string;
  category?: number | null;
  category_name?: string;
  county?: number | null;
  county_name?: string;
  status: "roboczy" | "zlozony" | "w_ocenie" | "zaakceptowany" | "odrzucony";
  applicant_type?: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  applicant_address?: string;
  applicant_city?: string;
  applicant_postal_code?: string;
  organization_krs?: string;
  organization_nip?: string;
  organization_regon?: string;
  organization_representative?: string;
  innovation_description?: string;
  solution_concept?: string;
  uniqueness_rationale?: string;
  problem_diagnosis?: string;
  target_recipients?: string;
  expected_change?: string;
  scalability_model?: string;
  action_plan_prep?: Array<{ dzialanie: string; termin: string; koszt?: number }>;
  action_plan_testing?: Array<{ dzialanie: string; termin: string; koszt?: number }>;
  requested_grant_amount?: number;
  team_experience?: string;
  formal_declarations_accepted?: boolean;
  admin_score?: number | null;
  admin_feedback?: string;
  created_at: string;
  updated_at?: string;
};

export const FALLBACK_PROBLEM_SUBMISSIONS: ProblemSubmissionItem[] = [
  {
    id: 1,
    persona_key: "anna_nowak",
    reporter_role: "mieszkaniec",
    reporter_name: "Anna Nowak",
    reporter_email: "anna.nowak@przyklad.pl",
    reporter_phone: "501 234 567",
    reporter_institution: "Klub Seniora w Grybowie",
    county: 1,
    county_name: "Powiat nowosądecki",
    municipality_name: "Grybów",
    category: 1,
    category_name: "Dla seniorów",
    title: "Wykluczenie transportowe i samotność seniorów w sołectwach wiejskich Grybowa",
    description: "Seniorzy mieszkający w przysiółkach nie mają jak dojechać do lekarza i na zajęcia klubu seniora. Często tygodniami nie rozmawiają z nikim poza listonoszem.",
    affected_group: "Osoby starsze 75+ i ich opiekunowie rodzinni w sołectwach wiejskich",
    estimated_scale: "Około 60 seniorów w 4 sołectwach gminy Grybów",
    status: "matched",
    admin_notes: "Zweryfikowano przez koordynatora ROPS. Zgłoszenie zakwalifikowane do wsparcia mobilnego. Powiązano z innowacją BaWita.",
    matches: [
      {
        id: 1,
        innovation: FALLBACK_INNOVATIONS[0],
        similarity_score: 91.5,
        justification: "Innowacja BaWita posiada moduł mobilny umożliwiający regularne dojazdy przeszkolonych animatorów i wolontariuszy do domów seniorów wiejskich wraz ze sprzętem aktywizującym.",
        suggested_next_step: "middleman",
        created_at: "2026-09-25T11:00:00Z",
      },
    ],
    created_at: "2026-09-25T10:45:00Z",
  },
  {
    id: 2,
    persona_key: "piotr_adamski",
    reporter_role: "ekspert",
    reporter_name: "dr Piotr Adamski",
    reporter_email: "ekspert@innowacjespoleczne.pl",
    reporter_phone: "601 987 654",
    reporter_institution: "Uniwersytet Pedagogiczny w Krakowie",
    county: 5,
    county_name: "Powiat gorlicki",
    municipality_name: "Biecz",
    category: 9,
    category_name: "Dla osób z niepełnosprawnością intelektualną",
    title: "Brak wsparcia wytchnieniowego dla opiekunów dorosłych osób z głęboką niepełnosprawnością sprzężoną",
    description: "Rodzice w wieku 60-70 lat opiekują się dorosłymi dziećmi 24h na dobę. Brak ośrodka dziennego lub mobilnej asystencji wytchnieniowej na terenie powiatu gorlickiego. Skrajne wyczerpanie opiekunów.",
    affected_group: "Opiekunowie 35 dorosłych osób z niepełnosprawnością sprzężoną w powiecie gorlickim",
    estimated_scale: "35 rodzin bez dostępu do placówki dziennej po ukończeniu 25 roku życia przez podopiecznych",
    status: "gap_identified",
    admin_notes: "BIAŁA PLAMA: W bazie innowacji ROPS brak gotowego modelu dla dorosłych ze sprzężeniami w powiatach peryferyjnych. Zgłoszenie skierowano do naboru wniosków FERS.",
    matches: [],
    created_at: "2026-09-28T09:30:00Z",
  },
  {
    id: 3,
    persona_key: "katarzyna_zielinska",
    reporter_role: "ngo",
    reporter_name: "Katarzyna Zielińska",
    reporter_email: "kontakt@aktywna-malopolska.pl",
    reporter_phone: "14 621 00 00",
    reporter_institution: "Fundacja Aktywna Małopolska",
    county: 3,
    county_name: "Powiat tarnowski",
    municipality_name: "Tarnów",
    category: 4,
    category_name: "Dla osób z niepełnosprawnością sensoryczną",
    title: "Bariery komunikacyjne dla osób głuchych w rejonowych przychodniach zdrowia",
    description: "Brak tłumacza PJM w placówkach zdrowia i brak możliwości rejestracji wizyty przez SMS/komunikator internetowy. Pacjenci muszą przychodzić z członkami rodzin do intymnych badań lekarskich.",
    affected_group: "Niesłyszący mieszkańcy Tarnowa i okolicznych gmin korzystający z POZ",
    estimated_scale: "Ponad 120 osób z wadami słuchu rocznie",
    status: "pending",
    admin_notes: "",
    matches: [],
    created_at: "2026-10-02T14:20:00Z",
  },
];

export const FALLBACK_IDEA_SUBMISSIONS: IdeaSubmissionItem[] = [
  {
    id: 1,
    submission_type: "grant_fers",
    persona_key: "katarzyna_zielinska",
    status: "w_ocenie",
    category: 1,
    category_name: "Dla seniorów",
    county: 3,
    county_name: "Powiat tarnowski",
    applicant_type: "podmiot_ngo",
    applicant_name: "Fundacja Aktywna Małopolska",
    applicant_email: "kontakt@aktywna-malopolska.pl",
    applicant_phone: "14 621 00 00",
    applicant_address: "ul. Krakowska 12",
    applicant_city: "Tarnów",
    applicant_postal_code: "33-100",
    organization_krs: "0000123456",
    organization_nip: "9930012345",
    organization_regon: "123456789",
    organization_representative: "Katarzyna Zielińska - Prezes Zarządu",
    title: "Sąsiedzka Sieć Wytchnieniowa – Mobilni wolontariusze wsparcia seniora",
    innovation_description: "Stworzenie aplikacji i procedury szybkiego wzywania przeszkolonych sąsiadów do doraźnej opieki wytchnieniowej.",
    uniqueness_rationale: "Tradycyjne agencje opieki są za drogie i nie docierają do małych sołectw. Nasz model opiera się na mikrostypendiach samopomocowych.",
    problem_diagnosis: "Oparte na Mapie Wyzwań ROPS dla powiatu tarnowskiego (24.2% seniorów).",
    target_recipients: "30 opiekunów rodzinnych osób niesamodzielnych.",
    expected_change: "Zmniejszenie obciążenia psychofizycznego opiekunów o min. 40%.",
    scalability_model: "Możliwość łatwej replikacji w każdym CUS w Małopolsce.",
    action_plan_prep: [
      { dzialanie: "Opracowanie standardu bezpieczeństwa i regulaminu", termin: "Miesiąc 1-2", koszt: 8000 },
      { dzialanie: "Warsztaty pierwszej pomocy dla wolontariuszy", termin: "Miesiąc 3", koszt: 6000 },
    ],
    action_plan_testing: [
      { dzialanie: "Pilotaż u 30 rodzin w 3 gminach wiejskich", termin: "Miesiące 4-9", koszt: 34000 },
      { dzialanie: "Ewaluacja i raport końcowy", termin: "Miesiące 10-12", koszt: 2000 },
    ],
    requested_grant_amount: 50000,
    team_experience: "10 lat doświadczenia w realizacji projektów społecznych FERS i ASOS w Małopolsce.",
    formal_declarations_accepted: true,
    created_at: "2026-09-27T16:00:00Z",
  },
  {
    id: 2,
    submission_type: "fiszka",
    persona_key: "marek_wisniewski",
    status: "zaakceptowany",
    category: 1,
    category_name: "Dla seniorów",
    county: 2,
    county_name: "Powiat myślenicki",
    applicant_name: "Marek Wiśniewski",
    applicant_email: "cus@myslenice.pl",
    title: "Klub Aktywnego Seniora z warsztatem cyfrowym",
    solution_concept: "Adaptacja remizy OSP na przestrzeń spotkań i nauki cyfrowej dla osób 60+.",
    target_recipients: "Seniorzy z sołectw gminy Myślenice",
    admin_score: 90,
    admin_feedback: "Bardzo cenna inicjatywa łącząca CUS z OSP. Skierowano do inkubacji.",
    created_at: "2026-09-15T12:00:00Z",
  },
];

/** Pobiera listę zgłoszeń problemów dla panelu moderatora ROPS */
export async function getProblemSubmissions(filters?: {
  status?: string;
  county?: string;
  persona?: string;
  category?: string;
  q?: string;
}): Promise<ProblemSubmissionItem[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== "all") params.set("status", filters.status);
    if (filters?.county && filters.county !== "all") params.set("county", filters.county);
    if (filters?.persona) params.set("persona", filters.persona);
    if (filters?.category && filters.category !== "all") params.set("category", filters.category);
    if (filters?.q) params.set("q", filters.q);

    const query = params.toString() ? `?${params.toString()}` : "";
    const list = await apiFetch<ProblemSubmissionItem[]>(`/problems/${query}`);
    return list && list.length > 0 ? list : FALLBACK_PROBLEM_SUBMISSIONS;
  } catch {
    let result = [...FALLBACK_PROBLEM_SUBMISSIONS];
    if (filters?.status && filters.status !== "all") {
      result = result.filter((s) => s.status === filters.status);
    }
    if (filters?.county && filters.county !== "all") {
      result = result.filter((s) => s.county_name?.toLowerCase().includes(filters.county!.toLowerCase()));
    }
    if (filters?.q) {
      const q = filters.q.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.reporter_name.toLowerCase().includes(q)
      );
    }
    return result;
  }
}

/** Moderacja zgłoszenia potrzeby przez koordynatora ROPS */
export async function moderateProblemSubmission(
  id: number,
  payload: { status: string; admin_notes?: string }
): Promise<ProblemSubmissionItem> {
  try {
    return await apiFetch<ProblemSubmissionItem>(`/admin/moderate/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  } catch {
    const found = FALLBACK_PROBLEM_SUBMISSIONS.find((s) => s.id === id);
    if (found) {
      found.status = payload.status as ProblemSubmissionItem["status"];
      if (payload.admin_notes !== undefined) found.admin_notes = payload.admin_notes;
      return { ...found };
    }
    return {
      id,
      reporter_role: "mieszkaniec",
      reporter_name: "Zgłaszający",
      reporter_email: "kontakt@przyklad.pl",
      title: "Zgłoszenie",
      description: "",
      affected_group: "",
      status: payload.status as ProblemSubmissionItem["status"],
      admin_notes: payload.admin_notes || "",
      created_at: new Date().toISOString(),
    };
  }
}

/** Pobiera listę wniosków i pomysłów z Kreatora (Moduł III) */
export async function getIdeaSubmissions(filters?: {
  type?: string;
  status?: string;
  persona?: string;
}): Promise<IdeaSubmissionItem[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.type && filters.type !== "all") params.set("type", filters.type);
    if (filters?.status && filters.status !== "all") params.set("status", filters.status);
    if (filters?.persona) params.set("persona", filters.persona);

    const query = params.toString() ? `?${params.toString()}` : "";
    const list = await apiFetch<IdeaSubmissionItem[]>(`/ideas/${query}`);
    return list && list.length > 0 ? list : FALLBACK_IDEA_SUBMISSIONS;
  } catch {
    let result = [...FALLBACK_IDEA_SUBMISSIONS];
    if (filters?.type && filters.type !== "all") {
      result = result.filter((i) => i.submission_type === filters.type);
    }
    if (filters?.status && filters.status !== "all") {
      result = result.filter((i) => i.status === filters.status);
    }
    return result;
  }
}

/** Ocena wniosku grantowego FERS przez koordynatora ROPS */
export async function evaluateIdeaSubmission(
  id: number,
  payload: { score?: number; feedback?: string; status?: string }
): Promise<IdeaSubmissionItem> {
  try {
    return await apiFetch<IdeaSubmissionItem>(`/ideas/${id}/evaluate/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    const found = FALLBACK_IDEA_SUBMISSIONS.find((i) => i.id === id);
    if (found) {
      if (payload.score !== undefined) found.admin_score = payload.score;
      if (payload.feedback !== undefined) found.admin_feedback = payload.feedback;
      if (payload.status) found.status = payload.status as IdeaSubmissionItem["status"];
      return { ...found };
    }
    throw new Error("Wniosek nie został odnaleziony");
  }
}

/** Aktualizacja etapu dojrzałości innowacji społecznej (Moduł VI & IV) */
export async function updateInnovationStage(
  slug: string,
  payload: { maturity_stage: string; replication_readiness_score?: number }
): Promise<SocialInnovation> {
  try {
    return await apiFetch<SocialInnovation>(`/innovations/${slug}/update-stage/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    const found = FALLBACK_INNOVATIONS.find((i) => i.slug === slug);
    if (found) {
      found.maturity_stage = payload.maturity_stage as SocialInnovation["maturity_stage"];
      if (payload.replication_readiness_score !== undefined) {
        found.replication_readiness_score = payload.replication_readiness_score;
      }
      return { ...found };
    }
    throw new Error("Innowacja nie została odnaleziona");
  }
}

/** Odpowiedź koordynatora ROPS na zapytanie mieszkańca / NGO / JST */
export async function answerInquiry(
  id: number,
  payload: { response: string; responder_name: string; is_answered?: boolean; is_public_faq?: boolean }
): Promise<InquiryItem> {
  try {
    return await apiFetch<InquiryItem>(`/inquiries/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({
        response: payload.response,
        responder_name: payload.responder_name,
        is_answered: payload.is_answered ?? true,
        is_public_faq: payload.is_public_faq ?? false,
      }),
    });
  } catch {
    const found = FALLBACK_INQUIRIES.find((i) => i.id === id);
    if (found) {
      found.response = payload.response;
      found.responder_name = payload.responder_name;
      found.is_answered = payload.is_answered ?? true;
      if (payload.is_public_faq !== undefined) found.is_public_faq = payload.is_public_faq;
      return { ...found };
    }
    throw new Error("Zapytanie nie zostało odnalezione");
  }
}
