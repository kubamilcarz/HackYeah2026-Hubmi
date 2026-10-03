from django.db import models
from django.utils import timezone


class InnovationCategory(models.Model):
    """
    9 oficjalnych kategorii ROPS Kraków
    """
    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    icon_name = models.CharField(max_length=64, default="Heart")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Kategoria innowacji"
        verbose_name_plural = "Kategorie innowacji"
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class County(models.Model):
    """
    Powiaty województwa małopolskiego
    """
    name = models.CharField(max_length=128, unique=True)
    slug = models.SlugField(max_length=128, unique=True)
    teryt = models.CharField(max_length=8, blank=True)
    population = models.PositiveIntegerField(default=0)
    senior_ratio = models.FloatField(default=0.0, help_text="Odsetek osób 60+ w %")
    summary = models.TextField(blank=True)
    main_challenges = models.JSONField(default=list, blank=True, help_text="Lista kluczowych wyzwań")

    class Meta:
        verbose_name = "Powiat Małopolski"
        verbose_name_plural = "Powiaty Małopolski"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Municipality(models.Model):
    """
    Gmina w powiecie
    """
    county = models.ForeignKey(County, on_delete=models.CASCADE, related_name="municipalities")
    name = models.CharField(max_length=128)
    kind = models.CharField(
        max_length=32,
        choices=[
            ("miejska", "Gmina miejska"),
            ("miejsko-wiejska", "Gmina miejsko-wiejska"),
            ("wiejska", "Gmina wiejska"),
        ],
        default="wiejska",
    )
    has_cus = models.BooleanField(default=False, help_text="Czy posiada Centrum Usług Społecznych")

    class Meta:
        verbose_name = "Gmina"
        verbose_name_plural = "Gminy"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.county.name})"


class SocialInnovation(models.Model):
    """
    Karta Innowacji Społecznej ROPS Kraków
    """
    STAGE_CHOICES = [
        ("koncepcja", "Koncepcja"),
        ("prototyp", "Prototyp w fazie testów"),
        ("testy", "Pilotaż / Ewaluacja"),
        ("sprawdzona", "Sprawdzona / Gotowa do skalowania"),
    ]

    TYPE_CHOICES = [
        ("usluga", "Usługa społeczna"),
        ("produkt", "Przedmiot / Produkt fizyczny"),
        ("metoda", "Metoda / Model pracy"),
        ("technologia", "Technologia / Narzędzie cyfrowe"),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    category = models.ForeignKey(
        InnovationCategory, on_delete=models.PROTECT, related_name="innovations"
    )
    secondary_categories = models.ManyToManyField(
        InnovationCategory, blank=True, related_name="secondary_innovations"
    )
    maturity_stage = models.CharField(max_length=32, choices=STAGE_CHOICES, default="sprawdzona")
    innovation_type = models.CharField(max_length=32, choices=TYPE_CHOICES, default="usluga")
    short_summary = models.TextField()
    full_description = models.TextField()
    target_audience = models.CharField(max_length=255)
    implementation_guide = models.TextField(blank=True, help_text="Instrukcja wdrożenia dla samorządu/NGO")
    video_url = models.URLField(blank=True, help_text="Link do wideo demonstracyjnego")
    video_transcript = models.TextField(blank=True, help_text="Pełna transkrypcja WCAG 2.2 AA dla materiału wideo")
    handbook_pdf_url = models.CharField(max_length=512, blank=True, help_text="Ścieżka do podręcznika / instrukcji PDF")
    
    author_name = models.CharField(max_length=255, default="Inkubator ROPS Kraków")
    author_organization = models.CharField(max_length=255, blank=True)
    author_email = models.EmailField(blank=True)
    
    replication_readiness_score = models.PositiveIntegerField(
        default=85, help_text="Wskaźnik łatwości replikacji w gminach (0-100)"
    )
    tags = models.JSONField(default=list, blank=True)
    likes_count = models.PositiveIntegerField(default=0)
    matches_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Innowacja społeczna"
        verbose_name_plural = "Innowacje społeczne"
        ordering = ["-replication_readiness_score", "title"]

    def __str__(self):
        return self.title


class ProblemSubmission(models.Model):
    """
    Zgłoszenie problemu społecznego (Moduł I: Matchmaking)
    """
    STATUS_CHOICES = [
        ("pending", "Nowe / Oczekujące na analizę"),
        ("matched", "Dopasowano innowację"),
        ("gap_identified", "Zidentyfikowano lukę (Biała plama)"),
        ("in_progress", "W trakcie wdrażania"),
        ("resolved", "Rozwiązane"),
    ]

    REPORTER_ROLES = [
        ("mieszkaniec", "Mieszkaniec"),
        ("jst", "Jednostka Samorządu Terytorialnego (JST)"),
        ("ngo", "Organizacja Pozarządowa (NGO)"),
        ("ekspert", "Ekspert branżowy"),
        ("anonim", "Użytkownik niezalogowany / Gość"),
    ]

    persona_key = models.CharField(max_length=64, default="anna_nowak", blank=True)
    reporter_role = models.CharField(max_length=32, choices=REPORTER_ROLES, default="mieszkaniec")
    reporter_name = models.CharField(max_length=255)
    reporter_email = models.EmailField()
    reporter_phone = models.CharField(max_length=64, blank=True)
    reporter_institution = models.CharField(max_length=255, blank=True)

    county = models.ForeignKey(County, on_delete=models.SET_NULL, null=True, blank=True, related_name="problems")
    municipality_name = models.CharField(max_length=128, blank=True)
    category = models.ForeignKey(InnovationCategory, on_delete=models.PROTECT, related_name="problems")
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    affected_group = models.CharField(max_length=255)
    estimated_scale = models.CharField(
        max_length=32,
        choices=[
            ("jednostkowa", "Pojedyncze osoby / Rodziny"),
            ("lokalna", "Lokalna (wieś / osiedle)"),
            ("gminna", "Cała gmina"),
            ("powiatowa", "Skala powiatu"),
        ],
        default="gminna",
    )
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="pending")
    admin_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Zgłoszenie problemu"
        verbose_name_plural = "Zgłoszenia problemów"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.reporter_name}, {self.county.name if self.county else 'Małopolska'})"


