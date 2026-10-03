from rest_framework import serializers

from .models import (
    MenuCategory,
    MenuItem,
    MenuItemAddon,
    MenuItemVariant,
    Restaurant,
)


class MenuItemVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItemVariant
        fields = [
            "id",
            "name",
            "price_delta",
            "is_available",
        ]


class MenuItemAddonSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItemAddon
        fields = [
            "id",
            "name",
            "price",
            "is_available",
        ]


class MenuItemSerializer(serializers.ModelSerializer):
    variants = MenuItemVariantSerializer(
        many=True,
        read_only=True,
    )
    addons = MenuItemAddonSerializer(
        many=True,
        read_only=True,
    )
    restaurant_id = serializers.IntegerField(
        source="category.restaurant_id",
        read_only=True,
    )
    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "restaurant_id",
            "category",
            "category_name",
            "name",
            "description",
            "price",
            "preparation_minutes",
            "is_vegetarian",
            "is_available",
            "variants",
            "addons",
        ]


class MenuCategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = MenuCategory
        fields = [
            "id",
            "name",
            "sort_order",
            "items",
        ]


class RestaurantListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = [
            "id",
            "name",
            "description",
            "cuisine",
            "address",
            "city",
            "rating",
            "delivery_minutes",
            "price_for_two",
            "is_open",
            "vegetarian_available",
        ]


class RestaurantDetailSerializer(RestaurantListSerializer):
    categories = MenuCategorySerializer(
        many=True,
        read_only=True,
    )

    class Meta(RestaurantListSerializer.Meta):
        fields = RestaurantListSerializer.Meta.fields + [
            "categories",
        ]


class AdminRestaurantSerializer(RestaurantListSerializer):
    provider_email = serializers.EmailField(
        source="provider.user.email",
        read_only=True,
    )

    class Meta(RestaurantListSerializer.Meta):
        fields = RestaurantListSerializer.Meta.fields + [
            "provider",
            "provider_email",
            "is_active",
        ]


# ============================================================
# PROVIDER RESTAURANT
# ============================================================


class ProviderRestaurantSerializer(serializers.ModelSerializer):
    categories = MenuCategorySerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Restaurant
        fields = [
            "id",
            "name",
            "description",
            "cuisine",
            "address",
            "city",
            "latitude",
            "longitude",
            "rating",
            "delivery_minutes",
            "price_for_two",
            "is_active",
            "is_open",
            "vegetarian_available",
            "categories",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "rating",
            "categories",
            "created_at",
            "updated_at",
        ]


# ============================================================
# PROVIDER CATEGORY
# ============================================================


class ProviderMenuCategorySerializer(
    serializers.ModelSerializer
):
    items = MenuItemSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = MenuCategory
        fields = [
            "id",
            "restaurant",
            "name",
            "sort_order",
            "items",
        ]

        read_only_fields = [
            "id",
            "restaurant",
            "items",
        ]


# ============================================================
# PROVIDER MENU ITEM
# ============================================================


class ProviderMenuItemSerializer(
    serializers.ModelSerializer
):
    variants = MenuItemVariantSerializer(
        many=True,
        read_only=True,
    )
    addons = MenuItemAddonSerializer(
        many=True,
        read_only=True,
    )
    restaurant_id = serializers.IntegerField(
        source="category.restaurant_id",
        read_only=True,
    )
    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "restaurant_id",
            "category",
            "category_name",
            "name",
            "description",
            "price",
            "preparation_minutes",
            "is_vegetarian",
            "is_available",
            "variants",
            "addons",
        ]

        read_only_fields = [
            "id",
            "restaurant_id",
            "category_name",
            "variants",
            "addons",
        ]


# ============================================================
# PROVIDER VARIANT
# ============================================================


class ProviderMenuItemVariantSerializer(
    serializers.ModelSerializer
):
    menu_item = serializers.PrimaryKeyRelatedField(
        read_only=True,
    )

    class Meta:
        model = MenuItemVariant
        fields = [
            "id",
            "menu_item",
            "name",
            "price_delta",
            "is_available",
        ]

        read_only_fields = [
            "id",
            "menu_item",
        ]


# ============================================================
# PROVIDER ADDON
# ============================================================


class ProviderMenuItemAddonSerializer(
    serializers.ModelSerializer
):
    menu_item = serializers.PrimaryKeyRelatedField(
        read_only=True,
    )

    class Meta:
        model = MenuItemAddon
        fields = [
            "id",
            "menu_item",
            "name",
            "price",
            "is_available",
        ]

        read_only_fields = [
            "id",
            "menu_item",
        ]