import json
import logging
import re
from typing import Any, Optional
from django.conf import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Jesteś doradcą i ekspertem Regionalnego Ośrodka Polityki Społecznej (ROPS) w Krakowie ds. innowacji społecznych oraz funduszy europejskich (FERS Działanie 5.1 – Innowacje Społeczne).
Twoim zadaniem jest wspieranie wnioskodawców (osób fizycznych, NGO, jednostek samorządu terytorialnego) w przygotowaniu wysokiej jakości, profesjonalnego wniosku o mikrogrant na innowację społeczną (maks. 50 000 PLN).
Wszystkie odpowiedzi formułuj w języku polskim. Pisz zwięźle, konkretnie, językiem projektowym zgodnym ze standardami ROPS Kraków, deinstytucjonalizacji oraz dostępności (WCAG 2.2).
Zawsze odpowiadaj wyłącznie w formacie JSON zgodnym ze wskazanym schematem.
BARDZO WAŻNE: Nie dodawaj żadnych zbędnych metatekstów ani etykiet w rodzaju "Rekomendacja deinstytucjonalizacji (ROPS Kraków): Wpisz...", "Wskazówka:", "Podpowiedź merytoryczna:". Generuj prostą, bezpośrednią treść do wpisania w formularz wniosku.
"""


def get_openai_client() -> Optional[Any]:
    """Zwraca zainicjalizowanego klienta OpenAI lub None jeśli brak klucza."""
    api_key = getattr(settings, "OPENAI_API_KEY", "")
    if not api_key:
        return None
    try:
        from openai import OpenAI
        return OpenAI(api_key=api_key, timeout=25.0)
    except Exception as exc:
        logger.warning("Nie udało się zainicjalizować klienta OpenAI: %s", exc)
        return None


def _clean_suggestion_text(text: str) -> str:
    """Usuwa zbędne etykiety meta i instrukcje dla użytkownika."""
    cleaned = (text or "").strip()
    # Usunięcie np. "Rekomendacja deinstytucjonalizacji (ROPS Kraków): Wpisz «Innowacja» w "
    cleaned = re.sub(
        r"^(?:Rekomendacja[^\:]*\:|Wskazówka[^\:]*\:|Podpowiedź[^\:]*\:|Wyróżniki[^\:]*\:|Model replikacji[^\:]*\:)\s*(?:Wpisz[^\.]*\.\s*)?",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )
    return cleaned.strip()


def _clean_and_parse_json(raw_text: str, field_type: str) -> dict[str, Any]:
    """Czyści bloki markdown i parsuje odpowiedź do słownika JSON."""
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        cleaned = cleaned.strip()

    try:
        data = json.loads(cleaned)
        if isinstance(data, dict):
            if "suggestion" in data and isinstance(data["suggestion"], str):
                data["suggestion"] = _clean_suggestion_text(data["suggestion"])
            return data
    except Exception:
        pass

    # Rezerwowe parsowanie, jeśli model zwrócił czysty tekst
    if field_type == "budget_action_plan":
        return {
            "suggestion": cleaned,
            "action_plan_prep": [
                {"dzialanie": "Opracowanie standardu innowacji i procedur", "termin": "Miesiąc 1-2", "koszt": 8000},
                {"dzialanie": "Szkolenie kadry i przygotowanie narzędzi", "termin": "Miesiąc 2-3", "koszt": 6000},
            ],
            "action_plan_testing": [
                {"dzialanie": "Pilotażowe świadczenie usług u 25 testerów", "termin": "Miesiące 4-9", "koszt": 32000, "liczba_testerow": 25},
                {"dzialanie": "Audyt dostępności WCAG 2.2 i raport końcowy", "termin": "Miesiące 10-12", "koszt": 4000, "liczba_testerow": 25},
            ],
            "requested_grant_amount": 50000,
        }
    elif field_type == "concept_diagram":
        return {
            "suggestion": "Wygenerowano schemat innowacji społecznej.",
            "mermaid_code": cleaned if "graph TD" in cleaned else "graph TD\n  A[\"Diagnoza\"] --> B[\"Innowacja\"]\n  B --> C[\"Testowanie\"]\n  C --> D[\"Rezultat\"]",
            "steps": [
                {"title": "Diagnoza lokalna", "description": "Analiza potrzeb grupy docelowej"},
                {"title": "Innowacja", "description": "Wdrożenie nowatorskich rozwiązań"},
                {"title": "Faza testowa", "description": "Pilotaż i audyt WCAG"},
                {"title": "Trwała zmiana", "description": "Deinstytucjonalizacja usług"},
            ],
        }
    return {"suggestion": cleaned}


def generate_fers_field_assist(
    field_type: str,
    title: str,
    category_name: str,
    county_name: str,
    county_stats: Optional[dict[str, Any]] = None,
    recipients: str = "",
    concept: str = "",
) -> Optional[dict[str, Any]]:
    """
    Generuje propozycję treści dla wybranego pola formularza FERS przy użyciu OpenAI API.
    Obsługuje Responses API (client.responses.create) oraz chat.completions z automatycznym fallbackiem.
    """
    client = get_openai_client()
    if client is None:
        return None

    model = getattr(settings, "OPENAI_MODEL", "gpt-4o-mini") or "gpt-4o-mini"
    stats = county_stats or {}
    senior_ratio = stats.get("senior_ratio", "23%")
    population = stats.get("population", "b.d.")
    challenges = ", ".join(stats.get("challenges", [])) or "wykluczenie społeczne, starzenie się społeczności"

    context_info = f"""