class ProblemMatch(models.Model):
    """
    Wynik dopasowania problemu do innowacji przez silnik Matchmakingu
    """
    submission = models.ForeignKey(ProblemSubmission, on_delete=models.CASCADE, related_name="matches")
    innovation = models.ForeignKey(SocialInnovation, on_delete=models.CASCADE, related_name="matches")
    similarity_score = models.FloatField(help_text="Wskaźnik trafności dopasowania w % (0-100)")
    justification = models.TextField(help_text="Uzasadnienie dlaczego innowacja rozwiązuje ten problem")
    suggested_next_step = models.CharField(
        max_length=64,
        choices=[
            ("middleman", "Wdróż w gminie (Middleman AI)"),
            ("tester", "Dołącz do testów (Tester Innowacji)"),
            ("contact", "Skontaktuj się z autorem"),
        ],
        default="middleman",
    )
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Dopasowanie innowacji"
        verbose_name_plural = "Dopasowania innowacji"
        ordering = ["-similarity_score"]

    def __str__(self):
        return f"{self.submission.title} -> {self.innovation.title} ({self.similarity_score:.1f}%)"


class RegionalChallenge(models.Model):
    """
    Wyzwanie regionalne Małopolski (Moduł II: Zasobnik Wiedzy)
    """
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    category = models.ForeignKey(
        InnovationCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="challenges"
    )
    county = models.ForeignKey(County, on_delete=models.SET_NULL, null=True, blank=True, related_name="challenges")
    summary = models.TextField()
    full_analysis = models.TextField()
    statistical_data = models.JSONField(default=dict, blank=True, help_text="Wskaźniki GUS / ROPS")
    key_needs = models.JSONField(default=list, blank=True)
    related_innovations = models.ManyToManyField(SocialInnovation, blank=True, related_name="challenges")

    class Meta:
        verbose_name = "Wyzwanie regionalne"
        verbose_name_plural = "Wyzwania regionalne"
        ordering = ["title"]

    def __str__(self):
        return self.title


