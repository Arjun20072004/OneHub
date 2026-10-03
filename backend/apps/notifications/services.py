from typing import Iterable

from django.contrib.auth import get_user_model
from django.db import transaction

from .models import Notification


User = get_user_model()


@transaction.atomic
def create_notification(
    *,
    recipient,
    title: str,
    message: str,
    notification_type: str = Notification.NotificationType.SYSTEM,
    action_url: str = "",
):
    return Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
        notification_type=notification_type,
        action_url=action_url,
    )


@transaction.atomic
def create_notifications(
    *,
    recipients: Iterable,
    title: str,
    message: str,
    notification_type: str = Notification.NotificationType.SYSTEM,
    action_url: str = "",
):
    notifications = [
        Notification(
            recipient=recipient,
            title=title,
            message=message,
            notification_type=notification_type,
            action_url=action_url,
        )
        for recipient in recipients
    ]

    return Notification.objects.bulk_create(notifications)


def get_admin_users():
    return User.objects.filter(
        user_roles__role__name__in=["admin", "super_admin"],
        user_roles__role__is_active=True,
        is_active=True,
    ).distinct()


def notify_admins(
    *,
    title: str,
    message: str,
    notification_type: str,
    action_url: str = "",
):
    return create_notifications(
        recipients=get_admin_users(),
        title=title,
        message=message,
        notification_type=notification_type,
        action_url=action_url,
    )