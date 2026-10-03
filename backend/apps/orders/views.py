from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.permissions import IsAdmin
from apps.notifications.services import (
    create_notification,
    notify_admins,
)
from apps.providers.permissions import IsApprovedProvider

from .models import (
    CatalogItem,
    CustomerAddress,
    Order,
    OrderStatusHistory,
    Review,
)
from .permissions import HasCustomerRole
from .serializers import (
    AdminOrderSerializer,
    CatalogItemSerializer,
    CustomerAddressSerializer,
    CreateOrderSerializer,
    OrderSerializer,
    ReviewSerializer,
)


class CustomerAddressListCreateView(generics.ListCreateAPIView):
    serializer_class = CustomerAddressSerializer
    permission_classes = [HasCustomerRole]

    def get_queryset(self):
        return CustomerAddress.objects.filter(
            customer=self.request.user
        ).order_by(
            "-is_default",
            "-created_at",
        )

    def perform_create(self, serializer):
        if serializer.validated_data.get("is_default"):
            CustomerAddress.objects.filter(
                customer=self.request.user
            ).update(
                is_default=False
            )

        serializer.save(
            customer=self.request.user
        )


class CustomerAddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomerAddressSerializer
    permission_classes = [HasCustomerRole]

    def get_queryset(self):
        return CustomerAddress.objects.filter(
            customer=self.request.user
        )

    def perform_update(self, serializer):
        if serializer.validated_data.get("is_default"):
            CustomerAddress.objects.filter(
                customer=self.request.user
            ).update(
                is_default=False
            )

        serializer.save()


class CatalogListView(generics.ListAPIView):
    serializer_class = CatalogItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = (
            CatalogItem.objects
            .filter(is_available=True)
            .select_related("provider")
        )

        item_type = self.request.query_params.get("type")
        search = self.request.query_params.get("search")

        if item_type:
            queryset = queryset.filter(
                item_type=item_type
            )

        if search:
            queryset = queryset.filter(
                name__icontains=search
            )

        return queryset.order_by("name")


class CatalogDetailView(generics.RetrieveAPIView):
    queryset = (
        CatalogItem.objects
        .filter(is_available=True)
        .select_related("provider")
    )

    serializer_class = CatalogItemSerializer
    permission_classes = [permissions.IsAuthenticated]


class CustomerOrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [HasCustomerRole]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CreateOrderSerializer

        return OrderSerializer

    def get_queryset(self):
        return (
            Order.objects
            .filter(customer=self.request.user)
            .prefetch_related("items")
            .select_related("provider")
            .order_by("-created_at")
        )

    @transaction.atomic
    def perform_create(self, serializer):
        order = serializer.save()

        OrderStatusHistory.objects.create(
            order=order,
            status=order.status,
            changed_by=self.request.user,
        )

        # Notify the assigned provider.
        if order.provider:
            create_notification(
                recipient=order.provider.user,
                notification_type="order",
                title="New order received",
                message=(
                    f"Order {order.order_number} has been "
                    f"placed for ₹{order.total_amount}."
                ),
                action_url="/provider/orders",
            )

        # Notify OneHub administrators.
        notify_admins(
            notification_type="order",
            title="New order received",
            message=(
                f"Order {order.order_number} "
                f"for ₹{order.total_amount} "
                f"requires attention."
            ),
            action_url="/admin/orders",
        )


class CustomerOrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [HasCustomerRole]

    def get_queryset(self):
        return (
            Order.objects
            .filter(customer=self.request.user)
            .prefetch_related("items")
            .select_related("provider")
        )