class IdeaSubmission(models.Model):
    """
    Kreator Pomysłów (Moduł III):
    Obsługuje zarówno Poziom A (Fiszka Pomysłu), jak i Poziom B (Wniosek Grantowy FERS 12 pkt).
    """
    SUBMISSION_TYPES = [
        ("fiszka", "Fiszka Pomysłu (całoroczna)"),
        ("grant_fers", "Wniosek Grantowy FERS (Inkubator Włączenia Społecznego 2.0)"),
    ]

    APPLICANT_TYPES = [
        ("osoba_fizyczna", "Osoba fizyczna (mieszkaniec)"),
        ("podmiot_ngo", "Podmiot / Organizacja pozarządowa (NGO)"),
        ("grupa_nieformalna", "Grupa nieformalna (minimum 2 osoby)"),
    ]

    STATUS_CHOICES = [
        ("roboczy", "Szkic"),
        ("zlozony", "Złożony / Oczekuje na ocenę"),
        ("w_ocenie", "W trakcie oceny formalno-merytorycznej"),
        ("zaakceptowany", "Zaakceptowany do inkubacji / grantu"),
        ("odrzucony", "Odrzucony"),
    ]

    submission_type = models.CharField(max_length=32, choices=SUBMISSION_TYPES, default="fiszka")
    persona_key = models.CharField(max_length=64, blank=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="zlozony")

    # Pkt 1: Tytuł innowacji
    title = models.CharField(max_length=255)
    category = models.ForeignKey(InnovationCategory, on_delete=models.PROTECT, related_name="ideas")
    county = models.ForeignKey(County, on_delete=models.SET_NULL, null=True, blank=True, related_name="ideas")

    # Pkt 2: Dane pomysłodawcy
    applicant_type = models.CharField(max_length=32, choices=APPLICANT_TYPES, default="osoba_fizyczna")
    applicant_name = models.CharField(max_length=255)
    applicant_email = models.EmailField()
    applicant_phone = models.CharField(max_length=64, blank=True)
    applicant_address = models.CharField(max_length=255, blank=True)
    applicant_city = models.CharField(max_length=128, blank=True)
    applicant_postal_code = models.CharField(max_length=16, blank=True)

    # Pola dla NGO / Podmiotu
    organization_krs = models.CharField(max_length=32, blank=True)
    organization_nip = models.CharField(max_length=32, blank=True)
    organization_regon = models.CharField(max_length=32, blank=True)
    organization_representative = models.CharField(max_length=255, blank=True)

    # Pola dla Grupy Nieformalnej (JSON z listą członków)
    group_members = models.JSONField(default=list, blank=True)

    # Pkt 3: Opis innowacji & deinstytucjonalizacja
    innovation_description = models.TextField(help_text="Istota pomysłu i wpisanie się w proces deinstytucjonalizacji")
    
    # Pkt 4: Innowacyjność rozwiązania
    uniqueness_rationale = models.TextField(blank=True, help_text="Wyróżniki i porównanie ze stanem obecnym")

    # Pkt 5: Diagnoza problemu i podstawa w raportach ROPS
    problem_diagnosis = models.TextField(blank=True, help_text="Uzasadnienie w oparciu o Mapę Wyzwań ROPS")

    # Pkt 6: Odbiorcy
    target_recipients = models.TextField(help_text="Grupa docelowa i przyczyny zagrożenia wykluczeniem")

    # Pkt 7: Zmiana wprowadzana przez innowację
    expected_change = models.TextField(blank=True)

    # Pkt 8: Skalowalność i replikowalność
    scalability_model = models.TextField(blank=True)

    # Pkt 9: Harmonogram i budżet (JSON z etapami i kosztami)
    action_plan_prep = models.JSONField(default=list, blank=True, help_text="Działania przygotowawcze (maks 3 msc)")
    action_plan_testing = models.JSONField(default=list, blank=True, help_text="Działania testowe (maks 9 msc)")

    # Pkt 10: Wnioskowana kwota (max 50 000 zł)
    requested_grant_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.00, help_text="Wnioskowana kwota (maks. 50 000 zł)"
    )

    # Pkt 11: Zespół projektowy
    team_experience = models.TextField(blank=True)

    # Pkt 12: Oświadczenia formalne
    formal_declarations_accepted = models.BooleanField(default=True)

    # Ocena administratora ROPS
    admin_score = models.FloatField(null=True, blank=True)
    admin_feedback = models.TextField(blank=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Zgłoszenie pomysłu / Wniosek FERS"
        verbose_name_plural = "Zgłoszenia pomysłów / Wnioski FERS"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.get_submission_type_display()}] {self.title} - {self.applicant_name}"


