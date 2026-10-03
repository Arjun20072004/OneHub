from django.urls import path

from .views import (
    AdminProviderListView,
    AdminProviderStatusView,
    ApproveProviderView,
    MyProviderProfileView,
    PendingProviderListView,
    ProviderDocumentDetailView,
    ProviderDocumentListCreateView,
    ProviderRegistrationView,
    RejectProviderView,
)


urlpatterns = [
    path(
        "register/",
        ProviderRegistrationView.as_view(),
        name="provider-register",
    ),

    path(
        "me/",
        MyProviderProfileView.as_view(),
        name="my-provider-profile",
    ),

    path(
        "me/documents/",
        ProviderDocumentListCreateView.as_view(),
        name="provider-document-list-create",
    ),

    path(
        "me/documents/<int:pk>/",
        ProviderDocumentDetailView.as_view(),
        name="provider-document-detail",
    ),

    path(
        "admin/pending/",
        PendingProviderListView.as_view(),
        name="provider-pending",
    ),

    path(
        "admin/all/",
        AdminProviderListView.as_view(),
        name="provider-all",
    ),

    path(
        "admin/<int:provider_id>/status/",
        AdminProviderStatusView.as_view(),
        name="provider-status",
    ),

    path(
        "admin/<int:provider_id>/approve/",
        ApproveProviderView.as_view(),
        name="provider-approve",
    ),

    path(
        "admin/<int:provider_id>/reject/",
        RejectProviderView.as_view(),
        name="provider-reject",
    ),
]