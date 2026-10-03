from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import EmailVerificationOTP

from apps.users.models import (
    CustomerProfile,
    ProviderProfile,
    Role,
    UserRole,
)

# from .serializers import (
#     OneHubTokenObtainPairSerializer,
#     RegisterSerializer,
#     VerifyRegistrationOTPSerializer,
#     ResendRegistrationOTPSerializer,
#     ChangePasswordSerializer,
#     UserSerializer,
#     UserProfileUpdateSerializer,
# )

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    account_type = serializers.ChoiceField(
        choices=["customer", "provider"],
        write_only=True,
        default="customer",
    )

    business_name = serializers.CharField(
        required=False,
        write_only=True,
        allow_blank=True,
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    password_confirm = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "phone",
            "account_type",
            "business_name",
        ]

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(
            email__iexact=value,
        ).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def validate_password(self, value):
        try:
            validate_password(
                value,
                user=None,
            )
        except DjangoValidationError as error:
            raise serializers.ValidationError(
                list(error.messages)
            )

        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {
                    "password_confirm": (
                        "Passwords do not match."
                    )
                }
            )

        if (
            attrs.get("account_type") == "provider"
            and not attrs.get("business_name", "").strip()
        ):
            raise serializers.ValidationError(
                {
                    "business_name": (
                        "Business name is required for provider registration."
                    )
                }
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")

        password = validated_data.pop("password")
        account_type = validated_data.pop(
            "account_type",
            "customer",
        )
        business_name = validated_data.pop(
            "business_name",
            "",
        )

        user = User.objects.create_user(
            username=validated_data["email"],
            password=password,
            **validated_data,
        )

        if account_type == "provider":
            ProviderProfile.objects.create(
                user=user,
                business_name=(
                    business_name
                    or f"{user.first_name}'s business"
                ),
                business_address="",
                city="",
                verification_status=(
                    ProviderProfile.VerificationStatus.PENDING
                ),
            )

            role = Role.objects.get(
                name=Role.RoleType.PROVIDER,
            )

        else:
            CustomerProfile.objects.create(
                user=user,
            )

            role = Role.objects.get(
                name=Role.RoleType.CUSTOMER,
            )

        UserRole.objects.get_or_create(
            user=user,
            role=role,
        )

        return user

class VerifyRegistrationOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    otp = serializers.CharField(
        min_length=6,
        max_length=6,
        trim_whitespace=True,
    )

    def validate_email(self, value):
        return value.strip().lower()

    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError(
                "OTP must contain only numbers."
            )

        return value


class ResendRegistrationOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.strip().lower()


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
            "avatar_data",
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
            "rejection_reason": profile.rejection_reason,
            "experience": profile.experience,
            "description": profile.description,
        }


class CustomerProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = [
            "address",
            "city",
            "date_of_birth",
        ]


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    customer_profile = CustomerProfileUpdateSerializer(
        required=False
    )

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "phone",
            "avatar_data",
            "customer_profile",
        ]

    def validate_avatar_data(self, value):
        if value and len(value) > 2_800_000:
            raise serializers.ValidationError(
                "Please choose an image smaller than 2 MB."
            )

        return value

    def update(self, instance, validated_data):
        customer_profile_data = validated_data.pop(
            "customer_profile",
            None,
        )

        for attribute, value in validated_data.items():
            setattr(instance, attribute, value)

        if validated_data:
            instance.save(
                update_fields=list(validated_data.keys())
            )

        if customer_profile_data is not None:
            profile, _ = CustomerProfile.objects.get_or_create(
                user=instance
            )

            for attribute, value in customer_profile_data.items():
                setattr(profile, attribute, value)

            profile.save()

        return instance


class OneHubTokenObtainPairSerializer(
    TokenObtainPairSerializer
):
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


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(
        write_only=True,
        required=True,
        trim_whitespace=False,
    )

    new_password = serializers.CharField(
        write_only=True,
        required=True,
        trim_whitespace=False,
        min_length=8,
    )

    def validate_old_password(self, value):
        user = self.context["request"].user

        if not user.check_password(value):
            raise serializers.ValidationError(
                "Current password is incorrect."
            )

        return value

    def validate(self, attrs):
        if (
            attrs["old_password"]
            == attrs["new_password"]
        ):
            raise serializers.ValidationError(
                {
                    "new_password": (
                        "New password must be different "
                        "from the current password."
                    )
                }
            )

        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user

        user.set_password(
            self.validated_data["new_password"]
        )

        user.save(update_fields=["password"])

        return user