from rest_framework.permissions import BasePermission


class HasCustomerRole(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.user_roles.filter(role__name="customer").exists()
        )