class CustomerCancelOrderView(APIView):
    permission_classes = [HasCustomerRole]

    @transaction.atomic
    def post(self, request, order_id):
        order = get_object_or_404(
            Order,
            id=order_id,
            customer=request.user,
        )

        if order.status not in {
            Order.Status.PENDING,
            Order.Status.CONFIRMED,
        }:
            return Response(
                {
                    "detail": (
                        "This order can no longer be cancelled."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = Order.Status.CANCELLED

        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        OrderStatusHistory.objects.create(
            order=order,
            status=order.status,
            changed_by=request.user,
        )

        # Notify provider.
        if order.provider:
            create_notification(
                recipient=order.provider.user,
                notification_type="order",
                title="Order cancelled",
                message=(
                    f"Order {order.order_number} "
                    f"was cancelled by the customer."
                ),
                action_url="/provider/orders",
            )

        # Notify administrators.
        notify_admins(
            notification_type="order",
            title="Order cancelled",
            message=(
                f"Order {order.order_number} "
                f"was cancelled by the customer."
            ),
            action_url="/admin/orders",
        )

        return Response(
            OrderSerializer(order).data
        )


class ProviderOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsApprovedProvider]

    def get_queryset(self):
        return (
            Order.objects
            .filter(
                provider=self.request.user.provider_profile
            )
            .prefetch_related("items")
            .select_related("customer")
            .order_by("created_at")
        )


class AdminOrderListView(generics.ListAPIView):
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAdmin]

    queryset = (
        Order.objects
        .prefetch_related("items")
        .select_related("customer", "provider")
        .order_by("-created_at")
    )


class ProviderOrderActionView(APIView):
    permission_classes = [IsApprovedProvider]

    @transaction.atomic
    def post(self, request, order_id, action):
        order = get_object_or_404(
            Order,
            id=order_id,
            provider=request.user.provider_profile,
        )

        transitions = {
            "accept": (
                Order.Status.PENDING,
                Order.Status.CONFIRMED,
            ),
            "reject": (
                Order.Status.PENDING,
                Order.Status.REJECTED,
            ),
            "status": (
                None,
                request.data.get("status"),
            ),
        }

        if action not in transitions:
            return Response(
                {
                    "detail": "Unknown order action."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        current, target = transitions[action]

        if current and order.status != current:
            return Response(
                {
                    "detail": (
                        f"Only {current} orders can be "
                        f"{action}ed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        allowed = {
            Order.Status.CONFIRMED: {
                Order.Status.PROCESSING,
                Order.Status.CANCELLED,
            },
            Order.Status.PROCESSING: {
                Order.Status.READY,
                Order.Status.IN_PROGRESS,
            },
            Order.Status.READY: {
                Order.Status.OUT_FOR_DELIVERY,
                Order.Status.COMPLETED,
            },
            Order.Status.OUT_FOR_DELIVERY: {
                Order.Status.DELIVERED,
            },
            Order.Status.DELIVERED: {
                Order.Status.COMPLETED,
            },
            Order.Status.IN_PROGRESS: {
                Order.Status.COMPLETED,
            },
        }

        if (
            action == "status"
            and target not in allowed.get(
                order.status,
                set(),
            )
        ):
            return Response(
                {
                    "detail": "Invalid status transition."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = target

        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        OrderStatusHistory.objects.create(
            order=order,
            status=order.status,
            changed_by=request.user,
        )

        provider_name = (
            order.provider.business_name
            if order.provider
            else "the provider"
        )

        # Provider accepted the order.
        if action == "accept":
            create_notification(
                recipient=order.customer,
                notification_type="order",
                title="Order accepted",
                message=(
                    f"Your order {order.order_number} "
                    f"has been accepted by "
                    f"{provider_name}."
                ),
                action_url="/customer/bookings",
            )

        # Provider rejected the order.
        elif action == "reject":
            create_notification(
                recipient=order.customer,
                notification_type="order",
                title="Order rejected",
                message=(
                    f"Your order {order.order_number} "
                    f"was rejected by "
                    f"{provider_name}."
                ),
                action_url="/customer/bookings",
            )

            notify_admins(
                notification_type="order",
                title="Order rejected",
                message=(
                    f"Order {order.order_number} "
                    f"was rejected by {provider_name}."
                ),
                action_url="/admin/orders",
            )

        # Provider changed the order status.
        elif action == "status":
            create_notification(
                recipient=order.customer,
                notification_type="order",
                title="Order status updated",
                message=(
                    f"Your order {order.order_number} "
                    f"is now "
                    f"{order.get_status_display()}."
                ),
                action_url="/customer/bookings",
            )

        return Response(
            OrderSerializer(order).data
        )


class CustomerReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [HasCustomerRole]

    @transaction.atomic
    def perform_create(self, serializer):
        order = get_object_or_404(
            Order,
            id=self.request.data.get("order"),
            customer=self.request.user,
        )

        if order.status != Order.Status.COMPLETED:
            raise serializers.ValidationError(
                "Only completed orders can be reviewed."
            )

        review = serializer.save(
            order=order,
            customer=self.request.user,
        )

        # Notify the provider about the new review.
        if order.provider:
            create_notification(
                recipient=order.provider.user,
                notification_type="restaurant",
                title="New customer review",
                message=(
                    f"A customer submitted a "
                    f"{review.rating}-star review "
                    f"for order {order.order_number}."
                ),
                action_url="/provider/restaurant",
            )

        # Notify administrators.
        notify_admins(
            notification_type="restaurant",
            title="New customer review",
            message=(
                f"A new {review.rating}-star review "
                f"was submitted for order "
                f"{order.order_number}."
            ),
            action_url="/admin/restaurants",
        )