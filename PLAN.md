# Plan realizacji wyzwania: Małopolski Hub Innowacji Społecznych (Splot)

> **Projekt:** Splot – cyfrowe serce Małopolskiego Hubu Innowacji Społecznych (ROPS Kraków)  
> **Konkurs:** HackYeah 2026 (Wyzwanie ROPS Kraków)  
> **Cel:** Zbudowanie działającego, dostępnego cyfrowo (WCAG 2.2 AA) prototypu MVP łączącego potrzeby społeczne z rozwiązaniami i innowacjami ROPS, w pełni pokrywającego moduł obligatoryjny i 6 modułów dodatkowych (40% punktacji) oraz kryteria wdrożeniowe, dostępnościowe i UX (60% punktacji).

---

## 1. Architektura grup docelowych i Szybkich Profili (Person Demo)

Aby pogodzić **błyskawiczną prezentację bez wpisywania haseł** z **brakiem konieczności mozolnego wpisywania danych kontaktowych i adresowych** w każdym formularzu, platforma wdraża koncepcję **Szybkich Profili Demonstracyjnych (Person)** zintegrowanych w nagłówku:

| Persona demonstracyjna | Grupa docelowa | Domyślne dane autofill w formularzach | Kluczowe ścieżki w demo |
|---|---|---|---|
| **Anna Nowak** | Mieszkaniec | Powiat: *nowosądecki*, Gmina: *Grybów*, Tel: *501 234 567*, Email: *anna.nowak@przyklad.pl* | Zgłoszenie problemu (Matchmaking), Udział w testach innowacji |
| **Marek Wiśniewski** | JST (Samorząd) | Instytucja: *Centrum Usług Społecznych w Myślenicach*, Powiat: *myślenicki*, Email: *cus@myslenice.pl* | Diagnoza potrzeb gminy, Middleman AI (adaptacja innowacji na usługę) |
| **Katarzyna Zielińska** | NGO | Organizacja: *Fundacja Aktywna Małopolska (Tarnów)*, KRS: *0000123456*, NIP: *9930012345*, Email: *kontakt@aktywna-malopolska.pl* | Kreator Pomysłów (Fiszka + Wniosek grantowy FERS), Poszukiwanie partnera JST |
| **dr Piotr Adamski** | Ekspert branżowy | Specjalizacja: *Polityka senioralna i deinstytucjonalizacja (Kraków)*, Email: *ekspert@innowacjespoleczne.pl* | Mentoring, Opiniowanie innowacji, Ewaluacja w Testerze |
| **Magdalena Kaczmarczyk** | ROPS Kraków (Admin) | Rola: *Koordynator Małopolskiego Hubu Innowacji Społecznych*, Email: *rops@rops.krakow.pl* | Panel moderacji, Analiza trendów regionalnych, Publikacja w Bibliotece |
| *Gość / Anonim* | Niezalogowany | Pola puste – możliwość wpisania dowolnych danych z ręki | Testowanie ścieżki zewnętrznego mieszkańca |

---

## 2. Podział na etapy i zadania wdrożeniowe

### Faza 1: Architektura danych, Persony i Design System (Fundamenty)
- [ ] **1.1. Model danych Django (`backend/api/models.py`)**:
  - `InnovationCategory`: 9 oficjalnych kategorii ROPS Kraków (*Dla seniorów*, *Dla dzieci, młodzieży i rodziny*, *Dla osób o ograniczonej mobilności*, *Dla osób z niepełnosprawnością sensoryczną*, *Dla zdrowia i medycyny*, *Dla rynku pracy*, *Dla cudzoziemców*, *Dla osób w kryzysie bezdomności*, *Dla osób z niepełnosprawnością intelektualną*).
  - `ReporterType`: *Mieszkaniec*, *Organizacja pozarządowa (NGO)*, *Jednostka Samorządu Terytorialnego (JST)*, *Ekspert branżowy*.
  - `SocialInnovation`: Karta innowacji (tytuł, kategoria, opis, etapy: koncepcja/prototyp/testy/gotowa, wideo demo + transkrypcja WCAG, podręcznik PDF, autor).
  - `ProblemSubmission` & `ProblemMatch`: Zgłoszenie potrzeby z powiązaną personą/kontaktem, powiatem i gminą Małopolski, kategoriami i wyliczonym `similarity_score`.
  - `RegionalChallenge`: Wyzwania Małopolski (depopulacja, starzenie, samotność, zdrowie psychiczne) z danymi powiatowymi.
