# Splot (Hubmi) – Django REST Framework Backend

Cyfrowe serce Małopolskiego Hubu Innowacji Społecznych (Regionalny Ośrodek Polityki Społecznej w Krakowie – ROPS Kraków).  
Projekt na konkurs **HackYeah 2026** (Wyzwanie ROPS Kraków).

---

## 1. Architektura i Kontekst Projektu

Backend dostarcza kompletne API REST dla platformy **Splot**, wspierając procesy:
- **Moduł I (Obligatoryjny): Matchmaking Społeczny** – dwuwarstwowe kojarzenie zgłaszanych problemów mieszkańców/JST z bazą innowacji ROPS oraz automatyczna detekcja luk społecznych (*„Białe plamy”*).
- **Moduł II: Zasobnik Wiedzy i Trendy** – katalog innowacji z transkrypcjami WCAG 2.2 AA i podręcznikami PDF, baza wyzwań 22 powiatów Małopolski oraz analityka trendów regionalnych.
- **Moduł III: Kreator Pomysłów & Generator Wniosków FERS** – obsługa całorocznych Fiszek Pomysłów oraz oficjalnego 12-punktowego wniosku grantowego Inkubatora Włączenia Społecznego 2.0 (FERS Działanie 5.1) z budżetem do 50 000 zł i procedurą oceny ROPS.
- **Moduł IV: Tester Innowacji** – pilotaże rozwiązań (*BaWita*, *Merkury*), nabór testerów i zbieranie ustrukturyzowanych ankiet ewaluacyjnych (oceny 1-5, bariery, rekomendacja skalowania).
- **Moduł V: Platforma Aktywnej Komunikacji** – bezpośredni dialog z koordynatorem ROPS i mentorami z publikacją do bazy wiedzy (FAQ) oraz Giełda Współpracy międzysektorowej (JST <-> NGO).
- **Moduł VI: Panel Administratora ROPS** – kokpit KPI koordynatora, moderacja potrzeb, ocena wniosków na żywo, raport trendów wojewódzkich.
- **Moduł VII: Middleman Innowacji (AI dla JST)** – generator pakietów wdrożeniowych usług społecznych dla wójtów/burmistrzów i CUS/OPS (standard usługi, etaty, montaż finansowy FERS/PFRON, harmonogram 3-6 m-cy).

---

## 2. Szybki start (Quick Start)

### Środowisko wirtualne i uruchomienie

Backend działa na **Python 3.12** w katalogu `backend/.venv`:

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver 8000
```

Serwer dostępny jest pod adresem: `http://127.0.0.1:8000/`.

### Uruchomienie testów

```bash
cd backend
source .venv/bin/activate
python manage.py test api
```
*(Zestaw zawiera 11 kompleksowych testów weryfikujących wszystkie moduły i schemat OpenAPI w czasie < 0.2s).*

---

## 3. Persony Demonstracyjne (Demo Personas)

System przygotowano pod kątem natychmiastowej demonstracji przed jury z predefiniowanymi rolami:

| Persona | Klucz (`persona_key`) | Rola w systemie | Domyślne dane autofill |
|---|---|---|---|
| **Anna Nowak** | `anna_nowak` | Mieszkaniec / Opiekun | Powiat nowosądecki, Gmina Grybów, `anna.nowak@przyklad.pl`, tel: `501 234 567` |
| **Marek Wiśniewski** | `marek_wisniewski` | JST / Koordynator CUS | CUS w Myślenicach, Powiat myślenicki, `cus@myslenice.pl`, tel: `12 272 56 00` |
| **Katarzyna Zielińska** | `katarzyna_zielinska` | NGO (Prezes) | Fundacja Aktywna Małopolska (Tarnów), KRS: `0000123456`, NIP: `9930012345`, `kontakt@aktywna-malopolska.pl` |
| **dr Piotr Adamski** | `piotr_adamski` | Ekspert / Mentor | Uniwersytet Pedagogiczny / Ekspert ds. deinstytucjonalizacji (Kraków), `ekspert@innowacjespoleczne.pl` |
| **Magdalena Kaczmarczyk** | `magdalena_kaczmarczyk`| ROPS Kraków (Admin) | Koordynator Małopolskiego Hubu Innowacji Społecznych, `rops@rops.krakow.pl` |

