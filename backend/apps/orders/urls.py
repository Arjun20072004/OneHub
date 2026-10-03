from django.urls import path

from .views import (
    CatalogDetailView,
    CatalogListView,
    CustomerCancelOrderView,
    CustomerAddressDetailView,
    CustomerAddressListCreateView,
    CustomerOrderDetailView,
    CustomerOrderListCreateView,
    CustomerReviewCreateView,
    ProviderOrderActionView,
    ProviderOrderListView,
    AdminOrderListView,
)

urlpatterns = [
        path("admin/", AdminOrderListView.as_view(), name="admin-order-list"),
    path("addresses/", CustomerAddressListCreateView.as_view(), name="address-list-create"),
    path("addresses/<int:pk>/", CustomerAddressDetailView.as_view(), name="address-detail"),
    path("catalog/", CatalogListView.as_view(), name="catalog-list"),
    path("catalog/<int:pk>/", CatalogDetailView.as_view(), name="catalog-detail"),
    path("", CustomerOrderListCreateView.as_view(), name="order-list-create"),
    path("<int:order_id>/", CustomerOrderDetailView.as_view(), name="order-detail"),
    path("<int:order_id>/cancel/", CustomerCancelOrderView.as_view(), name="order-cancel"),
    path("reviews/", CustomerReviewCreateView.as_view(), name="review-create"),
    path("provider/", ProviderOrderListView.as_view(), name="provider-order-list"),
    path("provider/<int:order_id>/<str:action>/", ProviderOrderActionView.as_view(), name="provider-order-action"),
]
