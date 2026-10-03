from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from .models import CatalogItem, CustomerAddress, Coupon, Order, OrderItem, OrderStatusHistory, Review
from apps.food.models import MenuItem, MenuItemAddon, MenuItemVariant


class CatalogItemSerializer(serializers.ModelSerializer):
    provider_name = serializers.CharField(source="provider.business_name", read_only=True)

    class Meta:
        model = CatalogItem
        fields = ["id", "provider", "provider_name", "name", "description", "item_type", "category", "price", "is_available"]
        read_only_fields = ["provider_name"]


class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = ["id", "label", "address_line", "area", "city", "state", "postal_code", "latitude", "longitude", "is_default", "created_at"]
        read_only_fields = ["id", "created_at"]


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = ["status", "created_at"]


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "order", "rating", "comment", "is_published", "created_at"]
        read_only_fields = ["id", "order", "is_published", "created_at"]


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "product", "menu_item", "item_name", "quantity", "unit_price", "subtotal", "variant_snapshot", "addons_snapshot"]
        read_only_fields = ["id", "item_name", "unit_price", "subtotal", "variant_snapshot", "addons_snapshot"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    provider_name = serializers.CharField(source="provider.business_name", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "order_number", "customer", "provider", "provider_name", "order_type",
            "status", "total_amount", "delivery_address", "contact_phone", "payment_method",
            "payment_status", "items", "status_history", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "order_number", "customer", "provider_name", "status", "total_amount", "payment_status", "items", "created_at", "updated_at"]


class AdminOrderSerializer(OrderSerializer):
    customer_email = serializers.EmailField(source="customer.email", read_only=True)

    class Meta(OrderSerializer.Meta):
        fields = OrderSerializer.Meta.fields + ["customer_email"]


class CreateOrderItemSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=CatalogItem.objects.all(), required=False, allow_null=True)
    menu_item = serializers.PrimaryKeyRelatedField(queryset=MenuItem.objects.all(), required=False, allow_null=True)
    variant_id = serializers.PrimaryKeyRelatedField(queryset=MenuItemVariant.objects.all(), required=False, allow_null=True, source="variant")
    addon_ids = serializers.PrimaryKeyRelatedField(queryset=MenuItemAddon.objects.all(), required=False, many=True, source="addons")
    item_name = serializers.CharField(max_length=255, required=False)
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, min_value=Decimal("0"))


class CreateOrderSerializer(serializers.Serializer):
    order_type = serializers.ChoiceField(choices=Order.OrderType.choices)
    provider = serializers.PrimaryKeyRelatedField(queryset=Order._meta.get_field("provider").remote_field.model.objects.all(), required=False, allow_null=True)
    delivery_address = serializers.CharField(required=False, allow_blank=True)
    contact_phone = serializers.CharField(max_length=20)
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices)
    items = CreateOrderItemSerializer(many=True, allow_empty=False)

    @transaction.atomic
    def create(self, validated_data):
        item_data = validated_data.pop("items")
        customer = self.context["request"].user
        total = Decimal("0")
        prepared_items = []
        provider = validated_data.get("provider")

        for item in item_data:
            product = item.get("product")
            menu_item = item.get("menu_item")
            if menu_item:
                if not menu_item.is_available or not menu_item.category.restaurant.is_active or not menu_item.category.restaurant.is_open:
                    raise serializers.ValidationError({"items": f"{menu_item.name} is not available."})
                variant = item.get("variant")
                addons = item.get("addons", [])
                if variant and variant.menu_item_id != menu_item.id:
                    raise serializers.ValidationError({"items": "The selected variant does not belong to the menu item."})
                if any(addon.menu_item_id != menu_item.id for addon in addons):
                    raise serializers.ValidationError({"items": "One or more add-ons do not belong to the menu item."})
                item_name = menu_item.name
                unit_price = menu_item.price + (variant.price_delta if variant else Decimal("0")) + sum((addon.price for addon in addons), Decimal("0"))
                provider = provider or menu_item.category.restaurant.provider
                prepared_items.append((None, menu_item, item_name, item["quantity"], unit_price, unit_price * item["quantity"], variant, addons))
                total += unit_price * item["quantity"]
                continue
            if product:
                if not product.is_available:
                    raise serializers.ValidationError({"items": f"{product.name} is not available."})
                if provider and product.provider_id and product.provider_id != provider.id:
                    raise serializers.ValidationError({"items": "All items must belong to the selected provider."})
                item_name = product.name
                unit_price = product.price
                provider = provider or product.provider
            else:
                item_name = item.get("item_name", "").strip()
                if not item_name or "unit_price" not in item:
                    raise serializers.ValidationError({"items": "Each item needs a name and price."})
                unit_price = item["unit_price"]
            subtotal = unit_price * item["quantity"]
            total += subtotal
            prepared_items.append((product, None, item_name, item["quantity"], unit_price, subtotal, None, []))

        order = Order.objects.create(
            customer=customer,
            provider=provider,
            total_amount=total,
            **validated_data,
        )
        for product, menu_item, item_name, quantity, unit_price, subtotal, variant, addons in prepared_items:
            OrderItem.objects.create(order=order, product=product, menu_item=menu_item, item_name=item_name, quantity=quantity, unit_price=unit_price, subtotal=subtotal, variant_snapshot={"id": variant.id, "name": variant.name, "price_delta": str(variant.price_delta)} if variant else {}, addons_snapshot=[{"id": addon.id, "name": addon.name, "price": str(addon.price)} for addon in addons])
        return order