---

## 4. Przegląd i Dokumentacja Endpointów API

### Dokumentacja interaktywna
- **Swagger UI**: `GET /api/docs/`
- **Redoc**: `GET /api/redoc/`
- **OpenAPI 3 Schema**: `GET /api/schema/`
- **Panel Administracyjny Django**: `GET /admin/`
- **Health Check**: `GET /api/health/`

---

### Tabela tras API

| Metoda | Ścieżka URL | Moduł | Opis działania |
|---|---|---|---|
| `GET` | `/api/health/` | Core | Stan usługi, wersja, timestamp |
| `GET` | `/api/categories/` | Moduł II | Lista 9 oficjalnych kategorii ROPS Kraków |
| `GET` | `/api/categories/{code}/` | Moduł II | Szczegóły kategorii wg slug/kodu (np. `seniors`, `mobility`) |
| `GET` | `/api/counties/` | Moduł II | Lista 22 powiatów Małopolski z gminami, ludnością i wskaźnikiem seniorów |
| `GET` | `/api/counties/{slug}/` | Moduł II | Szczegóły powiatu i jego gmin |
| `GET` | `/api/innovations/` | Moduł II | Katalog innowacji z filtrami: `?category=`, `?stage=`, `?type=`, `?q=` |
| `GET` | `/api/innovations/{slug}/` | Moduł II | Pełna karta innowacji (wideo, transkrypcja WCAG, podręcznik PDF, metryka) |
| `POST`| `/api/innovations/{slug}/like/` | Moduł II | Inkrementacja polubienia innowacji |
| `POST`| `/api/matchmaking/analyze/` | **Moduł I (Obligatoryjny)** | **Silnik analizy problemu:** kojarzenie z innowacjami ROPS, wyliczanie Match Score %, generowanie polskiego uzasadnienia i detekcja luk |
| `GET` | `/api/problems/` | Moduł I / VI | Lista zgłoszonych problemów (`?status=`, `?county=`, `?persona=`) |
| `GET` | `/api/problems/{id}/` | Moduł I / VI | Szczegóły zgłoszenia wraz z dopasowanymi innowacjami |
| `GET` | `/api/challenges/` | Moduł II | Baza wyzwań regionalnych Małopolski powiązanych z powiatami |
| `GET` | `/api/challenges/{slug}/` | Moduł II | Szczegóły wyzwania ze statystykami i powiązanymi innowacjami |
| `GET` | `/api/ideas/` | Moduł III | Lista zgłoszeń: Fiszki i Wnioski FERS (`?type=`, `?status=`, `?persona=`) |
| `POST`| `/api/ideas/` | Moduł III | Utworzenie Fiszki lub 12-punktowego wniosku FERS (budżet do 50k zł) |
| `GET` | `/api/ideas/{id}/` | Moduł III | Pobranie wniosku / fiszki |
| `POST`| `/api/ideas/{id}/evaluate/` | Moduł III / VI | Ocena formalno-merytoryczna wniosku przez koordynatora ROPS (`score`, `feedback`, `status`) |
| `GET` | `/api/pilots/` | Moduł IV | Lista pilotaży innowacji (*BaWita*, *Merkury*) z liczbą miejsc |
| `POST`| `/api/pilots/{id}/apply/` | Moduł IV | Zgłoszenie się kandydata do udziału w testach pilotażowych |
| `GET` | `/api/evaluations/` | Moduł IV | Lista ustrukturyzowanych ankiet ewaluacyjnych z testów |
| `POST`| `/api/evaluations/` | Moduł IV | Wysłanie ankiety feedbacku (oceny 1-5 WCAG, bariery, usprawnienia, rekomendacja) |
| `GET` | `/api/partnerships/` | Moduł V | Giełda Współpracy: oferty partnerstw (`?looking_for=`, `?county=`, `?category=`) |
| `POST`| `/api/partnerships/` | Moduł V | Publikacja nowej oferty współpracy międzysektorowej (JST <-> NGO) |
| `GET` | `/api/inquiries/` | Moduł V | Zapytania do ROPS / mentorów (`?faq=true` zwraca publiczną bazę FAQ) |
| `POST`| `/api/inquiries/` | Moduł V | Wysłanie nowego zapytania do koordynatora ROPS lub eksperta |
| `POST`| `/api/inquiries/{id}/respond/`| Moduł V / VI | Odpowiedź eksperta/ROPS z opcją publikacji jako publiczne FAQ |
| `POST`| `/api/middleman/package/` | **Moduł VII** | **Middleman AI:** generowanie pakietu wdrożeniowego usługi dla samorządu (CUS/OPS) |
| `GET` | `/api/admin/trends/` | **Moduł VI / II** | **Analityka trendów:** statystyki wg kategorii i powiatów, zestawienie „Białych plam” |
| `PATCH`| `/api/admin/moderate/{id}/` | Moduł VI | Moderacja zgłoszenia potrzeby przez ROPS (`status`, `admin_notes`) |

