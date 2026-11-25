from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ProgramInviteViewSet,
    ProgramPersonViewSet,
    ProgramSeasonViewSet,
    ProgramSessionViewSet,
    PublicProgramSessionViewSet,
)

router = DefaultRouter()
router.register(r"people", ProgramPersonViewSet, basename="program-person")
router.register(r"seasons", ProgramSeasonViewSet, basename="program-season")
router.register(r"sessions", ProgramSessionViewSet, basename="program-session")
router.register(r"invites", ProgramInviteViewSet, basename="program-invite")
router.register(
    r"public-sessions",
    PublicProgramSessionViewSet,
    basename="program-public-session",
)

urlpatterns = [
    path("", include(router.urls)),
]
