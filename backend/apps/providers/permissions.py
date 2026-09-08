from rest_framework.permissions import BasePermission

from apps.users.models import ProviderProfile


class IsApprovedProvider(BasePermission):
    """
    Allows access only to users with an approved provider profile.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        try:
            provider_profile = user.provider_profile
        except ProviderProfile.DoesNotExist:
            return False

        return (
            provider_profile.verification_status
            == ProviderProfile.VerificationStatus.APPROVED
        )