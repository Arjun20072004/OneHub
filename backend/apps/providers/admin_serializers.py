from rest_framework import serializers

from apps.users.models import ProviderProfile


class ProviderApprovalSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    class Meta:
        model = ProviderProfile
        fields = [
            "id",
            "business_name",
            "business_address",
            "city",
            "experience",
            "description",
            "verification_status",
            "rejection_reason",
            "created_at",
            "updated_at",
            "user",
            "email",
            "is_active",
        ]
        read_only_fields = [
            "id",
            "business_name",
            "business_address",
            "city",
            "experience",
            "description",
            "verification_status",
            "rejection_reason",
            "created_at",
            "updated_at",
            "user",
            "email",
            "is_active",
        ]