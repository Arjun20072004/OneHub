from django.db import models
from django.conf import settings

# Create your models here.


class Provider(models.Model):
    VERIFICATION_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="provider",
    )

    business_name = models.CharField(max_length=255)
    business_address = models.TextField()
    city = models.CharField(max_length=100)
    experience = models.PositiveIntegerField()
    description = models.TextField(blank=True)

    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS_CHOICES,
        default="pending",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.business_name