from django.urls import path

from .views import (
    AdminRestaurantListView,
    RestaurantDetailView,
    RestaurantListView,
    RestaurantMenuView,
    ProviderRestaurantView,
    ProviderCategoryListCreateView,
    ProviderCategoryDetailView,
    ProviderMenuItemListCreateView,
    ProviderMenuItemDetailView,
    ProviderVariantListCreateView,
    ProviderVariantDetailView,
    ProviderAddonListCreateView,
    ProviderAddonDetailView,
)


urlpatterns = [
    # ========================================================
    # ADMIN
    # ========================================================

    path(
        "admin/restaurants/",
        AdminRestaurantListView.as_view(),
        name="admin-restaurant-list",
    ),

    # ========================================================
    # CUSTOMER
    # ========================================================

    path(
        "restaurants/",
        RestaurantListView.as_view(),
        name="restaurant-list",
    ),

    path(
        "restaurants/<int:pk>/",
        RestaurantDetailView.as_view(),
        name="restaurant-detail",
    ),

    path(
        "restaurants/<int:restaurant_id>/menu/",
        RestaurantMenuView.as_view(),
        name="restaurant-menu",
    ),

    # ========================================================
    # PROVIDER RESTAURANT
    # ========================================================

    path(
        "provider/restaurant/",
        ProviderRestaurantView.as_view(),
        name="provider-restaurant",
    ),

    # ========================================================
    # PROVIDER CATEGORIES
    # ========================================================

    path(
        "provider/categories/",
        ProviderCategoryListCreateView.as_view(),
        name="provider-category-list-create",
    ),

    path(
        "provider/categories/<int:pk>/",
        ProviderCategoryDetailView.as_view(),
        name="provider-category-detail",
    ),

    # ========================================================
    # PROVIDER MENU ITEMS
    # ========================================================

    path(
        "provider/menu-items/",
        ProviderMenuItemListCreateView.as_view(),
        name="provider-menu-item-list-create",
    ),

    path(
        "provider/menu-items/<int:pk>/",
        ProviderMenuItemDetailView.as_view(),
        name="provider-menu-item-detail",
    ),

    # ========================================================
    # PROVIDER VARIANTS
    # ========================================================

    path(
        "provider/menu-items/<int:menu_item_id>/variants/",
        ProviderVariantListCreateView.as_view(),
        name="provider-variant-list-create",
    ),

    path(
        "provider/variants/<int:pk>/",
        ProviderVariantDetailView.as_view(),
        name="provider-variant-detail",
    ),

    # ========================================================
    # PROVIDER ADDONS
    # ========================================================

    path(
        "provider/menu-items/<int:menu_item_id>/addons/",
        ProviderAddonListCreateView.as_view(),
        name="provider-addon-list-create",
    ),

    path(
        "provider/addons/<int:pk>/",
        ProviderAddonDetailView.as_view(),
        name="provider-addon-detail",
    ),
]