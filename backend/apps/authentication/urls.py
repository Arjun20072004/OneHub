from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AdminUserListView,
    AdminUserStatusView,
    ChangePasswordView,
    LoginView,
    MeView,
    RegisterView,
    ResendRegistrationOTPView,
    VerifyRegistrationOTPView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("register/verify-otp", VerifyRegistrationOTPView.as_view(), name="register-verify-otp"),
    path("register/resend-otp", ResendRegistrationOTPView.as_view(), name="register-resend-otp"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
    path("admin/users/<int:user_id>/status/", AdminUserStatusView.as_view(), name="admin-user-status"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]