---

## 5. Przykłady Żądań i Odpowiedzi (Payload Examples)

### 1. Matchmaking Społeczny (`POST /api/matchmaking/analyze/`)

#### Request:
```json
{
  "title": "Samotność i demencja osób starszych w sołectwie",
  "description": "Szukamy wsparcia i terapii dla samotnych seniorów z problemami pamięciowymi w małej wsi.",
  "affected_group": "Seniorzy 65+ w małej wsi",
  "category_id": 1,
  "county_id": 1,
  "municipality_name": "Grybów",
  "persona_key": "anna_nowak",
  "reporter_role": "mieszkaniec",
  "reporter_name": "Anna Nowak",
  "reporter_email": "anna.nowak@przyklad.pl",
  "reporter_phone": "501 234 567",
  "save_submission": true
}
```

#### Response (Gdy znaleziono innowację):
```json
{
  "submission_id": 1,
  "is_gap_identified": false,
  "gap_message": "",
  "total_matches": 2,
  "top_score": 87.5,
  "matches": [
    {
      "innovation": {
        "id": 1,
        "title": "BaWita – Mobilna sensoryczna tablica aktywizująca",
        "slug": "bawita-tablica-sensoryczna",
        "category_name": "Dla seniorów",
        "maturity_stage": "testy",
        "innovation_type": "produkt",
        "short_summary": "Przenośny zestaw stymulacji sensorycznej...",
        "target_audience": "Seniorzy 65+, osoby z chorobami otępiennymi...",
        "replication_readiness_score": 92
      },
      "similarity_score": 87.5,
      "justification": "Zbieżność w głównej kategorii ROPS: Dla seniorów. Zgodność kluczowych zagadnień (seniorów, demencja, wieś). Dopasowanie grupy docelowej. Rozwiązanie jest na etapie: Pilotaż / Ewaluacja.",
      "suggested_next_step": "middleman"
    }
  ],
  "recommended_action": "middleman"
}
```

#### Response (Wykrycie luki społecznej – „Biała plama”):
```json
{
  "submission_id": 2,
  "is_gap_identified": true,
  "gap_message": "W bazie ROPS Kraków nie zidentyfikowano jeszcze bezpośredniej innowacji dla tak sformułowanej potrzeby. Twoje zgłoszenie zostało zarejestrowane jako 'Biała plama' (Luka społeczna). Możesz od razu przekształcić ten problem w pomysł na nową innowację w Kreatorze Pomysłów i ubiegać się o mikrogrant FERS do 50 000 zł!",
  "total_matches": 0,
  "top_score": 0.0,
  "matches": [],
  "recommended_action": "kreator"
}
```

