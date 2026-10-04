from decimal import Decimal
from unittest.mock import MagicMock, patch
from django.core.management import call_command
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

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
from api.serializers import (
    PilotProjectSerializer,
    PartnershipPostSerializer,
    InquirySerializer,
    MiddlemanGenerateRequestSerializer,
)


class ModelUnitTests(TestCase):
    """Testy jednostkowe metod __str__ oraz logiki modeli domenowych ROPS"""

    def setUp(self):
        self.category = InnovationCategory.objects.create(
            code="seniors",
            name="Dla seniorów",
            description="Kategoria dla osób starszych",
            icon_name="UsersThree",
            order=1,
        )
        self.county = County.objects.create(
            name="Powiat nowosądecki",
            slug="nowosadecki",
            population=217000,
            senior_ratio=22.8,
            main_challenges=["Samotność seniorów"],
        )
        self.municipality = Municipality.objects.create(
            county=self.county,
            name="Grybów",
            kind="wiejska",
            has_cus=False,
        )
        self.innovation = SocialInnovation.objects.create(
            title="BaWita – sensoryczna tablica",
            slug="bawita-sensoryczna-tablica",
            category=self.category,
            maturity_stage="sprawdzona",
            innovation_type="produkt",
            short_summary="Mobilny zestaw sensoryczny dla seniorów.",
            full_description="Pełny opis modułowej tablicy sensorycznej.",
            target_audience="Seniorzy 65+",
        )
        self.submission = ProblemSubmission.objects.create(
            category=self.category,
            county=self.county,
            title="Bariery architektoniczne",
            description="Brak wind w urzędzie",
            affected_group="Osoby z niepełnosprawnością",
            reporter_name="Jan Kowalski",
        )
        self.submission_no_county = ProblemSubmission.objects.create(
            category=self.category,
            county=None,
            title="Problem ogólny",
            description="Brak dostępnych materiałów",
            affected_group="Wszyscy",
            reporter_name="Anna Nowak",
        )
        self.match = ProblemMatch.objects.create(
            submission=self.submission,
            innovation=self.innovation,
            similarity_score=85.5,
            justification="Wysoka zgodność",
            suggested_next_step="middleman",
        )
        self.challenge = RegionalChallenge.objects.create(
            title="Dostępność usług na wsi",
            slug="dostepnosc-uslug-na-wsi",
            category=self.category,
            county=self.county,
            summary="Krótki opis",
            full_analysis="Pełna diagnoza",
        )
        self.idea = IdeaSubmission.objects.create(
            submission_type="fiszka",
            title="Mobilny Klub Seniora",
            applicant_name="Fundacja Pomoc",
            category=self.category,
            county=self.county,
        )
        self.pilot = PilotProject.objects.create(
            innovation=self.innovation,
            title="Pilotaż BaWita",
            status="recruiting",
            county=self.county,
            summary="Testowanie tablicy",
        )
        self.evaluation = PilotEvaluation.objects.create(
            pilot=self.pilot,
            evaluator_name="Anna Nowak",
            evaluator_role="opiekun",
            usability_score=5,
            effectiveness_score=4,
            accessibility_score=5,
        )
        self.partnership = PartnershipPost.objects.create(
            title="Współpraca NGO i CUS",
            organization_name="OPS Grybów",
            county=self.county,
            category=self.category,
            description="Wspólny projekt opiekuńczy",
            contact_email="ops@grybow.pl",
        )
        self.inquiry = Inquiry.objects.create(
            author_name="Jan Kowalski",
            author_email="jan@example.com",
            subject="Pytanie o grant",
            message="Kiedy rusza kolejny nabór?",
        )
        self.middleman_package = MiddlemanPackage.objects.create(
            innovation=self.innovation,
            county=self.county,
            municipality_name="Grybów",
            service_name="Mobilna tablica sensoryczna w Grybowie",
            service_standard="Standard opieki",
        )

    def test_model_string_representations(self):
        """Weryfikacja metod __str__ dla wszystkich modeli aplikacji api"""
        self.assertEqual(str(self.category), "Dla seniorów")
        self.assertEqual(str(self.county), "Powiat nowosądecki")
        self.assertEqual(str(self.municipality), "Grybów (Powiat nowosądecki)")
        self.assertEqual(str(self.innovation), "BaWita – sensoryczna tablica")
        self.assertIn("Jan Kowalski", str(self.submission))
        self.assertIn("Powiat nowosądecki", str(self.submission))
        self.assertIn("Małopolska", str(self.submission_no_county))
        self.assertIn("85.5%", str(self.match))
        self.assertEqual(str(self.challenge), "Dostępność usług na wsi")
        self.assertIn("Mobilny Klub Seniora", str(self.idea))
        self.assertIn("Fundacja Pomoc", str(self.idea))
        self.assertIn("Trwa nabór testerów", str(self.pilot))
        self.assertEqual(str(self.evaluation), "Opinia Anna Nowak o Pilotaż BaWita")
        self.assertEqual(str(self.partnership), "Współpraca NGO i CUS (OPS Grybów)")
        self.assertEqual(str(self.inquiry), "Pytanie o grant (Jan Kowalski)")
        self.assertIn("Grybów", str(self.middleman_package))


