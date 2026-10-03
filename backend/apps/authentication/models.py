from django.db import models


class EmailVerificationOTP(models.Model):
    email = models.EmailField(
        db_index=True,
    )

    otp_hash = models.CharField(
        max_length=128,
    )

    password_hash = models.CharField(
        max_length=128,
        null=True,
        blank=True,
    )

    registration_data = models.JSONField(
        default=dict,
    )

    expires_at = models.DateTimeField()

    attempts = models.PositiveIntegerField(
        default=0,
    )

    is_used = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["email", "is_used", "expires_at"],
                name="email_otp_lookup_idx",
            ),
        ]

    def __str__(self):
        return f"Email verification OTP - {self.email}"