- [ ] **1.2. Ziarno danych demonstracyjnych (Seed data Małopolski)**:
  - Komenda `python manage.py seed_demo_data` zasilająca bazę autentycznymi innowacjami ROPS Kraków (*BaWita*, *Senior CUDER*, *Merkury*, *Modularne łazienki*, *Organizator opieki* itp.) z realnymi filmami YouTube i folderami PDF.
  - Zestaw wyzwań dla powiatów Małopolski (krakowski, nowosądecki, tarnowski, gorlicki, tatrzański, myślenicki).
  - Predefiniowane konta 5 person demonstracyjnych.
- [ ] **1.3. Rozbudowa Design Systemu i Persona Switcher (frontend)**:
  - Spójne komponenty WCAG 2.2 AA zgodne z `frontend/docs/design-system.md`: `AppShell`, `Header`, `BottomNavigation`, `PersonaSwitcher`, `NeedCard`, `SolutionCard`, `StatusBadge`, `Field`, `TextInput`, `Select`.
  - Kontekst React `usePersona()` z persistencją w `localStorage` automatycznie zasilający formularze w całej aplikacji.

---

### Faza 2: Moduł I – Matchmaking Społeczny *(Obligatoryjny, 10% bazy)*
- [ ] **2.1. Formularz zgłoszenia problemu społecznego**:
  - Automatyczne zaczytanie danych zgłaszającego z aktywnej Persony (z możliwością modyfikacji).
  - Wybór kategorii problemu z oficjalnej listy 9 kategorii ROPS Kraków.
  - Wybór powiatu i gminy Małopolski.
  - Szczegółowy opis sytuacji, grupy dotkniętej problemem i szacowanej skali.
- [ ] **2.2. Inteligentny silnik kojarzenia (Matching Engine)**:
  - Endpoint API `POST /api/matchmaking/analyze/` wyszukujący powiązane innowacje z bazy oraz podobne zgłoszone przypadki.
  - Dwuwarstwowy algorytm: scoring słowno-kategorialny (gwarancja 100% działania offline) + opcjonalne wzbogacenie semantyczne/AI wyjaśniające dopasowanie.
  - Wyliczanie wskaźnika trafności dopasowania (Match Score %) oraz generowanie uzasadnienia (*„Dlaczego ta innowacja pasuje”*).
- [ ] **2.3. Prezentacja wyników i akcje następcze**:
  - Prezentacja kart pasujących innowacji (`SolutionCard`) z akcjami:
    - Jeśli rozwiązanie istnieje: *„Wdróż w swojej gminie (przejdź do Middlemana AI)”* lub *„Zgłoś się do testów (Tester innowacji)”*.
    - Jeśli rozwiązanie nie istnieje (luka w innowacjach): informacja o zarejestrowaniu luki w bazie wyzwań ROPS z przyciskiem *„Przekształć w pomysł w Kreatorze”* przenoszącym do Kreatora z pre-filled danymi.

---

### Faza 3: Moduł II – Zasobnik Wiedzy i Trendy (+5%)
- [ ] **3.1. Biblioteka Innowacji Społecznych ROPS (`/innowacje`)**:
  - Katalog innowacji z filtrami według 9 oficjalnych kategorii ROPS, stopnia dojrzałości i formy (usługa, produkt, metoda).
  - Karta innowacji: opis, instrukcja wdrożenia, wideo z transkrypcją tekstową WCAG, metryka, materiały do pobrania.
- [ ] **3.2. Kondycja Małopolski & Mapa Wyzwań (`/wyzwania`)**:
  - Prezentacja kluczowych wyzwań regionu na bazie raportów ROPS.
  - Dostępna, klawiaturowo sterowana mapa/lista powiatów Małopolski z powiązanymi innowacjami.
