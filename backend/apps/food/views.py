from django.db.models import Q
from django.shortcuts import get_object_or_404

from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.permissions import IsAdmin
from apps.providers.permissions import IsApprovedProvider

from .models import (
    MenuCategory,
    MenuItem,
    MenuItemAddon,
    MenuItemVariant,
    Restaurant,
)

from .serializers import (
    AdminRestaurantSerializer,
    MenuItemSerializer,
    RestaurantDetailSerializer,
    RestaurantListSerializer,
    ProviderRestaurantSerializer,
    ProviderMenuCategorySerializer,
    ProviderMenuItemSerializer,
    ProviderMenuItemVariantSerializer,
    ProviderMenuItemAddonSerializer,
)


# ============================================================
# CUSTOMER
# ============================================================


class RestaurantListView(generics.ListAPIView):
    serializer_class = RestaurantListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Restaurant.objects
            .filter(is_active=True)
            .select_related("provider")
        )

        search = self.request.query_params.get(
            "search",
            "",
        ).strip()

        cuisine = self.request.query_params.get(
            "cuisine",
            "",
        ).strip()

        vegetarian = self.request.query_params.get(
            "vegetarian",
        )

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(cuisine__icontains=search)
                | Q(
                    categories__items__name__icontains=search
                )
            ).distinct()

        if cuisine:
            queryset = queryset.filter(
                cuisine__icontains=cuisine
            )

        if vegetarian == "true":
            queryset = queryset.filter(
                vegetarian_available=True
            )

        return queryset.order_by(
            "-rating",
            "name",
        )


class RestaurantDetailView(
    generics.RetrieveAPIView
):
    queryset = (
        Restaurant.objects
        .filter(is_active=True)
        .prefetch_related(
            "categories__items__variants",
            "categories__items__addons",
        )
    )

    serializer_class = RestaurantDetailSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]


class RestaurantMenuView(
    generics.ListAPIView
):
    serializer_class = MenuItemSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):
        return (
            MenuItem.objects
            .filter(
                category__restaurant_id=self.kwargs[
                    "restaurant_id"
                ],
                is_available=True,
            )
            .select_related("category")
            .prefetch_related(
                "variants",
                "addons",
            )
        )


# ============================================================
# ADMIN
# ============================================================


class AdminRestaurantListView(
    generics.ListAPIView
):
    serializer_class = AdminRestaurantSerializer
    permission_classes = [IsAdmin]

    queryset = (
        Restaurant.objects
        .select_related("provider__user")
        .order_by("name")
    )


# ============================================================
# PROVIDER HELPERS
# ============================================================


def get_provider_restaurant(user):
    provider = user.provider_profile

    return get_object_or_404(
        Restaurant.objects
        .prefetch_related(
            "categories__items__variants",
            "categories__items__addons",
        ),
        provider=provider,
    )


def get_provider_category(user, category_id):
    provider = user.provider_profile

    return get_object_or_404(
        MenuCategory.objects
        .filter(
            id=category_id,
            restaurant__provider=provider,
        )
        .select_related("restaurant"),
        id=category_id,
    )


def get_provider_menu_item(user, item_id):
    provider = user.provider_profile

    return get_object_or_404(
        MenuItem.objects
        .filter(
            id=item_id,
            category__restaurant__provider=provider,
        )
        .select_related(
            "category",
            "category__restaurant",
        )
        .prefetch_related(
            "variants",
            "addons",
        ),
        id=item_id,
    )


def get_provider_variant(user, variant_id):
    provider = user.provider_profile

    return get_object_or_404(
        MenuItemVariant.objects
        .filter(
            id=variant_id,
            menu_item__category__restaurant__provider=provider,
        )
        .select_related(
            "menu_item",
            "menu_item__category",
            "menu_item__category__restaurant",
        ),
        id=variant_id,
    )


def get_provider_addon(user, addon_id):
    provider = user.provider_profile

    return get_object_or_404(
        MenuItemAddon.objects
        .filter(
            id=addon_id,
            menu_item__category__restaurant__provider=provider,
        )
        .select_related(
            "menu_item",
            "menu_item__category",
            "menu_item__category__restaurant",
        ),
        id=addon_id,
    )


# ============================================================
# PROVIDER RESTAURANT
# ============================================================


