from decimal import Decimal
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
    RegionalChallenge,
    IdeaSubmission,
    PilotProject,
    PilotEvaluation,
    PartnershipPost,
    Inquiry,
    MiddlemanPackage,
)


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

        # Pilotaż
        self.pilot = PilotProject.objects.create(
            innovation=self.innovation,
            title="Pilotaż BaWita w Grybowie",
            status="recruiting",
            county=self.county,
            municipality_name="Grybów",
            max_testers=5,
            current_testers_count=1,
            summary="Testowanie zestawu w sołectwie.",
        )

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

    def test_categories_and_counties_list(self):
        cat_res = self.client.get("/api/categories/")
        self.assertEqual(cat_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(cat_res.data), 2)

        county_res = self.client.get("/api/counties/")
        self.assertEqual(county_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(county_res.data), 1)

    def test_social_innovations_filtering_and_like(self):
        # Filtrowanie po kategorii
        res = self.client.get(f"/api/innovations/?category={self.cat_seniors.code}")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

        # Szczegóły innowacji
        detail_res = self.client.get(f"/api/innovations/{self.innovation.slug}/")
        self.assertEqual(detail_res.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_res.data["title"], self.innovation.title)

        # Polubienie (like)
        like_res = self.client.post(f"/api/innovations/{self.innovation.slug}/like/")
        self.assertEqual(like_res.status_code, status.HTTP_200_OK)
        self.assertEqual(like_res.data["likes_count"], 1)

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
        self.assertEqual(sub.matches.count(), 1)

    def test_matchmaking_analyze_gap_identified(self):
        """Test wykrycia luki ('Biała plama') gdy problem nie ma rozwiązania w bazie"""
        payload = {
            "title": "Brak schroniska dla bezdomnych zwierząt domowych w gminie",
            "description": "Zupełnie niezwiązany temat infrastruktury weterynaryjnej bez pasującej innowacji społecznej.",
            "affected_group": "Mieszkańcy gminy",
            "category_id": self.cat_mobility.id,
            "save_submission": True,
        }

        res = self.client.post(reverse("matchmaking-analyze"), payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["is_gap_identified"])
        self.assertEqual(res.data["recommended_action"], "kreator")
        self.assertIn("Biała plama", res.data["gap_message"])

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
        }
        res = self.client.post("/api/ideas/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["submission_type"], "fiszka")
        self.assertEqual(res.data["innovation_description"], "Sąsiedzka pomoc doraźna dla opiekunów seniorów.")
        self.assertEqual(res.data["target_recipients"], "Opiekunowie osób starszych w Grybowie")
        self.assertEqual(float(res.data["requested_grant_amount"]), 35000.0)

    def test_idea_ai_assist_endpoints(self):
        """Test działania asystenta AI dla formularza FERS"""
        # 1. Deinstytucjonalizacja
        res_deinst = self.client.post("/api/ideas/ai-assist/", {
            "field": "deinstitutionalization",
            "title": "Mobilna Opieka Senioralna",
            "category": self.cat_seniors.id,
        }, format="json")
        self.assertEqual(res_deinst.status_code, status.HTTP_200_OK)
        self.assertIn("deinstytucjonalizacji", res_deinst.data["suggestion"])

        # 2. Diagnoza powiatowa
        res_diag = self.client.post("/api/ideas/ai-assist/", {
            "field": "county_diagnosis",
            "county": self.county.id,
            "title": "Mobilna Opieka Senioralna",
        }, format="json")
        self.assertEqual(res_diag.status_code, status.HTTP_200_OK)
        self.assertIn("senior_ratio", res_diag.data)
        self.assertIn("Obserwatorium Polityki Społecznej ROPS Kraków", res_diag.data["suggestion"])

        # 3. Plan budżetowy
        res_budget = self.client.post("/api/ideas/ai-assist/", {
            "field": "budget_action_plan",
        }, format="json")
        self.assertEqual(res_budget.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_budget.data["action_plan_prep"]), 2)
        self.assertEqual(len(res_budget.data["action_plan_testing"]), 2)
        self.assertEqual(res_budget.data["requested_grant_amount"], 50000)

        # 4. Diagram koncepcji
        res_diag_concept = self.client.post("/api/ideas/ai-assist/", {
            "field": "concept_diagram",
            "title": "Mobilna Opieka Senioralna",
            "category": self.cat_seniors.id,
            "county": self.county.id,
        }, format="json")
        self.assertEqual(res_diag_concept.status_code, status.HTTP_200_OK)
        self.assertIn("graph TD", res_diag_concept.data["mermaid_code"])
        self.assertGreaterEqual(len(res_diag_concept.data["steps"]), 4)

    def test_pilot_apply_and_evaluation(self):
        """Test zapisu na testy, formularza ewaluacji z aliasami oraz filtrowania i wskaźników"""
        # Zgłoszenie kandydata na testera z danymi
        apply_res = self.client.post(
            f"/api/pilots/{self.pilot.id}/apply/",
            {"applicant_name": "Anna Nowak", "applicant_role": "opiekun"},
            format="json",
        )
        self.assertEqual(apply_res.status_code, status.HTTP_200_OK)
        self.assertEqual(apply_res.data["current_testers_count"], 2)
        self.assertIn("Anna Nowak", apply_res.data["message"])

        # Wypełnienie ewaluacji z aliasami pol (accessibility_wcag_score i comments)
        eval_payload = {
            "pilot": self.pilot.id,
            "evaluator_persona_key": "anna_nowak",
            "evaluator_name": "Anna Nowak",
            "evaluator_role": "opiekun",
            "usability_score": 5,
            "effectiveness_score": 4,
            "accessibility_wcag_score": 5,
            "barriers_encountered": "Brak",
            "comments": "Dodanie większych uchwytów",
            "recommend_to_scale": True,
        }
        eval_res = self.client.post("/api/evaluations/", eval_payload, format="json")
        self.assertEqual(eval_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(eval_res.data["accessibility_score"], 5)
        self.assertEqual(eval_res.data["proposed_improvements"], "Dodanie większych uchwytów")

        # Sprawdzenie wskaźników obliczeniowych pilotażu
        pilot_res = self.client.get(f"/api/pilots/{self.pilot.id}/")
        self.assertEqual(pilot_res.status_code, status.HTTP_200_OK)
        self.assertEqual(pilot_res.data["evaluations_count"], 1)
        self.assertEqual(pilot_res.data["average_usability_score"], 5.0)
        self.assertEqual(pilot_res.data["average_effectiveness_score"], 4.0)
        self.assertEqual(pilot_res.data["average_accessibility_score"], 5.0)
        self.assertEqual(pilot_res.data["average_overall_score"], 4.7)
        self.assertEqual(pilot_res.data["recommendation_rate"], 100)

        # Sprawdzenie filtrowania listy pilotaży
        filter_res = self.client.get("/api/pilots/?status=recruiting")
        self.assertEqual(filter_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(filter_res.data), 1)

        # Sprawdzenie tworzenia nowego pilotażu ze stringowym slugiem powiatu
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

        # 3. Filtrowanie i wyszukiwanie ofert partnerstw
        filter_res = self.client.get(f"/api/partnerships/?county={self.county.slug}&looking_for=ngo")
        self.assertEqual(filter_res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(filter_res.data), 1)

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

        # 6. Sprawdzenie filtrowania FAQ
        faq_res = self.client.get("/api/inquiries/?faq=true")
        self.assertEqual(faq_res.status_code, status.HTTP_200_OK)
        self.assertTrue(all(item["is_public_faq"] and item["is_answered"] for item in faq_res.data))

    def test_middleman_package_generation(self):
        """Test generatora pakietu wdrożeniowego usługi dla JST (Middleman AI)"""
        payload = {
            "innovation_id": self.innovation.id,
            "county_id": self.county.id,
            "municipality_name": "Grybów",
            "municipality_type": "wiejska",
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

        # Moderacja
        mod_payload = {
            "status": "in_progress",
            "admin_notes": "Skierowano do Zespołu ds. Dostępności ROPS.",
        }
        mod_res = self.client.patch(reverse("admin-moderate", kwargs={"pk": sub.pk}), mod_payload, format="json")
        self.assertEqual(mod_res.status_code, status.HTTP_200_OK)
        self.assertEqual(mod_res.data["status"], "in_progress")
        self.assertEqual(mod_res.data["admin_notes"], mod_payload["admin_notes"])
