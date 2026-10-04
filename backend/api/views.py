import re
from decimal import Decimal
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes, inline_serializer

from .models import (
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
from .serializers import (
    InnovationCategorySerializer,
    CountySerializer,
    MunicipalitySerializer,
    SocialInnovationListSerializer,
    SocialInnovationDetailSerializer,
    ProblemSubmissionSerializer,
    MatchmakingAnalyzeRequestSerializer,
    MatchmakingAnalyzeResponseSerializer,
    RegionalChallengeSerializer,
    IdeaSubmissionSerializer,
    PilotProjectSerializer,
    PilotEvaluationSerializer,
    PartnershipPostSerializer,
    InquirySerializer,
    MiddlemanPackageSerializer,
    MiddlemanGenerateRequestSerializer,
    AdminTrendsResponseSerializer,
    AdminModerationSerializer,
)
from .llm_service import generate_fers_field_assist


STOP_WORDS = {
    "i", "w", "z", "ze", "do", "na", "o", "po", "dla", "oraz", "a", "lub", "albo",
    "jest", "są", "sie", "się", "to", "co", "jak", "nie", "tak", "bardzo", "przez",
    "od", "przy", "aby", "ze", "za", "tym", "ten", "ta", "te", "jako", "który", "która",
}


def extract_keywords(text: str) -> set[str]:
    """Wycina polskie słowa kluczowe o długości min. 3 liter."""
    words = re.findall(r"\b[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]{3,}\b", text.lower())
    return {w for w in words if w not in STOP_WORDS}


class HealthCheckView(APIView):
    """
    Health check endpoint to verify backend service status.
    """
    authentication_classes = []
    permission_classes = []

    @extend_schema(
        summary="Service Health Check",
        responses={200: OpenApiTypes.OBJECT},
    )
    def get(self, request):
        return Response(
            {
                "status": "healthy",
                "service": "Hubmi Backend",
                "version": "1.0.0",
                "timestamp": timezone.now().isoformat(),
            },
            status=status.HTTP_200_OK,
        )


class InnovationCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InnovationCategory.objects.all()
    serializer_class = InnovationCategorySerializer
    lookup_field = "code"


class CountyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = County.objects.prefetch_related("municipalities").all()
    serializer_class = CountySerializer
    lookup_field = "slug"


class SocialInnovationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SocialInnovation.objects.select_related("category").prefetch_related("secondary_categories").all()
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "retrieve":
            return SocialInnovationDetailSerializer
        return SocialInnovationListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get("category")
        stage = self.request.query_params.get("stage")
        kind = self.request.query_params.get("type")
        q = self.request.query_params.get("q")

        if category:
            qs = qs.filter(Q(category__code=category) | Q(secondary_categories__code=category)).distinct()
        if stage:
            qs = qs.filter(maturity_stage=stage)
        if kind:
            qs = qs.filter(innovation_type=kind)
        if q:
            qs = qs.filter(
                Q(title__icontains=q)
                | Q(short_summary__icontains=q)
                | Q(full_description__icontains=q)
                | Q(target_audience__icontains=q)
            )
        return qs

    @action(detail=True, methods=["post"], url_path="like")
    def like(self, request, slug=None):
        innovation = self.get_object()
        innovation.likes_count += 1
        innovation.save(update_fields=["likes_count"])
        return Response({"status": "liked", "likes_count": innovation.likes_count})

    @extend_schema(
        summary="Aktualizacja dojrzałości innowacji (Moduł VI: Panel ROPS)",
        description="Pozwala koordynatorowi ROPS zmienić etap innowacji (np. awansować z testów do sprawdzonej) i zaktualizować wskaźnik replikacji.",
        request=inline_serializer(
            name="InnovationStageUpdate",
            fields={
                "maturity_stage": serializers.ChoiceField(choices=SocialInnovation.STAGE_CHOICES),
                "replication_readiness_score": serializers.IntegerField(required=False),
            },
        ),
        responses={200: SocialInnovationDetailSerializer},
    )
    @action(detail=True, methods=["patch", "post"], url_path="update-stage")
    def update_stage(self, request, slug=None):
        innovation = self.get_object()
        new_stage = request.data.get("maturity_stage")
        if new_stage in dict(SocialInnovation.STAGE_CHOICES):
            innovation.maturity_stage = new_stage
        readiness = request.data.get("replication_readiness_score")
        if readiness is not None:
            try:
                innovation.replication_readiness_score = int(readiness)
            except (ValueError, TypeError):
                pass
        innovation.save()
        return Response(SocialInnovationDetailSerializer(innovation).data)


class MatchmakingAnalyzeView(APIView):
    """
    Moduł I: Matchmaking Społeczny (Obligatoryjny)
    Inteligentny mechanizm analizujący zgłaszany problem i kojarzący go z bazą innowacji ROPS Kraków.
    Gwarantuje 100% działanie offline i transparentne kryteria punktacji.
    """

    @extend_schema(
        request=MatchmakingAnalyzeRequestSerializer,
        responses={200: MatchmakingAnalyzeResponseSerializer},
        summary="Analiza matchmakingowa problemu społecznego",
        description="Analizuje opis problemu, wylicza trafność (0-100%) wobec bazy innowacji ROPS Kraków, generuje uzasadnienie i identyfikuje ewentualne luki.",
    )
    def post(self, request):
        serializer = MatchmakingAnalyzeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        title = data["title"]
        description = data["description"]
        affected_group = data.get("affected_group", "")
        category_id = data.get("category_id")
        category_code = data.get("category_code")
        county_id = data.get("county_id")
        municipality_name = data.get("municipality_name", "")
        save_submission = data.get("save_submission", True)

        category = None
        if category_id:
            category = InnovationCategory.objects.filter(id=category_id).first()
        elif category_code:
            category = InnovationCategory.objects.filter(code=category_code).first()

        county = None
        if county_id:
            county = County.objects.filter(id=county_id).first()

        # Ekstrakcja słów kluczowych ze zgłoszenia
        problem_keywords = extract_keywords(f"{title} {description} {affected_group}")

        all_innovations = SocialInnovation.objects.select_related("category").prefetch_related("secondary_categories").all()
        scored_results = []

        for inn in all_innovations:
            score = 0.0
            reasons = []

            # 1. Spójność kategorialna (do 40 pkt)
            if category:
                if inn.category_id == category.id:
                    score += 40.0
                    reasons.append(f"Zbieżność w głównej kategorii ROPS: {category.name}")
                elif inn.secondary_categories.filter(id=category.id).exists():
                    score += 25.0
                    reasons.append(f"Zbieżność w kategorii powiązanej: {category.name}")
            else:
                score += 15.0  # kategoria niesprecyzowana

            # 2. Analiza słów kluczowych w tytule, opisie i tagach (do 45 pkt)
            inn_text = f"{inn.title} {inn.short_summary} {inn.full_description} {' '.join(inn.tags)}"
            inn_keywords = extract_keywords(inn_text)
            matched_words = problem_keywords.intersection(inn_keywords)

            if matched_words:
                overlap_ratio = min(len(matched_words) / max(len(problem_keywords), 1), 1.0)
                text_points = round(overlap_ratio * 45.0, 1)
                score += text_points
                sample_words = ", ".join(list(matched_words)[:4])
                reasons.append(f"Zgodność kluczowych zagadnień ({sample_words})")

            # 3. Zbieżność grupy docelowej (do 15 pkt)
            if affected_group:
                affected_keywords = extract_keywords(affected_group)
                target_keywords = extract_keywords(inn.target_audience)
                if affected_keywords.intersection(target_keywords):
                    score += 15.0
                    reasons.append(f"Dopasowanie grupy docelowej: {inn.target_audience}")

            # Normalizacja wyniku do zakresu 0 - 97%
            normalized_score = min(round(score, 1), 97.0)

            # Określenie sugerowanego kroku
            has_pilot = PilotProject.objects.filter(innovation=inn, status="recruiting").exists()
            if has_pilot:
                step = "tester"
            elif inn.maturity_stage == "sprawdzona":
                step = "middleman"
            else:
                step = "contact"

            justification = ". ".join(reasons) if reasons else "Ogólne dopasowanie tematyczne w obszarze innowacji społecznych."
            justification += f" Rozwiązanie jest na etapie: {inn.get_maturity_stage_display()}."

            if normalized_score >= 35.0:
                scored_results.append({
                    "innovation": inn,
                    "similarity_score": normalized_score,
                    "justification": justification,
                    "suggested_next_step": step,
                })

        # Sortowanie wg trafności malejąco
        scored_results.sort(key=lambda x: x["similarity_score"], reverse=True)
        top_matches = scored_results[:4]

        is_gap = len(top_matches) == 0 or (top_matches[0]["similarity_score"] < 45.0)

        # Zapis zgłoszenia do bazy jeśli flaga ustawiona
        submission = None
        if save_submission and category:
            submission_status = "gap_identified" if is_gap else "matched"
            submission = ProblemSubmission.objects.create(
                persona_key=data.get("persona_key", "anna_nowak"),
                reporter_role=data.get("reporter_role", "mieszkaniec"),
                reporter_name=data.get("reporter_name", "Anna Nowak"),
                reporter_email=data.get("reporter_email", "anna.nowak@przyklad.pl"),
                reporter_phone=data.get("reporter_phone", "501 234 567"),
                county=county,
                municipality_name=municipality_name,
                category=category,
                title=title,
                description=description,
                affected_group=affected_group,
                estimated_scale=data.get("estimated_scale", "gminna"),
                status=submission_status,
            )

            # Zapis powiązanych dopasowań
            for item in top_matches:
                ProblemMatch.objects.create(
                    submission=submission,
                    innovation=item["innovation"],
                    similarity_score=item["similarity_score"],
                    justification=item["justification"],
                    suggested_next_step=item["suggested_next_step"],
                )
                item["innovation"].matches_count += 1
                item["innovation"].save(update_fields=["matches_count"])

        gap_message = ""
        if is_gap:
            gap_message = (
                "W bazie ROPS Kraków nie zidentyfikowano jeszcze bezpośredniej innowacji dla tak sformułowanej potrzeby. "
                "Twoje zgłoszenie zostało zarejestrowane jako 'Biała plama' (Luka społeczna). "
                "Możesz od razu przekształcić ten problem w pomysł na nową innowację w Kreatorze Pomysłów i ubiegać się o mikrogrant FERS do 50 000 zł!"
            )
            recommended_action = "kreator"
        else:
            recommended_action = top_matches[0]["suggested_next_step"]

        serialized_matches = [
            {
                "innovation": SocialInnovationListSerializer(item["innovation"]).data,
                "similarity_score": item["similarity_score"],
                "justification": item["justification"],
                "suggested_next_step": item["suggested_next_step"],
            }
            for item in top_matches
        ]

        return Response(
            {
                "submission_id": submission.id if submission else None,
                "is_gap_identified": is_gap,
                "gap_message": gap_message,
                "total_matches": len(serialized_matches),
                "top_score": top_matches[0]["similarity_score"] if top_matches else 0.0,
                "matches": serialized_matches,
                "recommended_action": recommended_action,
            },
            status=status.HTTP_200_OK,
        )


class ProblemSubmissionViewSet(viewsets.ModelViewSet):
    queryset = ProblemSubmission.objects.select_related("category", "county").prefetch_related("matches__innovation").all()
    serializer_class = ProblemSubmissionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get("status")
        county = self.request.query_params.get("county")
        persona = self.request.query_params.get("persona")

        if status_param:
            qs = qs.filter(status=status_param)
        if county:
            qs = qs.filter(county__slug=county)
        if persona:
            qs = qs.filter(persona_key=persona)
        category = self.request.query_params.get("category")
        if category:
            if category.isdigit():
                qs = qs.filter(category_id=int(category))
            else:
                qs = qs.filter(category__code=category)
        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(
                Q(title__icontains=q)
                | Q(description__icontains=q)
                | Q(reporter_name__icontains=q)
                | Q(affected_group__icontains=q)
            )
        return qs


class RegionalChallengeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RegionalChallenge.objects.select_related("category", "county").prefetch_related("related_innovations").all()
    serializer_class = RegionalChallengeSerializer
    lookup_field = "slug"


class IdeaSubmissionViewSet(viewsets.ModelViewSet):
    queryset = IdeaSubmission.objects.select_related("category", "county").all()
    serializer_class = IdeaSubmissionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        sub_type = self.request.query_params.get("type")
        status_param = self.request.query_params.get("status")
        persona = self.request.query_params.get("persona")

        if sub_type:
            qs = qs.filter(submission_type=sub_type)
        if status_param:
            qs = qs.filter(status=status_param)
        if persona:
            qs = qs.filter(persona_key=persona)
        return qs

    @extend_schema(
        summary="Asystent AI Kreatora Innowacji",
        description="Generuje rekomendacje AI dla poszczególnych sekcji formularza FERS (deinstytucjonalizacja, wyróżniki, diagnoza powiatowa, budżet, schemat).",
    )
    @action(detail=False, methods=["post"], url_path="ai-assist")
    def ai_assist(self, request):
        field_type = request.data.get("field", "deinstitutionalization")
        title = request.data.get("title", "Innowacja społeczna")
        category_val = request.data.get("category")
        county_val = request.data.get("county")
        recipients = request.data.get("target_recipients", "")
        concept = request.data.get("concept", "")

        category_obj = None
        if category_val:
            category_obj = InnovationCategory.objects.filter(
                Q(id=category_val) if str(category_val).isdigit() else Q(code=category_val)
            ).first()

        county_obj = None
        if county_val:
            county_obj = County.objects.filter(
                Q(id=county_val) if str(county_val).isdigit() else Q(slug=county_val)
            ).first()

        cat_name = category_obj.name if category_obj else "Włączenie społeczne"
        county_name = county_obj.name if county_obj else "Małopolska"

        # Dane statystyczne powiatu do promptu / diagnozy
        county_stats = {
            "senior_ratio": f"{county_obj.senior_ratio:.1f}%" if (county_obj and county_obj.senior_ratio) else "22.8%",
            "population": f"{county_obj.population:,}".replace(",", " ") if (county_obj and county_obj.population) else "powyżej 100 tys.",
            "challenges": list(county_obj.main_challenges or []) if county_obj else [],
        }
        if county_obj:
            for rc in RegionalChallenge.objects.filter(county=county_obj):
                if rc.title not in county_stats["challenges"]:
                    county_stats["challenges"].append(rc.title)

        # 1. Próba wygenerowania przez OpenAI API (jeśli klucz jest skonfigurowany)
        llm_response = generate_fers_field_assist(
            field_type=field_type,
            title=title,
            category_name=cat_name,
            county_name=county_name,
            county_stats=county_stats,
            recipients=recipients,
            concept=concept,
        )
        if llm_response is not None:
            if field_type == "county_diagnosis":
                llm_response.setdefault("county", county_name)
            return Response(llm_response)

        # 2. Rezerwowy silnik deterministyczny (fallback)
        if field_type == "deinstitutionalization":
            suggestion = (
                f"Rekomendacja deinstytucjonalizacji (ROPS Kraków): Wpisz innowację w model usług "
                f"świadczonych w środowisku lokalnym jako alternatywę dla opieki całodobowej w instytucjach (DPS/ZOL). "
                f"Dla kategorii «{cat_name}» wskaż, jak {title} umożliwia beneficjentom samodzielne funkcjonowanie "
                f"we własnym mieszkaniu, opierając się na wsparciu sąsiedzkim, mobilnych opiekunach i technologii asystującej."
            )
            return Response({"field": field_type, "suggestion": suggestion})

        elif field_type == "innovation_uniqueness":
            suggestion = (
                f"Wyróżniki innowacyjności (na tle Polski i UE): W odróżnieniu od tradycyjnych form wsparcia, "
                f"projekt «{title}» eliminuje bariery geograficzne w powiatach Małopolski, obniża koszty "
                f"jednostkowe wsparcia o min. 35% w porównaniu z placówkami stacjonarnymi oraz włącza lokalną społeczność "
                f"w rolę współtwórców rozwiązania (co-design zgodny ze standardami FERS Działanie 5.1)."
            )
            return Response({"field": field_type, "suggestion": suggestion})

        elif field_type == "county_diagnosis":
            challenges = []
            senior_ratio = "23.5"
            population_str = "powyżej 100 tys."
            if county_obj:
                senior_ratio = f"{county_obj.senior_ratio:.1f}" if county_obj.senior_ratio else "22.8"
                if county_obj.population:
                    population_str = f"{county_obj.population:,} mieszkańców".replace(",", " ")
                if county_obj.main_challenges:
                    challenges.extend(county_obj.main_challenges)
                rc_qs = RegionalChallenge.objects.filter(county=county_obj)
                for rc in rc_qs:
                    if rc.title not in challenges:
                        challenges.append(rc.title)

            challenges_str = (
                ", ".join(challenges) if challenges else "dostępność usług społecznych, samotność i starzenie się społeczności"
            )
            diagnosis_text = (
                f"Na podstawie Raportu Obserwatorium Polityki Społecznej ROPS Kraków dla obszaru: {county_name}.\n"
                f"• Liczba ludności powiatu: {population_str}.\n"
                f"• Wskaźnik starości demograficznej: {senior_ratio}% mieszkańców w wieku senioralnym (60+).\n"
                f"• Zdiagnozowane wyzwania strategiczne: {challenges_str}.\n"
                f"Diagnoza wskazuje na pilną konieczność wdrożenia innowacji «{title}» z uwagi na deficyt lokalnych "
                f"kadr opiekuńczych i dysproporcje w dostępie do usług między ośrodkami miejskimi a sołectwami."
            )
            return Response({
                "field": field_type,
                "county": county_name,
                "senior_ratio": senior_ratio,
                "challenges": challenges,
                "suggestion": diagnosis_text,
            })

        elif field_type == "scalability":
            suggestion = (
                f"Model replikacji w Małopolsce: Rozwiązanie zostało zaprojektowane modularnie, dzięki czemu "
                f"po zakończeniu grantu mikroinnowacji (FERS) może zostać zaadaptowane przez dowolne Centrum Usług Społecznych "
                f"(CUS) lub Ośrodek Pomocy Społecznej w Małopolsce w formie Programu Usług Społecznych (PUS). "
                f"Podręcznik wdrożeniowy i standardy procedur zostaną udostępnione w formule Open Source na platformie Splot."
            )
            return Response({"field": field_type, "suggestion": suggestion})

        elif field_type == "budget_action_plan":
            prep_plan = [
                {
                    "dzialanie": "Opracowanie standardu innowacji, regulaminu i procedur bezpieczeństwa",
                    "termin": "Miesiąc 1-2",
                    "koszt": 8000,
                },
                {
                    "dzialanie": "Szkolenie zespołu wdrożeniowego i adaptacja narzędzi testowych",
                    "termin": "Miesiąc 2-3",
                    "koszt": 6000,
                },
            ]
            testing_plan = [
                {
                    "dzialanie": "Pilotażowe wdrożenie u min. 25 beneficjentów w wybranym powiecie",
                    "termin": "Miesiące 4-9",
                    "koszt": 32000,
                    "liczba_testerow": 25,
                },
                {
                    "dzialanie": "Audyt dostępności WCAG 2.2, badanie ewaluacyjne i raport końcowy",
                    "termin": "Miesiące 10-12",
                    "koszt": 4000,
                    "liczba_testerow": 25,
                },
            ]
            return Response({
                "field": field_type,
                "action_plan_prep": prep_plan,
                "action_plan_testing": testing_plan,
                "requested_grant_amount": 50000,
                "suggestion": "Wygenerowano optymalny harmonogram i budżet FERS: 14 000 PLN faza przygotowawcza + 36 000 PLN faza testowa = 50 000 PLN (maksymalny limit mikrograntu).",
            })

        elif field_type == "concept_diagram":
            target = recipients or "Mieszkańcy Małopolski zagrożeni wykluczeniem"
            mermaid_code = (
                f"graph TD\n"
                f"  A[\"Diagnoza: {county_name}<br/>Potrzeby odbiorców: {target}\"] --> B[\"Innowacja: {title}<br/>Kategoria: {cat_name}\"]\n"
                f"  B --> C[\"Faza Przygotowawcza (3 m-ce)<br/>Standard usługi & zespół\"]\n"
                f"  C --> D[\"Faza Testowa (9 m-cy)<br/>Pilotaż u 25 testerów\"]\n"
                f"  D --> E[\"Rezultat deinstytucjonalizacji<br/>Trwałe włączenie & replikacja w CUS\"]\n"
            )
            steps = [
                {"title": "Diagnoza lokalna", "description": f"Wyzwania i potrzeby grupy: {target} w {county_name}"},
                {"title": "Innowacyjne rozwiązanie", "description": f"{title} w kategorii {cat_name}"},
                {"title": "Okres przygotowawczy", "description": "Procedury, szkolenia kadry, standard (maks. 3 m-ce)"},
                {"title": "Okres testowania", "description": "Pilotaż u min. 25 osób z ewaluacją WCAG (maks. 9 m-cy)"},
                {"title": "Trwała zmiana i skalowanie", "description": "Deinstytucjonalizacja i wdrożenie w CUS/JST"},
            ]
            return Response({
                "field": field_type,
                "mermaid_code": mermaid_code,
                "steps": steps,
            })

        return Response({"field": field_type, "suggestion": "Wskazówka asystenta innowacji ROPS Kraków."})

    @action(detail=True, methods=["post"], url_path="evaluate")
    def evaluate(self, request, pk=None):
        """Ocena wniosku przez koordynatora ROPS Kraków"""
        idea = self.get_object()
        score = request.data.get("score")
        feedback = request.data.get("feedback", "")
        new_status = request.data.get("status", "zaakceptowany")

        if score is not None:
            idea.admin_score = float(score)
        idea.admin_feedback = feedback
        idea.status = new_status
        idea.save()
        return Response(IdeaSubmissionSerializer(idea).data)


class PilotProjectViewSet(viewsets.ModelViewSet):
    queryset = PilotProject.objects.select_related("innovation", "county").prefetch_related("evaluations").all()
    serializer_class = PilotProjectSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get("status")
        county_param = self.request.query_params.get("county")
        innovation_param = self.request.query_params.get("innovation")
        q = self.request.query_params.get("q")

        if status_param:
            qs = qs.filter(status=status_param)
        if county_param:
            qs = qs.filter(county__slug=county_param)
        if innovation_param:
            if innovation_param.isdigit():
                qs = qs.filter(innovation_id=int(innovation_param))
            else:
                qs = qs.filter(innovation__slug=innovation_param)
        if q:
            qs = qs.filter(
                Q(title__icontains=q)
                | Q(summary__icontains=q)
                | Q(municipality_name__icontains=q)
                | Q(innovation__title__icontains=q)
            )
        return qs

    @action(detail=True, methods=["post"], url_path="apply")
    def apply_as_tester(self, request, pk=None):
        pilot = self.get_object()
        if pilot.current_testers_count >= pilot.max_testers:
            return Response(
                {"error": "Limit miejsc na ten pilotaż został wyczerpany."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        pilot.current_testers_count += 1
        pilot.save(update_fields=["current_testers_count"])
        applicant_name = request.data.get("applicant_name", "")
        name_part = f" {applicant_name}" if applicant_name else ""
        return Response({
            "status": "applied",
            "message": f"Dziękujemy{name_part}! Twoje zgłoszenie do udziału w testach zostało pomyślnie przyjęte. Koordynator ROPS skontaktuje się z Tobą.",
            "current_testers_count": pilot.current_testers_count,
            "max_testers": pilot.max_testers,
        })


class PilotEvaluationViewSet(viewsets.ModelViewSet):
    queryset = PilotEvaluation.objects.select_related("pilot__innovation").all()
    serializer_class = PilotEvaluationSerializer


class PartnershipPostViewSet(viewsets.ModelViewSet):
    queryset = PartnershipPost.objects.select_related("county", "category").filter(is_active=True).order_by("-created_at")
    serializer_class = PartnershipPostSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        looking_for = self.request.query_params.get("looking_for")
        county = self.request.query_params.get("county")
        category = self.request.query_params.get("category")
        org_type = self.request.query_params.get("organization_type")
        q = self.request.query_params.get("q")

        if looking_for and looking_for != "all":
            qs = qs.filter(looking_for=looking_for)
        if org_type and org_type != "all":
            qs = qs.filter(organization_type=org_type)
        if county and county != "all":
            if county.isdigit():
                qs = qs.filter(county_id=int(county))
            else:
                qs = qs.filter(county__slug=county)
        if category and category != "all":
            if category.isdigit():
                qs = qs.filter(category_id=int(category))
            else:
                qs = qs.filter(category__code=category)
        if q:
            qs = qs.filter(
                Q(title__icontains=q)
                | Q(organization_name__icontains=q)
                | Q(description__icontains=q)
                | Q(municipality_name__icontains=q)
            )
        return qs


class InquiryViewSet(viewsets.ModelViewSet):
    queryset = Inquiry.objects.all().order_by("-created_at")
    serializer_class = InquirySerializer

    def get_queryset(self):
        qs = super().get_queryset()
        only_faq = self.request.query_params.get("faq")
        recipient = self.request.query_params.get("recipient_type")
        is_answered = self.request.query_params.get("is_answered")
        q = self.request.query_params.get("q")

        if only_faq in ("true", "1"):
            qs = qs.filter(is_public_faq=True, is_answered=True)
        if recipient and recipient != "all":
            qs = qs.filter(recipient_type=recipient)
        if is_answered in ("true", "1"):
            qs = qs.filter(is_answered=True)
        elif is_answered in ("false", "0"):
            qs = qs.filter(is_answered=False)
        if q:
            qs = qs.filter(
                Q(subject__icontains=q)
                | Q(message__icontains=q)
                | Q(response__icontains=q)
                | Q(author_name__icontains=q)
            )
        return qs

    @action(detail=True, methods=["post"], url_path="respond")
    def respond(self, request, pk=None):
        inquiry = self.get_object()
        response_text = request.data.get("response", "")
        responder_name = request.data.get("responder_name", "Koordynator ROPS")
        make_faq = request.data.get("is_public_faq", False)

        inquiry.response = response_text
        inquiry.responder_name = responder_name
        inquiry.is_answered = True
        inquiry.is_public_faq = bool(make_faq)
        inquiry.answered_at = timezone.now()
        inquiry.save()

        return Response(InquirySerializer(inquiry).data)


class MiddlemanPackageView(APIView):
    """
    Moduł VII: Middleman Innowacji (Asystent AI dla JST)
    Generuje kompletny pakiet wdrożeniowy usługi społecznej dla wybranej gminy na bazie innowacji ROPS
    oraz umożliwia przeglądanie zapisanych pakietów wdrożeniowych.
    """

    @extend_schema(
        parameters=[
            OpenApiParameter("id", int, OpenApiParameter.QUERY, description="ID konkretnego pakietu"),
            OpenApiParameter("municipality", str, OpenApiParameter.QUERY, description="Filtruj wg nazwy gminy"),
            OpenApiParameter("innovation_id", int, OpenApiParameter.QUERY, description="Filtruj wg ID innowacji"),
            OpenApiParameter("county_id", int, OpenApiParameter.QUERY, description="Filtruj wg ID powiatu"),
        ],
        responses={200: MiddlemanPackageSerializer(many=True)},
        summary="Pobieranie wygenerowanych pakietów wdrożeniowych JST (Middleman)",
    )
    def get(self, request):
        qs = MiddlemanPackage.objects.select_related("innovation", "county").all()
        pk = request.query_params.get("id")
        if pk:
            obj = qs.filter(id=pk).first()
            if not obj:
                return Response({"error": "Nie znaleziono pakietu"}, status=status.HTTP_404_NOT_FOUND)
            return Response(MiddlemanPackageSerializer(obj).data)

        muni = request.query_params.get("municipality")
        if muni:
            qs = qs.filter(municipality_name__icontains=muni)
        inn_id = request.query_params.get("innovation_id")
        if inn_id:
            qs = qs.filter(innovation_id=inn_id)
        county_id = request.query_params.get("county_id")
        if county_id:
            qs = qs.filter(county_id=county_id)

        return Response(MiddlemanPackageSerializer(qs[:50], many=True).data)

    @extend_schema(
        request=MiddlemanGenerateRequestSerializer,
        responses={201: MiddlemanPackageSerializer},
        summary="Generowanie pakietu wdrożeniowego usługi dla samorządu (Middleman)",
    )
    def post(self, request):
        serializer = MiddlemanGenerateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        innovation = SocialInnovation.objects.filter(id=data["innovation_id"]).first()
        if not innovation:
            return Response({"error": "Nie znaleziono innowacji"}, status=status.HTTP_404_NOT_FOUND)

        county = County.objects.filter(id=data["county_id"]).first()
        if not county:
            return Response({"error": "Nie znaleziono powiatu"}, status=status.HTTP_404_NOT_FOUND)

        municipality_name = data["municipality_name"]
        m_type = data.get("municipality_type", "wiejska")
        population = data.get("population", 15000)
        has_cus = data.get("has_cus", True)
        exec_model = data.get("execution_model", "zlecenie_ngo")

        # Tytuł pakietu wdrożeniowego
        service_name = f"Lokalna Usługa Społeczna: {innovation.title} dla mieszkańców gminy {municipality_name}"

        # Standard usługi z uwzględnieniem specyfiki innowacji, typu gminy i modelu realizacji
        type_desc = {
            "wiejska": "gminie wiejskiej o rozproszonej strukturze osadniczej",
            "miejsko-wiejska": "gminie miejsko-wiejskiej łączącej ośrodek miejski z sołectwami",
            "miejska": "miejskim ośrodku samorządowym",
        }.get(m_type, f"gminie {municipality_name}")

        org_framework = (
            "Centrum Usług Społecznych (CUS) w oparciu o Program Usług Społecznych (PUS), "
            "zgodnie z ustawą z dnia 19 lipca 2019 r. o realizowaniu usług społecznych przez centrum usług społecznych. "
            "Koordynację wsparcia i kwalifikację uczestników prowadzi Koordynator Indywidualnych Planów Usług Społecznych"
            if has_cus
            else "Ośrodek Pomocy Społecznej (OPS) w ramach zadań własnych gminy z zakresu polityki społecznej "
            "i wsparcia środowiskowego (ustawa o pomocy społecznej)"
        )

        exec_desc = {
            "zlecenie_ngo": "zlecenie realizacji zadania publicznego lokalnym organizacjom pozarządowym (NGO) / PES w trybie otwartego konkursu ofert lub trybu małych zleceń (art. 19a ustawy o pożytku publicznym)",
            "hybrydowy": "partnerstwo publiczno-społeczne (CUS/OPS kwalifikuje uczestników, a wyspecjalizowana organizacja pozarządowa prowadzi bezpośrednie działania animacyjno-terapeutyczne)",
            "wlasna_kadra": "bezpośrednia realizacja kadrą własną jednostki samorządowej (CUS/OPS) po ukończeniu warsztatów ROPS Kraków",
        }.get(exec_model, "współpraca samorządowo-społeczna")

        rural_delivery = (
            " Z uwagi na uwarunkowania terytorialne usługa obejmuje mobilny zespół wyjazdowy docierający bezpośrednio "
            "do sołectw gminy oraz transport door-to-door dla osób z trudnościami w poruszaniu się."
            if m_type == "wiejska"
            else " Usługa świadczona jest w formule stacjonarnej w lokalnym centrum aktywności oraz w formie wizyt środowiskowych."
        )

        service_standard = (
            f"1. ZAKRES I METODOLOGIA: Wdrożenie certyfikowanej innowacji społecznej ROPS Kraków '{innovation.title}' "
            f"w {type_desc} ({population} mieszkańców, powiat {county.name}).\n"
            f"2. ODBIORCY: Usługa dedykowana grupie: {innovation.target_audience}.\n"
            f"3. RAMY ORGANIZACYJNE: Realizacja poprzez {org_framework}.\n"
            f"4. MODEL WYKONAWCZY: Formuła realizacji: {exec_desc}.\n"
            f"5. LOGISTYKA I DOSTĘPNOŚĆ:{rural_delivery} Wszystkie materiały, procedury i narzędzia cyfrowe "
            f"spełniają standard dostępności cyfrowej WCAG 2.2 AA oraz wymogi ustawy o zapewnianiu dostępności osobom ze szczególnymi potrzebami.\n"
            f"6. CZAS I WYMIAR: Świadczenie wsparcia w minimalnym wymiarze 20-30 godzin bezpośrednich sesji tygodniowo "
            f"przez 6-miesięczny cykl pilotażowy z możliwością kontynuacji."
        )

        # Wymogi kadrowe dostosowane do innowacji i wielkości gminy
        hours_coord = "1.0 etat" if population > 25000 else "0.5 etatu"
        staffing_requirements = [
            {
                "role": "Koordynator Usługi Społecznej (CUS/OPS)",
                "allocation": hours_coord,
                "qualifications": "Wykształcenie wyższe (praca socjalna, pedagogika, zarządzanie w polityce społecznej lub certyfikat koordynatora CUS).",
            },
            {
                "role": f"Specjalista / Animator metody '{innovation.title}'",
                "allocation": "1.0 etat (lub ekwiwalent zleceń)",
                "qualifications": f"Certyfikat ukończenia warsztatu wdrożeniowego ROPS Kraków z zakresu innowacji '{innovation.title}'. Doświadczenie w pracy z grupą docelową.",
            },
        ]

        if m_type == "wiejska" or population > 20000:
            staffing_requirements.append({
                "role": "Asystent mobilny / Kierowca transportu door-to-door",
                "allocation": "0.5 etatu (umowa zlecenie)",
                "qualifications": "Prawo jazdy kat. B, ukończone szkolenie z pierwszej pomocy i asysty osobom ze szczególnymi potrzebami.",
            })

        # Kalkulacja kosztów (dostosowana do wielkości gminy)
        base_annual = 50000 if population < 10000 else (80000 if population < 30000 else 130000)
        staff_costs = round(base_annual * 0.65)
        tools_costs = round(base_annual * 0.20)
        operating_costs = round(base_annual * 0.15)

        cost_breakdown = {
            "annual_total_pln": base_annual,
            "staff_compensation_pln": staff_costs,
            "materials_and_innovation_license_pln": tools_costs,
            "operational_and_travel_pln": operating_costs,
        }

        fers_pln = round(base_annual * 0.70)
        own_pln = round(base_annual * 0.15)
        pfron_pln = base_annual - fers_pln - own_pln

        funding_sources = [
            {
                "source": "Program FERS Działanie 5.1 (Grant Wdrożeniowy ROPS Kraków)",
                "percentage": 70,
                "amount_pln": fers_pln,
            },
            {
                "source": f"Środki własne gminy {municipality_name} / budżet CUS/OPS",
                "percentage": 15,
                "amount_pln": own_pln,
            },
            {
                "source": "PFRON / Programy wyrównywania różnic między regionami",
                "percentage": 15,
                "amount_pln": pfron_pln,
            },
        ]

        steps_m2 = (
            f"Ogłoszenie otwartego konkursu ofert dla lokalnych NGO na Giełdzie Współpracy platformy Splot. Przeszkolenie kadry w ROPS Kraków."
            if exec_model != "wlasna_kadra"
            else f"Wewnętrzny nabór i certyfikacja kadry w ROPS Kraków z metodyki '{innovation.title}' oraz odbiór pakietów wdrożeniowych."
        )

        implementation_steps = [
            {
                "month": "Miesiąc 1",
                "step": f"Przyjęcie uchwały Rady Gminy {municipality_name} w sprawie Programu Usług Społecznych (PUS) lub zarządzenia Wójta/Burmistrza.",
            },
            {
                "month": "Miesiąc 2",
                "step": steps_m2,
            },
            {
                "month": "Miesiąc 3",
                "step": f"Kampania informacyjna w gminie {municipality_name}, rekrutacja pierwszych 25-50 uczestników i adaptacja przestrzeni/sprzętu.",
            },
            {
                "month": "Miesiące 4-5",
                "step": f"Bezpośrednie świadczenie usługi '{innovation.title}', mobilne dyżury w sołectwach oraz monitoring satysfakcji odbiorców.",
            },
            {
                "month": "Miesiąc 6",
                "step": f"Ewaluacja końcowa etapu pilotażowego, raport wdrożeniowy do ROPS Kraków oraz decyzja o trwałym finansowaniu usługi.",
            },
        ]

        resolution_template = (
            f"UCHWAŁA NR ....../2026\n"
            f"RADY GMINY {municipality_name.upper()}\n"
            f"z dnia .................... 2026 r.\n\n"
            f"w sprawie przyjęcia Programu Wdrożenia Lokalnej Usługi Społecznej\n"
            f"\"{innovation.title}\" w Gminie {municipality_name} na bazie innowacji ROPS Kraków\n\n"
            f"Na podstawie art. 18 ust. 2 pkt 15 ustawy z dnia 8 marca 1990 r. o samorządzie gminnym (Dz. U. z 2024 r. poz. 609) "
            f"oraz art. 4 ust. 1 ustawy z dnia 19 lipca 2019 r. o realizowaniu usług społecznych przez centrum usług społecznych (Dz. U. z 2019 r. poz. 1818), "
            f"Rada Gminy {municipality_name} uchwala, co następuje:\n\n"
            f"§ 1. Przyjmuje się do realizacji na terenie Gminy {municipality_name} Program Wdrożenia Lokalnej Usługi Społecznej \"{innovation.title}\", "
            f"stanowiący odpowiedź na potrzeby mieszkańców powiatu {county.name} w zakresie: {innovation.target_audience}.\n\n"
            f"§ 2. 1. Usługa realizowana będzie w modelu: {exec_desc}.\n"
            f"2. Szacowany roczny koszt realizacji programu wynosi {base_annual:,} PLN, z czego 70% stanowi dofinansowanie "
            f"w ramach programu FERS Działanie 5.1 za pośrednictwem ROPS Kraków, 15% środki PFRON, a 15% wkład własny Gminy {municipality_name}.\n\n"
            f"§ 3. Wykonanie uchwały powierza się Wójtowi / Burmistrzowi Gminy {municipality_name}.\n\n"
            f"§ 4. Uchwała wchodzi w życie z dniem podjęcia."
        )

        package = MiddlemanPackage.objects.create(
            innovation=innovation,
            county=county,
            municipality_name=municipality_name,
            municipality_type=m_type,
            population=population,
            has_cus=has_cus,
            execution_model=exec_model,
            service_name=service_name,
            service_standard=service_standard,
            staffing_requirements=staffing_requirements,
            cost_breakdown=cost_breakdown,
            funding_sources=funding_sources,
            implementation_steps=implementation_steps,
            resolution_template=resolution_template,
        )

        return Response(MiddlemanPackageSerializer(package).data, status=status.HTTP_201_CREATED)


class AdminTrendsView(APIView):
    """
    Moduł VI: Panel Administratora ROPS & Moduł II: Analityka Trendów
    Agreguje potrzeby z całego regionu, wskazuje 'Białe plamy' i dynamikę zgłoszeń.
    """

    @extend_schema(
        responses={200: AdminTrendsResponseSerializer},
        summary="Analityka trendów regionalnych Małopolski",
    )
    def get(self, request):
        total_submissions = ProblemSubmission.objects.count()
        total_ideas = IdeaSubmission.objects.count()
        total_pilots = PilotProject.objects.count()
        total_partnerships = PartnershipPost.objects.count()

        categories = InnovationCategory.objects.all()
        by_category = []
        for cat in categories:
            prob_count = ProblemSubmission.objects.filter(category=cat).count()
            inn_count = SocialInnovation.objects.filter(category=cat).count()
            by_category.append({
                "category_id": cat.id,
                "category_name": cat.name,
                "category_code": cat.code,
                "submissions_count": prob_count,
                "innovations_count": inn_count,
            })

        counties = County.objects.all()
        by_county = []
        for c in counties:
            prob_count = ProblemSubmission.objects.filter(county=c).count()
            by_county.append({
                "county_id": c.id,
                "county_name": c.name,
                "population": c.population,
                "senior_ratio": c.senior_ratio,
                "submissions_count": prob_count,
            })

        # Zidentyfikowane Białe Plamy (zgłoszenia ze statusem gap_identified lub kategorie bez innowacji)
        gaps_submissions = ProblemSubmission.objects.filter(status="gap_identified").select_related("category", "county")
        white_spots = [
            {
                "submission_id": sub.id,
                "title": sub.title,
                "category_name": sub.category.name,
                "county_name": sub.county.name if sub.county else "Województwo",
                "affected_group": sub.affected_group,
                "reported_at": sub.created_at.isoformat(),
            }
            for sub in gaps_submissions
        ]

        return Response(
            {
                "total_submissions": total_submissions,
                "total_ideas": total_ideas,
                "total_pilots": total_pilots,
                "total_partnerships": total_partnerships,
                "by_category": by_category,
                "by_county": by_county,
                "white_spots": white_spots,
            },
            status=status.HTTP_200_OK,
        )


class AdminModerationView(APIView):
    """
    Moderacja pojedynczego zgłoszenia potrzeby przez koordynatora ROPS
    """

    @extend_schema(
        request=AdminModerationSerializer,
        responses={200: ProblemSubmissionSerializer},
        summary="Moderacja zgłoszenia potrzeby",
    )
    def patch(self, request, pk):
        submission = ProblemSubmission.objects.filter(pk=pk).first()
        if not submission:
            return Response({"error": "Nie znaleziono zgłoszenia"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminModerationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        submission.status = serializer.validated_data["status"]
        if "admin_notes" in serializer.validated_data:
            submission.admin_notes = serializer.validated_data["admin_notes"]
        submission.save()

        return Response(ProblemSubmissionSerializer(submission).data, status=status.HTTP_200_OK)
