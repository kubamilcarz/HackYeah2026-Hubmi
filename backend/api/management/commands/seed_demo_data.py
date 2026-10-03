import sys
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import (
    InnovationCategory,
    County,
    Municipality,
    SocialInnovation,
    ProblemSubmission,
    ProblemMatch,
    RegionalChallenge,
    IdeaSubmission,
    PilotProject,
    PilotEvaluation,
    PartnershipPost,
    Inquiry,
    MiddlemanPackage,
)


class Command(BaseCommand):
    help = "Zasila bazę danych autentycznymi danymi demonstracyjnymi ROPS Kraków dla platformy Splot"

    def handle(self, *args, **options):
        self.stdout.write("Rozpoczynanie zasilania bazy danych danymi ROPS Kraków...")

        # 1. 9 Oficjalnych Kategorii ROPS Kraków
        categories_data = [
            {
                "code": "seniors",
                "name": "Dla seniorów",
                "description": "Innowacje wspierające aktywność, samodzielność, bezpieczeństwo i integrację osób starszych w lokalnym środowisku zamieszkania.",
                "icon_name": "UsersThree",
                "order": 1,
            },
            {
                "code": "youth_family",
                "name": "Dla dzieci, młodzieży i rodziny",
                "description": "Rozwiązania wspierające rodzicielstwo, integrację międzypokoleniową oraz rozwój kompetencji społecznych u dzieci i młodzieży.",
                "icon_name": "Baby",
                "order": 2,
            },
            {
                "code": "mobility",
                "name": "Dla osób o ograniczonej mobilności",
                "description": "Narzędzia, przedmioty i usprawnienia architektoniczne ułatwiające codzienne funkcjonowanie i przemieszczanie się.",
                "icon_name": "Wheelchair",
                "order": 3,
            },
            {
                "code": "sensory",
                "name": "Dla osób z niepełnosprawnością sensoryczną",
                "description": "Adaptacje sensoryczne, pomoce komunikacyjne i narzędzia przełamujące bariery wzroku i słuchu.",
                "icon_name": "Eye",
                "order": 4,
            },
            {
                "code": "health",
                "name": "Dla zdrowia i medycyny",
                "description": "Usługi prozdrowotne, profilaktyka zdrowia psychicznego, wsparcie wytchnieniowe i opieka domowa.",
                "icon_name": "FirstAid",
                "order": 5,
            },
            {
                "code": "labor",
                "name": "Dla rynku pracy",
                "description": "Ekonomia społeczna, reintegracja zawodowa osób wykluczonych i elastyczne formy zatrudnienia.",
                "icon_name": "Briefcase",
                "order": 6,
            },
            {
                "code": "foreigners",
                "name": "Dla cudzoziemców",
                "description": "Integracja migrantów, nauka języka, włączenie w lokalną społeczność i wsparcie administracyjne.",
                "icon_name": "Globe",
                "order": 7,
            },
            {
                "code": "homelessness",
                "name": "Dla osób w kryzysie bezdomności",
                "description": "Mieszkalnictwo wspomagane, streetworking, punkty wsparcia higienicznego i reintegracja społeczna.",
                "icon_name": "HouseLine",
                "order": 8,
            },
            {
                "code": "intellectual",
                "name": "Dla osób z niepełnosprawnością intelektualną",
                "description": "Treningi samodzielności, mieszkalnictwo wspomagane, komunikacja alternatywna (AAC) i asystencja osobista.",
                "icon_name": "Brain",
                "order": 9,
            },
        ]

        categories_map = {}
        for cdata in categories_data:
            cat, _ = InnovationCategory.objects.update_or_create(
                code=cdata["code"],
                defaults=cdata,
            )
            categories_map[cat.code] = cat

        self.stdout.write(self.style.SUCCESS(f"Zapisano {len(categories_map)} oficjalnych kategorii ROPS."))

        # 2. Powiaty i kluczowe gminy Małopolski
        counties_data = [
            {
                "name": "Powiat nowosądecki",
                "slug": "nowosadecki",
                "teryt": "1210",
                "population": 217000,
                "senior_ratio": 22.8,
                "summary": "Powiat o charakterze podgórskim ze znacznym rozproszeniem osadniczym. Wyzwania: dojazd do usług medycznych, samotność seniorów w sołectwach, depopulacja młodzieży.",
                "main_challenges": ["Dostępność transportowa", "Samotność seniorów na terenach wiejskich", "Opieka wytchnieniowa"],
                "municipalities": [
                    {"name": "Grybów", "kind": "wiejska", "has_cus": False},
                    {"name": "Krynica-Zdrój", "kind": "miejsko-wiejska", "has_cus": True},
                    {"name": "Stary Sącz", "kind": "miejsko-wiejska", "has_cus": False},
                ],
            },
            {
                "name": "Powiat myślenicki",
                "slug": "myslenicki",
                "teryt": "1209",
                "population": 128000,
                "senior_ratio": 21.4,
                "summary": "Region dynamicznie rozwijający usługi społeczne (lider w CUS Myślenice). Zapotrzebowanie na usługi asystenckie i włączenie społeczne osób zależnych.",
                "main_challenges": ["Koordynacja usług społecznych", "Mieszkalnictwo wspomagane", "Integracja młodzieży"],
                "municipalities": [
                    {"name": "Myślenice", "kind": "miejsko-wiejska", "has_cus": True},
                    {"name": "Dobczyce", "kind": "miejsko-wiejska", "has_cus": False},
                    {"name": "Pcim", "kind": "wiejska", "has_cus": False},
                ],
            },
            {
                "name": "Powiat tarnowski",
                "slug": "tarnowski",
                "teryt": "1216",
                "population": 201000,
                "senior_ratio": 24.2,
                "summary": "Jeden z najszybciej starzejących się powiatów wschodniej Małopolski. Silny sektor NGO i ekonomii społecznej.",
                "main_challenges": ["Opieka nad seniorami z ograniczeniami mobilności", "Aktywizacja PES", "Zdrowie psychiczne"],
                "municipalities": [
                    {"name": "Tarnów (gmina wiejska)", "kind": "wiejska", "has_cus": False},
                    {"name": "Wojnicz", "kind": "miejsko-wiejska", "has_cus": True},
                    {"name": "Tuchów", "kind": "miejsko-wiejska", "has_cus": False},
                ],
            },
            {
                "name": "Powiat krakowski",
                "slug": "krakowski",
                "teryt": "1206",
                "population": 285000,
                "senior_ratio": 20.9,
                "summary": "Wianuszek wokół Krakowa – zjawisko suburbanizacji, nagły przyrost ludności przy zróżnicowanej infrastrukturze opiekuńczej.",
                "main_challenges": ["Integracja nowych mieszkańców", "Opieka nad dziećmi i wsparcie rodzicielstwa", "Dostępność cyfrowa"],
                "municipalities": [
                    {"name": "Wieliczka", "kind": "miejsko-wiejska", "has_cus": True},
                    {"name": "Skawina", "kind": "miejsko-wiejska", "has_cus": True},
                    {"name": "Zabierzów", "kind": "wiejska", "has_cus": False},
                ],
            },
            {
                "name": "Powiat tatrzański",
                "slug": "tatrzanski",
                "teryt": "1217",
                "population": 68000,
                "senior_ratio": 23.5,
                "summary": "Specyfika turystyczna, wysokie bariery topograficzne i architektoniczne, potrzeba mobilnych usług asystenckich.",
                "main_challenges": ["Bariery architektoniczne i transportowe", "Sezonowość pracy", "Wsparcie osób z niepełnosprawnościami"],
                "municipalities": [
                    {"name": "Zakopane", "kind": "miejska", "has_cus": False},
                    {"name": "Bukowina Tatrzańska", "kind": "wiejska", "has_cus": False},
                ],
            },
            {
                "name": "Powiat gorlicki",
                "slug": "gorlicki",
                "teryt": "1205",
                "population": 107000,
                "senior_ratio": 25.1,
                "summary": "Teren peryferyjny z najwyższym wskaźnikiem starości demograficznej i zagrożenia ubóstwem energetycznym.",
                "main_challenges": ["Depopulacja", "Ubóstwo energetyczne seniorów", "Brak kadr opiekuńczych"],
                "municipalities": [
                    {"name": "Gorlice", "kind": "miejska", "has_cus": False},
                    {"name": "Biecz", "kind": "miejsko-wiejska", "has_cus": True},
                    {"name": "Uście Gorlickie", "kind": "wiejska", "has_cus": False},
                ],
            },
        ]

        counties_map = {}
        for cdata in counties_data:
            munics = cdata.pop("municipalities")
            county, _ = County.objects.update_or_create(
                slug=cdata["slug"],
                defaults=cdata,
            )
            counties_map[county.slug] = county
            for m in munics:
                Municipality.objects.update_or_create(
                    county=county,
                    name=m["name"],
                    defaults={"kind": m["kind"], "has_cus": m["has_cus"]},
                )

        self.stdout.write(self.style.SUCCESS(f"Zapisano {len(counties_map)} powiatów i gmin Małopolski."))

        # 3. Autentyczne Innowacje Społeczne ROPS Kraków
        innovations_data = [
            {
                "title": "BaWita – Mobilna sensoryczna tablica aktywizująca",
                "slug": "bawita-tablica-sensoryczna",
                "category": categories_map["seniors"],
                "maturity_stage": "testy",
                "innovation_type": "produkt",
                "short_summary": "Przenośny zestaw stymulacji sensorycznej i pamięciowej dla seniorów i osób z demencją w placówkach i środowisku domowym.",
                "full_description": (
                    "BaWita to innowacyjny zestaw modułowych elementów sensoryczno-manualnych, zaprojektowany z myślą o osobach "
                    "z otępieniem, chorobą Alzheimera oraz seniorach doświadczających izolacji. Może być transportowany w poręcznej walizce "
                    "do domu podopiecznego lub świetlicy wiejskiej przez asystenta CUS."
                ),
                "target_audience": "Seniorzy 65+, osoby z chorobami otępiennymi, opiekunowie rodzinni",
                "implementation_guide": (
                    "Krok 1: Zamówienie certyfikowanego zestawu od producenta społecznego. "
                    "Krok 2: 4-godzinny instruktaż opiekunów i asystentów CUS. "
                    "Krok 3: Włączenie tablicy w harmonogram wizyt domowych (2-3 razy w tygodniu po 45 min)."
                ),
                "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "video_transcript": (
                    "[Czas 0:00 - 0:45] Lektor: Prezentujemy BaWita – zestaw sensoryczny opracowany w Małopolskim Inkubatorze Innowacji Społecznych ROPS. "
                    "Widzimy drewnianą tablicę z bezpiecznymi elementami manipulacyjnymi: zamki, przełączniki, labirynty dotykowe. "
                    "[Czas 0:45 - 1:30] Terapeuta zajęciowy wyjaśnia: Narzędzie pozwala na ćwiczenie motoryki małej i pobudzanie wspomnień u osób z zaawansowaną demencją. "
                    "[Czas 1:30 - 2:00] Podsumowanie: Zestaw jest lekki, w pełni zmywalny i bezpieczny zgodnie z normami medycznymi."
                ),
                "handbook_pdf_url": "/documents/podrecznik_bawita_rops.pdf",
                "author_name": "Zespół Terapeutyczny Inkubatora ROPS",
                "author_organization": "Fundacja Rozwoju Terapii Zajęciowej (Nowy Sącz)",
                "author_email": "kontakt@bawita-innowacje.pl",
                "replication_readiness_score": 92,
                "tags": ["seniorzy", "demencja", "terapia sensoryczna", "opieka domowa", "CUS", "wieś"],
                "likes_count": 48,
                "matches_count": 31,
            },
            {
                "title": "Senior CUDER – Gra integracyjno-aktywizująca dla osób starszych",
                "slug": "senior-cuder-gra-integracyjna",
                "category": categories_map["seniors"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "metoda",
                "short_summary": "Planszowa i plenerowa metoda integracji międzypokoleniowej oraz przeciwdziałania depresji i osamotnieniu seniorów.",
                "full_description": (
                    "Senior CUDER (Ciało, Umysł, Duch, Emocje, Relacje) to holistyczna metoda pracy grupowej. Pozwala osobom starszym "
                    "w bezpieczny sposób rozmawiać o trudnych emocjach, stracie, samotności, jednocześnie budując nowe relacje sąsiedzkie."
                ),
                "target_audience": "Samotni seniorzy, kluby seniora, koła gospodyń wiejskich, wolontariusze",
                "implementation_guide": "Szkolenie lidera klubu seniora trwa 1 dzień. Zestaw gry zawiera planszę, karty pytań i podręcznik facylitatora.",
                "video_url": "https://www.youtube.com/watch?v=sample_cuder",
                "video_transcript": (
                    "Transkrypcja WCAG: Film przedstawia spotkanie Klubu Seniora w Grybowie. Uczestnicy siedzą przy stole i losują karty z pytaniami "
                    "o wspomnienia z młodości i emocje. Animatorka tłumaczy, jak gra przełamuje opory przed nawiązywaniem rozmów."
                ),
                "handbook_pdf_url": "/documents/przewodnik_senior_cuder.pdf",
                "author_name": "dr Danuta Wieczorek",
                "author_organization": "Stowarzyszenie Dialog Społeczny",
                "author_email": "cuder@innowacje-rops.pl",
                "replication_readiness_score": 96,
                "tags": ["samotność", "integracja", "gra planszowa", "klub seniora", "zdrowie psychiczne"],
                "likes_count": 84,
                "matches_count": 52,
            },
            {
                "title": "Merkury – Symulator samoobsługowy dla osób z niepełnosprawnościami",
                "slug": "merkury-symulator-samoobslugowy",
                "category": categories_map["intellectual"],
                "maturity_stage": "testy",
                "innovation_type": "technologia",
                "short_summary": "Interaktywny trenażer ułatwiający naukę korzystania z biletomatów, bankomatów i kas samoobsługowych.",
                "full_description": (
                    "Merkury to oprogramowanie połączone z fizycznym dotykowym ekranem treningowym, które symuluje realne miejskie kasy "
                    "i biletomaty. Umożliwia osobom w spektrum autyzmu i z niepełnosprawnością intelektualną bezstresowe ćwiczenie zakupów."
                ),
                "target_audience": "Osoby z niepełnosprawnością intelektualną, spektrum autyzmu, WTZ, szkoły specjalne",
                "implementation_guide": "Instalacja na tablecie lub monitorze dotykowym. Dostępne 12 scenariuszy życiowych o różnym stopniu trudności.",
                "video_url": "https://www.youtube.com/watch?v=sample_merkury",
                "video_transcript": "Transkrypcja WCAG: Instruktor prezentuje ekran symulatora biletomatu. Użytkownik krok po kroku wybiera bilet ulgowy.",
                "handbook_pdf_url": "/documents/instrukcja_merkury.pdf",
                "author_name": "Piotr Wójcik",
                "author_organization": "Spółdzielnia Socjalna Cyfrowy Horyzont",
                "author_email": "biuro@merkury-trening.pl",
                "replication_readiness_score": 88,
                "tags": ["trening samodzielności", "technologia", "biletomat", "WTZ", "dostępność"],
                "likes_count": 62,
                "matches_count": 19,
            },
            {
                "title": "Modularne łazienki dostępne – Szybki pakiet adaptacyjny",
                "slug": "modularne-lazienki-dostepne",
                "category": categories_map["mobility"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "produkt",
                "short_summary": "System bezinwazyjnych, demontowalnych uchwytów i podestów likwidujących bariery w wiejskich domach seniorów.",
                "full_description": (
                    "Wielu seniorów w Małopolsce mieszka w domach z głębokimi wannami i wysokimi progami. Modularny pakiet pozwala "
                    "w 3 godziny przekształcić łazienkę bez kucia płytek i kosztownych remontów, z możliwością późniejszego przeniesienia."
                ),
                "target_audience": "Osoby o ograniczonej mobilności, poruszające się o kulach lub wózkach, seniorzy 70+",
                "implementation_guide": "Montaż przez gminnego konserwatora lub wolontariusza NGO na podstawie prostego szablonu miarowego.",
                "video_url": "https://www.youtube.com/watch?v=sample_lazienki",
                "video_transcript": "Transkrypcja WCAG: Montażysta demonstruje montaż antypoślizgowej ławeczki nawannowej i bezpiecznych poręczy.",
                "handbook_pdf_url": "/documents/katalog_lazienki_dostepne.pdf",
                "author_name": "Inż. Andrzej Mazur",
                "author_organization": "Fundacja Architektura Bez Barier",
                "author_email": "kontakt@dostepnelazienki.pl",
                "replication_readiness_score": 94,
                "tags": ["łazienka", "dostępność", "mieszkanie", "senior", "bariery architektoniczne"],
                "likes_count": 91,
                "matches_count": 44,
            },
            {
                "title": "Organizator Społeczności Lokalnej (OSL) w CUS",
                "slug": "organizator-spolecznosci-lokalnej-cus",
                "category": categories_map["youth_family"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "usluga",
                "short_summary": "Metoda animacji sąsiedzkiej aktywizująca mieszkańców do samopomocy i tworzenia lokalnych grup wsparcia.",
                "full_description": (
                    "Model wdrożony i przetestowany m.in. w Centrum Usług Społecznych w Myślenicach. Zamiast czekać na zgłoszenia zasiłkowe, "
                    "organizator wychodzi w teren, mapuje potencjał sołectw i wspiera powstawanie oddolnych inicjatyw sąsiedzkich."
                ),
                "target_audience": "Mieszkańcy gmin wiejskich i małych miast, samorządy, liderzy lokalni",
                "implementation_guide": "Standard procedur dla CUS, opisy stanowisk pracy i zestaw narzędzi mapowania zasobów sołeckich.",
                "video_url": "https://www.youtube.com/watch?v=sample_osl",
                "video_transcript": "Transkrypcja WCAG: OSL Marek Wiśniewski opowiada o spotkaniu sołeckim i wspólnym remoncie świetlicy.",
                "handbook_pdf_url": "/documents/standard_osl_rops.pdf",
                "author_name": "Marek Wiśniewski i Zespół ROPS",
                "author_organization": "Centrum Usług Społecznych w Myślenicach",
                "author_email": "cus@myslenice.pl",
                "replication_readiness_score": 97,
                "tags": ["CUS", "animacja", "samorząd", "JST", "samopomoc", "sołectwo"],
                "likes_count": 115,
                "matches_count": 67,
            },
            {
                "title": "Kawiarenka Naprawcza – Międzypokoleniowy punkt wymiany umiejętności",
                "slug": "kawiarenka-naprawcza",
                "category": categories_map["labor"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "metoda",
                "short_summary": "Otwarte warsztaty, gdzie seniorzy-majsterkowicze uczą młodzież naprawy sprzętu, budując relacje i redukując odpady.",
                "full_description": (
                    "Kawiarenka Naprawcza (Repair Cafe) łączy cele ekologiczne z włączeniem społecznym i reintegracją zawodową. Seniorzy "
                    "odyskują poczucie sprawczości, a młodzież zdobywa praktyczne kompetencje techniczne."
                ),
                "target_audience": "Seniorzy rzemieślnicy, młodzież szkolna, rodziny z dziećmi",
                "implementation_guide": "Zestaw narzędzi w skrzynce, regulamin BHP punktu naprawczego i wzory plakatów promocyjnych.",
                "video_url": "https://www.youtube.com/watch?v=sample_kawiarenka",
                "video_transcript": "Transkrypcja WCAG: Młody chłopak uczy się lutowania kabla od lampki pod okiem emerytowanego elektryka.",
                "handbook_pdf_url": "/documents/kawiarenka_naprawcza_poradnik.pdf",
                "author_name": "Katarzyna Zielińska",
                "author_organization": "Fundacja Aktywna Małopolska",
                "author_email": "kontakt@aktywna-malopolska.pl",
                "replication_readiness_score": 90,
                "tags": ["naprawy", "majsterkowanie", "ekologia", "międzypokoleniowe", "NGO"],
                "likes_count": 73,
                "matches_count": 28,
            },
        ]

        innovations_map = {}
        for idata in innovations_data:
            inn, _ = SocialInnovation.objects.update_or_create(
                slug=idata["slug"],
                defaults=idata,
            )
            innovations_map[inn.slug] = inn

        self.stdout.write(self.style.SUCCESS(f"Zapisano {len(innovations_map)} autentycznych innowacji ROPS."))

        # 4. Wyzwania Regionalne (Moduł II)
        challenges_data = [
            {
                "title": "Samotność seniorów w rozproszonych sołectwach górskich",
                "slug": "samotnosc-seniorow-w-soltewach",
                "category": categories_map["seniors"],
                "county": counties_map["nowosadecki"],
                "summary": "Ponad 35% seniorów w małych wsiach powiatu nowosądeckiego mieszka samotnie, z dala od przystanków autobusowych i placówek opieki.",
                "full_analysis": (
                    "Analiza ROPS Kraków wskazuje na dramatyczny wzrost zjawiska izolacji geograficzno-społecznej. Osoby 75+ "
                    "w okresie zimowym bywają odcięte od pomocy sąsiedzkiej. Niezbędne jest wprowadzenie mobilnych usług asystenckich "
                    "i narzędzi stymulacji poznawczej (takich jak BaWita czy Senior CUDER)."
                ),
                "statistical_data": {
                    "liczba_seniorow_samotnych": 7450,
                    "odsetek_gospodarstw_jednoosobowych_65plus": "34.8%",
                    "sredni_czas_dojazdu_do_ops_minuty": 42,
                },
                "key_needs": [
                    "Mobilne wizyty asystentów domowych",
                    "Pakiety stymulacji sensorycznej",
                    "Telefon zaufania i sieć sąsiedzka",
                ],
            },
            {
                "title": "Bariery architektoniczne w wiejskim zasobie mieszkaniowym",
                "slug": "bariery-architektoniczne-wies",
                "category": categories_map["mobility"],
                "county": counties_map["gorlicki"],
                "summary": "Niedostępne łazienki i wysokie progi uniemożliwiające bezpieczne funkcjonowanie seniorów w domach jednorodzinnych.",
                "full_analysis": "Większość domów powstała w latach 70-80. XX wieku bez uwzględnienia potrzeb osób starszych.",
                "statistical_data": {"odsetek_lazienek_niedostosowanych": "68%", "wypadki_upadkow_rocznie": 310},
                "key_needs": ["Szybkie modularne pakiety adaptacyjne", "Dofinansowanie montażu uchwytów"],
            },
        ]

        for ch in challenges_data:
            c_obj, _ = RegionalChallenge.objects.update_or_create(
                slug=ch["slug"],
                defaults=ch,
            )
            if ch["slug"] == "samotnosc-seniorow-w-soltewach":
                c_obj.related_innovations.add(innovations_map["bawita-tablica-sensoryczna"], innovations_map["senior-cuder-gra-integracyjna"])
            elif ch["slug"] == "bariery-architektoniczne-wies":
                c_obj.related_innovations.add(innovations_map["modularne-lazienki-dostepne"])

        # 5. Pilotaże i ewaluacje (Moduł IV)
        pilot_bawita, _ = PilotProject.objects.update_or_create(
            innovation=innovations_map["bawita-tablica-sensoryczna"],
            title="Pilotaż BaWita w środowisku domowym – gmina Grybów",
            defaults={
                "status": "completed",
                "county": counties_map["nowosadecki"],
                "municipality_name": "Grybów",
                "max_testers": 5,
                "current_testers_count": 5,
                "eligible_roles_description": "Opiekunowie rodzinni, kadra CUS, pracownicy socjalni",
                "summary": "3-miesięczny pilotaż mobilnej tablicy sensorycznej u 5 podopiecznych z wczesnym otępieniem.",
                "instructions": "Prosimy o sesje 3 razy w tygodniu po 30 minut oraz odnotowywanie czasu skupienia uwagi podopiecznego.",
                "start_date": timezone.now().date() - timezone.timedelta(days=90),
                "end_date": timezone.now().date() - timezone.timedelta(days=10),
            },
        )

        # Trzy wypełnione ankiety ewaluacji dla BaWita
        PilotEvaluation.objects.get_or_create(
            pilot=pilot_bawita,
            evaluator_persona_key="anna_nowak",
            defaults={
                "evaluator_name": "Anna Nowak",
                "evaluator_role": "opiekun",
                "evaluator_institution": "Opiekunka rodzinna (mama 78 lat)",
                "usability_score": 5,
                "effectiveness_score": 5,
                "accessibility_score": 4,
                "barriers_encountered": "Zapięcie walizki wymagało użycia większej siły przez osobę z artretyzmem dłoni.",
                "proposed_improvements": "Zastąpienie metalowych zatrzasków walizki miękkimi pasami z rzepem magnetycznym.",
                "recommend_to_scale": True,
                "test_environment_notes": "Testowano w domu jednorodzinnym w Grybowie. Mama chętnie wracała do labiryntów dotykowych.",
            },
        )

        PilotEvaluation.objects.get_or_create(
            pilot=pilot_bawita,
            evaluator_persona_key="piotr_adamski",
            defaults={
                "evaluator_name": "dr Piotr Adamski",
                "evaluator_role": "ekspert",
                "evaluator_institution": "Uniwersytet Pedagogiczny / Ekspert ds. deinstytucjonalizacji",
                "usability_score": 5,
                "effectiveness_score": 5,
                "accessibility_score": 5,
                "barriers_encountered": "Brak uwag krytycznych. Znakomity poziom bezpieczeństwa materiałów naturalnych.",
                "proposed_improvements": "Wydanie krótkiego wideo-przewodnika dla personelu CUS.",
                "recommend_to_scale": True,
                "test_environment_notes": "Ocena ekspercka w warunkach środowiskowych. Pełna zgodność z celami deinstytucjonalizacji.",
            },
        )

        # Pilotaż Merkury z otwartym naborem testerów
        PilotProject.objects.update_or_create(
            innovation=innovations_map["merkury-symulator-samoobslugowy"],
            title="Otwarty nabór testerów symulatora kas i biletomatów Merkury",
            defaults={
                "status": "recruiting",
                "county": counties_map["myslenicki"],
                "municipality_name": "Myślenice",
                "max_testers": 12,
                "current_testers_count": 7,
                "eligible_roles_description": "Uczestnicy WTZ, osoby w spektrum autyzmu, instruktorzy terapii zajęciowej",
                "summary": "Zapraszamy instytucje i mieszkańców do testowania nowej wersji scenariuszy zakupowych w biletomatach miejskich.",
                "instructions": "Tester otrzymuje tablet ze scenariuszami na 14 dni. Po testach wypełnia krótką 5-minutową ankietę.",
                "start_date": timezone.now().date(),
                "end_date": timezone.now().date() + timezone.timedelta(days=45),
            },
        )

        # 6. Giełda Współpracy / Tablica Partnerstw (Moduł V)
        PartnershipPost.objects.get_or_create(
            title="CUS Myślenice szuka NGO do realizacji usługi mobilnej opieki wytchnieniowej",
            defaults={
                "author_persona_key": "marek_wisniewski",
                "organization_name": "Centrum Usług Społecznych w Myślenicach",
                "organization_type": "jst_cus",
                "county": counties_map["myslenicki"],
                "municipality_name": "Myślenice",
                "category": categories_map["health"],
                "looking_for": "ngo",
                "description": (
                    "Planujemy uruchomienie nowej usługi opieki wytchnieniowej dla 20 rodzin opiekujących się osobami leżącymi. "
                    "Poszukujemy doświadczonego podmiotu ekonomii społecznej lub stowarzyszenia do realizacji wizyt domowych."
                ),
                "contact_email": "cus@myslenice.pl",
                "contact_phone": "12 272 56 00",
                "is_active": True,
            },
        )

        PartnershipPost.objects.get_or_create(
            title="Fundacja Aktywna Małopolska oferuje partnerstwo w tworzeniu Kawiarenki Naprawczej",
            defaults={
                "author_persona_key": "katarzyna_zielinska",
                "organization_name": "Fundacja Aktywna Małopolska",
                "organization_type": "ngo",
                "county": counties_map["tarnowski"],
                "municipality_name": "Tarnów",
                "category": categories_map["labor"],
                "looking_for": "jst",
                "description": (
                    "Dysponujemy kadrą mistrzów rzemiosła i gotowym pakietem wyposażenia warsztatowego. "
                    "Szukamy gminy lub domu kultury chętnego udostępnić salę raz w tygodniu."
                ),
                "contact_email": "kontakt@aktywna-malopolska.pl",
                "contact_phone": "14 621 00 00",
                "is_active": True,
            },
        )

        # 7. Komunikacja i Zapytania do ROPS / FAQ (Moduł V)
        Inquiry.objects.get_or_create(
            subject="Czy gmina wiejska może pozyskać dofinansowanie na adaptację łazienek dla seniorów?",
            defaults={
                "author_persona_key": "anna_nowak",
                "author_name": "Anna Nowak",
                "author_email": "anna.nowak@przyklad.pl",
                "recipient_type": "rops_coordinator",
                "message": "Dzień dobry, w naszej wsi wielu seniorów ma problem z korzystaniem z wysokich wanien. Czy ROPS posiada program wspierający takie instalacje?",
                "response": "Tak, w ramach Inkubatora Włączenia Społecznego 2.0 (FERS) gminy i organizacje mogą ubiegać się o granty do 50 000 zł na testowanie i skalowanie modularnych łazienek dostępnych.",
                "responder_name": "Magdalena Kaczmarczyk (ROPS Kraków)",
                "is_answered": True,
                "is_public_faq": True,
            },
        )

        Inquiry.objects.get_or_create(
            subject="Jakie kryteria musi spełniać wniosek FERS w zakresie deinstytucjonalizacji?",
            defaults={
                "author_persona_key": "katarzyna_zielinska",
                "author_name": "Katarzyna Zielińska",
                "author_email": "kontakt@aktywna-malopolska.pl",
                "recipient_type": "expert_mentor",
                "message": "Przygotowujemy wniosek w Kreatorze i chcemy upewnić się, czy usługa świadczona w klubie seniora kwalifikuje się jako wsparcie środowiskowe.",
                "response": "Jak najbardziej! Deinstytucjonalizacja to właśnie rozwój usług świadczonych na poziomie społeczności lokalnej (Kluby Seniora, CUS, opieka domowa) jako alternatywa dla opieki całodobowej w DPS.",
                "responder_name": "dr Piotr Adamski (Ekspert ROPS)",
                "is_answered": True,
                "is_public_faq": True,
            },
        )

        # 8. Przykładowy wniosek grantowy FERS (Moduł III) do oceny na żywo w panelu Admina
        IdeaSubmission.objects.get_or_create(
            title="Sąsiedzka Sieć Wytchnieniowa – Mobilni wolontariusze wsparcia seniora",
            defaults={
                "submission_type": "grant_fers",
                "persona_key": "katarzyna_zielinska",
                "status": "w_ocenie",
                "category": categories_map["seniors"],
                "county": counties_map["tarnowski"],
                "applicant_type": "podmiot_ngo",
                "applicant_name": "Fundacja Aktywna Małopolska",
                "applicant_email": "kontakt@aktywna-malopolska.pl",
                "applicant_phone": "14 621 00 00",
                "applicant_address": "ul. Krakowska 12",
                "applicant_city": "Tarnów",
                "applicant_postal_code": "33-100",
                "organization_krs": "0000123456",
                "organization_nip": "9930012345",
                "organization_regon": "123456789",
                "organization_representative": "Katarzyna Zielińska - Prezes Zarządu",
                "innovation_description": "Stworzenie aplikacji i procedury szybkiego wzywania przeszkolonych sąsiadów do doraźnej opieki wytchnieniowej.",
                "uniqueness_rationale": "Tradycyjne agencje opieki są za drogie i nie docierają do małych sołectw. Nasz model opiera się na mikrostypendiach samopomocowych.",
                "problem_diagnosis": "Oparte na Mapie Wyzwań ROPS dla powiatu tarnowskiego (24.2% seniorów).",
                "target_recipients": "30 opiekunów rodzinnych osób niesamodzielnych.",
                "expected_change": "Zmniejszenie obciążenia psychofizycznego opiekunów o min. 40%.",
                "scalability_model": "Możliwość łatwej replikacji w każdym CUS w Małopolsce.",
                "action_plan_prep": [
                    {"dzialanie": "Opracowanie standardu bezpieczeństwa i regulaminu", "termin": "Miesiąc 1-2", "koszt": 8000},
                    {"dzialanie": "Warsztaty pierwszej pomocy dla wolontariuszy", "termin": "Miesiąc 3", "koszt": 6000},
                ],
                "action_plan_testing": [
                    {"dzialanie": "Pilotaż u 30 rodzin w 3 gminach wiejskich", "termin": "Miesiące 4-9", "koszt": 34000},
                    {"dzialanie": "Ewaluacja i raport końcowy", "termin": "Miesiące 10-12", "koszt": 2000},
                ],
                "requested_grant_amount": Decimal("50000.00"),
                "team_experience": "10 lat doświadczenia w realizacji projektów społecznych FERS i ASOS w Małopolsce.",
                "formal_declarations_accepted": True,
            },
        )

        # 9. Przykładowy pakiet Middlemana dla CUS Myślenice (Moduł VII)
        MiddlemanPackage.objects.get_or_create(
            municipality_name="Myślenice",
            defaults={
                "innovation": innovations_map["bawita-tablica-sensoryczna"],
                "county": counties_map["myslenicki"],
                "municipality_type": "miejsko-wiejska",
                "population": 45000,
                "has_cus": True,
                "execution_model": "hybrydowy",
                "service_name": "Gminny Program Aktywizacji Sensorycznej BaWita dla seniorów CUS Myślenice",
                "service_standard": "Mobilne sesje sensoryczne u 40 seniorów z terenu miasta i 16 sołectw gminy Myślenice.",
                "staffing_requirements": [
                    {"role": "Koordynator Usług CUS", "allocation": "0.5 etatu", "qualifications": "Certyfikat koordynatora CUS"},
                    {"role": "Mobilny Animator Terapii", "allocation": "1.0 etat", "qualifications": "Terapia zajęciowa"},
                ],
                "cost_breakdown": {
                    "annual_total_pln": 75000,
                    "staff_compensation_pln": 48750,
                    "materials_and_innovation_license_pln": 15000,
                    "operational_and_travel_pln": 11250,
                },
                "funding_sources": [
                    {"source": "Program FERS Działanie 5.1 (Grant wdrożeniowy ROPS)", "percentage": 70, "amount_pln": 52500},
                    {"source": "Budżet Gminy Myślenice (wkład CUS)", "percentage": 15, "amount_pln": 11250},
                    {"source": "PFRON (Program wyrównywania różnic)", "percentage": 15, "amount_pln": 11250},
                ],
                "implementation_steps": [
                    {"month": "Miesiąc 1", "step": "Zatwierdzenie zmiany w Programie Usług Społecznych CUS Myślenice."},
                    {"month": "Miesiąc 2", "step": "Dostawa 4 zestawów BaWita i szkolenie kadry w ROPS Kraków."},
                    {"month": "Miesiące 3-6", "step": "Realizacja 240 sesji mobilnych u mieszkańców i raport ewaluacyjny."},
                ],
            },
        )

        self.stdout.write(self.style.SUCCESS("Pomyślnie zasilono bazę danych pełnym zestawem danych demonstracyjnych ROPS Kraków!"))