class SerializerUnitTests(TestCase):
    """Testy jednostkowe konwersji i walidacji w serializerach DRF"""

    def setUp(self):
        self.category = InnovationCategory.objects.create(
            code="seniors",
            name="Dla seniorów",
            description="Kategoria dla osób starszych",
            icon_name="UsersThree",
            order=1,
        )
        self.county = County.objects.create(
            name="Powiat nowosądecki",
            slug="nowosadecki",
            population=217000,
        )
        self.innovation = SocialInnovation.objects.create(
            title="Innowacja Testowa",
            slug="innowacja-testowa",
            category=self.category,
            short_summary="Krótki opis",
            full_description="Długi opis",
            target_audience="Wszyscy",
        )
        self.pilot = PilotProject.objects.create(
            innovation=self.innovation,
            title="Pilotaż Testowy",
            status="recruiting",
            county=self.county,
            summary="Opis pilotażu",
        )

    def test_pilot_serializer_county_variations_and_scores_none(self):
        # 1. County podane jako string cyfrowy
        data_digit = {
            "innovation": self.innovation.id,
            "title": "Nowy pilotaż 1",
            "county": str(self.county.id),
            "summary": "Podsumowanie",
        }
        ser1 = PilotProjectSerializer(data=data_digit)
        self.assertTrue(ser1.is_valid(), ser1.errors)
        self.assertEqual(ser1.validated_data["county"], self.county)

        # 2. County nieistniejące i puste
        data_invalid_county = {
            "innovation": self.innovation.id,
            "title": "Nowy pilotaż 2",
            "county": "nieistniejacy_powiat_xyz",
            "summary": "Podsumowanie",
        }
        ser2 = PilotProjectSerializer(data=data_invalid_county)
        self.assertTrue(ser2.is_valid(), ser2.errors)
        self.assertNotIn("county", ser2.validated_data)

        data_empty_county = {
            "innovation": self.innovation.id,
            "title": "Nowy pilotaż 3",
            "county": "",
            "summary": "Podsumowanie",
        }
        ser3 = PilotProjectSerializer(data=data_empty_county)
        self.assertTrue(ser3.is_valid(), ser3.errors)
        self.assertNotIn("county", ser3.validated_data)

        # 3. Wyliczenia średnich gdy brak ocen
        ser_obj = PilotProjectSerializer(self.pilot)
        self.assertIsNone(ser_obj.data["average_usability_score"])
        self.assertIsNone(ser_obj.data["average_effectiveness_score"])
        self.assertIsNone(ser_obj.data["recommendation_rate"])

    def test_partnership_serializer_aliases_and_fallbacks(self):
        # Sektor JST -> jst_cus
        # target_partner_type "jst", "ekspert", "technolog", nieznany
        cases = [
            ("jst", "Szukamy partnera jst i samorzadu", "jst_cus", "jst"),
            ("ngo", "Potrzebny ekspert merytoryczny", "ngo", "ekspert"),
            ("pes", "Szukamy partnera technologicznego", "pes", "technologiczny"),
            ("nauka", "Szukamy partnera ngo do wspolpracy", "nauka", "ngo"),
            ("ngo", "Szukamy kogos innego calkowicie", "ngo", "ngo"),
        ]
        for sec, target_t, expected_org, expected_looking in cases:
            payload = {
                "title": f"Ogłoszenie {sec}",
                "organization_name": "Org test",
                "sector": sec,
                "county": self.county.slug,
                "category": self.category.code,
                "target_partner_type": target_t,
                "desc": "Opis współpracy",
                "email": "kontakt@org.pl",
                "phone": "123456789",
            }
            ser = PartnershipPostSerializer(data=payload)
            self.assertTrue(ser.is_valid(), ser.errors)
            self.assertEqual(ser.validated_data["organization_type"], expected_org)
            self.assertEqual(ser.validated_data["looking_for"], expected_looking)
            self.assertEqual(ser.validated_data["description"], "Opis współpracy")
            self.assertEqual(ser.validated_data["contact_phone"], "123456789")
            self.assertEqual(ser.validated_data["contact_email"], "kontakt@org.pl")

        # Nieistniejący lub pusty/None county oraz category
        payload_bad = {
            "title": "Ogłoszenie Bad",
            "organization_name": "Org test",
            "county": "nieistniejacy-slug",
            "category": "nieistniejacy-kod",
            "description": "Opis",
            "contact_email": "kontakt@org.pl",
        }
        ser_bad = PartnershipPostSerializer(data=payload_bad)
        self.assertFalse(ser_bad.is_valid())

        payload_empty = {
            "title": "Ogłoszenie Empty",
            "organization_name": "Org test",
            "county": "",
            "category": "",
            "description": "Opis",
            "contact_email": "kontakt@org.pl",
        }
        ser_empty = PartnershipPostSerializer(data=payload_empty)
        self.assertFalse(ser_empty.is_valid())

        payload_none = {
            "title": "Ogłoszenie None",
            "organization_name": "Org test",
            "county": None,
            "category": None,
            "description": "Opis",
            "contact_email": "kontakt@org.pl",
        }
        ser_none = PartnershipPostSerializer(data=payload_none)
        self.assertFalse(ser_none.is_valid())

    def test_inquiry_serializer_aliases(self):
        payload = {
            "topic": "Temat zapytania",
            "content": "Treść pytania",
            "name": "Janina Kowalska",
            "email": "janina@przyklad.pl",
        }
        ser = InquirySerializer(data=payload)
        self.assertTrue(ser.is_valid(), ser.errors)
        self.assertEqual(ser.validated_data["subject"], "Temat zapytania")
        self.assertEqual(ser.validated_data["message"], "Treść pytania")
        self.assertEqual(ser.validated_data["author_name"], "Janina Kowalska")
        self.assertEqual(ser.validated_data["author_email"], "janina@przyklad.pl")

    def test_middleman_request_serializer_validators(self):
        # Walidacja wariantów typów gmin i modeli realizacji
        ser = MiddlemanGenerateRequestSerializer(data={
            "innovation_id": self.innovation.id,
            "county_id": self.county.id,
            "municipality_name": "Nowy Sącz",
            "municipality_type": "gmina miejska",
            "execution_model": "wlasna kadra CUS",
        })
        self.assertTrue(ser.is_valid(), ser.errors)
        self.assertEqual(ser.validated_data["municipality_type"], "miejska")
        self.assertEqual(ser.validated_data["execution_model"], "wlasna_kadra")

        ser2 = MiddlemanGenerateRequestSerializer(data={
            "innovation_id": self.innovation.id,
            "county_id": self.county.id,
            "municipality_name": "Stary Sącz",
            "municipality_type": "miejsko-wiejska",
            "execution_model": "porozumienie partnerskie hybrydowe",
        })
        self.assertTrue(ser2.is_valid(), ser2.errors)
        self.assertEqual(ser2.validated_data["municipality_type"], "miejsko-wiejska")
        self.assertEqual(ser2.validated_data["execution_model"], "hybrydowy")


