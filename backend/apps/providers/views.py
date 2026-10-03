from django.shortcuts import get_object_or_404

from rest_framework import (
    generics,
    permissions,
    status,
)
from rest_framework.parsers import (
    FormParser,
    MultiPartParser,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.permissions import IsAdmin
from apps.notifications.services import notify_admins
from apps.users.models import (
    ProviderDocument,
    ProviderProfile,
)

from .admin_serializers import ProviderApprovalSerializer
from .serializers import (
    ProviderDocumentSerializer,
    ProviderProfileSerializer,
    ProviderRegistrationSerializer,
)


class ProviderRegistrationView(generics.CreateAPIView):
    serializer_class = ProviderRegistrationSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def perform_create(self, serializer):
        provider = serializer.save()

        notify_admins(
            title="New provider registration",
            message=(
                f"{provider.business_name} has submitted "
                f"a new provider registration and is "
                f"awaiting approval."
            ),
            notification_type="provider",
            action_url="/admin/providers",
        )


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
                verification_status=(
                    ProviderProfile
                    .VerificationStatus
                    .PENDING
                )
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
            != ProviderProfile
            .VerificationStatus
            .PENDING
        ):
            return Response(
                {
                    "detail": (
                        "Only pending provider "
                        "applications can be approved."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        provider.verification_status = (
            ProviderProfile
            .VerificationStatus
            .APPROVED
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
                "detail": (
                    "Provider approved successfully."
                )
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
            != ProviderProfile
            .VerificationStatus
            .PENDING
        ):
            return Response(
                {
                    "detail": (
                        "Only pending provider "
                        "applications can be rejected."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = request.data.get(
            "reason",
            "",
        ).strip()

        if not reason:
            return Response(
                {
                    "reason": (
                        "A rejection reason is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        provider.verification_status = (
            ProviderProfile
            .VerificationStatus
            .REJECTED
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
                "detail": (
                    "Provider rejected successfully."
                )
            },
            status=status.HTTP_200_OK,
        )


class MyProviderProfileView(
    generics.RetrieveUpdateAPIView
):
    """
    Provider can view and update their own profile.
    """

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):
        return ProviderProfile.objects.select_related(
            "user"
        ).prefetch_related(
            "documents"
        )

    def get_object(self):
        return get_object_or_404(
            self.get_queryset(),
            user=self.request.user,
        )

    def get_serializer_class(self):
        return ProviderProfileSerializer


class ProviderDocumentListCreateView(
    generics.ListCreateAPIView
):
    """
    Provider can list and upload their own documents.
    """

    permission_classes = [
        permissions.IsAuthenticated
    ]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    serializer_class = ProviderDocumentSerializer

    def get_provider(self):
        return get_object_or_404(
            ProviderProfile,
            user=self.request.user,
        )

    def get_queryset(self):
        return (
            ProviderDocument.objects
            .filter(
                provider=self.get_provider()
            )
            .order_by(
                "document_type",
                "document_name",
            )
        )

    def perform_create(self, serializer):
        serializer.save(
            provider=self.get_provider()
        )


class ProviderDocumentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    """
    Provider can view, replace, or delete
    their own document.
    """

    permission_classes = [
        permissions.IsAuthenticated
    ]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    serializer_class = ProviderDocumentSerializer

    def get_provider(self):
        return get_object_or_404(
            ProviderProfile,
            user=self.request.user,
        )

    def get_queryset(self):
        return ProviderDocument.objects.filter(
            provider=self.get_provider()
        )

    def perform_update(self, serializer):
        old_file = serializer.instance.file

        updated_document = serializer.save()

        if (
            "file" in self.request.FILES
            and old_file
            and old_file.name
            and old_file.name
            != updated_document.file.name
        ):
            try:
                old_file.delete(
                    save=False
                )
            except Exception:
                pass


class AdminProviderListView(generics.ListAPIView):
    serializer_class = ProviderApprovalSerializer
    permission_classes = [IsAdmin]

    queryset = (
        ProviderProfile.objects
        .select_related("user")
        .order_by("-created_at")
    )
class AdminProviderStatusView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, provider_id):
        provider = get_object_or_404(
            ProviderProfile.objects.select_related("user"),
            id=provider_id,
        )

        status_value = request.data.get(
            "verification_status"
        )

        allowed = {
            choice
            for choice, _ in ProviderProfile.VerificationStatus.choices
        }

        if status_value not in allowed:
            return Response(
                {"detail": "Invalid provider status."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        rejection_reason = str(
            request.data.get(
                "rejection_reason",
                "",
            )
        ).strip()

        if (
            status_value
            == ProviderProfile.VerificationStatus.REJECTED
        ):
            if not rejection_reason:
                return Response(
                    {
                        "reason": (
                            "A rejection reason is required."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            provider.rejection_reason = rejection_reason

        else:
            provider.rejection_reason = ""

        provider.verification_status = status_value

        provider.save(
            update_fields=[
                "verification_status",
                "rejection_reason",
                "updated_at",
            ]
        )

        return Response(
            ProviderApprovalSerializer(provider).data,
            status=status.HTTP_200_OK,
        )