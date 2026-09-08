from django.urls import path

from .views import (
    ApproveProviderView,
    MyProviderProfileView,
    PendingProviderListView,
    ProviderRegistrationView,
    RejectProviderView,
)


urlpatterns = [
    # Authenticated user → become a provider
    path(
        "register/",
        ProviderRegistrationView.as_view(),
        name="provider-register",
    ),

    # Authenticated provider → view own provider profile
    path(
        "me/",
        MyProviderProfileView.as_view(),
        name="my-provider-profile",
    ),

    # Admin → view pending provider applications
    path(
        "admin/pending/",
        PendingProviderListView.as_view(),
        name="provider-pending",
    ),

    # Admin → approve provider
    path(
        "admin/<int:provider_id>/approve/",
        ApproveProviderView.as_view(),
        name="provider-approve",
    ),

    # Admin → reject provider
    path(
        "admin/<int:provider_id>/reject/",
        RejectProviderView.as_view(),
        name="provider-reject",
    ),
]