Kontekst projektu:
- Tytuł innowacji: {title}
- Kategoria ROPS: {category_name}
- Obszar realizacji (powiat): {county_name} (ludność: {population}, wskaźnik seniorów: {senior_ratio}, wyzwania: {challenges})
- Grupa docelowa: {recipients or 'Mieszkańcy powiatu zagrożeni wykluczeniem'}
- Opis/koncepcja wnioskodawcy: {concept or 'Brak wstępnego opisu'}
"""

    if field_type == "deinstitutionalization":
        user_prompt = f"""{context_info}
Zadanie:
Napisz rekomendację i uzasadnienie deinstytucjonalizacji dla wniosku FERS (sekcja opis innowacji).
Wykaż, w jaki sposób innowacja «{title}» przenosi wsparcie z placówek całodobowych (DPS, ZOL) na usługi świadczone w środowisku lokalnym beneficjenta (mieszkanie, sąsiedztwo, mobilne wsparcie, technologie wspomagające).
Napisz 1-2 zwarte akapity profesjonalnego tekstu gotowego do wklejenia do wniosku.

Odpowiedz wyłącznie w formacie JSON:
{{
  "suggestion": "treść rekomendacji deinstytucjonalizacji"
}}
"""

    elif field_type == "innovation_uniqueness":
        user_prompt = f"""{context_info}
Zadanie:
Przygotuj opis wyróżników innowacyjności (sekcja: na czym polega nowatorstwo na tle rozwiązań w Polsce i UE).
Wskaż konkretne przewagi: niższy koszt jednostkowy (np. o 30-40%), angażowanie społeczności/wolontariuszy (co-design), szybszy czas reakcji lub unikalną metodykę.
Napisz 1-2 zwarte akapity profesjonalnego tekstu gotowego do wklejenia do wniosku FERS.

Odpowiedz wyłącznie w formacie JSON:
{{
  "suggestion": "treść wyróżników innowacyjności"
}}
"""

    elif field_type == "county_diagnosis":
        user_prompt = f"""{context_info}
Zadanie:
Przygotuj merytoryczną diagnozę problemu w powiecie {county_name} w oparciu o dane Obserwatorium Polityki Społecznej ROPS Kraków:
- wskaźnik osób 60+: {senior_ratio}
- wyzwania: {challenges}
Wykaż, dlaczego realizacja «{title}» jest kluczowa akurat w tym powiecie.

