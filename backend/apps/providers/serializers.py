from django.db import transaction
from rest_framework import serializers

from apps.users.models import (
    ProviderDocument,
    ProviderProfile,
    Role,
    UserRole,
)


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

        read_only_fields = [
            "verification_status",
        ]

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


class ProviderDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    document_type_display = serializers.CharField(
        source="get_document_type_display",
        read_only=True,
    )

    class Meta:
        model = ProviderDocument

        fields = [
            "id",
            "document_type",
            "document_type_display",
            "document_name",
            "file",
            "file_url",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "file_url",
            "document_type_display",
            "created_at",
            "updated_at",
        ]

    def get_file_url(self, obj):
        if not obj.file:
            return ""

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                obj.file.url
            )

        return obj.file.url

    def validate_file(self, value):
        max_size = 10 * 1024 * 1024

        if value.size > max_size:
            raise serializers.ValidationError(
                "File size must be 10 MB or smaller."
            )

        allowed_extensions = {
            ".pdf",
            ".jpg",
            ".jpeg",
            ".png",
        }

        filename = value.name.lower()

        if not any(
            filename.endswith(extension)
            for extension in allowed_extensions
        ):
            raise serializers.ValidationError(
                "Only PDF, JPG, JPEG, and PNG files are allowed."
            )

        return value


class ProviderProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    first_name = serializers.CharField(
        source="user.first_name",
        required=False,
    )

    last_name = serializers.CharField(
        source="user.last_name",
        required=False,
    )

    phone = serializers.CharField(
        source="user.phone",
        required=False,
        allow_blank=True,
    )

    avatar_data = serializers.CharField(
        source="user.avatar_data",
        required=False,
        allow_blank=True,
    )

    documents = ProviderDocumentSerializer(
        many=True,
        read_only=True,
    )

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
            "email",
            "first_name",
            "last_name",
            "phone",
            "avatar_data",
            "documents",
        ]

        read_only_fields = [
            "id",
            "verification_status",
            "rejection_reason",
            "created_at",
            "updated_at",
            "email",
            "documents",
        ]

    def validate_avatar_data(self, value):
        if value and len(value) > 2_800_000:
            raise serializers.ValidationError(
                "Please choose an image smaller than 2 MB."
            )

        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop(
            "user",
            {},
        )

        for attribute, value in validated_data.items():
            setattr(
                instance,
                attribute,
                value,
            )

        if validated_data:
            instance.save()

        user = instance.user

        user_changed = False

        for attribute, value in user_data.items():
            setattr(
                user,
                attribute,
                value,
            )
            user_changed = True

        if user_changed:
            user.save()

        return instance


class ProviderDocumentCreateSerializer(
    ProviderDocumentSerializer
):
    pass