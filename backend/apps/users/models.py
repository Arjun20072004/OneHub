from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Core identity model for the OneHub platform.

    Authentication data belongs here.
    Service-specific information belongs in profile models.
    """

    email = models.EmailField(
        unique=True,
        db_index=True,
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


class Role(models.Model):
    """
    Application-level roles used for authorization.
    """

    class RoleType(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        PROVIDER = "provider", "Provider"
        ADMIN = "admin", "Admin"
        SUPER_ADMIN = "super_admin", "Super Admin"

    name = models.CharField(
        max_length=30,
        choices=RoleType.choices,
        unique=True,
    )

    description = models.TextField(
        blank=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return self.get_name_display()


class UserRole(models.Model):
    """
    Associates a user with one or more application roles.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="user_roles",
    )

    role = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,
        related_name="user_roles",
    )

    assigned_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "role"],
                name="unique_user_role",
            )
        ]

    def __str__(self):
        return f"{self.user.email} - {self.role.name}"


class CustomerProfile(models.Model):
    """
    Additional information belonging to a customer.
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="customer_profile",
    )

    address = models.TextField(
        blank=True,
    )

    city = models.CharField(
        max_length=100,
        blank=True,
    )

    date_of_birth = models.DateField(
        null=True,
        blank=True,
    )

    preferences = models.JSONField(
        default=dict,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"Customer Profile - {self.user.email}"


class ProviderProfile(models.Model):
    """
    Business profile for users who provide services on OneHub.
    """

    class VerificationStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="provider_profile",
    )

    business_name = models.CharField(
        max_length=255,
    )

    business_address = models.TextField()

    city = models.CharField(
        max_length=100,
    )

    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
        db_index=True,
    )

    rejection_reason = models.TextField(
        blank=True,
        default="",
    )

    experience = models.PositiveIntegerField(
        default=0,
        help_text="Experience in years.",
    )

    description = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.business_name