Odpowiedz wyłącznie w formacie JSON:
{{
  "suggestion": "Pełna diagnoza z punktami i uzasadnieniem",
  "senior_ratio": "{senior_ratio}",
  "challenges": {json.dumps(stats.get("challenges", []))}
}}
"""

    elif field_type == "scalability":
        user_prompt = f"""{context_info}
Zadanie:
Przygotuj opis modelu replikacji i skalowalności innowacji w Małopolsce (jak innowacja może zostać przejęta przez Centra Usług Społecznych CUS, OPS lub inne gminy po zakończeniu grantu FERS).
Napisz 1-2 zwarte akapity profesjonalnego tekstu gotowego do wklejenia do wniosku.

Odpowiedz wyłącznie w formacie JSON:
{{
  "suggestion": "treść modelu replikacji i skalowania"
}}
"""

    elif field_type == "budget_action_plan":
        user_prompt = f"""{context_info}
Zadanie:
Zaproponuj optymalny harmonogram działań i budżet mikrograntu FERS (maksymalna łączna kwota to dokładnie 50 000 PLN).
Struktura:
1. Faza przygotowawcza (1-3 miesiąc): 2 zadania (np. standard usługi, szkolenie kadry), łączny koszt ok. 12 000 - 15 000 PLN.
2. Faza testowania (4-12 miesiąc): 2 zadania (np. pilotaż u 25-30 testerów, audyt WCAG 2.2 i raport końcowy), łączny koszt ok. 35 000 - 38 000 PLN.
Suma kosztów obu faz MUSI wynosić dokładnie 50 000 PLN.

Odpowiedz wyłącznie w formacie JSON:
{{
  "action_plan_prep": [
    {{"dzialanie": "nazwa zadania", "termin": "Miesiąc 1-2", "koszt": 8000}},
    {{"dzialanie": "nazwa zadania", "termin": "Miesiąc 2-3", "koszt": 6000}}
  ],
  "action_plan_testing": [
    {{"dzialanie": "nazwa zadania testowego", "termin": "Miesiące 4-9", "koszt": 32000, "liczba_testerow": 25}},
    {{"dzialanie": "audyt WCAG i raport", "termin": "Miesiące 10-12", "koszt": 4000, "liczba_testerow": 25}}
  ],
  "requested_grant_amount": 50000,
  "suggestion": "Zwięzłe podsumowanie budżetu i harmonogramu"
}}
"""

    elif field_type == "concept_diagram":
        user_prompt = f"""{context_info}
Zadanie:
Wygeneruj czytelny schemat blokowy logiki innowacji w formacie Mermaid (kod graph TD) oraz listę 4-5 kroków/kamieni milowych (steps).
W schemacie uwzględnij diagnozę w {county_name}, założenia innowacji, fazę przygotowawczą, testowanie i rezultat deinstytucjonalizacji.

Odpowiedz wyłącznie w formacie JSON:
{{
  "mermaid_code": "graph TD\\n  A[... ] --> B[... ]\\n  B --> C[... ]",
  "steps": [
    {{"title": "Krok 1", "description": "opis"}},
    {{"title": "Krok 2", "description": "opis"}}
  ],
  "suggestion": "Krótki opis wygenerowanego schematu"
}}
"""

    else:
        user_prompt = f"""{context_info}
Zadanie:
Zaproponuj profesjonalną treść do sekcji «{field_type}» we wniosku FERS dla innowacji «{title}».

