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
    maturity_stage: "testy",
    innovation_type: "produkt",
    short_summary: "Przenośny zestaw stymulacji sensorycznej i pamięciowej dla seniorów i osób z demencją w placówkach i środowisku domowym.",
    full_description: "BaWita to innowacyjny zestaw modułowych elementów sensoryczno-manualnych, zaprojektowany z myślą o osobach z otępieniem, chorobą Alzheimera oraz seniorach doświadczających izolacji. Może być transportowany w poręcznej walizce do domu podopiecznego lub świetlicy wiejskiej przez asystenta CUS.",
    target_audience: "Seniorzy 65+, osoby z chorobami otępiennymi, opiekunowie rodzinni",
    implementation_guide: "Krok 1: Zamówienie certyfikowanego zestawu od producenta społecznego.\nKrok 2: 4-godzinny instruktaż opiekunów i asystentów CUS.\nKrok 3: Włączenie tablicy w harmonogram wizyt domowych (2-3 razy w tygodniu po 45 min).",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    video_transcript: "[0:00 - 0:45] Lektor: Prezentujemy BaWita – zestaw sensoryczny opracowany w Małopolskim Inkubatorze Innowacji Społecznych ROPS Kraków. Widzimy drewnianą tablicę z bezpiecznymi elementami manipulacyjnymi: zamki, przełączniki, labirynty dotykowe.\n[0:45 - 1:30] Terapeuta zajęciowy: Narzędzie pozwala na ćwiczenie motoryki małej i pobudzanie wspomnień u osób z zaawansowaną demencją bez konieczności opuszczania domu.\n[1:30 - 2:00] Lektor: Zestaw jest lekki, w pełni zmywalny i bezpieczny zgodnie z normami medycznymi WCAG i PFRON.",
    handbook_pdf_url: "/documents/podrecznik_bawita_rops.pdf",
    author_name: "Zespół Terapeutyczny Inkubatora ROPS",
    author_organization: "Fundacja Rozwoju Terapii Zajęciowej (Nowy Sącz)",
    author_email: "kontakt@bawita-innowacje.pl",
    replication_readiness_score: 92,
    likes_count: 48,
    matches_count: 31,
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
    full_description: "Senior CUDER (Ciało, Umysł, Duch, Emocje, Relacje) to holistyczna metoda pracy grupowej. Pozwala osobom starszym w bezpieczny sposób rozmawiać o trudnych emocjach, stracie, samotności, jednocześnie budując nowe relacje sąsiedzkie w klubach seniora i sołectwach.",
    target_audience: "Samotni seniorzy, kluby seniora, koła gospodyń wiejskich, wolontariusze",
    implementation_guide: "Szkolenie lidera klubu seniora trwa 1 dzień. Zestaw gry zawiera planszę, karty pytań, żetony relacji i podręcznik facylitatora.",
    video_url: "https://www.youtube.com/watch?v=sample_cuder",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:30] Facylitator: Witamy na międzypokoleniowej rozgrywce Senior CUDER. Uczestnicy losują kartę z obszaru 'Emocje'.\n[0:30 - 1:15] Uczestniczka (72 lata): 'Co dodaje mi otuchy w trudnym dniu? Rozmowa z sąsiadką i chwila przy herbacie.' Grupa dzieli się swoimi doświadczeniami.\n[1:15 - 2:00] Podsumowanie: Gra nie tworzy rywalizacji, lecz przestrzeń głębokiego wzajemnego zrozumienia i przełamywania izolacji.",
    handbook_pdf_url: "/documents/senior_cuder_zasady.pdf",
    author_name: "Dr Joanna Kowalska",
    author_organization: "Stowarzyszenie Dialog Społeczny Kraków",
    author_email: "cuder@dialogspoleczny.pl",
    replication_readiness_score: 96,
    likes_count: 65,
    matches_count: 42,
    tags: ["seniorzy", "grywalizacja", "integracja", "zdrowie psychiczne", "samotność"],
  },
  {
    id: 3,
    title: "Modularne łazienki – Likwidacja barier architektonicznych",
    slug: "modularne-lazienki-dla-seniorow",
    category: 3,
    category_name: "Dla osób o ograniczonej mobilności",
    category_code: "mobility",
    maturity_stage: "sprawdzona",
    innovation_type: "produkt",
    short_summary: "System bezinwazyjnych, demontowalnych uchwytów i podestów likwidujących bariery w wiejskich domach seniorów.",
    full_description: "Wielu seniorów w Małopolsce mieszka w domach z głębokimi wannami i wysokimi progami. Modularny pakiet pozwala w 3 godziny przekształcić łazienkę bez kucia płytek i kosztownych remontów, z możliwością późniejszego przeniesienia lub zwrotu do wypożyczalni CUS.",
    target_audience: "Osoby o ograniczonej mobilności, poruszające się o kulach lub wózkach, seniorzy 70+",
    implementation_guide: "Montaż przez gminnego konserwatora lub wolontariusza NGO na podstawie prostego szablonu miarowego w czasie poniżej 3 godzin.",
    video_url: "https://www.youtube.com/watch?v=sample_lazienki",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:45] Montażysta: Prezentujemy bezinwazyjny montaż modularnej ławeczki nawannowej i profilowanych poręczy ściennych z atestem udźwigu do 150 kg.\n[0:45 - 1:30] Demonstracja: Poręcze mocowane są za pomocą szybkozłączek rozporowych, bez uszkodzenia kafelków.\n[1:30 - 2:00] Podsumowanie: Bezpieczna toaleta i kąpiel bez asysty osób trzecich.",
    handbook_pdf_url: "/documents/katalog_lazienki_dostepne.pdf",
    author_name: "Inż. Andrzej Mazur",
    author_organization: "Fundacja Architektura Bez Barier",
    author_email: "kontakt@dostepnelazienki.pl",
    replication_readiness_score: 94,
    likes_count: 91,
    matches_count: 44,
    tags: ["łazienka", "dostępność", "mieszkanie", "senior", "bariery architektoniczne"],
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
    short_summary: "Metoda animacji sąsiedzkiej aktywizująca mieszkańców do samopomocy i tworzenia lokalnych grup wsparcia.",
    full_description: "Model wdrożony i przetestowany m.in. w Centrum Usług Społecznych w Myślenicach. Zamiast czekać na zgłoszenia zasiłkowe, organizator wychodzi w teren, mapuje potencjał sołectw i wspiera powstawanie oddolnych inicjatyw sąsiedzkich.",
    target_audience: "Mieszkańcy gmin wiejskich i małych miast, samorządy, liderzy lokalni",
    implementation_guide: "Standard procedur dla CUS, opisy stanowisk pracy i zestaw narzędzi mapowania zasobów sołeckich.",
    video_url: "https://www.youtube.com/watch?v=sample_osl",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:45] OSL Marek Wiśniewski: Witamy w Myślenicach. Rola Organizatora Społeczności Lokalnej polega na słuchaniu mieszkańców w ich naturalnym środowisku.\n[0:45 - 1:30] Ujęcia z sołectwa: Mieszkańcy organizują wspólnie przestrzeń dla dzieci i punkt wymiany książek.\n[1:30 - 2:00] Marek Wiśniewski: CUS daje impuls i ubezpieczenie, a mieszkańcy tworzą trwałą sieć samopomocy.",
    handbook_pdf_url: "/documents/standard_osl_rops.pdf",
    author_name: "Marek Wiśniewski i Zespół ROPS",
    author_organization: "Centrum Usług Społecznych w Myślenicach",
    author_email: "cus@myslenice.pl",
    replication_readiness_score: 97,
    likes_count: 115,
    matches_count: 67,
    tags: ["CUS", "animacja", "samorząd", "JST", "samopomoc", "sołectwo"],
  },
  {
    id: 5,
    title: "Kawiarenka Naprawcza – Międzypokoleniowy punkt wymiany umiejętności",
    slug: "kawiarenka-naprawcza",
    category: 6,
    category_name: "Dla rynku pracy",
    category_code: "labor",
    maturity_stage: "sprawdzona",
    innovation_type: "metoda",
    short_summary: "Otwarte warsztaty, gdzie seniorzy-majsterkowicze uczą młodzież naprawy sprzętu, budując relacje i redukując odpady.",
    full_description: "Kawiarenka Naprawcza (Repair Cafe) łączy cele ekologiczne z włączeniem społecznym i reintegracją zawodową. Seniorzy odzyskują poczucie sprawczości i wartości, a młodzież zdobywa praktyczne kompetencje techniczne i rzemieślnicze.",
    target_audience: "Seniorzy rzemieślnicy, młodzież szkolna, rodziny z dziećmi",
    implementation_guide: "Zestaw narzędzi w skrzynce, regulamin BHP punktu naprawczego i wzory plakatów promocyjnych.",
    video_url: "https://www.youtube.com/watch?v=sample_kawiarenka",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:45] Katarzyna Zielińska: Kawiarenka Naprawcza to nie tylko serwis, to przede wszystkim spotkanie pokoleń przy stole warsztatowym.\n[0:45 - 1:30] Senior (68 lat) instruuje nastolatka, jak wymienić bezpiecznik i przylutować kabel w zabytkowej lampce.\n[1:30 - 2:00] Efekt: Sprzęt działa, a uczestnicy umawiają się na kolejne spotkanie w świetlicy.",
    handbook_pdf_url: "/documents/kawiarenka_naprawcza_poradnik.pdf",
    author_name: "Katarzyna Zielińska",
    author_organization: "Fundacja Aktywna Małopolska (Tarnów)",
    author_email: "kontakt@aktywna-malopolska.pl",
    replication_readiness_score: 90,
    likes_count: 73,
    matches_count: 28,
    tags: ["naprawy", "majsterkowanie", "ekologia", "międzypokoleniowe", "NGO"],
  },
  {
    id: 6,
    title: "Merkury – Symulator samoobsługowy dla seniorów i osób z niepełnosprawnościami",
    slug: "merkury-symulator-samoobslugowy",
    category: 4,
    category_name: "Dla osób z niepełnosprawnością sensoryczną",
    category_code: "sensory",
    maturity_stage: "prototyp",
    innovation_type: "technologia",
    short_summary: "Dotykowy trenażer ułatwiający naukę korzystania z biletomatów, bankomatów i kas samoobsługowych bez stresu.",
    full_description: "Symulator Merkury wiernie odtwarza ekrany powszechnych urządzeń samoobsługowych w bezpiecznych warunkach biblioteki lub klubu seniora. Posiada audiodeskrypcję, tryb wysokiego kontrastu oraz regulację tempa komunikatów głosowych.",
    target_audience: "Osoby starsze z lękiem technologicznym, osoby niedowidzące, podopieczni WTZ",
    implementation_guide: "Instalacja oprogramowania na tablecie lub monitorze dotykowym w bibliotece gminnej wraz ze scenariuszami lekcji.",
    video_url: "https://www.youtube.com/watch?v=sample_merkury",
    video_transcript: "Transkrypcja WCAG 2.2 AA:\n[0:00 - 0:45] Prezenter: Przedstawiamy aplikację Merkury, która krok po kroku uczy zakupu biletu kolejowego i płatności kartą.\n[0:45 - 1:30] Użytkownik ćwiczy na dużym ekranie. Asystent cyfrowy podpowiada kolejne kroki głosem syntetycznym.\n[1:30 - 2:00] Podsumowanie: Po trzech treningach 90% badanych seniorów samodzielnie skorzystało z biletomatu na dworcu.",
    handbook_pdf_url: "/documents/instrukcja_merkury_trener.pdf",
    author_name: "Dr Piotr Adamski",
    author_organization: "Politechnika Krakowska & ROPS",
    author_email: "ekspert@innowacjespoleczne.pl",
    replication_readiness_score: 85,
    likes_count: 54,
    matches_count: 36,
    tags: ["cyfryzacja", "dostępność", "seniorzy", "sensoryka", "samoobsługa"],
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
    related_innovations: [FALLBACK_INNOVATIONS[0], FALLBACK_INNOVATIONS[1]],
  },
  {
    id: 2,
    title: "Kryzys dobrostanu psychicznego dzieci i młodzieży",
    slug: "kryzys-dobrostanu-psychicznego-mlodziezy",
    category_name: "Dla dzieci, młodzieży i rodziny",
    category_code: "youth_family",
    county_name: "Powiat krakowski",
    county_slug: "krakowski",
    summary: "Nasilenie zaburzeń nastroju i stanów lękowych u nastolatków w gminach podmiejskich przy niewystarczającej liczbie poradni psychologiczno-pedagogicznych.",
    full_analysis: "Z danych ROPS Kraków wynika, że czas oczekiwania na konsultację psychiatryczną dzieci w aglomeracji krakowskiej przekracza 8 miesięcy. Kluczowe jest wdrożenie środowiskowych form wczesnej interwencji oraz punktów wsparcia rówieśniczego.",
    statistical_data: {
      "Wzrost zgłoszeń kryzysowych": "+42% r/r",
      "Dostępność psychologów szkolnych": "0.6 etatu/szkołę",
      "Młodzież objęta pomocą CUS": 1820,
    },
    key_needs: [
      "Środowiskowe kluby młodzieżowe",
      "Szkolenia rówieśniczych liderów wsparcia",
      "Metody animacji sąsiedzkiej OSL",
    ],
    related_innovations: [FALLBACK_INNOVATIONS[3]],
  },
  {
    id: 3,
    title: "Bariery architektoniczne i wykluczenie mobilnościowe w starym budownictwie wiejskim",
    slug: "bariery-architektoniczne-w-budownictwie-wiejskim",
    category_name: "Dla osób o ograniczonej mobilności",
    category_code: "mobility",
    county_name: "Powiat tarnowski",
    county_slug: "tarnowski",
    summary: "Tysiące domów jednorodzinnych z lat 70. i 80. uniemożliwia osobom z niepełnosprawnościami i seniorom bezpieczne korzystanie z łazienki.",
    full_analysis: "Brak środków na kapitalne remonty powoduje tzw. uwięzienie domowe seniorów. Niezbędne jest upowszechnienie tanich, modularnych rozwiązań montowanych bezinwazyjnie przez gminne Centra Usług Społecznych.",
    statistical_data: {
      "Osoby z orzeczeniem o niepełnosprawności": "13.4%",
      "Domy bez podjazdu / windy": "78%",
      "Średni koszt adaptacji łazienki tradycyjnej": "28 000 PLN",
    },
    key_needs: [
      "Modularne pakiety łazienkowe",
      "Wypożyczalnie sprzętu rehabilitacyjnego",
      "Doradztwo architektoniczne dla gmin",
    ],
    related_innovations: [FALLBACK_INNOVATIONS[2]],
  },
  {
    id: 4,
    title: "Wykluczenie cyfrowe i brak dostępu do e-usług w gminach peryferyjnych",
    slug: "wykluczenie-cyfrowe-w-gminach-peryferyjnych",
    category_name: "Dla osób z niepełnosprawnością sensoryczną",
    category_code: "sensory",
    county_name: "Powiat gorlicki",
    county_slug: "gorlicki",
    summary: "Wysoki odsetek seniorów niepotrafiących samodzielnie zrealizować e-recepty czy załatwić sprawy urzędowej przez internet.",
    full_analysis: "Bariera lęku technologicznego oraz skomplikowane interfejsy kas samoobsługowych pogłębiają zależność osób starszych od opiekunów. Rozwiązaniem są trenażery i bezpieczne punkty edukacji cyfrowej.",
    statistical_data: {
      "Osoby 65+ bez smartfona/internetu": "46.2%",
      "Odległość do najbliższego bankomatu": "9.4 km",
      "Kluby seniora z salą komputerową": 4,
    },
    key_needs: [
      "Trenażery samoobsługowe Merkury",
      "Wolontariat cyfrowy w sołectwach",
      "Mobilne punkty e-administracji",
    ],
    related_innovations: [FALLBACK_INNOVATIONS[5], FALLBACK_INNOVATIONS[4]],
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
};