class BackendFullTestSuite(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Utworzenie kategorii testowych
        self.cat_seniors = InnovationCategory.objects.create(
            code="seniors",
            name="Dla seniorów",
            description="Kategoria dla osób starszych",
            icon_name="UsersThree",
            order=1,
        )
        self.cat_mobility = InnovationCategory.objects.create(
            code="mobility",
            name="Dla osób o ograniczonej mobilności",
            description="Dostępność i likwidacja barier",
            icon_name="Wheelchair",
            order=2,
        )
        self.cat_empty = InnovationCategory.objects.create(
            code="empty_category",
            name="Kategoria pusta",
            description="Brak innowacji w tej kategorii",
            icon_name="Folder",
            order=99,
        )

        # Powiat i gmina
        self.county = County.objects.create(
            name="Powiat nowosądecki",
            slug="nowosadecki",
            population=217000,
            senior_ratio=22.8,
            main_challenges=["Samotność seniorów", "Bariery transportowe"],
        )
        self.municipality = Municipality.objects.create(
            county=self.county,
            name="Grybów",
            kind="wiejska",
            has_cus=False,
        )

        # Innowacja
        self.innovation = SocialInnovation.objects.create(
            title="BaWita – sensoryczna tablica",
            slug="bawita-sensoryczna-tablica",
            category=self.cat_seniors,
            maturity_stage="sprawdzona",
            innovation_type="produkt",
            short_summary="Mobilny zestaw sensoryczny dla seniorów z demencją.",
            full_description="Pełny opis modułowej tablicy sensorycznej.",
            target_audience="Seniorzy 65+, osoby z chorobami otępiennymi",
            implementation_guide="Krok 1: zamówienie, Krok 2: szkolenie.",
            video_url="https://www.youtube.com/watch?v=sample",
            video_transcript="Transkrypcja WCAG 2.2 AA dla wideo.",
            author_name="Zespół ROPS",
            replication_readiness_score=95,
            tags=["seniorzy", "demencja", "terapia sensoryczna", "wieś"],
        )

        # Dodatkowa innowacja w fazie koncepcji z kategorią secondary
        self.innovation_concept = SocialInnovation.objects.create(
            title="Cyfrowy Asystent Seniora",
            slug="cyfrowy-asystent-seniora",
            category=self.cat_mobility,
            maturity_stage="koncepcja",
            innovation_type="technologia",
            short_summary="Aplikacja ułatwiająca kontakt z urzędem.",
            full_description="Koncepcja narzędzia cyfrowego.",
            target_audience="Mieszkańcy z niepełnosprawnościami i seniorzy",
            replication_readiness_score=40,
            tags=["aplikacja", "seniorzy", "urząd"],
        )
        self.innovation_concept.secondary_categories.add(self.cat_seniors)

        # Pilotaż
        self.pilot = PilotProject.objects.create(
            innovation=self.innovation,
            title="Pilotaż BaWita w Grybowie",
            status="recruiting",
            county=self.county,
            municipality_name="Grybów",
            max_testers=2,
            current_testers_count=1,
            summary="Testowanie zestawu w sołectwie.",
        )

        # Wyzwanie regionalne
        self.challenge = RegionalChallenge.objects.create(
            title="Wykluczenie transportowe seniorów na Sądecczyźnie",
            slug="wykluczenie-transportowe-seniorow-sadecczyzna",
            category=self.cat_seniors,
            county=self.county,
            summary="Brak połączeń autobusowych.",
            full_analysis="Szczegółowa diagnoza wykluczenia komunikacyjnego.",
        )
        self.challenge.related_innovations.add(self.innovation)

    def test_health_check_endpoint(self):
        url = reverse("health-check")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get("status"), "healthy")

    def test_openapi_schema_and_docs(self):
        schema_url = reverse("schema")
        self.assertEqual(self.client.get(schema_url).status_code, status.HTTP_200_OK)

        swagger_url = reverse("swagger-ui")
        self.assertEqual(self.client.get(swagger_url).status_code, status.HTTP_200_OK)

        redoc_url = reverse("redoc")
        self.assertEqual(self.client.get(redoc_url).status_code, status.HTTP_200_OK)

    def test_categories_and_counties_list_and_detail(self):
        cat_res = self.client.get("/api/categories/")
        self.assertEqual(cat_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(cat_res.data), 2)

        cat_detail = self.client.get(f"/api/categories/{self.cat_seniors.code}/")
        self.assertEqual(cat_detail.status_code, status.HTTP_200_OK)
        self.assertEqual(cat_detail.data["code"], "seniors")

        county_res = self.client.get("/api/counties/")
        self.assertEqual(county_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(county_res.data), 1)

        county_detail = self.client.get(f"/api/counties/{self.county.slug}/")
        self.assertEqual(county_detail.status_code, status.HTTP_200_OK)
        self.assertEqual(county_detail.data["slug"], "nowosadecki")

    def test_social_innovations_filtering_and_like(self):
        # Filtrowanie po kategorii
        res = self.client.get(f"/api/innovations/?category={self.cat_seniors.code}")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)  # 1 jako primary, 1 jako secondary

        # Filtrowanie po stage, kind i q
        res_stage = self.client.get("/api/innovations/?stage=sprawdzona")
        self.assertEqual(res_stage.status_code, status.HTTP_200_OK)
        self.assertTrue(all(item["maturity_stage"] == "sprawdzona" for item in res_stage.data))

        res_kind = self.client.get("/api/innovations/?type=produkt")
        self.assertEqual(res_kind.status_code, status.HTTP_200_OK)
        self.assertTrue(all(item["innovation_type"] == "produkt" for item in res_kind.data))

        res_q = self.client.get("/api/innovations/?q=sensoryczna")
        self.assertEqual(res_q.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_q.data), 1)

        # Szczegóły innowacji
        detail_res = self.client.get(f"/api/innovations/{self.innovation.slug}/")
        self.assertEqual(detail_res.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_res.data["title"], self.innovation.title)

        # Polubienie (like)
        like_res = self.client.post(f"/api/innovations/{self.innovation.slug}/like/")
        self.assertEqual(like_res.status_code, status.HTTP_200_OK)
        self.assertEqual(like_res.data["likes_count"], 1)

    def test_social_innovation_update_stage_action(self):
        """Test aktualizacji etapu dojrzałości oraz wskaźnika replikacji innowacji"""
        # 1. Poprawna zmiana
        payload = {
            "maturity_stage": "testy",
            "replication_readiness_score": 75,
        }
        res = self.client.patch(f"/api/innovations/{self.innovation.slug}/update-stage/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["maturity_stage"], "testy")
        self.assertEqual(res.data["replication_readiness_score"], 75)

        # 2. Zmiana z nieprawidłowym formatem wskaźnika (np. string nieliczbowy)
        payload_bad_readiness = {
            "maturity_stage": "sprawdzona",
            "replication_readiness_score": "nieprawidlowa_wartosc",
        }
        res_bad = self.client.patch(f"/api/innovations/{self.innovation.slug}/update-stage/", payload_bad_readiness, format="json")
        self.assertEqual(res_bad.status_code, status.HTTP_200_OK)
        self.assertEqual(res_bad.data["maturity_stage"], "sprawdzona")

    def test_regional_challenges_endpoints(self):
        """Test listy i szczegółów wyzwań regionalnych"""
        list_res = self.client.get("/api/challenges/")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(list_res.data), 1)

        detail_res = self.client.get(f"/api/challenges/{self.challenge.slug}/")
        self.assertEqual(detail_res.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_res.data["title"], self.challenge.title)
        self.assertEqual(len(detail_res.data["related_innovations"]), 1)

    def test_matchmaking_analyze_success(self):
        """Test poprawnego dopasowania innowacji z wysokim score"""
        payload = {
            "title": "Samotność i demencja osób starszych w sołectwie",
            "description": "Szukamy wsparcia i terapii dla samotnych seniorów z problemami pamięciowymi.",
            "affected_group": "Seniorzy 65+ w małej wsi",
            "category_id": self.cat_seniors.id,
            "county_id": self.county.id,
            "municipality_name": "Grybów",
            "persona_key": "anna_nowak",
            "reporter_name": "Anna Nowak",
            "reporter_email": "anna.nowak@przyklad.pl",
            "save_submission": True,
        }

        res = self.client.post(reverse("matchmaking-analyze"), payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data["is_gap_identified"])
        self.assertGreaterEqual(res.data["total_matches"], 1)
        self.assertGreaterEqual(res.data["top_score"], 60.0)
        self.assertIn("BaWita", res.data["matches"][0]["innovation"]["title"])
        self.assertIsNotNone(res.data["submission_id"])

        # Sprawdzenie powiązania w bazie
        sub = ProblemSubmission.objects.get(id=res.data["submission_id"])
        self.assertEqual(sub.status, "matched")
        self.assertGreaterEqual(sub.matches.count(), 1)

    def test_matchmaking_analyze_category_code_and_no_save(self):
        """Test dopasowania z użyciem category_code, bez zapisywania zgłoszenia do bazy"""
        payload = {
            "title": "Aplikacja i narzędzie cyfrowe dla urzędu",
            "description": "Cyfrowe ułatwienia w kontakcie z gminą dla seniorów.",
            "affected_group": "Mieszkańcy z niepełnosprawnościami i seniorzy",
            "category_code": self.cat_seniors.code,
            "save_submission": False,
        }
        res = self.client.post(reverse("matchmaking-analyze"), payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIsNone(res.data["submission_id"])

    def test_matchmaking_analyze_no_category_and_middleman_step(self):
        """Test dopasowania innowacji bez podanej kategorii oraz kroku middleman gdy innowacja sprawdzona nie ma pilotażu"""
        self.pilot.delete()
        payload = {
            "title": "Zestaw sensoryczny dla seniorów z demencją w sołectwie",
            "description": "Mobilny zestaw sensoryczny dla seniorów z problemami demencji.",
            "affected_group": "Seniorzy 65+",
            "save_submission": False,
        }
        res = self.client.post(reverse("matchmaking-analyze"), payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(res.data["total_matches"], 1)
        self.assertEqual(res.data["matches"][0]["suggested_next_step"], "middleman")

    def test_matchmaking_analyze_gap_identified(self):
        """Test wykrycia luki ('Biała plama') gdy problem nie ma rozwiązania w bazie"""
        payload = {
            "title": "Brak schroniska dla bezdomnych zwierząt domowych w gminie",
            "description": "Zupełnie niezwiązany temat infrastruktury weterynaryjnej bez pasującej innowacji społecznej.",
            "affected_group": "Mieszkańcy gminy",
            "category_id": self.cat_empty.id,
            "save_submission": True,
        }

        res = self.client.post(reverse("matchmaking-analyze"), payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["is_gap_identified"])
        self.assertEqual(res.data["recommended_action"], "kreator")
        self.assertIn("Biała plama", res.data["gap_message"])

    def test_problem_submission_viewset_queries_and_filters(self):
        """Test filtrowania zgłoszeń problemów (ProblemSubmissionViewSet)"""
        sub = ProblemSubmission.objects.create(
            category=self.cat_seniors,
            county=self.county,
            title="Dojazd do lekarza dla seniora",
            description="Brak transportu publicznego",
            affected_group="Seniorzy wiejscy",
            reporter_name="Piotr Wiśniewski",
            persona_key="piotr_w",
            status="pending",
        )

        # Filtrowanie po statusie
        res_stat = self.client.get("/api/problems/?status=pending")
        self.assertEqual(res_stat.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["id"] == sub.id for item in res_stat.data))

        # Filtrowanie po county slug
        res_county = self.client.get(f"/api/problems/?county={self.county.slug}")
        self.assertEqual(res_county.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["id"] == sub.id for item in res_county.data))

        # Filtrowanie po persona
        res_persona = self.client.get("/api/problems/?persona=piotr_w")
        self.assertEqual(res_persona.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["id"] == sub.id for item in res_persona.data))

        # Filtrowanie po category (zarówno digit id jak i code)
        res_cat_id = self.client.get(f"/api/problems/?category={self.cat_seniors.id}")
        self.assertEqual(res_cat_id.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["id"] == sub.id for item in res_cat_id.data))

        res_cat_code = self.client.get(f"/api/problems/?category={self.cat_seniors.code}")
        self.assertEqual(res_cat_code.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["id"] == sub.id for item in res_cat_code.data))

        # Wyszukiwanie q
        res_q = self.client.get("/api/problems/?q=lekarza")
        self.assertEqual(res_q.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_q.data), 1)

        # Pobranie pojedynczego zgłoszenia
        detail_res = self.client.get(f"/api/problems/{sub.id}/")
        self.assertEqual(detail_res.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_res.data["title"], sub.title)

    def test_idea_submission_fers_grant_and_evaluation(self):
        """Test zgłoszenia 12-punktowego wniosku grantowego FERS i jego oceny"""
        payload = {
            "submission_type": "grant_fers",
            "persona_key": "katarzyna_zielinska",
            "title": "Mobilny Klub Aktywności Seniora",
            "category": self.cat_seniors.id,
            "county": self.county.id,
            "applicant_type": "podmiot_ngo",
            "applicant_name": "Fundacja Aktywna Małopolska",
            "applicant_email": "kontakt@aktywna-malopolska.pl",
            "organization_krs": "0000123456",
            "organization_nip": "9930012345",
            "innovation_description": "Usługi środowiskowe w duchu deinstytucjonalizacji.",
            "uniqueness_rationale": "Pionierski model mobilnego klubu.",
            "target_recipients": "Seniorzy 65+ z niepełnosprawnościami",
            "requested_grant_amount": "48500.00",
            "formal_declarations_accepted": True,
        }

        res = self.client.post("/api/ideas/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        idea_id = res.data["id"]

        # Filtrowanie pomysłów po type, status, persona
        list_res = self.client.get(f"/api/ideas/?type=grant_fers&status=zlozony&persona=katarzyna_zielinska")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_res.data), 1)

        # Ocena administratora ROPS Kraków
        eval_payload = {
            "score": 92.5,
            "feedback": "Znakomity wniosek wpisujący się w regionalne priorytety deinstytucjonalizacji.",
            "status": "zaakceptowany",
        }
        eval_res = self.client.post(f"/api/ideas/{idea_id}/evaluate/", eval_payload, format="json")
        self.assertEqual(eval_res.status_code, status.HTTP_200_OK)
        self.assertEqual(eval_res.data["status"], "zaakceptowany")
        self.assertEqual(eval_res.data["admin_score"], 92.5)

    def test_idea_submission_fiszka_with_aliases(self):
        """Test utworzenia lekkiej Fiszki Pomysłu z mapowaniem aliasów pól"""
        payload = {
            "submission_type": "fiszka",
            "title": "Sąsiedzka opieka wytchnieniowa",
            "category": self.cat_seniors.id,
            "county": self.county.id,
            "applicant_name": "Anna Nowak",
            "applicant_email": "anna.nowak@przyklad.pl",
            "solution_concept": "Sąsiedzka pomoc doraźna dla opiekunów seniorów.",
            "target_group": "Opiekunowie osób starszych w Grybowie",
            "estimated_budget_pln": 35000,
            "uniqueness_rationale": "Unikalne podejście",
            "formal_declarations_accepted": True,
        }
        res = self.client.post("/api/ideas/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["submission_type"], "fiszka")
        self.assertEqual(res.data["innovation_description"], "Sąsiedzka pomoc doraźna dla opiekunów seniorów.")
        self.assertEqual(res.data["target_recipients"], "Opiekunowie osób starszych w Grybowie")
        self.assertEqual(float(res.data["requested_grant_amount"]), 35000.0)
        self.assertEqual(res.data["uniqueness_rationale"], "Unikalne podejście")
        self.assertTrue(res.data["formal_declarations_accepted"])

    def test_idea_ai_assist_all_fields(self):
        """Test działania asystenta AI dla wszystkich pól formularza FERS"""
        # 1. Deinstytucjonalizacja
        res_deinst = self.client.post("/api/ideas/ai-assist/", {
            "field": "deinstitutionalization",
            "title": "Mobilna Opieka Senioralna",
            "category": self.cat_seniors.id,
        }, format="json")
        self.assertEqual(res_deinst.status_code, status.HTTP_200_OK)
        self.assertIn("deinstytucjonalizacji", res_deinst.data["suggestion"])

        # 2. Wyróżniki innowacyjności (innovation_uniqueness)
        res_uniq = self.client.post("/api/ideas/ai-assist/", {
            "field": "innovation_uniqueness",
            "title": "Mobilna Opieka Senioralna",
        }, format="json")
        self.assertEqual(res_uniq.status_code, status.HTTP_200_OK)
        self.assertIn("Wyróżniki innowacyjności", res_uniq.data["suggestion"])

        # 3. Diagnoza powiatowa (county_diagnosis) z slugiem powiatu i danymi wyzwań
        res_diag = self.client.post("/api/ideas/ai-assist/", {
            "field": "county_diagnosis",
            "county": self.county.slug,
            "title": "Mobilna Opieka Senioralna",
        }, format="json")
        self.assertEqual(res_diag.status_code, status.HTTP_200_OK)
        self.assertIn("senior_ratio", res_diag.data)
        self.assertIn("Obserwatorium Polityki Społecznej ROPS Kraków", res_diag.data["suggestion"])
        self.assertGreaterEqual(len(res_diag.data["challenges"]), 1)

        # 4. Model skalowania (scalability)
        res_scale = self.client.post("/api/ideas/ai-assist/", {
            "field": "scalability",
            "title": "Mobilna Opieka Senioralna",
        }, format="json")
        self.assertEqual(res_scale.status_code, status.HTTP_200_OK)
        self.assertIn("Model replikacji w Małopolsce", res_scale.data["suggestion"])

        # 5. Plan budżetowy
        res_budget = self.client.post("/api/ideas/ai-assist/", {
            "field": "budget_action_plan",
        }, format="json")
        self.assertEqual(res_budget.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_budget.data["action_plan_prep"]), 2)
        self.assertEqual(len(res_budget.data["action_plan_testing"]), 2)
        self.assertEqual(res_budget.data["requested_grant_amount"], 50000)

        # 6. Diagram koncepcji z kodem kategorii
        res_diag_concept = self.client.post("/api/ideas/ai-assist/", {
            "field": "concept_diagram",
            "title": "Mobilna Opieka Senioralna",
            "category": self.cat_seniors.code,
            "county": self.county.id,
        }, format="json")
        self.assertEqual(res_diag_concept.status_code, status.HTTP_200_OK)
        self.assertIn("graph TD", res_diag_concept.data["mermaid_code"])
        self.assertGreaterEqual(len(res_diag_concept.data["steps"]), 4)

        # 7. Fallback dla nieznanego pola
        res_fallback = self.client.post("/api/ideas/ai-assist/", {
            "field": "nieznane_pole",
        }, format="json")
        self.assertEqual(res_fallback.status_code, status.HTTP_200_OK)
        self.assertIn("Wskazówka asystenta innowacji", res_fallback.data["suggestion"])

    def test_idea_ai_assist_with_openai_mock_and_fallback(self):
        """Test działania asystenta AI przy włączonym OpenAI oraz fallbacku przy błędzie API"""
        # Test 1: Sukces OpenAI Responses API
        mock_response = MagicMock()
        mock_response.output_text = '{"suggestion": "Dedykowana rekomendacja deinstytucjonalizacji wygenerowana przez OpenAI."}'

        with patch("api.llm_service.get_openai_client") as mock_get_client:
            mock_client = MagicMock()
            mock_client.responses.create.return_value = mock_response
            mock_get_client.return_value = mock_client

            res = self.client.post("/api/ideas/ai-assist/", {
                "field": "deinstitutionalization",
                "title": "Kawiarenka Naprawcza Senior+",
                "category": self.cat_seniors.id,
                "county": self.county.id,
            }, format="json")

            self.assertEqual(res.status_code, status.HTTP_200_OK)
            self.assertEqual(res.data["source"], "openai")
            self.assertIn("wygenerowana przez OpenAI", res.data["suggestion"])

        # Test 2: Błąd OpenAI API -> automatyczny fallback do szablonu
        with patch("api.llm_service.get_openai_client") as mock_get_client:
            mock_client = MagicMock()
            mock_client.responses.create.side_effect = RuntimeError("OpenAI rate limit or network error")
            mock_client.chat.completions.create.side_effect = RuntimeError("OpenAI rate limit or network error")
            mock_get_client.return_value = mock_client

            res_err = self.client.post("/api/ideas/ai-assist/", {
                "field": "deinstitutionalization",
                "title": "Kawiarenka Naprawcza Senior+",
                "category": self.cat_seniors.id,
            }, format="json")

            self.assertEqual(res_err.status_code, status.HTTP_200_OK)
            self.assertNotIn("source", res_err.data)
            self.assertIn("deinstytucjonalizacji", res_err.data["suggestion"])

    def test_idea_ai_validate_single_field_needs_work_on_vague(self):
        """Test walidacji AI wykrywającej lakoniczny/niejasny opis problemu"""
        res = self.client.post("/api/ideas/ai-validate/", {
            "field": "problem_diagnosis",
            "content": "Seniorzy mają problem ze zdrowiem.",
            "title": "Mobilna Opieka Senioralna",
            "county": self.county.id,
        }, format="json")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["status"], "needs_work")
        self.assertLess(res.data["score"], 50)
        self.assertIn("głębszego opisu", res.data["verdict"])
        self.assertGreaterEqual(len(res.data["improvements"]), 2)

    def test_idea_ai_validate_single_field_valid_on_rich(self):
        """Test walidacji AI potwierdzającej rzetelny i wyczerpujący opis z danymi lokalnymi"""
        rich_content = (
            "Na podstawie raportu Obserwatorium Polityki Społecznej ROPS Kraków w powiecie krakowskim "
            "ponad 24% mieszkańców to osoby w wieku 60+. Zdiagnozowano brak mobilnych kadr opiekuńczych na obszarach wiejskich, "
            "co dotyka bezpośrednio około 350 niesamodzielnych seniorów pozbawionych dostępu do wsparcia środowiskowego."
        )
        res = self.client.post("/api/ideas/ai-validate/", {
            "field": "problem_diagnosis",
            "content": rich_content,
            "title": "Mobilna Opieka Senioralna",
            "county": self.county.id,
        }, format="json")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["status"], "valid")
        self.assertGreaterEqual(res.data["score"], 75)
        self.assertIn("Diagnoza", res.data["verdict"])

    def test_idea_ai_validate_batch_fields(self):
        """Test walidacji wielopolowej kroków formularza FERS (batch validation)"""
        res = self.client.post("/api/ideas/ai-validate/", {
            "title": "Kawiarenka Naprawcza Senior+",
            "county": self.county.id,
            "fields": {
                "problem_diagnosis": "Krótki opis.",
                "innovation_desc": "Innowacja polega na deinstytucjonalizacji usług i wsparciu sąsiedzkim w środowisku lokalnym podopiecznych, stanowiąc alternatywę dla pobytu w DPS.",
            },
        }, format="json")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["batch"])
        self.assertIn("problem_diagnosis", res.data["results"])
        self.assertIn("innovation_desc", res.data["results"])
        self.assertEqual(res.data["results"]["problem_diagnosis"]["status"], "needs_work")
        self.assertEqual(res.data["results"]["innovation_desc"]["status"], "valid")
        self.assertEqual(res.data["overall_status"], "needs_work")

    def test_idea_ai_validate_with_openai_mock(self):
        """Test walidacji AI z odpowiedzią OpenAI Responses API"""
        mock_response = MagicMock()
        mock_response.output_text = (
            '{"field": "problem_diagnosis", "status": "warning", "score": 60, '
            '"verdict": "Opis wymaga pogłębienia danych o powiecie", '
            '"summary": "Wskazano problem, ale brakuje twardych liczb.", '
            '"strengths": ["Jasny temat"], "improvements": ["Dodaj dane GUS"], '
            '"suggested_questions": ["Ilu seniorów?"]}'
        )

        with patch("api.llm_service.get_openai_client") as mock_get_client:
            mock_client = MagicMock()
            mock_client.responses.create.return_value = mock_response
            mock_get_client.return_value = mock_client

            res = self.client.post("/api/ideas/ai-validate/", {
                "field": "problem_diagnosis",
                "content": "Ogólny opis problemu bez liczb.",
            }, format="json")

            self.assertEqual(res.status_code, status.HTTP_200_OK)
            self.assertEqual(res.data["source"], "openai")
            self.assertEqual(res.data["status"], "warning")
            self.assertEqual(res.data["score"], 60)

    def test_pilot_apply_and_evaluation(self):
        """Test zapisu na testy, limitu miejsc, formularza ewaluacji z aliasami oraz filtrowania i wskaźników"""
        # 1. Poprawne zgłoszenie kandydata na testera
        apply_res = self.client.post(
            f"/api/pilots/{self.pilot.id}/apply/",
            {"applicant_name": "Anna Nowak", "applicant_role": "opiekun"},
            format="json",
        )
        self.assertEqual(apply_res.status_code, status.HTTP_200_OK)
        self.assertEqual(apply_res.data["current_testers_count"], 2)
        self.assertIn("Anna Nowak", apply_res.data["message"])

        # 2. Próba zgłoszenia ponad limit (max_testers=2, current_testers_count=2)
        apply_full_res = self.client.post(
            f"/api/pilots/{self.pilot.id}/apply/",
            {"applicant_name": "Kolejny Kandydat"},
            format="json",
        )
        self.assertEqual(apply_full_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Limit miejsc", apply_full_res.data["error"])

        # 3. Wypełnienie ewaluacji z aliasami pol
        eval_payload = {
            "pilot": self.pilot.id,
            "evaluator_persona_key": "anna_nowak",
            "evaluator_name": "Anna Nowak",
            "evaluator_role": "opiekun",
            "usability_score": 5,
            "effectiveness_score": 4,
            "accessibility_wcag_score": 5,
            "barriers_encountered": "Brak barier",
            "comments": "Dodanie większych uchwytów",
            "test_environment_notes": "Test w sołectwie",
            "recommend_to_scale": True,
        }
        eval_res = self.client.post("/api/evaluations/", eval_payload, format="json")
        self.assertEqual(eval_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(eval_res.data["accessibility_score"], 5)
        self.assertEqual(eval_res.data["barriers_encountered"], "Brak barier")
        self.assertEqual(eval_res.data["proposed_improvements"], "Dodanie większych uchwytów")
        self.assertEqual(eval_res.data["test_environment_notes"], "Test w sołectwie")

        # 4. Sprawdzenie wskaźników obliczeniowych pilotażu
        pilot_res = self.client.get(f"/api/pilots/{self.pilot.id}/")
        self.assertEqual(pilot_res.status_code, status.HTTP_200_OK)
        self.assertEqual(pilot_res.data["evaluations_count"], 1)
        self.assertEqual(pilot_res.data["average_usability_score"], 5.0)
        self.assertEqual(pilot_res.data["average_effectiveness_score"], 4.0)
        self.assertEqual(pilot_res.data["average_accessibility_score"], 5.0)
        self.assertEqual(pilot_res.data["average_overall_score"], 4.7)
        self.assertEqual(pilot_res.data["recommendation_rate"], 100)

        # 5. Sprawdzenie filtrowania listy pilotaży (county, innovation slug & id, q)
        filter_res = self.client.get(f"/api/pilots/?status=recruiting&county={self.county.slug}")
        self.assertEqual(filter_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(filter_res.data), 1)

        filter_inn_slug = self.client.get(f"/api/pilots/?innovation={self.innovation.slug}")
        self.assertEqual(filter_inn_slug.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(filter_inn_slug.data), 1)

        filter_inn_id = self.client.get(f"/api/pilots/?innovation={self.innovation.id}")
        self.assertEqual(filter_inn_id.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(filter_inn_id.data), 1)

        filter_q = self.client.get("/api/pilots/?q=BaWita")
        self.assertEqual(filter_q.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(filter_q.data), 1)

        # 6. Sprawdzenie tworzenia nowego pilotażu ze stringowym slugiem powiatu
        create_res = self.client.post(
            "/api/pilots/",
            {
                "innovation": self.innovation.id,
                "title": "Nowy pilotaż w Grybowie",
                "county": self.county.slug,
                "municipality_name": "Grybów",
                "max_testers": 6,
                "eligible_roles_description": "Seniorzy i opiekunowie",
                "summary": "Weryfikacja mobilnego sprzętu.",
            },
            format="json",
        )
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_res.data["county"], self.county.id)
        self.assertEqual(create_res.data["county_name"], self.county.name)

        # 7. Endpoint evaluacji: pobranie listy i szczegółu
        eval_list = self.client.get("/api/evaluations/")
        self.assertEqual(eval_list.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(eval_list.data), 1)

        eval_detail = self.client.get(f"/api/evaluations/{eval_res.data['id']}/")
        self.assertEqual(eval_detail.status_code, status.HTTP_200_OK)
        self.assertEqual(eval_detail.data["evaluator_name"], "Anna Nowak")

    def test_partnership_and_inquiry_flow(self):
        """Test giełdy partnerstw i panelu komunikacji z ROPS (Moduł V)"""
        # 1. Ogłoszenie partnerstwa z ID
        part_payload = {
            "title": "Gmina Grybów poszukuje partnera NGO",
            "organization_name": "OPS Grybów",
            "organization_type": "jst_cus",
            "county": self.county.id,
            "category": self.cat_seniors.id,
            "looking_for": "ngo",
            "description": "Wspólna realizacja usług opiekuńczych.",
            "contact_email": "ops@grybow.pl",
        }
        part_res = self.client.post("/api/partnerships/", part_payload, format="json")
        self.assertEqual(part_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(part_res.data["county_slug"], self.county.slug)
        self.assertEqual(part_res.data["category_code"], self.cat_seniors.code)
        self.assertEqual(part_res.data["organization_type_display"], "Jednostka Samorządu / CUS")
        self.assertEqual(part_res.data["looking_for_display"], "Organizację pozarządową (NGO)")

        # 2. Ogłoszenie partnerstwa z aliasami i slugami
        part2_payload = {
            "title": "Fundacja Aktywna poszukuje partnera technologicznego",
            "organization_name": "Fundacja Aktywna",
            "sector": "ngo",
            "county": self.county.slug,
            "category": self.cat_seniors.code,
            "target_partner_type": "technologiczny",
            "desc": "Budowa aplikacji asystenckiej.",
            "email": "kontakt@aktywna.pl",
            "phone": "501 999 888",
        }
        part2_res = self.client.post("/api/partnerships/", part2_payload, format="json")
        self.assertEqual(part2_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(part2_res.data["organization_type"], "ngo")
        self.assertEqual(part2_res.data["looking_for"], "technologiczny")
        self.assertEqual(part2_res.data["contact_email"], "kontakt@aktywna.pl")

        # 3. Filtrowanie i wyszukiwanie ofert partnerstw (county id, category id, org_type)
        filter_res = self.client.get(f"/api/partnerships/?county={self.county.id}&category={self.cat_seniors.id}&organization_type=ngo&looking_for=technologiczny")
        self.assertEqual(filter_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(filter_res.data), 1)

        search_res = self.client.get("/api/partnerships/?q=technologicznego")
        self.assertEqual(search_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(search_res.data), 1)

        # 4. Zapytanie z aliasami (topic, content)
        inquiry_payload = {
            "author_name": "Marek Wiśniewski",
            "author_email": "cus@myslenice.pl",
            "recipient_type": "rops_coordinator",
            "topic": "Procedura wdrożenia innowacji w CUS",
            "content": "Jak wygląda formalna ścieżka adaptacji?",
        }
        inq_res = self.client.post("/api/inquiries/", inquiry_payload, format="json")
        self.assertEqual(inq_res.status_code, status.HTTP_201_CREATED)
        inq_id = inq_res.data["id"]
        self.assertEqual(inq_res.data["subject"], "Procedura wdrożenia innowacji w CUS")
        self.assertEqual(inq_res.data["message"], "Jak wygląda formalna ścieżka adaptacji?")
        self.assertFalse(inq_res.data["is_answered"])

        # Filtrowanie zapytań (is_answered=false, recipient_type)
        unanswered_res = self.client.get("/api/inquiries/?is_answered=false&recipient_type=rops_coordinator")
        self.assertEqual(unanswered_res.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["id"] == inq_id for item in unanswered_res.data))

        # 5. Odpowiedź mentora/koordynatora i publikacja w FAQ
        resp_payload = {
            "response": "Adaptacja wymaga uchwały Rady Gminy lub zmiany PUS.",
            "responder_name": "Magdalena Kaczmarczyk",
            "is_public_faq": True,
        }
        resp_res = self.client.post(f"/api/inquiries/{inq_id}/respond/", resp_payload, format="json")
        self.assertEqual(resp_res.status_code, status.HTTP_200_OK)
        self.assertTrue(resp_res.data["is_answered"])
        self.assertTrue(resp_res.data["is_public_faq"])

        # Filtrowanie i wyszukiwanie ofert partnerstw po slugach/kodach
        filter_slug_res = self.client.get(f"/api/partnerships/?county={self.county.slug}&category={self.cat_seniors.code}")
        self.assertEqual(filter_slug_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(filter_slug_res.data), 1)

        # 6. Sprawdzenie filtrowania FAQ, wyszukiwania q oraz is_answered=true
        faq_res = self.client.get("/api/inquiries/?faq=true&q=Procedura")
        self.assertEqual(faq_res.status_code, status.HTTP_200_OK)
        self.assertTrue(all(item["is_public_faq"] and item["is_answered"] for item in faq_res.data))

        answered_res = self.client.get("/api/inquiries/?is_answered=true")
        self.assertEqual(answered_res.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["id"] == inq_id for item in answered_res.data))

    def test_middleman_package_generation(self):
        """Test generatora pakietu wdrożeniowego usługi dla JST (Middleman AI) oraz pobierania pakietów"""
        payload = {
            "innovation_id": self.innovation.id,
            "county_id": self.county.id,
            "municipality_name": "Grybów",
            "municipality_type": "gmina_wiejska",
            "population": 22000,
            "has_cus": False,
            "execution_model": "zlecenie_ngo",
        }

        res = self.client.post(reverse("middleman-package"), payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn("Grybów", res.data["service_name"])
        self.assertGreaterEqual(len(res.data["staffing_requirements"]), 2)
        self.assertIn("FERS", str(res.data["funding_sources"]))
        self.assertGreater(res.data["cost_breakdown"]["annual_total_pln"], 0)
        self.assertIn("resolution_template", res.data)
        self.assertTrue(len(res.data["resolution_template"]) > 0)

        # Sprawdzenie pobierania listy pakietów (GET) z filtrami
        list_res = self.client.get(
            f"{reverse('middleman-package')}?municipality=Gryb&innovation_id={self.innovation.id}&county_id={self.county.id}"
        )
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(list_res.data), 1)

        # Sprawdzenie pobierania pojedynczego pakietu wg id
        pkg_id = res.data["id"]
        detail_res = self.client.get(f"{reverse('middleman-package')}?id={pkg_id}")
        self.assertEqual(detail_res.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_res.data["municipality_name"], "Grybów")

        # Sprawdzenie 404 dla nieistniejącego id pakietu
        not_found_res = self.client.get(f"{reverse('middleman-package')}?id=999999")
        self.assertEqual(not_found_res.status_code, status.HTTP_404_NOT_FOUND)

        # Sprawdzenie błędów przy nieistniejącej innowacji lub powiecie
        bad_inn = self.client.post(reverse("middleman-package"), {
            **payload,
            "innovation_id": 999999,
        }, format="json")
        self.assertEqual(bad_inn.status_code, status.HTTP_404_NOT_FOUND)

        bad_county = self.client.post(reverse("middleman-package"), {
            **payload,
            "county_id": 999999,
        }, format="json")
        self.assertEqual(bad_county.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_trends_and_moderation(self):
        """Test analityki trendów i moderacji zgłoszenia przez koordynatora ROPS"""
        # Utworzenie zgłoszenia ze statusem gap_identified
        sub = ProblemSubmission.objects.create(
            category=self.cat_mobility,
            county=self.county,
            title="Bariery w urzędzie",
            description="Brak podjazdu dla wózków",
            affected_group="Osoby z niepełnosprawnością ruchową",
            status="gap_identified",
            reporter_name="Jan Kowalski",
            reporter_email="jan@example.com",
        )

        trends_res = self.client.get(reverse("admin-trends"))
        self.assertEqual(trends_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(trends_res.data["total_submissions"], 1)
        self.assertGreaterEqual(len(trends_res.data["white_spots"]), 1)

        # Moderacja istniejącego zgłoszenia
        mod_payload = {
            "status": "in_progress",
            "admin_notes": "Skierowano do Zespołu ds. Dostępności ROPS.",
        }
        mod_res = self.client.patch(reverse("admin-moderate", kwargs={"pk": sub.pk}), mod_payload, format="json")
        self.assertEqual(mod_res.status_code, status.HTTP_200_OK)
        self.assertEqual(mod_res.data["status"], "in_progress")
        self.assertEqual(mod_res.data["admin_notes"], mod_payload["admin_notes"])

        # Moderacja nieistniejącego zgłoszenia (404)
        mod_404 = self.client.patch(reverse("admin-moderate", kwargs={"pk": 999999}), mod_payload, format="json")
        self.assertEqual(mod_404.status_code, status.HTTP_404_NOT_FOUND)


class SeedDemoDataCommandUnitTests(TestCase):
    """Weryfikacja polecenia zasilania bazy danych danymi ROPS Kraków"""

    def test_seed_demo_data_command_runs_cleanly(self):
        # Wywołanie komendy zasilania bazy demonstracyjnej
        call_command("seed_demo_data")
        # Weryfikacja obecności kluczowych danych
        self.assertEqual(InnovationCategory.objects.count(), 9)
        self.assertGreaterEqual(County.objects.count(), 6)
        self.assertGreaterEqual(SocialInnovation.objects.count(), 6)
        self.assertTrue(RegionalChallenge.objects.exists())
        self.assertTrue(IdeaSubmission.objects.exists())
        self.assertTrue(PilotProject.objects.exists())
        self.assertTrue(PartnershipPost.objects.exists())
        self.assertTrue(Inquiry.objects.exists())