Odpowiedz wyłącznie w formacie JSON:
{{
  "suggestion": "profesjonalna treść sekcji"
}}
"""

    raw_output: Optional[str] = None

    # 1. Próba użycia OpenAI Responses API (client.responses.create)
    if hasattr(client, "responses"):
        try:
            full_input = f"{SYSTEM_PROMPT}\n\n{user_prompt}"
            resp = client.responses.create(
                model=model,
                input=full_input,
            )
            raw_output = getattr(resp, "output_text", None)
            if not raw_output and hasattr(resp, "output") and resp.output:
                raw_output = str(resp.output)
        except Exception as exc:
            logger.info("Responses API niedostępne lub zwróciło błąd (%s), próba fallbacku na chat.completions", exc)

    # 2. Alternatywa: Chat Completions API (bez wymuszania parametru temperature)
    if not raw_output and hasattr(client, "chat"):
        try:
            chat_resp = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
            )
            raw_output = chat_resp.choices[0].message.content
        except Exception as exc:
            logger.warning("Błąd wywołania Chat Completions dla pola %s: %s", field_type, exc)

    if not raw_output:
        return None

    data = _clean_and_parse_json(raw_output, field_type)
    data["field"] = field_type
    data["source"] = "openai"
    return data


def deterministic_validate_field(
    field_type: str,
    content: str,
    title: str = "Innowacja społeczna",
    category_name: str = "Włączenie społeczne",
    county_name: str = "Małopolska",
    county_stats: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """
    Deterministyczny silnik walidacji jakości wniosku FERS / ROPS Kraków.
    Analizuje długość, kluczowe wskaźniki, obecność danych lokalnych i kryteria grantowe.
    """
    text = (content or "").strip()
    stats = county_stats or {}
    senior_ratio = stats.get("senior_ratio", "23%")

    # 1. Pusty lub skrajnie krótki tekst
    if len(text) < 40:
        if field_type in ("problem_diagnosis", "county_diagnosis") and len(text) > 0:
            verdict = "Problem wymaga głębszego opisu i danych lokalnych"
        elif field_type in ("deinstitutionalization", "innovation_desc") and len(text) > 0:
            verdict = "Opis innowacji wymaga głębszego rozwinięcia"
        elif len(text) == 0:
            verdict = "Pole nie zostało jeszcze wypełnione"
        else:
            verdict = "Opis jest zbyt krótki lub niekompletny"

        return {
            "field": field_type,
            "status": "needs_work",
            "score": 25 if len(text) > 0 else 10,
            "verdict": verdict,
            "summary": "Wprowadzona treść jest zbyt lakoniczna. Eksperci ROPS Kraków oceniają wnioski pod kątem rzeczywistych, udokumentowanych potrzeb społecznych.",
            "strengths": ["Rozpoczęto edycję formularza"] if len(text) > 0 else [],
            "improvements": [
                "Rozwiń opis o minimum 2-3 konkretne zdania przedstawiające szczegóły.",
                f"Wskaż uwarunkowania lokalne w powiecie {county_name}.",
                "Skorzystaj z przycisku asystenta AI, aby wygenerować rekomendowaną bazę tekstu.",
            ],
            "suggested_questions": [
                "Jakie dokładnie wyzwanie rozwiązuje ten projekt?",
                "Kto i w jaki sposób bezpośrednio odczuje pozytywną zmianę?",
            ],
            "source": "deterministic",
        }

    has_numbers = bool(re.search(r"\d+", text))
    has_local = any(
        kw in text.lower()
        for kw in ["powiat", "gmin", "małopolsk", "kraków", county_name.lower(), "obszar", "wiejsk", "miejsk"]
    )
    has_deinst = any(
        kw in text.lower()
        for kw in ["deinstytucjonaliz", "środowisk", "domow", "sąsiedz", "mieszkani", "dps", "zol", "stacjonarn"]
    )
    has_uniqueness = any(
        kw in text.lower()
        for kw in ["wyróżn", "innowac", "nowator", "przewag", "koszt", "taniej", "szybciej", "metod", "co-design"]
    )

    if field_type in ("problem_diagnosis", "county_diagnosis"):
        if not has_numbers or not has_local or len(text) < 110:
            missing = []
            if not has_local:
                missing.append(f"brak odniesienia do specyfiki powiatu {county_name}")
            if not has_numbers:
                missing.append("brak danych liczbowych lub skali zjawiska")
            if len(text) < 110:
                missing.append("zbyt ogólne sformułowania bez analizy przyczyn")

            return {
                "field": field_type,
                "status": "needs_work" if len(text) < 80 else "warning",
                "score": 45 if len(text) < 80 else 62,
                "verdict": "Problem wymaga głębszego opisu i danych lokalnych",
                "summary": f"Diagnoza problemu jest zbyt ogólna ({', '.join(missing)}). Wnioski FERS wymagają wykazania realnego deficytu usług w danym powiecie.",
                "strengths": ["Wskazano ogólny obszar tematyczny problemu społecznego."],
                "improvements": [
                    f"Wzbogać opis o dane Obserwatorium ROPS dla powiatu {county_name} (np. wskaźnik seniorów: {senior_ratio}).",
                    "Wskaż szacunkową liczbę osób dotkniętych wykluczeniem lub deficytem opieki.",
                    "Określ bariery infrastrukturalne i kadrowe występujące w tym rejonie.",
                ],
                "suggested_questions": [
                    f"Ilu mieszkańców w powiecie {county_name} bezpośrednio dotyka ten problem?",
                    "Dlaczego dotychczasowe placówki i usługi gminne nie rozwiązują tej trudności?",
                ],
                "source": "deterministic",
            }
        else:
            return {
                "field": field_type,
                "status": "valid",
                "score": 92,
                "verdict": "Diagnoza problemu rzetelna i osadzona w realiach regionu",
                "summary": f"Opis wyczerpująco przedstawia sytuację w powiecie {county_name}, zawiera dane liczbowe i przekonująco uzasadnia potrzebę mikrograntu.",
                "strengths": [
                    "Uwzględniono specyfikę lokalną i uwarunkowania powiatu.",
                    "Zawarto mierzalne odniesienia do skali odbiorców.",
                    "Jasno wykazano lukę w obecnym systemie wsparcia.",
                ],
                "improvements": [
                    "Upewnij się, że planowane w fazie testów działania bezpośrednio odpowiadają na te bariery.",
                ],
                "suggested_questions": [],
                "source": "deterministic",
            }

    elif field_type in ("deinstitutionalization", "innovation_desc"):
        if not has_deinst or len(text) < 100:
            return {
                "field": field_type,
                "status": "warning",
                "score": 55,
                "verdict": "Opis innowacji wymaga silniejszego powiązania z deinstytucjonalizacją",
                "summary": "Standard FERS Działanie 5.1 kładzie kluczowy nacisk na usługi w środowisku lokalnym jako alternatywę dla placówek całodobowych (DPS/ZOL).",
                "strengths": ["Zarysowano koncepcję świadczenia wsparcia."],
                "improvements": [
                    "Wskaż, w jaki sposób innowacja pozwala beneficjentom pozostać we własnym miejscu zamieszkania.",
                    "Opisz rolę opiekunów mobilnych, asystentów lub wolontariatu sąsiedzkiego.",
                    "Wskaż, jak zapobiegasz konieczności umieszczania podopiecznych w instytucjach opieki całodobowej.",
                ],
                "suggested_questions": [
                    "Czy usługa jest świadczona bezpośrednio w domu beneficjenta lub w jego najbliższym otoczeniu?",
                ],
                "source": "deterministic",
            }
        else:
            return {
                "field": field_type,
                "status": "valid",
                "score": 90,
                "verdict": "Opis innowacji wzorowo wpisuje się w standardy deinstytucjonalizacji",
                "summary": "Koncepcja precyzyjnie promuje usługi środowiskowe i redukuje potrzebę opieki instytucjonalnej.",
                "strengths": [
                    "Wyraźny akcent na wsparcie w naturalnym środowisku podopiecznego.",
                    "Zgodność z wytycznymi regionalnymi ROPS Kraków dotyczącymi deinstytucjonalizacji.",
                ],
                "improvements": [],
                "suggested_questions": [],
                "source": "deterministic",
            }

    elif field_type in ("innovation_uniqueness",):
        if not has_uniqueness or len(text) < 90:
            return {
                "field": field_type,
                "status": "warning",
                "score": 58,
                "verdict": "Wyróżniki innowacji wymagają większej konkretności",
                "summary": "W sekcji nowatorstwa należy wyraźnie udowodnić, czym rozwiązanie różni się od dotychczasowych usług w Małopolsce i dlaczego jest efektywniejsze.",
                "strengths": ["Wskazano chęć wdrożenia nowatorskiego podejścia."],
                "improvements": [
                    "Określ konkretną przewagę (np. koszt jednostkowy niższy o 30-40%, krótszy czas reakcji, angażowanie społeczności).",
                    "Porównaj innowację ze standardową procedurą realizowaną przez OPS/CUS.",
                ],
                "suggested_questions": [
                    "Co dokładnie sprawia, że ta metoda działa tam, gdzie tradycyjna pomoc zawiodła?",
                ],
                "source": "deterministic",
            }
        else:
            return {
                "field": field_type,
                "status": "valid",
                "score": 89,
                "verdict": "Wyróżniki innowacyjności przedstawione przekonująco",
                "summary": "Jasno wykazano unikalność i wartość dodaną w stosunku do tradycyjnych form wsparcia.",
                "strengths": [
                    "Przekonujące uzasadnienie nowatorstwa.",
                    "Wskazanie wymiernych korzyści organizacyjnych lub kosztowych.",
                ],
                "improvements": [],
                "suggested_questions": [],
                "source": "deterministic",
            }

    elif field_type in ("target_recipients",):
        if not has_numbers or len(text) < 50:
            return {
                "field": field_type,
                "status": "warning",
                "score": 50,
                "verdict": "Grupa docelowa wymaga doprecyzowania liczby i barier",
                "summary": "Wnioskodawca powinien wskazać dokładną liczbę osób planowanych do objęcia testami (rekomendowane min. 20-30 osób).",
                "strengths": ["Zidentyfikowano profil beneficjenta."],
                "improvements": [
                    "Podaj konkretną szacowaną liczbę uczestników pilotażu (np. 25 seniorów i 15 opiekunów).",
                    "Wskaż kryteria rekrutacji i specyficzne bariery grupy docelowej.",
                ],
                "suggested_questions": [
                    "Ilu testerów weźmie udział w fazie pilotażu mikroinnowacji?",
                ],
                "source": "deterministic",
            }
        else:
            return {
                "field": field_type,
                "status": "valid",
                "score": 91,
                "verdict": "Grupa odbiorców zdefiniowana precyzyjnie",
                "summary": "Liczba odbiorców i kryteria kwalifikacji spełniają wymogi pilotażu FERS.",
                "strengths": ["Wskazano mierzalną liczbę uczestników i ich specyficzne potrzeby."],
                "improvements": [],
                "suggested_questions": [],
                "source": "deterministic",
            }

    # Domyślna walidacja pozostałych pól
    if len(text) < 70:
        return {
            "field": field_type,
            "status": "warning",
            "score": 60,
            "verdict": "Warto rozbudować ten element wniosku",
            "summary": "Opis jest zrozumiały, lecz warto podać więcej szczegółów wykonawczych i organizacyjnych.",
            "strengths": ["Zarysowano główne założenia."],
            "improvements": ["Uzupełnij opis o metodologię realizacji i przewidywane rezultaty."],
            "suggested_questions": [],
            "source": "deterministic",
        }

    return {
        "field": field_type,
        "status": "valid",
        "score": 85,
        "verdict": "Treść spełnia standardy wniosku FERS",
        "summary": "Opis jest spójny, zrozumiały i wyczerpujący merytorycznie.",
        "strengths": ["Konkretna i czytelna treść."],
        "improvements": [],
        "suggested_questions": [],
        "source": "deterministic",
    }


def validate_fers_field_or_idea(
    field_type: str,
    content: str,
    title: str = "Innowacja społeczna",
    category_name: str = "Włączenie społeczne",
    county_name: str = "Małopolska",
    county_stats: Optional[dict[str, Any]] = None,
    context: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """
    Waliduje jakość opisu wybranego pola wniosku FERS.
    Wykorzystuje OpenAI API (zgodność z FERS Działanie 5.1 i kryteriami ROPS Kraków)
    lub deterministyczny silnik regułowy przy braku klucza/błędzie sieci.
    """
    client = get_openai_client()
    if client is None:
        return deterministic_validate_field(
            field_type=field_type,
            content=content,
            title=title,
            category_name=category_name,
            county_name=county_name,
            county_stats=county_stats,
        )

    model = getattr(settings, "OPENAI_MODEL", "gpt-4o-mini") or "gpt-4o-mini"
    stats = county_stats or {}
    senior_ratio = stats.get("senior_ratio", "23%")
    population = stats.get("population", "b.d.")
    challenges = ", ".join(stats.get("challenges", [])) or "wykluczenie społeczne, starzenie się społeczności"

    user_prompt = f"""