class ProviderRestaurantView(APIView):
    permission_classes = [
        IsApprovedProvider
    ]

    def get(self, request):
        restaurant = get_provider_restaurant(
            request.user
        )

        return Response(
            ProviderRestaurantSerializer(
                restaurant
            ).data
        )

    def post(self, request):
        provider = request.user.provider_profile

        if Restaurant.objects.filter(
            provider=provider
        ).exists():
            return Response(
                {
                    "detail": (
                        "A restaurant already exists "
                        "for this provider."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ProviderRestaurantSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        restaurant = serializer.save(
            provider=provider
        )

        return Response(
            ProviderRestaurantSerializer(
                restaurant
            ).data,
            status=status.HTTP_201_CREATED,
        )

    def patch(self, request):
        restaurant = get_provider_restaurant(
            request.user
        )

        serializer = ProviderRestaurantSerializer(
            restaurant,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True
        )

        restaurant = serializer.save()

        return Response(
            ProviderRestaurantSerializer(
                restaurant
            ).data
        )


# ============================================================
# PROVIDER CATEGORIES
# ============================================================


class ProviderCategoryListCreateView(
    generics.ListCreateAPIView
):
    permission_classes = [
        IsApprovedProvider
    ]
    serializer_class = ProviderMenuCategorySerializer

    def get_queryset(self):
        provider = self.request.user.provider_profile

        return (
            MenuCategory.objects
            .filter(
                restaurant__provider=provider
            )
            .prefetch_related(
                "items__variants",
                "items__addons",
            )
        )

    def perform_create(self, serializer):
        restaurant = get_provider_restaurant(
            self.request.user
        )

        serializer.save(
            restaurant=restaurant
        )


class ProviderCategoryDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    permission_classes = [
        IsApprovedProvider
    ]
    serializer_class = ProviderMenuCategorySerializer

    def get_queryset(self):
        provider = self.request.user.provider_profile

        return MenuCategory.objects.filter(
            restaurant__provider=provider
        ).prefetch_related(
            "items__variants",
            "items__addons",
        )


# ============================================================
# PROVIDER MENU ITEMS
# ============================================================


class ProviderMenuItemListCreateView(
    generics.ListCreateAPIView
):
    permission_classes = [
        IsApprovedProvider
    ]
    serializer_class = ProviderMenuItemSerializer

    def get_queryset(self):
        provider = self.request.user.provider_profile

        return (
            MenuItem.objects
            .filter(
                category__restaurant__provider=provider
            )
            .select_related(
                "category",
                "category__restaurant",
            )
            .prefetch_related(
                "variants",
                "addons",
            )
            .order_by(
                "category__sort_order",
                "name",
            )
        )

    def perform_create(self, serializer):
        provider = self.request.user.provider_profile

        category_id = self.request.data.get(
            "category"
        )

        if not category_id:
            raise serializers.ValidationError(
                {
                    "category": (
                        "A category is required."
                    )
                }
            )

        category = get_object_or_404(
            MenuCategory.objects.filter(
                id=category_id,
                restaurant__provider=provider,
            )
        )

        serializer.save(
            category=category
        )


class ProviderMenuItemDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    permission_classes = [
        IsApprovedProvider
    ]
    serializer_class = ProviderMenuItemSerializer

    def get_queryset(self):
        provider = self.request.user.provider_profile

        return (
            MenuItem.objects
            .filter(
                category__restaurant__provider=provider
            )
            .select_related(
                "category",
                "category__restaurant",
            )
            .prefetch_related(
                "variants",
                "addons",
            )
        )


# ============================================================
# PROVIDER VARIANTS
# ============================================================


class ProviderVariantListCreateView(
    generics.ListCreateAPIView
):
    permission_classes = [
        IsApprovedProvider
    ]
    serializer_class = (
        ProviderMenuItemVariantSerializer
    )

    def get_menu_item(self):
        return get_provider_menu_item(
            self.request.user,
            self.kwargs["menu_item_id"],
        )

    def get_queryset(self):
        menu_item = self.get_menu_item()

        return MenuItemVariant.objects.filter(
            menu_item=menu_item
        ).order_by("name")

    def perform_create(self, serializer):
        menu_item = self.get_menu_item()

        serializer.save(
            menu_item=menu_item
        )


class ProviderVariantDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    permission_classes = [
        IsApprovedProvider
    ]
    serializer_class = (
        ProviderMenuItemVariantSerializer
    )

    def get_queryset(self):
        provider = self.request.user.provider_profile

        return MenuItemVariant.objects.filter(
            menu_item__category__restaurant__provider=provider
        )


# ============================================================
# PROVIDER ADDONS
# ============================================================


class ProviderAddonListCreateView(
    generics.ListCreateAPIView
):
    permission_classes = [
        IsApprovedProvider
    ]
    serializer_class = (
        ProviderMenuItemAddonSerializer
    )

    def get_menu_item(self):
        return get_provider_menu_item(
            self.request.user,
            self.kwargs["menu_item_id"],
        )

    def get_queryset(self):
        menu_item = self.get_menu_item()

        return MenuItemAddon.objects.filter(
            menu_item=menu_item
        ).order_by("name")

    def perform_create(self, serializer):
        menu_item = self.get_menu_item()

        serializer.save(
            menu_item=menu_item
        )


class ProviderAddonDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    permission_classes = [
        IsApprovedProvider
    ]
    serializer_class = (
        ProviderMenuItemAddonSerializer
    )

    def get_queryset(self):
        provider = self.request.user.provider_profile

        return MenuItemAddon.objects.filter(
            menu_item__category__restaurant__provider=provider
        )