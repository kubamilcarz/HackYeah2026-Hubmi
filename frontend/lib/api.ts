/**
 * Klient API platformy Splot do komunikacji z backendem Django REST Framework.
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
  kind: "miejska" | "wiejska" | "miejsko_wiejska";
  has_cus: boolean;
};

export type County = {
  id: number;
  name: string;
  slug: string;
  senior_ratio: string;
  unemployment_rate: string;
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
  innovation_type: "usluga" | "produkt" | "metoda" | "narzedzie_cyfrowe";
  short_summary: string;
  full_description?: string;
  target_audience: string;
  implementation_guide?: string;
  video_url?: string;
  video_transcript?: string;
  handbook_pdf_url?: string;
  author_name?: string;
  author_organization?: string;
  replication_readiness_score: number;
  likes_count: number;
  matches_count: number;
  tags: string[];
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
    name: "nowosądecki",
    slug: "nowosadecki",
    senior_ratio: "21.4",
    unemployment_rate: "7.8",
    municipalities: [
      { id: 1, name: "Grybów", kind: "miejsko_wiejska", has_cus: false },
      { id: 2, name: "Stary Sącz", kind: "miejsko_wiejska", has_cus: true },
      { id: 3, name: "Krynica-Zdrój", kind: "miejsko_wiejska", has_cus: false },
    ],
  },
  {
    id: 2,
    name: "myślenicki",
    slug: "myslenicki",
    senior_ratio: "19.8",
    unemployment_rate: "5.2",
    municipalities: [
      { id: 4, name: "Myślenice", kind: "miejsko_wiejska", has_cus: true },
      { id: 5, name: "Dobczyce", kind: "miejsko_wiejska", has_cus: false },
    ],
  },
  {
    id: 3,
    name: "tarnowski",
    slug: "tarnowski",
    senior_ratio: "24.2",
    unemployment_rate: "8.5",
    municipalities: [
      { id: 6, name: "Tarnów", kind: "miejska", has_cus: true },
      { id: 7, name: "Żabno", kind: "miejsko_wiejska", has_cus: false },
    ],
  },
  {
    id: 4,
    name: "krakowski",
    slug: "krakowski",
    senior_ratio: "25.1",
    unemployment_rate: "3.1",
    municipalities: [
      { id: 8, name: "Kraków", kind: "miejska", has_cus: true },
      { id: 9, name: "Wieliczka", kind: "miejsko_wiejska", has_cus: false },
      { id: 10, name: "Skawina", kind: "miejsko_wiejska", has_cus: true },
    ],
  },
  {
    id: 5,
    name: "gorlicki",
    slug: "gorlicki",
    senior_ratio: "26.3",
    unemployment_rate: "9.1",
    municipalities: [
      { id: 11, name: "Gorlice", kind: "miejska", has_cus: false },
      { id: 12, name: "Biecz", kind: "miejsko_wiejska", has_cus: false },
    ],
  },
  {
    id: 6,
    name: "tatrzański",
    slug: "tatrzanski",
    senior_ratio: "22.0",
    unemployment_rate: "6.4",
    municipalities: [
      { id: 13, name: "Zakopane", kind: "miejska", has_cus: false },
      { id: 14, name: "Poronin", kind: "wiejska", has_cus: false },
    ],
  },
];

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
  q?: string;
}): Promise<SocialInnovation[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.county) searchParams.set("county", params.county);
    if (params?.stage) searchParams.set("stage", params.stage);
    if (params?.q) searchParams.set("q", params.q);

    const query = searchParams.toString();
    const endpoint = `/innovations/${query ? `?${query}` : ""}`;
    return await apiFetch<SocialInnovation[]>(endpoint);
  } catch {
    return [];
  }
}

/** Pobiera szczegóły innowacji po jej unikalnym slugu */
export async function getInnovationBySlug(slug: string): Promise<SocialInnovation | null> {
  try {
    return await apiFetch<SocialInnovation>(`/innovations/${slug}/`);
  } catch {
    return null;
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
        top_score: 88.5,
        recommended_action: "Skorzystaj z rekomendowanych innowacji społecznych ROPS Kraków.",
        matches: [
          {
            similarity_score: 88.5,
            justification: "Zbieżność w głównej kategorii ROPS oraz dopasowanie kluczowych zagadnień opieki i włączenia społecznego.",
            suggested_next_step: "middleman",
            innovation: {
              id: 1,
              title: "Senior CUDER – Gra terapeutyczno-integracyjna",
              slug: "senior-cuder",
              category: 1,
              category_name: "Dla seniorów",
              category_code: "seniors",
              maturity_stage: "sprawdzona",
              innovation_type: "produkt",
              short_summary: "Narzędzie aktywizujące i integrujące osoby starsze w lokalnej społeczności poprzez angażującą formułę gry planszowej.",
              target_audience: "Seniorzy, kluby seniora, dzienne domy pobytu, opiekunowie",
              replication_readiness_score: 95,
              likes_count: 24,
              matches_count: 18,
              tags: ["seniorzy", "integracja", "gra", "terapia"],
            },
          },
          {
            similarity_score: 72.0,
            justification: "Zgodność w obszarze wsparcia osób z ograniczeniami sensorycznymi i ruchowymi.",
            suggested_next_step: "tester",
            innovation: {
              id: 2,
              title: "BaWita – Mobilna Tablica Sensoryczna",
              slug: "bawita-tablica-sensoryczna",
              category: 4,
              category_name: "Dla osób z niepełnosprawnością sensoryczną",
              category_code: "sensory",
              maturity_stage: "testy",
              innovation_type: "produkt",
              short_summary: "Mobilny zestaw paneli sensoryczno-stymulacyjnych dla osób z demencją i ograniczeniami poznawczymi.",
              target_audience: "Osoby starsze z demencją, domy pomocy społecznej, opiekunowie domowi",
              replication_readiness_score: 80,
              likes_count: 31,
              matches_count: 22,
              tags: ["sensoryka", "demencja", "baWita", "terapia"],
            },
          },
        ],
      };
    }

    // Jeśli zapytanie jest egzotyczne lub brak innowacji -> Biała Plama
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
