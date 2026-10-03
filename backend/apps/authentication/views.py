from datetime import timedelta
import hashlib
import secrets

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .admin_serializers import AdminUserSerializer
from .models import EmailVerificationOTP
from .permissions import IsAdmin
from .serializers import (
    OneHubTokenObtainPairSerializer,
    RegisterSerializer,
    ResendRegistrationOTPSerializer,
    VerifyRegistrationOTPSerializer,
    ChangePasswordSerializer,
    UserSerializer,
    UserProfileUpdateSerializer,
)

from apps.users.models import (
    CustomerProfile,
    ProviderProfile,
    Role,
    UserRole,
)


User = get_user_model()


def hash_otp(otp):
    return hashlib.sha256(
        otp.encode("utf-8")
    ).hexdigest()


def send_registration_otp_email(email, otp):
    subject = "Verify your OneHub account"

    text_content = f"""
Hello,

Your OneHub verification code is:

{otp}

This OTP will expire in 10 minutes.

If you did not request a OneHub account, you can safely ignore this email.

OneHub
No-reply email — please do not reply.
""".strip()

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Verify your OneHub account</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background: #f5f1ea;
    font-family: Arial, Helvetica, sans-serif;
">

    <div style="
        max-width: 560px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        padding: 40px;
        color: #202b2a;
    ">

        <h1 style="
            margin: 0 0 20px;
            color: #173e35;
        ">
            One<span style="color: #d6653d;">Hub</span>
        </h1>

        <h2 style="color: #173e35;">
            Verify your email
        </h2>

        <p>
            Use the verification code below to complete
            your OneHub registration.
        </p>

        <div style="
            margin: 30px 0;
            padding: 18px;
            text-align: center;
            background: #f5f1ea;
            border-radius: 10px;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #173e35;
        ">
            {otp}
        </div>

        <p>
            This code expires in <strong>10 minutes</strong>.
        </p>

        <p style="color: #71827d;">
            If you did not request a OneHub account,
            you can safely ignore this email.
        </p>

        <hr style="
            border: 0;
            border-top: 1px solid #e5ebe7;
            margin: 30px 0;
        ">

        <p style="
            color: #9aa6a1;
            font-size: 12px;
        ">
            This is an automated email from OneHub.
            Please do not reply to this message.
        </p>

    </div>

</body>
</html>
"""

    email_message = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email],
        reply_to=[settings.NO_REPLY_EMAIL],
    )

    email_message.attach_alternative(
        html_content,
        "text/html",
    )

    email_message.send(
        fail_silently=False,
    )


def send_registration_success_email(email, first_name):
    subject = "Welcome to OneHub — Account Created Successfully"

    greeting = (
        f"Hello {first_name},"
        if first_name
        else "Hello,"
    )

    text_content = f"""
{greeting}

Your OneHub account has been created successfully.

You can now sign in to OneHub using your registered email address and password.

Welcome to OneHub.