Kontekst projektu FERS (Działanie 5.1 - Innowacje Społeczne, ROPS Kraków):
- Tytuł innowacji: {title}
- Kategoria tematyczna: {category_name}
- Powiat realizacji: {county_name} (ludność: {population}, wskaźnik seniorów: {senior_ratio}, wyzwania: {challenges})
- Sprawdzane pole wniosku: {field_type}
- Treść wprowadzona przez wnioskodawcę do oceny:
\"\"\"{content}\"\"\"

Zadanie walidatora:
Oceń powyższą treść pod kątem profesjonalnych wymogów mikrograntu FERS (do 50 000 PLN) i kryteriów ROPS Kraków.
Zwróć szczególną uwagę:
1. Czy treść jest jasna i wystarczająco pogłębiona, czy też zbyt lakoniczna, niejasna lub ogólnikowa? (np. jeśli problem wymaga głębszego opisu, brakuje danych lub skali - wskaż to wyraźnie!)
2. Czy odnosi się do realiów powiatu {county_name} oraz zasad deinstytucjonalizacji (usługi środowiskowe zamiast DPS/ZOL)?
3. Przypisz status:
   - "valid" (treść rzetelna, kompletna, punktacja 75-100)
   - "warning" (treść zrozumiała, ale brakuje kluczowych detali lub liczb, punktacja 50-74)
   - "needs_work" (opis zbyt krótki, niejasny, brak diagnozy lub specyfiki lokalnej, punktacja poniżej 50)

