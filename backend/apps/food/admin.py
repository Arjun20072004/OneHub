from django.contrib import admin

from .models import MenuCategory, MenuItem, MenuItemAddon, MenuItemVariant, Restaurant


class MenuItemVariantInline(admin.TabularInline):
    model = MenuItemVariant
    extra = 0


class MenuItemAddonInline(admin.TabularInline):
    model = MenuItemAddon
    extra = 0


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "price", "is_available"]
    list_filter = ["is_available", "is_vegetarian"]
    search_fields = ["name", "category__restaurant__name"]
    inlines = [MenuItemVariantInline, MenuItemAddonInline]


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ["name", "provider", "city", "rating", "is_open", "is_active"]
    list_filter = ["is_open", "is_active", "city"]
    search_fields = ["name", "cuisine", "city"]


admin.site.register(MenuCategory)