---

### 2. Generator Pakietu Wdrożeniowego Middleman AI (`POST /api/middleman/package/`)

Dedykowany dla wójtów, burmistrzów i dyrektorów CUS/OPS.

#### Request:
```json
{
  "innovation_id": 1,
  "county_id": 2,
  "municipality_name": "Myślenice",
  "municipality_type": "miejsko-wiejska",
  "population": 45000,
  "has_cus": true,
  "execution_model": "zlecenie_ngo"
}
```

#### Response:
```json
{
  "id": 1,
  "innovation": 1,
  "innovation_title": "BaWita – Mobilna sensoryczna tablica aktywizująca",
  "county": 2,
  "county_name": "Powiat myślenicki",
  "municipality_name": "Myślenice",
  "municipality_type": "miejsko-wiejska",
  "population": 45000,
  "has_cus": true,
  "execution_model": "zlecenie_ngo",
  "service_name": "Lokalna Usługa Społeczna: BaWita dla mieszkańców gminy Myślenice",
  "service_standard": "Standard realizacji usługi 'BaWita' w gminie Myślenice (miejsko-wiejska, 45000 mieszkańców). Usługa skierowana do grupy: Seniorzy 65+... Model organizacyjny: poprzez Centrum Usług Społecznych (CUS)...",
  "staffing_requirements": [
    {
      "role": "Koordynator usługi społecznej",
      "allocation": "0.5 etatu",
      "qualifications": "Wykształcenie wyższe..."
    },
    {
      "role": "Specjalista / Animator / Wykonawca innowacji",
      "allocation": "1.0 etat (lub umowa zlecenia)",
      "qualifications": "Ukończony warsztat wdrożeniowy ROPS..."
    }
  ],
  "cost_breakdown": {
    "annual_total_pln": 120000,
    "staff_compensation_pln": 78000,
    "materials_and_innovation_license_pln": 24000,
    "operational_and_travel_pln": 18000
  },
  "funding_sources": [
    {"source": "Program FERS Działanie 5.1 (Innowacje Społeczne ROPS)", "percentage": 70, "amount_pln": 84000},
    {"source": "Środki własne gminy / CUS", "percentage": 15, "amount_pln": 18000},
    {"source": "PFRON / Programy wsparcia dostępności", "percentage": 15, "amount_pln": 18000}
  ],
  "implementation_steps": [
    {"month": "Miesiąc 1", "step": "Podjęcie uchwały Rady Gminy lub aktualizacja Programu Usług Społecznych CUS."},
    {"month": "Miesiąc 2", "step": "Pozyskanie pakietu innowacji z ROPS Kraków i przeszkolenie kadry / ogłoszenie konkursu dla NGO..."},
    {"month": "Miesiąc 3", "step": "Rekrutacja uczestników z terenu gminy i uruchomienie pierwszych cykli usługi."},
    {"month": "Miesiące 4-6", "step": "Świadczenie usługi, monitoring wskaźników satysfakcji i raport ewaluacyjny do ROPS."}
  ]
}
```

---

### 3. Zgłoszenie Wniosku Grantowego FERS 12 pkt (`POST /api/ideas/`)

