from django.shortcuts import get_object_or_404

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.permissions import IsAdmin
from apps.users.models import ProviderProfile

from .admin_serializers import ProviderApprovalSerializer
from .serializers import ProviderRegistrationSerializer


class ProviderRegistrationView(generics.CreateAPIView):
    serializer_class = ProviderRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()


class PendingProviderListView(generics.ListAPIView):
    """
    Returns provider applications awaiting admin review.
    """

    serializer_class = ProviderApprovalSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return (
            ProviderProfile.objects
            .filter(
                verification_status=ProviderProfile.VerificationStatus.PENDING
            )
            .select_related("user")
            .order_by("-created_at")
        )


class ApproveProviderView(APIView):
    """
    Approves a pending provider application.
    """

    permission_classes = [IsAdmin]

    def post(self, request, provider_id):
        provider = get_object_or_404(
            ProviderProfile,
            id=provider_id,
        )

        if (
            provider.verification_status
            != ProviderProfile.VerificationStatus.PENDING
        ):
            return Response(
                {
                    "detail": (
                        "Only pending provider applications "
                        "can be approved."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        provider.verification_status = (
            ProviderProfile.VerificationStatus.APPROVED
        )

        provider.rejection_reason = ""
        provider.save(
            update_fields=[
                "verification_status",
                "rejection_reason",
                "updated_at",
            ]
        )

        return Response(
            {
                "detail": "Provider approved successfully."
            },
            status=status.HTTP_200_OK,
        )


class RejectProviderView(APIView):
    """
    Rejects a pending provider application.
    """

    permission_classes = [IsAdmin]

    def post(self, request, provider_id):
        provider = get_object_or_404(
            ProviderProfile,
            id=provider_id,
        )

        if (
            provider.verification_status
            != ProviderProfile.VerificationStatus.PENDING
        ):
            return Response(
                {
                    "detail": (
                        "Only pending provider applications "
                        "can be rejected."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = request.data.get("reason", "").strip()

        if not reason:
            return Response(
                {
                    "reason": "A rejection reason is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        provider.verification_status = (
            ProviderProfile.VerificationStatus.REJECTED
        )
        provider.rejection_reason = reason

        provider.save(
            update_fields=[
                "verification_status",
                "rejection_reason",
                "updated_at",
            ]
        )

        return Response(
            {
                "detail": "Provider rejected successfully."
            },
            status=status.HTTP_200_OK,
        )

class MyProviderProfileView(generics.RetrieveAPIView):
    serializer_class = ProviderApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return get_object_or_404(
            ProviderProfile,
            user=self.request.user,
        )