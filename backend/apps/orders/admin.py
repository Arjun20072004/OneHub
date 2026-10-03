from django.contrib import admin

from .models import CatalogItem, Order, OrderItem


@admin.register(CatalogItem)
class CatalogItemAdmin(admin.ModelAdmin):
    list_display = ["name", "item_type", "provider", "price", "is_available"]
    list_filter = ["item_type", "is_available"]
    search_fields = ["name", "category"]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["subtotal"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["order_number", "customer", "provider", "status", "total_amount", "created_at"]
    list_filter = ["status", "order_type", "payment_status"]
    search_fields = ["order_number", "customer__email"]
    inlines = [OrderItemInline]