Zwróć odpowiedź WYŁĄCZNIE jako obiekt JSON w formacie:
{{
  "field": "{field_type}",
  "status": "valid" | "warning" | "needs_work",
  "score": 65,
  "verdict": "Zwięzły tytuł werdyktu (np. 'Problem wymaga głębszego opisu i danych lokalnych')",
  "summary": "1-2 zdania podsumowania jakości",
  "strengths": ["Mocna strona 1"],
  "improvements": ["Konkretna wskazówka poprawy 1", "Konkretna wskazówka poprawy 2"],
  "suggested_questions": ["Pytanie pomocnicze dla wnioskodawcy"]
}}
"""

    raw_output: Optional[str] = None
    if hasattr(client, "responses"):
        try:
            full_input = f"{SYSTEM_PROMPT}\n\n{user_prompt}"
            resp = client.responses.create(
                model=model,
                input=full_input,
            )
            raw_output = getattr(resp, "output_text", None)
            if not raw_output and hasattr(resp, "output") and resp.output:
                raw_output = str(resp.output)
        except Exception as exc:
            logger.info("Responses API błąd przy walidacji (%s), próba chat.completions", exc)

    if not raw_output and hasattr(client, "chat"):
        try:
            chat_resp = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
            )
            raw_output = chat_resp.choices[0].message.content
        except Exception as exc:
            logger.warning("Błąd wywołania Chat Completions przy walidacji: %s", exc)

    if not raw_output:
        return deterministic_validate_field(
            field_type=field_type,
            content=content,
            title=title,
            category_name=category_name,
            county_name=county_name,
            county_stats=county_stats,
        )

    try:
        data = _clean_and_parse_json(raw_output, field_type)
        if isinstance(data, dict) and "verdict" in data and "status" in data:
            data["field"] = field_type
            data["source"] = "openai"
            return data
    except Exception as parse_exc:
        logger.warning("Nie udało się sparsować odpowiedzi OpenAI: %s", parse_exc)

    return deterministic_validate_field(
        field_type=field_type,
        content=content,
        title=title,
        category_name=category_name,
        county_name=county_name,
        county_stats=county_stats,
    )