export async function generateMiddlemanPackage(payload: MiddlemanPackagePayload): Promise<MiddlemanPackageResult> {
  try {
    return await apiFetch<MiddlemanPackageResult>("/middleman/package/", {
      method: "POST",
      body: JSON.stringify({
        innovation_id: Number(payload.innovation_id) || 1,
        county_id: Number(payload.county_id) || 1,
        municipality_name: payload.municipality_name || "Gmina Małopolska",
        municipality_type: payload.municipality_type || "gmina_wiejska",
        population: payload.population || 14500,
        has_cus: payload.has_cus ?? true,
        execution_model: payload.execution_model || "wlasny_cus",
      }),
    });
  } catch (err) {
    console.warn("[generateMiddlemanPackage] Backend niedostępny – używam lokalnego fallbacku:", err);
    const pop = payload.population || 14500;
    const baseAnnual = pop < 10000 ? 45000 : pop < 30000 ? 75000 : 120000;
    return {
      id: 99,
      service_name: `Pakiet wdrożeniowy usługi społecznej dla ${payload.municipality_name || "gminy"}`,
      service_standard: `Certyfikowany standard ROPS Kraków: świadczenie wsparcia z wykorzystaniem metodyki innowacji społecznej w gminie ${payload.municipality_name || "małopolskiej"} (${pop} mieszkańców). Dostępność architektoniczna i cyfrowa WCAG 2.2 AA.`,
      staffing_requirements: [
        {
          role: "Koordynator Usługi Społecznej",
          allocation: "0.5 etatu",
          qualifications: "Wykształcenie wyższe (praca socjalna / pedagogika / organizacja pomocy społecznej)",
        },
        {
          role: "Animator / Realizator innowacji",
          allocation: "1.0 etat",
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
        { source: "FERS Działanie 5.1 (Innowacje Społeczne ROPS)", percentage: 70, amount_pln: Math.round(baseAnnual * 0.70) },
        { source: "Środki własne JST / CUS", percentage: 15, amount_pln: Math.round(baseAnnual * 0.15) },
        { source: "PFRON / Programy Dostępności", percentage: 15, amount_pln: Math.round(baseAnnual * 0.15) },
      ],
      implementation_steps: [
        { month: "Miesiąc 1", step: "Uchwała Rady Gminy i włączenie usługi do Programu Usług Społecznych (PUS)." },
        { month: "Miesiąc 2", step: "Przeszkolenie kadry w ROPS Kraków i odbiór bezpłatnych materiałów wdrożeniowych." },
        { month: "Miesiąc 3", step: "Rekrutacja mieszkańców i start bezpośrednich świadczeń opiekuńczo-włączających." },
      ],
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