OneHub
No-reply email — please do not reply.
""".strip()

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>OneHub account created</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background: #f5f1ea;
    font-family: Arial, Helvetica, sans-serif;
">

    <div style="
        max-width: 560px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        padding: 40px;
        color: #202b2a;
    ">

        <h1 style="
            margin: 0 0 20px;
            color: #173e35;
        ">
            One<span style="color: #d6653d;">Hub</span>
        </h1>

        <h2 style="color: #173e35;">
            Account created successfully
        </h2>

        <p>
            {greeting}
        </p>

        <p>
            Your OneHub account has been created successfully.
        </p>

        <p>
            You can now sign in using your registered
            email address and password.
        </p>

        <div style="
            margin: 28px 0;
            padding: 16px;
            background: #eef7f1;
            border-radius: 8px;
            color: #2d6c47;
        ">
            Your account is ready to use.
        </div>

        <p>
            Welcome to OneHub.
        </p>

        <hr style="
            border: 0;
            border-top: 1px solid #e5ebe7;
            margin: 30px 0;
        ">

        <p style="
            color: #9aa6a1;
            font-size: 12px;
        ">
            This is an automated email from OneHub.
            This mailbox is not monitored. Please do not reply.
        </p>

    </div>

</body>
</html>
"""

    email_message = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email],
        reply_to=[settings.NO_REPLY_EMAIL],
    )

    email_message.attach_alternative(
        html_content,
        "text/html",
    )

    email_message.send(
        fail_silently=False,
    )


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        email = serializer.validated_data["email"]

        if User.objects.filter(
            email__iexact=email,
        ).exists():
            return Response(
                {
                    "detail": (
                        "An account with this email "
                        "already exists."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        recent_otp = (
            EmailVerificationOTP.objects
            .filter(
                email=email,
                is_used=False,
                created_at__gte=(
                    timezone.now()
                    - timedelta(minutes=1)
                ),
            )
            .first()
        )

        if recent_otp:
            return Response(
                {
                    "detail": (
                        "A verification code was already "
                        "sent recently. Please wait before "
                        "requesting another code."
                    )
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        EmailVerificationOTP.objects.filter(
            email=email,
            is_used=False,
        ).update(
            is_used=True,
        )

        otp = f"{secrets.randbelow(1_000_000):06d}"

        registration_data = serializer.validated_data.copy()

        password = registration_data.pop(
            "password",
        )

        registration_data.pop(
            "password_confirm",
            None,
        )

        otp_record = EmailVerificationOTP.objects.create(
            email=email,
            otp_hash=hash_otp(otp),
            password_hash=make_password(password),
            registration_data=registration_data,
            expires_at=(
                timezone.now()
                + timedelta(minutes=10)
            ),
        )

        try:
            send_registration_otp_email(
                email=email,
                otp=otp,
            )
        except Exception:
            otp_record.delete()

            return Response(
                {
                    "detail": (
                        "We couldn't send the verification "
                        "email. Please try again."
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {
                "detail": (
                    "A verification code has been sent "
                    "to your email address."
                ),
                "email": email,
            },
            status=status.HTTP_200_OK,
        )


class VerifyRegistrationOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyRegistrationOTPSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]

        verification = (
            EmailVerificationOTP.objects
            .filter(
                email=email,
                is_used=False,
            )
            .first()
        )

        if not verification:
            return Response(
                {
                    "detail": (
                        "No active verification code "
                        "was found."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if verification.expires_at <= timezone.now():
            verification.is_used = True
            verification.save(
                update_fields=["is_used"],
            )

            return Response(
                {
                    "detail": (
                        "This verification code has expired."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if verification.attempts >= 5:
            verification.is_used = True
            verification.save(
                update_fields=["is_used"],
            )

            return Response(
                {
                    "detail": (
                        "Too many incorrect attempts. "
                        "Please request a new code."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        verification.attempts += 1

        if not secrets.compare_digest(
            verification.otp_hash,
            hash_otp(otp),
        ):
            verification.save(
                update_fields=["attempts"],
            )

            return Response(
                {
                    "detail": "Invalid verification code.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        registration_data = verification.registration_data
        password_hash = verification.password_hash

        if not password_hash:
            verification.is_used = True
            verification.save(
                update_fields=["is_used"],
            )

            return Response(
                {
                    "detail": (
                        "This registration session is invalid. "
                        "Please register again."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(
            email__iexact=email,
        ).exists():
            verification.is_used = True
            verification.save(
                update_fields=["is_used"],
            )

            return Response(
                {
                    "detail": (
                        "An account with this email "
                        "already exists."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                user = User(
                    username=email,
                    email=email,
                    first_name=registration_data.get(
                        "first_name",
                        "",
                    ),
                    last_name=registration_data.get(
                        "last_name",
                        "",
                    ),
                    phone=registration_data.get(
                        "phone",
                        "",
                    ),
                )

                user.password = password_hash
                user.save()

                account_type = registration_data.get(
                    "account_type",
                    "customer",
                )

                if account_type == "provider":
                    business_name = (
                        registration_data.get(
                            "business_name",
                            "",
                        )
                        or f"{user.first_name}'s business"
                    )

                    ProviderProfile.objects.create(
                        user=user,
                        business_name=business_name,
                        business_address="",
                        city="",
                        verification_status=(
                            ProviderProfile
                            .VerificationStatus
                            .PENDING
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

                verification.is_used = True
                verification.save(
                    update_fields=["is_used"],
                )

        except Exception:
            return Response(
                {
                    "detail": (
                        "We couldn't complete your "
                        "registration. Please try again."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            send_registration_success_email(
                email=user.email,
                first_name=user.first_name,
            )
        except Exception:
            pass

        return Response(
            {
                "detail": (
                    "Your OneHub account has been "
                    "created successfully."
                ),
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )


class ResendRegistrationOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResendRegistrationOTPSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        email = serializer.validated_data["email"]

        verification = (
            EmailVerificationOTP.objects
            .filter(
                email=email,
                is_used=False,
            )
            .first()
        )

        if not verification:
            return Response(
                {
                    "detail": (
                        "No pending registration was "
                        "found for this email."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        recent_otp = (
            EmailVerificationOTP.objects
            .filter(
                email=email,
                created_at__gte=(
                    timezone.now()
                    - timedelta(minutes=1)
                ),
            )
            .first()
        )

        if recent_otp:
            return Response(
                {
                    "detail": (
                        "Please wait one minute before "
                        "requesting another verification code."
                    )
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        otp = f"{secrets.randbelow(1_000_000):06d}"

        verification.otp_hash = hash_otp(otp)
        verification.expires_at = (
            timezone.now()
            + timedelta(minutes=10)
        )
        verification.attempts = 0

        verification.save(
            update_fields=[
                "otp_hash",
                "expires_at",
                "attempts",
            ],
        )

        try:
            send_registration_otp_email(
                email=email,
                otp=otp,
            )
        except Exception:
            return Response(
                {
                    "detail": (
                        "We couldn't send the "
                        "verification email."
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(
            {
                "detail": (
                    "A new verification code has "
                    "been sent to your email."
                ),
                "email": email,
            },
            status=status.HTTP_200_OK,
        )


class LoginView(TokenObtainPairView):
    serializer_class = OneHubTokenObtainPairSerializer


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method == "GET":
            return UserSerializer

        return UserProfileUpdateSerializer

    def update(
        self,
        request,
        *args,
        **kwargs,
    ):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        self.perform_update(serializer)

        return Response(
            UserSerializer(
                instance,
                context=self.get_serializer_context(),
            ).data
        )


class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdmin]

    queryset = (
        User.objects
        .all()
        .prefetch_related(
            "user_roles__role"
        )
        .order_by("-date_joined")
    )


class AdminUserStatusView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, user_id):
        user = get_object_or_404(
            User,
            id=user_id,
        )

        if user == request.user:
            return Response(
                {
                    "detail": (
                        "You cannot deactivate your "
                        "own admin account."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = bool(
            request.data.get(
                "is_active",
                False,
            )
        )

        user.save(
            update_fields=["is_active"],
        )

        return Response(
            AdminUserSerializer(user).data
        )


class ChangePasswordView(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(
            raise_exception=True,
        )

        serializer.save()

        return Response(
            {
                "detail": (
                    "Password changed successfully."
                )
            },
            status=status.HTTP_200_OK,
        )