from rest_framework.permissions import BasePermission


class IsSuperUser(BasePermission):
    """Only Django superusers may access program CSM APIs."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_superuser)
