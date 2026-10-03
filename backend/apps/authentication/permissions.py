from rest_framework.permissions import BasePermission


class HasRole(BasePermission):
    required_roles = set()

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        user_roles = set(
            request.user.user_roles.values_list(
                "role__name",
                flat=True,
            )
        )

        return bool(user_roles & self.required_roles)


class IsAdmin(HasRole):
    required_roles = {"admin"}