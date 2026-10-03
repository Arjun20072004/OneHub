from django.conf import settings
from django.db import models


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        SYSTEM = "system", "System"
        USER = "user", "User"
        PROVIDER = "provider", "Provider"
        ORDER = "order", "Order"
        PAYMENT = "payment", "Payment"
        BOOKING = "booking", "Booking"
        RESTAURANT = "restaurant", "Restaurant"
        SECURITY = "security", "Security"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM,
        db_index=True,
    )

    title = models.CharField(
        max_length=255,
    )

    message = models.TextField()

    action_url = models.CharField(
        max_length=500,
        blank=True,
        default="",
    )

    is_read = models.BooleanField(
        default=False,
        db_index=True,
    )

    read_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["recipient", "is_read", "created_at"],
                name="notif_recipient_read_idx",
            ),
        ]

    def __str__(self):
        return f"{self.recipient.email} - {self.title}"