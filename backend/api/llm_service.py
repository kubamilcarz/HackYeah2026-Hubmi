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