class PilotProject(models.Model):
    """
    Pilotaż innowacji (Moduł IV: Tester Innowacji)
    """
    STATUS_CHOICES = [
        ("recruiting", "Trwa nabór testerów"),
        ("in_progress", "Pilotaż w toku"),
        ("completed", "Pilotaż zakończony / Ewaluacja"),
    ]

    innovation = models.ForeignKey(SocialInnovation, on_delete=models.CASCADE, related_name="pilots")
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="recruiting")
    county = models.ForeignKey(County, on_delete=models.SET_NULL, null=True, blank=True)
    municipality_name = models.CharField(max_length=128, blank=True)
    max_testers = models.PositiveIntegerField(default=10)
    current_testers_count = models.PositiveIntegerField(default=0)
    eligible_roles_description = models.CharField(max_length=255, default="Mieszkańcy, opiekunowie, kadra CUS/OPS, eksperci")
    summary = models.TextField()
    instructions = models.TextField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = "Pilotaż innowacji"
        verbose_name_plural = "Pilotaże innowacji"
        ordering = ["-status", "title"]

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


class PilotEvaluation(models.Model):
    """
    Ewaluacja i feedback z testów innowacji (Moduł IV)
    """
    ROLE_CHOICES = [
        ("mieszkaniec", "Mieszkaniec / Użytkownik końcowy"),
        ("opiekun", "Opiekun osoby zależnej"),
        ("pracownik_instytucji", "Pracownik CUS / OPS / DPS"),
        ("przedstawiciel_ngo", "Przedstawiciel NGO"),
        ("ekspert", "Ekspert branżowy"),
    ]

    pilot = models.ForeignKey(PilotProject, on_delete=models.CASCADE, related_name="evaluations")
    evaluator_persona_key = models.CharField(max_length=64, blank=True)
    evaluator_name = models.CharField(max_length=255)
    evaluator_role = models.CharField(max_length=32, choices=ROLE_CHOICES, default="mieszkaniec")
    evaluator_institution = models.CharField(max_length=255, blank=True)
    
    # Oceny 1-5 (WCAG kryteria jakościowe)
    usability_score = models.PositiveSmallIntegerField(default=5, help_text="Łatwość użycia (1-5)")
    effectiveness_score = models.PositiveSmallIntegerField(default=5, help_text="Skuteczność rozwiązania (1-5)")
    accessibility_score = models.PositiveSmallIntegerField(default=5, help_text="Dostępność bez barier (1-5)")
    
    barriers_encountered = models.TextField(blank=True, help_text="Napotkane bariery i trudności")
    proposed_improvements = models.TextField(blank=True, help_text="Proponowane usprawnienia")
    recommend_to_scale = models.BooleanField(default=True, help_text="Rekomendacja skalowania do innych gmin")
    test_environment_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Ewaluacja pilotażu"
        verbose_name_plural = "Ewaluacje pilotaży"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Opinia {self.evaluator_name} o {self.pilot.title}"


