from rest_framework import serializers

from apps.users.models import ProviderProfile


class ProviderApprovalSerializer(serializers.ModelSerializer):
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
        ]