- [ ] **3.3. Moduł analityczny dla administratora (Wykrywanie trendów)**:
  - Endpoint `GET /api/admin/trends/` dynamicznie agregujący zgłoszone potrzeby wg powiatów i 9 kategorii.
  - Wykrywanie „Białych plam” (luki w innowacjach) jako baza pod nowe nabory grantowe.

---

### Faza 4: Moduł III – Kreator Pomysłów + Generator Wniosków FERS + Asystent AI (+5%)
- [ ] **4.1. Architektura dwupoziomowa zgłoszeń**:
  - **Poziom A: Fiszka Pomysłu (całoroczna, lekka)**: 3-minutowe zgłoszenie koncepcji innowacji przez mieszkańca/NGO (Tytuł, Autor, Istota pomysłu, Odbiorcy, Etap, Zapotrzebowanie na wsparcie/partnera).
  - **Poziom B: Generator Wniosków Grantowych (Inkubator Włączenia Społecznego 2.0 / FERS Działanie 5.1)**: Pełny, interaktywny wieloetapowy kreator (Wizard) oparty w 100% o oficjalny 12-punktowy wzór ROPS Kraków.
- [ ] **4.2. Implementacja 12 sekcji oficjalnego Formularza ROPS**:
  - **Pkt 1: Tytuł innowacji**: Krótki, zwięzły tytuł powiązany z przedmiotem innowacji.
  - **Pkt 2: Dane pomysłodawcy (dynamiczne gałęzie + autofill z Persony)**:
    - *Osoba fizyczna* (Imię, Nazwisko, Adres, Kod, Miejscowość, Telefon, E-mail) – persona *Anna Nowak*.
    - *Podmiot* (Nazwa, KRS, REGON, NIP, Adres siedziby, Reprezentant formalny, Osoba do kontaktów roboczych) – persona *Katarzyna Zielińska (Fundacja)*.
    - *Grupa nieformalna* (Partnerzy 1-5 jako osoby/podmioty + Reprezentant grupy).
  - **Pkt 3: Opis innowacji**: Charakter (produkt, aplikacja, model pracy, rozwiązanie technologiczne), realizacja celu włączenia społecznego i wpisanie się w ideę **deinstytucjonalizacji**.
  - **Pkt 4: Innowacyjność rozwiązania**: Porównanie z rozwiązaniami w Polsce i na świecie, unikalna nowa wartość i wyróżniki.
  - **Pkt 5: Diagnoza problemu & Mapa Wyzwań ROPS**: Dane statystyczne, podstawa diagnozy (raporty) i jawne powiązanie z tematem z **Mapy Wyzwań Społecznych Małopolski**.
  - **Pkt 6: Opis odbiorców**: Profil grupy, potrzeby, przyczyny wykluczenia / zagrożenia wykluczeniem.
  - **Pkt 7: Zmiana wprowadzana przez innowację**: Wpływ na odbiorców, proces włączenia społecznego.
  - **Pkt 8: Wizja przyszłości i skalowalność**: Potencjał wdrożenia na dużą skalę, replikowalność w innych gminach/miejscach, łatwość stosowania.
  - **Pkt 9: Plan działania i koszty (harmonogram i budżet)**:
    - *Okres przygotowawczy (maks. 3 miesiące)*: Działanie, Termin, Koszt.
    - *Okres testowania (maks. 9 miesięcy, Faza I i II)*: Działanie, Termin, Koszt, planowana liczba testerów.
  - **Pkt 10: Wnioskowana kwota grantu**: Suma automatycznie wyliczana z tabeli działań okresu przygotowawczego i testowania (wskazówka naboru: limit mikrograntu do 50 000 zł).
  - **Pkt 11: Zespół projektowy i doświadczenie**: Kluczowe osoby, kompetencje i dotychczasowe wdrożenia.
  - **Pkt 12: Oświadczenia formalne**: Checkboxy zgodności z regulaminem naboru FERS / ROPS.
  - **Eksport i wydruk**: Funkcja pobrania wygenerowanego oficjalnego formularza w PDF / do druku.