#### Request:
```json
{
  "submission_type": "grant_fers",
  "persona_key": "katarzyna_zielinska",
  "title": "Sąsiedzka Sieć Wytchnieniowa – Mobilni wolontariusze wsparcia seniora",
  "category": 1,
  "county": 3,
  "applicant_type": "podmiot_ngo",
  "applicant_name": "Fundacja Aktywna Małopolska",
  "applicant_email": "kontakt@aktywna-malopolska.pl",
  "applicant_phone": "14 621 00 00",
  "applicant_address": "ul. Krakowska 12",
  "applicant_city": "Tarnów",
  "applicant_postal_code": "33-100",
  "organization_krs": "0000123456",
  "organization_nip": "9930012345",
  "organization_representative": "Katarzyna Zielińska - Prezes Zarządu",
  "innovation_description": "Stworzenie aplikacji i procedury szybkiego wzywania przeszkolonych sąsiadów do doraźnej opieki wytchnieniowej w duchu deinstytucjonalizacji.",
  "uniqueness_rationale": "Tradycyjne agencje opieki są za drogie i nie docierają do małych sołectw.",
  "problem_diagnosis": "Oparte na Mapie Wyzwań ROPS dla powiatu tarnowskiego (24.2% seniorów).",
  "target_recipients": "30 opiekunów rodzinnych osób niesamodzielnych.",
  "expected_change": "Zmniejszenie obciążenia psychofizycznego opiekunów o min. 40%.",
  "scalability_model": "Możliwość łatwej replikacji w każdym CUS w Małopolsce.",
  "action_plan_prep": [
    {"dzialanie": "Opracowanie standardu bezpieczeństwa", "termin": "Miesiąc 1-2", "koszt": 8000}
  ],
  "action_plan_testing": [
    {"dzialanie": "Pilotaż u 30 rodzin", "termin": "Miesiące 3-9", "koszt": 42000}
  ],
  "requested_grant_amount": "50000.00",
  "team_experience": "10 lat doświadczenia w projektach społecznych w Małopolsce.",
  "formal_declarations_accepted": true
}
```

---

### 4. Analityka Trendów Regionalnych (`GET /api/admin/trends/`)

#### Response:
```json
{
  "total_submissions": 4,
  "total_ideas": 2,
  "total_pilots": 2,
  "total_partnerships": 2,
  "by_category": [
    {
      "category_id": 1,
      "category_name": "Dla seniorów",
      "category_code": "seniors",
      "submissions_count": 2,
      "innovations_count": 2
    }
  ],
  "by_county": [
    {
      "county_id": 1,
      "county_name": "Powiat nowosądecki",
      "population": 217000,
      "senior_ratio": 22.8,
      "submissions_count": 2
    }
  ],
  "white_spots": [
    {
      "submission_id": 2,
      "title": "Brak mobilnego doradcy technologicznego dla osób głuchych na wsi",
      "category_name": "Dla osób z niepełnosprawnością sensoryczną",
      "county_name": "Powiat gorlicki",
      "affected_group": "Osoby głuche i słabosłyszące",
      "reported_at": "2026-10-03T19:45:00Z"
    }
  ]
}
```

---

## 6. Struktura plików w `backend/`

```text
backend/
├── api/
│   ├── management/
│   │   └── commands/
│   │       └── seed_demo_data.py    # Autentyczne dane ROPS Kraków, innowacje, powiaty, persony
│   ├── migrations/
│   │   └── 0001_initial.py          # Początkowa migracja bazy SQLite
│   ├── admin.py                     # Rejestracja w Django Admin z filtrami i tabelami
│   ├── apps.py                      # Konfiguracja aplikacji DRF
│   ├── models.py                    # 12 modeli domenowych ROPS Kraków
│   ├── serializers.py               # Serializery DRF ze schematami OpenAPI
│   ├── tests.py                     # 11 kompleksowych testów automatycznych
│   ├── urls.py                      # Router tras REST
│   └── views.py                     # Silnik Matchmakingu, Middleman AI, Trendy, ViewSety
├── config/
│   ├── settings.py                  # Konfiguracja Django 6.1, CORS, drf-spectacular
│   ├── urls.py                      # Główny router: /api/, /api/docs/, /admin/
│   ├── wsgi.py / asgi.py
├── db.sqlite3                       # Baza danych prototypu
├── manage.py
└── requirements.txt
```
