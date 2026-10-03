from django.contrib import admin
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


@admin.register(InnovationCategory)
class InnovationCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "icon_name", "order")
    search_fields = ("name", "code", "description")


class MunicipalityInline(admin.TabularInline):
    model = Municipality
    extra = 1


@admin.register(County)
class CountyAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "population", "senior_ratio")
    search_fields = ("name", "summary")
    inlines = [MunicipalityInline]


@admin.register(SocialInnovation)
class SocialInnovationAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "maturity_stage", "innovation_type", "replication_readiness_score", "likes_count", "matches_count")
    list_filter = ("category", "maturity_stage", "innovation_type")
    search_fields = ("title", "short_summary", "full_description", "target_audience")
    prepopulated_fields = {"slug": ("title",)}


class ProblemMatchInline(admin.TabularInline):
    model = ProblemMatch
    extra = 0


@admin.register(ProblemSubmission)
class ProblemSubmissionAdmin(admin.ModelAdmin):
    list_display = ("title", "reporter_name", "reporter_role", "county", "category", "status", "created_at")
    list_filter = ("status", "reporter_role", "category", "county")
    search_fields = ("title", "description", "reporter_name", "reporter_email")
    inlines = [ProblemMatchInline]


@admin.register(RegionalChallenge)
class RegionalChallengeAdmin(admin.ModelAdmin):
    list_display = ("title", "county", "category")
    list_filter = ("category", "county")
    search_fields = ("title", "summary")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(IdeaSubmission)
class IdeaSubmissionAdmin(admin.ModelAdmin):
    list_display = ("title", "submission_type", "applicant_name", "applicant_type", "status", "requested_grant_amount", "created_at")
    list_filter = ("submission_type", "status", "applicant_type", "category")
    search_fields = ("title", "applicant_name", "innovation_description")


class PilotEvaluationInline(admin.TabularInline):
    model = PilotEvaluation
    extra = 0


@admin.register(PilotProject)
class PilotProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "innovation", "status", "county", "current_testers_count", "max_testers")
    list_filter = ("status", "county")
    search_fields = ("title", "summary")
    inlines = [PilotEvaluationInline]


@admin.register(PilotEvaluation)
class PilotEvaluationAdmin(admin.ModelAdmin):
    list_display = ("evaluator_name", "pilot", "evaluator_role", "usability_score", "effectiveness_score", "accessibility_score", "recommend_to_scale")
    list_filter = ("evaluator_role", "recommend_to_scale")


@admin.register(PartnershipPost)
class PartnershipPostAdmin(admin.ModelAdmin):
    list_display = ("title", "organization_name", "organization_type", "looking_for", "county", "is_active", "created_at")
    list_filter = ("organization_type", "looking_for", "county", "is_active")
    search_fields = ("title", "organization_name", "description")


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ("subject", "author_name", "recipient_type", "is_answered", "is_public_faq", "created_at")
    list_filter = ("recipient_type", "is_answered", "is_public_faq")
    search_fields = ("subject", "message", "response", "author_name")


@admin.register(MiddlemanPackage)
class MiddlemanPackageAdmin(admin.ModelAdmin):
    list_display = ("service_name", "municipality_name", "county", "municipality_type", "execution_model", "created_at")
    list_filter = ("municipality_type", "execution_model", "county")
    search_fields = ("service_name", "municipality_name")
