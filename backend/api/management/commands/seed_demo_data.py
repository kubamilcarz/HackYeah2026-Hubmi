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

        # 3. Autentyczne Innowacje Społeczne ROPS Kraków (22 innowacje w 9 kategoriach)
        innovations_data = [
            # Kategoria 1: Dla seniorów
            {
                "title": "BaWita – Mobilna sensoryczna tablica aktywizująca",
                "slug": "bawita-tablica-sensoryczna",
                "category": categories_map["seniors"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "produkt",
                "short_summary": "Przenośny zestaw stymulacji sensorycznej i pamięciowej dla seniorów i osób z chorobami otępiennymi w placówkach i środowisku domowym.",
                "full_description": (
                    "BaWita to innowacyjny zestaw modułowych elementów sensoryczno-manualnych, zaprojektowany z myślą o osobach "
                    "z otępieniem, chorobą Alzheimera oraz seniorach doświadczających izolacji. Został opracowany przez zespół terapeutyczny "
                    "Inkubatora ROPS Kraków. Może być transportowany w poręcznej walizce do domu podopiecznego lub świetlicy wiejskiej przez asystenta CUS."
                ),
                "target_audience": "Seniorzy 65+, osoby z chorobami otępiennymi, opiekunowie rodzinni, kadra CUS",
                "implementation_guide": (
                    "Krok 1: Zamówienie certyfikowanego zestawu od producenta społecznego.\n"
                    "Krok 2: 4-godzinny instruktaż opiekunów i asystentów CUS.\n"
                    "Krok 3: Włączenie tablicy w harmonogram wizyt domowych (2-3 razy w tygodniu po 45 min)."
                ),
                "video_url": "https://www.youtube.com/watch?v=o7UhDlebLJo",
                "video_transcript": (
                    "[Czas 0:00 - 0:45] Lektor: Prezentujemy BaWita – zestaw sensoryczny opracowany w Małopolskim Inkubatorze Innowacji Społecznych ROPS Kraków. "
                    "Widzimy drewnianą tablicę z bezpiecznymi elementami manipulacyjnymi: zamki, przełączniki, labirynty dotykowe.\n"
                    "[Czas 0:45 - 1:30] Terapeuta zajęciowy: Narzędzie pozwala na ćwiczenie motoryki małej i pobudzanie wspomnień u osób z zaawansowaną demencją bez konieczności opuszczania domu.\n"
                    "[Czas 1:30 - 2:00] Podsumowanie: Zestaw jest lekki, w pełni zmywalny i bezpieczny zgodnie z normami medycznymi WCAG i PFRON."
                ),
                "handbook_pdf_url": "/documents/podrecznik_bawita_rops.pdf",
                "author_name": "Maria Lorenc i Maciej Parol",
                "author_organization": "Fundacja Rozwoju Terapii Zajęciowej (Nowy Sącz)",
                "author_email": "kontakt@bawita-innowacje.pl",
                "replication_readiness_score": 95,
                "tags": ["seniorzy", "demencja", "terapia sensoryczna", "opieka domowa", "CUS", "wieś"],
                "likes_count": 58,
                "matches_count": 39,
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
                    "w bezpieczny sposób rozmawiać o trudnych emocjach, stracie i samotności, jednocześnie budując nowe relacje sąsiedzkie w klubach seniora i sołectwach."
                ),
                "target_audience": "Samotni seniorzy, kluby seniora, koła gospodyń wiejskich, wolontariusze",
                "implementation_guide": "Szkolenie lidera klubu seniora trwa 1 dzień. Zestaw gry zawiera planszę, karty pytań, żetony relacji i podręcznik facylitatora.",
                "video_url": "https://www.youtube.com/watch?v=o5TP10ZStNA",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[Czas 0:00 - 0:30] Facylitator: Witamy na międzypokoleniowej rozgrywce Senior CUDER. Uczestnicy losują kartę z obszaru 'Emocje'.\n"
                    "[Czas 0:30 - 1:15] Uczestniczka (72 lata): 'Co dodaje mi otuchy w trudnym dniu? Rozmowa z sąsiadką i chwila przy herbacie.' Grupa dzieli się swoimi doświadczeniami.\n"
                    "[Czas 1:15 - 2:00] Podsumowanie: Gra nie tworzy rywalizacji, lecz przestrzeń głębokiego wzajemnego zrozumienia i przełamywania izolacji w sołectwach."
                ),
                "handbook_pdf_url": "/documents/przewodnik_senior_cuder.pdf",
                "author_name": "dr Danuta Wieczorek",
                "author_organization": "Stowarzyszenie Dialog Społeczny",
                "author_email": "cuder@innowacje-rops.pl",
                "replication_readiness_score": 96,
                "tags": ["samotność", "integracja", "gra planszowa", "klub seniora", "zdrowie psychiczne"],
                "likes_count": 89,
                "matches_count": 55,
            },
            {
                "title": "Ścieżka motosensoryczna dla seniorów",
                "slug": "sciezka-motosensoryczna",
                "category": categories_map["seniors"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "produkt",
                "short_summary": "Plenerowy tor równoważno-sensoryczny redukujący ryzyko upadków i aktywizujący osoby 65+ na terenach wiejskich.",
                "full_description": (
                    "Innowacyjny tor przeszkód z poręczami asekuracyjnymi i podłożami o zróżnicowanej fakturze (otoczaki, drewno, kora, maty akupresurowe). "
                    "Instalowany przy klubach seniora, świetlicach wiejskich i parkach gminnych. Poprawia propriocepcję i koordynację ruchową seniorów."
                ),
                "target_audience": "Seniorzy 65+, osoby z zaburzeniami równowagi, domy pomocy społecznej, samorządy",
                "implementation_guide": "Montaż certyfikowanego toru plenerowego na podłożu trawiastym lub mineralnym wraz z tablicami instruktażowymi ćwiczeń.",
                "video_url": "https://www.youtube.com/watch?v=4DKP0XK440U",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:40] Fizjoterapeuta: Prezentujemy plenerową ścieżkę motosensoryczną zaprojektowaną z myślą o bezpieczeństwie osób starszych.\n"
                    "[0:40 - 1:20] Demonstracja: Seniorzy pokonują bezpiecznie kolejne moduły, ćwicząc stabilność stawów skokowych i kolanowych pod okiem instruktora.\n"
                    "[1:20 - 2:00] Wyniki badań: Regularny trening 2 razy w tygodniu zmniejsza częstość upadków u uczestników o 42%."
                ),
                "handbook_pdf_url": "/documents/podrecznik_bawita_rops.pdf",
                "author_name": "Zespół Terapeutyczny Senior Plus",
                "author_organization": "Małopolskie Towarzystwo Krzewienia Kultury Fizycznej",
                "author_email": "kontakt@seniorplus-malopolska.pl",
                "replication_readiness_score": 91,
                "tags": ["seniorzy", "aktywność fizyczna", "profilaktyka upadków", "sensoryka", "plener"],
                "likes_count": 42,
                "matches_count": 27,
            },

            # Kategoria 2: Dla dzieci, młodzieży i rodziny
            {
                "title": "Organizator Społeczności Lokalnej (OSL) w CUS",
                "slug": "organizator-spolecznosci-lokalnej-cus",
                "category": categories_map["youth_family"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "usluga",
                "short_summary": "Metoda animacji sąsiedzkiej aktywizująca mieszkańców do samopomocy, tworzenia klubów rodzica i lokalnych grup wsparcia.",
                "full_description": (
                    "Model wdrożony i przetestowany m.in. w Centrum Usług Społecznych w Myślenicach. Zamiast czekać na zgłoszenia zasiłkowe, "
                    "organizator wychodzi w teren, mapuje potencjał sołectw i wspiera powstawanie oddolnych inicjatyw rodzinnych i sąsiedzkich."
                ),
                "target_audience": "Mieszkańcy gmin wiejskich i małych miast, samorządy, liderzy lokalni, rodziny z dziećmi",
                "implementation_guide": "Standard procedur dla CUS, opisy stanowisk pracy i zestaw narzędzi mapowania zasobów sołeckich.",
                "video_url": "https://www.youtube.com/watch?v=hohm7FnsukY",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:45] OSL Marek Wiśniewski: Witamy w Myślenicach. Rola Organizatora Społeczności Lokalnej polega na słuchaniu mieszkańców w ich naturalnym środowisku.\n"
                    "[0:45 - 1:30] Ujęcia z sołectwa: Mieszkańcy organizują wspólnie przestrzeń dla dzieci i punkt wymiany książek.\n"
                    "[1:30 - 2:00] Marek Wiśniewski: CUS daje impuls i ubezpieczenie, a mieszkańcy tworzą trwałą sieć samopomocy."
                ),
                "handbook_pdf_url": "/documents/standard_osl_rops.pdf",
                "author_name": "Marek Wiśniewski i Zespół ROPS",
                "author_organization": "Centrum Usług Społecznych w Myślenicach",
                "author_email": "cus@myslenice.pl",
                "replication_readiness_score": 98,
                "tags": ["CUS", "animacja", "samorząd", "JST", "samopomoc", "sołectwo", "rodzina"],
                "likes_count": 121,
                "matches_count": 72,
            },
            {
                "title": "koMIX życiowy – Narzędzie dialogu z młodzieżą w kryzysie",
                "slug": "komix-zyciowy",
                "category": categories_map["youth_family"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "metoda",
                "short_summary": "Karty komiksowe ułatwiające pedagogom i psychologom rozmowę z nastolatkami o emocjach, depresji i uzależnieniach.",
                "full_description": (
                    "koMIX życiowy to seria autorskich kart graficznych przedstawiających realistyczne dylematy dorastania. "
                    "Młodzież poprzez metafory komiksowe otwiera się na rozmowę o presji rówieśniczej, hejcie w internecie, "
                    "samotności oraz konfliktach rodzinnych, przełamując opór przed tradycyjną poradą psychologiczną."
                ),
                "target_audience": "Młodzież 12-19 lat, pedagodzy szkolni, psycholodzy, placówki wsparcia dziennego",
                "implementation_guide": "Zestaw 40 kart komiksowych wraz ze scenariuszami 60-minutowych warsztatów profilaktycznych i indywidualnych.",
                "video_url": "https://www.youtube.com/watch?v=hohm7FnsukY",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:40] Psycholog: koMIX życiowy to seria autorskich kart narracyjnych przygotowanych z myślą o młodzieży przeżywającej kryzysy tożsamości.\n"
                    "[0:40 - 1:20] Warsztat: Młodzież układa alternatywne zakończenia komiksowych kadrów, otwierając się na rozmowę z pedagogiem szkolnym.\n"
                    "[1:20 - 2:00] Podsumowanie: Narzędzie przetestowane w 15 szkołach i placówkach opiekuńczych Małopolski."
                ),
                "handbook_pdf_url": "/documents/standard_osl_rops.pdf",
                "author_name": "Joanna Radko i Magdalena Kruk",
                "author_organization": "Fundacja Po Drugie",
                "author_email": "kontakt@podrugie.pl",
                "replication_readiness_score": 93,
                "tags": ["młodzież", "zdrowie psychiczne", "komiks", "szkoła", "pedagogika", "kryzys"],
                "likes_count": 64,
                "matches_count": 33,
            },
            {
                "title": "Edki – Kredki terapeutyczne i stymulacja motoryki małej",
                "slug": "edki-kredki-terapeutyczne",
                "category": categories_map["youth_family"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "produkt",
                "short_summary": "Ergonomiczne, sensoryczne przybory grafomotoryczne dla dzieci z trudnościami manualnymi i zaburzeniami napięcia.",
                "full_description": (
                    "Edki to unikalne kredki w kształcie ergonomicznych kamyków sensorycznych. Wymuszają prawidłowy chwyt trójpunktowy "
                    "bez wywoływania bólu mięśni dłoni. Opracowane we współpracy z terapeutami integracji sensorycznej z Małopolski."
                ),
                "target_audience": "Dzieci w wieku przedszkolnym i wczesnoszkolnym, poradnie psychologiczno-pedagogiczne, przedszkola integracyjne",
                "implementation_guide": "Wdrożenie zestawu kredek wraz z kartami ćwiczeń grafomotorycznych w zajęciach wychowania przedszkolnego.",
                "video_url": "https://www.youtube.com/watch?v=ev173g-d_vA",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:40] Terapeuta integracji sensorycznej: Edki to innowacyjny zestaw kredek o ergonomicznym, trójwymiarowym kształcie kamieni sensorycznych.\n"
                    "[0:40 - 1:20] Prezentacja: Dzieci z zaburzeniami napięcia mięśniowego intuicyjnie chwytają kredki w prawidłowy sposób bez bólu dłoni.\n"
                    "[1:20 - 2:00] Efekt: Poprawa sprawności grafomotorycznej przed rozpoczęciem nauki w szkole."
                ),
                "handbook_pdf_url": "/documents/instrukcja_merkury.pdf",
                "author_name": "Pracownia Terapeutyczna Kredka",
                "author_organization": "Spółdzielnia Socjalna Twórczy Rozwój",
                "author_email": "edki@tworczyrozwoj.pl",
                "replication_readiness_score": 89,
                "tags": ["dzieci", "motoryka mała", "terapia", "integracja sensoryczna", "przedszkole"],
                "likes_count": 47,
                "matches_count": 21,
            },
            {
                "title": "Hop Hop – Mobilny plac zabaw i integracji wiejskiej",
                "slug": "hop-hop-mobilny-plac-zabaw",
                "category": categories_map["youth_family"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "usluga",
                "short_summary": "Mobilny zestaw gier plenerowych i animacji dojeżdżający do sołectw pozbawionych placów zabaw i świetlic.",
                "full_description": (
                    "Mobilne centrum rekreacji docierające do małych sołectw w Małopolsce w specjalnie wyposażonym busie. "
                    "Umożliwia organizację integracyjnych pikników, gier podwórkowych i warsztatów plastycznych dla rodzin z dziećmi."
                ),
                "target_audience": "Dzieci i rodziny z terenów wiejskich, sołtysi, koła gospodyń wiejskich, ośrodki kultury",
                "implementation_guide": "Pakiet logistyczny dla gminnego ośrodka kultury: harmonogram objazdowy, zestaw 20 gier drewnianych i szkolenie animatorów.",
                "video_url": "https://www.youtube.com/watch?v=kE9lpr4OJPQ",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:40] Koordynator: Projekt Hop Hop dociera z mobilnym sprzętem rekreacyjno-animacyjnym do wsi pozbawionych placów zabaw.\n"
                    "[0:40 - 1:20] Ujęcia z sołectwa: Dzieci i rodzice wspólnie uczestniczą w bezpiecznych grach drewnianych i warsztatach kreatywnych.\n"
                    "[1:20 - 2:00] Podsumowanie: Budowanie więzi sąsiedzkich i bezpieczna przestrzeń rozwoju dla najmłodszych."
                ),
                "handbook_pdf_url": "/documents/standard_osl_rops.pdf",
                "author_name": "Stowarzyszenie Twórczych Inicjatyw Społecznych",
                "author_organization": "Lokalna Grupa Działania Przyjazna Ziemia",
                "author_email": "hophop@inicjatywylokalne.pl",
                "replication_readiness_score": 92,
                "tags": ["dzieci", "wieś", "animacja", "mobilny plac zabaw", "rodzina"],
                "likes_count": 55,
                "matches_count": 29,
            },

            # Kategoria 3: Dla osób o ograniczonej mobilności
            {
                "title": "Modularne łazienki dostępne – Szybki pakiet adaptacyjny",
                "slug": "modularne-lazienki-dostepne",
                "category": categories_map["mobility"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "produkt",
                "short_summary": "System bezinwazyjnych, demontowalnych uchwytów i podestów likwidujących bariery w wiejskich domach seniorów.",
                "full_description": (
                    "Wielu seniorów w Małopolsce mieszka w domach z głębokimi wannami i wysokimi progami. Modularny pakiet pozwala "
                    "w 3 godziny przekształcić łazienkę bez kucia płytek i kosztownych remontów, z możliwością późniejszego przeniesienia lub zwrotu do CUS."
                ),
                "target_audience": "Osoby o ograniczonej mobilności, poruszające się o kulach lub wózkach, seniorzy 70+",
                "implementation_guide": "Montaż przez gminnego konserwatora lub wolontariusza NGO na podstawie prostego szablonu miarowego w czasie do 3 godzin.",
                "video_url": "https://www.youtube.com/watch?v=Pl5bkpxEqgs",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:45] Inżynier: Prezentujemy modułowy system bezinwazyjnej adaptacji łazienek dla osób poruszających się o kulach i wózkach.\n"
                    "[0:45 - 1:30] Montaż: Regulowane uchwyty i stopnie montowane są w 3 godziny bez kucia kafli i niszczenia ścian.\n"
                    "[1:30 - 2:00] Podsumowanie: Sprawdzone rozwiązanie certyfikowane w programie Dostępność Plus."
                ),
                "handbook_pdf_url": "/documents/katalog_lazienki_dostepne.pdf",
                "author_name": "Inż. Andrzej Mazur",
                "author_organization": "Fundacja Architektura Bez Barier",
                "author_email": "kontakt@dostepnelazienki.pl",
                "replication_readiness_score": 94,
                "tags": ["łazienka", "dostępność", "mieszkanie", "senior", "bariery architektoniczne"],
                "likes_count": 97,
                "matches_count": 48,
            },
            {
                "title": "Uniodzież – Odzież adaptacyjna dla osób na wózkach",
                "slug": "uniodziez",
                "category": categories_map["mobility"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "produkt",
                "short_summary": "Funkcjonalna odzież wierzchnia i przeciwdeszczowa z zapięciami magnetycznymi dostosowana do pozycji siedzącej.",
                "full_description": (
                    "Uniodzież rozwiązuje problem wychłodzenia i trudności ubierania się osób poruszających się na wózkach inwalidzkich. "
                    "Specjalny krój uniemożliwia wkręcanie się połów płaszcza w koła wózka, a zapięcia magnetyczne umożliwiają ubranie się jedną ręką."
                ),
                "target_audience": "Osoby na wózkach inwalidzkich, asystenci osobiści, domy pomocy społecznej",
                "implementation_guide": "Wzory krawieckie i specyfikacja materiałowa udostępnione na licencji otwartej dla spółdzielni socjalnych i zakładów aktywności zawodowej.",
                "video_url": "https://www.youtube.com/watch?v=hBY1SnqLXV0",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:40] Projektantka: Uniodzież to odzież wierzchnia skrojona anatomicznie do pozycji siedzącej na wózku inwalidzkim.\n"
                    "[0:40 - 1:20] Prezentacja: Zastosowanie innowacyjnych magnesów zamiast guzików pozwala na samodzielne ubranie się w mniej niż minutę.\n"
                    "[1:20 - 2:00] Rezultat: Komfort termiczny, ochrona przed wiatrem i pełne poczucie godności użytkownika."
                ),
                "handbook_pdf_url": "/documents/katalog_lazienki_dostepne.pdf",
                "author_name": "Monika Szpener",
                "author_organization": "Studio Projektowania Dostępnego",
                "author_email": "kontakt@uniodziez.pl",
                "replication_readiness_score": 88,
                "tags": ["wózek inwalidzki", "odzież adaptacyjna", "samodzielność", "dostępność"],
                "likes_count": 41,
                "matches_count": 18,
            },
            {
                "title": "Zakupy bez barier – System asysty mobilnej",
                "slug": "zakupy-bez-barier",
                "category": categories_map["mobility"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "usluga",
                "short_summary": "System wolontariatu asystenckiego i lekkich wózków schodowych ułatwiający zaopatrzenie seniorów z ograniczoną mobilnością.",
                "full_description": (
                    "Innowacyjna usługa koordynowana przez CUS lub lokalną parafię / OSP. Łączy wolontariuszy wyposażonych w ultralekkie wózki "
                    "ze schodołazem mechanicznym z mieszkańcami bloków bez wind i wiejskich domów na wzgórzach."
                ),
                "target_audience": "Seniorzy o ograniczonej sprawności ruchowej, osoby z niepełnosprawnością, opiekunowie",
                "implementation_guide": "Instrukcja wdrożenia usługi asystenckiej, zasady BHP dla wolontariuszy i wzory umów powierzenia.",
                "video_url": "https://www.youtube.com/watch?v=v2cD6yEJQos",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:40] Wolontariusz: Program łączy lokalne sklepy spożywcze z siecią asystentów mobilnych pomagających osobom o ograniczonej sprawności ruchowej.\n"
                    "[0:40 - 1:20] Przebieg usługi: Senior zgłasza potrzebę telefonicznie, a asystent przynosi zakupy lub towarzyszy w drodze do sklepu.\n"
                    "[1:20 - 2:00] Bezpieczeństwo i kontakt z drugim człowiekiem każdego dnia."
                ),
                "handbook_pdf_url": "/documents/standard_osl_rops.pdf",
                "author_name": "Małopolskie Forum Osób z Niepełnosprawnościami",
                "author_organization": "Stowarzyszenie Pomocna Dłoń",
                "author_email": "pomocnadlon@malopolska.pl",
                "replication_readiness_score": 91,
                "tags": ["zakupy", "asystent", "mobilność", "wsparcie codzienne", "seniorzy"],
                "likes_count": 52,
                "matches_count": 26,
            },

            # Kategoria 4: Dla osób z niepełnosprawnością sensoryczną
            {
                "title": "Strażnik – Osobisty asystent dźwiękowy dla niesłyszących",
                "slug": "straznik",
                "category": categories_map["sensory"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "technologia",
                "short_summary": "Opaska wibracyjna i aplikacja mobilna rozpoznająca kluczowe dźwięki otoczenia (dzwonek, syrena, klakson, alarm).",
                "full_description": (
                    "Strażnik to inteligentny system ostrzegania dla osób niesłyszących i słabosłyszących. "
                    "Opaska wibrująca z mikrofonem kierunkowym analizuje częstotliwości dźwiękowe i informuje użytkownika "
                    "o sygnałach alarmowych, dzwonku do drzwi czy płaczu dziecka, drastycznie podnosząc bezpieczeństwo w domu i przestrzeni publicznej."
                ),
                "target_audience": "Osoby głuche i słabosłyszące, seniorzy z ubytkiem słuchu, instytucje publiczne",
                "implementation_guide": "Konfiguracja opaski przez Bluetooth z aplikacją mobilną z gotową biblioteką 18 predefiniowanych dźwięków domowych.",
                "video_url": "https://www.youtube.com/watch?v=zYVr0zMAqWE",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:40] Twórca: Strażnik to inteligentna opaska wibrująca z mikrofonem kierunkowym wykrywająca krytyczne dźwięki otoczenia.\n"
                    "[0:40 - 1:20] Demonstracja: W momencie wykrycia dzwonka do drzwi, klaksonu czy syreny alarmowej opaska wibruje ze zróżnicowaną pulsacją.\n"
                    "[1:20 - 2:00] Podsumowanie: Zapewnia poczucie bezpieczeństwa w domu i na ulicy osobom niesłyszącym i niedosłyszącym."
                ),
                "handbook_pdf_url": "/documents/instrukcja_merkury.pdf",
                "author_name": "Zespół Inżynierii Społecznej AGH i ROPS",
                "author_organization": "Politechnika Krakowska & AGH",
                "author_email": "straznik@agh.edu.pl",
                "replication_readiness_score": 93,
                "tags": ["niesłyszący", "opaska", "bezpieczeństwo", "technologia", "sensoryka"],
                "likes_count": 78,
                "matches_count": 41,
            },
            {
                "title": "Hear IT – Kursy programowania i cyfryzacji w PJM",
                "slug": "hear-it",
                "category": categories_map["sensory"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "narzedzie_cyfrowe",
                "short_summary": "Dostępna platforma e-learningowa prowadzona w Polskim Języku Migowym przygotowująca głuchych do pracy w IT.",
                "full_description": (
                    "Hear IT przełamuje barierę językową w kształceniu zawodowym. Oferuje kursy testowania oprogramowania, "
                    "analizy danych i tworzenia stron www z wykładami natywnych głuchych lektorów PJM oraz napisami dla niesłyszących."
                ),
                "target_audience": "Osoby głuche i słabosłyszące, pracodawcy z branży technologicznej, fundacje aktywizacji zawodowej",
                "implementation_guide": "Dostęp do platformy przez przeglądarkę internetową, moduł mentoringu w PJM i certyfikacja umiejętności.",
                "video_url": "https://www.youtube.com/watch?v=uDLOSoCb3E8",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:45] Lektor w Polskim Języku Migowym: Hear IT to platforma szkoleniowa IT tłumaczona w całości na PJM z napisami rozszerzonymi.\n"
                    "[0:45 - 1:30] Kursant: Uczymy się testowania oprogramowania i podstaw programowania frontendowego bez barier komunikacyjnych.\n"
                    "[1:30 - 2:00] Sukces: Ponad 60 absolwentów znalazło stałe zatrudnienie w firmach technologicznych."
                ),
                "handbook_pdf_url": "/documents/instrukcja_merkury.pdf",
                "author_name": "Fundacja Edukacji Niesłyszących",
                "author_organization": "Inkubator Dostępności Cyfrowej",
                "author_email": "kontakt@hearit-pjm.pl",
                "replication_readiness_score": 95,
                "tags": ["PJM", "głusi", "IT", "edukacja", "dostępność cyfrowa", "zatrudnienie"],
                "likes_count": 83,
                "matches_count": 46,
            },
            {
                "title": "NGOZ – Dźwiękowy nawigator przestrzeni publicznej",
                "slug": "ngoz",
                "category": categories_map["sensory"],
                "maturity_stage": "testy",
                "innovation_type": "technologia",
                "short_summary": "System mikronadajników radiowych i audiodeskrypcji ułatwiający niewidomym poruszanie się po urzędach i przychodniach.",
                "full_description": (
                    "Nawigator Głosowy Obiektów Zamkniętych (NGOZ) instalowany jest w budynkach użyteczności publicznej. "
                    "Po wejściu do urzędu aplikacja w telefonie niewidomego odczytuje wskazówki przestrzenne i prowadzi do pokoju lub windy."
                ),
                "target_audience": "Osoby niewidome i słabowidzące, urzędy gmin, szpitale, biblioteki",
                "implementation_guide": "Instalacja beaconów BLE w ciągach komunikacyjnych obiektu i wprowadzenie mapy audiodeskrypcyjnej.",
                "video_url": "https://www.youtube.com/watch?v=ZiGxSX-VRfg",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:40] Ekspert ds. dostępności: System NGOZ wykorzystuje mikronadajniki radiowe montowane w urzędach gmin i przychodniach.\n"
                    "[0:40 - 1:20] Nawigacja: Smartfon osoby niewidomej odczytuje audiodeskrypcję otoczenia i prowadzi krok po kroku do odpowiedniego okienka.\n"
                    "[1:20 - 2:00] Pełna niezależność osób z dysfunkcją wzroku w budynkach publicznych."
                ),
                "handbook_pdf_url": "/documents/instrukcja_merkury.pdf",
                "author_name": "dr inż. Paweł Kowalczyk",
                "author_organization": "Politechnika Krakowska & ROPS",
                "author_email": "ngoz@innowacjespoleczne.pl",
                "replication_readiness_score": 87,
                "tags": ["niewidomi", "audiodeskrypcja", "nawigacja", "urząd gminy", "dostępność"],
                "likes_count": 49,
                "matches_count": 22,
            },

            # Kategoria 5: Dla zdrowia i medycyny
            {
                "title": "Paszport pacjenta z chorobą rzadką",
                "slug": "paszport-pacjenta-z-choroba-rzadka",
                "category": categories_map["health"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "narzedzie_cyfrowe",
                "short_summary": "Karta ratunkowa i profil cyfrowy z kodem QR skracający czas diagnozy i ratujący życie w Szpitalnym Oddziale Ratunkowym.",
                "full_description": (
                    "Pacjenci z chorobami rzadkimi w sytuacji nagłego zagrożenia życia często otrzymują niewłaściwe leki na SOR. "
                    "Paszport Pacjenta zawiera zweryfikowany przez klinikę protokół postępowania ratunkowego, listę leków zakazanych "
                    "oraz bezpośredni telefon całodobowy do lekarza prowadzącego."
                ),
                "target_audience": "Osoby z chorobami rzadkimi i przewlekłymi, zespoły ratownictwa medycznego, szpitale",
                "implementation_guide": "Rejestracja pacjenta w systemie przez lekarza specjalistę, wydanie wodoodpornej karty z chipem NFC i kodem QR.",
                "video_url": "https://www.youtube.com/watch?v=7QedTbxzsPk",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:40] Lekarz SOR: Przy chorobach rzadkich każda minuta ma kluczowe znaczenie. Paszport pacjenta w formie fizycznej karty z kodem QR daje natychmiastowy dostęp do protokołu ratunkowego.\n"
                    "[0:40 - 1:20] Bezpieczeństwo: Karta zawiera listę leków przeciwwskazanych i bezpośredni kontakt do kliniki specjalistycznej.\n"
                    "[1:20 - 2:00] Narzędzie ratujące życie wdrożone w małopolskich szpitalach."
                ),
                "handbook_pdf_url": "/documents/podrecznik_bawita_rops.pdf",
                "author_name": "dr n. med. Anna Jabłońska",
                "author_organization": "Krajowe Forum na Rzecz Terapii Chorób Rzadkich",
                "author_email": "paszport@chorobyrzadkie.pl",
                "replication_readiness_score": 96,
                "tags": ["zdrowie", "choroby rzadkie", "SOR", "karta ratunkowa", "medycyna"],
                "likes_count": 91,
                "matches_count": 53,
            },
            {
                "title": "Himalaje autyzmu – Protokół wizyt stomatologicznych i medycznych",
                "slug": "himalaje-autyzmu",
                "category": categories_map["health"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "metoda",
                "short_summary": "Standard adaptacyjny i wizualny przygotowujący dzieci w spektrum autyzmu do zabiegów stomatologicznych bez narkozy.",
                "full_description": (
                    "Metoda oparta na desensytyzacji sensorycznej. Dziecko przed zabiegiem otrzymuje książeczkę obrazkową, "
                    "nagrania dźwięków wiertła i ssaka do odsłuchania w domu oraz odbywa krótką wizytę adaptacyjną. "
                    "Pozwala na bezstresowe leczenie zębów bez konieczności niebezpiecznej narkozy ogólnej."
                ),
                "target_audience": "Dzieci i dorośli w spektrum autyzmu, gabinety stomatologiczne, przychodnie POZ",
                "implementation_guide": "Pakiet szkoleniowy dla personelu medycznego, piktogramy gabinetowe i słuchawki wygłuszające.",
                "video_url": "https://www.youtube.com/watch?v=q31uQ435YAo",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:45] Stomatolog: Wizyta u dentysty bywa dla dziecka w spektrum autyzmu traumatycznym przeżyciem z powodu nadwrażliwości sensorycznej na światło i dźwięk.\n"
                    "[0:45 - 1:30] Metoda: Protokół Himalaje Autyzmu to 5-etapowy proces oswajania gabinetu z użyciem słuchawek wygłuszających i kart wizualnych.\n"
                    "[1:30 - 2:00] Efekt: 85% dzieci udaje się wyleczyć bez znieczulenia ogólnego i hospitalizacji."
                ),
                "handbook_pdf_url": "/documents/podrecznik_bawita_rops.pdf",
                "author_name": "Fundacja Odnaleźć Siebie",
                "author_organization": "Wojewódzka Przychodnia Stomatologiczna w Krakowie",
                "author_email": "kontakt@odnalezcsiebie.pl",
                "replication_readiness_score": 94,
                "tags": ["autyzm", "spektrum", "stomatologia", "sensoryka", "dzieci"],
                "likes_count": 68,
                "matches_count": 35,
            },
            {
                "title": "Gra o zdrowie – Readaptacja po kryzysie psychicznym",
                "slug": "gra-o-zdrowie",
                "category": categories_map["health"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "metoda",
                "short_summary": "Warsztatowe narzędzie wspierające osoby po kryzysach psychotycznych w planowaniu powrotu do aktywności i pracy.",
                "full_description": (
                    "Gra o zdrowie to metoda opracowana przez psychologów i osoby z doświadczeniem kryzysu psychicznego (ekspertów przez doświadczenie). "
                    "Uczy monitorowania wczesnych symptomów pogorszenia samopoczucia, budowania sieci oparcia i planowania realnych celów zawodowych."
                ),
                "target_audience": "Osoby po hospitalizacjach psychiatrycznych, środowiskowe centra zdrowia psychicznego, rodziny",
                "implementation_guide": "Podręcznik trenera, zestaw kart zasobów i plan kryzysowy (WRAP) do wypełnienia z asystentem zdrowienia.",
                "video_url": "https://www.youtube.com/watch?v=YRzg98fveHc",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:40] Psychoterapeutka: Gra o zdrowie to narzędzie warsztatowe wspierające osoby po hospitalizacji psychiatrycznej w powrocie do ról społecznych.\n"
                    "[0:40 - 1:20] Warsztat: Uczestnicy w bezpiecznej atmosferze planują małe kroki: wyjście do sklepu, kontakt ze znajomym, wizytę w urzędzie pracy.\n"
                    "[1:20 - 2:00] Odbudowa poczucia własnej wartości i zapobieganie nawrotom kryzysu."
                ),
                "handbook_pdf_url": "/documents/przewodnik_senior_cuder.pdf",
                "author_name": "Stowarzyszenie Otwórzcie Drzwi",
                "author_organization": "Środowiskowe Centrum Zdrowia Psychicznego w Krakowie",
                "author_email": "otworzciedrzwi@krakow.pl",
                "replication_readiness_score": 90,
                "tags": ["zdrowie psychiczne", "kryzys", "readaptacja", "psychiatria środowiskowa", "grupa wsparcia"],
                "likes_count": 59,
                "matches_count": 31,
            },

            # Kategoria 6: Dla rynku pracy
            {
                "title": "Kawiarenka Naprawcza – Międzypokoleniowy punkt wymiany umiejętności",
                "slug": "kawiarenka-naprawcza",
                "category": categories_map["labor"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "metoda",
                "short_summary": "Otwarte warsztaty, gdzie seniorzy-majsterkowicze uczą młodzież naprawy sprzętu, budując relacje i redukując odpady.",
                "full_description": (
                    "Kawiarenka Naprawcza (Repair Cafe) łączy cele ekologiczne z włączeniem społecznym i reintegracją zawodową. Seniorzy "
                    "odyskują poczucie sprawczości, a młodzież zdobywa praktyczne kompetencje techniczne i rzemieślnicze pod okiem mentorów."
                ),
                "target_audience": "Seniorzy rzemieślnicy, młodzież szkolna, rodziny z dziećmi, samorządy",
                "implementation_guide": "Zestaw narzędzi w skrzynce, regulamin BHP punktu naprawczego i wzory plakatów promocyjnych.",
                "video_url": "https://www.youtube.com/watch?v=sample_kawiarenka",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:45] Katarzyna Zielińska: Kawiarenka Naprawcza to nie tylko serwis, to przede wszystkim spotkanie pokoleń przy stole warsztatowym.\n"
                    "[0:45 - 1:30] Senior instruuje nastolatka, jak wymienić bezpiecznik i przylutować kabel w zabytkowej lampce.\n"
                    "[1:30 - 2:00] Efekt: Sprzęt działa, a uczestnicy umawiają się na kolejne spotkanie w świetlicy wiejskiej."
                ),
                "handbook_pdf_url": "/documents/kawiarenka_naprawcza_poradnik.pdf",
                "author_name": "Katarzyna Zielińska",
                "author_organization": "Fundacja Aktywna Małopolska (Tarnów)",
                "author_email": "kontakt@aktywna-malopolska.pl",
                "replication_readiness_score": 92,
                "tags": ["naprawy", "majsterkowanie", "ekologia", "międzypokoleniowe", "NGO", "rynek pracy"],
                "likes_count": 76,
                "matches_count": 32,
            },
            {
                "title": "Agencja pracy incydentalnej dla osób po kryzysach",
                "slug": "agencja-pracy-incydentalnej",
                "category": categories_map["labor"],
                "maturity_stage": "testy",
                "innovation_type": "usluga",
                "short_summary": "Elastyczny model mikro-zleceń (2-4h) umożliwiający powrót na rynek pracy bez ryzyka utraty świadczeń rentowych.",
                "full_description": (
                    "Tradycyjny etat 8h bywa zbyt dużym obciążeniem dla osób wychodzących z kryzysów zdrowia psychicznego. "
                    "Agencja pracy incydentalnej oferuje krótkie, wspierane przez mentora zlecenia w administracji, ogrodnictwie i kulturze."
                ),
                "target_audience": "Osoby z orzeczeniem o niepełnosprawności, podopieczni CUS, lokalne firmy i JST",
                "implementation_guide": "Model organizacyjno-prawny mikro-zleceń dla spółdzielni socjalnych i centrów integracji społecznej.",
                "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:40] Koordynator zatrudnienia socjalnego: Tradycyjny etat bywa zbyt obciążający dla osób powracających do zdrowia po załamaniach psychicznych.\n"
                    "[0:40 - 1:20] Elastyczność: Nasza agencja oferuje zlecenia 2-3 godzinne przy archiwizacji i ogrodnictwie z opieką mentora.\n"
                    "[1:20 - 2:00] Bezpieczne wejście na rynek pracy z zachowaniem świadczeń rentowych."
                ),
                "handbook_pdf_url": "/documents/wzor_kalkulacji_rops.pdf",
                "author_name": "Spółdzielnia Socjalna Ostoja",
                "author_organization": "Regionalny Ośrodek Polityki Społecznej w Krakowie",
                "author_email": "ostoja@ekonomiaspoleczna.pl",
                "replication_readiness_score": 86,
                "tags": ["reintegracja", "praca", "ekonomia społeczna", "kryzys psychiczny", "CUS"],
                "likes_count": 44,
                "matches_count": 23,
            },
            {
                "title": "Konsultant ETR – Dostępna informacja publiczna",
                "slug": "konsultant-etr",
                "category": categories_map["labor"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "usluga",
                "short_summary": "Nowy zawód dla osób z niepełnosprawnością intelektualną jako certyfikowanych audytorów tekstów łatwych do czytania.",
                "full_description": (
                    "Samorzecznicy z niepełnosprawnością intelektualną zostają zatrudnieni w urzędach gmin i bibliotekach jako eksperci ETR. "
                    "Weryfikują pisma urzędowe, procedury i strony internetowe, upewniając się, że każdy mieszkaniec zrozumie treść decyzji."
                ),
                "target_audience": "Osoby z niepełnosprawnością intelektualną, urzędy gmin, instytucje publiczne",
                "implementation_guide": "Program 40-godzinnego szkolenia certyfikującego audytora tekstu łatwego do czytania (ETR) zgodnie ze standardami UE.",
                "video_url": "https://www.youtube.com/watch?v=BK6a8fjELR0",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:40] Samorzecznik: Razem z zespołem testujemy pisma urzędowe i strony internetowe, sprawdzając, czy są zrozumiałe dla każdego.\n"
                    "[0:40 - 1:20] Standard: Tłumaczymy skomplikowane decyzje administracyjne na tekst łatwy do czytania i rozumienia (Easy-to-Read).\n"
                    "[1:20 - 2:00] Gminy zatrudniają osoby z niepełnosprawnością jako certyfikowanych audytorów dostępności."
                ),
                "handbook_pdf_url": "/documents/instrukcja_merkury.pdf",
                "author_name": "Fundacja Rozwoju Dostępności",
                "author_organization": "Centrum Usług Społecznych & PFRON",
                "author_email": "etr@dostepnosc.org.pl",
                "replication_readiness_score": 94,
                "tags": ["ETR", "dostępność", "tekst łatwy do czytania", "samorzecznictwo", "urząd gminy"],
                "likes_count": 82,
                "matches_count": 45,
            },

            # Kategoria 7: Dla cudzoziemców
            {
                "title": "Health Guide PL – Przewodnik po opiece medycznej dla cudzoziemców",
                "slug": "health-guide-pl",
                "category": categories_map["foreigners"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "narzedzie_cyfrowe",
                "short_summary": "Wielojęzyczny asystent cyfrowy i piktograficzny informator po systemie POZ i NFZ dla migrantów i uchodźców.",
                "full_description": (
                    "Health Guide PL tłumaczy skomplikowane procedury publicznej opieki zdrowotnej w Polsce na język ukraiński, angielski i hiszpański. "
                    "Zawiera wzory dialogów z rejestracją, słownik dolegliwości i interaktywną mapę przychodni w Małopolsce świadczących pomoc bezpłatnie."
                ),
                "target_audience": "Cudzoziemcy, uchodźcy, pracownicy przychodni POZ, pracownicy socjalni CUS",
                "implementation_guide": "Udostępnienie aplikacji mobilnej oraz dystrybucja drukowanych przewodników piktograficznych w punktach informacyjnych gmin.",
                "video_url": "https://www.youtube.com/watch?v=7QedTbxzsPk",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:40] Koordynatorka integracji: Health Guide PL to wielojęzyczny asystent cyfrowy tłumaczący strukturę polskiego systemu zdrowia.\n"
                    "[0:40 - 1:20] Funkcjonalności: Aplikacja krok po kroku wyjaśnia, jak zapisać się do lekarza POZ, uzyskać e-receptę i wezwać pomoc w nocy.\n"
                    "[1:20 - 2:00] Ponad 12 000 rozwiązanych zapytań pacjentów w pierwszym roku działania."
                ),
                "handbook_pdf_url": "/documents/standard_osl_rops.pdf",
                "author_name": "Centrum Dialogu Wielokulturowego",
                "author_organization": "Fundacja Przestrzeń Wspólna",
                "author_email": "kontakt@healthguide.pl",
                "replication_readiness_score": 91,
                "tags": ["cudzoziemcy", "zdrowie", "migracja", "aplikacja", "POZ", "wielojęzyczność"],
                "likes_count": 67,
                "matches_count": 38,
            },
            {
                "title": "Dialog ponad kulturami – Mediacje sąsiedzkie i szkolne",
                "slug": "dialog-ponad-kulturami",
                "category": categories_map["foreigners"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "metoda",
                "short_summary": "Standard rozwiązywania nieporozumień lokatorskich i szkolnych z udziałem mediatora międzykulturowego w gminie.",
                "full_description": (
                    "Wzrost liczby obcokrajowców w Małopolsce rodzi wyzwania integracji sąsiedzkiej. Innowacja wprowadza funkcję mediatora międzykulturowego, "
                    "który w atmosferze zaufania pomaga rozwiązywać drobne spory dotyczące ciszy nocnej, zasad segregacji odpadów czy integracji w klasie szkolnej."
                ),
                "target_audience": "Mieszkańcy gmin, zarządcy nieruchomości, dyrektorzy szkół, cudzoziemcy",
                "implementation_guide": "Program 24-godzinnego szkolenia mediacyjnego dla pracowników socjalnych CUS i pedagogów szkolnych.",
                "video_url": "https://www.youtube.com/watch?v=o5TP10ZStNA",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:40] Mediatorka międzykulturowa: W społecznościach wielokulturowych drobne nieporozumienia językowe mogą prowadzić do izolacji i konfliktów sąsiedzkich.\n"
                    "[0:40 - 1:20] Warsztat: Model szkolenia asystentów integracji w sołectwach i szkołach uczy budowania porozumienia i wzajemnego szacunku.\n"
                    "[1:20 - 2:00] Rozwiązano ponad 80 spraw spornych w małopolskich gminach bez angażowania policji."
                ),
                "handbook_pdf_url": "/documents/przewodnik_senior_cuder.pdf",
                "author_name": "Stowarzyszenie Mosty Zrozumienia",
                "author_organization": "Ośrodek Mediacji Społecznej przy ROPS",
                "author_email": "mediacje@dialogkultur.pl",
                "replication_readiness_score": 89,
                "tags": ["mediacja", "cudzoziemcy", "integracja", "szkoła", "sąsiedztwo"],
                "likes_count": 48,
                "matches_count": 25,
            },

            # Kategoria 8: Dla osób w kryzysie bezdomności
            {
                "title": "Szlakiem ludzi bezdomnych – Mobilny punkt higieny i wsparcia",
                "slug": "szlakiem-ludzi-bezdomnych",
                "category": categories_map["homelessness"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "usluga",
                "short_summary": "Specjalistyczny ambulans oferujący doraźną pomoc medyczną, pralnię, czystą odzież i rozmowę ze streetworkerem.",
                "full_description": (
                    "Wielu ludzi w kryzysie bezdomności unika tradycyjnych schronisk i noclegowni z lęku przed odrzuceniem. "
                    "Mobilny punkt dociera na dworce, koczowiska i pustostany, oferując bezpieczną kąpiel, opatrunek pielęgniarski "
                    "oraz zaufany kontakt ze streetworkerem, otwierając drogę do powrotu do społeczeństwa."
                ),
                "target_audience": "Osoby w kryzysie bezdomności, streetworkerzy, ratownicy medyczni, samorządy",
                "implementation_guide": "Plan tras mobilnego punktu higienicznego, protokół sanitarny i zasady współpracy z patrolami straży miejskiej i policji.",
                "video_url": "https://www.youtube.com/watch?v=hohm7FnsukY",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:40] Streetworker: Wiele osób w kryzysie bezdomności obawia się wizyty w tradycyjnych placówkach pomocowych ze względu na wstyd.\n"
                    "[0:40 - 1:20] Mobilna pomoc: Ambulans zapewnia ciepły posiłek, czystą odzież, opatrunek pielęgniarski oraz rozmowę z psychologiem bezpośrednio w terenie.\n"
                    "[1:20 - 2:00] Pierwszy most do wyjścia z kryzysu i podjęcia terapii uzależnień."
                ),
                "handbook_pdf_url": "/documents/standard_osl_rops.pdf",
                "author_name": "Dzieło Pomocy św. Ojca Pio",
                "author_organization": "Krakowskie Porozumienie Pomocy Osobom Bezdomnym",
                "author_email": "kontakt@dzielopomocy.pl",
                "replication_readiness_score": 95,
                "tags": ["bezdomność", "streetworking", "higiena", "pomoc doraźna", "kryzys"],
                "likes_count": 92,
                "matches_count": 51,
            },
            {
                "title": "Ścieżka Feniksa – Ekologiczna readaptacja w gospodarstwie społecznym",
                "slug": "sciezka-feniksa",
                "category": categories_map["homelessness"],
                "maturity_stage": "testy",
                "innovation_type": "metoda",
                "short_summary": "Program readaptacji łączący mieszkalnictwo treningowe z pracą w wiejskim gospodarstwie permakulturowym.",
                "full_description": (
                    "Ścieżka Feniksa to kompleksowy program wychodzenia z długotrwałej bezdomności. Uczestnicy mieszkają w kameralnym "
                    "domu wiejskim, uczą się ekologicznej uprawy warzyw i hodowli zwierząt, zyskując poczucie bezpieczeństwa i sprawczości "
                    "z dala od destrukcyjnego środowiska wielkomiejskiego."
                ),
                "target_audience": "Osoby długotrwale bezdomne, centra integracji społecznej, organizacje pozarządowe",
                "implementation_guide": "Regulamin pobytu w gospodarstwie, 12-miesięczny harmonogram terapeutyczno-zawodowy i plan usamodzielnienia mieszkaniowego.",
                "video_url": "https://www.youtube.com/watch?v=4DKP0XK440U",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:40] Kierownik gospodarstwa: Ścieżka Feniksa łączy mieszkalnictwo treningowe z pracą w wiejskim gospodarstwie ekologicznym.\n"
                    "[0:40 - 1:20] Terapia przez pracę: Uczestnicy opiekują się zwierzętami, uprawiają warzywa i odbudowują poczucie sprawczości z dala od pokus.\n"
                    "[1:20 - 2:00] 70% uczestników po rocznym pobycie podejmuje samodzielne zatrudnienie i wynajmuje mieszkanie."
                ),
                "handbook_pdf_url": "/documents/wzor_kalkulacji_rops.pdf",
                "author_name": "Fundacja Odrodzenie",
                "author_organization": "Centrum Integracji Społecznej w Gorlicach",
                "author_email": "feniks@fundacjaodrodzenie.org",
                "replication_readiness_score": 87,
                "tags": ["bezdomność", "mieszkalnictwo treningowe", "ekologia", "gospodarstwo", "readaptacja"],
                "likes_count": 53,
                "matches_count": 28,
            },

            # Kategoria 9: Dla osób z niepełnosprawnością intelektualną
            {
                "title": "Merkury – Symulator samoobsługowy dla osób z niepełnosprawnościami",
                "slug": "merkury-symulator-samoobslugowy",
                "category": categories_map["intellectual"],
                "maturity_stage": "testy",
                "innovation_type": "technologia",
                "short_summary": "Interaktywny trenażer ułatwiający naukę korzystania z biletomatów, bankomatów i kas samoobsługowych bez stresu.",
                "full_description": (
                    "Merkury to oprogramowanie połączone z fizycznym dotykowym ekranem treningowym, które symuluje realne miejskie kasy "
                    "i biletomaty. Umożliwia osobom w spektrum autyzmu i z niepełnosprawnością intelektualną bezstresowe ćwiczenie zakupów."
                ),
                "target_audience": "Osoby z niepełnosprawnością intelektualną, spektrum autyzmu, WTZ, szkoły specjalne",
                "implementation_guide": "Instalacja na tablecie lub monitorze dotykowym. Dostępne 12 scenariuszy życiowych o różnym stopniu trudności.",
                "video_url": "https://www.youtube.com/watch?v=BK6a8fjELR0",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:45] Trener samodzielności: Merkury to dotykowy interfejs odtwarzający prawdziwe biletomaty, kasy i bankomaty w bezpiecznym środowisku WTZ.\n"
                    "[0:45 - 1:30] Ćwiczenie: Użytkownicy w spektrum autyzmu i z niepełnosprawnością intelektualną trenują płatność kartą i wybór biletów bez presji kolejki.\n"
                    "[1:30 - 2:00] Rezultat: Przełamanie bariery lęku i samodzielne podróże komunikacją miejską."
                ),
                "handbook_pdf_url": "/documents/instrukcja_merkury.pdf",
                "author_name": "Piotr Wójcik",
                "author_organization": "Spółdzielnia Socjalna Cyfrowy Horyzont",
                "author_email": "biuro@merkury-trening.pl",
                "replication_readiness_score": 92,
                "tags": ["trening samodzielności", "technologia", "biletomat", "WTZ", "dostępność"],
                "likes_count": 68,
                "matches_count": 24,
            },
            {
                "title": "Patryk i Kropka – Książki ETR wspierające samodzielność",
                "slug": "patryk-i-kropka",
                "category": categories_map["intellectual"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "produkt",
                "short_summary": "Seria ilustrowanych opowiadań w formacie łatwym do czytania (ETR) uczących młodzież zasad samodzielności i bezpieczeństwa.",
                "full_description": (
                    "Patryk i Kropka to innowacyjna seria książek przygotowana zgodnie z europejskim standardem tekstów łatwych do czytania (Easy-to-Read). "
                    "Bohaterowie przeżywają codzienne sytuacje: wizytę w banku, pierwszą miłość, wyjazd pociągiem czy odmowę obcej osobie, "
                    "dając czytelnikom z niepełnosprawnością intelektualną praktyczne wzorce zachowań."
                ),
                "target_audience": "Młodzież i dorośli z niepełnosprawnością intelektualną, warsztaty terapii zajęciowej, biblioteki gminne",
                "implementation_guide": "Zestaw 6 tomów opowiadań wraz z kartami pytań dyskusyjnych dla instruktorów i rodziców.",
                "video_url": "https://youtu.be/JfmyToWVuOs",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:40] Autorka: Patryk i Kropka to seria bogato ilustrowanych książek przygotowanych w formacie łatwym do czytania (ETR).\n"
                    "[0:40 - 1:20] Treść: Opowiadania poruszają ważne życiowo tematy: samodzielne zakupy, wizytę u lekarza, granice cielesne i asertywność.\n"
                    "[1:20 - 2:00] Sprawdzone narzędzie dydaktyczne w szkołach specjalnych i warsztatach terapii w całej Małopolsce."
                ),
                "handbook_pdf_url": "/documents/instrukcja_merkury.pdf",
                "author_name": "Magdalena Ciechowska",
                "author_organization": "Fundacja Generacje",
                "author_email": "kontakt@generacje.pl",
                "replication_readiness_score": 93,
                "tags": ["ETR", "niepełnosprawność intelektualna", "samodzielność", "książka", "WTZ"],
                "likes_count": 71,
                "matches_count": 37,
            },
            {
                "title": "Urzędowy ambaras – Symulacyjna gra planszowa załatwiania spraw",
                "slug": "urzedowy-ambaras",
                "category": categories_map["intellectual"],
                "maturity_stage": "sprawdzona",
                "innovation_type": "metoda",
                "short_summary": "Edukacyjna gra planszowa przygotowująca podopiecznych WTZ do samodzielnej wizyty w urzędzie gminy i na poczcie.",
                "full_description": (
                    "Urzędowy ambaras w przystępny i humorystyczny sposób oswaja procedury administracyjne. "
                    "Uczestnicy wcielają się w mieszkańców załatwiających dowód osobisty, meldunek czy odbiór przesyłki, "
                    "ucząc się wypełniania formularzy i kulturalnej komunikacji z urzędnikami."
                ),
                "target_audience": "Osoby z niepełnosprawnością intelektualną, uczestnicy WTZ i ŚDS, szkoły branżowe specjalne",
                "implementation_guide": "Zestaw gry planszowej z banknotami edukacyjnymi, makietami dokumentów i poradnikiem metodycznym dla instruktora.",
                "video_url": "https://www.youtube.com/watch?v=o5TP10ZStNA",
                "video_transcript": (
                    "Transkrypcja WCAG 2.2 AA:\n"
                    "[0:00 - 0:40] Instruktor WTZ: Urzędowy ambaras to symulacyjna gra edukacyjna ucząca, jak załatwić dowód osobisty czy złożyć wniosek o dofinansowanie.\n"
                    "[0:40 - 1:20] Rozgrywka: Gracze losują zadania, wypełniają uproszczone formularze i ćwiczą dialog z urzędnikiem w formie odgrywania ról.\n"
                    "[1:20 - 2:00] Podopieczni zyskują odwagę i wiedzę niezbędną do załatwiania spraw w urzędzie gminy."
                ),
                "handbook_pdf_url": "/documents/przewodnik_senior_cuder.pdf",
                "author_name": "Stowarzyszenie Przyjaciół WTZ",
                "author_organization": "Powiatowe Centrum Pomocy Rodzinie w Tarnowie",
                "author_email": "wtz-tarnow@innowacjespoleczne.pl",
                "replication_readiness_score": 90,
                "tags": ["gra planszowa", "urząd", "samodzielność", "WTZ", "niepełnosprawność intelektualna"],
                "likes_count": 63,
                "matches_count": 30,
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
                "slug": "samotnosc-seniorow-w-solectwach",
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
                "related_slugs": ["bawita-tablica-sensoryczna", "senior-cuder-gra-integracyjna", "sciezka-motosensoryczna"],
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
                "related_slugs": ["modularne-lazienki-dostepne", "uniodziez", "zakupy-bez-barier"],
            },
            {
                "title": "Koordynacja usług deinstytucjonalnych i animacja sąsiedzka",
                "slug": "koordynacja-uslug-spolecznych-myslenicki",
                "category": categories_map["youth_family"],
                "county": counties_map["myslenicki"],
                "summary": "Przejście z modelu zasiłkowego na zintegrowane usługi CUS i oddolną aktywność sołecką.",
                "full_analysis": "CUS Myślenice wdraża model organizatora społeczności lokalnej wspierającego rodziny i samopomoc wiejską.",
                "statistical_data": {"liczba_inicjatyw_sasiedzkich": 34, "zmniejszenie_zapotrzebowania_na_dps": "18%"},
                "key_needs": ["Standard Organizatora Społeczności Lokalnej", "Kluby rodzica i wsparcia sąsiedzkiego"],
                "related_slugs": ["organizator-spolecznosci-lokalnej-cus", "hop-hop-mobilny-plac-zabaw"],
            },
            {
                "title": "Kryzys zdrowia psychicznego dzieci i młodzieży po pandemii",
                "slug": "kryzys-zdrowia-psychicznego-mlodziezy",
                "category": categories_map["health"],
                "county": counties_map["krakowski"],
                "summary": "Lawinowy wzrost stanów lękowych, depresyjnych i izolacji społecznej wśród nastolatków w aglomeracji krakowskiej.",
                "full_analysis": "Czas oczekiwania na wizytę u psychiatry dziecięcego przekracza 9 miesięcy. Konieczna wczesna interwencja środowiskowa.",
                "statistical_data": {"wzrost_interwencji_kryzysowych": "45%", "liczba_mlodziezy_zagrozonej": 5200},
                "key_needs": ["Narzędzia dialogu bez stygmatyzacji w szkołach", "Wsparcie rówieśnicze i warsztaty komiksowe"],
                "related_slugs": ["komix-zyciowy", "gra-o-zdrowie", "himalaje-autyzmu"],
            },
            {
                "title": "Dostępność cyfrowa i sensoryczna instytucji dla osób niesłyszących i niewidomych",
                "slug": "dostepnosc-sensoryczna-tarnowski",
                "category": categories_map["sensory"],
                "county": counties_map["tarnowski"],
                "summary": "Trudności osób z uszkodzeniami zmysłów w samodzielnym załatwianiu spraw w urzędach gmin i przychodniach.",
                "full_analysis": "Niski odsetek urzędników władających PJM oraz brak audiodeskrypcji w budynkach użyteczności publicznej.",
                "statistical_data": {"odsetek_budynkow_bez_nawigacji_glosowej": "82%", "liczba_mieszkancow_z_wadami_zmyslow": 4100},
                "key_needs": ["Opaski wibracyjne i asystenci dźwiękowi", "Nawigacja radiowa NGOZ", "Kształcenie IT w PJM"],
                "related_slugs": ["straznik", "hear-it", "ngoz", "konsultant-etr"],
            },
            {
                "title": "Bariery terenowe i wykluczenie komunikacyjne osób zależnych na Podhalu",
                "slug": "wykluczenie-komunikacyjne-podhale",
                "category": categories_map["mobility"],
                "county": counties_map["tatrzanski"],
                "summary": "Trudne ukształtowanie terenu i rozproszona zabudowa utrudniają dostęp do lekarzy i aptek osobom na wózkach.",
                "full_analysis": "Stromizny, brak chodników i śnieg zimą całkowicie unieruchamiają seniorów i osoby z niepełnosprawnościami w domach.",
                "statistical_data": {"odsetek_domow_na_stokach_bez_dojazdu_zima": "29%", "seniorzy_zalezni": 1850},
                "key_needs": ["Mobilne usługi asystenckie", "Odzież termiczna i adaptacyjna", "Dojazd door-to-door"],
                "related_slugs": ["zakupy-bez-barier", "uniodziez", "modularne-lazienki-dostepne"],
            },
        ]

        for ch in challenges_data:
            related_slugs = ch.pop("related_slugs", [])
            c_obj, _ = RegionalChallenge.objects.update_or_create(
                slug=ch["slug"],
                defaults=ch,
            )
            for rslug in related_slugs:
                if rslug in innovations_map:
                    c_obj.related_innovations.add(innovations_map[rslug])

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

        PilotEvaluation.objects.get_or_create(
            pilot=pilot_bawita,
            evaluator_persona_key="marek_wisniewski",
            defaults={
                "evaluator_name": "Marek Wiśniewski",
                "evaluator_role": "pracownik_instytucji",
                "evaluator_institution": "Dyrektor CUS Myślenice",
                "usability_score": 5,
                "effectiveness_score": 4,
                "accessibility_score": 5,
                "barriers_encountered": "Niewielkie trudności z transportem tablicy między odległymi sołectwami.",
                "proposed_improvements": "Wdrożenie dedykowanego pokrowca transportowego ułatwiającego pracę mobilnego asystenta.",
                "recommend_to_scale": True,
                "test_environment_notes": "Pilotaż w ramach wizyt środowiskowych asystentów CUS. Bardzo wysoka ocena seniorów.",
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

        # Pilotaż Senior CUDER w toku (Piwniczna-Zdrój)
        pilot_cuder, _ = PilotProject.objects.update_or_create(
            innovation=innovations_map["senior-cuder-gra-integracyjna"],
            title="Wdrożenie testowe gry integracyjnej Senior CUDER w 3 klubach seniora",
            defaults={
                "status": "in_progress",
                "county": counties_map["nowosadecki"],
                "municipality_name": "Piwniczna-Zdrój",
                "max_testers": 30,
                "current_testers_count": 22,
                "eligible_roles_description": "Seniorzy 60+, animatorzy klubów seniora, pracownicy socjalni",
                "summary": "Pilotaż w 3 klubach seniora i Dziennym Domu Pobytu. Ewaluacja przystępności zasad oraz wpływu na aktywizację społeczną.",
                "instructions": "Rozegranie minimum 4 partii gry w zespołach 4-6 osobowych, obserwacja zaangażowania i wypełnienie ankiety WCAG.",
                "start_date": timezone.now().date() - timezone.timedelta(days=30),
                "end_date": timezone.now().date() + timezone.timedelta(days=30),
            },
        )

        PilotEvaluation.objects.get_or_create(
            pilot=pilot_cuder,
            evaluator_persona_key="anna_nowak",
            defaults={
                "evaluator_name": "Anna Nowak",
                "evaluator_role": "opiekun",
                "evaluator_institution": "Klub Seniora Dolina Popradu",
                "usability_score": 4,
                "effectiveness_score": 5,
                "accessibility_score": 5,
                "barriers_encountered": "Karty z zadaniami mogłyby mieć jeszcze większy kontrast dla osób z jaskrą.",
                "proposed_improvements": "Dołączenie lupy powiększającej do każdego pudełka z grą.",
                "recommend_to_scale": True,
                "test_environment_notes": "Testowano podczas cotygodniowych spotkań klubu. Uczestnicy byli zachwyceni dynamiką rozgrywki.",
            },
        )

        # Pilotaż Modularne Łazienki (rekrutacja)
        PilotProject.objects.update_or_create(
            innovation=innovations_map["modularne-lazienki-dostepne"],
            title="Pilotaż adaptacji modułowych łazienek w domach seniorów na wsi",
            defaults={
                "status": "recruiting",
                "county": counties_map["tarnowski"],
                "municipality_name": "Żabno",
                "max_testers": 8,
                "current_testers_count": 3,
                "eligible_roles_description": "Osoby z niepełnosprawnością ruchową, seniorzy niesamodzielni, architekci dostępności",
                "summary": "Montaż prototypowych modułów poręczy, bezprogowych brodzików i antypoślizgowych paneli ściennych w budynkach wiejskich.",
                "instructions": "Bezpłatny montaż zestawu testowego na 6 miesięcy z comiesięcznym audytem bezpieczeństwa i ankietą satysfakcji.",
                "start_date": timezone.now().date() + timezone.timedelta(days=14),
                "end_date": timezone.now().date() + timezone.timedelta(days=180),
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

        PartnershipPost.objects.get_or_create(
            title="Spółdzielnia Socjalna «Horyzonty» poszukuje partnera technologicznego do aplikacji asystenta",
            defaults={
                "author_persona_key": "",
                "organization_name": "Spółdzielnia Socjalna Horyzonty",
                "organization_type": "pes",
                "county": counties_map["krakowski"],
                "municipality_name": "Kraków",
                "category": categories_map["sensory"],
                "looking_for": "technologiczny",
                "description": (
                    "Rozwijamy narzędzie komunikacji alternatywnej (AAC) dla osób po udarach i w spektrum autyzmu. "
                    "Szukamy partnera technologicznego lub zespołu IT do optymalizacji interfejsu WCAG i wdrożenia mobilnego."
                ),
                "contact_email": "kontakt@horyzonty-spoldzielnia.pl",
                "contact_phone": "12 430 11 22",
                "is_active": True,
            },
        )

        PartnershipPost.objects.get_or_create(
            title="Uniwersytet Rolniczy w Krakowie oferuje wsparcie badawczo-eksperckie dla gmin testujących innowacje",
            defaults={
                "author_persona_key": "piotr_adamski",
                "organization_name": "Uniwersytet Rolniczy im. Hugona Kołłątaja w Krakowie",
                "organization_type": "nauka",
                "county": counties_map["krakowski"],
                "municipality_name": "Kraków",
                "category": categories_map["seniors"],
                "looking_for": "jst",
                "description": (
                    "Katedra Polityki Społecznej oferuje bezpłatny audyt potrzeb środowiskowych i wsparcie w ewaluacji pilotaży "
                    "innowacji społecznych dla 3 gmin wiejskich z Małopolski w ramach prac badawczych."
                ),
                "contact_email": "badania.spoleczne@urk.edu.pl",
                "contact_phone": "12 662 40 00",
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

        Inquiry.objects.get_or_create(
            subject="Wymogi techniczne dla symulatora biletomatów Merkury w szkole specjalnej",
            defaults={
                "author_persona_key": "",
                "author_name": "Tomasz Lisowski",
                "author_email": "tomasz.lisowski@szkola-specjalna.pl",
                "recipient_type": "expert_mentor",
                "message": "Czy symulator Merkury można uruchomić na starszych tabletach z systemem Android 9, czy wymagany jest nowszy sprzęt?",
                "response": "Symulator został zoptymalizowany pod kątem niskich wymagań sprzętowych i działa płynnie na urządzeniach z systemem Android 8.0+ oraz ekranach dotykowych o przekątnej min. 10 cali.",
                "responder_name": "dr Piotr Adamski (Ekspert ROPS)",
                "is_answered": True,
                "is_public_faq": True,
            },
        )

        Inquiry.objects.get_or_create(
            subject="Jakie formalności wiążą się z wdrożeniem BaWita w gminnym klubie seniora w Grybowie?",
            defaults={
                "author_persona_key": "anna_nowak",
                "author_name": "Anna Nowak",
                "author_email": "anna.nowak@przyklad.pl",
                "recipient_type": "rops_coordinator",
                "message": "Chcielibyśmy zgłosić zapotrzebowanie na zestaw BaWita dla klubu seniora. Czy wystarczy zwykły wniosek, czy potrzebna jest uchwała gminy?",
                "response": "",
                "responder_name": "",
                "is_answered": False,
                "is_public_faq": False,
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
                "resolution_template": (
                    "UCHWAŁA NR XXII/184/2026 RADY MIEJSKIEJ W MYŚLENICACH\n"
                    "z dnia 25 marca 2026 r.\n\n"
                    "w sprawie przyjęcia Programu Wdrożenia Usługi Społecznej 'BaWita – tablica sensoryczna dla seniorów' "
                    "w Centrum Usług Społecznych w Myślenicach.\n\n"
                    "Na podstawie art. 18 ust. 2 pkt 15 ustawy z dnia 8 marca 1990 r. o samorządzie gminnym oraz "
                    "art. 4 ust. 1 ustawy z dnia 19 lipca 2019 r. o realizowaniu usług społecznych przez centrum usług społecznych, "
                    "Rada Miejska w Myślenicach uchwala realizację programu ze wsparciem FERS Działanie 5.1 (70%) i PFRON (15%)."
                ),
            },
        )

        self.stdout.write(self.style.SUCCESS("Pomyślnie zasilono bazę danych pełnym zestawem danych demonstracyjnych ROPS Kraków!"))
