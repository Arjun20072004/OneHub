from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.users.models import (
    CustomerProfile,
    ProviderProfile,
    Role,
    UserRole,
)


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "first_name",
            "last_name",
            "phone",
        ]

    def validate_email(self, value):
        return value.strip().lower()

    def validate(self, attrs):
        email = attrs["email"]

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                {
                    "email": (
                        "An account with this email already exists."
                    )
                }
            )

        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User.objects.create_user(
            username=validated_data["email"],
            password=password,
            **validated_data,
        )

        CustomerProfile.objects.create(user=user)

        customer_role = Role.objects.get(
            name=Role.RoleType.CUSTOMER
        )

        UserRole.objects.get_or_create(
            user=user,
            role=customer_role,
        )

        return user


class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    customer_profile = serializers.SerializerMethodField()
    provider_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "date_joined",
            "roles",
            "customer_profile",
            "provider_profile",
        ]
        read_only_fields = fields

    def get_roles(self, obj):
        return list(
            obj.user_roles
            .filter(role__is_active=True)
            .values_list("role__name", flat=True)
        )

    def get_customer_profile(self, obj):
        try:
            profile = obj.customer_profile
        except CustomerProfile.DoesNotExist:
            return None

        return {
            "id": profile.id,
            "address": profile.address,
            "city": profile.city,
            "date_of_birth": profile.date_of_birth,
            "preferences": profile.preferences,
        }

    def get_provider_profile(self, obj):
        try:
            profile = obj.provider_profile
        except ProviderProfile.DoesNotExist:
            return None

        return {
            "id": profile.id,
            "business_name": profile.business_name,
            "business_address": profile.business_address,
            "city": profile.city,
            "verification_status": profile.verification_status,
            "experience": profile.experience,
            "description": profile.description,
        }


class OneHubTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Generates JWT access and refresh tokens for OneHub users.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["email"] = user.email
        token["first_name"] = user.first_name
        token["last_name"] = user.last_name

        roles = list(
            user.user_roles
            .filter(role__is_active=True)
            .values_list("role__name", flat=True)
        )

        token["roles"] = roles

        return token