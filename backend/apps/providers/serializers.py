from django.db import transaction
from rest_framework import serializers

from apps.users.models import ProviderProfile, Role, UserRole


class ProviderRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderProfile
        fields = [
            "business_name",
            "business_address",
            "city",
            "experience",
            "description",
            "verification_status",
        ]
        read_only_fields = ["verification_status"]

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user

        if hasattr(user, "provider_profile"):
            raise serializers.ValidationError(
                "A provider profile already exists for this account."
            )

        provider_profile = ProviderProfile.objects.create(
            user=user,
            **validated_data,
        )

        provider_role = Role.objects.get(
            name=Role.RoleType.PROVIDER
        )

        UserRole.objects.get_or_create(
            user=user,
            role=provider_role,
        )

        return provider_profile