- [ ] **4.3. Inteligentny Asystent Kreatora Innowacji (AI)**:
  - *Wsparcie w Pkt 3 i 4*: Generowanie sugestii wyróżników innowacji i wpisania w deinstytucjonalizację.
  - *Wsparcie w Pkt 5*: Automatyczne podpowiadanie danych statystycznych i cytatów z regionalnych raportów ROPS dla wskazanego powiatu.
  - *Wsparcie w Pkt 8*: Propozycje modeli replikacji innowacji w innych gminach Małopolski.
  - *Wsparcie w Pkt 9*: Generator propozycji etapów testowania i szablonu kosztorysu.
  - *Wizualizacja*: Generowanie schematu koncepcji (Mermaid / widok blokowy).

---

### Faza 5: Moduł IV – Tester Innowacji (+5%)
- [ ] **5.1. Baza innowacji w fazie pilotażu (`/testy`)**:
  - Dwa predefiniowane aktywne pilotaże w danych demonstracyjnych:
    - *BaWita – tablica sensoryczna*: pilotaż z zebranymi opiniami (3 wypełnione ankiety ewaluacyjne z ocenami i barierami).
    - *Merkury – symulator samoobsługowy*: aktywny otwarty nabór na kolejnych testerów (licznik miejsc, kryteria kwalifikacji).
- [ ] **5.2. Formularz zgłoszenia testera**:
  - Szybka deklaracja udziału z wyborem roli: *Mieszkaniec / Użytkownik końcowy*, *Opiekun*, *Pracownik instytucji (CUS/DPS/OPS)*, *Przedstawiciel NGO*, *Ekspert branżowy*.
  - Autofill danych z aktywnej Persony (imię, tel, email, powiat/gmina).
  - Pole opisujące środowisko testowe.
- [ ] **5.3. Moduł zbierania ustrukturyzowanego feedbacku i ocen**:
  - Oceny punktowe 1-5 (użyteczność, skuteczność, dostępność cyfrowa/architektoniczna) z opisami tekstowymi WCAG.
  - Jakościowe pola: *Napotkane bariery i trudności*, *Proponowane usprawnienia*.
  - Wskaźnik rekomendacji skalowania do innych gmin Małopolski.
  - Dostępne zarówno dla zakwalifikowanych testerów (np. *Anna Nowak*), jak i niezależnych ekspertów branżowych (*dr Piotr Adamski*).
- [ ] **5.4. Podsumowanie wyników testów dla ROPS i twórcy**:
  - Zagregowany raport z pilotażu (średnia ocen, lista uwag i usprawnień) jako podstawa do awansu innowacji na status *„Sprawdzona / Gotowa do skalowania”*.

---

### Faza 6: Moduł V – Platforma Aktywnej Komunikacji (+5%)
- [ ] **6.1. Panel dialogu i pytań do ROPS Kraków & mentorów (`/kontakt`)**:
  - Bezpośrednia komunikacja użytkowników z koordynatorami ROPS (szybkie pytania o nabory, procedury) oraz ekspertami branżowymi (*dr Piotr Adamski*).
  - Możliwość oznaczania odpowiedzi przez koordynatora jako publiczne FAQ w bazie wiedzy.
- [ ] **6.2. Tablica partnerstw międzysektorowych („Giełda Współpracy”)**:
  - Kojarzenie samorządów (JST/CUS) z organizacjami pozarządowymi (NGO) i podmiotami ekonomii społecznej.
  - Filtrowanie po powiecie Małopolski, 9 kategoriach ROPS i typie poszukiwanego partnera.
  - Szybka interakcja: przycisk *„Odpowiedz na ogłoszenie / Nawiąż kontakt”*.
- [ ] **6.3. System powiadomień w interfejsie użytkownika**:
  - Dyskretny dzwonek powiadomień w nagłówku z badge informującym o nowych odpowiedziach od ROPS/eksperta (natychmiastowy dowód na działanie dwustronnej komunikacji).
