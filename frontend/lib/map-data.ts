import type { MapMarker, MapPosition } from "@/components/ui/Map";

export const DEFAULT_MAP_CENTER: MapPosition = { lat: 49.95, lng: 20.05 };
export const DEFAULT_MAP_ZOOM = 8.8;

export const mapMarkers: MapMarker[] = [
  // --- 1. CENTRA USŁUG SPOŁECZNYCH (CUS) - Jednostki samorządowe Małopolski ---
  {
    id: "cus-tarnow",
    title: "Centrum Usług Społecznych w Tarnowie",
    description:
      "ul. Kazimierza Brodzińskiego 14, 33-100 Tarnów. Koordynacja usług społecznych dla mieszkańców, wsparcie rodzin, teleopieka dla seniorów i wypożyczalnia sprzętu rehabilitacyjnego.",
    categories: ["CUS", "Usługi społeczne", "Tarnów"],
    position: { lat: 50.0125, lng: 20.9858 },
    tone: "success",
    type: "partner",
  },
  {
    id: "cus-myslenice",
    title: "Centrum Usług Społecznych w Myślenicach",
    description:
      "ul. Słowackiego 82, 32-400 Myślenice. Regionalny lider CUS: organizatorzy społeczności lokalnej (OSL), mobilna opieka wytchnieniowa, kluby rodzica i asystenci osób z niepełnosprawnością.",
    categories: ["CUS", "Wsparcie rodzin", "Myślenice"],
    position: { lat: 49.8335, lng: 19.9442 },
    tone: "success",
    type: "partner",
  },
  {
    id: "cus-wieliczka",
    title: "Centrum Usług Społecznych w Wieliczce",
    description:
      "ul. Pocztowa 1, 32-020 Wieliczka. Kompleksowe usługi opiekuńcze w środowisku domowym, mobilny asystent seniora, poradnictwo psychologiczne i programy integracji sąsiedzkiej.",
    categories: ["CUS", "Usługi społeczne", "Wieliczka"],
    position: { lat: 49.9871, lng: 20.0594 },
    tone: "success",
    type: "partner",
  },
  {
    id: "cus-skawina",
    title: "Centrum Usług Społecznych w Skawinie",
    description:
      "ul. Żwirki i Wigury 13, 32-050 Skawina. Zintegrowane pakiety usług asystenckich, mobilna rehabilitacja domowa, kluby seniora i wsparcie opieki wytchnieniowej.",
    categories: ["CUS", "Dostępność", "Skawina"],
    position: { lat: 49.9749, lng: 19.8277 },
    tone: "success",
    type: "partner",
  },
  {
    id: "cus-oswiecim",
    title: "Centrum Usług Społecznych w Oświęcimiu",
    description:
      "ul. Jana III Sobieskiego 15B, 32-600 Oświęcim. Koordynacja usług opiekuńczych i specjalistycznych, doradztwo rodzinne, punkt informacyjny w CAL przy ul. Olszewskiego 34.",
    categories: ["CUS", "Usługi opiekuńcze", "Oświęcim"],
    position: { lat: 50.0357, lng: 19.2312 },
    tone: "success",
    type: "partner",
  },
  {
    id: "cus-alwernia",
    title: "Centrum Usług Społecznych w Alwerni",
    description:
      "ul. Gęsikowskiego 7, 32-566 Alwernia. Zintegrowane usługi dla mieszkańców gminy miejsko-wiejskiej: mobilna pomoc opiekuńcza, warsztaty aktywizujące i doradztwo prawne.",
    categories: ["CUS", "Aktywizacja", "Powiat chrzanowski"],
    position: { lat: 50.0601, lng: 19.5392 },
    tone: "success",
    type: "partner",
  },
  {
    id: "cus-klucze",
    title: "Centrum Usług Społecznych w Kluczach",
    description:
      "ul. Zawierciańska 16, 32-310 Klucze. Szeroki wachlarz usług opiekuńczych i prozdrowotnych na terenie Jury Krakowsko-Częstochowskiej oraz aktywności w Dworku Dietla.",
    categories: ["CUS", "Seniorzy", "Powiat olkuski"],
    position: { lat: 50.334, lng: 19.5621 },
    tone: "success",
    type: "partner",
  },
  {
    id: "cus-niepolomice",
    title: "Centrum Usług Społecznych w Niepołomicach",
    description:
      "ul. Bocheńska 26 (budynek Bocheńska Centrum), 32-005 Niepołomice. Usługi środowiskowe, wsparcie pedagogiczno-psychologiczne, kluby aktywności i pomoc senioralna.",
    categories: ["CUS", "Rodzina", "Niepołomice"],
    position: { lat: 50.0336, lng: 20.2185 },
    tone: "success",
    type: "partner",
  },
  {
    id: "cus-stary-sacz",
    title: "Centrum Usług Społecznych w Starym Sączu",
    description:
      "ul. 11 Listopada 11, 33-340 Stary Sącz. Wsparcie seniorów na terenach podgórskich, transport społeczny (door-to-door) i asystencja dla osób niesamodzielnych.",
    categories: ["CUS", "Usługi społeczne", "Sądecczyzna"],
    position: { lat: 49.5639, lng: 20.6358 },
    tone: "success",
    type: "partner",
  },
  {
    id: "cus-dobczyce",
    title: "Centrum Usług Społecznych w Dobczycach",
    description:
      "Rynek 26, 32-410 Dobczyce. Rozwój usług środowiskowych, animacja społeczności lokalnej wokół Jeziora Dobczyckiego i wsparcie opiekunów nieformalnych.",
    categories: ["CUS", "Integracja", "Dobczyce"],
    position: { lat: 49.8781, lng: 20.0913 },
    tone: "success",
    type: "partner",
  },
  {
    id: "cus-grybow",
    title: "Centrum Usług Społecznych w Grybowie",
    description:
      "ul. Jakubowskiego 33, 33-330 Grybów. Usługi opiekuńcze w miejscu zamieszkania, wsparcie rodzin wielodzietnych i przeciwdziałanie wykluczeniu transportowemu.",
    categories: ["CUS", "Opieka", "Grybów"],
    position: { lat: 49.6247, lng: 20.9486 },
    tone: "success",
    type: "partner",
  },

  // --- 2. ORGANIZACJE POZARZĄDOWE, PES I INSTYTUCJE (NGO & Partnerzy) ---
  {
    id: "rops-krakow",
    title: "Regionalny Ośrodek Polityki Społecznej w Krakowie",
    description:
      "ul. Piastowska 32, 30-070 Kraków. Koordynator polityki społecznej Województwa Małopolskiego, operator Małopolskiego Inkubatora Innowacji Społecznych i sieci CUS.",
    categories: ["Innowacje społeczne", "Koordynacja", "Kraków"],
    position: { lat: 50.0632, lng: 19.9048 },
    tone: "success",
    type: "partner",
  },
  {
    id: "farma-zycia-wieckowice",
    title: "Farma Życia – Fundacja Wspólnota Nadziei",
    description:
      "ul. Ogrodowa 17, 32-082 Więckowice (gm. Zabierzów). Ośrodek stałego pobytu, pracy, hortiterapii i rehabilitacji dorosłych osób w spektrum autyzmu w ekologicznym gospodarstwie.",
    categories: ["Autyzm", "Mieszkalnictwo wspomagane", "Zabierzów"],
    position: { lat: 50.1312, lng: 19.742 },
    tone: "success",
    type: "partner",
  },
  {
    id: "fundacja-brata-alberta-radwanowice",
    title: "Fundacja im. Brata Alberta w Radwanowicach",
    description:
      "Radwanowice 1, 32-064 Rudawa. Macierzysta placówka fundacji: schronisko, warsztaty terapii zajęciowej (WTZ) i dom pomocy społecznej dla osób z niepełnosprawnością intelektualną.",
    categories: ["Niepełnosprawność intelektualna", "Rehabilitacja", "Radwanowice"],
    position: { lat: 50.1558, lng: 19.7042 },
    tone: "success",
    type: "partner",
  },
  {
    id: "dzielo-pomocy-ojca-pio",
    title: "Dzieło Pomocy św. Ojca Pio – Centrum Pomocy",
    description:
      "ul. Smoleńsk 4 / Loretańska 11, 31-107 Kraków. Kompleksowa pomoc osobom w kryzysie bezdomności: łaźnia, pralnia, konsultacje medyczne, wsparcie socjalne, prawne i mieszkania trenigowe.",
    categories: ["Bezdomność", "Wsparcie doraźne", "Kraków"],
    position: { lat: 50.0602, lng: 19.9304 },
    tone: "success",
    type: "partner",
  },
  {
    id: "bank-zywnosci-krakow",
    title: "Bank Żywności w Krakowie",
    description:
      "ul. Zabłocie 20/22, 30-701 Kraków. Odbiór i redystrybucja pełnowartościowej żywności zagrożonej zmarnowaniem do ponad 150 organizacji partnerskich w Małopolsce.",
    categories: ["Zero waste", "Pomoc żywnościowa", "Kraków"],
    position: { lat: 50.0463, lng: 19.9615 },
    tone: "success",
    type: "partner",
  },
  {
    id: "spoleczna-kaffka",
    title: "Społeczna Kaffka – Przedsiębiorstwo Społeczne 21",
    description:
      "ul. Na Kozłówce 25, 30-664 Kraków. Kawiarnia społeczna prowadzona przy Stowarzyszeniu Rodziców i Przyjaciół Osób z Zespołem Downa „Tęcza”, dająca zatrudnienie dorosłym z zespołem Downa.",
    categories: ["Ekonomia społeczna", "Zespół Downa", "Kraków"],
    position: { lat: 50.0245, lng: 19.988 },
    tone: "success",
    type: "partner",
  },
  {
    id: "kawiarnia-mocna",
    title: "MOCna! Kawiarnia Społeczna",
    description:
      "ul. Rzeczna 11A, 30-021 Kraków. Przedsiębiorstwo społeczne Fundacji MOCna!, integrujące osoby z niepełnosprawnościami na rynku pracy, przestrzeń warsztatów i spotkań sąsiedzkich.",
    categories: ["Ekonomia społeczna", "Włączenie", "Kraków"],
    position: { lat: 50.0768, lng: 19.9351 },
    tone: "success",
    type: "partner",
  },
  {
    id: "spoldzielnia-socjalna-kobierzyn",
    title: "Spółdzielnia Socjalna „Kobierzyn”",
    description:
      "ul. Babińskiego 29, 30-393 Kraków. Laureat konkursu Małopolski Lider Ekonomii Społecznej: tworzenie miejsc pracy i reintegracja zawodowa osób po kryzysach psychicznych.",
    categories: ["Zdrowie psychiczne", "Reintegracja zawodowa", "Kraków"],
    position: { lat: 50.0102, lng: 19.8885 },
    tone: "success",
    type: "partner",
  },
  {
    id: "spoldzielnia-socjalna-ognisko",
    title: "Spółdzielnia Socjalna „Ognisko” – Awokado Lunch Bar",
    description:
      "ul. Prądnicka 40, 31-202 Kraków. Przedsiębiorstwo społeczne zatrudniające osoby z niepełnosprawnościami, promujące zdrową gastronomię i ekonomię solidarną.",
    categories: ["Ekonomia społeczna", "Gastronomia", "Kraków"],
    position: { lat: 50.0821, lng: 19.9318 },
    tone: "success",
    type: "partner",
  },
  {
    id: "jcc-krakow",
    title: "JCC Kraków – Centrum Społeczności Żydowskiej",
    description:
      "ul. Miodowa 24, 31-055 Kraków. Otwarte centrum społeczno-kulturalne na Kazimierzu: klub seniora, wolontariat, programy integracji międzykulturowej i pomoc humanitarna.",
    categories: ["Wielokulturowość", "Seniorzy", "Kraków"],
    position: { lat: 50.0532, lng: 19.947 },
    tone: "success",
    type: "partner",
  },
  {
    id: "cis-olkusz",
    title: "Centrum Integracji Społecznej w Olkuszu (Res Sacra Miser)",
    description:
      "ul. Korczaka 5, 32-300 Olkusz. Warsztaty reintegracji zawodowo-społecznej, doradztwo psychologiczne i kursy kwalifikacyjne dla osób poszukujących zatrudnienia.",
    categories: ["Reintegracja", "Rynek pracy", "Olkusz"],
    position: { lat: 50.2801, lng: 19.5647 },
    tone: "success",
    type: "partner",
  },
  {
    id: "psoni-nowy-sacz",
    title: "PSONI Koło w Nowym Sączu – WTZ i ZAZ",
    description:
      "ul. Tarnowska 102, 33-300 Nowy Sącz. Polskie Stowarzyszenie na rzecz Osób z Niepełnosprawnością Intelektualną: warsztaty terapii zajęciowej, rehabilitacja i zakład aktywności zawodowej.",
    categories: ["Niepełnosprawność", "ZAZ", "Nowy Sącz"],
    position: { lat: 49.6264, lng: 20.6975 },
    tone: "success",
    type: "partner",
  },
  {
    id: "gorlickie-centrum-wolontariatu",
    title: "Gorlickie Centrum Wolontariatu i Integracji Społecznej",
    description:
      "ul. Jagiełły 6, 38-300 Gorlice. Koordynacja wolontariatu opiekuńczego i młodzieżowego, zbiórki sąsiedzkie i wsparcie osób samotnych w Beskidzie Niskim.",
    categories: ["Wolontariat", "Młodzież", "Gorlice"],
    position: { lat: 49.6558, lng: 21.1601 },
    tone: "success",
    type: "partner",
  },
  {
    id: "stowarzyszenie-kolorowy-swiat-bochnia",
    title: "Bocheńskie Stowarzyszenie „Kolorowy Świat”",
    description:
      "ul. Kazimierza Wielkiego 21, 32-700 Bochnia. Ośrodek wczesnego wspomagania rozwoju dzieci z niepełnosprawnościami, poradnictwo dla rodziców i terapia logopedyczna.",
    categories: ["Dzieci", "Rehabilitacja", "Bochnia"],
    position: { lat: 49.9723, lng: 20.4305 },
    tone: "success",
    type: "partner",
  },
  {
    id: "tatrzanski-osrodek-interwencji",
    title: "Tatrzański Ośrodek Interwencji Kryzysowej",
    description:
      "ul. Makuszyńskiego 9, 34-500 Zakopane. Całodobowe wsparcie psychologiczne, bezpieczne schronienie dla osób doświadczających przemocy domowej i kryzysów losowych na Podhalu.",
    categories: ["Interwencja kryzysowa", "Wsparcie doraźne", "Zakopane"],
    position: { lat: 49.2945, lng: 19.9642 },
    tone: "danger",
    type: "partner",
  },
  {
    id: "mowes-chrzanow",
    title: "MOWES Małopolska Zachodnia – Agencja Rozwoju",
    description:
      "ul. Grunwaldzka 5, 32-500 Chrzanów. Ośrodek Wsparcia Ekonomii Społecznej: doradztwo prawne, biznesowe oraz bezzwrotne dotacje na tworzenie miejsc pracy w przedsiębiorstwach społecznych.",
    categories: ["Ekonomia społeczna", "Dotacje PES", "Chrzanów"],
    position: { lat: 50.137, lng: 19.4015 },
    tone: "success",
    type: "partner",
  },

  // --- 3. ROZWIĄZANIA SPOŁECZNE I INNOWACJE (Solutions / ROPS Kraków) ---
  {
    id: "bawita-tablica-sensoryczna",
    title: "BaWita – Mobilna sensoryczna tablica aktywizująca",
    description:
      "Grybów i powiat nowosądecki. Przenośny moduł stymulacji sensorycznej i pamięciowej dla seniorów z chorobami otępiennymi i demencją, wdrożony z ramienia Inkubatora ROPS Kraków.",
    categories: ["Seniorzy", "Terapia sensoryczna", "Grybów"],
    position: { lat: 49.625, lng: 20.95 },
    tone: "info",
    type: "solution",
  },
  {
    id: "senior-cuder-gra-integracyjna",
    title: "Senior CUDER – Gra integracyjno-aktywizująca",
    description:
      "Piwniczna-Zdrój (Klub Seniora Dolina Popradu). Sprawdzona metoda gry integracyjnej przeciwdziałająca samotności i apatii u osób starszych w klubach seniora i sołectwach.",
    categories: ["Seniorzy", "Zdrowie psychiczne", "Piwniczna-Zdrój"],
    position: { lat: 49.4352, lng: 20.7105 },
    tone: "info",
    type: "solution",
  },
  {
    id: "merkury-symulator-samoobslugowy",
    title: "Merkury – Symulator samoobsługowy kas i biletomatów",
    description:
      "Centrum Usług Społecznych w Myślenicach. Dotykowy interaktywny trenażer ułatwiający osobom z niepełnosprawnością intelektualną i w spektrum autyzmu bezstresową naukę obsługi automatów.",
    categories: ["Dostępność cyfrowa", "Edukacja", "Myślenice"],
    position: { lat: 49.834, lng: 19.945 },
    tone: "info",
    type: "solution",
  },
  {
    id: "modularne-lazienki-dostepne",
    title: "Modularne łazienki dostępne – Pakiet adaptacyjny",
    description:
      "Żabno (powiat tarnowski). Zestaw bezinwazyjnego montażu bezpiecznych poręczy, podestów i mat antypoślizgowych likwidujący bariery architektoniczne w wiejskich domach seniorów bez remontu.",
    categories: ["Dostępność architektoniczna", "Seniorzy", "Żabno"],
    position: { lat: 50.1325, lng: 20.8845 },
    tone: "info",
    type: "solution",
  },
  {
    id: "organizator-spolecznosci-lokalnej-skawina",
    title: "Organizator Społeczności Lokalnej (OSL)",
    description:
      "CUS Skawina, ul. Żwirki i Wigury 13. Metoda animacji środowiskowej pobudzająca mieszkańców do oddolnej samopomocy sąsiedzkiej i tworzenia lokalnych grup wsparcia.",
    categories: ["Usługi społeczne", "Samopomoc", "Skawina"],
    position: { lat: 49.975, lng: 19.828 },
    tone: "info",
    type: "solution",
  },
  {
    id: "straznik-asystent-dzwiekowy",
    title: "Strażnik – Osobisty asystent dźwiękowy dla niesłyszących",
    description:
      "Kraków (kampus AGH). Inteligentna opaska wibracyjna i aplikacja mobilna analizująca dźwięki otoczenia (alarm pożarowy, dzwonek, klakson) dla osób niesłyszących i słabosłyszących.",
    categories: ["Nowe technologie", "Sensoryka", "Kraków"],
    position: { lat: 50.0665, lng: 19.918 },
    tone: "info",
    type: "solution",
  },
  {
    id: "gluchy-czytelnik-wieliczka",
    title: "Głuchy czytelnik w bibliotece – Stanowisko PJM",
    description:
      "Mediateka Wieliczka, pl. Miejski 6. Stanowisko z wideotłumaczem Polskiego Języka Migowego online oraz tyflomapami ułatwiające osobom z niepełnosprawnościami zmysłów korzystanie z kultury.",
    categories: ["Dostępność kultury", "PJM", "Wieliczka"],
    position: { lat: 49.9882, lng: 20.062 },
    tone: "info",
    type: "solution",
  },
  {
    id: "bez-presji-z-depresji",
    title: "Bez presji z depresji – Mobilna poradnia młodzieżowa",
    description:
      "Kraków Krowodrza. Mobilny punkt konsultacyjny wspierający młodzież w kryzysach emocjonalnych, depresji i stanach lękowych z bezpłatnym dostępem do psychoterapeuty.",
    categories: ["Zdrowie psychiczne", "Młodzież", "Kraków"],
    position: { lat: 50.0782, lng: 19.9195 },
    tone: "danger",
    type: "solution",
  },
  {
    id: "szlakiem-ludzi-bezdomnych",
    title: "Szlakiem ludzi bezdomnych – Mobilny punkt wsparcia",
    description:
      "Kraków Śródmieście (rejon Dworca Głównego i Plant). Specjalistyczny ambulans streetworkerski oferujący doraźny opatrunek pielęgniarski, ciepły napój, odzież i motywację do wyjścia z bezdomności.",
    categories: ["Bezdomność", "Pomoc doraźna", "Kraków"],
    position: { lat: 50.061, lng: 19.932 },
    tone: "danger",
    type: "solution",
  },

  // --- 4. WYDARZENIA SPOŁECZNE I MIEJSCA AKTYWNOŚCI (Events) ---
  {
    id: "mam-kety-rynek-13",
    title: "Miejsce Aktywności Mieszkańców „Rynek 13” w Kętach",
    description:
      "Rynek 13, 32-650 Kęty. Otwarte centrum społecznościowe: warsztaty rękodzielnicze, kawiarenka sąsiedzka, dyżury organizacji pozarządowych i Mediateka.",
    categories: ["MAM", "Warsztaty", "Kęty"],
    position: { lat: 49.8824, lng: 19.2201 },
    tone: "warning",
    type: "event",
  },
  {
    id: "mam-chrzanow",
    title: "Miejsce Aktywności Mieszkańców w Chrzanowie",
    description:
      "ul. Sokoła 24, 32-500 Chrzanów. Przestrzeń inicjatyw obywatelskich: warsztaty wymiany wiedzy, pikniki sąsiedzkie, grupy wsparcia i spotkania samopomocowe.",
    categories: ["MAM", "Sąsiedztwo", "Chrzanów"],
    position: { lat: 50.1388, lng: 19.4042 },
    tone: "warning",
    type: "event",
  },
  {
    id: "kawiarenka-naprawcza-tarnow",
    title: "Kawiarenka Naprawcza – Warsztaty majsterkowania w Tarnowie",
    description:
      "ul. Brodzińskiego 14, 33-100 Tarnów. Sobotnie otwarte spotkania międzypokoleniowe: seniorzy-złote rączki uczą młodzież naprawy sprzętu, rowerów i zabawek w duchu Zero Waste.",
    categories: ["Ekologia", "Międzypokoleniowe", "Tarnów"],
    position: { lat: 50.013, lng: 20.9865 },
    tone: "warning",
    type: "event",
  },
  {
    id: "cyfrowy-klub-seniora-nowy-targ",
    title: "Cyfrowy Klub Seniora w Nowym Targu",
    description:
      "al. Tysiąclecia 35, 34-400 Nowy Targ. Bezpłatne cotygodniowe warsztaty obsługi smartfonów, poczty e-mail, aplikacji mObywatel i bezpiecznych zakupów w internecie.",
    categories: ["Edukacja cyfrowa", "Seniorzy", "Nowy Targ"],
    position: { lat: 49.4819, lng: 20.0321 },
    tone: "warning",
    type: "event",
  },
  {
    id: "cas-mlodzi-duchem-krakow",
    title: "Centrum Aktywności Seniora „Młodzi Duchem”",
    description:
      "ul. Berka Joselewicza 28, 31-031 Kraków. Codzienne zajęcia gimnastyki prozdrowotnej, klub brydżowy, wykłady dietetyczne i międzypokoleniowe wyjścia kulturalne.",
    categories: ["Seniorzy", "Aktywizacja", "Kraków"],
    position: { lat: 50.0553, lng: 19.9485 },
    tone: "warning",
    type: "event",
  },
  {
    id: "senior-plus-zakopane",
    title: "Dzienny Dom Senior+ w Zakopanem",
    description:
      "ul. Szymanowskiego 1, 34-500 Zakopane. Dzienne spotkania aktywizujące, warsztaty regionalnego rękodzieła podhalańskiego, fizjoterapia i integracja społeczna.",
    categories: ["Seniorzy", "Integracja", "Zakopane"],
    position: { lat: 49.2941, lng: 19.9602 },
    tone: "warning",
    type: "event",
  },
  {
    id: "warsztaty-farma-zycia",
    title: "Dni Otwarte i Warsztaty Hortiterapii na Farmie Życia",
    description:
      "ul. Ogrodowa 17, 32-082 Więckowice. Ekologiczne warsztaty ogrodnicze, siew ziół i spotkania integracyjne w plenerze dla rodzin osób w spektrum autyzmu.",
    categories: ["Ekologia", "Hortiterapia", "Zabierzów"],
    position: { lat: 50.1315, lng: 19.7425 },
    tone: "warning",
    type: "event",
  },
  {
    id: "klubokawiarnia-siemacha-tarnow",
    title: "Klubokawiarnia dla Seniorów SIEMACHA w Tarnowie",
    description:
      "ul. XVI Pułku Piechoty 12, 33-100 Tarnów. Integracja międzypokoleniowa: turnieje szachowe, warsztaty artystyczne i kawiarnia prowadzona we współpracy z młodzieżą.",
    categories: ["Międzypokoleniowe", "Kultura", "Tarnów"],
    position: { lat: 50.021, lng: 21.002 },
    tone: "warning",
    type: "event",
  },
  {
    id: "grupa-wsparcia-opiekunow-myslenice",
    title: "Grupa Wsparcia Opiekunów Osób Zależnych w Myślenicach",
    description:
      "ul. Słowackiego 82, 32-400 Myślenice. Cykliczne moderowane spotkania psychologiczne i wymiana doświadczeń dla osób opiekujących się chorymi bliskimi w domu.",
    categories: ["Opiekunowie", "Wsparcie psychologiczne", "Myślenice"],
    position: { lat: 49.8338, lng: 19.9445 },
    tone: "warning",
    type: "event",
  },
];
