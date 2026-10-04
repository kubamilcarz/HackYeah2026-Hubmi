"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type PersonaKey =
  | "anna_nowak"
  | "marek_wisniewski"
  | "katarzyna_zielinska"
  | "piotr_adamski"
  | "magdalena_kaczmarczyk"
  | "anonymous";

export type PersonaProfile = {
  key: PersonaKey;
  name: string;
  initials: string;
  role: string;
  roleBadge: "neutral" | "info" | "success" | "warning";
  roleType: "mieszkaniec" | "ngo" | "jst" | "ekspert" | "admin" | "anonymous";
  organization?: string;
  countySlug?: string;
  countyName?: string;
  municipality?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  krs?: string;
  nip?: string;
  regon?: string;
  representative?: string;
  description: string;
  keyPaths: string;
};

export const DEMO_PERSONAS: Record<PersonaKey, PersonaProfile> = {
  anna_nowak: {
    key: "anna_nowak",
    name: "Anna Nowak",
    initials: "AN",
    role: "Mieszkaniec / Opiekun",
    roleBadge: "info",
    roleType: "mieszkaniec",
    countySlug: "nowosadecki",
    countyName: "nowosądecki",
    municipality: "Grybów",
    email: "anna.nowak@przyklad.pl",
    phone: "501 234 567",
    address: "ul. Ogrodowa 14",
    city: "Grybów",
    postalCode: "33-330",
    description: "Opiekunka osoby starszej poszukująca wsparcia dziennego i opieki wytchnieniowej.",
    keyPaths: "Zgłoszenie problemu, testy innowacji",
  },
  marek_wisniewski: {
    key: "marek_wisniewski",
    name: "Marek Wiśniewski",
    initials: "MW",
    role: "Samorząd (JST)",
    roleBadge: "success",
    roleType: "jst",
    organization: "Centrum Usług Społecznych w Myślenicach",
    countySlug: "myslenicki",
    countyName: "myślenicki",
    municipality: "Myślenice",
    email: "cus@myslenice.pl",
    phone: "12 272 56 00",
    address: "ul. Słowackiego 82",
    city: "Myślenice",
    postalCode: "32-400",
    description: "Dyrektor CUS wdrażający innowacje społeczne jako usługi gminne.",
    keyPaths: "Diagnoza gminy, pakiety wdrożeniowe",
  },
  katarzyna_zielinska: {
    key: "katarzyna_zielinska",
    name: "Katarzyna Zielińska",
    initials: "KZ",
    role: "Organizacja (NGO)",
    roleBadge: "warning",
    roleType: "ngo",
    organization: "Fundacja Aktywna Małopolska",
    countySlug: "tarnowski",
    countyName: "tarnowski",
    municipality: "Tarnów",
    email: "kontakt@aktywna-malopolska.pl",
    phone: "14 621 00 00",
    address: "ul. Krakowska 12",
    city: "Tarnów",
    postalCode: "33-100",
    krs: "0000123456",
    nip: "9930012345",
    regon: "123456789",
    representative: "Katarzyna Zielińska - Prezes Zarządu",
    description: "Prezeska NGO wnioskująca o mikrogranty FERS w Inkubatorze ROPS.",
    keyPaths: "Kreator pomysłów, wniosek FERS",
  },
  piotr_adamski: {
    key: "piotr_adamski",
    name: "dr Piotr Adamski",
    initials: "PA",
    role: "Ekspert / Mentor",
    roleBadge: "neutral",
    roleType: "ekspert",
    organization: "Ekspert polityki społecznej",
    countySlug: "krakowski",
    countyName: "Kraków",
    municipality: "Kraków",
    email: "ekspert@innowacjespoleczne.pl",
    phone: "601 987 654",
    address: "ul. Wielicka 72",
    city: "Kraków",
    postalCode: "30-552",
    description: "Ekspert deinstytucjonalizacji i mentor zespołów innowacyjnych.",
    keyPaths: "Mentoring, ewaluacja pilotaży",
  },
  magdalena_kaczmarczyk: {
    key: "magdalena_kaczmarczyk",
    name: "Magdalena Kaczmarczyk",
    initials: "MK",
    role: "Koordynator ROPS",
    roleBadge: "info",
    roleType: "admin",
    organization: "ROPS Kraków",
    countySlug: "krakowski",
    countyName: "Kraków",
    municipality: "Kraków",
    email: "rops@rops.krakow.pl",
    phone: "12 422 06 36",
    address: "ul. Piastowska 32",
    city: "Kraków",
    postalCode: "30-070",
    description: "Koordynatorka ROPS Kraków zarządzająca bazą innowacji i zgłoszeniami.",
    keyPaths: "Panel moderacji, trendy regionalne",
  },
  anonymous: {
    key: "anonymous",
    name: "Gość (Niezalogowany)",
    initials: "G",
    role: "Czysty profil",
    roleBadge: "neutral",
    roleType: "anonymous",
    email: "",
    phone: "",
    description: "Czysty profil testowy do samodzielnego wprowadzania danych od zera.",
    keyPaths: "Formularze bez autouzupełniania",
  },
};

export const PERSONA_LIST = Object.values(DEMO_PERSONAS);

type PersonaContextValue = {
  activePersona: PersonaProfile;
  activePersonaKey: PersonaKey;
  closePersonaModal: () => void;
  isPersonaModalOpen: boolean;
  openPersonaModal: () => void;
  personas: PersonaProfile[];
  setActivePersonaKey: (key: PersonaKey) => void;
};

const STORAGE_KEY = "splot_active_persona";
const DEFAULT_KEY: PersonaKey = "anna_nowak";
const CHANGE_EVENT = "splot_persona_change";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): PersonaKey {
  if (typeof window === "undefined") return DEFAULT_KEY;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && stored in DEMO_PERSONAS) {
      return stored as PersonaKey;
    }
  } catch {
    // ignore
  }
  return DEFAULT_KEY;
}

function getServerSnapshot(): PersonaKey {
  return DEFAULT_KEY;
}

const PersonaContext = createContext<PersonaContextValue | null>(null);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const activePersonaKey = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isPersonaModalOpen, setIsModalOpen] = useState(false);

  const setActivePersonaKey = useCallback((key: PersonaKey) => {
    if (key in DEMO_PERSONAS) {
      try {
        window.localStorage.setItem(STORAGE_KEY, key);
        window.dispatchEvent(new Event(CHANGE_EVENT));
      } catch {
        // ignore storage error
      }
    }
  }, []);

  const openPersonaModal = useCallback(() => setIsModalOpen(true), []);
  const closePersonaModal = useCallback(() => setIsModalOpen(false), []);

  const activePersona = useMemo(() => DEMO_PERSONAS[activePersonaKey] ?? DEMO_PERSONAS[DEFAULT_KEY], [activePersonaKey]);

  const value = useMemo<PersonaContextValue>(
    () => ({
      activePersona,
      activePersonaKey,
      closePersonaModal,
      isPersonaModalOpen,
      openPersonaModal,
      personas: PERSONA_LIST,
      setActivePersonaKey,
    }),
    [activePersona, activePersonaKey, closePersonaModal, isPersonaModalOpen, openPersonaModal, setActivePersonaKey]
  );

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
}

export function usePersona(): PersonaContextValue {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error("usePersona must be used within a PersonaProvider");
  }
  return context;
}