- [ ] **6.4. Ziarno demonstracyjne wątków (Seed data)**:
  - 1 zapytanie mieszkańca z odpowiedzią ROPS (oznaczone do FAQ),
  - 1 zapytanie innowatora z odpowiedzią mentora eksperckiego,
  - 1 aktywne ogłoszenie partnerstwa (*CUS Myślenice szuka NGO do usług senioralnych*) z opcją interakcji na żywo.

---

### Faza 7: Moduł VII – Middleman Innowacji (Asystent AI dla JST) (+5%)
- [ ] **7.1. Konfigurator uwarunkowań gminy (`/middleman`)**:
  - Dedykowany moduł dla samorządów (JST, CUS, OPS, wójtowie/burmistrzowie): wybór innowacji z Biblioteki ROPS (np. *BaWita* lub *Organizator opieki*).
  - Parametry lokalne: typ gminy (wiejska, miejsko-wiejska, miejska), populacja, obecność CUS, model realizacji (kadra własna vs zlecenie zadania do NGO/PES).
  - Gotowy profil demonstracyjny: *Centrum Usług Społecznych w Myślenicach* (1 kliknięcie autofill).
- [ ] **7.2. Silnik Middleman AI (Generowanie Pakietu Wdrożeniowego Usługi)**:
  - Automatyczne wygenerowanie standardu usługi społecznej dla gminy (cele, wymiar godzinowy, kryteria kwalifikacji odbiorców).
  - Wymogi kadrowe (liczba etatów/zleceń, profil kompetencyjny).
  - Kalkulacja rocznych kosztów oraz montaż finansowy z programów ROPS, FERS i PFRON.
  - Harmonogram wdrożenia (Roadmapa 3-6 miesięcy).
  - Bezpośrednia synergetyczna akcja: przycisk *„Zleć usługę lokalnemu NGO na Tablicy Partnerstw (Moduł V)”*.
  - Eksport kompletnego pakietu wdrożeniowego do dokumentu PDF dla wójta / Rady Gminy.
- [ ] **7.3. Ziarno demonstracyjne (Seed data)**:
  - Gotowy, przykładowy plan wdrożenia innowacji dla CUS Myślenice dostępny od ręki do prezentacji przed jury.

---

### Faza 8: Moduł VI – Panel Administratora ROPS Kraków (+5%)
- [ ] **8.1. Kokpit Koordynatora Hubu (`/admin`)**:
  - Persona: *Magdalena Kaczmarczyk – Koordynator Małopolskiego Hubu Innowacji Społecznych*.
  - Kafelki KPI w czasie rzeczywistym: liczba zgłoszonych problemów, nowe wnioski grantowe do oceny, aktywne pilotaże, zapytania w toku.
- [ ] **8.2. Moderacja potrzeb i wykrywanie „Białych plam”**:
  - Tabela zgłoszeń z Modułu I (Matchmaking): zatwierdzanie dopasowań do innowacji lub oznaczanie jako luka społeczna.
- [ ] **8.3. Weryfikacja i ocena Wniosków Grantowych FERS (z Modułu III)**:
  - Formularz oceny formalnej i merytorycznej z kryteriami ROPS (deinstytucjonalizacja, budżet do 50k, terminy 3+9 m-cy).
  - Możliwość zmiany statusu na *„Zaakceptowany do inkubacji”* na żywo podczas prezentacji przed jury.
- [ ] **8.4. Zarządzanie Biblioteką i awans innowacji (z Modułu IV)**:
  - Przegląd raportów ewaluacyjnych z testów.
  - Zmiana statusu innowacji z *„Prototyp w fazie testów”* na *„Sprawdzona / Gotowa do skalowania”* (natychmiastowa dostępność w Middlemanie AI).
- [ ] **8.5. Moduł analityczny trendów regionalnych**:
  - Heatmapa/wykresy zgłoszeń według powiatów Małopolski i 9 kategorii ROPS.
  - Generowanie oficjalnego raportu: przycisk *„Pobierz Raport Trendów dla Województwa Małopolskiego (PDF / Drukuj)”*.
