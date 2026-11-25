from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.urls import path
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView


def serialize_user(user):
    profile = getattr(user, "lms_profile", None)
    inst = profile.institution if profile else None
    full_name = user.get_full_name() or user.username
    initials = "".join(part[0].upper() for part in full_name.split()[:2]) or "IU"
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": full_name,
        "initials": initials,
        "role": profile.role if profile else "STUDENT",
        "phone": profile.phone if profile else "",
        "institution": {
            "id": inst.id,
            "name": inst.name,
            "initials": inst.initials,
            "subdomain": inst.subdomain,
            "phone": inst.phone,
            "email": inst.email,
        }
        if inst
        else None,
    }


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    email_or_user = (request.data.get("email") or request.data.get("username") or "").strip()
    password = request.data.get("password") or ""

    user = None
    if "@" in email_or_user:
        matched = User.objects.filter(email__iexact=email_or_user).first()
        if matched:
            user = authenticate(username=matched.username, password=password)
    if user is None:
        user = authenticate(username=email_or_user, password=password)

    if user is None:
        return Response(
            {"detail": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": serialize_user(user),
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response(serialize_user(request.user))


urlpatterns = [
    path("login/", login_view, name="auth-login"),
    path("me/", me_view, name="auth-me"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
]