class PartnershipPost(models.Model):
    """
    Tablica Partnerstw Międzysektorowych / Giełda Współpracy (Moduł V)
    """
    ORGANIZATION_TYPES = [
        ("jst_cus", "Jednostka Samorządu / CUS"),
        ("ngo", "Organizacja Pozarządowa (NGO)"),
        ("pes", "Podmiot Ekonomii Społecznej"),
        ("nauka", "Uczelnia / Instytut"),
    ]

    LOOKING_FOR_TYPES = [
        ("ngo", "Organizację pozarządową (NGO)"),
        ("jst", "Samorząd / Gminę (JST)"),
        ("ekspert", "Eksperta merytorycznego"),
        ("technologiczny", "Partnera technologicznego"),
    ]

    author_persona_key = models.CharField(max_length=64, blank=True)
    title = models.CharField(max_length=255)
    organization_name = models.CharField(max_length=255)
    organization_type = models.CharField(max_length=32, choices=ORGANIZATION_TYPES, default="jst_cus")
    county = models.ForeignKey(County, on_delete=models.CASCADE, related_name="partnership_posts")
    municipality_name = models.CharField(max_length=128, blank=True)
    category = models.ForeignKey(InnovationCategory, on_delete=models.PROTECT, related_name="partnership_posts")
    looking_for = models.CharField(max_length=32, choices=LOOKING_FOR_TYPES, default="ngo")
    description = models.TextField()
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=64, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Oferta partnerstwa"
        verbose_name_plural = "Giełda partnerstw"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.organization_name})"


class Inquiry(models.Model):
    """
    Panel dialogu i pytań do ROPS Kraków & mentorów (Moduł V)
    """
    RECIPIENT_TYPES = [
        ("rops_coordinator", "Koordynator Małopolskiego Hubu (ROPS Kraków)"),
        ("expert_mentor", "Ekspert branżowy / Mentor"),
    ]

    author_persona_key = models.CharField(max_length=64, blank=True)
    author_name = models.CharField(max_length=255)
    author_email = models.EmailField()
    recipient_type = models.CharField(max_length=32, choices=RECIPIENT_TYPES, default="rops_coordinator")
    subject = models.CharField(max_length=255)
    message = models.TextField()
    
    response = models.TextField(blank=True)
    responder_name = models.CharField(max_length=255, blank=True)
    is_answered = models.BooleanField(default=False)
    is_public_faq = models.BooleanField(default=False, help_text="Czy opublikowane jako publiczne FAQ")

    created_at = models.DateTimeField(default=timezone.now)
    answered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Zapytanie / Dialog"
        verbose_name_plural = "Zapytania / Dialog"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.subject} ({self.author_name})"


class MiddlemanPackage(models.Model):
    """
    Pakiet Wdrożeniowy Usługi Społecznej dla Gminy (Moduł VII: Middleman AI dla JST)
    """
    MUNICIPALITY_TYPES = [
        ("wiejska", "Gmina wiejska"),
        ("miejsko-wiejska", "Gmina miejsko-wiejska"),
        ("miejska", "Gmina miejska"),
    ]

    EXECUTION_MODELS = [
        ("wlasna_kadra", "Realizacja kadrą własną (np. CUS/OPS)"),
        ("zlecenie_ngo", "Zlecenie zadania lokalnemu NGO/PES"),
        ("hybrydowy", "Model partnerski (CUS + NGO)"),
    ]

    innovation = models.ForeignKey(SocialInnovation, on_delete=models.CASCADE, related_name="middleman_packages")
    county = models.ForeignKey(County, on_delete=models.CASCADE, related_name="middleman_packages")
    municipality_name = models.CharField(max_length=128)
    municipality_type = models.CharField(max_length=32, choices=MUNICIPALITY_TYPES, default="wiejska")
    population = models.PositiveIntegerField(default=15000)
    has_cus = models.BooleanField(default=True)
    execution_model = models.CharField(max_length=32, choices=EXECUTION_MODELS, default="zlecenie_ngo")

    service_name = models.CharField(max_length=255)
    service_standard = models.TextField(help_text="Standard i zakres usługi społecznej")
    staffing_requirements = models.JSONField(default=list, help_text="Wymogi kadrowe i kompetencje")
    cost_breakdown = models.JSONField(default=dict, help_text="Szacunkowy roczny budżet i montaż finansowy")
    funding_sources = models.JSONField(default=list, help_text="Źródła finansowania (FERS, PFRON, środki własne)")
    implementation_steps = models.JSONField(default=list, help_text="Harmonogram wdrożenia (3-6 m-cy)")

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = "Pakiet wdrożeniowy Middleman"
        verbose_name_plural = "Pakiety wdrożeniowe Middleman"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Pakiet: {self.service_name} dla {self.municipality_name}"
