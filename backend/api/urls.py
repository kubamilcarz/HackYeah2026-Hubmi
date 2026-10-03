from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    HealthCheckView,
    InnovationCategoryViewSet,
    CountyViewSet,
    SocialInnovationViewSet,
    ProblemSubmissionViewSet,
    MatchmakingAnalyzeView,
    RegionalChallengeViewSet,
    IdeaSubmissionViewSet,
    PilotProjectViewSet,
    PilotEvaluationViewSet,
    PartnershipPostViewSet,
    InquiryViewSet,
    MiddlemanPackageView,
    AdminTrendsView,
    AdminModerationView,
)

router = DefaultRouter()
router.register(r"categories", InnovationCategoryViewSet, basename="category")
router.register(r"counties", CountyViewSet, basename="county")
router.register(r"innovations", SocialInnovationViewSet, basename="innovation")
router.register(r"problems", ProblemSubmissionViewSet, basename="problem")
router.register(r"challenges", RegionalChallengeViewSet, basename="challenge")
router.register(r"ideas", IdeaSubmissionViewSet, basename="idea")
router.register(r"pilots", PilotProjectViewSet, basename="pilot")
router.register(r"evaluations", PilotEvaluationViewSet, basename="evaluation")
router.register(r"partnerships", PartnershipPostViewSet, basename="partnership")
router.register(r"inquiries", InquiryViewSet, basename="inquiry")

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("matchmaking/analyze/", MatchmakingAnalyzeView.as_view(), name="matchmaking-analyze"),
    path("middleman/package/", MiddlemanPackageView.as_view(), name="middleman-package"),
    path("admin/trends/", AdminTrendsView.as_view(), name="admin-trends"),
    path("admin/moderate/<int:pk>/", AdminModerationView.as_view(), name="admin-moderate"),
    path("", include(router.urls)),
]
