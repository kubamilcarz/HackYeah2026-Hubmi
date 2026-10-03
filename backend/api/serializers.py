from rest_framework import serializers
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


class InnovationCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = InnovationCategory
        fields = ["id", "code", "name", "description", "icon_name", "order"]


class MunicipalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Municipality
        fields = ["id", "name", "kind", "has_cus"]


class CountySerializer(serializers.ModelSerializer):
    municipalities = MunicipalitySerializer(many=True, read_only=True)

    class Meta:
        model = County
        fields = [
            "id",
            "name",
            "slug",
            "teryt",
            "population",
            "senior_ratio",
            "summary",
            "main_challenges",
            "municipalities",
        ]


class SocialInnovationListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_code = serializers.CharField(source="category.code", read_only=True)

    class Meta:
        model = SocialInnovation
        fields = [
            "id",
            "title",
            "slug",
            "category",
            "category_name",
            "category_code",
            "maturity_stage",
            "innovation_type",
            "short_summary",
            "target_audience",
            "replication_readiness_score",
            "likes_count",
            "matches_count",
            "tags",
        ]


class SocialInnovationDetailSerializer(serializers.ModelSerializer):
    category = InnovationCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=InnovationCategory.objects.all(), source="category", write_only=True
    )
    secondary_categories = InnovationCategorySerializer(many=True, read_only=True)

    class Meta:
        model = SocialInnovation
        fields = [
            "id",
            "title",
            "slug",
            "category",
            "category_id",
            "secondary_categories",
            "maturity_stage",
            "innovation_type",
            "short_summary",
            "full_description",
            "target_audience",
            "implementation_guide",
            "video_url",
            "video_transcript",
            "handbook_pdf_url",
            "author_name",
            "author_organization",
            "author_email",
            "replication_readiness_score",
            "tags",
            "likes_count",
            "matches_count",
            "created_at",
            "updated_at",
        ]


class ProblemMatchSerializer(serializers.ModelSerializer):
    innovation = SocialInnovationListSerializer(read_only=True)

    class Meta:
        model = ProblemMatch
        fields = [
            "id",
            "innovation",
            "similarity_score",
            "justification",
            "suggested_next_step",
            "created_at",
        ]


class ProblemSubmissionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    county_name = serializers.CharField(source="county.name", read_only=True)
    matches = ProblemMatchSerializer(many=True, read_only=True)

    class Meta:
        model = ProblemSubmission
        fields = [
            "id",
            "persona_key",
            "reporter_role",
            "reporter_name",
            "reporter_email",
            "reporter_phone",
            "reporter_institution",
            "county",
            "county_name",
            "municipality_name",
            "category",
            "category_name",
            "title",
            "description",
            "affected_group",
            "estimated_scale",
            "status",
            "admin_notes",
            "matches",
            "created_at",
            "updated_at",
        ]


class MatchmakingAnalyzeRequestSerializer(serializers.Serializer):
    title = serializers.CharField(required=True, max_length=255)
    description = serializers.CharField(required=True)
    category_id = serializers.IntegerField(required=False, allow_null=True)
    category_code = serializers.CharField(required=False, allow_blank=True)
    county_id = serializers.IntegerField(required=False, allow_null=True)
    municipality_name = serializers.CharField(required=False, allow_blank=True)
    affected_group = serializers.CharField(required=False, allow_blank=True)
    estimated_scale = serializers.CharField(required=False, default="gminna")
    persona_key = serializers.CharField(required=False, default="anna_nowak")
    reporter_role = serializers.CharField(required=False, default="mieszkaniec")
    reporter_name = serializers.CharField(required=False, default="Anna Nowak")
    reporter_email = serializers.CharField(required=False, default="anna.nowak@przyklad.pl")
    reporter_phone = serializers.CharField(required=False, default="501 234 567")
    save_submission = serializers.BooleanField(required=False, default=True)


class MatchResultItemSerializer(serializers.Serializer):
    innovation = SocialInnovationListSerializer()
    similarity_score = serializers.FloatField()
    justification = serializers.CharField()
    suggested_next_step = serializers.CharField()


class MatchmakingAnalyzeResponseSerializer(serializers.Serializer):
    submission_id = serializers.IntegerField(allow_null=True)
    is_gap_identified = serializers.BooleanField()
    gap_message = serializers.CharField(allow_blank=True)
    total_matches = serializers.IntegerField()
    top_score = serializers.FloatField()
    matches = MatchResultItemSerializer(many=True)
    recommended_action = serializers.CharField()


class RegionalChallengeSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    county_name = serializers.CharField(source="county.name", read_only=True)
    related_innovations = SocialInnovationListSerializer(many=True, read_only=True)

    class Meta:
        model = RegionalChallenge
        fields = [
            "id",
            "title",
            "slug",
            "category",
            "category_name",
            "county",
            "county_name",
            "summary",
            "full_analysis",
            "statistical_data",
            "key_needs",
            "related_innovations",
        ]


class IdeaSubmissionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    county_name = serializers.CharField(source="county.name", read_only=True)

    class Meta:
        model = IdeaSubmission
        fields = [
            "id",
            "submission_type",
            "persona_key",
            "status",
            "title",
            "category",
            "category_name",
            "county",
            "county_name",
            "applicant_type",
            "applicant_name",
            "applicant_email",
            "applicant_phone",
            "applicant_address",
            "applicant_city",
            "applicant_postal_code",
            "organization_krs",
            "organization_nip",
            "organization_regon",
            "organization_representative",
            "group_members",
            "innovation_description",
            "uniqueness_rationale",
            "problem_diagnosis",
            "target_recipients",
            "expected_change",
            "scalability_model",
            "action_plan_prep",
            "action_plan_testing",
            "requested_grant_amount",
            "team_experience",
            "formal_declarations_accepted",
            "admin_score",
            "admin_feedback",
            "created_at",
            "updated_at",
        ]


class PilotEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PilotEvaluation
        fields = [
            "id",
            "pilot",
            "evaluator_persona_key",
            "evaluator_name",
            "evaluator_role",
            "evaluator_institution",
            "usability_score",
            "effectiveness_score",
            "accessibility_score",
            "barriers_encountered",
            "proposed_improvements",
            "recommend_to_scale",
            "test_environment_notes",
            "created_at",
        ]


class PilotProjectSerializer(serializers.ModelSerializer):
    innovation_title = serializers.CharField(source="innovation.title", read_only=True)
    innovation_slug = serializers.CharField(source="innovation.slug", read_only=True)
    county_name = serializers.CharField(source="county.name", read_only=True)
    evaluations = PilotEvaluationSerializer(many=True, read_only=True)
    evaluations_count = serializers.IntegerField(source="evaluations.count", read_only=True)

    class Meta:
        model = PilotProject
        fields = [
            "id",
            "innovation",
            "innovation_title",
            "innovation_slug",
            "title",
            "status",
            "county",
            "county_name",
            "municipality_name",
            "max_testers",
            "current_testers_count",
            "eligible_roles_description",
            "summary",
            "instructions",
            "start_date",
            "end_date",
            "evaluations_count",
            "evaluations",
        ]


class PartnershipPostSerializer(serializers.ModelSerializer):
    county_name = serializers.CharField(source="county.name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = PartnershipPost
        fields = [
            "id",
            "author_persona_key",
            "title",
            "organization_name",
            "organization_type",
            "county",
            "county_name",
            "municipality_name",
            "category",
            "category_name",
            "looking_for",
            "description",
            "contact_email",
            "contact_phone",
            "is_active",
            "created_at",
        ]


class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = [
            "id",
            "author_persona_key",
            "author_name",
            "author_email",
            "recipient_type",
            "subject",
            "message",
            "response",
            "responder_name",
            "is_answered",
            "is_public_faq",
            "created_at",
            "answered_at",
        ]


class MiddlemanGenerateRequestSerializer(serializers.Serializer):
    innovation_id = serializers.IntegerField(required=True)
    county_id = serializers.IntegerField(required=True)
    municipality_name = serializers.CharField(required=True)
    municipality_type = serializers.ChoiceField(
        choices=["wiejska", "miejsko-wiejska", "miejska"], default="wiejska"
    )
    population = serializers.IntegerField(default=15000)
    has_cus = serializers.BooleanField(default=True)
    execution_model = serializers.ChoiceField(
        choices=["wlasna_kadra", "zlecenie_ngo", "hybrydowy"], default="zlecenie_ngo"
    )


class MiddlemanPackageSerializer(serializers.ModelSerializer):
    innovation_title = serializers.CharField(source="innovation.title", read_only=True)
    county_name = serializers.CharField(source="county.name", read_only=True)

    class Meta:
        model = MiddlemanPackage
        fields = [
            "id",
            "innovation",
            "innovation_title",
            "county",
            "county_name",
            "municipality_name",
            "municipality_type",
            "population",
            "has_cus",
            "execution_model",
            "service_name",
            "service_standard",
            "staffing_requirements",
            "cost_breakdown",
            "funding_sources",
            "implementation_steps",
            "created_at",
        ]


class AdminTrendsResponseSerializer(serializers.Serializer):
    total_submissions = serializers.IntegerField()
    total_ideas = serializers.IntegerField()
    total_pilots = serializers.IntegerField()
    total_partnerships = serializers.IntegerField()
    by_category = serializers.ListField(child=serializers.DictField())
    by_county = serializers.ListField(child=serializers.DictField())
    white_spots = serializers.ListField(child=serializers.DictField())


class AdminModerationSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=["pending", "matched", "gap_identified", "in_progress", "resolved"]
    )
    admin_notes = serializers.CharField(required=False, allow_blank=True)
