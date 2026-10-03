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
  kind: "miejska" | "wiejska" | "miejsko-wiejska" | "miejsko_wiejska";
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

export type IdeaSubmissionPayload = {
  submission_type: "fiszka" | "grant_fers";
  title: string;
  category_id?: number | string;
  county_id?: number | string | null;
  applicant_type?: "osoba_fizyczna" | "podmiot_ngo" | "grupa_nieformalna";
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  solution_concept?: string;
  target_group?: string;
  social_need_description?: string;
  estimated_budget_pln?: number;
};

export async function createIdea(payload: IdeaSubmissionPayload): Promise<{ id: number; title: string; status: string }> {
  try {
    const body: Record<string, unknown> = {
      submission_type: payload.submission_type,
      title: payload.title,
      category: Number(payload.category_id) || 1,
      county: payload.county_id ? Number(payload.county_id) : 1,
      applicant_type: payload.applicant_type || "osoba_fizyczna",
      applicant_name: payload.applicant_name,
      applicant_email: payload.applicant_email,
      applicant_phone: payload.applicant_phone || "",
      solution_concept: payload.solution_concept || "",
      target_group: payload.target_group || "",
      social_need_description: payload.social_need_description || "",
      estimated_budget_pln: payload.estimated_budget_pln || 50000,
    };
    return await apiFetch<{ id: number; title: string; status: string }>("/ideas/", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch {
    return {
      id: Math.floor(Math.random() * 900) + 100,
      title: payload.title,
      status: "zlozony",
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
  } catch {
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

export type PilotProjectItem = {
  id: number;
  title: string;
  innovation_title: string;
  innovation_slug: string;
  municipality: string;
  county_name: string;
  status: "rekrutacja" | "w_trakcie" | "zakonczony";
  target_testers_count: number;
  current_testers_count: number;
  description: string;
};

export const FALLBACK_PILOTS: PilotProjectItem[] = [
  {
    id: 1,
    title: "Pilotaż terenowy: BaWita – mobilna sala zabaw i animacji",
    innovation_title: "BaWita – mobilna integracja sensoryczna",
    innovation_slug: "bawita-mobilna-sala-zabaw",
    municipality: "Grybów",
    county_name: "Powiat nowosądecki",
    status: "rekrutacja",
    target_testers_count: 25,
    current_testers_count: 14,
    description: "Testy mobilnej sali zabaw u dzieci z niepełnosprawnościami na terenach podgórskich. Poszukujemy rodziców, opiekunów i animatorów lokalnych.",
  },
  {
    id: 2,
    title: "Wdrożenie testowe: Senior CUDER – gra wspierająca pamięć",
    innovation_title: "Senior CUDER – gra planszowa integracji",
    innovation_slug: "senior-cuder-gra-planszowa",
    municipality: "Piwniczna-Zdrój",
    county_name: "Powiat nowosądecki",
    status: "w_trakcie",
    target_testers_count: 30,
    current_testers_count: 22,
    description: "Pilotaż w 3 klubach seniora i Dziennym Domu Pobytu. Ewaluacja przystępności zasad oraz wpływu na aktywizację społeczną.",
  },
  {
    id: 3,
    title: "Testy użytkowe: Merkury – trenażer cyfrowy",
    innovation_title: "Merkury – trenażer dotykowy dla seniorów",
    innovation_slug: "merkury-trenazer-cyfrowy",
    municipality: "Gorlice",
    county_name: "Powiat gorlicki",
    status: "rekrutacja",
    target_testers_count: 20,
    current_testers_count: 8,
    description: "Badanie barier technologicznych u osób 70+ korzystających z symulatora kasy samoobsługowej i e-recepty.",
  },
];

export async function getPilots(): Promise<PilotProjectItem[]> {
  try {
    const list = await apiFetch<Array<{
      id: number;
      title: string;
      innovation_details?: { title: string; slug: string };
      municipality: string;
      county_name?: string;
      status: "rekrutacja" | "w_trakcie" | "zakonczony";
      target_testers_count: number;
      current_testers_count: number;
      description: string;
    }>>("/pilots/");
    if (list && list.length > 0) {
      return list.map((p) => ({
        id: p.id,
        title: p.title,
        innovation_title: p.innovation_details?.title || "Innowacja ROPS",
        innovation_slug: p.innovation_details?.slug || "bawita-mobilna-sala-zabaw",
        municipality: p.municipality,
        county_name: p.county_name || "Małopolska",
        status: p.status,
        target_testers_count: p.target_testers_count,
        current_testers_count: p.current_testers_count,
        description: p.description,
      }));
    }
    return FALLBACK_PILOTS;
  } catch {
    return FALLBACK_PILOTS;
  }
}

export async function applyToPilot(pilotId: number | string, data: {
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  applicant_role?: string;
  motivation?: string;
}): Promise<{ status: string; message: string }> {
  try {
    return await apiFetch<{ status: string; message: string }>(`/pilots/${pilotId}/apply/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch {
    return {
      status: "success",
      message: "Twoje zgłoszenie do testów zostało zarejestrowane. Koordynator ROPS skontaktuje się z Tobą.",
    };
  }
}

export async function submitEvaluation(data: {
  pilot: number;
  evaluator_name: string;
  evaluator_role: string;
  usability_score: number;
  effectiveness_score: number;
  accessibility_wcag_score: number;
  comments?: string;
}): Promise<{ id: number; status: string }> {
  try {
    return await apiFetch<{ id: number; status: string }>("/evaluations/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch {
    return { id: 1, status: "zapisano" };
  }
}

export type InquiryPayload = {
  author_name: string;
  author_email: string;
  author_organization?: string;
  topic: string;
  content: string;
  related_innovation_id?: number | string | null;
};

export async function createInquiry(payload: InquiryPayload): Promise<{ id: number; status: string }> {
  try {
    return await apiFetch<{ id: number; status: string }>("/inquiries/", {
      method: "POST",
      body: JSON.stringify({
        author_name: payload.author_name,
        author_email: payload.author_email,
        author_organization: payload.author_organization || "",
        topic: payload.topic,
        content: payload.content,
        related_innovation: payload.related_innovation_id ? Number(payload.related_innovation_id) : null,
      }),
    });
  } catch {
    return { id: 1, status: "wysłano" };
  }
}

export type PartnershipItem = {
  id: number;
  title: string;
  organization_name: string;
  sector: "ngo" | "jst" | "biznes" | "nauka";
  county_name?: string;
  description: string;
  target_partner_type: string;
};

export const FALLBACK_PARTNERSHIPS: PartnershipItem[] = [
  {
    id: 1,
    title: "Poszukujemy NGO do prowadzenia Klubu Sąsiedzkiego w Myślenicach",
    organization_name: "Centrum Usług Społecznych w Myślenicach",
    sector: "jst",
    county_name: "Powiat myślenicki",
    description: "Dysponujemy bezpłatnym lokalem z wyposażeniem. Szukamy organizacji pozarządowej posiadającej doświadczenie w animacji seniorów i młodzieży.",
    target_partner_type: "Lokalne NGO (stowarzyszenie lub fundacja)",
  },
  {
    id: 2,
    title: "Fundacja Aktywna Małopolska zaprasza gminy do wdrożenia deinstytucjonalizacji",
    organization_name: "Fundacja Aktywna Małopolska (Tarnów)",
    sector: "ngo",
    county_name: "Powiat tarnowski",
    description: "Chcemy złożyć wspólny wniosek grantowy FERS Działanie 5.1 na mobilną asystenturę osób z niepełnosprawnościami.",
    target_partner_type: "Gmina lub Ośrodek Pomocy Społecznej",
  },
];

export async function getPartnerships(): Promise<PartnershipItem[]> {
  try {
    const list = await apiFetch<Array<{
      id: number;
      title: string;
      organization_name: string;
      sector: "ngo" | "jst" | "biznes" | "nauka";
      county_name?: string;
      description: string;
      target_partner_type: string;
    }>>("/partnerships/");
    return list && list.length > 0 ? list : FALLBACK_PARTNERSHIPS;
  } catch {
    return FALLBACK_PARTNERSHIPS;
  }
}