- [ ] **8.6. Ziarno danych demonstracyjnych (Seed data)**:
  - 2 zgłoszenia problemów (1 dopasowane, 1 luka),
  - 1 wniosek grantowy oczekujący na zatwierdzenie na żywo,
  - 1 kandydat na testera gotowy do akceptacji.

---

### Faza 9: Weryfikacja techniczna, WCAG 2.2 AA i optymalizacja implementacji
- [ ] **9.1. Pełny audyt i testy dostępności WCAG 2.2 AA w kodzie**:
  - Weryfikacja nawigacji pełną klawiaturą (Tab, Shift+Tab, Enter, Space, Escape) we wszystkich formularzach, modalach i listach.
  - Testy wszystkich motywów: domyślny, ciemny, hc-black-white, hc-black-yellow, grayscale.
  - Sprawdzenie target size min. 44x44 CSS px dla wszystkich głównych kontrolek.
  - Weryfikacja skalowania tekstu do 200% bez utraty zawartości i bez niepożądanego poziomego scrolla.
  - Sprawdzenie kompatybilności z czytnikami ekranu (aria-label, role, aria-live).
- [ ] **9.2. Kompleksowe testy integracyjne i API**:
  - Testy endpointów Django (Matchmaking, Innowacje, Wnioski grantowe, Pilotaże, Komunikacja, Middleman AI, Trendy).
  - Weryfikacja płynnej wymiany danych między frontendem Next.js a backendem Django.
  - Testy scenariuszy person demonstracyjnych z automatycznym autofill formularzy.
- [ ] **9.3. Optymalizacja wydajnościowa i PWA**:
  - Obsługa trybu offline / fallbacku przy braku połączenia z zewnętrznym AI.
  - Optymalizacja ładowania i responsywności mobilnej.

---

## 3. Kolejność realizacji (Roadmapa wykonania)

| Krok | Zakres | Kluczowe pliki | Rezultat |
|---|---|---|---|
| **Krok 1** | Backend: modele Django, migracje, skrypt seed data z danymi ROPS | `backend/api/models.py`, `backend/api/management/commands/seed_demo_data.py` | Działające API z pełnym zestawem danych testowych Małopolski i person |
| **Krok 2** | Frontend: nawigacja, AppShell, PersonaSwitcher, komponenty Design Systemu | `frontend/components/AppShell.tsx`, `frontend/components/PersonaSwitcher.tsx` | Działający szkielet PWA zintegrowany z systemem dostępności i autofill |
| **Krok 3** | **Moduł I: Matchmaking Społeczny (Obligatoryjny)** | `frontend/app/matchmaking/`, `backend/api/views.py` | Działające kojarzenie potrzeb z innowacjami (MVP Core) |
| **Krok 4** | Moduł II: Biblioteka Innowacji ROPS & Mapa Wyzwań | `frontend/app/innowacje/`, `frontend/app/wyzwania/` | Przegląd wiedzy, raporty, multimedia |
| **Krok 5** | Moduł III: Kreator Pomysłów + Generator Wniosków FERS (12 pkt) | `frontend/app/kreator/` | Składanie fiszek, generator wniosków 12 pkt, asysta AI, eksport PDF |
| **Krok 6** | Moduł VII: Middleman Innowacji dla JST | `frontend/app/middleman/` | Generator pakietu wdrożeniowego usługi dla gmin, eksport PDF |
| **Krok 7** | Moduł IV & V: Tester Innowacji + Komunikacja | `frontend/app/testy/`, `frontend/app/kontakt/` | Rekrutacja testerów, ankieta ewaluacji, tablica partnerstw |
| **Krok 8** | Moduł VI: Panel Administratora ROPS Kraków | `frontend/app/admin/` | Moderacja zgłoszeń, akceptacja wniosków, raport trendów |
| **Krok 9** | Weryfikacja techniczna i audyt WCAG 2.2 AA | Cały projekt | Zweryfikowany prototyp produkcyjny gotowy do demonstracji |
